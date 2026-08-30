from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from datetime import date, timedelta
from database import users_collection, user_helper
from utils import verify_password, get_password_hash, create_access_token
from deps import get_current_user
from models import Token, User

router = APIRouter()

@router.post("/signup/hr")
async def register_hr(
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    username: str = Form(...),
    gender: str = Form(None),
    age: int = Form(None),
    organization_name: str = Form(None),
    contact_info: str = Form(None),
    org_architecture: str = Form(None),
    org_headcounts: str = Form(None),
    cultural_practices: str = Form(None),
    password: str = Form(...),
    confirm_password: str = Form(...),
    profile_image: UploadFile = File(None),
    org_logo: UploadFile = File(None)
):
    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    existing_user = await users_collection.find_one({"$or": [{"email": email}, {"username": username}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email or username already registered")

    profile_image_url = None
    org_logo_url = None

    hashed_password = get_password_hash(password)

    user_dict = {
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "username": username,
        "gender": gender,
        "age": age,
        "organization_name": organization_name,
        "contact_info": contact_info,
        "org_architecture": org_architecture,
        "org_headcounts": org_headcounts,
        "cultural_practices": cultural_practices,
        "password": hashed_password,
        "role": "HR",
        "profile_image": profile_image_url,
        "org_logo": org_logo_url,
        "onboard_date": date.today().isoformat()
    }
    
    new_user = await users_collection.insert_one(user_dict)
    created_user = await users_collection.find_one({"_id": new_user.inserted_id})
    return {"message": "HR registered successfully", "user": user_helper(created_user)}

@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    remember_me: bool = Form(False)
):
    user = await users_collection.find_one({"username": form_data.username})
    if not user and "@" in form_data.username:
        user = await users_collection.find_one({"email": form_data.username})

    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    expires_delta = timedelta(days=30) if remember_me else None
        
    access_token = create_access_token(data={"sub": user["username"]}, expires_delta=expires_delta)
    helper_user = user_helper(user)
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": helper_user["role"],
        "user": helper_user
    }


@router.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user
