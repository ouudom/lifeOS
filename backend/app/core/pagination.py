from typing import Any, Dict, List, Tuple
from app.core.schemas import BaseResponse

def pagination_helper(data: List[Any], page: int, limit: int, total_items: int):
    """
    Calculate pagination result.
    """
    total_pages = (total_items + limit - 1) // limit
    
    return {
        "current_page": page,
        "total_pages": total_pages,
        "total_items": total_items,
        "current_items": len(data),
        "limit": limit
    }
