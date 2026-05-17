"""
Seed script — populates the database with sample data for demo/viva.
Run from the backend/ directory:
    python -m app.seed
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app import models
from app.security import hash_password
from datetime import date

Base.metadata.create_all(bind=engine)

db = SessionLocal()


def run():
    # ── Clear existing data ────────────────────────────────────────────────────
    db.query(models.Notification).delete()
    db.query(models.Claim).delete()
    db.query(models.FoundItem).delete()
    db.query(models.LostItem).delete()
    db.query(models.Category).delete()
    db.query(models.User).delete()
    db.commit()

    # ── Categories ─────────────────────────────────────────────────────────────
    cats = [
        models.Category(name="Electronics", description="Phones, laptops, chargers, earphones"),
        models.Category(name="Documents",   description="ID cards, admit cards, notebooks"),
        models.Category(name="Clothing",    description="Jackets, scarves, caps, bags"),
        models.Category(name="Accessories", description="Watches, keys, wallets, spectacles"),
        models.Category(name="Sports",      description="Bats, balls, rackets, equipment"),
        models.Category(name="Other",       description="Anything that does not fit above"),
    ]
    db.add_all(cats)
    db.commit()
    cat = {c.name: c for c in cats}

    # ── Users ──────────────────────────────────────────────────────────────────
    admin = models.User(
        name="Admin",
        email="admin@campus.edu",
        password_hash=hash_password("admin123"),
        role=models.Role.ADMIN,
    )
    alice = models.User(
        name="Alice Johnson",
        email="alice@campus.edu",
        password_hash=hash_password("alice123"),
    )
    bob = models.User(
        name="Bob Smith",
        email="bob@campus.edu",
        password_hash=hash_password("bob123"),
    )
    carol = models.User(
        name="Carol Davis",
        email="carol@campus.edu",
        password_hash=hash_password("carol123"),
    )
    db.add_all([admin, alice, bob, carol])
    db.commit()

    # ── Lost Items ─────────────────────────────────────────────────────────────
    li1 = models.LostItem(
        title="Black iPhone 14",
        description="Lost near the library entrance. Has a cracked screen protector.",
        category_id=cat["Electronics"].id,
        user_id=alice.id,
        location="Central Library",
        date_lost=date(2024, 5, 10),
    )
    li2 = models.LostItem(
        title="College ID Card",
        description="ID card of Alice Johnson, Roll No. CS2021045.",
        category_id=cat["Documents"].id,
        user_id=alice.id,
        location="Canteen Block B",
        date_lost=date(2024, 5, 12),
    )
    li3 = models.LostItem(
        title="Blue Denim Jacket",
        description="Left in the seminar hall after the tech fest.",
        category_id=cat["Clothing"].id,
        user_id=bob.id,
        location="Seminar Hall 2",
        date_lost=date(2024, 5, 14),
    )
    li4 = models.LostItem(
        title="Sony Earphones WH-1000XM4",
        description="Black over-ear headphones in a white case.",
        category_id=cat["Electronics"].id,
        user_id=carol.id,
        location="CS Department Lab",
        date_lost=date(2024, 5, 15),
    )
    db.add_all([li1, li2, li3, li4])
    db.commit()

    # ── Found Items ────────────────────────────────────────────────────────────
    fi1 = models.FoundItem(
        title="iPhone (Black)",
        description="Found near library steps. Screen protector is cracked.",
        category_id=cat["Electronics"].id,
        user_id=bob.id,
        location="Library Entrance",
        date_found=date(2024, 5, 11),
    )
    fi2 = models.FoundItem(
        title="Student ID Card",
        description="Found on the canteen table. Name: Alice Johnson.",
        category_id=cat["Documents"].id,
        user_id=carol.id,
        location="Canteen Block B",
        date_found=date(2024, 5, 13),
    )
    fi3 = models.FoundItem(
        title="Leather Wallet",
        description="Brown leather wallet with some cash inside. Found near parking.",
        category_id=cat["Accessories"].id,
        user_id=alice.id,
        location="Parking Lot A",
        date_found=date(2024, 5, 14),
    )
    db.add_all([fi1, fi2, fi3])
    db.commit()

    # ── Claims ─────────────────────────────────────────────────────────────────
    cl1 = models.Claim(
        found_item_id=fi1.id,
        claimant_id=alice.id,
        description="This is my phone. IMEI: 356938035643809. I can provide purchase receipt.",
        status=models.ClaimStatus.PENDING,
    )
    cl2 = models.Claim(
        found_item_id=fi2.id,
        claimant_id=alice.id,
        description="That is my ID card. My roll number is CS2021045.",
        status=models.ClaimStatus.APPROVED,
    )
    db.add_all([cl1, cl2])
    db.commit()

    # ── Notifications ──────────────────────────────────────────────────────────
    n1 = models.Notification(
        user_id=alice.id,
        message="✅ Your claim for 'Student ID Card' has been APPROVED! Please collect your item.",
    )
    n2 = models.Notification(
        user_id=alice.id,
        message="📢 A found item matching your lost iPhone has been posted. Check Found Items!",
        is_read=True,
    )
    # Mark fi2 as claimed since cl2 is approved
    fi2.status = models.FoundItemStatus.CLAIMED
    db.add_all([n1, n2])
    db.commit()

    print("✅ Database seeded successfully!")
    print("─" * 40)
    print("Admin:   admin@campus.edu  / admin123")
    print("Alice:   alice@campus.edu  / alice123")
    print("Bob:     bob@campus.edu    / bob123")
    print("Carol:   carol@campus.edu  / carol123")


if __name__ == "__main__":
    run()
    db.close()
