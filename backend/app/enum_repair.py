from __future__ import annotations

import logging
from typing import Mapping

from sqlalchemy import inspect, text

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


ENUM_DEFINITIONS: dict[str, tuple[str, ...]] = {
    "role": ("STUDENT", "ADMIN"),
    "lostitemstatus": ("LOST", "FOUND", "CLOSED"),
    "founditemstatus": ("AVAILABLE", "CLAIMED"),
    "claimstatus": ("PENDING", "APPROVED", "REJECTED"),
}


ENUM_LEGACY_ROW_VALUES: dict[str, dict[str, str]] = {
    "lost_items": {
        "lost": "LOST",
        "found": "FOUND",
        "closed": "CLOSED",
        "PENDING": "LOST",
        "RESOLVED": "FOUND",
    },
    "found_items": {
        "available": "AVAILABLE",
        "claimed": "CLAIMED",
        "CLAIM_PENDING": "AVAILABLE",
        "RETURNED": "CLAIMED",
    },
}


def _quote_literal(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def get_pg_enum_labels(connection, enum_type_name: str) -> list[str]:
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


def enum_type_exists(connection, enum_type_name: str) -> bool:
    return connection.execute(
        text("SELECT 1 FROM pg_type WHERE typname = :enum_type_name LIMIT 1"),
        {"enum_type_name": enum_type_name},
    ).scalar_one_or_none() is not None


def ensure_pg_enum_type(connection, enum_type_name: str, required_labels: tuple[str, ...]) -> list[str]:
    labels = get_pg_enum_labels(connection, enum_type_name) if enum_type_exists(connection, enum_type_name) else []
    logger.info("Enum inspection type=%s labels=%s", enum_type_name, labels or "<missing>")

    if not labels:
        create_sql = ", ".join(_quote_literal(label) for label in required_labels)
        logger.info("Creating missing enum type type=%s labels=%s", enum_type_name, list(required_labels))
        connection.execute(text(f'CREATE TYPE "{enum_type_name}" AS ENUM ({create_sql})'))
        return list(required_labels)

    existing = set(labels)
    for label in required_labels:
        if label not in existing:
            logger.info("Adding enum label type=%s label=%s", enum_type_name, label)
            connection.execute(text(f'ALTER TYPE "{enum_type_name}" ADD VALUE IF NOT EXISTS {_quote_literal(label)}'))

    updated_labels = get_pg_enum_labels(connection, enum_type_name)
    logger.info("Enum labels after repair type=%s labels=%s", enum_type_name, updated_labels)
    return updated_labels


def repair_enum_rows(connection, table_name: str, column_name: str, value_map: Mapping[str, str]) -> int:
    inspector = inspect(connection)
    if table_name not in inspector.get_table_names():
        logger.info("Skipping enum row repair table=%s reason=missing_table", table_name)
        return 0

    columns = {column["name"] for column in inspector.get_columns(table_name)}
    if column_name not in columns:
        logger.info("Skipping enum row repair table=%s column=%s reason=missing_column", table_name, column_name)
        return 0

    total_updated = 0
    for old_value, new_value in value_map.items():
        if old_value == new_value:
            continue
        result = connection.execute(
            text(
                f"""
                UPDATE {table_name}
                SET {column_name} = :new_value
                WHERE {column_name}::text = :old_value
                """
            ),
            {"old_value": old_value, "new_value": new_value},
        )
        if result.rowcount:
            logger.info(
                "Repaired enum rows table=%s column=%s old_value=%s new_value=%s rowcount=%s",
                table_name,
                column_name,
                old_value,
                new_value,
                result.rowcount,
            )
        total_updated += result.rowcount or 0
    return total_updated


def repair_database_enums(connection) -> None:
    for enum_type_name, labels in ENUM_DEFINITIONS.items():
        ensure_pg_enum_type(connection, enum_type_name, labels)


def repair_enum_data(connection) -> None:
    repair_enum_rows(connection, "lost_items", "status", ENUM_LEGACY_ROW_VALUES["lost_items"])
    repair_enum_rows(connection, "found_items", "status", ENUM_LEGACY_ROW_VALUES["found_items"])


def repair_database_enums_and_rows(connection) -> None:
    repair_database_enums(connection)
    repair_enum_data(connection)