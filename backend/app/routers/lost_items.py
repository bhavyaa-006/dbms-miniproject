from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from .. import models, schemas
from ..dependencies import get_db, get_current_user
from ..utils.file_upload import save_upload_file, delete_upload_file

router = APIRouter(prefix="/lost-items", tags=["Lost Items"])


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
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category_id: str = Form(...),
    location: Optional[str] = Form(None),
    date_lost: date = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Report a lost item (with optional image upload)."""
    image_url = None
    if image and image.filename:
        image_url = await save_upload_file(image)

    item = models.LostItem(
        title=title,
        description=description,
        category_id=category_id,
        user_id=current_user.id,
        location=location,
        date_lost=date_lost,
        image_url=image_url,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


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
    if category_id:
        item.category_id = category_id
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
