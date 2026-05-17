"""
Seed script for reference data.
Run from the backend/ directory:
    python -m app.seed
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app import models
from app.category_constants import PREDEFINED_CATEGORIES

Base.metadata.create_all(bind=engine)

db = SessionLocal()


def run():
    categories = [models.Category(name=name, description=None) for name in PREDEFINED_CATEGORIES]

    existing = {category.name for category in db.query(models.Category).all()}
    added = False
    for category in categories:
        if category.name not in existing:
            db.add(category)
            added = True

    if added:
        db.commit()

    print("✅ Reference categories are available.")


if __name__ == "__main__":
    run()
    db.close()
