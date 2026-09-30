from __future__ import annotations

from typing import Any

from fastapi import APIRouter

from backend.app import projection as p
from backend.app.deps import Index, Slug
from backend.app.errors import NotFound

router = APIRouter(tags=["knowledge"])


@router.get("/entities/{slug}/relations")
def get_relations(slug: Slug, index: Index) -> dict[str, Any]:
    if not p.exists(index, slug):
        raise NotFound("una entidad o concepto", slug)
    return p.relation_groups(index, slug)
