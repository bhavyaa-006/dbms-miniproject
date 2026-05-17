from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime, date
from enum import Enum
from uuid import UUID
from .category_constants import PREDEFINED_CATEGORIES


# ─── Enums ────────────────────────────────────────────────────────────────────

class Role(str, Enum):
    STUDENT = "STUDENT"
    ADMIN = "ADMIN"


class LostItemStatus(str, Enum):
    PENDING = "PENDING"
    RESOLVED = "RESOLVED"


class FoundItemStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    CLAIMED = "CLAIMED"


class ClaimStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


# ─── Auth ─────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: Role
    created_at: datetime
    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ─── Category ─────────────────────────────────────────────────────────────────

class CategoryOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    model_config = {"from_attributes": True}


# ─── Lost Items ───────────────────────────────────────────────────────────────

class LostItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category_id: UUID
    location: Optional[str] = None
    date_lost: date

    @field_validator("category_id")
    @classmethod
    def validate_category_id(cls, value: UUID) -> UUID:
        return value


class LostItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[UUID] = None
    location: Optional[str] = None
    status: Optional[LostItemStatus] = None
    date_lost: Optional[date] = None

    @field_validator("category_id")
    @classmethod
    def validate_category_id(cls, value: Optional[UUID]) -> Optional[UUID]:
        return value


class LostItemOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    status: LostItemStatus
    image_url: Optional[str] = None
    date_lost: date
    created_at: datetime
    category: CategoryOut
    user: UserOut
    model_config = {"from_attributes": True}


# ─── Found Items ──────────────────────────────────────────────────────────────

class FoundItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category_id: UUID
    location: Optional[str] = None
    date_found: date

    @field_validator("category_id")
    @classmethod
    def validate_category_id(cls, value: UUID) -> UUID:
        return value


class FoundItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[UUID] = None
    location: Optional[str] = None
    status: Optional[FoundItemStatus] = None
    date_found: Optional[date] = None

    @field_validator("category_id")
    @classmethod
    def validate_category_id(cls, value: Optional[UUID]) -> Optional[UUID]:
        return value


class FoundItemOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    status: FoundItemStatus
    image_url: Optional[str] = None
    date_found: date
    created_at: datetime
    category: CategoryOut
    user: UserOut
    model_config = {"from_attributes": True}


# ─── Claims ───────────────────────────────────────────────────────────────────

class ClaimCreate(BaseModel):
    found_item_id: str
    description: Optional[str] = None


class ClaimUpdate(BaseModel):
    status: ClaimStatus


class ClaimOut(BaseModel):
    id: str
    status: ClaimStatus
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    found_item: FoundItemOut
    claimant: UserOut
    model_config = {"from_attributes": True}


# ─── Notifications ────────────────────────────────────────────────────────────

class NotificationOut(BaseModel):
    id: str
    message: str
    is_read: bool
    created_at: datetime
    model_config = {"from_attributes": True}


# ─── Dashboard ────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_lost: int
    total_found: int
    pending_claims: int
    resolved_items: int
