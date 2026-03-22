from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.oauth2 import get_current_user
from app.schemas.issue import IssueCreate, IssueLogShow, IssueShow, IssueUpdate
from app.services import issue_services


router = APIRouter()


@router.post("/", response_model=IssueShow, status_code=status.HTTP_201_CREATED)
def create_issue(
    issue: IssueCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Creates a new issue within the user's company workspace.
    """
    return issue_services.create_issue(issue=issue, db=db, current_user=current_user)


@router.get("/", response_model=list[IssueShow], status_code=status.HTTP_200_OK)
def get_issues(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves all issues belonging to the user's company workspace.
    """
    return issue_services.get_issues(db=db, current_user=current_user)


@router.get("/{issue_id}", response_model=IssueShow, status_code=status.HTTP_200_OK)
def get_issue(
    issue_id: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves the detailed state of a specific issue.
    """
    return issue_services.get_issue(issue_id=issue_id, db=db, current_user=current_user)


@router.put("/{issue_id}", response_model=IssueShow, status_code=status.HTTP_200_OK)
def update_issue(
    issue_id: str, 
    issue_data: IssueUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Updates the state, assignment, or details of an issue.
    Automatically generates immutable audit logs for any modified fields.
    """
    return issue_services.update_issue(issue_id=issue_id, issue_data=issue_data, db=db, current_user=current_user)


@router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(
    issue_id: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Permanently deletes an issue and its associated audit logs.
    """
    return issue_services.delete_issue(issue_id=issue_id, db=db, current_user=current_user)


@router.get("/{issue_id}/logs", response_model=list[IssueLogShow], status_code=status.HTTP_200_OK)
def get_issue_logs(
    issue_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves the chronological audit trail of all changes applied to a specific issue.
    """
    return issue_services.get_issue_logs(issue_id=issue_id, db=db, current_user=current_user)