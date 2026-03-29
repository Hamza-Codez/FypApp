import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(".env.local")

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "office_management")

client = AsyncIOMotorClient(MONGODB_URL)
database = client[DATABASE_NAME]

# Collections
users_collection = database.get_collection("users")
projects_collection = database.get_collection("projects")
tasks_collection = database.get_collection("tasks")

# Helper map to transform MongoDB _id to string
def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "first_name": user.get("first_name"),
        "last_name": user.get("last_name"),
        "gender": user.get("gender"),
        "age": user.get("age"),
        "organization_name": user.get("organization_name"),
        "contact_info": user.get("contact_info"),
        "email": user.get("email"),
        "username": user.get("username"),
        "org_architecture": user.get("org_architecture"),
        "org_headcounts": user.get("org_headcounts"),
        "cultural_practices": user.get("cultural_practices"),
        "profile_image": user.get("profile_image"),
        "org_logo": user.get("org_logo"),
        "role": user.get("role"),
        "created_by": user.get("created_by")
    }

def project_helper(project) -> dict:
    return {
        "id": str(project["_id"]),
        "name": project.get("name"),
        "description": project.get("description"),
        "created_by": project.get("created_by"),
        "assigned_to": project.get("assigned_to", []),
        "status": project.get("status", "PLANNING"),
        "priority": project.get("priority", "MEDIUM"),
        "start_date": project.get("start_date"),
        "end_date": project.get("end_date"),
        "progress": project.get("progress", 0)
    }

def task_helper(task) -> dict:
    return {
        "id": str(task["_id"]),
        "project_id": str(task["project_id"]),
        "title": task.get("title"),
        "description": task.get("description"),
        "assigned_to": task.get("assigned_to"),
        "status": task.get("status"),
        "comments": task.get("comments", [])
    }
