import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, schemas
from ..dependencies import get_db, get_current_user, admin_only

router = APIRouter(prefix="/claims", tags=["Claims"])


def _create_notification(db: Session, recipient_user_id: str, message: str, **kwargs):
    notif = models.Notification(
        id=str(uuid.uuid4()),
        recipient_user_id=recipient_user_id,
        message=message,
        **kwargs
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
    
    _create_notification(
        db, 
        recipient_user_id=found_item.user_id,
        message=f"{current_user.name} submitted a claim for your item: '{found_item.title}'.\nProof: {payload.description or 'No proof provided'}",
        sender_user_id=current_user.id,
        title="New Claim Request",
        type="CLAIM_REQUEST",
        related_claim_id=claim.id,
        related_item_id=found_item.id
    )
    
    db.commit()
    return claim


@router.get("", response_model=List[schemas.ClaimOut])
def list_all_claims(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Admin: list all claims. Student: list claims for items they found."""
    if current_user.role == models.Role.ADMIN:
        return db.query(models.Claim).order_by(models.Claim.created_at.desc()).all()
    else:
        return (
            db.query(models.Claim)
            .join(models.FoundItem)
            .filter(models.FoundItem.user_id == current_user.id)
            .order_by(models.Claim.created_at.desc())
            .all()
        )


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


@router.post("/{claim_id}/approve")
def approve_claim(
    claim_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Approve a claim, update item status, notify claimant."""
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.found_item.user_id != current_user.id and current_user.role != models.Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to manage this claim")
        
    claim.status = models.ClaimStatus.APPROVED
    claim.found_item.status = models.FoundItemStatus.CLAIMED
    
    _create_notification(
        db, claim.claimant_id,
        message=f"✅ Your claim for '{claim.found_item.title}' was APPROVED! Please contact the finder to collect your item.",
        sender_user_id=current_user.id,
        title="Claim Approved",
        type="CLAIM_APPROVED",
        related_claim_id=claim.id,
        related_item_id=claim.found_item.id
    )
    db.commit()
    db.refresh(claim)
    return {
        "success": True,
        "message": "Claim approved"
    }

@router.post("/{claim_id}/reject")
def reject_claim(
    claim_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Reject a claim, notify claimant."""
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.found_item.user_id != current_user.id and current_user.role != models.Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to manage this claim")
        
    claim.status = models.ClaimStatus.REJECTED
    
    _create_notification(
        db, claim.claimant_id,
        message=f"❌ Your claim for '{claim.found_item.title}' was REJECTED.",
        sender_user_id=current_user.id,
        title="Claim Rejected",
        type="CLAIM_REJECTED",
        related_claim_id=claim.id,
        related_item_id=claim.found_item.id
    )
    db.commit()
    db.refresh(claim)
    return {
        "success": True,
        "message": "Claim rejected"
    }
