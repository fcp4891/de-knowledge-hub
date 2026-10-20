"""Tests de los generadores de arranque (scripts/generators/)."""

from __future__ import annotations

import shutil
from pathlib import Path

import pytest
import yaml

from backend.content import validate as v
from scripts.generators import sources, technologies

ROOT = Path(__file__).resolve().parent.parent
F0_STUBS = ("debezium", "apache-kafka", "gcp-datastream", "apache-flink")  # escritos a mano (F0 y apache-flink de F3b-14b)


@pytest.fixture
def generated(tmp_path: Path) -> Path:
    """content/ mínimo: tecnologías generadas + entidades de F0 + registro generado."""
    content = tmp_path / "content"
    technologies.generate(content / "technologies")
    for slug in F0_STUBS:
        shutil.copy(ROOT / "content" / "technologies" / f"{slug}.yaml", content / "technologies")
    shutil.copytree(ROOT / "content" / "concepts", content / "concepts")
    sources.main(["--out", str(content / "sources" / "registry.yaml")])
    return content


def test_generated_bundle_validates(generated: Path) -> None:
    report = v.validate(generated, ROOT / "schemas")
    assert report.ok, report.errors


def test_technologies_generator_is_idempotent(generated: Path) -> None:
    assert technologies.generate(generated / "technologies") == (0, 89)


def test_generated_technologies_exist_in_content() -> None:
    generated = {slug for slug, _ in [*technologies.cloud_docs(), *technologies.other_docs()]}
    existing = {p.stem for p in (ROOT / "content" / "technologies").glob("*.yaml")}
    assert generated <= existing


def test_sources_generator_is_deterministic() -> None:
    assert sources.build() == sources.build()


def test_sources_generator_matches_committed_registry_except_dates() -> None:
    def comparable(text: str) -> list[dict[str, object]]:
        return [{k: val for k, val in doc.items() if k != "updated_at"} for doc in yaml.safe_load_all(text)]

    committed = (ROOT / "content" / "sources" / "registry.yaml").read_text(encoding="utf-8")
    assert comparable(sources.build()) == comparable(committed)


def test_sources_generator_refuses_to_overwrite(tmp_path: Path) -> None:
    out = tmp_path / "registry.yaml"
    out.write_text("existente", encoding="utf-8")
    with pytest.raises(SystemExit):
        sources.main(["--out", str(out)])
    assert out.read_text(encoding="utf-8") == "existente"
