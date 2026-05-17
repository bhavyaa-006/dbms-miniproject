import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app import models
from sqlalchemy import text

def run():
    db = SessionLocal()
    try:
        print("Resetting application tables with TRUNCATE CASCADE...")
        # Wipe all tables cleanly
        db.execute(text("TRUNCATE TABLE notifications, claims, found_items, lost_items, categories, users CASCADE"))

        categories = [
            models.Category(name="Electronics", description="Phones, laptops, chargers, earphones"),
            models.Category(name="Documents", description="ID cards, admit cards, notebooks"),
            models.Category(name="Clothing", description="Jackets, scarves, caps, bags"),
            models.Category(name="Accessories", description="Watches, keys, wallets, spectacles"),
            models.Category(name="Sports", description="Bats, balls, rackets, equipment"),
            models.Category(name="Other", description="Anything that does not fit above"),
        ]
        db.add_all(categories)

        db.commit()
        print("✅ Reference categories restored.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run()
