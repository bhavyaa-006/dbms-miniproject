"""Repair PostgreSQL enum labels and corrupted item rows.

Usage:
  python repair_lost_item_statuses.py
"""

from __future__ import annotations

import logging
import os
from sqlalchemy import create_engine

from app.enum_repair import repair_database_enums, repair_enum_data

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main() -> None:
    with engine.begin() as connection:
        logger.info("Repairing enum types")
        repair_database_enums(connection)
        logger.info("Repairing enum-backed rows")
        repair_enum_data(connection)


if __name__ == "__main__":
    main()
