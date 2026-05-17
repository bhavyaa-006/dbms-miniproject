import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, schemas
from ..dependencies import get_db, get_current_user, admin_only

router = APIRouter(prefix="/claims", tags=["Claims"])
logger = logging.getLogger(__name__)


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
    import traceback
    from fastapi.responses import JSONResponse
    
    print("================ DEBUG: APPROVE ENDPOINT ================")
    print("Approve endpoint hit")
    print("Claim ID:", claim_id)
    print("Current user:", current_user.id)
    
    try:
        claim = db.query(models.Claim).filter(models.Claim.id == str(claim_id)).first()
        if not claim:
            print("ERROR: Claim not found")
            return JSONResponse(status_code=404, content={"success": False, "message": "Claim not found", "detail": "Claim not found"})
            
        print("Fetched claim ID:", claim.id)
        
        # Verify relationships
        if not getattr(claim, "found_item", None):
            print("ERROR: Associated found_item is None")
            return JSONResponse(status_code=404, content={"success": False, "message": "Associated item missing", "detail": "Associated item missing"})
        if not getattr(claim, "claimant", None):
            print("ERROR: Associated claimant is None")
            return JSONResponse(status_code=404, content={"success": False, "message": "Claimant missing", "detail": "Claimant missing"})
            
        item = claim.found_item
        print("Fetched item ID:", item.id)
        print("Item owner ID:", item.user_id)
            
        # Verify ownership
        if str(item.user_id) != str(current_user.id) and current_user.role != models.Role.ADMIN:
            print(f"ERROR: Authorization failed. Item owner is {item.user_id}, current user is {current_user.id}")
            return JSONResponse(status_code=403, content={"success": False, "message": "Not authorized to manage this claim", "detail": "Not authorized to manage this claim"})
            
        print("Ownership validated successfully.")
            
        # Update statuses
        claim.status = models.ClaimStatus.APPROVED
        item.status = models.FoundItemStatus.CLAIMED
        
        print("Statuses updated. Creating notification...")
        
        # Notification creation safely
        notification = models.Notification(
            id=str(uuid.uuid4()),
            recipient_user_id=str(claim.claimant_id),
            sender_user_id=str(current_user.id),
            title="Claim Approved",
            type="CLAIM_APPROVED",
            message=f"✅ Your claim for '{item.title}' was APPROVED! Please contact the finder to collect your item.",
            related_claim_id=str(claim.id),
            related_item_id=str(item.id)
        )
        db.add(notification)
        
        print("Committing transaction...")
        db.commit()
        db.refresh(claim)
        print("Transaction committed successfully.")
        
        return {
            "success": True,
            "claim_id": str(claim.id),
            "status": claim.status.value if hasattr(claim.status, 'value') else str(claim.status)
        }
    except Exception as e:
        print("ERROR:", str(e))
        traceback.print_exc()
        db.rollback()
        return JSONResponse(status_code=500, content={"success": False, "message": str(e), "detail": str(e)})

@router.post("/{claim_id}/reject")
def reject_claim(
    claim_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Reject a claim, notify claimant."""
    import traceback
    from fastapi.responses import JSONResponse
    
    print("================ DEBUG: REJECT ENDPOINT ================")
    print("Reject endpoint hit")
    print("Claim ID:", claim_id)
    print("Current user:", current_user.id)
    
    try:
        claim = db.query(models.Claim).filter(models.Claim.id == str(claim_id)).first()
        if not claim:
            print("ERROR: Claim not found")
            return JSONResponse(status_code=404, content={"success": False, "message": "Claim not found", "detail": "Claim not found"})
            
        print("Fetched claim ID:", claim.id)
        
        # Verify relationships safely
        if not getattr(claim, "found_item", None):
            print("ERROR: Associated found_item is None")
            return JSONResponse(status_code=404, content={"success": False, "message": "Associated item missing", "detail": "Associated item missing"})
        if not getattr(claim, "claimant", None):
            print("ERROR: Associated claimant is None")
            return JSONResponse(status_code=404, content={"success": False, "message": "Claimant missing", "detail": "Claimant missing"})
            
        item = claim.found_item
        print("Fetched item ID:", item.id)
        print("Item owner ID:", item.user_id)
            
        # Verify ownership
        if str(item.user_id) != str(current_user.id) and current_user.role != models.Role.ADMIN:
            print(f"ERROR: Authorization failed. Item owner is {item.user_id}, current user is {current_user.id}")
            return JSONResponse(status_code=403, content={"success": False, "message": "Not authorized to manage this claim", "detail": "Not authorized to manage this claim"})
            
        print("Ownership validated successfully.")
            
        # Update statuses
        claim.status = models.ClaimStatus.REJECTED
        
        print("Statuses updated. Creating notification...")
        
        # Notification creation safely
        notification = models.Notification(
            id=str(uuid.uuid4()),
            recipient_user_id=str(claim.claimant_id),
            sender_user_id=str(current_user.id),
            title="Claim Rejected",
            type="CLAIM_REJECTED",
            message=f"❌ Your claim for '{item.title}' was REJECTED.",
            related_claim_id=str(claim.id),
            related_item_id=str(item.id)
        )
        db.add(notification)
        
        print("Committing transaction...")
        db.commit()
        db.refresh(claim)
        print("Transaction committed successfully.")
        
        return {
            "success": True,
            "claim_id": str(claim.id),
            "status": claim.status.value if hasattr(claim.status, 'value') else str(claim.status)
        }
    except Exception as e:
        print("ERROR:", str(e))
        traceback.print_exc()
        db.rollback()
        return JSONResponse(status_code=500, content={"success": False, "message": str(e), "detail": str(e)})
