"""
Database Teardown Utility.
Completely wipes the database schema, dropping all tables and resetting 
the Alembic migration history. Use with extreme caution.
"""
from sqlalchemy import text

from app.db.base import Base
from app.db.session import engine

# Import all models to ensure they are registered with Base.metadata before dropping
from app.models.auth import UserAuth
from app.models.company import Company
from app.models.issues import Issue
from app.models.logs import IssueLog
from app.models.user import User


def nuke():
    print("🧨 WARNING: Initiating total database teardown...")
    confirmation = input("Type 'NUKE' to confirm destruction of all data: ")
    
    if confirmation != 'NUKE':
        print("Teardown aborted. Your data is safe.")
        return

    # 1. Drop all tables associated with SQLAlchemy models
    Base.metadata.drop_all(bind=engine)
    
    # 2. Drop the alembic_version table to reset migration tracking
    with engine.connect() as connection:
        connection.execute(text("DROP TABLE IF EXISTS alembic_version"))
        connection.commit()
        
    print("✅ Database wiped successfully! All tables and Alembic history removed.")

if __name__ == "__main__":
    nuke()