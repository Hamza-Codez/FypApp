from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List
import pandas as pd
import io
import random
import string
from database import users_collection, user_helper
from utils import get_password_hash, send_welcome_email
from deps import get_current_hr_user, get_current_user
from models import EmployeeCreate, User

router = APIRouter()

def generate_random_password(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

@router.post("/employee", response_model=User)
async def create_employee(
    employee: EmployeeCreate,
    hr_user: dict = Depends(get_current_hr_user)
):
    existing_user = await users_collection.find_one({"$or": [{"email": employee.email}, {"username": employee.username}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email or username already registered")

    raw_password = employee.password or generate_random_password()
    hashed_password = get_password_hash(raw_password)

    user_dict = employee.dict(exclude={"password"})
    user_dict.update({
        "password": hashed_password,
        "role": "EMPLOYEE",
        "created_by": hr_user["id"],
        "organization_name": hr_user.get("organization_name")
    })

    new_user = await users_collection.insert_one(user_dict)
    
    # Send email with password
    await send_welcome_email(employee.email, raw_password, employee.first_name, "EMPLOYEE")

    created_user = await users_collection.find_one({"_id": new_user.inserted_id})
    return user_helper(created_user)

@router.post("/employee/csv")
async def create_employees_from_csv(
    file: UploadFile = File(...),
    hr_user: dict = Depends(get_current_hr_user)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be CSV")

    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    
    # Expected columns: first_name, last_name, email, username, contact_info, gender, age
    required_cols = {'first_name', 'last_name', 'email', 'username'}
    if not required_cols.issubset(df.columns):
        raise HTTPException(status_code=400, detail=f"CSV missing required columns: {required_cols}")

    added_count = 0
    errors = []

    for index, row in df.iterrows():
        try:
            email = str(row['email']).strip()
            username = str(row['username']).strip()
            
            existing_user = await users_collection.find_one({"$or": [{"email": email}, {"username": username}]})
            if existing_user:
                errors.append(f"Row {index}: Email {email} or username {username} already exists.")
                continue

            raw_password = generate_random_password()
            hashed_password = get_password_hash(raw_password)

            user_dict = {
                "first_name": str(row.get('first_name', '')),
                "last_name": str(row.get('last_name', '')),
                "email": email,
                "username": username,
                "contact_info": str(row.get('contact_info', '')),
                "gender": str(row.get('gender', '')),
                "age": int(row.get('age', 0)) if pd.notna(row.get('age')) else None,
                "password": hashed_password,
                "role": "EMPLOYEE",
                "created_by": hr_user["id"],
                "organization_name": hr_user.get("organization_name")
            }

            await users_collection.insert_one(user_dict)
            await send_welcome_email(email, raw_password, user_dict["first_name"], "EMPLOYEE")
            added_count += 1
        except Exception as e:
            errors.append(f"Row {index}: {str(e)}")

    return {"message": "CSV processed", "added_count": added_count, "errors": errors}

@router.get("/employees", response_model=List[User])
async def get_employees(current_user: dict = Depends(get_current_user)):
    # HR gets employees they created, employee gets colleagues in same org
    if current_user["role"] == "HR":
        cursor = users_collection.find({"created_by": current_user["id"]})
    else:
        cursor = users_collection.find({"organization_name": current_user.get("organization_name"), "role": "EMPLOYEE"})
        
    employees = []
    async for document in cursor:
        employees.append(user_helper(document))
        
    return employees

from models import EmployeeCreate, User, UserUpdate, PasswordChange
from bson import ObjectId

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
    from utils import verify_password, get_password_hash
    
    if not verify_password(password_data.old_password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect old password")
        
    hashed_password = get_password_hash(password_data.new_password)
    await users_collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"password": hashed_password}}
    )
    
    return {"message": "Password updated successfully"}

@router.delete("/me")
async def delete_me(current_user: dict = Depends(get_current_user)):
    from database import projects_collection, tasks_collection
    
    # If HR, delete all associated data
    if current_user["role"] == "HR":
        # Delete projects and their tasks
        hr_projects = await projects_collection.find({"created_by": current_user["id"]}).to_list(length=None)
        project_ids = [p["_id"] for p in hr_projects]
        
        await tasks_collection.delete_many({"project_id": {"$in": project_ids}})
        await projects_collection.delete_many({"created_by": current_user["id"]})
        
        # Delete associated employees
        await users_collection.delete_many({"created_by": current_user["id"]})
        
    # Delete the user themselves
    from bson import ObjectId
    await users_collection.delete_one({"_id": ObjectId(current_user["id"])})
    
    return {"message": "Workspace deleted successfully"}
