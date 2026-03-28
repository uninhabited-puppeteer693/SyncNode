from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Core application configuration settings.
    Automatically loads variables from the system environment or a .env file.
    """
    
    # Project Metadata
    PROJECT_NAME: str = "SyncNode"
    PROJECT_VERSION: str = "1.0.0"

    # Database Configuration
    DATABASE_URL: str

    # Security & Authentication Configuration
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Third-Party API Keys
    RESEND_API_KEY: str | None = None

    # Modern Pydantic v2 configuration
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"  # Safely ignores extra variables in the .env file
    )

# Global settings instance to be imported across the application
settings = Settings()