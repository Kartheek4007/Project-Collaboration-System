from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas, dependencies

router = APIRouter(prefix="/companies", tags=["companies"])

@router.post("/", response_model=schemas.CompanyResponse)
def create_company(
    company: schemas.CompanyCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.check_role([models.UserRole.SUPER_ADMIN]))
):
    db_company = models.Company(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@router.get("/", response_model=List[schemas.CompanyResponse])
def list_companies(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.check_role([models.UserRole.SUPER_ADMIN, models.UserRole.COMPANY_ADMIN]))
):
    return db.query(models.Company).all()

@router.get("/{company_id}", response_model=schemas.CompanyResponse)
def get_company(
    company_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    # Ensure users only see their own company unless they are super admin
    if current_user.role != models.UserRole.SUPER_ADMIN and current_user.company_id != company_id:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.patch("/{company_id}/status", response_model=schemas.CompanyResponse)
def update_company_status(
    company_id: int,
    status_update: schemas.DeliverableStatusUpdate, # Reuse status update schema or add specific one
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.check_role([models.UserRole.SUPER_ADMIN]))
):
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company.status = status_update.status
    db.commit()
    db.refresh(company)
    return company
