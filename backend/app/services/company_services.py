from fastapi import HTTPException, Response, status
from sqlalchemy.orm import Session

from app.models.auth import UserAuth
from app.models.company import Company
from app.models.user import User
from app.schemas.company import CompanyRegister, CompanyUpdate
from app.utils import ROLE_WEIGHTS, hash_password


def create_company(company: CompanyRegister, db: Session):
    """
    Registers a new company tenant and provisions the initial owner account.
    Utilizes manual transaction management to ensure atomic creation across three tables.
    """
    new_company = Company(
        name=company.company_name,
        subscription_plan=company.subscription_plan
    )
    
    db.add(new_company)
    db.flush()

    existing_user = db.query(User).filter(User.email == company.email).first()
    if existing_user:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        company_id=new_company.id,
        first_name=company.first_name,
        last_name=company.last_name,
        phone=company.phone,
        email=company.email,
        role="owner"
    )

    db.add(new_user)
    db.flush()

    user_auth = UserAuth(
        user_id=new_user.id,
        password_hash=hash_password(company.password),
        auth_provider="email",
        provider_id=None
    )

    db.add(user_auth)
    db.commit()
    
    db.refresh(new_company)
    db.refresh(new_user)

    return {"company": new_company, "owner": new_user}


def get_company(db: Session, current_user: User):
    """
    Retrieves the active tenant details. Restricted to Admin or Owner privileges.
    """
    user_weight = ROLE_WEIGHTS.get(current_user.role, 0)
    
    if user_weight < ROLE_WEIGHTS.get("admin", 80):
        raise HTTPException(status_code=403, detail="Not authorized to view company details.")
    
    company = db.query(Company).filter(Company.id == current_user.company_id).first()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found.")
    
    return company


def update_company(company_data: CompanyUpdate, db: Session, current_user: User):    
    """
    Performs partial updates on tenant settings. Restricted to Owner privileges.
    """
    user_weight = ROLE_WEIGHTS.get(current_user.role, 0)
    
    if user_weight < ROLE_WEIGHTS.get("owner", 100):
        raise HTTPException(status_code=403, detail="Not authorized to modify company details.")
    
    company = db.query(Company).filter(Company.id == current_user.company_id).first()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found.")
    
    update_data = company_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(company, key, value)

    db.commit()
    db.refresh(company)

    return company


def delete_company(db: Session, current_user: User):
    """
    Destroys the tenant workspace by soft-deleting the company and cascading the 
    deactivation state to all associated user accounts. Restricted to Owner privileges.
    """
    user_weight = ROLE_WEIGHTS.get(current_user.role, 0)
    
    if user_weight < ROLE_WEIGHTS.get("owner", 100):
        raise HTTPException(status_code=403, detail="Only the company Owner can destroy the workspace.")

    company = db.query(Company).filter(Company.id == current_user.company_id).first()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found.")

    company.is_active = False
    
    users = db.query(User).filter(User.company_id == current_user.company_id).all()
    for user in users:
        user.is_active = False

    db.commit()
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)