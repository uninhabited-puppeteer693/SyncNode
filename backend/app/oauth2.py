from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

# Cryptographic Constants
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# Defines the Swagger UI authentication hook
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def create_access_token(data: dict) -> str:
    """
    Generates a short-lived JSON Web Token (JWT) for standard API authentication.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Explicitly type the token to prevent token substitution attacks
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """
    Generates a long-lived JSON Web Token (JWT) strictly used for session renewal.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    # Strict typing ensures this token cannot be utilized as an access token
    to_encode.update({"exp": expire, "type": "refresh"}) 
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt


def verify_refresh_token(token: str, credentials_exception: HTTPException) -> str:
    """
    Decodes and validates a refresh token.
    Raises an HTTP exception if the token is invalid, expired, or of the wrong type.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        token_type = payload.get("type")
        
        if user_id is None or token_type != "refresh":
            raise credentials_exception
            
        return user_id
    except JWTError:
        raise credentials_exception
    

def verify_token(token: str, credentials_exception: HTTPException) -> str:
    """
    Decodes and validates a standard access token.
    Enforces strict token typing to prevent refresh tokens from authorizing standard endpoints.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id") 
        token_type = payload.get("type")
        
        if user_id is None or token_type != "access":
            raise credentials_exception
            
        return user_id
    except JWTError:
        raise credentials_exception


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    FastAPI dependency that extracts, validates, and retrieves the authenticated user entity.
    Injects the validated user directly into endpoint route handlers.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    user_id = verify_token(token, credentials_exception)
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if user is None:
        raise credentials_exception
        
    return user