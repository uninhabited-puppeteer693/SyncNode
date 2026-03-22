import os

import resend
from dotenv import load_dotenv
from passlib.context import CryptContext

# Application Environment Initialization
load_dotenv()
resend.api_key = os.getenv("RESEND_API_KEY")

# Cryptographic context utilizing the industry-standard bcrypt algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dynamic Role-Based Access Control (RBAC) hierarchy weights.
# Facilitates scalable permission checks (e.g., target_weight >= admin_weight).
ROLE_WEIGHTS = {
    "superadmin": 100,
    "owner": 100,
    "IT": 90,
    "admin": 80,
    "manager": 50,
    "developer": 10
}


def hash_password(password: str) -> str:
    """
    Generates a secure, salted cryptographic hash from a plaintext password.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compares a plaintext password attempt against a stored cryptographic hash.
    """
    return pwd_context.verify(plain_password, hashed_password)


def send_email_code(target_email: str, code: str) -> bool:
    """
    Dispatches a 6-digit password reset code via the Resend API.
    Includes branded HTML templating for the SyncNode platform.
    """
    try:
        response = resend.Emails.send({
            "from": "SyncNode Security <onboarding@resend.dev>",
            "to": target_email,
            "subject": "Your SyncNode Password Reset Code",
            "html": f"""
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 30px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #0f172a; margin-bottom: 15px;">Password Reset Request</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.5;">Your 6-digit verification code to reset your SyncNode password is:</p>
                <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 6px; margin: 25px 0;">
                    <h1 style="color: #2563eb; letter-spacing: 8px; margin: 0; font-size: 32px;">{code}</h1>
                </div>
                <p style="color: #64748b; font-size: 14px;">This code will expire in 15 minutes. If you did not request this, please ignore this email to keep your account secure.</p>
            </div>
            """
        })
        print(f"Email sent successfully: {response}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False