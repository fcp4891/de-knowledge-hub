"""Code Library (§23, ADR-008)."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter

from backend.app import projection as p
from backend.app.deps import Cloud, Index, Language, Limit, Offset, OptionalSlug, Slug
from backend.app.errors import NotFound

router = APIRouter(tags=["knowledge"])


@router.get("/snippets")
def list_snippets(
    index: Index,
    language: Language | None = None,
    cloud: Cloud | None = None,
    implements: OptionalSlug = None,
    limit: Limit = 50,
    offset: Offset = 0,
) -> dict[str, Any]:
    filters = {"language": language, "cloud": cloud, "implements": implements}
    return p.snippet_list(index, limit=limit, offset=offset, filters=filters)


@router.get("/snippets/{slug}")
def get_snippet(slug: Slug, index: Index) -> dict[str, Any]:
    if index.entities.get(slug, {}).get("type") != p.SNIPPET_TYPE:
        raise NotFound("un snippet", slug)
    return p.snippet_detail(index, slug)
