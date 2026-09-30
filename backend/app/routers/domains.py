from __future__ import annotations

from typing import Any

from fastapi import APIRouter

from backend.app import projection as p
from backend.app.deps import Index, Slug
from backend.app.errors import NotFound

router = APIRouter(tags=["knowledge"])


@router.get("/domains")
def list_domains(index: Index) -> dict[str, Any]:
    return p.domain_list(index)


@router.get("/domains/{slug}")
def get_domain(slug: Slug, index: Index) -> dict[str, Any]:
    if not any(d["domain"]["slug"] == slug for d in index.domains):
        raise NotFound("un dominio", slug)
    return p.domain_detail(index, slug)
