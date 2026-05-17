"""Repair corrupted LostItem status values in PostgreSQL.

Usage:
  python repair_lost_item_statuses.py
"""

import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SQL = """
UPDATE lost_items
SET status = 'LOST'
WHERE status IS NULL OR status NOT IN ('LOST', 'FOUND', 'CLOSED');
"""


def main() -> None:
    with engine.begin() as connection:
        result = connection.execute(text(SQL))
        print(f"Repaired lost_items rows: {result.rowcount}")


if __name__ == "__main__":
    main()
