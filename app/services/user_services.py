from fastapi import Body, HTTPException, Response, status
from sqlalchemy.orm import Session, joinedload

from app.models.auth import UserAuth
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdateProfile, UserUpdateRole
from app.utils import ROLE_WEIGHTS, hash_password


# --- Retrieval & Standard Management Actions ---

def get_all_users(db: Session, current_user: User): 
    """
    Retrieves all users within the authenticated user's tenant workspace.
    """
    users = db.query(User).filter(User.company_id == current_user.company_id).all()
    return users


def create_user(user: UserCreate, db: Session, current_user: User):
    """
    Creates a new user and associated credentials within the current tenant workspace.
    Defaults new users to requiring a password change upon first login.
    """
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered.")
    
    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        company_id=current_user.company_id,
        phone=user.phone,
        avatar_url=user.avatar_url,
        role=user.role,
        presence=user.presence,
        is_active=True
    )

    db.add(new_user)
    db.flush() 

    user_auth = UserAuth(
        user_id=new_user.id,
        password_hash=hash_password(user.password),
        auth_provider="email",
        provider_id=None,
        requires_password_change=True
    )

    db.add(user_auth)
    db.commit()
    db.refresh(new_user)

    return new_user


def update_my_profile(user_data: UserUpdateProfile, db: Session, current_user: User):
    """
    Processes self-service profile updates for the authenticated user.
    """
    update_data = user_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)

    return current_user


def update_user_role(user_id: str, new_role: UserUpdateRole, db: Session, current_user: User):
    """
    Modifies the role of a specific user.
    Implements advanced RBAC to prevent privilege escalation and preserve hierarchies.
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.company_id != current_user.company_id or user.id == current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden action.")
    
    shaper_weight = ROLE_WEIGHTS.get(current_user.role, 0)
    current_weight = ROLE_WEIGHTS.get(user.role, 0)
    new_weight = ROLE_WEIGHTS.get(new_role.role, 0)

    if current_weight >= shaper_weight:
        raise HTTPException(status_code=403, detail="Cannot modify users with an equal or higher role.")
    
    if new_weight > shaper_weight:
        raise HTTPException(status_code=403, detail="Cannot grant a role higher than your own.")
    
    if new_weight == shaper_weight and shaper_weight < ROLE_WEIGHTS.get("admin", 80):
        raise HTTPException(status_code=403, detail="Only Admins and above can create peers.")

    user.role = new_role.role
    db.commit()
    
    return {"message": f"Success! User role updated to {new_role.role}."}

    
def toggle_user_active(user_id: str, db: Session, current_user: User):
    """
    Toggles the active status of a user (soft delete/restore).
    Disables access while preserving referential integrity in databases and logs.
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found.") 
    
    if current_user.company_id != user.company_id:
        raise HTTPException(status_code=403, detail="Forbidden action.")
        
    shaper_weight = ROLE_WEIGHTS.get(current_user.role, 0)
    target_weight = ROLE_WEIGHTS.get(user.role, 0)

    if shaper_weight < ROLE_WEIGHTS.get("admin", 80):
        raise HTTPException(status_code=403, detail="Only Admins and above can modify account status.")
    
    if target_weight >= shaper_weight and user.id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot modify users with an equal or higher role.")
    
    user.is_active = not user.is_active
    db.commit()

    return {"message": "Status updated successfully", "is_active": user.is_active}


def delete_user(user_id: str, db: Session, current_user: User):
    """
    Performs a soft-delete on a user account.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.") 
    
    if current_user.company_id != user.company_id:
        raise HTTPException(status_code=403, detail="Forbidden action.")
        
    shaper_weight = ROLE_WEIGHTS.get(current_user.role, 0)
    target_weight = ROLE_WEIGHTS.get(user.role, 0)

    if shaper_weight < ROLE_WEIGHTS.get("admin", 80):
        raise HTTPException(status_code=403, detail="Only Admins and above can deactivate users.")
    
    if target_weight >= shaper_weight:
        raise HTTPException(status_code=403, detail="Cannot deactivate users with an equal or higher role.")
    
    user.is_active = False
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- High-Privilege IT Operations ---

def unlock(user_id: str, db: Session, current_user: User):
    """
    Clears brute-force security flags to unlock an account.
    """
    user = _get_target_user_for_it(user_id, db, current_user)

    user.auth.failed_login_attempts = 0
    user.auth.locked_until = None
    db.commit()
    
    return {"message": "User unlocked successfully."}


def force_reset(user_id: str, new_password: str, db: Session, current_user: User):
    """
    Forces an immediate password override and flags the account for a mandatory 
    password change upon the next login attempt.
    """
    user = _get_target_user_for_it(user_id, db, current_user)
    
    temp_pass = hash_password(new_password)
    user.auth.password_hash = temp_pass
    user.auth.failed_login_attempts = 0
    user.auth.locked_until = None
    user.auth.requires_password_change = True
    db.commit()
    
    return {"temp_password": temp_pass}


# --- Private Helpers ---

def _get_target_user_for_it(user_id: str, db: Session, current_user: User):
    """
    Private helper: Fetches a user and strictly enforces IT/Superadmin RBAC privileges.
    """
    user = db.query(User).options(joinedload(User.auth)).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if current_user.company_id != user.company_id:
        raise HTTPException(status_code=403, detail="Forbidden action.")
    
    if current_user.role.lower() not in ["it", "superadmin"]:
        raise HTTPException(status_code=403, detail="Only IT personnel can perform this action.")
    
    return user