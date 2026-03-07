from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas, dependencies

router = APIRouter(prefix="/collaboration", tags=["collaboration"])

# Milestones
@router.post("/milestones", response_model=schemas.MilestoneResponse)
def create_milestone(
    milestone: schemas.MilestoneCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.check_role([models.UserRole.SUPER_ADMIN, models.UserRole.COMPANY_ADMIN]))
):
    db_milestone = models.Milestone(**milestone.dict())
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone

@router.get("/milestones/{project_id}", response_model=List[schemas.MilestoneResponse])
def list_milestones(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    return db.query(models.Milestone).filter(models.Milestone.project_id == project_id).all()

# Time Logs
@router.post("/time-logs")
def log_time(
    time_log: schemas.TimeLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    new_log = models.TimeLog(
        task_id=time_log.task_id, 
        user_id=current_user.id, 
        hours=time_log.hours,
        description=time_log.description,
        date=time_log.date
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@router.get("/time-logs/{task_id}", response_model=List[schemas.TimeLogResponse])
def list_time_logs(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    return db.query(models.TimeLog).filter(models.TimeLog.task_id == task_id).all()

# Comments
@router.post("/comments", response_model=schemas.CommentResponse)
def add_comment(
    comment: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    new_comment = models.Comment(
        task_id=comment.task_id, 
        user_id=current_user.id, 
        message=comment.message
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

@router.get("/comments/{task_id}", response_model=List[schemas.CommentResponse])
def list_comments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    return db.query(models.Comment).filter(models.Comment.task_id == task_id).all()
