from fastapi import APIRouter
from .. import schemas
from ..category_constants import PREDEFINED_CATEGORIES

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=schemas.CategoriesResponse)
def list_categories():
    return {"categories": PREDEFINED_CATEGORIES}
