from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from .. import models, schemas
from ..dependencies import get_db, get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """Get summary statistics for the dashboard overview."""
    try:
        total_lost = db.query(models.LostItem).filter(
            models.LostItem.status == models.LostItemStatus.LOST
        ).count()
        total_found = db.query(models.FoundItem).filter(
            models.FoundItem.status == models.FoundItemStatus.AVAILABLE
        ).count()
        pending_claims = db.query(models.Claim).filter(
            models.Claim.status == models.ClaimStatus.PENDING
        ).count()
        resolved_items = db.query(models.FoundItem).filter(
            models.FoundItem.status == models.FoundItemStatus.CLAIMED
        ).count()

        data = {
            "total_lost": total_lost,
            "total_found": total_found,
            "pending_claims": pending_claims,
            "resolved_items": resolved_items,
        }
        return JSONResponse(status_code=200, content=jsonable_encoder(data))
    except Exception as exc:
        import traceback
        print(f"Dashboard query failed: {str(exc)}")
        traceback.print_exc()
        fallback_data = {
            "total_lost": 0,
            "total_found": 0,
            "pending_claims": 0,
            "resolved_items": 0,
        }
        return JSONResponse(status_code=200, content=jsonable_encoder(fallback_data))
