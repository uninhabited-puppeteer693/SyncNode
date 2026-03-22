from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class LogShow(BaseModel):
    """
    Generic response schema for the system's Audit Trail.
    Represents historical state changes across the application for compliance and tracking.
    """
    id: str
    action: str = Field(..., min_length=2, max_length=100)
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    actor_id: Optional[str] = None 
    issue_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)