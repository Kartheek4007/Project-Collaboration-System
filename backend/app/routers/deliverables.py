from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas, dependencies

router = APIRouter(prefix="/deliverables", tags=["deliverables"])

@router.post("/", response_model=schemas.DeliverableResponse)
def create_deliverable(
    deliverable: schemas.DeliverableCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    # Only Admin or Employee can submit deliverables
    if current_user.role not in [models.UserRole.SUPER_ADMIN, models.UserRole.COMPANY_ADMIN, models.UserRole.EMPLOYEE]:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    db_deliverable = models.Deliverable(**deliverable.dict())
    db.add(db_deliverable)
    db.commit()
    db.refresh(db_deliverable)
    return db_deliverable

@router.get("/{project_id}", response_model=List[schemas.DeliverableResponse])
def list_deliverables(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    return db.query(models.Deliverable).filter(models.Deliverable.project_id == project_id).all()

@router.patch("/{deliverable_id}/status", response_model=schemas.DeliverableResponse)
def update_deliverable_status(
    deliverable_id: int,
    status_update: schemas.DeliverableStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    db_deliverable = db.query(models.Deliverable).filter(models.Deliverable.id == deliverable_id).first()
    if not db_deliverable:
        raise HTTPException(status_code=404, detail="Deliverable not found")
        
    # Only Client (if assigned to project) or Admin can update status
    is_admin = current_user.role in [models.UserRole.SUPER_ADMIN, models.UserRole.COMPANY_ADMIN]
    is_client = current_user.role == models.UserRole.CLIENT and current_user.id == db_deliverable.project.client_id
    
    if not (is_admin or is_client):
        raise HTTPException(status_code=403, detail="Forbidden")
        
    db_deliverable.status = status_update.status
    db.commit()
    db.refresh(db_deliverable)
    return db_deliverable
