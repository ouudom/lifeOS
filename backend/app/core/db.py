from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlmodel import SQLModel
from app.core.config import settings

# Synchronous engine used by Alembic for migrations
sync_engine = create_engine(
    str(settings.DATABASE_URL).replace("+asyncpg", "").replace("+aiosqlite", ""),
    echo=True,
    future=True,
)

# Conditional asynchronous engine for the application
if "+asyncpg" in settings.DATABASE_URL or "+aiosqlite" in settings.DATABASE_URL:
    async_engine = create_async_engine(
        str(settings.DATABASE_URL), echo=True, future=True
    )
    async_session_factory = sessionmaker(
        async_engine, class_=AsyncSession, expire_on_commit=False
    )
else:
    async_engine = None
    async_session_factory = None


# Base class for all SQLModel models (used by Alembic)
class Base(SQLModel):
    pass


# Session factory for async usage.
# This factory creates AsyncSession objects for interacting with the database.
# Create async session factory only if async_engine is available
if async_engine is not None:
    async_session = sessionmaker(
        async_engine, class_=AsyncSession, expire_on_commit=False
    )
else:
    async_session = None


# Dependency to get an asynchronous database session.
# This function can be used with FastAPI's Depends to inject a session into route handlers.
async def get_session() -> AsyncSession:
    if async_session is None:
        raise RuntimeError("Async engine not configured for the current DATABASE_URL")
    async with async_session() as session:
        yield session
