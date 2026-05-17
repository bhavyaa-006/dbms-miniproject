"""Standardize lost/found/claim enums.

Revision ID: 20260517_0001
Revises: 
Create Date: 2026-05-17 00:00:00
"""

from __future__ import annotations

from alembic import op
from sqlalchemy import text

from app.enum_repair import repair_database_enums, repair_enum_data


# revision identifiers, used by Alembic.
revision = "20260517_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()
    repair_database_enums(connection)
    repair_enum_data(connection)


def downgrade():
    connection = op.get_bind()
    connection.execute(text("UPDATE found_items SET status = 'AVAILABLE' WHERE status::text = 'CLAIMED'"))
    connection.execute(text("UPDATE lost_items SET status = 'LOST' WHERE status::text IN ('FOUND', 'CLOSED')"))