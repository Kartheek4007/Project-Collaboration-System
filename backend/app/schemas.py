from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from .models import UserRole, ProjectStatus, TaskPriority, TaskStatus

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole
    company_id: Optional[int] = None
    employee_id: Optional[str] = None

class UserCreate(UserBase):
    password: str
    company_name: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[UserRole] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    employee_id: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: Optional[int] = 1
    created_at: datetime
    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[UserRole] = None

# Company Schemas
class CompanyBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "active"

class CompanyCreate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    title: str
    description: str
    client_id: int
    deadline: datetime
    budget: float
    status: ProjectStatus = ProjectStatus.PLANNING

class ProjectCreate(ProjectBase):
    company_ids: List[int]

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Task Schemas
class TaskBase(BaseModel):
    project_id: int
    milestone_id: Optional[int] = None
    assigned_user_id: Optional[int] = None
    assigned_company_id: int
    title: str
    description: str
    priority: TaskPriority
    status: TaskStatus
    due_date: datetime
    estimated_hours: float
    progress: int = 0

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    class Config:
        from_attributes = True

class TaskStatusUpdate(BaseModel):
    status: TaskStatus

# Milestone Schemas
class MilestoneBase(BaseModel):
    project_id: int
    title: str
    description: str
    due_date: datetime
    status: str = "pending"

class MilestoneCreate(MilestoneBase):
    pass

class MilestoneResponse(MilestoneBase):
    id: int
    class Config:
        from_attributes = True

# TimeLog Schemas
class TimeLogBase(BaseModel):
    task_id: int
    hours: float
    description: Optional[str] = None
    date: datetime = datetime.now()

class TimeLogCreate(TimeLogBase):
    pass

class TimeLogResponse(TimeLogBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

# Comment Schemas
class CommentBase(BaseModel):
    task_id: int
    message: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Deliverable Schemas
class DeliverableBase(BaseModel):
    project_id: int
    title: str
    description: str
    file_path: Optional[str] = None
    status: str = "Pending Approval"

class DeliverableCreate(DeliverableBase):
    pass

class DeliverableResponse(DeliverableBase):
    id: int
    submitted_at: datetime
    class Config:
        from_attributes = True

class DeliverableStatusUpdate(BaseModel):
    status: str

# Attachment Schemas
class AttachmentBase(BaseModel):
    task_id: int
    file_name: str
    file_path: str

class AttachmentResponse(AttachmentBase):
    id: int
    uploaded_at: datetime
    class Config:
        from_attributes = True
