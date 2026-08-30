from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from typing import List
from urllib.parse import urlparse
from datetime import datetime
from bson import ObjectId
from database import projects_collection, tasks_collection, project_helper, task_helper, users_collection, create_notification, settings_collection, log_audit
from deps import get_current_hr_user, get_current_user
from models import ProjectCreate, ProjectUpdate, TaskCreate, TaskComment, TaskUpdateStatus

router = APIRouter()

@router.post("/", response_model=dict)
async def create_project(project: ProjectCreate, current_hr: dict = Depends(get_current_hr_user)):
    existing_project = await projects_collection.find_one({"name": project.name, "created_by": current_hr["id"]})
    if existing_project:
        raise HTTPException(status_code=400, detail="A project with this name already exists")
        
    project.assigned_to = list(set(project.assigned_to))
    if not project.assigned_to:
        raise HTTPException(status_code=400, detail="Project must have at least one member")
    
    if project.team_lead_id and project.team_lead_id not in project.assigned_to:
        raise HTTPException(status_code=400, detail="Team lead must be a project member")

    # Fetch dynamic settings from database
    settings = await settings_collection.find_one({"hr_id": current_hr["id"]})
    max_projects_lead = settings.get("max_projects_lead", 2) if settings else 2
    max_projects_member = settings.get("max_projects_member", 5) if settings else 5

    if project.team_lead_id:
        active_led_projects_count = await projects_collection.count_documents({
            "team_lead_id": project.team_lead_id,
            "status": {"$ne": "COMPLETED"}
        })
        if active_led_projects_count >= max_projects_lead:
            member = await users_collection.find_one({"_id": ObjectId(project.team_lead_id)})
            member_name = f"{member.get('first_name')} {member.get('last_name')}" if member else project.team_lead_id
            raise HTTPException(status_code=400, detail=f"Employee {member_name} is already leading {active_led_projects_count} active projects and cannot lead more than {max_projects_lead}.")

    for member_id in project.assigned_to:
        active_projects_count = await projects_collection.count_documents({
            "assigned_to": member_id, 
            "status": {"$ne": "COMPLETED"}
        })
        if active_projects_count >= max_projects_member:
            member = await users_collection.find_one({"_id": ObjectId(member_id)})
            member_name = f"{member.get('first_name')} {member.get('last_name')}" if member else member_id
            raise HTTPException(status_code=400, detail=f"Employee {member_name} already has {active_projects_count} active projects and cannot be assigned to more.")

    project_dict = jsonable_encoder(project)
    project_dict.update({
        "created_by": current_hr["id"],
        "progress": 0.0,
        "created_at": datetime.utcnow()
    })
    
    new_project = await projects_collection.insert_one(project_dict)
    created_project = await projects_collection.find_one({"_id": new_project.inserted_id})
    
    # Notify HR (Self)
    await create_notification(
        user_id=current_hr["id"],
        title="Project Created",
        message=f"Project '{project.name}' has been successfully created.",
        type="success"
    )

    # Notify Team Lead
    if project.team_lead_id:
        await create_notification(
            user_id=project.team_lead_id,
            title="Assigned as Team Lead",
            message=f"You have been assigned as the Team Lead for project '{project.name}'.",
            type="info",
            link=f"/dashboard/projectsDetail?id={str(new_project.inserted_id)}"
        )

    # Notify Assigned Members
    for member_id in project.assigned_to:
        if member_id != project.team_lead_id: # Avoid double notify for TL
            await create_notification(
                user_id=member_id,
                title="Assigned to Project",
                message=f"You have been assigned to project '{project.name}'.",
                type="info",
                link=f"/dashboard/projectsDetail?id={str(new_project.inserted_id)}"
            )

    return project_helper(created_project)

