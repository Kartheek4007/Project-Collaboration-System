from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas, dependencies

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/", response_model=schemas.TaskResponse)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.check_role([models.UserRole.SUPER_ADMIN, models.UserRole.COMPANY_ADMIN]))
):
    # Verify the project exists and the company is part of it
    project_company = db.query(models.ProjectCompany).filter(
        models.ProjectCompany.project_id == task.project_id,
        models.ProjectCompany.company_id == task.assigned_company_id
    ).first()
    
    if not project_company:
        raise HTTPException(status_code=400, detail="Assigned company is not part of this project")
        
    db_task = models.Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/", response_model=List[schemas.TaskResponse])
def list_tasks(
    project_id: int = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    query = db.query(models.Task)
    if project_id:
        query = query.filter(models.Task.project_id == project_id)
        
    if current_user.role == models.UserRole.SUPER_ADMIN:
        return query.all()
    
    # Filter by user's company membership
    return query.join(models.Project).join(models.ProjectCompany).filter(
        models.ProjectCompany.company_id == current_user.company_id
    ).all()

@router.patch("/{task_id}", response_model=schemas.TaskResponse)
def update_task_status(
    task_id: int,
    status_data: schemas.TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    # Check permissions
    if current_user.role != models.UserRole.SUPER_ADMIN and current_user.company_id != task.assigned_company_id:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    task.status = status_data.status
    db.commit()
    db.refresh(task)
    return task

from pydantic import BaseModel

class TaskProgressSchema(BaseModel):
    progress: int

@router.patch("/{task_id}/progress", response_model=schemas.TaskResponse)
def update_task_progress(
    task_id: int,
    progress_data: TaskProgressSchema,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role == models.UserRole.CLIENT:
        raise HTTPException(status_code=403, detail="Forbidden")
    if current_user.role == models.UserRole.EMPLOYEE and current_user.company_id != task.assigned_company_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    task.progress = max(0, min(100, progress_data.progress))
    db.commit()
    db.refresh(task)
    return task
