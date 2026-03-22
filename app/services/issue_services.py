from fastapi import HTTPException, Response, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models.issues import Issue
from app.models.logs import IssueLog
from app.models.user import User
from app.schemas.issue import IssueCreate, IssueShow
from app.utils import ROLE_WEIGHTS


def get_issues(db: Session, current_user: User):
    """
    Retrieves issues based on system hierarchy.
    Superadmins can view all global bug reports. Standard users are strictly 
    limited to their specific tenant workspace and cannot view global reports.
    """
    # Global System Administrator Logic
    if current_user.role == "superadmin":
        return db.query(Issue).options(
            joinedload(Issue.creator),
            joinedload(Issue.assignee),
            joinedload(Issue.company)
        ).filter(
            or_(
                Issue.company_id == current_user.company_id, 
                Issue.type == "report"                       
            )
        ).all()

    # Standard Tenant User Logic
    return db.query(Issue).options(
        joinedload(Issue.creator),
        joinedload(Issue.assignee)
    ).filter(
        Issue.company_id == current_user.company_id,
        Issue.type != "report" 
    ).all()


def get_issue(issue_id: str, db: Session, current_user: User):
    """
    Retrieves a specific issue while enforcing cross-tenant boundaries.
    """
    issue = db.query(Issue).options(
        joinedload(Issue.creator),
        joinedload(Issue.assignee),
        joinedload(Issue.company)
    ).filter(Issue.id == issue_id).first()
    
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found.")
        
    if current_user.role == "superadmin" and issue.type == "report":
        return issue
        
    if issue.company_id != current_user.company_id or issue.type == "report":
        raise HTTPException(status_code=404, detail="Issue not found.")
    
    return issue


def create_issue(issue: IssueCreate, db: Session, current_user: User):
    """
    Initializes a new issue within the user's tenant.
    Validates that the assignee (if provided) belongs to the same workspace.
    """
    if issue.assignee_id is not None:
        assignee = db.query(User).filter(User.id == issue.assignee_id).first()
        if not assignee or assignee.company_id != current_user.company_id:
            raise HTTPException(status_code=400, detail="Invalid assignee. User belongs to another workspace.")

    new_issue = Issue(
        title=issue.title,
        description=issue.description,
        priority=issue.priority,
        status=issue.status,
        type=issue.type,
        company_id=current_user.company_id,
        creator_id=current_user.id,
        assignee_id=issue.assignee_id,
        git_url=issue.git_url
    )

    db.add(new_issue)
    db.commit()
    db.refresh(new_issue)

    return new_issue


def update_issue(issue_id: str, issue_data: IssueShow, db: Session, current_user: User):
    """
    Applies updates to an issue and dynamically generates immutable audit logs 
    for every modified field. Enforces strict RBAC write-permissions.
    """
    issue = get_issue(issue_id, db=db, current_user=current_user)
    user_weight = ROLE_WEIGHTS.get(current_user.role, 0)

    # Cross-tenant assignment validation
    if issue_data.assignee_id is not None and issue_data.assignee_id != issue.assignee_id:
        assignee = db.query(User).filter(User.id == issue_data.assignee_id).first()
        if not assignee or assignee.company_id != current_user.company_id:
            raise HTTPException(status_code=400, detail="Invalid assignee. User belongs to another workspace.")

        if current_user.id != assignee.id:
            assignee_weight = ROLE_WEIGHTS.get(assignee.role, 0)
            if assignee_weight >= user_weight:
                raise HTTPException(status_code=403, detail="Cannot assign issues to users with equal or higher roles.")

    # Determine field-level write permissions based on role
    if user_weight > ROLE_WEIGHTS.get("developer", 10):
        allowed_fields = ["title", "description", "priority", "type", "status", "assignee_id", "git_url"]
    else:
        is_claiming = issue.assignee_id is None and issue_data.assignee_id == current_user.id

        if current_user.id != issue.assignee_id and not is_claiming:
            raise HTTPException(status_code=403, detail="You can only edit issues specifically assigned to you.")
        
        allowed_fields = ["description", "status", "git_url"]
        
        # Developers cannot modify assignees unless claiming an unassigned issue
        if is_claiming:
            allowed_fields.append("assignee_id")
    
    # Dynamic Audit Logging
    logs_to_add = []
    update_data = issue_data.model_dump(exclude_unset=True)

    for field in allowed_fields:
        if field in update_data:
            new_val = update_data[field]
            old_val = getattr(issue, field)

            if new_val != old_val:
                new_log = IssueLog(
                    company_id=current_user.company_id,
                    issue_id=issue.id,
                    actor_id=current_user.id,
                    action=f"UPDATED_{field.upper()}", 
                    old_value=str(old_val) if old_val is not None else "None",
                    new_value=str(new_val) if new_val is not None else "None"
                )
                logs_to_add.append(new_log)
                setattr(issue, field, new_val)

    if logs_to_add:
        db.add_all(logs_to_add)
        db.commit()
        db.refresh(issue)

    return issue


def delete_issue(issue_id: str, db: Session, current_user: User):
    """
    Hard-deletes an issue from the system. Restricted to Manager privileges or higher.
    """
    user_weight = ROLE_WEIGHTS.get(current_user.role, 0)

    if user_weight < ROLE_WEIGHTS.get("manager", 50):
        raise HTTPException(status_code=403, detail="Only managers and above can delete issues.") 

    issue = db.query(Issue).filter(Issue.id == issue_id, Issue.company_id == current_user.company_id).first()

    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found.")

    db.delete(issue)
    db.commit()
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)


def get_issue_logs(issue_id: str, db: Session, current_user: User):
    """
    Retrieves the chronological audit trail for a specific issue.
    """
    issue = db.query(Issue).filter(Issue.id == issue_id, Issue.company_id == current_user.company_id).first()

    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found.")
    
    logs = db.query(IssueLog).options(
        joinedload(IssueLog.actor)
    ).filter(IssueLog.issue_id == issue_id).order_by(IssueLog.created_at.desc()).all()

    return logs