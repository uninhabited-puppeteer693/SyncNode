"""
Database connection and session management.
Initializes the SQLAlchemy engine and provides the dependency for FastAPI route injection.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Initialize the core database engine.
# pool_pre_ping=True ensures dropped cloud database connections are automatically recycled.
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True
)

# Configure the session factory.
# Strict manual transaction management is enforced via autocommit=False.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    FastAPI dependency that yields a database session for a single HTTP request context.
    
    Implements a generator pattern to ensure the database session is safely 
    and automatically closed after the request lifecycle completes, preventing connection leaks.
    
    Yields:
        Session: An active SQLAlchemy database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()