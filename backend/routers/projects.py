from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from database import projects_collection, tasks_collection, project_helper, task_helper, users_collection, create_notification
from deps import get_current_hr_user, get_current_user
from models import ProjectCreate, ProjectUpdate, TaskCreate, TaskComment, TaskUpdateStatus
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=dict)
async def create_project(project: ProjectCreate, current_hr: dict = Depends(get_current_hr_user)):
    project_dict = project.dict()
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
async def get_projects(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "HR":
        cursor = projects_collection.find({"created_by": current_user["id"]})
    else:
        # Projects explicitly assigned to them OR projects where they have a task
        assigned_tasks = await tasks_collection.find({"assigned_to": current_user["id"]}).to_list(length=None)
        project_ids_from_tasks = [t["project_id"] for t in assigned_tasks]
        
        cursor = projects_collection.find({
            "$or": [
                {"assigned_to": current_user["id"]},
                {"team_lead_id": current_user["id"]},
                {"_id": {"$in": project_ids_from_tasks}}
            ]
        })
        
    projects = []
    async for doc in cursor:
        p = project_helper(doc)
        
        # Calculate progress from tasks (project_id stored as ObjectId)
        tasks = []
        async for task_doc in tasks_collection.find({"project_id": doc["_id"]}):
            tasks.append(task_helper(task_doc))
            
        p["tasks"] = tasks
        
        completed_tasks = sum(1 for t in tasks if t["status"] == "COMPLETED")
        p["progress"] = (completed_tasks / len(tasks) * 100) if tasks else 0.0
            
        projects.append(p)
        
    return projects

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

    task_dict = task.dict()
    # Store project_id as ObjectId for consistency
    task_dict["project_id"] = ObjectId(task.project_id)
    task_dict.update({
        "status": task.status or "TODO",
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

    # Restrict COMPLETED status to HR or Project Team Lead
    project = await projects_collection.find_one({"_id": ObjectId(task["project_id"])})
    is_tl = project.get("team_lead_id") == current_user["id"]
    is_assignee = current_user["id"] in task.get("assigned_to", [])
    
    if status_update.status == "COMPLETED":
        if current_user.get("role") == "HR":
            pass
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
         
    update_data = {k: v for k, v in project_update.dict().items() if v is not None}
    
    # Check if assigned_to is being updated and handle task reassignments for removed members
    if "assigned_to" in update_data:
        old_assigned = existing_project.get("assigned_to", [])
        new_assigned = update_data["assigned_to"]
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
            can_create = True # use local variable mapping
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
