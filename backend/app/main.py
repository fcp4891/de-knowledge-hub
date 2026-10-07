"""API FastAPI del Knowledge Hub (A-F2.3, ADR-002, ADR-005).

/openapi.json devuelve docs/contracts/api.yaml, no un esquema generado: el contrato es la
referencia. Las respuestas de conocimiento salen de la proyección sobre el índice en memoria
leído de PostgreSQL; /search consulta PostgreSQL FTS; /me usa SQL por petición (ADR-006).
Arranque local: make dev.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import yaml
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Engine

from backend.app import errors
from backend.app.repository import KnowledgeRepository
from backend.app.routers import concepts, domains, me, relations, search, snippets, sources, technologies
from backend.db.config import make_engine

ROOT = Path(__file__).resolve().parents[2]
CONTRACT = ROOT / "docs" / "contracts" / "api.yaml"
API_PREFIX = "/api/v1"
ROUTERS = (domains, concepts, technologies, snippets, relations, sources, search, me)
# Frontend en modo hybrid: next dev en el 3000 y, con otro worktree ocupando ese puerto, el 3010.
DEFAULT_CORS_ORIGINS = ("http://localhost:3000", "http://127.0.0.1:3000", "http://127.0.0.1:3010")


def cors_origins() -> list[str]:
    """Orígenes permitidos: CORS_ORIGINS separado por comas o, si no está o queda vacío, los de por defecto."""
    raw = os.environ.get("CORS_ORIGINS", "")
    origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
    return origins or list(DEFAULT_CORS_ORIGINS)


def contract() -> dict[str, Any]:
    spec: dict[str, Any] = yaml.safe_load(CONTRACT.read_text(encoding="utf-8"))
    spec["servers"] = [{"url": API_PREFIX}]
    return spec


def create_app(engine: Engine | None = None) -> FastAPI:
    app = FastAPI(title="Data Engineering Knowledge Hub API", version="0.1.0")
    app.state.repository = KnowledgeRepository(engine or make_engine(), ROOT / "schemas")
    app.add_middleware(
        CORSMiddleware, allow_origins=cors_origins(), allow_methods=["GET", "PUT", "POST", "DELETE"], allow_headers=["*"]
    )
    errors.install(app)
    for module in ROUTERS:
        app.include_router(module.router, prefix=API_PREFIX)
    spec = contract()
    app.openapi = lambda: spec  # type: ignore[method-assign]
    return app


app = create_app()
