from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime

class User(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: EmailStr
    username: Optional[str] = None
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
    must_change_password: bool = True

class EmployeeCreateResponse(BaseModel):
    user: User
    password: str

class CSVImportResult(BaseModel):
    email: str
    password: str
    status: str
    error: Optional[str] = None

class CSVImportResponse(BaseModel):
    message: str
    added_count: int
    results: List[CSVImportResult]
    errors: List[str]

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
    username: Optional[str] = None
    password: Optional[str] = None # Or generated automatically
    role: Optional[str] = "EMPLOYEE"

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    assigned_to: List[str] # List of employee ids
    team_lead_id: Optional[str] = None
    priority: Optional[str] = "MEDIUM"
    status: Optional[str] = "PLANNING"
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[List[str]] = None
    team_lead_id: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    progress: Optional[float] = None


class TaskCreate(BaseModel):
    project_id: str
    title: str
    description: Optional[str] = None
    type: Optional[str] = "TASK"
    priority: Optional[str] = "MEDIUM"
    status: Optional[str] = "TODO"
    due_date: Optional[str] = None
    assigned_to: Optional[List[str]] = []

class TaskComment(BaseModel):
    text: str

class TaskUpdateStatus(BaseModel):
    status: str
    report_link: Optional[str] = None
    comment: Optional[str] = None


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

class Notification(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    message: str
    type: str = "info" # info, success, warning, error
    is_read: bool = False
    created_at: datetime
    link: Optional[str] = None # Optional link to redirect on click

class NotificationUpdate(BaseModel):
    is_read: bool
