import sys
import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# ------------------------------------------------------------------
# Add the project root to the system path so Python can find 'app'
# ------------------------------------------------------------------
sys.path.append(os.getcwd())

# ------------------------------------------------------------------
# Import Settings and Models
# ------------------------------------------------------------------
from app.core.config import settings 
from app.models import Base

# MUST IMPORT ALL MODELS HERE so Alembic can detect them
from app.models import company  # 1. Companies
from app.models import user     # 2. Users
from app.models import auth     # 3. Auth
from app.models import issues   # 4. Issues
from app.models import logs     # 5. Logs

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ------------------------------------------------------------------
# DYNAMIC CONFIGURATION
# 1. Set the Database URL from our settings (not hardcoded in ini)
# 2. Set the target metadata to our SQLAlchemy Base
# ------------------------------------------------------------------
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()