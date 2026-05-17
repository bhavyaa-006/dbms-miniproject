from __future__ import annotations

from datetime import date, datetime

from .. import models


def _safe_uuid(value):
    return str(value) if value is not None else None


def _safe_iso(value):
    if value is None:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


def _safe_enum(value):
    if value is None:
        return None
    if hasattr(value, "value"):
        return value.value
    return str(value)


def serialize_user_summary(user: models.User | None) -> dict | None:
    if not user:
        return None
    return {
        "id": _safe_uuid(getattr(user, "id", None)),
        "name": getattr(user, "name", None),
        "email": getattr(user, "email", None),
        "role": _safe_enum(getattr(user, "role", None)),
    }


def serialize_category_summary(category: models.Category | None) -> dict | None:
    if not category:
        return None
    return {
        "id": _safe_uuid(getattr(category, "id", None)),
        "name": getattr(category, "name", None),
        "description": getattr(category, "description", None),
    }


def serialize_lost_item(item: models.LostItem | None) -> dict | None:
    if not item:
        return None

    category = getattr(item, "category", None)
    user = getattr(item, "user", None)
    claims = getattr(item, "claims", None) if hasattr(item, "claims") else None

    return {
        "id": _safe_uuid(getattr(item, "id", None)),
        "title": getattr(item, "title", None),
        "description": getattr(item, "description", None),
        "location": getattr(item, "location", None),
        "status": _safe_enum(getattr(item, "status", None)),
        "image_url": getattr(item, "image_url", None),
        "date_lost": _safe_iso(getattr(item, "date_lost", None)),
        "created_at": _safe_iso(getattr(item, "created_at", None)),
        "updated_at": _safe_iso(getattr(item, "updated_at", None)),
        "user_id": _safe_uuid(getattr(item, "user_id", None)),
        "category_id": _safe_uuid(getattr(item, "category_id", None)),
        "category": serialize_category_summary(category),
        "user": serialize_user_summary(user),
        "claims_count": len(claims) if claims is not None else 0,
    }


def serialize_found_item(item: models.FoundItem | None) -> dict | None:
    if not item:
        return None

    category = getattr(item, "category", None)
    user = getattr(item, "user", None)
    claims = getattr(item, "claims", None) if hasattr(item, "claims") else None

    return {
        "id": _safe_uuid(getattr(item, "id", None)),
        "title": getattr(item, "title", None),
        "description": getattr(item, "description", None),
        "location": getattr(item, "location", None),
        "status": _safe_enum(getattr(item, "status", None)),
        "image_url": getattr(item, "image_url", None),
        "date_found": _safe_iso(getattr(item, "date_found", None)),
        "created_at": _safe_iso(getattr(item, "created_at", None)),
        "category_id": _safe_uuid(getattr(item, "category_id", None)),
        "user_id": _safe_uuid(getattr(item, "user_id", None)),
        "category": serialize_category_summary(category),
        "user": serialize_user_summary(user),
        "claims_count": len(claims) if claims is not None else 0,
    }


def serialize_claim(claim: models.Claim | None) -> dict | None:
    if not claim:
        return None

    found_item = getattr(claim, "found_item", None)
    claimant = getattr(claim, "claimant", None)

    return {
        "id": _safe_uuid(getattr(claim, "id", None)),
        "status": _safe_enum(getattr(claim, "status", None)),
        "description": getattr(claim, "description", None),
        "created_at": _safe_iso(getattr(claim, "created_at", None)),
        "updated_at": _safe_iso(getattr(claim, "updated_at", None)),
        "found_item_id": _safe_uuid(getattr(claim, "found_item_id", None)),
        "claimant_id": _safe_uuid(getattr(claim, "claimant_id", None)),
        "found_item": serialize_found_item(found_item),
        "claimant": serialize_user_summary(claimant),
    }


def serialize_notification(notification: models.Notification | None) -> dict | None:
    if not notification:
        return None

    return {
        "id": _safe_uuid(getattr(notification, "id", None)),
        "recipient_user_id": _safe_uuid(getattr(notification, "recipient_user_id", None)),
        "sender_user_id": _safe_uuid(getattr(notification, "sender_user_id", None)),
        "title": getattr(notification, "title", None),
        "type": getattr(notification, "type", None),
        "message": getattr(notification, "message", None),
        "related_claim_id": _safe_uuid(getattr(notification, "related_claim_id", None)),
        "related_item_id": _safe_uuid(getattr(notification, "related_item_id", None)),
        "is_read": bool(getattr(notification, "is_read", False)),
        "created_at": _safe_iso(getattr(notification, "created_at", None)),
        "sender": serialize_user_summary(getattr(notification, "sender", None)),
        "related_claim": serialize_claim(getattr(notification, "related_claim", None)),
        "related_item": serialize_found_item(getattr(notification, "related_item", None)),
    }