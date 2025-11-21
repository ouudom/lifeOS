from typing import Generic, TypeVar, Optional, List, Any
from pydantic import BaseModel

T = TypeVar("T")

class BaseResponse(BaseModel, Generic[T]):
    status: str = "success"
    code: int = 200
    message: str = "Operation successful"
    data: Optional[T] = None

class ErrorResponse(BaseModel):
    status: str = "error"
    code: int
    message: str
    errors: Optional[List[Any]] = None
