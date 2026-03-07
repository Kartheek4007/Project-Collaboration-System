from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Enum as SQLEnum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

class UserRole(enum.Enum):
    SUPER_ADMIN = "super_admin"
    COMPANY_ADMIN = "company_admin"
    EMPLOYEE = "employee"
    CLIENT = "client"

class ProjectStatus(enum.Enum):
    PLANNING = "Planning"
    IN_PROGRESS = "In Progress"
    REVIEW = "Review"
    COMPLETED = "Completed"
    ARCHIVED = "Archived"

class TaskPriority(enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class TaskStatus(enum.Enum):
    BACKLOG = "Backlog"
    TODO = "Todo"
    IN_PROGRESS = "In Progress"
    TESTING = "Testing"
    DONE = "Done"
    BLOCKED = "Blocked"

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    users = relationship("User", back_populates="company")
    projects = relationship("ProjectCompany", back_populates="company")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(SQLEnum(UserRole))
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    employee_id = Column(String, nullable=True)
    is_active = Column(Integer, default=1)  # 1=active, 0=suspended
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    company = relationship("Company", back_populates="users")
    assigned_tasks = relationship("Task", back_populates="assigned_user")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    client_id = Column(Integer, ForeignKey("users.id"))
    deadline = Column(DateTime)
    budget = Column(Float)
    status = Column(SQLEnum(ProjectStatus), default=ProjectStatus.PLANNING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    companies = relationship("ProjectCompany", back_populates="project")
    milestones = relationship("Milestone", back_populates="project")
    tasks = relationship("Task", back_populates="project")
    deliverables = relationship("Deliverable", back_populates="project")

class ProjectCompany(Base):
    __tablename__ = "project_companies"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))
    project = relationship("Project", back_populates="companies")
    company = relationship("Company", back_populates="projects")

class Milestone(Base):
    __tablename__ = "milestones"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    title = Column(String)
    description = Column(String, nullable=True)
    deadline = Column(DateTime)
    status = Column(String)
    project = relationship("Project", back_populates="milestones")
    tasks = relationship("Task", back_populates="milestone")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    milestone_id = Column(Integer, ForeignKey("milestones.id"), nullable=True)
    assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_company_id = Column(Integer, ForeignKey("companies.id"))
    title = Column(String)
    description = Column(String)
    priority = Column(SQLEnum(TaskPriority))
    status = Column(SQLEnum(TaskStatus))
    due_date = Column(DateTime)
    estimated_hours = Column(Float)
    progress = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    project = relationship("Project", back_populates="tasks")
    milestone = relationship("Milestone", back_populates="tasks")
    assigned_user = relationship("User", back_populates="assigned_tasks")
    time_logs = relationship("TimeLog", back_populates="task")
    comments = relationship("Comment", back_populates="task")
    attachments = relationship("Attachment", back_populates="task")

class TimeLog(Base):
    __tablename__ = "time_logs"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    hours = Column(Float)
    description = Column(String, nullable=True)
    date = Column(DateTime)
    log_date = Column(DateTime, server_default=func.now())
    task = relationship("Task", back_populates="time_logs")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    task = relationship("Task", back_populates="comments")

class Deliverable(Base):
    __tablename__ = "deliverables"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    title = Column(String)
    description = Column(String)
    file_path = Column(String, nullable=True)
    status = Column(String, default="Pending Approval") # Pending Approval, Approved, Rejected
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    project = relationship("Project", back_populates="deliverables")

class Attachment(Base):
    __tablename__ = "attachments"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    file_name = Column(String)
    file_path = Column(String)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    task = relationship("Task", back_populates="attachments")
