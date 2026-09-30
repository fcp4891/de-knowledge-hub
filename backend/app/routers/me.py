"""Estado personal /me (§37, A-F2.4, ADR-006). Usuario único."""

from __future__ import annotations

from typing import Annotated, Any, Literal

from fastapi import APIRouter, Path, Response
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field

from backend.app import personal as me
from backend.app.deps import DbEngine, Index, Limit, Offset, Slug
from backend.app.errors import NotFound

router = APIRouter(prefix="/me", tags=["me"])

StudyStatus = Literal["not_reviewed", "reviewing", "understood", "applied", "needs_review"]
NoteId = Annotated[str, Path(pattern=r"^[A-Za-z0-9-]+$", min_length=1, max_length=64)]


class StudyStateUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    state: StudyStatus
    pending_deep_dive: bool = False
    last_studied_at: AwareDatetime | None = None


class NoteBody(BaseModel):
    model_config = ConfigDict(extra="forbid")
    body_markdown: Annotated[str, Field(min_length=1, max_length=20000)]


class FavoriteUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    favorite: bool


def require_target(index: Index, slug: str) -> None:
    if not me.is_target(index, slug):
        raise NotFound("un concepto o tecnología", slug)


# --- Estado de estudio -------------------------------------------------------


@router.get("/study-state")
def list_study_states(
    engine: DbEngine, index: Index, state: StudyStatus | None = None, limit: Limit = 50, offset: Offset = 0
) -> dict[str, Any]:
    return me.list_study_states(engine, me.visible_slugs(index), state, limit, offset)


@router.get("/study-state/{slug}")
def get_study_state(slug: Slug, engine: DbEngine, index: Index) -> dict[str, Any]:
    require_target(index, slug)
    return me.get_study_state(engine, slug)


@router.put("/study-state/{slug}")
def put_study_state(slug: Slug, body: StudyStateUpdate, engine: DbEngine, index: Index) -> dict[str, Any]:
    require_target(index, slug)
    return me.put_study_state(engine, slug, body.state, body.pending_deep_dive, body.last_studied_at)


# --- Notas -------------------------------------------------------------------


@router.get("/notes/{slug}")
def list_notes(slug: Slug, engine: DbEngine, index: Index) -> dict[str, Any]:
    require_target(index, slug)
    return me.list_notes(engine, slug)


@router.post("/notes/{slug}", status_code=201)
def create_note(slug: Slug, body: NoteBody, engine: DbEngine, index: Index) -> dict[str, Any]:
    require_target(index, slug)
    return me.create_note(engine, slug, body.body_markdown)


@router.put("/notes/{slug}/{note_id}")
def update_note(slug: Slug, note_id: NoteId, body: NoteBody, engine: DbEngine, index: Index) -> dict[str, Any]:
    require_target(index, slug)
    note = me.update_note(engine, slug, note_id, body.body_markdown)
    if note is None:
        raise NotFound(f"una nota de '{slug}'", note_id)
    return note


@router.delete("/notes/{slug}/{note_id}", status_code=204)
def delete_note(slug: Slug, note_id: NoteId, engine: DbEngine, index: Index) -> Response:
    require_target(index, slug)
    if not me.delete_note(engine, slug, note_id):
        raise NotFound(f"una nota de '{slug}'", note_id)
    return Response(status_code=204)


# --- Favoritos ---------------------------------------------------------------


@router.get("/favorites")
def list_favorites(engine: DbEngine, index: Index, limit: Limit = 50, offset: Offset = 0) -> dict[str, Any]:
    return me.list_favorites(engine, me.visible_slugs(index), limit, offset)


@router.get("/favorites/{slug}")
def get_favorite(slug: Slug, engine: DbEngine, index: Index) -> dict[str, Any]:
    require_target(index, slug)
    return me.get_favorite(engine, slug)


@router.put("/favorites/{slug}")
def put_favorite(slug: Slug, body: FavoriteUpdate, engine: DbEngine, index: Index) -> dict[str, Any]:
    require_target(index, slug)
    return me.put_favorite(engine, slug, body.favorite)
