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

Base.metadata.create_all(bind=engine)

db = SessionLocal()


def run():
    categories = [
        models.Category(name="Electronics", description="Phones, laptops, chargers, earphones"),
        models.Category(name="Documents", description="ID cards, admit cards, notebooks"),
        models.Category(name="Clothing", description="Jackets, scarves, caps, bags"),
        models.Category(name="Accessories", description="Watches, keys, wallets, spectacles"),
        models.Category(name="Sports", description="Bats, balls, rackets, equipment"),
        models.Category(name="Other", description="Anything that does not fit above"),
    ]

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
