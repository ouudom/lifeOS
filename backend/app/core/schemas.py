from typing import Generic, TypeVar, Optional, List, Any, Dict
from pydantic import BaseModel

T = TypeVar("T")

class BaseResponse(BaseModel, Generic[T]):
    status: str = "success"
    code: int = 200
    message: str = "Operation successful"
    data: Optional[T] = None
    metadata: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    status: str = "error"
    code: int
    message: str
    errors: Optional[List[Any]] = None
