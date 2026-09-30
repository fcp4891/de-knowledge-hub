from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Query

from backend.app import projection as p
from backend.app.deps import Classification, Index, Limit, Offset, Origin, Slug, TechnologyType
from backend.app.errors import NotFound

router = APIRouter(tags=["knowledge"])


@router.get("/technologies")
def list_technologies(
    index: Index,
    type: TechnologyType | None = None,  # noqa: A002 - nombre del parámetro en el contrato
    origin: Origin | None = None,
    category: Annotated[str | None, Query(max_length=40)] = None,
    classification: Classification | None = None,
    mvp: bool | None = None,
    limit: Limit = 50,
    offset: Offset = 0,
) -> dict[str, Any]:
    filters = {"type": type, "origin": origin, "category": category, "classification": classification, "mvp": mvp}
    return p.technology_list(index, limit=limit, offset=offset, filters=filters)


@router.get("/technologies/{slug}")
def get_technology(slug: Slug, index: Index) -> dict[str, Any]:
    if index.entities.get(slug, {}).get("type") not in p.TECHNOLOGY_TYPES:
        raise NotFound("una tecnología", slug)
    return p.technology_detail(index, slug)
