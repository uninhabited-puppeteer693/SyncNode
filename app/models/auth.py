import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class UserAuth(Base):
    """
    Manages sensitive authentication credentials for users.
    
    Strictly mapped 1-to-1 with the User table to securely separate identity data 
    from password hashes, OAuth tokens, and lockout states.
    """
    __tablename__ = "user_auth"

    # Primary & Foreign Keys
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Authentication Credentials
    auth_provider = Column(String(50), default="local")
    password_hash = Column(String(255), nullable=True)
    provider_id = Column(String(255), nullable=True)
    
    # Session Management
    refresh_token = Column(String(500), nullable=True)  # Enables secure session revocation
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Security & Lockout Policies
    requires_password_change = Column(Boolean, default=False)
    failed_login_attempts = Column(Integer, default=0, nullable=True)
    locked_until = Column(DateTime, default=None, nullable=True)
    
    # Password Reset Flow
    reset_token = Column(String(255), nullable=True, index=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="auth")