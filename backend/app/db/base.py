"""
SQLAlchemy declarative base configuration.
Centralizes the Base class to prevent circular import dependencies across different models.
"""
from sqlalchemy.orm import declarative_base

Base = declarative_base()