from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class UserBasic(BaseModel):
    """
    Minimal user representation used for nested relationships (e.g., Creator or Assignee).
    """
    id: str
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class IssueCompanyShow(BaseModel):
    """
    Minimal company representation used to display workspace context within an issue.
    """
    name: str

    model_config = ConfigDict(from_attributes=True)


class IssueBase(BaseModel):
    """
    Core properties for Issue tracking records.
    Standardizes the categorization and prioritization of tasks within the system.
    """
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., max_length=5000)
    priority: str = "medium"  
    type: str = "bug"         
    status: str = "open"    
    git_url: Optional[str] = None


class IssueCreate(IssueBase):
    """
    Payload schema for initializing a new Issue.
    Permits optional assignment to a specific user during creation.
    """
    assignee_id: Optional[str] = None


class IssueUpdate(BaseModel):
    """
    Payload schema for updating an existing Issue.
    All fields are optional because a user might only update one thing (like status).
    """
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=5000)
    priority: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    assignee_id: Optional[str] = None


class IssueShow(IssueBase):
    """
    Response schema representing a persisted Issue.
    Exposes database-managed metadata such as creator, assignment, and generation timestamps.
    """
    id: str
    creator_id: Optional[str] = None  
    assignee_id: Optional[str] = None
    git_url: Optional[str] = None
    created_at: datetime

    # Nested Entity Relationships
    creator: Optional[UserBasic] = None
    assignee: Optional[UserBasic] = None
    company: Optional[IssueCompanyShow] = None

    model_config = ConfigDict(from_attributes=True)


class IssueLogShow(BaseModel):
    """
    Response schema for an individual audit log entry tied to an issue.
    """
    id: str
    action: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    created_at: datetime
    actor: Optional[UserBasic] = None

    model_config = ConfigDict(from_attributes=True)