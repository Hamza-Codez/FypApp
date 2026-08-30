from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import io
import re
import random
import string
from datetime import date
from bson import ObjectId
from database import users_collection, projects_collection, tasks_collection, user_helper, create_notification, settings_collection, log_audit
from utils import get_password_hash, verify_password
from deps import get_current_hr_user, get_current_user
from models import EmployeeCreate, User, EmployeeCreateResponse, CSVImportResponse, CSVImportResult, UserStatus, WorkloadSettings, UserUpdate, PasswordChange

router = APIRouter()

def generate_random_password(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

@router.post("/employee", response_model=EmployeeCreateResponse)
async def create_employee(
    employee: EmployeeCreate,
    hr_user: dict = Depends(get_current_hr_user)
):
    existing_email = await users_collection.find_one({"email": employee.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    username_to_check = employee.username or employee.email
    existing_username = await users_collection.find_one({"username": username_to_check})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    raw_password = employee.password or generate_random_password()
    hashed_password = get_password_hash(raw_password)

    user_dict = employee.dict(exclude={"password", "role", "username"})
    if not user_dict.get("onboard_date"):
        user_dict["onboard_date"] = date.today().isoformat()
    user_dict.update({
        "password": hashed_password,
        "username": username_to_check,
        "role": "EMPLOYEE",
        "created_by": hr_user["id"],
        "organization_name": hr_user.get("organization_name"),
        "must_change_password": True
    })

    new_user = await users_collection.insert_one(user_dict)
    
    created_user = await users_collection.find_one({"_id": new_user.inserted_id})
    
    await create_notification(
        user_id=hr_user["id"],
        title="New User Added",
        message=f"Employee {employee.first_name} {employee.last_name} has been added to the workspace.",
        type="success"
    )

    return {
        "user": user_helper(created_user),
        "password": raw_password
    }

@router.post("/employee/csv")
async def create_employees_from_csv(
    file: UploadFile = File(...),
    hr_user: dict = Depends(get_current_hr_user)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be CSV")

    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    
    # Normalize headers
    df.columns = [c.strip().lower().replace(' ', '_').replace('-', '_') for c in df.columns]
    
    # Header Mapping/Aliases
    column_mapping = {
        'first_name': ['first_name', 'first_name', 'first_name', 'name', 'first', 'team_asset', 'team_assets'],
        'last_name': ['last_name', 'last_name', 'last_name', 'surname', 'last'],
        'email': ['email', 'email_address', 'mail', 'credentials', 'credential'],
        'role': ['role', 'position', 'designation', 'job_title', 'job', 'job title', 'post'],
        'onboard_date': ['onboard_date', 'onboarding_date', 'joined_date', 'join_date', 'date']
    }

    def get_column(mapped_name, dataframe):
        for alias in column_mapping.get(mapped_name, []):
            if alias in dataframe.columns:
                return alias
        return None

    # Resolve mappings
    actual_mapping = {}
    for key in ['first_name', 'last_name', 'email', 'role', 'onboard_date']:
        col = get_column(key, df)
        if col:
            actual_mapping[key] = col

    # Validation: We must have an email (credentials) column and at least a first_name (team asset) column
    if 'email' not in actual_mapping:
        raise HTTPException(status_code=400, detail=f"CSV missing required email/credentials column. Aliases checked: {column_mapping['email']}")
    if 'first_name' not in actual_mapping:
        raise HTTPException(status_code=400, detail=f"CSV missing required name/team asset column. Aliases checked: {column_mapping['first_name']}")

    added_count = 0
    errors = []
    results = []

    for index, row in df.iterrows():
        try:
            email_col = actual_mapping['email']
            email = str(row[email_col]).strip()
            if not re.match(r"^[\w.-]+@[\w.-]+\.\w+$", email):
                results.append(CSVImportResult(email=email, password="", status="SKIP", error="Invalid email format"))
                errors.append(f"Row {index}: Invalid email format for {email}.")
                continue
            
            existing_user = await users_collection.find_one({"email": email})
            if existing_user:
                results.append(CSVImportResult(email=email, password="", status="SKIP", error="Email exists"))
                errors.append(f"Row {index}: Email {email} already exists.")
                continue

            raw_password = generate_random_password()
            hashed_password = get_password_hash(raw_password)

            first_name_col = actual_mapping['first_name']
            full_name = str(row[first_name_col]).strip()
            
            if 'last_name' in actual_mapping:
                first_name = full_name
                last_name = str(row[actual_mapping['last_name']]).strip()
            else:
                parts = full_name.split(maxsplit=1)
                first_name = parts[0]
                last_name = parts[1] if len(parts) > 1 else ""

            csv_role = str(row.get(actual_mapping.get('role', ''), 'EMPLOYEE')).strip()
            system_role = "EMPLOYEE"
            designation = None
            
            if csv_role.upper() in ["HR", "EMPLOYEE"]:
                system_role = csv_role.upper()
            else:
                designation = csv_role
            
            csv_onboard_date = None
            if 'onboard_date' in actual_mapping:
                onboard_col = actual_mapping['onboard_date']
                csv_onboard_date = str(row[onboard_col]).strip()
            
            if not csv_onboard_date or csv_onboard_date == 'nan':
                csv_onboard_date = date.today().isoformat()

            user_dict = {
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "username": email, # default to email
                "role": system_role,
                "designation": designation,
                "password": hashed_password,
                "created_by": hr_user["id"],
                "organization_name": hr_user.get("organization_name"),
                "must_change_password": True,
                "onboard_date": csv_onboard_date
            }

            await users_collection.insert_one(user_dict)
            results.append(CSVImportResult(email=email, password=raw_password, status="SUCCESS"))
            added_count += 1
            
            await create_notification(
                user_id=hr_user["id"],
                title="New User Added (CSV)",
                message=f"Employee {user_dict['first_name']} {user_dict['last_name']} added via CSV.",
                type="success"
            )
        except Exception as e:
            results.append(CSVImportResult(email=row.get(actual_mapping.get('email', 'unknown'), 'unknown'), password="", status="ERROR", error=str(e)))
            errors.append(f"Row {index}: {str(e)}")

    return CSVImportResponse(message="CSV processed", added_count=added_count, results=results, errors=errors)

@router.get("/employees", response_model=List[User])
async def get_employees(current_user: dict = Depends(get_current_user)):
    # HR gets employees they created, employee gets colleagues in same org
    if current_user["role"] == "HR":
        cursor = users_collection.find({"created_by": current_user["id"]})
    else:
        cursor = users_collection.find({
            "organization_name": current_user.get("organization_name")
        })

        
    employees = []
    async for document in cursor:
        employees.append(user_helper(document))
        
    return employees

@router.put("/me")
async def update_profile(
    user_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    update_dict = {k: v for k, v in user_data.dict().items() if v is not None}
    if not update_dict:
        return current_user
        
    await users_collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": update_dict}
    )
    
    updated_user = await users_collection.find_one({"_id": ObjectId(current_user["id"])})
    return user_helper(updated_user)

@router.put("/me/password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user)
):
    user = await users_collection.find_one({"_id": ObjectId(current_user["id"])})
    if not verify_password(password_data.old_password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect old password")
        
    hashed_password = get_password_hash(password_data.new_password)
    await users_collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"password": hashed_password, "must_change_password": False}}
    )
    
    updated_user = await users_collection.find_one({"_id": ObjectId(current_user["id"])})
    return user_helper(updated_user)

@router.delete("/employee/{employee_id}")
async def delete_employee(
    employee_id: str,
    replacement_id: Optional[str] = None,
    hr_user: dict = Depends(get_current_hr_user)
):
    # 0. Check ownership FIRST
    employee = await users_collection.find_one({"_id": ObjectId(employee_id), "created_by": hr_user["id"]})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found or not authorized")
        
    if replacement_id:
        replacement = await users_collection.find_one({"_id": ObjectId(replacement_id), "created_by": hr_user["id"]})
        if not replacement:
            raise HTTPException(status_code=400, detail="Replacement employee not found or not authorized")
    
    # 1. Clean up project assignments and team leads
    async for project in projects_collection.find({"assigned_to": employee_id}):
        new_assigned = [uid for uid in project.get("assigned_to", []) if uid != employee_id]
        if replacement_id and replacement_id not in new_assigned:
            new_assigned.append(replacement_id)
            
        update_fields = {"assigned_to": new_assigned}
        if project.get("team_lead_id") == employee_id:
            update_fields["team_lead_id"] = replacement_id if replacement_id else ""
        await projects_collection.update_one({"_id": project["_id"]}, {"$set": update_fields})
        
    # 2. Clean up task assignments
    async for task in tasks_collection.find({"assigned_to": employee_id}):
        task_assigned = task.get("assigned_to", [])
        new_task_assigned = [uid for uid in task_assigned if uid != employee_id]
        if replacement_id and replacement_id not in new_task_assigned:
            new_task_assigned.append(replacement_id)
        
        # If task has no assignees left, we assign to the project's team lead
        if task_assigned and not new_task_assigned:
            project = await projects_collection.find_one({"_id": task["project_id"]})
            if project and project.get("team_lead_id") and project.get("team_lead_id") != employee_id:
                new_task_assigned = [project["team_lead_id"]]
            else:
                new_task_assigned = []
                
        await tasks_collection.update_one({"_id": task["_id"]}, {"$set": {"assigned_to": new_task_assigned}})
        
    # 3. Ensure HR can only delete employees they created
    result = await users_collection.delete_one({
        "_id": ObjectId(employee_id),
        "created_by": hr_user["id"]
    })
        
    await create_notification(
        user_id=hr_user["id"],
        title="Employee Removed",
        message=f"Employee account (ID: {employee_id}) has been removed.",
        type="warning"
    )
    
    return {"message": "Employee deleted successfully"}

class UserStatusUpdate(BaseModel):
    status: UserStatus

@router.put("/employee/{employee_id}/status")
async def update_employee_status(
    employee_id: str,
    status_data: UserStatusUpdate,
    hr_user: dict = Depends(get_current_hr_user)
):
    employee = await users_collection.find_one({"_id": ObjectId(employee_id), "created_by": hr_user["id"]})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    await users_collection.update_one(
        {"_id": ObjectId(employee_id)},
        {"$set": {"status": status_data.status.value}}
    )
    
    await log_audit(hr_user["id"], "UPDATE_STATUS", "USER", employee_id, {"new": status_data.status.value})
    
    return {"message": f"Employee status updated to {status_data.status.value}"}

@router.delete("/employees/all")
async def delete_all_employees(
    hr_user: dict = Depends(get_current_hr_user)
):
    # Delete all employees created by this HR
    result = await users_collection.delete_many({
        "created_by": hr_user["id"],
        "role": {"$ne": "HR"} # Safety check to not delete themselves
    })
    
    return {"message": f"Deleted {result.deleted_count} employees"}

@router.delete("/me")
async def delete_me(current_user: dict = Depends(get_current_user)):
    # If HR, delete all associated data
    if current_user["role"] == "HR":
        # Delete projects and their tasks
        hr_projects = await projects_collection.find({"created_by": current_user["id"]}).to_list(length=None)
        project_ids = [p["_id"] for p in hr_projects]
        
        await tasks_collection.delete_many({"project_id": {"$in": project_ids}})
        await projects_collection.delete_many({"created_by": current_user["id"]})
        
        # Delete associated employees
        await users_collection.delete_many({"created_by": current_user["id"]})
        
    if current_user["role"] == "HR":
        await create_notification(
            user_id=current_user["id"],
            title="Workspace Deleted",
            message="Your workspace and all associated data have been scheduled for deletion.",
            type="error"
        )

    await users_collection.delete_one({"_id": ObjectId(current_user["id"])})
    
    return {"message": "Workspace deleted successfully"}

@router.get("/workload-settings", response_model=WorkloadSettings)
async def get_workload_settings(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "HR":
        hr_id = current_user["id"]
    else:
        hr_id = current_user.get("created_by")
        if not hr_id:
            return WorkloadSettings(max_projects_lead=2, max_projects_member=5)
            
    doc = await settings_collection.find_one({"hr_id": hr_id})
    if not doc:
        return WorkloadSettings(max_projects_lead=2, max_projects_member=5)
        
    return WorkloadSettings(
        max_projects_lead=doc.get("max_projects_lead", 2),
        max_projects_member=doc.get("max_projects_member", 5)
    )

@router.put("/workload-settings", response_model=WorkloadSettings)
async def update_workload_settings(
    settings: WorkloadSettings,
    current_hr: dict = Depends(get_current_hr_user)
):
    hr_id = current_hr["id"]
    await settings_collection.update_one(
        {"hr_id": hr_id},
        {"$set": {
            "hr_id": hr_id,
            "max_projects_lead": settings.max_projects_lead,
            "max_projects_member": settings.max_projects_member
        }},
        upsert=True
    )
    
    await create_notification(
        user_id=hr_id,
        title="Workload Limits Updated",
        message=f"Workload threshold set to: Lead={settings.max_projects_lead}, Member={settings.max_projects_member}.",
        type="success"
    )
    
    return settings
