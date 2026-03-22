import uuid

from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Company(Base):
    """
    Represents a tenant (organization) within the system.
    
    Acts as the root entity for the multi-tenant architecture. All core system 
    resources (users, issues, logs) are bound to a company ID to guarantee strict data isolation.
    """
    __tablename__ = "companies"

    # Primary Key
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    
    # Core Data
    name = Column(String(255), nullable=False)
    subscription_plan = Column(String(50), default="free") 
    
    # Metadata & State
    is_active = Column(Boolean, default=True)  # Soft deletion flag for historical data compliance
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    issues = relationship("Issue", back_populates="company", cascade="all, delete-orphan")
    logs = relationship("IssueLog", back_populates="company", cascade="all, delete-orphan")