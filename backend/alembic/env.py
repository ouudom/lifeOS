from logging.config import fileConfig

# Use synchronous SQLAlchemy engine for Alembic migrations
from sqlalchemy import create_engine, pool

from alembic import context

from app.core.config import settings
from app.core.db import Base

# Alembic Config object
config = context.config

# Set up logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ----------------------------------------------------------------------
# Prepare a synchronous DB URL for migrations.
# settings.DATABASE_URL may contain '+asyncpg' for async usage.
# Alembic (and sync engine) expects a driver like 'postgresql' (psycopg2).
# Strip '+asyncpg' if present.
raw_url = settings.DATABASE_URL
if "+asyncpg" in raw_url:
    sync_url = raw_url.replace("+asyncpg", "")
else:
    sync_url = raw_url
config.set_main_option("sqlalchemy.url", sync_url)

# ----------------------------------------------------------------------
# Import all model modules so that their metadata is registered.
import importlib
import pkgutil


def import_all_models(package_name: str):
    package = importlib.import_module(package_name)
    for _, module_name, _ in pkgutil.iter_modules(package.__path__):
        try:
            importlib.import_module(f"{package_name}.{module_name}")
        except Exception:
            pass


import_all_models("app.modules")

# Explicitly import all models to ensure they're registered
from app.modules.habit.models import Habit, HabitEntry
from app.modules.journal.models import DailyJournal
from app.modules.plan.models import Plan
from app.modules.chat.models import Message

# Target metadata for autogeneration
target_metadata = Base.metadata


# ----------------------------------------------------------------------
def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    Configures the context with just a URL; no Engine needed.
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


# ----------------------------------------------------------------------
def run_migrations_online() -> None:
    """Run migrations in 'online' mode using a sync engine."""
    engine = create_engine(
        config.get_main_option("sqlalchemy.url"),
        poolclass=pool.NullPool,
    )
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


# ----------------------------------------------------------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
