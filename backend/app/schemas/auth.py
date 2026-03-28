from pydantic import BaseModel, EmailStr, Field


class TokenRefreshRequest(BaseModel):
    """
    Payload schema for requesting a new JWT access token using a valid refresh token.
    """
    refresh_token: str


class SetInitialPasswordRequest(BaseModel):
    """
    Payload schema for users updating their password after an admin-forced reset.
    """
    user_id: str
    new_password: str = Field(..., min_length=8)


class ForgotPasswordRequest(BaseModel):
    """
    Payload schema to initiate the password recovery email flow.
    """
    email: EmailStr = Field(..., description="The user's registered email address")


class ResetPasswordConfirm(BaseModel):
    """
    Payload schema to confirm a password reset using the emailed 6-digit verification code.
    """
    email: EmailStr = Field(..., description="The email originally entered for recovery")
    code: str = Field(..., description="The 6-digit verification code received")
    new_password: str = Field(..., min_length=8)