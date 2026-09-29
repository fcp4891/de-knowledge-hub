"""Tests de cobertura de fuentes para tecnologías MVP (criterio de salida F1, A-F1.3)."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pytest

from tests.test_validate import assert_error, content, run, source, technology, write_yaml  # noqa: F401


def tech_source(slug: str, techs: list[str], **fields: Any) -> dict[str, Any]:
    return {**source(slug), "technologies": techs, "url_verified": True, **fields}


def test_mvp_technology_with_verified_official_source(content: Path) -> None:
    write_yaml(content, "technologies/kafka.yaml", technology("kafka", mvp=True))
    write_yaml(content, "sources/registry.yaml", tech_source("kafka-docs", ["kafka"]))
    assert run(content).ok


def test_release_notes_level_2_counts(content: Path) -> None:
    write_yaml(content, "technologies/kafka.yaml", technology("kafka", mvp=True))
    write_yaml(
        content,
        "sources/registry.yaml",
        tech_source("kafka-release-notes", ["kafka"], source_type="release_notes", authority_level=2),
    )
    assert run(content).ok


def test_non_mvp_technology_without_source_is_valid(content: Path) -> None:
    write_yaml(content, "technologies/kafka.yaml", technology("kafka", mvp=False))
    assert run(content).ok


def test_mvp_technology_without_source(content: Path) -> None:
    write_yaml(content, "technologies/kafka.yaml", technology("kafka", mvp=True))
    assert_error(run(content), "[mvp] 'kafka' no tiene fuente Nivel 1–2")


@pytest.mark.parametrize(
    "fields",
    [
        {"url_verified": False},
        {"source_type": "engineering_blog", "authority_level": 3},
    ],
)
def test_mvp_source_must_be_verified_and_level_1_or_2(content: Path, fields: dict[str, Any]) -> None:
    write_yaml(content, "technologies/kafka.yaml", technology("kafka", mvp=True))
    write_yaml(content, "sources/registry.yaml", tech_source("kafka-blog", ["kafka"], **fields))
    assert_error(run(content), "[mvp] 'kafka' no tiene fuente Nivel 1–2")
