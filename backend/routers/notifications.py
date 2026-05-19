from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from database import notifications_collection, notification_helper, tasks_collection, create_notification, projects_collection
from deps import get_current_user
from models import Notification, NotificationUpdate
from bson import ObjectId
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/", response_model=dict)
async def get_notifications(current_user: dict = Depends(get_current_user), limit: int = 5):
    """
    Fetch notifications for the current user.
    Includes on-the-fly deadline checks.
    """
    # --- On-the-fly Deadline Check ---
    # Find active tasks assigned to user
    user_tasks = await tasks_collection.find({
        "assigned_to": current_user["id"],
        "status": {"$ne": "COMPLETED"},
        "due_date": {"$ne": None}
    }).to_list(length=None)

    now = datetime.utcnow()
    for task in user_tasks:
        try:
            # Parse due_date (assuming it's stored as ISO string or datetime)
            due_date = task["due_date"]
            if isinstance(due_date, str):
                due_date = datetime.fromisoformat(due_date.replace('Z', ''))
            
            diff = due_date - now
            
            # Approaching (within 1 day)
            if timedelta(0) < diff <= timedelta(days=1):
                # Check if already notified in last 24h
                existing = await notifications_collection.find_one({
                    "user_id": current_user["id"],
                    "title": "Deadline Approaching",
                    "message": {"$regex": task["title"]},
                    "created_at": {"$gt": now - timedelta(days=1)}
                })
                if not existing:
                    await create_notification(
                        user_id=current_user["id"],
                        title="Deadline Approaching",
                        message=f"Task '{task['title']}' is due within 24 hours!",
                        type="warning",
                        link=f"/dashboard/projectsDetail?id={str(task['project_id'])}"
                    )

            # Overdue (more than 1 day)
            elif diff < timedelta(days=-1):
                 # Check if already notified in last 24h
                existing = await notifications_collection.find_one({
                    "user_id": current_user["id"],
                    "title": "Deadline Passed",
                    "message": {"$regex": task["title"]},
                    "created_at": {"$gt": now - timedelta(days=1)}
                })
                if not existing:
                    await create_notification(
                        user_id=current_user["id"],
                        title="Deadline Passed",
                        message=f"Task '{task['title']}' is overdue by more than a day.",
                        type="error",
                        link=f"/dashboard/projectsDetail?id={str(task['project_id'])}"
                    )
        except Exception:
            continue # Skip tasks with invalid dates

    # --- Fetch Notifications ---
    cursor = notifications_collection.find({"user_id": current_user["id"]}).sort("created_at", -1)
    
    # We want to return all unread count, but maybe only limit the list
    all_notifications = await cursor.to_list(length=None)
    
    unread_count = sum(1 for n in all_notifications if not n.get("is_read", False))
    
    # Return limited list for dropdown
    recent_notifications = [notification_helper(n) for n in all_notifications[:limit]]
    
    return {
        "notifications": recent_notifications,
        "unread_count": unread_count,
        "total_count": len(all_notifications)
    }

@router.patch("/{notification_id}/read")
async def mark_as_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    result = await notifications_collection.update_one(
        {"_id": ObjectId(notification_id), "user_id": current_user["id"]},
        {"$set": {"is_read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@router.post("/read-all")
async def mark_all_as_read(current_user: dict = Depends(get_current_user)):
    await notifications_collection.update_many(
        {"user_id": current_user["id"], "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"message": "All notifications marked as read"}
