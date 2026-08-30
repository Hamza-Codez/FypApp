from typing import Optional, List
from pydantic import BaseModel, EmailStr, model_validator, Field
from datetime import datetime, date
from enum import Enum

class Role(str, Enum):
    HR = "HR"
    EMPLOYEE = "EMPLOYEE"

class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    ON_LEAVE = "ON_LEAVE"
    SUSPENDED = "SUSPENDED"

class ProjectStatus(str, Enum):
    PLANNING = "PLANNING"
    IN_PROGRESS = "IN_PROGRESS"
    ACTIVE = "ACTIVE"
    ON_HOLD = "ON_HOLD"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class TaskStatus(str, Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    REVIEW = "REVIEW"
    COMPLETED = "COMPLETED"

class Priority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class User(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: EmailStr
    username: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    organization_name: Optional[str] = None
    contact_info: Optional[str] = None
    org_architecture: Optional[str] = None
    org_headcounts: Optional[str] = None
    cultural_practices: Optional[str] = None
    role: Role
    designation: Optional[str] = None
    status: UserStatus = UserStatus.ACTIVE
    profile_image: Optional[str] = None
    org_logo: Optional[str] = None
    created_by: Optional[str] = None # for employees
    must_change_password: bool = True
    onboard_date: Optional[str] = None

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
    role: Role
    user: User

class TokenData(BaseModel):
    username: Optional[str] = None

class EmployeeCreate(BaseModel):
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    email: EmailStr
    username: Optional[str] = None
    password: Optional[str] = None
    role: Role = Role.EMPLOYEE
    designation: Optional[str] = Field(None, min_length=1)
    onboard_date: Optional[str] = None

class ProjectCreate(BaseModel):
    name: str = Field(min_length=1)
    description: Optional[str] = None
    assigned_to: List[str]
    team_lead_id: Optional[str] = None
    priority: Priority = Priority.MEDIUM
    status: ProjectStatus = ProjectStatus.PLANNING
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    @model_validator(mode='after')
    def check_dates(self) -> 'ProjectCreate':
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError('End date must be after start date')
        return self

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    assigned_to: Optional[List[str]] = None
    team_lead_id: Optional[str] = None
    status: Optional[ProjectStatus] = None
    priority: Optional[Priority] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    progress: Optional[float] = None

    @model_validator(mode='after')
    def check_dates(self) -> 'ProjectUpdate':
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError('End date must be after start date')
        return self

class TaskCreate(BaseModel):
    project_id: str
    title: str = Field(min_length=1)
    description: Optional[str] = None
    type: Optional[str] = "TASK"
    priority: Priority = Priority.MEDIUM
    status: TaskStatus = TaskStatus.TODO
    due_date: Optional[date] = None
    assigned_to: Optional[List[str]] = []

class TaskComment(BaseModel):
    text: str = Field(min_length=1)

class TaskUpdateStatus(BaseModel):
    status: TaskStatus
    report_link: Optional[str] = None
    comment: Optional[str] = None

class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1)
    last_name: Optional[str] = Field(None, min_length=1)
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    organization_name: Optional[str] = None
    contact_info: Optional[str] = None
    org_architecture: Optional[str] = None
    org_headcounts: Optional[str] = None
    cultural_practices: Optional[str] = None
    designation: Optional[str] = Field(None, min_length=1)
    onboard_date: Optional[str] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(min_length=6)

class AIScreenerRequest(BaseModel):
    requirements: str = Field(min_length=10)
    
class AIScreenerResult(BaseModel):
    candidate_name: str
    score: int
    summary: str
    strengths: List[str]
    weaknesses: List[str]
    verdict: str

class AIScreenerResponse(BaseModel):
    results: List[AIScreenerResult]
    truncated: Optional[bool] = False

class Notification(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    message: str
    type: str = "info"
    is_read: bool = False
    created_at: datetime
    link: Optional[str] = None

class NotificationUpdate(BaseModel):
    is_read: bool

class WorkloadSettings(BaseModel):
    max_projects_lead: int = Field(2, ge=1)
    max_projects_member: int = Field(5, ge=1)
