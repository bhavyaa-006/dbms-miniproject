from __future__ import annotations

from enum import Enum


class Role(str, Enum):
    STUDENT = "STUDENT"
    ADMIN = "ADMIN"


class LostItemStatus(str, Enum):
    LOST = "LOST"
    FOUND = "FOUND"
    CLOSED = "CLOSED"


class FoundItemStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    CLAIMED = "CLAIMED"


class ClaimStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"