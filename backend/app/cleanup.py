import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app import models
from app.security import hash_password
from sqlalchemy import text

def run():
    db = SessionLocal()
    try:
        print("Deleting existing dummy data using TRUNCATE CASCADE...")
        # Wipe all tables cleanly
        db.execute(text("TRUNCATE TABLE notifications, claims, found_items, lost_items, categories, users CASCADE"))


        # Check if admin exists to avoid duplicate constraint errors
        admin = db.query(models.User).filter_by(email="admin@campus.edu").first()
        if not admin:
            admin = models.User(
                name="Admin",
                email="admin@campus.edu",
                password_hash=hash_password("admin123"),
                role=models.Role.ADMIN,
            )
            db.add(admin)

        # Check if categories exist
        cats = db.query(models.Category).all()
        if not cats:
            categories = [
                models.Category(name="Electronics", description="Phones, laptops, chargers, earphones"),
                models.Category(name="Documents",   description="ID cards, admit cards, notebooks"),
                models.Category(name="Clothing",    description="Jackets, scarves, caps, bags"),
                models.Category(name="Accessories", description="Watches, keys, wallets, spectacles"),
                models.Category(name="Sports",      description="Bats, balls, rackets, equipment"),
                models.Category(name="Other",       description="Anything that does not fit above"),
            ]
            db.add_all(categories)

        db.commit()
        print("✅ Core data (Admin + Categories) successfully seeded into your new database!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run()
