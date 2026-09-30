"""Estado personal /me: estado de estudio, notas y favoritos (A-F2.4, ADR-006).

Tablas independientes de content/ (ADR-000): sin FK a content_files ni a entities, el compilador
no las toca. user_id forma parte de la PK con valor fijo "default" (usuario único por ahora).

Revision ID: 0003
Revises: 0002
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None

STUDY_STATES = ("not_reviewed", "reviewing", "understood", "applied", "needs_review")


def user_column() -> sa.Column:
    return sa.Column("user_id", sa.String(50), primary_key=True, server_default="default")


def upgrade() -> None:
    op.create_table(
        "me_study_states",
        user_column(),
        sa.Column("slug", sa.String(100), primary_key=True),
        sa.Column("state", sa.String(20), nullable=False),
        sa.Column("pending_deep_dive", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("last_studied_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(f"state IN ({', '.join(repr(s) for s in STUDY_STATES)})", name="ck_me_study_states_state"),
    )
    op.create_index("ix_me_study_states_user_updated", "me_study_states", ["user_id", "updated_at"])
    op.create_table(
        "me_notes",
        user_column(),
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("slug", sa.String(100), nullable=False),
        sa.Column("body_markdown", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_me_notes_user_slug_created", "me_notes", ["user_id", "slug", "created_at"])
    op.create_table(
        "me_favorites",
        user_column(),
        sa.Column("slug", sa.String(100), primary_key=True),
        sa.Column("favorite", sa.Boolean(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_me_favorites_user_updated", "me_favorites", ["user_id", "updated_at"])


def downgrade() -> None:
    for table in ("me_favorites", "me_notes", "me_study_states"):
        op.drop_table(table)
