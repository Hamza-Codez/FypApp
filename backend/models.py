from typing import Optional, List
from pydantic import BaseModel, EmailStr

class User(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: EmailStr
    username: str
    gender: Optional[str]
    age: Optional[int]
    organization_name: Optional[str]
    contact_info: Optional[str]
    org_architecture: Optional[str]
    org_headcounts: Optional[str]
    cultural_practices: Optional[str]
    role: str
    profile_image: Optional[str]
    org_logo: Optional[str]
    created_by: Optional[str] # for employees

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user: User

class TokenData(BaseModel):
    username: Optional[str] = None

class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    username: str
    contact_info: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    password: Optional[str] = None # Or generated automatically

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    assigned_to: List[str] # List of employee ids
    priority: Optional[str] = "MEDIUM"
    status: Optional[str] = "PLANNING"
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    assigned_to: Optional[List[str]]
    status: Optional[str]
    priority: Optional[str]
    start_date: Optional[str]
    end_date: Optional[str]
    progress: Optional[float]

class TaskCreate(BaseModel):
    project_id: str
    title: str
    description: Optional[str] = None
    type: Optional[str] = "TASK"
    priority: Optional[str] = "MEDIUM"
    due_date: Optional[str] = None
    assigned_to: Optional[List[str]] = []

class TaskComment(BaseModel):
    text: str

class TaskUpdateStatus(BaseModel):
    status: str

class UserUpdate(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[EmailStr]
    username: Optional[str]
    gender: Optional[str]
    age: Optional[int]
    organization_name: Optional[str]
    contact_info: Optional[str]
    org_architecture: Optional[str]
    org_headcounts: Optional[str]
    cultural_practices: Optional[str]

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class AIScreenerRequest(BaseModel):
    requirements: str
    
class AIScreenerResult(BaseModel):
    candidate_name: str
    score: int
    summary: str
    strengths: List[str]
    weaknesses: List[str]
    verdict: str

class AIScreenerResponse(BaseModel):
    results: List[AIScreenerResult]
