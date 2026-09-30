"""Dependencias y tipos de parámetros compartidos por los routers (Pydantic valida los parámetros)."""

from __future__ import annotations

from typing import Annotated, Literal

from fastapi import Depends, Path, Query, Request
from sqlalchemy import Engine

from backend.app.projection import ContentIndex
from backend.app.repository import KnowledgeRepository

SLUG_PATTERN = r"^[a-z0-9]+(-[a-z0-9]+)*$"

Slug = Annotated[str, Path(pattern=SLUG_PATTERN, max_length=100)]
OptionalSlug = Annotated[str | None, Query(pattern=SLUG_PATTERN, max_length=100)]
Limit = Annotated[int, Query(ge=1, le=500)]
Offset = Annotated[int, Query(ge=0)]
Classification = Literal["core", "modern", "emerging"]
Level = Literal["basic", "intermediate", "advanced"]
Kind = Literal["concept", "pattern", "architecture"]
TechnologyType = Literal["technology", "cloud_service"]
Origin = Literal["gcp", "aws", "azure", "open-source", "other"]
ResultType = Literal["concept", "pattern", "architecture", "technology", "cloud_service", "source"]


def repository(request: Request) -> KnowledgeRepository:
    repo: KnowledgeRepository = request.app.state.repository
    return repo


def content_index(repo: Annotated[KnowledgeRepository, Depends(repository)]) -> ContentIndex:
    return repo.index()


def engine(repo: Annotated[KnowledgeRepository, Depends(repository)]) -> Engine:
    return repo.engine


Index = Annotated[ContentIndex, Depends(content_index)]
DbEngine = Annotated[Engine, Depends(engine)]
