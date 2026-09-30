"""Estado personal /me sobre PostgreSQL (§37, A-F2.4, ADR-006).

SQL por petición (no usa el índice en memoria). Usuario único: user_id = "default".
Un slug es válido si es un concepto del blueprint o una tecnología; el estado de slugs que ya no
existen se conserva en la base, pero no aparece en los listados (y su GET devuelve 404 en el router).
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import Engine, and_, delete, func, select, update
from sqlalchemy.dialects.postgresql import insert

from backend.app.projection import TECHNOLOGY_TYPES, ContentIndex
from backend.db import schema as t

USER = t.DEFAULT_USER


def now() -> datetime:
    return datetime.now(UTC)


def iso(value: datetime | None) -> str | None:
    """UTC con sufijo Z; milisegundos solo si los hay (una fecha del cliente vuelve tal como llegó)."""
    if value is None:
        return None
    moment = value.astimezone(UTC)
    timespec = "seconds" if moment.microsecond == 0 else "milliseconds"
    return moment.isoformat(timespec=timespec).replace("+00:00", "Z")


def is_target(index: ContentIndex, slug: str) -> bool:
    """Conceptos del blueprint y tecnologías admiten estado personal."""
    return slug in index.concepts or index.entities.get(slug, {}).get("type") in TECHNOLOGY_TYPES


def visible_slugs(index: ContentIndex) -> list[str]:
    techs = [slug for slug, e in index.entities.items() if e["type"] in TECHNOLOGY_TYPES]
    return [*index.concepts, *techs]


# --- Estado de estudio -------------------------------------------------------

S = t.me_study_states


def study_state_dict(row: Any) -> dict[str, Any]:
    return {
        "slug": row.slug, "state": row.state, "pending_deep_dive": row.pending_deep_dive,
        "last_studied_at": iso(row.last_studied_at), "updated_at": iso(row.updated_at),
    }


def default_study_state(slug: str) -> dict[str, Any]:
    return {"slug": slug, "state": "not_reviewed", "pending_deep_dive": False, "last_studied_at": None, "updated_at": None}


def get_study_state(engine: Engine, slug: str) -> dict[str, Any]:
    with engine.connect() as conn:
        row = conn.execute(select(S).where(S.c.user_id == USER, S.c.slug == slug)).one_or_none()
    return study_state_dict(row) if row else default_study_state(slug)


def put_study_state(
    engine: Engine, slug: str, state: str, pending_deep_dive: bool, last_studied_at: datetime | None
) -> dict[str, Any]:
    """Reemplaza el estado. Si last_studied_at no viene, se conserva el valor anterior (ADR-006)."""
    stmt = insert(S).values(
        user_id=USER, slug=slug, state=state, pending_deep_dive=pending_deep_dive,
        last_studied_at=last_studied_at, updated_at=now(),
    )
    stmt = stmt.on_conflict_do_update(
        index_elements=[S.c.user_id, S.c.slug],
        set_={
            "state": stmt.excluded.state,
            "pending_deep_dive": stmt.excluded.pending_deep_dive,
            "last_studied_at": func.coalesce(stmt.excluded.last_studied_at, S.c.last_studied_at),
            "updated_at": stmt.excluded.updated_at,
        },
    )
    with engine.begin() as conn:
        conn.execute(stmt)
    return get_study_state(engine, slug)


def list_study_states(
    engine: Engine, slugs: list[str], state: str | None, limit: int, offset: int
) -> dict[str, Any]:
    condition = and_(S.c.user_id == USER, S.c.slug.in_(slugs), *([S.c.state == state] if state else []))
    with engine.connect() as conn:
        total = conn.execute(select(func.count()).select_from(S).where(condition)).scalar_one()
        rows = conn.execute(
            select(S).where(condition).order_by(S.c.updated_at.desc(), S.c.slug).limit(limit).offset(offset)
        ).all()
    return {"total": total, "limit": limit, "offset": offset, "items": [study_state_dict(r) for r in rows]}


# --- Notas -------------------------------------------------------------------

N = t.me_notes


def note_dict(row: Any) -> dict[str, Any]:
    return {
        "id": row.id, "slug": row.slug, "body_markdown": row.body_markdown,
        "created_at": iso(row.created_at), "updated_at": iso(row.updated_at),
    }


def list_notes(engine: Engine, slug: str) -> dict[str, Any]:
    with engine.connect() as conn:
        rows = conn.execute(
            select(N).where(N.c.user_id == USER, N.c.slug == slug).order_by(N.c.created_at.desc(), N.c.id)
        ).all()
    return {"slug": slug, "items": [note_dict(r) for r in rows]}


def create_note(engine: Engine, slug: str, body: str) -> dict[str, Any]:
    moment = now()
    values = {"user_id": USER, "id": str(uuid.uuid4()), "slug": slug, "body_markdown": body,
              "created_at": moment, "updated_at": moment}
    with engine.begin() as conn:
        row = conn.execute(insert(N).values(**values).returning(*N.c)).one()
    return note_dict(row)


def note_condition(slug: str, note_id: str) -> Any:
    return and_(N.c.user_id == USER, N.c.slug == slug, N.c.id == note_id)


def update_note(engine: Engine, slug: str, note_id: str, body: str) -> dict[str, Any] | None:
    with engine.begin() as conn:
        row = conn.execute(
            update(N).where(note_condition(slug, note_id)).values(body_markdown=body, updated_at=now()).returning(*N.c)
        ).one_or_none()
    return note_dict(row) if row else None


def delete_note(engine: Engine, slug: str, note_id: str) -> bool:
    with engine.begin() as conn:
        result = conn.execute(delete(N).where(note_condition(slug, note_id)))
    return result.rowcount > 0


# --- Favoritos ---------------------------------------------------------------

F = t.me_favorites


def favorite_dict(row: Any) -> dict[str, Any]:
    return {"slug": row.slug, "favorite": row.favorite, "updated_at": iso(row.updated_at)}


def get_favorite(engine: Engine, slug: str) -> dict[str, Any]:
    with engine.connect() as conn:
        row = conn.execute(select(F).where(F.c.user_id == USER, F.c.slug == slug)).one_or_none()
    return favorite_dict(row) if row else {"slug": slug, "favorite": False, "updated_at": None}


def put_favorite(engine: Engine, slug: str, favorite: bool) -> dict[str, Any]:
    stmt = insert(F).values(user_id=USER, slug=slug, favorite=favorite, updated_at=now())
    stmt = stmt.on_conflict_do_update(
        index_elements=[F.c.user_id, F.c.slug],
        set_={"favorite": stmt.excluded.favorite, "updated_at": stmt.excluded.updated_at},
    )
    with engine.begin() as conn:
        conn.execute(stmt)
    return get_favorite(engine, slug)


def list_favorites(engine: Engine, slugs: list[str], limit: int, offset: int) -> dict[str, Any]:
    condition = and_(F.c.user_id == USER, F.c.favorite.is_(True), F.c.slug.in_(slugs))
    with engine.connect() as conn:
        total = conn.execute(select(func.count()).select_from(F).where(condition)).scalar_one()
        rows = conn.execute(
            select(F).where(condition).order_by(F.c.updated_at.desc(), F.c.slug).limit(limit).offset(offset)
        ).all()
    return {"total": total, "limit": limit, "offset": offset, "items": [favorite_dict(r) for r in rows]}
