from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Query

from backend.app import search as fts
from backend.app.deps import Classification, DbEngine, OptionalSlug, ResultType

router = APIRouter(tags=["search"])


@router.get("/search")
def search(
    engine: DbEngine,
    q: Annotated[str, Query(min_length=2, max_length=200)],
    type: ResultType | None = None,  # noqa: A002 - nombre del parámetro en el contrato
    domain: OptionalSlug = None,
    classification: Classification | None = None,
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
) -> dict[str, Any]:
    filters = {"type": type, "domain": domain, "classification": classification}
    return fts.search(engine, q, limit=limit, filters=filters)
