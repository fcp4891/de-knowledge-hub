from __future__ import annotations

from typing import Any

from fastapi import APIRouter

from backend.app import projection as p
from backend.app.deps import Index, Slug
from backend.app.errors import NotFound

router = APIRouter(tags=["knowledge"])


@router.get("/sources/{slug}")
def get_source(slug: Slug, index: Index) -> dict[str, Any]:
    if index.entities.get(slug, {}).get("type") != "source":
        raise NotFound("una fuente", slug)
    return p.source_detail(index, slug)