@router.get("/")
async def get_projects(current_user: dict = Depends(get_current_user), page: int = 1, limit: int = 20):
    skip = (page - 1) * limit
    match_stage = {}
    if current_user["role"] == "HR":
        match_stage = {"created_by": current_user["id"]}
    else:
        assigned_tasks = await tasks_collection.find({"assigned_to": current_user["id"]}).to_list(length=None)
        project_ids_from_tasks = [t["project_id"] for t in assigned_tasks]
        
        match_stage = {
            "$or": [
                {"assigned_to": current_user["id"]},
                {"team_lead_id": current_user["id"]},
                {"_id": {"$in": project_ids_from_tasks}}
            ]
        }
        
    pipeline = [
        {"$match": match_stage},
        {"$sort": {"created_at": -1}},
        {"$skip": skip},
        {"$limit": limit},
        {"$lookup": {
            "from": "tasks",
            "localField": "_id",
            "foreignField": "project_id",
            "as": "tasks"
        }},
        {"$addFields": {
            "progress": {
                "$cond": [
                    {"$gt": [{"$size": "$tasks"}, 0]},
                    {"$multiply": [
                        {"$divide": [
                            {"$size": {"$filter": {"input": "$tasks", "as": "task", "cond": {"$eq": ["$$task.status", "COMPLETED"]}}}},
                            {"$size": "$tasks"}
                        ]}, 
                        100
                    ]},
                    0
                ]
            }
        }}
    ]
    
    total = await projects_collection.count_documents(match_stage)
    cursor = projects_collection.aggregate(pipeline)
    
    projects = []
    now = datetime.utcnow()
    async for doc in cursor:
        p = project_helper(doc)
        p["tasks"] = [task_helper(t) for t in doc.get("tasks", [])]
        p["progress"] = doc.get("progress", 0.0)
        
        # Determine if overdue
        is_overdue = False
        if p.get("end_date") and p.get("status") != "COMPLETED":
            try:
                # end_date is string "YYYY-MM-DD" or datetime
                if isinstance(p["end_date"], str):
                    end_d = datetime.strptime(p["end_date"], "%Y-%m-%d")
                    if end_d < now:
                        is_overdue = True
                elif isinstance(p["end_date"], datetime):
                    if p["end_date"] < now:
                        is_overdue = True
            except:
                pass
        p["is_overdue"] = is_overdue
        
        projects.append(p)
        
    total_pages = (total + limit - 1) // limit if limit > 0 else 1
    return {"data": projects, "total": total, "page": page, "pages": total_pages}

