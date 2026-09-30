"""Errores en formato application/problem+json (RFC 9457), según docs/contracts/api.yaml."""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette.exceptions import HTTPException

PROBLEM_JSON = "application/problem+json"


class Problem(BaseModel):
    type: str = "about:blank"
    title: str
    status: int
    detail: str | None = None


def problem(status: int, title: str, detail: str | None = None) -> JSONResponse:
    body = Problem(title=title, status=status, detail=detail).model_dump(exclude_none=True)
    return JSONResponse(body, status_code=status, media_type=PROBLEM_JSON)


class NotFound(HTTPException):
    def __init__(self, kind: str, slug: str) -> None:
        super().__init__(status_code=404, detail=f"No existe {kind} con slug '{slug}'.")


async def http_error(_: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, HTTPException)
    title = "No encontrado" if exc.status_code == 404 else "Error"
    return problem(exc.status_code, title, str(exc.detail) if exc.detail else None)


async def validation_error(_: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, RequestValidationError)
    details = "; ".join(f"{'.'.join(str(p) for p in e['loc'])}: {e['msg']}" for e in exc.errors())
    return problem(422, "Parámetros inválidos", details)


def install(app: FastAPI) -> None:
    app.add_exception_handler(HTTPException, http_error)
    app.add_exception_handler(RequestValidationError, validation_error)
