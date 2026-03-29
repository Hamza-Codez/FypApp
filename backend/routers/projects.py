from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from database import projects_collection, tasks_collection, project_helper, task_helper, users_collection
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
    return project_helper(created_project)

@router.get("/")
async def get_projects(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "HR":
        cursor = projects_collection.find({"created_by": current_user["id"]})
    else:
        cursor = projects_collection.find({"assigned_to": current_user["id"]})
        
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
        
    # Check authorization
    can_create = False
    if current_user["role"] == "HR" and project.get("created_by") == current_user["id"]:
        can_create = True
    elif current_user["role"] == "EMPLOYEE" and current_user["id"] in project.get("assigned_to", []):
        can_create = True
        
    if not can_create:
        raise HTTPException(status_code=403, detail="You do not have permission to add tasks to this project")

    task_dict = task.dict()
    # Store project_id as ObjectId for consistency
    task_dict["project_id"] = ObjectId(task.project_id)
    task_dict.update({
        "status": "PENDING",
        "comments": [],
        "created_at": datetime.utcnow()
    })
    
    new_task = await tasks_collection.insert_one(task_dict)
    created_task = await tasks_collection.find_one({"_id": new_task.inserted_id})
    return task_helper(created_task)

@router.post("/tasks/{task_id}/comments")
async def add_task_comment(task_id: str, comment: TaskComment, current_user: dict = Depends(get_current_user)):
    task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    project = await projects_collection.find_one({"_id": ObjectId(task["project_id"])})
    if not project:
         raise HTTPException(status_code=404, detail="Project not found")
         
    if current_user["role"] == "EMPLOYEE" and current_user["id"] not in project.get("assigned_to", []):
        raise HTTPException(status_code=403, detail="You are not assigned to this project")
        
    new_comment = {
        "text": comment.text,
        "author": current_user["username"],
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

    await tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"status": status_update.status}}
    )
    
    return {"message": "Task status updated"}

@router.put("/{project_id}", response_model=dict)
async def update_project(project_id: str, project_update: ProjectUpdate, current_hr: dict = Depends(get_current_hr_user)):
    existing_project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    if not existing_project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if existing_project.get("created_by") != current_hr["id"]:
         raise HTTPException(status_code=403, detail="You can only update projects you created")
         
    update_data = {k: v for k, v in project_update.dict().items() if v is not None}
    await projects_collection.update_one({"_id": ObjectId(project_id)}, {"$set": update_data})
    
    updated_project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    return project_helper(updated_project)
