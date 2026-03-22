import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserBase(BaseModel):
    """
    Core properties defining a standard User profile within the system.
    """
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    
    role: str = "developer"
    presence: str = "online"
    is_active: bool = True
    

class UserCreate(UserBase):
    """
    Schema utilized for registering an individual user within an existing company.
    Enforces strict cryptographic password complexity requirements.
    """
    company_id: Optional[str] = None
    password: str = Field(..., min_length=8, max_length=20)

    @classmethod
    @field_validator('password')
    def validate_password_complexity(cls, value: str) -> str:
        """
        Cryptographic policy validator.
        Requires at least one uppercase letter, one lowercase letter, one digit, and one special character.
        """
        pattern = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$"
        if not re.match(pattern, value):
            raise ValueError('Password must contain at least one lowercase, one uppercase, one digit, and one special character.')
        return value


class UserUpdateProfile(BaseModel):
    """
    Payload schema for user self-service profile updates.
    """
    first_name: Optional[str] = Field(None, min_length=2, max_length=50)
    last_name: Optional[str] = Field(None, min_length=2, max_length=50)
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    presence: Optional[str] = None


class UserUpdateRole(BaseModel):
    """
    Payload schema strictly isolated for administrative role elevations.
    """
    role: str = Field(..., min_length=2, max_length=50)


class UserShow(UserBase):
    """
    Sanitized response schema for User data.
    Excludes sensitive credentials while providing system-assigned metadata.
    """
    id: str
    company_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)