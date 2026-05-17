"""Repair PostgreSQL enum labels and corrupted LostItem rows.

Usage:
  python repair_lost_item_statuses.py
"""

import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

def _get_pg_enum_labels(connection, enum_type_name: str):
    result = connection.execute(
        text(
            """
            SELECT enumlabel
            FROM pg_enum e
            JOIN pg_type t ON t.oid = e.enumtypid
            WHERE t.typname = :enum_type_name
            ORDER BY e.enumsortorder
            """
        ),
        {"enum_type_name": enum_type_name},
    )
    return [row[0] for row in result.fetchall()]


def _repair_pg_enum_type(connection, enum_type_name: str, mapping: dict[str, str]):
    labels = _get_pg_enum_labels(connection, enum_type_name)
    print(f"Enum {enum_type_name} labels before repair: {labels}")
    for old_value, new_value in mapping.items():
        if old_value in labels and new_value not in labels:
            connection.execute(text(f"ALTER TYPE {enum_type_name} RENAME VALUE '{old_value}' TO '{new_value}'"))
            labels = _get_pg_enum_labels(connection, enum_type_name)
            print(f"Renamed enum {enum_type_name} value {old_value} -> {new_value}")


SQL = """
UPDATE lost_items
SET status = 'LOST'
WHERE status IS NULL OR status::text NOT IN ('LOST', 'FOUND', 'CLOSED');

UPDATE claims
SET status = 'PENDING'
WHERE status IS NULL OR status::text NOT IN ('PENDING', 'APPROVED', 'REJECTED');

UPDATE found_items
SET status = 'AVAILABLE'
WHERE status IS NULL OR status::text NOT IN ('AVAILABLE', 'CLAIM_PENDING', 'CLAIMED', 'RETURNED');
"""


def main() -> None:
    with engine.begin() as connection:
        _repair_pg_enum_type(connection, "lostitemstatus", {
            "lost": "LOST",
            "found": "FOUND",
            "closed": "CLOSED",
        })
        _repair_pg_enum_type(connection, "claimstatus", {
            "pending": "PENDING",
            "approved": "APPROVED",
            "rejected": "REJECTED",
        })
        _repair_pg_enum_type(connection, "founditemstatus", {
            "available": "AVAILABLE",
            "claimed": "CLAIMED",
            "returned": "RETURNED",
            "claim_pending": "CLAIM_PENDING",
        })
        result = connection.execute(text(SQL))
        print(f"Repaired lost_items rows: {result.rowcount}")


if __name__ == "__main__":
    main()
