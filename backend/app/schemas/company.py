from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CompanyBase(BaseModel):
    """
    Shared properties for the Company entity.
    Defines the core data structure for creating, updating, and reading company records.
    """
    name: str = Field(..., min_length=2, max_length=100)
    subscription_plan: str = Field(default="free", min_length=3, max_length=50)
    is_active: bool = True


class CompanyCreate(CompanyBase):
    """
    Schema utilized for creating a standard Company record internally.
    """
    pass


class CompanyRegister(BaseModel):
    """
    Composite schema for the initial tenant onboarding process.
    Validates the simultaneous creation of a new company workspace and its primary owner account.
    """
    company_name: str
    subscription_plan: str = "free" 
    
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str
    last_name: str
    phone: Optional[str] = None


class CompanyUpdate(BaseModel):
    """
    Schema for partial updates to a Company profile.
    """
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    subscription_plan: Optional[str] = Field(None, min_length=3, max_length=50)


class CompanyShow(CompanyBase):
    """
    Response schema for the Company entity.
    Ensures sensitive data is filtered and internal IDs/timestamps are included.
    """
    id: str
    created_at: datetime 

    model_config = ConfigDict(from_attributes=True)