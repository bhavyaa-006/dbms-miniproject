"""Inspect PostgreSQL enum labels used by the Lost Items system.

Usage:
  python inspect_enum_labels.py
"""

import os

from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)


def inspect_enum(connection, enum_type_name: str):
    rows = connection.execute(
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
    ).fetchall()
    return [row[0] for row in rows]


def main() -> None:
    with engine.begin() as connection:
        for enum_type_name in ["lostitemstatus", "founditemstatus", "claimstatus"]:
            labels = inspect_enum(connection, enum_type_name)
            print(f"{enum_type_name}: {labels}")


if __name__ == "__main__":
    main()