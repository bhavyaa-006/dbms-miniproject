import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from typing import List
from .. import models, schemas
from ..dependencies import get_db, get_current_user, admin_only
from ..utils.serializers import serialize_claim

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


def _claims_query(db: Session):
    return db.query(models.Claim).options(
        joinedload(models.Claim.found_item).joinedload(models.FoundItem.category),
        joinedload(models.Claim.found_item).joinedload(models.FoundItem.user),
        joinedload(models.Claim.claimant),
    )


@router.post("", response_model=schemas.ClaimOut, status_code=201)
def submit_claim(
    payload: schemas.ClaimCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Student submits a claim on a found item."""
    try:
        found_item = (
            db.query(models.FoundItem)
            .options(
                joinedload(models.FoundItem.category),
                joinedload(models.FoundItem.user),
                joinedload(models.FoundItem.claims),
            )
            .filter(models.FoundItem.id == payload.found_item_id)
            .first()
        )
        if not found_item:
            raise HTTPException(status_code=404, detail="Found item not found")
        if found_item.status != models.FoundItemStatus.AVAILABLE:
            raise HTTPException(status_code=400, detail="This item has already been claimed")

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
        db.flush()
        _create_notification(
            db,
            recipient_user_id=found_item.user_id,
            message=f"{current_user.name} submitted a claim for your item: '{found_item.title}'.\nProof: {payload.description or 'No proof provided'}",
            sender_user_id=current_user.id,
            title="New Claim Request",
            type="CLAIM_REQUEST",
            related_claim_id=claim.id,
            related_item_id=found_item.id,
        )
        db.commit()
        claim.found_item = found_item
        claim.claimant = current_user
        return JSONResponse(status_code=201, content=serialize_claim(claim))
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        logger.exception("Failed to submit claim for found_item_id=%s user_id=%s", payload.found_item_id, current_user.id)
        return JSONResponse(status_code=500, content={"success": False, "message": str(exc), "detail": str(exc)})


@router.get("", response_model=List[schemas.ClaimOut])
def list_all_claims(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Admin: list all claims. Student: list claims for items they found."""
    try:
        if current_user.role == models.Role.ADMIN:
            claims = _claims_query(db).order_by(models.Claim.created_at.desc()).all()
        else:
            claims = (
                _claims_query(db)
                .join(models.FoundItem)
                .filter(models.FoundItem.user_id == current_user.id)
                .order_by(models.Claim.created_at.desc())
                .all()
            )
        return JSONResponse(status_code=200, content=[serialize_claim(claim) for claim in claims])
    except Exception as exc:
        db.rollback()
        import traceback
        print(str(exc))
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"success": False, "message": str(exc), "detail": str(exc)})


@router.get("/my", response_model=List[schemas.ClaimOut])
def my_claims(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Student: list my submitted claims."""
    try:
        claims = (
            _claims_query(db)
            .filter(models.Claim.claimant_id == current_user.id)
            .order_by(models.Claim.created_at.desc())
            .all()
        )
        return JSONResponse(status_code=200, content=[serialize_claim(claim) for claim in claims])
    except Exception as exc:
        db.rollback()
        import traceback
        print(str(exc))
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"success": False, "message": str(exc), "detail": str(exc)})


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
        claim = _claims_query(db).filter(models.Claim.id == str(claim_id)).first()
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
        
        print("Checking for matching Lost Items...")
        matching_lost_items = db.query(models.LostItem).filter(
            models.LostItem.user_id == claim.claimant_id,
            models.LostItem.category_id == item.category_id,
            models.LostItem.status == models.LostItemStatus.LOST
        ).all()
        
        for lost_item in matching_lost_items:
            if lost_item.title.lower().strip() == item.title.lower().strip():
                print(f"Matched LostItem {lost_item.id}! Updating status to FOUND.")
                lost_item.status = models.LostItemStatus.FOUND
                break
        
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
        claim = _claims_query(db).filter(models.Claim.id == str(claim_id)).first()
        print("Transaction committed successfully.")
        
        return JSONResponse(status_code=200, content={
            "success": True,
            "claim": serialize_claim(claim),
        })
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
        claim = _claims_query(db).filter(models.Claim.id == str(claim_id)).first()
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
        claim = _claims_query(db).filter(models.Claim.id == str(claim_id)).first()
        print("Transaction committed successfully.")
        
        return JSONResponse(status_code=200, content={
            "success": True,
            "claim": serialize_claim(claim),
        })
    except Exception as e:
        print("ERROR:", str(e))
        traceback.print_exc()
        db.rollback()
        return JSONResponse(status_code=500, content={"success": False, "message": str(e), "detail": str(e)})
