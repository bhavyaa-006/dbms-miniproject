from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..dependencies import get_db, get_current_user
from ..utils.serializers import serialize_notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[schemas.NotificationOut])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get all notifications for the current user (newest first)."""
    try:
        # Eager load relationships to prevent lazy-loading serialization errors
        from sqlalchemy.orm import joinedload
        notifications = (
            db.query(models.Notification)
            .options(
                joinedload(models.Notification.sender),
                joinedload(models.Notification.related_claim).joinedload(models.Claim.found_item).joinedload(models.FoundItem.user),
                joinedload(models.Notification.related_claim).joinedload(models.Claim.claimant),
                joinedload(models.Notification.related_claim).joinedload(models.Claim.found_item).joinedload(models.FoundItem.category),
                joinedload(models.Notification.related_item).joinedload(models.FoundItem.user),
                joinedload(models.Notification.related_item).joinedload(models.FoundItem.category),
            )
            .filter(models.Notification.recipient_user_id == current_user.id)
            .order_by(models.Notification.created_at.desc())
            .all()
        )
        return JSONResponse(status_code=200, content=[serialize_notification(notification) for notification in notifications])
    except Exception as e:
        print(f"Error fetching notifications: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error while fetching notifications")


@router.put("/{notif_id}/read", response_model=schemas.NotificationOut)
def mark_read(
    notif_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Mark a notification as read."""
    try:
        from sqlalchemy.orm import joinedload

        notif = (
            db.query(models.Notification)
            .options(
                joinedload(models.Notification.sender),
                joinedload(models.Notification.related_claim).joinedload(models.Claim.found_item).joinedload(models.FoundItem.user),
                joinedload(models.Notification.related_claim).joinedload(models.Claim.claimant),
                joinedload(models.Notification.related_claim).joinedload(models.Claim.found_item).joinedload(models.FoundItem.category),
                joinedload(models.Notification.related_item).joinedload(models.FoundItem.user),
                joinedload(models.Notification.related_item).joinedload(models.FoundItem.category),
            )
            .filter(
                models.Notification.id == notif_id,
                models.Notification.recipient_user_id == current_user.id,
            )
            .first()
        )
        if not notif:
            raise HTTPException(status_code=404, detail="Notification not found")
        notif.is_read = True
        db.commit()
        notif = (
            db.query(models.Notification)
            .options(
                joinedload(models.Notification.sender),
                joinedload(models.Notification.related_claim).joinedload(models.Claim.found_item).joinedload(models.FoundItem.user),
                joinedload(models.Notification.related_claim).joinedload(models.Claim.claimant),
                joinedload(models.Notification.related_claim).joinedload(models.Claim.found_item).joinedload(models.FoundItem.category),
                joinedload(models.Notification.related_item).joinedload(models.FoundItem.user),
                joinedload(models.Notification.related_item).joinedload(models.FoundItem.category),
            )
            .filter(models.Notification.id == notif_id)
            .first()
        )
        return JSONResponse(status_code=200, content=serialize_notification(notif))
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        import traceback
        print(f"Error marking notification read: {str(exc)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error while updating notification")


@router.put("/read-all", response_model=dict)
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Mark all notifications as read."""
    db.query(models.Notification).filter(
        models.Notification.recipient_user_id == current_user.id,
        models.Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}
