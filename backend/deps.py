from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from database import users_collection, user_helper
from utils import SECRET_KEY, ALGORITHM
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = await users_collection.find_one({"username": username})
    if user is None:
        raise credentials_exception
    
    # Transform to dict
    current_user = user_helper(user)
    
    # If the user is an employee, fetch the org logo from who created them (HR)
    if current_user.get("role") == "EMPLOYEE" and current_user.get("created_by"):
        hr_user = await users_collection.find_one({"_id": ObjectId(current_user["created_by"])})
        if hr_user and hr_user.get("org_logo"):
            current_user["org_logo"] = hr_user.get("org_logo")
            
    return current_user

async def get_current_hr_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "HR":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user
