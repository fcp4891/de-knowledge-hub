from __future__ import annotations

from typing import Any

from fastapi import APIRouter

from backend.app import projection as p
from backend.app.deps import Classification, Index, Kind, Level, Limit, Offset, OptionalSlug, Slug
from backend.app.errors import NotFound

router = APIRouter(tags=["knowledge"])


@router.get("/concepts")
def list_concepts(
    index: Index,
    domain: OptionalSlug = None,
    subdomain: OptionalSlug = None,
    kind: Kind | None = None,
    classification: Classification | None = None,
    level: Level | None = None,
    mvp: bool | None = None,
    has_page: bool | None = None,
    limit: Limit = 50,
    offset: Offset = 0,
) -> dict[str, Any]:
    filters = {
        "domain": domain, "subdomain": subdomain, "kind": kind, "classification": classification,
        "level": level, "mvp": mvp, "has_page": has_page,
    }
    return p.concept_list(index, limit=limit, offset=offset, filters=filters)


@router.get("/concepts/{slug}")
def get_concept(slug: Slug, index: Index) -> dict[str, Any]:
    if slug not in index.concepts:
        raise NotFound("un concepto", slug)
    return p.concept_detail(index, slug)
