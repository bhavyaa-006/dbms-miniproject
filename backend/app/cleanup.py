import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app import models
from app.category_constants import PREDEFINED_CATEGORIES
from sqlalchemy import text

def run():
    db = SessionLocal()
    try:
        print("Resetting application tables with TRUNCATE CASCADE...")
        # Wipe all tables cleanly
        db.execute(text("TRUNCATE TABLE notifications, claims, found_items, lost_items, categories, users CASCADE"))

        categories = [models.Category(name=name, description=None) for name in PREDEFINED_CATEGORIES]
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
