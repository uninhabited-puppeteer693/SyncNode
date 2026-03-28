from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.oauth2 import get_current_user
from app.schemas.company import CompanyRegister, CompanyShow, CompanyUpdate
from app.services import company_services


router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
def create_company(
    company: CompanyRegister, 
    db: Session = Depends(get_db)
):
    """
    Registers a new tenant (Company) workspace and provisions the initial Owner account.
    """
    return company_services.create_company(company=company, db=db)


@router.get("/me", response_model=CompanyShow, status_code=status.HTTP_200_OK)
def get_company(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):  
    """
    Retrieves the company workspace details associated with the current authenticated user.
    """
    return company_services.get_company(db=db, current_user=current_user)


@router.put("/me", response_model=CompanyShow, status_code=status.HTTP_200_OK)
def update_company(
    company_data: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):    
    """
    Updates tenant-level settings. Restricted to Admin/Owner roles.
    """
    return company_services.update_company(company_data=company_data, db=db, current_user=current_user)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_company(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):  
    """
    Permanently destroys the tenant workspace, cascading to all users, issues, and logs.
    Restricted to the workspace Owner.
    """
    return company_services.delete_company(db=db, current_user=current_user)