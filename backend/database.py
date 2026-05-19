import os
from dotenv import load_dotenv
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

load_dotenv(".env.local")

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "office_management")

# Create connection pointing explicitly to the certifi bundle for root CA chain
client = AsyncIOMotorClient(
    MONGODB_URL, 
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=10000,
    connectTimeoutMS=10000,
    retryWrites=True,
)
database = client[DATABASE_NAME]

# Collections
users_collection = database.get_collection("users")
projects_collection = database.get_collection("projects")
tasks_collection = database.get_collection("tasks")
ai_analysis_collection = database.get_collection("ai_analysis")
notifications_collection = database.get_collection("notifications")


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
        "created_by": user.get("created_by"),
        "must_change_password": user.get("must_change_password", False),
    }

def project_helper(project) -> dict:
    return {
        "id": str(project["_id"]),
        "name": project.get("name"),
        "description": project.get("description"),
        "created_by": project.get("created_by"),
        "assigned_to": project.get("assigned_to", []),
        "team_lead_id": project.get("team_lead_id"),
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
        "assigned_to": task.get("assigned_to", []),
        "status": task.get("status", "TODO"),
        "type": task.get("type", "TASK"),
        "priority": task.get("priority", "MEDIUM"),
        "due_date": task.get("due_date"),
        "comments": task.get("comments", []),
        "report_link": task.get("report_link"),
        "created_at": task.get("created_at")
    }

def notification_helper(notification) -> dict:
    return {
        "id": str(notification["_id"]),
        "user_id": str(notification["user_id"]),
        "title": notification.get("title"),
        "message": notification.get("message"),
        "type": notification.get("type", "info"),
        "is_read": notification.get("is_read", False),
        "created_at": notification.get("created_at"),
        "link": notification.get("link")
    }

async def create_notification(user_id: str, title: str, message: str, type: str = "info", link: str = None):
    notification = {
        "user_id": str(user_id),
        "title": title,
        "message": message,
        "type": type,
        "is_read": False,
        "created_at": datetime.utcnow(),
        "link": link
    }
    # 1. Insert new notification
    await notifications_collection.insert_one(notification)
    
    # 2. Enforce limit (Keep only latest 5)
    # Find all notifications for this user sorted by date descending
    cursor = notifications_collection.find({"user_id": str(user_id)}).sort("created_at", -1)
    user_notifications = await cursor.to_list(length=None)
    
    if len(user_notifications) > 5:
        # Identify IDs to delete (everything after the first 5)
        ids_to_delete = [n["_id"] for n in user_notifications[5:]]
        await notifications_collection.delete_many({"_id": {"$in": ids_to_delete}})

# --- Database Indexing for Optimization ---
async def init_db():
    """ Initialize indexes to ensure high performance """
    # Notifications: Index by user_id for fast fetching
    await notifications_collection.create_index([("user_id", 1), ("created_at", -1)])
    
    # Tasks: Index by assigned_to and status for fast deadline checks
    await tasks_collection.create_index([("assigned_to", 1), ("status", 1)])
    
    # Users: Index by email for fast auth
    await users_collection.create_index("email", unique=True)
    
    print("Database indexes initialized successfully.")
