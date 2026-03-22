from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.oauth2 import get_current_user
from app.schemas.auth import (
    ForgotPasswordRequest, 
    ResetPasswordConfirm, 
    SetInitialPasswordRequest, 
    TokenRefreshRequest
)
from app.services import auth_services


router = APIRouter()


# --- Core Authentication Flow ---

@router.post("/login")
def login(
    user_credentials: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """
    Authenticates a user and returns a JWT access token.
    Intercepts users who require a mandatory initial password change.
    """
    return auth_services.login(user_credentials=user_credentials, db=db)


@router.post("/refresh")
def refresh_access_token(
    body: TokenRefreshRequest,
    db: Session = Depends(get_db)
):
    """
    Issues a new access token using a valid, non-expired refresh token.
    """
    return auth_services.refresh_access_token(body=body, db=db) 


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Invalidates the user's current session and revokes refresh tokens.
    """
    return auth_services.logout(db=db, current_user=current_user)


# --- Password Management Flow ---

@router.put("/set-initial-password")
def set_initial_password(
    payload: SetInitialPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Allows a user to set their secure password after an admin-forced reset.
    """
    return auth_services.set_initial_password(payload=payload, db=db)


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(
    payload: ForgotPasswordRequest, 
    db: Session = Depends(get_db)
):
    """
    Initiates the password recovery flow by generating and emailing a reset token.
    """
    return auth_services.request_password_reset(payload=payload, db=db)


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(
    payload: ResetPasswordConfirm, 
    db: Session = Depends(get_db)
):
    """
    Validates a recovery token and updates the user's password.
    """
    return auth_services.confirm_password_reset(payload=payload, db=db)