@router.post("/tasks", response_model=dict)
async def create_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    project = await projects_collection.find_one({"_id": ObjectId(task.project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Check authorization: Only HR or the designated Team Lead can create tasks
    can_create = False
    if current_user["role"] == "HR":
        if project.get("created_by") == current_user["id"]:
            can_create = True
    elif current_user["id"] == project.get("team_lead_id"):
        # Match by ID instead of strict "EMPLOYEE" role string
        can_create = True
        
    if not can_create:
        raise HTTPException(status_code=403, detail="Only HR or the Project Team Lead can create tasks")

    # Validate assignees are in the project
    project_members = set(project.get("assigned_to", []))
    task.assigned_to = list(set(task.assigned_to)) if task.assigned_to else []
    
    MAX_ACTIVE_TASKS_PER_EMPLOYEE = 10
    for member_id in task.assigned_to:
        if member_id not in project_members:
            raise HTTPException(status_code=400, detail=f"User {member_id} is not a member of this project")
            
        active_tasks_count = await tasks_collection.count_documents({
            "assigned_to": member_id, 
            "status": {"$ne": "COMPLETED"}
        })
        if active_tasks_count >= MAX_ACTIVE_TASKS_PER_EMPLOYEE:
            member = await users_collection.find_one({"_id": ObjectId(member_id)})
            member_name = f"{member.get('first_name')} {member.get('last_name')}" if member else member_id
            raise HTTPException(status_code=400, detail=f"Employee {member_name} already has {active_tasks_count} active tasks and cannot be assigned to more.")

    task_dict = jsonable_encoder(task)
    # Store project_id as ObjectId for consistency
    task_dict["project_id"] = ObjectId(task.project_id)
    task_dict.update({
        "status": task_dict.get("status") or "TODO",
        "comments": [],
        "created_at": datetime.utcnow()
    })
    
    new_task = await tasks_collection.insert_one(task_dict)
    created_task = await tasks_collection.find_one({"_id": new_task.inserted_id})
    
    # Notify Assigned Members
    for member_id in task.assigned_to:
        await create_notification(
            user_id=member_id,
            title="New Task Assigned",
            message=f"You have been assigned to task: '{task.title}' in project '{project['name']}'.",
            type="info",
            link=f"/dashboard/projectsDetail?id={str(project['_id'])}"
        )

    # Notify Team Lead (if HR created it)
    if current_user["role"] == "HR" and project.get("team_lead_id"):
        await create_notification(
            user_id=project["team_lead_id"],
            title="New Task in Your Project",
            message=f"A new task '{task.title}' has been added to project '{project['name']}'.",
            type="info"
        )
        
    # Notify HR (Requirement: "team created for a task" - interpreted as task creation)
    if current_user["role"] != "HR":
        await create_notification(
            user_id=project["created_by"],
            title="Task Created",
            message=f"Team Lead {current_user['first_name']} created a new task: '{task.title}'.",
            type="info"
        )

    return task_helper(created_task)

@router.post("/tasks/{task_id}/comments")
async def add_task_comment(task_id: str, comment: TaskComment, current_user: dict = Depends(get_current_user)):
    task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if task.get("status") == "COMPLETED":
        raise HTTPException(status_code=400, detail="Cannot comment on completed tasks")
        
    project = await projects_collection.find_one({"_id": ObjectId(task["project_id"])})
    if not project:
         raise HTTPException(status_code=404, detail="Project not found")
         
    is_tl = project.get("team_lead_id") == current_user["id"]
    is_assignee = current_user["id"] in project.get("assigned_to", [])
    
    if current_user["role"] != "HR" and not is_assignee and not is_tl:
        raise HTTPException(status_code=403, detail="You are not assigned to this project")
        
    author_name = current_user.get("username") or f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip() or "System"
    new_comment = {
        "text": comment.text,
        "author": author_name,
        "author_id": current_user["id"],
        "timestamp": datetime.utcnow()
    }
    
    await tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$push": {"comments": new_comment}}
    )
    
    return {"message": "Comment added successfully"}

@router.put("/tasks/{task_id}/status")
async def update_task_status(task_id: str, status_update: TaskUpdateStatus, current_user: dict = Depends(get_current_user)):
    task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    project = await projects_collection.find_one({"_id": ObjectId(task["project_id"])})
    is_tl = project.get("team_lead_id") == current_user["id"]
    is_assignee = current_user["id"] in task.get("assigned_to", [])
    
    # Restrict status changes if user is not in project
    if current_user["role"] != "HR" and current_user["id"] not in project.get("assigned_to", []):
        raise HTTPException(status_code=403, detail="Not authorized. You are not a member of this project.")

    # Guard rollback and transition
    current_status = task.get("status", "TODO")
    new_status = status_update.status

    update_doc = {"status": new_status}
    if status_update.report_link:
        parsed = urlparse(status_update.report_link)
        if parsed.scheme not in ("http", "https"):
            raise HTTPException(status_code=400, detail="Invalid URL for report link")
        update_doc["report_link"] = status_update.report_link
        
        # Enforce REVIEW status workflow when a report is submitted
        update_doc["status"] = "REVIEW"
        new_status = "REVIEW"
        
    valid_transitions = {
        "TODO": ["IN_PROGRESS"],
        "IN_PROGRESS": ["REVIEW", "COMPLETED", "TODO"],
        "REVIEW": ["COMPLETED", "IN_PROGRESS"],
        "COMPLETED": [] # No transitions out of completed
    }
    
    if new_status != current_status:
        if current_status == "COMPLETED" and current_user.get("role") != "HR":
            raise HTTPException(status_code=400, detail="Cannot change status of a COMPLETED task")
            
        if current_status != "COMPLETED" and new_status not in valid_transitions.get(current_status, []):
            if new_status == "COMPLETED" and current_status == "TODO":
                raise HTTPException(status_code=400, detail="Task must be IN_PROGRESS before it can be COMPLETED")
    
    # Restrict COMPLETED status to HR or Project Team Lead
    if status_update.status == "COMPLETED":
        if current_user.get("role") == "HR":
            if current_user["id"] in task.get("assigned_to", []):
                 raise HTTPException(status_code=403, detail="Cannot approve tasks assigned to yourself")
        elif is_tl and not is_assignee:
            pass
        else:
            detail = "Only HR or the Project Team Lead can mark tasks as COMPLETED"
            if is_tl and is_assignee:
                detail = "Team Leads cannot approve their own tasks. Please wait for HR approval."
            raise HTTPException(status_code=403, detail=detail)

    update_doc = {"status": status_update.status}
    if status_update.report_link:
        update_doc["report_link"] = status_update.report_link

    await tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": update_doc}
    )
    
    if new_status != current_status:
        await log_audit(current_user["id"], "UPDATE_STATUS", "TASK", task_id, {"old": current_status, "new": new_status})

    if status_update.comment:
        author_name = current_user.get("username") or f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip() or "System"
        new_comment = {
            "text": status_update.comment,
            "author": author_name,
            "author_id": current_user["id"],
            "timestamp": datetime.utcnow()
        }
        await tasks_collection.update_one(
            {"_id": ObjectId(task_id)},
            {"$push": {"comments": new_comment}}
        )
    
    # Notifications for Status Changes
    if status_update.status == "COMPLETED":
        # Notify Team Lead and Assigned Employees
        recipients = set(task.get("assigned_to", []))
        if project.get("team_lead_id"):
            recipients.add(project["team_lead_id"])
        
        for uid in recipients:
            if uid != current_user["id"]: # Don't notify the person who approved it
                await create_notification(
                    user_id=uid,
                    title="Task Approved",
                    message=f"The task '{task['title']}' has been marked as COMPLETED.",
                    type="success"
                )
        
        # Notify HR if someone else approved it
        if current_user["role"] != "HR":
            await create_notification(
                user_id=project["created_by"],
                title="Report Approved",
                message=f"Team Lead {current_user['first_name']} approved the task '{task['title']}'.",
                type="info"
            )
            
    elif status_update.report_link:
        # Report received / Waiting for approval
        # Notify Team Lead
        if project.get("team_lead_id") and current_user["id"] != project["team_lead_id"]:
            await create_notification(
                user_id=project["team_lead_id"],
                title="Report Received",
                message=f"A report has been submitted for task '{task['title']}' and is waiting for approval.",
                type="info"
            )
            
        # Notify HR
        if project.get("created_by") and current_user["id"] != project["created_by"]:
             await create_notification(
                user_id=project["created_by"],
                title="Report Submitted",
                message=f"Task '{task['title']}' has a new report submitted by {current_user['first_name']}.",
                type="info"
            )
            
        # Notify Employee (Confirmation)
        await create_notification(
            user_id=current_user["id"],
            title="Report Sent",
            message=f"Your report for '{task['title']}' has been sent for approval.",
            type="info"
        )
    
    return {"message": "Task status updated"}

@router.get("/tasks/my")
async def get_my_tasks(current_user: dict = Depends(get_current_user)):
    # Returns all tasks assigned to the current employee
    cursor = tasks_collection.find({"assigned_to": current_user["id"]})
    tasks = []
    async for doc in cursor:
        tasks.append(task_helper(doc))
    return tasks

@router.get("/tasks/reports")
async def get_task_reports(current_user: dict = Depends(get_current_user)):
    # HR can see all reports; Team Leads can see reports for their projects
    if current_user["role"] == "HR":
        cursor = tasks_collection.find({"report_link": {"$exists": True, "$ne": None}})
    else:
        # Find projects where current user is Team Lead
        led_projects = await projects_collection.find({"team_lead_id": current_user["id"]}).to_list(length=None)
        led_project_ids = [p["_id"] for p in led_projects]
        
        cursor = tasks_collection.find({
            "project_id": {"$in": led_project_ids},
            "report_link": {"$exists": True, "$ne": None}
        })
        
    tasks = []
    async for doc in cursor:
        tasks.append(task_helper(doc))
    return tasks

@router.put("/{project_id}", response_model=dict)
async def update_project(project_id: str, project_update: ProjectUpdate, current_hr: dict = Depends(get_current_hr_user)):
    existing_project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    if not existing_project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if existing_project.get("created_by") != current_hr["id"]:
         raise HTTPException(status_code=403, detail="You can only update projects you created")
         
    update_data = {k: v for k, v in jsonable_encoder(project_update).items() if v is not None}

    # Fetch dynamic settings from database
    settings = await settings_collection.find_one({"hr_id": current_hr["id"]})
    max_projects_lead = settings.get("max_projects_lead", 2) if settings else 2
    max_projects_member = settings.get("max_projects_member", 5) if settings else 5
    
    # Validation: One person can be team lead in maximum dynamic active projects
    new_team_lead_id = update_data.get("team_lead_id")
    if new_team_lead_id and new_team_lead_id != existing_project.get("team_lead_id"):
        active_led_projects_count = await projects_collection.count_documents({
            "_id": {"$ne": ObjectId(project_id)},
            "team_lead_id": new_team_lead_id,
            "status": {"$ne": "COMPLETED"}
        })
        if active_led_projects_count >= max_projects_lead:
            member = await users_collection.find_one({"_id": ObjectId(new_team_lead_id)})
            member_name = f"{member.get('first_name')} {member.get('last_name')}" if member else new_team_lead_id
            raise HTTPException(status_code=400, detail=f"Employee {member_name} is already leading {active_led_projects_count} active projects and cannot lead more than {max_projects_lead}.")
    
    current_status = existing_project.get("status", "PLANNING")
    new_status = update_data.get("status")
    
    if new_status and new_status != current_status:
        if new_status == "COMPLETED":
            # Completion prerequisites: All tasks must be completed
            open_tasks = await tasks_collection.count_documents({
                "project_id": ObjectId(project_id),
                "status": {"$ne": "COMPLETED"}
            })
            if open_tasks > 0:
                raise HTTPException(status_code=400, detail=f"Cannot complete project because it has {open_tasks} uncompleted tasks")
                
        await log_audit(current_hr["id"], "UPDATE_STATUS", "PROJECT", project_id, {"old": current_status, "new": new_status})
    
    # Check if assigned_to is being updated and handle task reassignments for removed members
    if "assigned_to" in update_data:
        old_assigned = existing_project.get("assigned_to", [])
        new_assigned = update_data["assigned_to"]
        
        newly_added = set(new_assigned) - set(old_assigned)
        for member_id in newly_added:
            active_projects_count = await projects_collection.count_documents({
                "assigned_to": member_id, 
                "status": {"$ne": "COMPLETED"}
            })
            if active_projects_count >= max_projects_member:
                member = await users_collection.find_one({"_id": ObjectId(member_id)})
                member_name = f"{member.get('first_name')} {member.get('last_name')}" if member else member_id
                raise HTTPException(status_code=400, detail=f"Employee {member_name} already has {active_projects_count} active projects and cannot be assigned to more.")

        removed_members = set(old_assigned) - set(new_assigned)
        if removed_members:
            team_lead = update_data.get("team_lead_id") or existing_project.get("team_lead_id")
            async for task in tasks_collection.find({"project_id": ObjectId(project_id)}):
                task_assigned = task.get("assigned_to", [])
                new_task_assigned = [uid for uid in task_assigned if uid not in removed_members]
                
                # If they were the only assignee for the task, reassign to the project team lead
                if task_assigned and not new_task_assigned:
                    if team_lead:
                        new_task_assigned = [team_lead]
                    else:
                        new_task_assigned = []
                        
                if new_task_assigned != task_assigned:
                    await tasks_collection.update_one({"_id": task["_id"]}, {"$set": {"assigned_to": new_task_assigned}})
                    
    await projects_collection.update_one({"_id": ObjectId(project_id)}, {"$set": update_data})
    
    updated_project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    
    # Notify Team Lead and Members
    recipients = set(updated_project.get("assigned_to", []))
    if updated_project.get("team_lead_id"):
        recipients.add(updated_project["team_lead_id"])
        
    for uid in recipients:
        if uid != current_hr["id"]:
            await create_notification(
                user_id=uid,
                title="Project Updated",
                message=f"Project '{updated_project['name']}' has been updated by HR.",
                type="info",
                link=f"/dashboard/projectsDetail?id={project_id}"
            )

    return project_helper(updated_project)

@router.delete("/{project_id}")
async def delete_project(project_id: str, current_hr: dict = Depends(get_current_hr_user)):
    """
    Carefully dissolve a project and all its associated data.
    This includes:
    1. Permanently removing all tasks linked to the project.
    2. Deleting the project document itself.
    This effectively dissolves the 'teams' associated with the project by removing the assignment context.
    """
    # 1. Verify project exists
    project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # 2. Authorization check: Only the HR administrator who created the project can dissolve it
    if project.get("created_by") != current_hr["id"]:
        raise HTTPException(status_code=403, detail="Unauthorized: You can only delete projects created by you")
        
    # 3. Cascading delete for related tasks
    # Using delete_many to ensure data cleanliness
    await tasks_collection.delete_many({"project_id": ObjectId(project_id)})
    
    # 4. Delete the project itself
    result = await projects_collection.delete_one({"_id": ObjectId(project_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Database error: Failed to delete the project document")
        
    # Notify Team Lead and Members
    recipients = set(project.get("assigned_to", []))
    if project.get("team_lead_id"):
        recipients.add(project["team_lead_id"])
        
    for uid in recipients:
        await create_notification(
            user_id=uid,
            title="Project Deleted",
            message=f"The project '{project['name']}' has been dissolved.",
            type="error"
        )
        
    # Notify HR (Self)
    await create_notification(
        user_id=current_hr["id"],
        title="Project Dissolved",
        message=f"Project '{project['name']}' and all associated tasks have been deleted.",
        type="warning"
    )

    return {"message": "Project dissolved and relevant data purged successfully"}

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    project = await projects_collection.find_one({"_id": ObjectId(task["project_id"])})
    if not project:
         raise HTTPException(status_code=404, detail="Project not found")
         
    # Check authorization: Only HR or the designated Team Lead can delete tasks
    can_delete = False
    if current_user["role"] == "HR":
        if project.get("created_by") == current_user["id"]:
            can_delete = True
    elif current_user["id"] == project.get("team_lead_id"):
        can_delete = True
        
    if not can_delete:
        raise HTTPException(status_code=403, detail="Only HR or the Project Team Lead can delete tasks")
        
    result = await tasks_collection.delete_one({"_id": ObjectId(task_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Failed to delete the task")
        
    # Notify Assigned Members
    for member_id in task.get("assigned_to", []):
        await create_notification(
            user_id=member_id,
            title="Task Deleted",
            message=f"The task '{task['title']}' has been deleted.",
            type="warning"
        )
        
    return {"message": "Task deleted successfully"}
