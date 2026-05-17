from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from .. import models, schemas
from ..dependencies import get_db, get_current_user
from ..utils.file_upload import save_upload_file, delete_upload_file
from ..category_constants import DEFAULT_CATEGORY, normalize_category, PREDEFINED_CATEGORIES, validate_category_input
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/lost-items", tags=["Lost Items"])


def _resolve_category_name(db: Session, category: Optional[str], category_id: Optional[str], required: bool = False) -> str:
    if category is not None and category.strip():
        try:
            return validate_category_input(category)
        except ValueError:
            logger.warning("Invalid lost item category submitted: %s", category)
            return DEFAULT_CATEGORY

    if category_id:
        legacy_category = db.query(models.Category).filter(models.Category.id == category_id).first()
        if legacy_category and legacy_category.name:
            return normalize_category(legacy_category.name)

    if required:
        return DEFAULT_CATEGORY
    return DEFAULT_CATEGORY


@router.get("", response_model=List[schemas.LostItemOut])
def list_lost_items(
    search: Optional[str] = None,
    category: Optional[str] = None,
    category_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """List all lost items with optional search/filter."""
    q = db.query(models.LostItem)
    if search:
        q = q.filter(models.LostItem.title.ilike(f"%{search}%"))
    resolved_category = None
    if category is not None or category_id is not None:
        resolved_category = _resolve_category_name(db, category, category_id)
    if resolved_category:
        q = q.filter(models.LostItem.category == resolved_category)
    if status:
        q = q.filter(models.LostItem.status == status)
    return q.order_by(models.LostItem.created_at.desc()).all()


@router.post("", response_model=schemas.LostItemOut, status_code=201)
async def create_lost_item(
    request: Request,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    category_id: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    date_lost: date = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Report a lost item (with optional image upload)."""
    try:
        request_data = dict(await request.form())
        print("Incoming lost item payload:", request_data)
        logger.info("Incoming lost item payload: %s", request_data)

        image_url = None
        if image and image.filename:
            image_url = await save_upload_file(image)

        resolved_category = _resolve_category_name(db, category, category_id, required=True)

        item = models.LostItem(
            title=title,
            description=description,
            category=resolved_category,
            user_id=current_user.id,
            location=location,
            date_lost=date_lost,
            image_url=image_url,
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return item
    except Exception as exc:
        db.rollback()
        logger.exception("Failed to create lost item title=%s user_id=%s", title, current_user.id)
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Failed to report lost item"},
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
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    category_id: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    date_lost: Optional[date] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = db.query(models.LostItem).filter(models.LostItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Lost item not found")
    if item.user_id != current_user.id and current_user.role != models.Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")

    if title:
        item.title = title
    if description is not None:
        item.description = description
    if category is not None or category_id is not None:
        item.category = _resolve_category_name(db, category, category_id, required=True)
    if location is not None:
        item.location = location
    if status:
        item.status = status
    if date_lost:
        item.date_lost = date_lost
    if image and image.filename:
        if item.image_url:
            delete_upload_file(item.image_url)
        item.image_url = await save_upload_file(image)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
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
    if item.image_url:
        delete_upload_file(item.image_url)
    db.delete(item)
    db.commit()
