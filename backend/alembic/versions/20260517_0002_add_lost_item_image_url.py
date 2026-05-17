"""Add nullable image_url to lost_items.

Revision ID: 20260517_0002
Revises: 20260517_0001
Create Date: 2026-05-17 00:00:00
"""

from __future__ import annotations

from alembic import op
from sqlalchemy import Column, String, inspect


# revision identifiers, used by Alembic.
revision = "20260517_0002"
down_revision = "20260517_0001"
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()
    inspector = inspect(connection)
    if "lost_items" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("lost_items")}
    if "image_url" not in columns:
        op.add_column("lost_items", Column("image_url", String(), nullable=True))


def downgrade():
    connection = op.get_bind()
    inspector = inspect(connection)
    if "lost_items" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("lost_items")}
    if "image_url" in columns:
        op.drop_column("lost_items", "image_url")