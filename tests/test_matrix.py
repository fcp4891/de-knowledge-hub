"""Tests de la validación de content/matrix/ (ADR-004)."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pytest
import yaml

from tests.test_blueprint import bp_concept, domain_doc, write_domain
from tests.test_validate import assert_error, content, entity, run, technology, write_yaml  # noqa: F401

TODAY = "2026-09-28"
PROVIDER_SERVICES = {"gcp": "gcp-store", "aws": "aws-store", "azure": "azure-store"}


def service(slug: str, provider: str) -> dict[str, Any]:
    return entity("cloud_service", slug, provider=provider, category="object-storage", classification="modern")


def cell(*services: str) -> dict[str, Any]:
    return {
        "services": list(services),
        "differences": "Diferencia arquitectónica relevante entre proveedores.",
        "not_equivalent_when": "Caso en que la equivalencia no se sostiene.",
    }


def capability(capability_id: str = "object-storage", **fields: Any) -> dict[str, Any]:
    base = {
        "id": capability_id,
        "title": "Almacenamiento de objetos",
        "concepts": ["data-lake"],
        "clouds": {column: cell(slug) for column, slug in PROVIDER_SERVICES.items()},
        "verification_status": "review_required",
        "last_verified": TODAY,
    }
    return {**base, **fields}


def write_matrix(content: Path, *capabilities: dict[str, Any]) -> None:
    path = content / "matrix" / "capabilities.yaml"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(yaml.safe_dump({"capabilities": list(capabilities)}, allow_unicode=True), encoding="utf-8")


@pytest.fixture
def setup(content: Path) -> Path:
    """Blueprint mínimo y un servicio de almacenamiento por proveedor."""
    write_domain(content, domain_doc("01", "fundamentals", bp_concept("data-lake")))
    for column, slug in PROVIDER_SERVICES.items():
        write_yaml(content, f"technologies/{slug}.yaml", service(slug, column))
    return content


def test_valid_matrix(setup: Path) -> None:
    write_matrix(setup, capability())
    report = run(setup)
    assert report.ok, report.errors
    assert report.matrix_capabilities == 1
    assert report.documents == 3


def test_matrix_requires_differences(setup: Path) -> None:
    bad = capability()
    del bad["clouds"]["aws"]["differences"]
    write_matrix(setup, bad)
    assert_error(run(setup), "'differences' is a required property")


def test_matrix_requires_all_clouds(setup: Path) -> None:
    bad = capability()
    del bad["clouds"]["azure"]
    write_matrix(setup, bad)
    assert_error(run(setup), "'azure' is a required property")


def test_matrix_capability_must_be_category(setup: Path) -> None:
    write_matrix(setup, capability("storage"))
    assert_error(run(setup), "'storage' is not one of")


def test_duplicate_capability(setup: Path) -> None:
    write_matrix(setup, capability(), capability())
    assert_error(run(setup), "capacidad duplicada: 'object-storage'")


def test_unknown_anchor_concept(setup: Path) -> None:
    write_matrix(setup, capability(concepts=["ghost"]))
    assert_error(run(setup), "concepto inexistente en el blueprint: 'ghost'")


def test_missing_service(setup: Path) -> None:
    bad = capability()
    bad["clouds"]["gcp"] = cell("gcp-ghost")
    write_matrix(setup, bad)
    assert_error(run(setup), "clouds.gcp.services.0]", "servicio inexistente: 'gcp-ghost'")


def test_service_from_wrong_provider(setup: Path) -> None:
    bad = capability()
    bad["clouds"]["gcp"] = cell("aws-store")
    write_matrix(setup, bad)
    assert_error(run(setup), "'aws-store' es de aws, no de gcp")


def test_service_must_be_cloud_service(setup: Path) -> None:
    write_yaml(setup, "technologies/kafka.yaml", technology("kafka"))
    bad = capability()
    bad["clouds"]["gcp"] = cell("kafka")
    write_matrix(setup, bad)
    assert_error(run(setup), "'kafka' es technology, se esperaba cloud_service")
