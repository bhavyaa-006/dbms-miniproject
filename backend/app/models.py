import uuid
import enum
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Text, Boolean, DateTime, Date,
    Enum as SAEnum, ForeignKey, Index, CheckConstraint
)
from sqlalchemy.orm import relationship
from .database import Base
from .category_constants import PREDEFINED_CATEGORIES


# ─── Enums ────────────────────────────────────────────────────────────────────

class Role(str, enum.Enum):
    STUDENT = "STUDENT"
    ADMIN = "ADMIN"


class LostItemStatus(str, enum.Enum):
    LOST = "LOST"
    FOUND = "FOUND"
    CLOSED = "CLOSED"


class FoundItemStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    CLAIM_PENDING = "CLAIM_PENDING"
    CLAIMED = "CLAIMED"
    RETURNED = "RETURNED"


class ClaimStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


# ─── Models ───────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(SAEnum(Role), default=Role.STUDENT, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    lost_items = relationship("LostItem", back_populates="user", cascade="all, delete")
    found_items = relationship("FoundItem", back_populates="user", cascade="all, delete")
    claims = relationship("Claim", back_populates="claimant", cascade="all, delete")
    notifications = relationship("Notification", foreign_keys="[Notification.recipient_user_id]", back_populates="recipient", cascade="all, delete")


class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)

    lost_items = relationship("LostItem", back_populates="category")
    found_items = relationship("FoundItem", back_populates="category")


class LostItem(Base):
    __tablename__ = "lost_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    location = Column(String(200), nullable=True)
    status = Column(SAEnum(LostItemStatus), default=LostItemStatus.LOST, nullable=False)
    image_url = Column(String, nullable=True)
    date_lost = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="lost_items")
    category = relationship("Category", back_populates="lost_items")

    __table_args__ = (
        Index("ix_lost_items_status", "status"),
        Index("ix_lost_items_category_id", "category_id"),
        Index("ix_lost_items_user_id", "user_id"),
    )


class FoundItem(Base):
    __tablename__ = "found_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    location = Column(String(200), nullable=True)
    status = Column(SAEnum(FoundItemStatus), default=FoundItemStatus.AVAILABLE, nullable=False)
    image_url = Column(String, nullable=True)
    date_found = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="found_items")
    category = relationship("Category", back_populates="found_items")
    claims = relationship("Claim", back_populates="found_item")

    __table_args__ = (
        Index("ix_found_items_status", "status"),
        Index("ix_found_items_category_id", "category_id"),
        Index("ix_found_items_user_id", "user_id"),
    )


class Claim(Base):
    __tablename__ = "claims"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    found_item_id = Column(String, ForeignKey("found_items.id"), nullable=False)
    claimant_id = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(SAEnum(ClaimStatus), default=ClaimStatus.PENDING, nullable=False)
    description = Column(Text, nullable=True)   # proof of ownership
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    found_item = relationship("FoundItem", back_populates="claims")
    claimant = relationship("User", back_populates="claims")

    __table_args__ = (
        Index("ix_claims_status", "status"),
        Index("ix_claims_found_item_id", "found_item_id"),
        Index("ix_claims_claimant_id", "claimant_id"),
    )


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    recipient_user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    sender_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    title = Column(String(200), nullable=False, default="Notification")
    type = Column(String(50), nullable=False, default="INFO")
    message = Column(Text, nullable=False)
    related_claim_id = Column(String, ForeignKey("claims.id"), nullable=True)
    related_item_id = Column(String, ForeignKey("found_items.id"), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    recipient = relationship("User", foreign_keys=[recipient_user_id], back_populates="notifications")
    sender = relationship("User", foreign_keys=[sender_user_id])
    related_claim = relationship("Claim")
    related_item = relationship("FoundItem")
