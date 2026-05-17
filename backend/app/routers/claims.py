import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, schemas
from ..dependencies import get_db, get_current_user, admin_only

router = APIRouter(prefix="/claims", tags=["Claims"])


def _create_notification(db: Session, user_id: str, message: str):
    notif = models.Notification(
        id=str(uuid.uuid4()),
        user_id=user_id,
        message=message,
    )
    db.add(notif)


@router.post("", response_model=schemas.ClaimOut, status_code=201)
def submit_claim(
    payload: schemas.ClaimCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Student submits a claim on a found item."""
    found_item = db.query(models.FoundItem).filter(models.FoundItem.id == payload.found_item_id).first()
    if not found_item:
        raise HTTPException(status_code=404, detail="Found item not found")
    if found_item.status == models.FoundItemStatus.CLAIMED:
        raise HTTPException(status_code=400, detail="This item has already been claimed")

    # Prevent duplicate pending claim
    existing = db.query(models.Claim).filter(
        models.Claim.found_item_id == payload.found_item_id,
        models.Claim.claimant_id == current_user.id,
        models.Claim.status == models.ClaimStatus.PENDING,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have a pending claim for this item")

    claim = models.Claim(
        found_item_id=payload.found_item_id,
        claimant_id=current_user.id,
        description=payload.description,
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim


@router.get("", response_model=List[schemas.ClaimOut])
def list_all_claims(
    db: Session = Depends(get_db),
    _: models.User = Depends(admin_only),
):
    """Admin: list all claims."""
    return db.query(models.Claim).order_by(models.Claim.created_at.desc()).all()


@router.get("/my", response_model=List[schemas.ClaimOut])
def my_claims(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Student: list my submitted claims."""
    return (
        db.query(models.Claim)
        .filter(models.Claim.claimant_id == current_user.id)
        .order_by(models.Claim.created_at.desc())
        .all()
    )


@router.put("/{claim_id}", response_model=schemas.ClaimOut)
def update_claim_status(
    claim_id: str,
    payload: schemas.ClaimUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(admin_only),
):
    """Admin: approve or reject a claim. Trigger handles found_item status update."""
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    old_status = claim.status
    claim.status = payload.status
    claim.updated_at = datetime.utcnow()

    # Application-level side effects (PostgreSQL trigger also handles this as DB safety net)
    if payload.status == models.ClaimStatus.APPROVED and old_status != models.ClaimStatus.APPROVED:
        claim.found_item.status = models.FoundItemStatus.CLAIMED
        _create_notification(
            db, claim.claimant_id,
            f"✅ Your claim for '{claim.found_item.title}' has been APPROVED! Please collect your item."
        )
    elif payload.status == models.ClaimStatus.REJECTED and old_status != models.ClaimStatus.REJECTED:
        _create_notification(
            db, claim.claimant_id,
            f"❌ Your claim for '{claim.found_item.title}' has been REJECTED. Contact admin for details."
        )

    db.commit()
    db.refresh(claim)
    return claim
