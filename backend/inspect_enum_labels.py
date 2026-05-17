"""Inspect PostgreSQL enum labels used by the Lost Items system.

Usage:
  python inspect_enum_labels.py
"""

import os

from sqlalchemy import create_engine, text

from app.enum_repair import get_pg_enum_labels

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)


def main() -> None:
    with engine.begin() as connection:
        for enum_type_name in ["lostitemstatus", "founditemstatus", "claimstatus"]:
            labels = get_pg_enum_labels(connection, enum_type_name)
            print(f"{enum_type_name}: {labels}")


if __name__ == "__main__":
    main()