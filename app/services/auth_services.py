import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload

from app.models.auth import UserAuth
from app.models.company import Company
from app.models.user import User
from app.oauth2 import create_access_token, create_refresh_token, verify_refresh_token
from app.schemas.auth import (
    ForgotPasswordRequest,
    ResetPasswordConfirm,
    SetInitialPasswordRequest,
    TokenRefreshRequest,
)
from app.utils import hash_password, send_email_code, verify_password


def login(user_credentials: OAuth2PasswordRequestForm, db: Session):
    """
    Authenticates a user and provisions JWT session tokens.
    Enforces multi-tenancy soft-deletion checks and brute-force lockout policies.
    """
    user = db.query(User).options(
        joinedload(User.company),
        joinedload(User.auth)
    ).filter(User.email == user_credentials.username).first()

    if not user or not user.auth:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")
    
    # Enforce multi-tenancy and soft-delete security constraints
    if not user.is_active or not user.company or not user.company.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account or workspace has been deactivated.")
    
    now = datetime.now(timezone.utc)

    # Brute-force lockout verification
    if user.auth.locked_until and user.auth.locked_until > now:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Account temporarily locked due to excessive failed attempts. Contact IT."
        )

    # Password cryptographic verification
    if not verify_password(user_credentials.password, user.auth.password_hash):
        user.auth.failed_login_attempts += 1
        if user.auth.failed_login_attempts >= 4:
            user.auth.locked_until = now + timedelta(minutes=15)
        db.commit()
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")
    
    # Successful Authentication: Reset security triggers
    user.auth.failed_login_attempts = 0
    user.auth.locked_until = None

    # Intercept login flow if an IT Admin forced a password reset
    if user.auth.requires_password_change:
        db.commit()
        return {
            "status": "requires_password_change",
            "user_id": user.id
        }

    # Provision standard session tokens
    access_token = create_access_token(data={"user_id": user.id})
    refresh_token = create_refresh_token(data={"user_id": user.id})

    user.auth.refresh_token = refresh_token
    db.commit()

    return {
        "access_token": access_token, 
        "refresh_token": refresh_token, 
        "token_type": "bearer"
    }


def refresh_access_token(body: TokenRefreshRequest, db: Session):
    """
    Issues a new access token using a valid, non-revoked refresh token.
    Re-evaluates tenant active status during token issuance.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    user_id = verify_refresh_token(body.refresh_token, credentials_exception)

    user = db.query(User).options(
        joinedload(User.auth),
        joinedload(User.company)
    ).filter(User.id == user_id).first()
    
    # Validate token against the database to allow server-side revocation
    if not user or not user.auth or user.auth.refresh_token != body.refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked or invalid")
    
    if not user.is_active or not user.company.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")
        
    new_access_token = create_access_token(data={"user_id": user.id})
    
    return {
        "access_token": new_access_token, 
        "token_type": "bearer"
    }   


def set_initial_password(payload: SetInitialPasswordRequest, db: Session):
    """
    Processes the mandatory password update required after an IT Admin force-reset.
    """
    user = db.query(User).options(joinedload(User.auth)).filter(User.id == payload.user_id).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")

    user.auth.password_hash = hash_password(payload.new_password)
    user.auth.requires_password_change = False

    access_token = create_access_token(data={"user_id": user.id})
    refresh_token = create_refresh_token(data={"user_id": user.id})

    user.auth.refresh_token = refresh_token
    db.commit()

    return {
        "access_token": access_token, 
        "refresh_token": refresh_token, 
        "token_type": "bearer"
    }


def request_password_reset(payload: ForgotPasswordRequest, db: Session):
    """
    Generates a secure 6-digit recovery code and dispatches it via email.
    Uses generic success messages to prevent email enumeration attacks.
    """
    user = db.query(User).filter(User.email == payload.email).first()
    success_msg = "If an account is associated with that email, a reset code has been sent."

    if not user:
        return {"message": success_msg}

    reset_code = f"{secrets.randbelow(1000000):06d}"
    user.auth.reset_token = reset_code
    user.auth.reset_token_expires = datetime.now(timezone.utc) + timedelta(minutes=15)
    db.commit()

    send_email_code(target_email=user.email, code=reset_code)
    return {"message": success_msg}


def confirm_password_reset(payload: ResetPasswordConfirm, db: Session):
    """
    Validates a recovery code and applies a new cryptographic password hash.
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid request.")

    now = datetime.now(timezone.utc)
    
    if (not user.auth.reset_token or 
        user.auth.reset_token != payload.code or 
        not user.auth.reset_token_expires or 
        now > user.auth.reset_token_expires.replace(tzinfo=timezone.utc)):
        raise HTTPException(status_code=400, detail="Verification code is invalid or has expired.")

    user.auth.password_hash = hash_password(payload.new_password)
    user.auth.reset_token = None
    user.auth.reset_token_expires = None
    user.auth.failed_login_attempts = 0
    user.auth.locked_until = None
    db.commit()

    return {"message": "Password has been reset successfully. You can now log in."}


def logout(db: Session, current_user: User):
    """
    Terminates the user session by destroying the active refresh token in the database.
    """
    user_auth = db.query(UserAuth).filter(UserAuth.user_id == current_user.id).first()
    
    if user_auth:
        user_auth.refresh_token = None
        db.commit()
        
    return Response(status_code=status.HTTP_204_NO_CONTENT)