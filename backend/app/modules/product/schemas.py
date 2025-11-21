from typing import Optional
import uuid
from datetime import datetime
from sqlmodel import SQLModel
from app.modules.product.models import ProductBase

class ProductCreate(ProductBase):
    pass

class ProductUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None

class ProductRead(ProductBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
