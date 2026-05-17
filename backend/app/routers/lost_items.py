import traceback

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from .. import models, schemas
from ..category_constants import validate_category_input
from ..dependencies import get_db, get_current_user
from ..utils.file_upload import save_upload_file
from ..utils.serializers import serialize_lost_item
from ..utils.file_upload import delete_upload_file
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/lost-items", tags=["Lost Items"])


def _log_loaded_item(prefix: str, item: models.LostItem) -> None:
    category = getattr(item, "category", None)
    user = getattr(item, "user", None)
    print(
        f"{prefix} lost_item id={getattr(item, 'id', None)} status={getattr(item, 'status', None)} "
        f"category_id={getattr(item, 'category_id', None)} user_id={getattr(item, 'user_id', None)} "
        f"category_loaded={category is not None} user_loaded={user is not None}"
    )


def _safe_iso(value):
    if value is None:
        return None
    return value.isoformat() if hasattr(value, "isoformat") else str(value)


def _safe_enum_value(value):
    if value is None:
        return None
    return value.value if hasattr(value, "value") else str(value)


def _serialize_lost_item_for_list(item: models.LostItem) -> dict:
    return serialize_lost_item(item) or {}


def _repair_invalid_lost_item_statuses(db: Session) -> None:
    db.execute(
        text(
            "UPDATE lost_items SET status = 'LOST' "
            "WHERE status IS NULL OR status NOT IN ('LOST', 'FOUND', 'CLOSED')"
        )
    )
    db.commit()


