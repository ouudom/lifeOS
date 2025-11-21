from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.db import get_session
from app.core.schemas import BaseResponse
from app.modules.product.schemas import ProductCreate, ProductRead, ProductUpdate
from app.modules.product.service import ProductService

router = APIRouter()

async def get_service(session: AsyncSession = Depends(get_session)) -> ProductService:
    return ProductService(session)

@router.post("/", response_model=BaseResponse[ProductRead], status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    service: ProductService = Depends(get_service)
):
    product = await service.create(product_in)
    return BaseResponse(
        code=status.HTTP_201_CREATED,
        message="Product created successfully",
        data=product
    )

@router.get("/", response_model=BaseResponse[List[ProductRead]])
async def read_products(
    skip: int = 0,
    limit: int = 10,
    service: ProductService = Depends(get_service)
):
    products = await service.get_all(skip=skip, limit=limit)
    return BaseResponse(
        data=products,
        message="Products retrieved successfully"
    )

@router.get("/{product_id}", response_model=BaseResponse[ProductRead])
async def read_product(
    product_id: uuid.UUID,
    service: ProductService = Depends(get_service)
):
    product = await service.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return BaseResponse(data=product)

@router.patch("/{product_id}", response_model=BaseResponse[ProductRead])
async def update_product(
    product_id: uuid.UUID,
    product_in: ProductUpdate,
    service: ProductService = Depends(get_service)
):
    product = await service.update(product_id, product_in)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return BaseResponse(
        data=product,
        message="Product updated successfully"
    )

@router.delete("/{product_id}", response_model=BaseResponse[None])
async def delete_product(
    product_id: uuid.UUID,
    service: ProductService = Depends(get_service)
):
    success = await service.delete(product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return BaseResponse(
        message="Product deleted successfully",
        data=None
    )
