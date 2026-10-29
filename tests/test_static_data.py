"""Datos de la demo estática (scripts/static/build_static_data.py)."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from scripts.static import build_static_data as s
import datetime as dt

from scripts.static import package_static
from scripts.static.package_static import check_base_path, zip_name


def read(out: Path, relative: str) -> Any:
    return json.loads((out / relative).read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def out(tmp_path_factory: pytest.TempPathFactory) -> Path:
    path = tmp_path_factory.mktemp("static") / "data"
    s.build(path)
    return path


def test_every_list_item_has_its_detail(out: Path) -> None:
    index = read(out, "index.json")
    for list_file, prefix in [("concepts.json", "concepts"), ("technologies.json", "technologies"),
                              ("snippets.json", "snippets")]:
        for item in read(out, list_file)["items"]:
            assert index[f"GET /{prefix}/{item['slug']}"] == f"{prefix}/{item['slug']}.json"
            assert f"GET /entities/{item['slug']}/relations" in index
    for item in read(out, "domains.json")["items"]:
        assert f"GET /domains/{item['slug']}" in index


def test_lists_cover_all_content(out: Path) -> None:
    concepts = read(out, "concepts.json")
    assert concepts["total"] == len(concepts["items"]) == len(s.p.load_index(s.ROOT / "content", s.ROOT / "schemas").concepts)
    assert len(read(out, "domains.json")["items"]) == 24   # 24-privacy-engineering desde ADR-027


def test_keys_read_by_static_mode_exist(out: Path) -> None:
    index = read(out, "index.json")
    for key in ["GET /domains", "GET /concepts?limit=500", "GET /technologies?limit=500", "GET /snippets?limit=500"]:
        assert key in index
    assert all((out / relative).is_file() for relative in index.values())


def test_no_personal_or_search_responses(out: Path) -> None:
    keys = read(out, "index.json")
    assert not [k for k in keys if k.startswith(("GET /me", "PUT ", "POST ", "DELETE ", "GET /search"))]
    assert not (out / "me").exists()


def test_search_index_shape(out: Path) -> None:
    documents = read(out, "search-index.json")["documents"]
    assert len({d["id"] for d in documents}) == len(documents)
    expected = {"id", "slug", "title", "type", "domain", "classification", "has_page", "snippet", "tags", "aliases"}
    assert all(set(d) == expected and isinstance(d["tags"], list) for d in documents)
    assert {d["type"] for d in documents} <= s.SEARCH_TYPES  # sin fuentes: no tienen página
    cdc = next(d for d in documents if d["slug"] == "change-data-capture")
    assert cdc["has_page"] and cdc["tags"]


def test_rebuild_is_idempotent(out: Path, tmp_path: Path) -> None:
    again = tmp_path / "data"
    s.build(again)
    first = {p.relative_to(out): p.read_bytes() for p in out.rglob("*") if p.is_file()}
    second = {p.relative_to(again): p.read_bytes() for p in again.rglob("*") if p.is_file()}
    assert first == second


@pytest.mark.parametrize("value", ["C:/Program Files/Git/aprendizaje-continuo", "aprendizaje-continuo", "/", "/x/"])
def test_base_path_rejects_converted_or_bad_values(value: str) -> None:
    with pytest.raises(SystemExit):
        check_base_path(value)


def test_base_path_accepts_cpanel_folder() -> None:
    assert check_base_path("/aprendizaje-continuo") == "/aprendizaje-continuo"


def test_zip_name_uses_local_date_and_time() -> None:
    assert zip_name(dt.datetime(2026, 10, 8, 19, 5, 7)) == "dekh-static-2026-10-08-190507.zip"
    assert zip_name(dt.datetime(2026, 10, 8, 19, 5, 7)) != zip_name(dt.datetime(2026, 10, 8, 19, 5, 8))


def test_package_refuses_to_overwrite(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(package_static, "DIST", tmp_path)
    moment = dt.datetime(2026, 10, 8, 19, 5, 7)
    existing = tmp_path / zip_name(moment)
    existing.write_bytes(b"anterior")
    with pytest.raises(SystemExit):
        package_static.package(moment)
    assert existing.read_bytes() == b"anterior"


def test_search_index_includes_aliases(out: Path) -> None:
    """ADR-010: el índice estático lleva los alias; el navegador los indexa si browserSearch.ts los incluye."""
    documents = {d["slug"]: d for d in read(out, "search-index.json")["documents"]}
    assert documents["gcp-dataplex"]["aliases"] == ["Dataplex", "Dataplex Universal Catalog"]
    assert documents["gcp-cloud-composer"]["aliases"] == ["Cloud Composer", "Composer"]
    assert all(isinstance(d["aliases"], list) for d in documents.values())



def test_privacy_engineering_domain_has_band_and_legal_framework(out: Path) -> None:
    """ADR-027: el dominio 24 trae la banda y el marco legal para la UI."""
    domain = read(out, "domains/privacy-engineering.json")
    assert domain["band"] == "especializacion"
    assert [f["key"] for f in domain["legal_framework"]["facts"]] == ["law-name", "effective-date", "postponement-bill"]
