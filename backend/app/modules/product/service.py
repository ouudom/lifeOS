from typing import List, Optional
import uuid
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.modules.product.models import Product
from app.modules.product.schemas import ProductCreate, ProductUpdate

class ProductService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, product_in: ProductCreate) -> Product:
        product = Product.model_validate(product_in)
        self.session.add(product)
        await self.session.commit()
        await self.session.refresh(product)
        return product

    async def get(self, product_id: uuid.UUID) -> Optional[Product]:
        return await self.session.get(Product, product_id)

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Product]:
        statement = select(Product).offset(skip).limit(limit)
        result = await self.session.exec(statement)
        return result.all()

    async def update(self, product_id: uuid.UUID, product_in: ProductUpdate) -> Optional[Product]:
        product = await self.get(product_id)
        if not product:
            return None
        
        update_data = product_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(product, key, value)
            
        self.session.add(product)
        await self.session.commit()
        await self.session.refresh(product)
        return product

    async def delete(self, product_id: uuid.UUID) -> bool:
        product = await self.get(product_id)
        if not product:
            return False
        
        await self.session.delete(product)
        await self.session.commit()
        return True