def _get_category_or_404(db: Session, category_id) -> models.Category:
    category_value = str(category_id).strip() if category_id is not None else ""
    if not category_value:
        raise HTTPException(status_code=400, detail="Category is required")

    category = db.query(models.Category).filter(models.Category.id == category_value).first()
    if category:
        return category

    try:
        category_name = validate_category_input(category_value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid category") from exc

    category = db.query(models.Category).filter(models.Category.name == category_name).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category")
    return category


@router.get("", response_model=List[schemas.LostItemOut])
def list_lost_items(
    search: Optional[str] = None,
    category_id: Optional[str] = None,
    status: Optional[schemas.LostItemStatus] = None,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """List all lost items with optional search/filter."""
    try:
        q = db.query(models.LostItem).options(
            joinedload(models.LostItem.category),
            joinedload(models.LostItem.user),
        )
        if search:
            q = q.filter(models.LostItem.title.ilike(f"%{search}%"))
        if category_id:
            q = q.filter(models.LostItem.category_id == category_id)
        if status:
            q = q.filter(models.LostItem.status == status)
        items = q.order_by(models.LostItem.created_at.desc()).all()
        print(f"Fetched {len(items)} lost items")
        for item in items:
            _log_loaded_item("LIST", item)
        return JSONResponse(status_code=200, content=[_serialize_lost_item_for_list(item) for item in items])
    except Exception as exc:
        db.rollback()
        print(f"GET /lost-items ERROR: {str(exc)}")
        traceback.print_exc()
        try:
            _repair_invalid_lost_item_statuses(db)
            items = (
                db.query(models.LostItem)
                .options(
                    joinedload(models.LostItem.category),
                    joinedload(models.LostItem.user),
                )
                .order_by(models.LostItem.created_at.desc())
                .all()
            )
            print(f"GET /lost-items retry fetched {len(items)} items after repair")
            return JSONResponse(status_code=200, content=[_serialize_lost_item_for_list(item) for item in items])
        except Exception as retry_exc:
            db.rollback()
            print(f"GET /lost-items retry failed: {str(retry_exc)}")
            traceback.print_exc()
            return JSONResponse(status_code=500, content={"success": False, "message": str(retry_exc)})


@router.post("", status_code=201)
async def create_lost_item(
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Report a lost item."""
    payload_data = None
    image = None
    image_url = None
    try:
        form = await request.form()
        payload_data = {key: value for key, value in form.items() if key != "image"}
        image = form.get("image")
        print("Incoming lost item payload:", payload_data)
        print("Incoming lost item image:", getattr(image, "filename", None))
        payload = schemas.LostItemCreate.model_validate(payload_data)
    except ValidationError as exc:
        db.rollback()
        print("Create lost item validation failed:", payload_data)
        print("Create lost item validation errors:", exc.errors())
        traceback.print_exc()
        logger.warning(
            "Create lost item validation failed payload=%s errors=%s",
            payload_data,
            exc.errors(),
            exc_info=True,
        )
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": "Validation failed", "detail": exc.errors()},
        )
    except Exception as exc:
        db.rollback()
        print("Create lost item payload parsing failed:", payload_data)
        print("Create lost item payload parsing error:", str(exc))
        traceback.print_exc()
        logger.exception("Create lost item request parsing failed payload=%s", payload_data)
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": "Invalid request payload", "detail": str(exc)},
        )

    try:
        category = _get_category_or_404(db, payload.category_id)
        status = models.LostItemStatus.LOST
        print("Creating lost item with status:", status)

        if image and getattr(image, "filename", None):
            image_url = await save_upload_file(image)

        item = models.LostItem(
            title=payload.title,
            description=payload.description,
            category_id=category.id,
            user_id=current_user.id,
            location=payload.location,
            date_lost=payload.date_lost,
            status=status,
            image_url=image_url,
        )
        db.add(item)
        db.commit()
        item = (
            db.query(models.LostItem)
            .options(
                joinedload(models.LostItem.category),
                joinedload(models.LostItem.user),
            )
            .filter(models.LostItem.id == item.id)
            .first()
        )
        print(f"Created lost item id={getattr(item, 'id', None)}")
        _log_loaded_item("CREATE", item)
        return JSONResponse(status_code=201, content=_serialize_lost_item_for_list(item))
    except HTTPException as exc:
        db.rollback()
        print(f"Create lost item validation failed: {str(exc.detail)}")
        traceback.print_exc()
        return JSONResponse(status_code=exc.status_code, content={"success": False, "message": str(exc.detail), "detail": exc.detail})
    except SQLAlchemyError as exc:
        db.rollback()
        if image_url:
            try:
                delete_upload_file(image_url)
            except Exception:
                pass
        print("Create lost item SQLAlchemy error:", str(exc))
        print("Create lost item payload at SQLAlchemy failure:", payload_data)
        traceback.print_exc()
        logger.exception(
            "Create lost item SQLAlchemy failure payload=%s user_id=%s",
            payload_data,
            getattr(current_user, "id", None),
        )
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": "Failed to create lost item", "detail": str(exc)},
        )
    except Exception as exc:
        db.rollback()
        if image_url:
            try:
                delete_upload_file(image_url)
            except Exception:
                pass
        print(f"Create lost item error: {str(exc)}")
        print("Create lost item payload at unexpected failure:", payload_data)
        traceback.print_exc()
        logger.exception(
            "Unexpected create lost item failure payload=%s user_id=%s",
            payload_data,
            getattr(current_user, "id", None),
        )
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
            .options(
                joinedload(models.LostItem.category),
                joinedload(models.LostItem.user),
            )
            .filter(models.LostItem.user_id == current_user.id)
            .order_by(models.LostItem.created_at.desc())
            .all()
        )
        print(f"Fetched {len(items)} my lost items for user_id={current_user.id}")
        for item in items:
            _log_loaded_item("MY", item)
        return JSONResponse(status_code=200, content=[_serialize_lost_item_for_list(item) for item in items])
    except Exception as exc:
        db.rollback()
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
        item = (
            db.query(models.LostItem)
            .options(
                joinedload(models.LostItem.category),
                joinedload(models.LostItem.user),
            )
            .filter(models.LostItem.id == item_id)
            .first()
        )
        if not item:
            raise HTTPException(status_code=404, detail="Lost item not found")
        _log_loaded_item("GET", item)
        return JSONResponse(status_code=200, content=_serialize_lost_item_for_list(item))
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
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
        item = (
            db.query(models.LostItem)
            .options(
                joinedload(models.LostItem.category),
                joinedload(models.LostItem.user),
            )
            .filter(models.LostItem.id == item_id)
            .first()
        )
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
        item = (
            db.query(models.LostItem)
            .options(
                joinedload(models.LostItem.category),
                joinedload(models.LostItem.user),
            )
            .filter(models.LostItem.id == item_id)
            .first()
        )
        _log_loaded_item("UPDATE", item)
        return JSONResponse(status_code=200, content=_serialize_lost_item_for_list(item))
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
        item = (
            db.query(models.LostItem)
            .options(
                joinedload(models.LostItem.category),
                joinedload(models.LostItem.user),
            )
            .filter(models.LostItem.id == item_id)
            .first()
        )
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
