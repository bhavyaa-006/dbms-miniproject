import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from sqlalchemy import text

def drop_triggers():
    print("Dropping broken triggers...")
    with engine.begin() as conn:
        conn.execute(text("DROP TRIGGER IF EXISTS trg_claim_status_change ON claims;"))
        conn.execute(text("DROP FUNCTION IF EXISTS fn_handle_claim_status_change CASCADE;"))
    print("Triggers dropped successfully!")

if __name__ == "__main__":
    drop_triggers()
