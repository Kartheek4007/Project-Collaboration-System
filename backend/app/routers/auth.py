from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, auth, dependencies
from typing import List, Optional

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    
    company_id_to_use = user.company_id
    if user.company_name:
        comp = db.query(models.Company).filter(models.Company.name.ilike(user.company_name)).first()
        if comp:
            company_id_to_use = comp.id
        else:
            new_comp = models.Company(name=user.company_name)
            db.add(new_comp)
            db.commit()
            db.refresh(new_comp)
            company_id_to_use = new_comp.id

    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        role=user.role,
        company_id=company_id_to_use,
        employee_id=user.employee_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users", response_model=List[schemas.UserResponse])
def list_users(
    company_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    query = db.query(models.User)
    if current_user.role != models.UserRole.SUPER_ADMIN:
        query = query.filter(models.User.company_id == current_user.company_id)
    elif company_id:
        query = query.filter(models.User.company_id == company_id)
    
    return query.all()

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(dependencies.get_current_user)):
    return current_user

@router.patch("/me", response_model=schemas.UserResponse)
def update_me(
    update_data: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    if update_data.name is not None:
        current_user.name = update_data.name
    if update_data.role is not None:
        current_user.role = update_data.role
    if update_data.company_id is not None:
        current_user.company_id = update_data.company_id
    if update_data.employee_id is not None:
        current_user.employee_id = update_data.employee_id
        
    if update_data.company_name:
        comp = db.query(models.Company).filter(models.Company.name.ilike(update_data.company_name)).first()
        if comp:
            current_user.company_id = comp.id
        else:
            new_comp = models.Company(name=update_data.company_name)
            db.add(new_comp)
            db.commit()
            db.refresh(new_comp)
            current_user.company_id = new_comp.id
            
    db.commit()
    db.refresh(current_user)
    return current_user

@router.patch("/users/{user_id}/status", response_model=schemas.UserResponse)
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.check_role([models.UserRole.SUPER_ADMIN]))
):
    """Super Admin: enable or disable any user account."""
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot disable your own account")
    target.is_active = not target.is_active
    db.commit()
    db.refresh(target)
    return target
