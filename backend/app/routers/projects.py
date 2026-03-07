from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas, dependencies

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("/", response_model=schemas.ProjectResponse)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.check_role([models.UserRole.COMPANY_ADMIN]))
):
    # Only admins can create projects
    new_project = models.Project(
        title=project.title,
        description=project.description,
        client_id=project.client_id,
        deadline=project.deadline,
        budget=project.budget,
        status=project.status
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    # Associate companies with the project
    for company_id in project.company_ids:
        pc = models.ProjectCompany(project_id=new_project.id, company_id=company_id)
        db.add(pc)
    
    db.commit()
    db.refresh(new_project)
    return new_project

@router.get("/", response_model=List[schemas.ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    if current_user.role == models.UserRole.SUPER_ADMIN:
        return db.query(models.Project).all()
    
    # Filter projects by company membership
    return db.query(models.Project).join(models.ProjectCompany).filter(
        models.ProjectCompany.company_id == current_user.company_id
    ).all()

@router.get("/{project_id}", response_model=schemas.ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Check if user has access
    if current_user.role != models.UserRole.SUPER_ADMIN:
        is_member = db.query(models.ProjectCompany).filter(
            models.ProjectCompany.project_id == project_id,
            models.ProjectCompany.company_id == current_user.company_id
        ).first()
        if not is_member:
            raise HTTPException(status_code=403, detail="Forbidden")
            
    return project
