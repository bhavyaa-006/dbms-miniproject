import traceback

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas
from ..dependencies import get_db, get_current_user
from ..utils.file_upload import delete_upload_file
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/lost-items", tags=["Lost Items"])


def _get_category_or_404(db: Session, category_id) -> models.Category:
    category = db.query(models.Category).filter(models.Category.id == str(category_id)).first()
    if not category:
        raise HTTPException(status_code=422, detail="Invalid category")
    return category


@router.get("", response_model=List[schemas.LostItemOut])
def list_lost_items(
    search: Optional[str] = None,
    category_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """List all lost items with optional search/filter."""
    q = db.query(models.LostItem)
    if search:
        q = q.filter(models.LostItem.title.ilike(f"%{search}%"))
    if category_id:
        q = q.filter(models.LostItem.category_id == category_id)
    if status:
        q = q.filter(models.LostItem.status == status)
    return q.order_by(models.LostItem.created_at.desc()).all()


@router.post("", response_model=schemas.LostItemOut, status_code=201)
async def create_lost_item(
    request: Request,
    payload: schemas.LostItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Report a lost item (with optional image upload)."""
    try:
        request_data = await request.json()
        print("Incoming lost item payload:", request_data)
        logger.info("Incoming lost item payload: %s", request_data)
        logger.info("Validated lost item payload: %s", payload.model_dump())

        logger.info("Attempting lost item database insert for user_id=%s", current_user.id)
        category = _get_category_or_404(db, payload.category_id)

        item = models.LostItem(
            title=payload.title,
            description=payload.description,
            category_id=category.id,
            user_id=current_user.id,
            location=payload.location,
            date_lost=payload.date_lost,
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        logger.info("Lost item inserted successfully id=%s user_id=%s", item.id, current_user.id)
        return item
    except SQLAlchemyError as exc:
        db.rollback()
        print("Lost item creation error:", str(exc))
        traceback.print_exc()
        logger.exception("SQLAlchemy error creating lost item user_id=%s", current_user.id)
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": str(exc)},
        )
    except Exception as exc:
        db.rollback()
        print("Lost item creation error:", str(exc))
        traceback.print_exc()
        logger.exception("Unexpected error creating lost item user_id=%s", current_user.id)
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": str(exc)},
        )


@router.get("/my", response_model=List[schemas.LostItemOut])
def my_lost_items(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get the current user's lost item reports."""
    return (
        db.query(models.LostItem)
        .filter(models.LostItem.user_id == current_user.id)
        .order_by(models.LostItem.created_at.desc())
        .all()
    )


@router.get("/{item_id}", response_model=schemas.LostItemOut)
def get_lost_item(
    item_id: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    item = db.query(models.LostItem).filter(models.LostItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Lost item not found")
    return item


@router.put("/{item_id}", response_model=schemas.LostItemOut)
async def update_lost_item(
    item_id: str,
    payload: schemas.LostItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = db.query(models.LostItem).filter(models.LostItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Lost item not found")
    if item.user_id != current_user.id and current_user.role != models.Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")

    if payload.title is not None:
        item.title = payload.title
    if payload.description is not None:
        item.description = payload.description
    if payload.category_id is not None:
        item.category_id = _get_category_or_404(db, payload.category_id).id
    if payload.location is not None:
        item.location = payload.location
    if payload.status is not None:
        item.status = payload.status
    if payload.date_lost is not None:
        item.date_lost = payload.date_lost

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_lost_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = db.query(models.LostItem).filter(models.LostItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Lost item not found")
    if item.user_id != current_user.id and current_user.role != models.Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if item.status in [models.LostItemStatus.FOUND, models.LostItemStatus.CLOSED]:
        raise HTTPException(status_code=400, detail="Resolved items cannot be deleted")
        
    if item.image_url:
        delete_upload_file(item.image_url)
        
    db.delete(item)
    db.commit()
    
    return {
        "success": True,
        "message": "Lost item deleted successfully"
    }
