from typing import Optional
from sqlmodel import Field, SQLModel
from app.core.base import UUIDMixin, TimestampMixin

class ProductBase(SQLModel):
    name: str = Field(index=True)
    description: Optional[str] = None
    price: float = Field(default=0.0)
    is_active: bool = Field(default=True)

class Product(ProductBase, UUIDMixin, TimestampMixin, table=True):
    __tablename__ = "products"
