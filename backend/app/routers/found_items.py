from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from .. import models, schemas
from ..dependencies import get_db, get_current_user
from ..utils.file_upload import save_upload_file, delete_upload_file
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/found-items", tags=["Found Items"])


def _get_category_or_404(db: Session, category_id) -> models.Category:
    category = db.query(models.Category).filter(models.Category.id == str(category_id)).first()
    if not category:
        raise HTTPException(status_code=422, detail="Invalid category")
    return category


@router.get("", response_model=List[schemas.FoundItemOut])
def list_found_items(
    search: Optional[str] = None,
    category_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """List all found items with optional search/filter."""
    q = db.query(models.FoundItem)
    if search:
        q = q.filter(models.FoundItem.title.ilike(f"%{search}%"))
    if category_id:
        q = q.filter(models.FoundItem.category_id == category_id)
    if status:
        q = q.filter(models.FoundItem.status == status)
    return q.order_by(models.FoundItem.created_at.desc()).all()


@router.post("", response_model=schemas.FoundItemOut, status_code=201)
async def create_found_item(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category_id: str = Form(...),
    location: Optional[str] = Form(None),
    date_found: date = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Report a found item (with optional image upload)."""
    try:
        image_url = None
        if image and image.filename:
            image_url = await save_upload_file(image)

        category = _get_category_or_404(db, category_id)

        item = models.FoundItem(
            title=title,
            description=description,
            category_id=category.id,
            user_id=current_user.id,
            location=location,
            date_found=date_found,
            image_url=image_url,
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return item
    except Exception as exc:
        db.rollback()
        logger.exception("Failed to create found item title=%s user_id=%s", title, current_user.id)
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Failed to report found item"},
        )


@router.get("/my", response_model=List[schemas.FoundItemOut])
def my_found_items(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.FoundItem)
        .filter(models.FoundItem.user_id == current_user.id)
        .order_by(models.FoundItem.created_at.desc())
        .all()
    )


@router.get("/{item_id}", response_model=schemas.FoundItemOut)
def get_found_item(
    item_id: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    item = db.query(models.FoundItem).filter(models.FoundItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Found item not found")
    return item


@router.put("/{item_id}", response_model=schemas.FoundItemOut)
async def update_found_item(
    item_id: str,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category_id: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    date_found: Optional[date] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = db.query(models.FoundItem).filter(models.FoundItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Found item not found")
    if item.user_id != current_user.id and current_user.role != models.Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")

    if title:
        item.title = title
    if description is not None:
        item.description = description
    if category_id is not None:
        item.category_id = _get_category_or_404(db, category_id).id
    if location is not None:
        item.location = location
    if status:
        item.status = status
    if date_found:
        item.date_found = date_found
    if image and image.filename:
        if item.image_url:
            delete_upload_file(item.image_url)
        item.image_url = await save_upload_file(image)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
def delete_found_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = db.query(models.FoundItem).filter(models.FoundItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Found item not found")
    if item.user_id != current_user.id and current_user.role != models.Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if item.status in [models.FoundItemStatus.CLAIMED, models.FoundItemStatus.RETURNED]:
        raise HTTPException(status_code=400, detail="Resolved items cannot be deleted")
    if item.image_url:
        delete_upload_file(item.image_url)
    db.delete(item)
    db.commit()
