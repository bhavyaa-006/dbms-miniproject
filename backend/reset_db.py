import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app import models
from app.category_constants import PREDEFINED_CATEGORIES
from sqlalchemy import text

def reset_db():
    print("Dropping all tables and types...")
    # Base.metadata.drop_all(bind=engine) # This might not drop ENUMs in postgres
    
    with engine.begin() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO postgres;"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
        
    print("Creating all tables and types...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    categories = [models.Category(name=name, description=None) for name in PREDEFINED_CATEGORIES]
    db.add_all(categories)
    db.commit()
    db.close()
    print("Done!")

if __name__ == "__main__":
    reset_db()
