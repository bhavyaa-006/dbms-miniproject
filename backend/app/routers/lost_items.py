import traceback

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas
from ..dependencies import get_db, get_current_user
from ..utils.file_upload import delete_upload_file
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/lost-items", tags=["Lost Items"])


def serialize_lost_item(item):
    if not item: return None
    return {
        "id": str(item.id) if item.id else None,
        "title": item.title,
        "description": item.description,
        "location": item.location,
        "date_lost": item.date_lost.isoformat() if getattr(item, 'date_lost', None) else None,
        "time_lost": item.time_lost.isoformat() if getattr(item, 'time_lost', None) else None,
        "status": item.status.value if hasattr(item.status, 'value') else str(item.status) if item.status else None,
        "image_url": item.image_url,
        "created_at": item.created_at.isoformat() if getattr(item, 'created_at', None) else None,
        "updated_at": item.updated_at.isoformat() if getattr(item, 'updated_at', None) else None,
        "user_id": str(item.user_id) if item.user_id else None,
        "category_id": str(item.category_id) if getattr(item, 'category_id', None) else None,
        "category": {
            "id": str(item.category.id) if getattr(item.category, 'id', None) else "",
            "name": getattr(item.category, 'name', "")
        } if getattr(item, 'category', None) else None,
        "user": {
            "id": str(item.user.id) if getattr(item.user, 'id', None) else "",
            "name": getattr(item.user, 'name', ""),
            "email": getattr(item.user, 'email', "")
        } if getattr(item, 'user', None) else None
    }


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
    try:
        q = db.query(models.LostItem)
        if search:
            q = q.filter(models.LostItem.title.ilike(f"%{search}%"))
        if category_id:
            q = q.filter(models.LostItem.category_id == category_id)
        if status:
            q = q.filter(models.LostItem.status == status)
        items = q.order_by(models.LostItem.created_at.desc()).all()
        return JSONResponse(status_code=200, content=[serialize_lost_item(item) for item in items])
    except Exception as exc:
        print(f"Lost items query failed: {str(exc)}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"success": False, "message": "Internal server error"})


@router.post("", status_code=201)
async def create_lost_item(
    payload: schemas.LostItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Report a lost item."""
    try:
        category = db.query(models.Category).filter(models.Category.id == payload.category_id).first()
        if not category:
            category = _get_category_or_404(db, payload.category_id)

        item = models.LostItem(
            title=payload.title,
            description=payload.description,
            category_id=category.id,
            user_id=current_user.id,
            location=payload.location,
            date_lost=payload.date_lost,
            status=models.LostItemStatus.LOST
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return JSONResponse(status_code=201, content=serialize_lost_item(item))
    except Exception as exc:
        db.rollback()
        print(f"Create lost item error: {str(exc)}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"success": False, "message": "Internal server error"})


@router.get("/my")
def my_lost_items(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get the current user's lost item reports."""
    try:
        items = (
            db.query(models.LostItem)
            .filter(models.LostItem.user_id == current_user.id)
            .order_by(models.LostItem.created_at.desc())
            .all()
        )
        return JSONResponse(status_code=200, content=[serialize_lost_item(item) for item in items])
    except Exception as exc:
        print(f"My lost items query failed: {str(exc)}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"success": False, "message": "Internal server error"})


@router.get("/{item_id}")
def get_lost_item(
    item_id: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    try:
        item = db.query(models.LostItem).filter(models.LostItem.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Lost item not found")
        return JSONResponse(status_code=200, content=serialize_lost_item(item))
    except HTTPException:
        raise
    except Exception as exc:
        print(f"Get lost item failed: {str(exc)}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"success": False, "message": "Internal server error"})


@router.put("/{item_id}")
async def update_lost_item(
    item_id: str,
    payload: schemas.LostItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        item = db.query(models.LostItem).filter(models.LostItem.id == item_id).first()
        if not item:
            return JSONResponse(status_code=404, content={"success": False, "message": "Lost item not found"})
            
        if item.user_id != current_user.id and current_user.role != models.Role.ADMIN:
            return JSONResponse(status_code=403, content={"success": False, "message": "Not authorized"})

        if payload.title is not None:
            item.title = payload.title
        if payload.description is not None:
            item.description = payload.description
        if payload.category_id is not None:
            category = db.query(models.Category).filter(models.Category.id == str(payload.category_id)).first()
            if category:
                item.category_id = category.id
        if payload.location is not None:
            item.location = payload.location
        if payload.status is not None:
            item.status = payload.status
        if payload.date_lost is not None:
            item.date_lost = payload.date_lost

        db.commit()
        db.refresh(item)
        return JSONResponse(status_code=200, content=serialize_lost_item(item))
    except Exception as exc:
        db.rollback()
        print(f"Update lost item error: {str(exc)}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"success": False, "message": "Internal server error"})


@router.delete("/{item_id}")
def delete_lost_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        item = db.query(models.LostItem).filter(models.LostItem.id == item_id).first()
        if not item:
            return JSONResponse(status_code=404, content={"success": False, "message": "Lost item not found"})
            
        if item.user_id != current_user.id and current_user.role != models.Role.ADMIN:
            return JSONResponse(status_code=403, content={"success": False, "message": "Not authorized"})
            
        if item.status in [models.LostItemStatus.FOUND, models.LostItemStatus.CLOSED]:
            return JSONResponse(status_code=400, content={"success": False, "message": "Resolved items cannot be deleted"})
            
        if item.image_url:
            try:
                delete_upload_file(item.image_url)
            except Exception:
                pass # Ignore missing files
            
        db.delete(item)
        db.commit()
        return JSONResponse(status_code=200, content={"success": True, "message": "Lost item deleted successfully"})
    except Exception as exc:
        db.rollback()
        print(f"Delete lost item error: {str(exc)}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"success": False, "message": "Internal server error"})
