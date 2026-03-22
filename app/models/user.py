import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class User(Base):
    """
    Represents an individual user profile.
    
    Bound to a specific Company. Contains public profile data and application state variables. 
    Sensitive security data is delegated to the 1-to-1 UserAuth table.
    """
    __tablename__ = "users"

    # Primary & Foreign Keys
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    
    # Core Data
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    avatar_url = Column(String(255), nullable=True)

    # Application State
    role = Column(String(50), default="developer")
    presence = Column(String(50), default="online")
    is_active = Column(Boolean, default=True)  # Soft deletion flag to disable login access
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    company = relationship("Company", back_populates="users")
    auth = relationship("UserAuth", back_populates="user", uselist=False, cascade="all, delete-orphan")