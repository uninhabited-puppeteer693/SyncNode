from fastapi import APIRouter, Body, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db 
from app.models.user import User
from app.oauth2 import get_current_user
from app.schemas.user import UserCreate, UserShow, UserUpdateProfile, UserUpdateRole
from app.services import user_services


router = APIRouter()


# --- Self-Management Flow ---

@router.get("/profile", response_model=UserShow, status_code=status.HTTP_200_OK)
def get_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves the profile information for the currently authenticated user.
    """
    return current_user


@router.put("/profile", response_model=UserShow)
def update_my_profile(
    user_data: UserUpdateProfile, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Allows a user to update their own personal profile information.
    """
    return user_services.update_my_profile(user_data=user_data, db=db, current_user=current_user)


# --- Workspace User Management Flow ---

@router.post("/", response_model=UserShow, status_code=status.HTTP_201_CREATED)
def create_user(
    user: UserCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Invites/Creates a new user within the workspace. Restricted by RBAC hierarchy.
    """
    return user_services.create_user(user=user, db=db, current_user=current_user)


@router.get("/", response_model=list[UserShow], status_code=status.HTTP_200_OK)
def get_all_users(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
): 
    """
    Retrieves the directory of all users within the current workspace.
    """
    return user_services.get_all_users(db=db, current_user=current_user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Removes a user from the workspace. Restricted by RBAC hierarchy.
    """
    return user_services.delete_user(user_id=user_id, db=db, current_user=current_user)


# --- Admin Security Actions ---

@router.put("/{user_id}/role", status_code=status.HTTP_200_OK)
def update_user_role(
    user_id: str, 
    new_role: UserUpdateRole,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Modifies a user's permission level. Restricted by RBAC hierarchy.
    """
    return user_services.update_user_role(user_id=user_id, new_role=new_role, db=db, current_user=current_user)


@router.put("/{user_id}/toggle-active", status_code=status.HTTP_200_OK)
def toggle_user_active(
    user_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Soft-deletes or restores a user account, disabling their login capability.
    """
    return user_services.toggle_user_active(user_id=user_id, db=db, current_user=current_user)


@router.put("/{user_id}/unlock", status_code=status.HTTP_200_OK)
def unlock(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Resets failed login attempts for an account locked due to security thresholds.
    """
    return user_services.unlock(user_id=user_id, db=db, current_user=current_user)


@router.put("/{user_id}/force-reset", status_code=status.HTTP_200_OK)
def force_reset(
    user_id: str,
    new_password: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Allows an IT admin to force an immediate password reset on a target account, 
    flagging the account to require a password change on next login.
    """
    return user_services.force_reset(user_id=user_id, new_password=new_password, db=db, current_user=current_user)