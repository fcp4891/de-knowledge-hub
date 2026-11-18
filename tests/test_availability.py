"""ADR-031: disponibilidad por ficha (available, in_review, in_development) y sus textos en content/ui/."""

from __future__ import annotations

from pathlib import Path

import pytest

from backend.app import projection
from tests.test_validate import assert_error, content, run, write_yaml  # noqa: F401 - fixture

ROOT = Path(__file__).resolve().parent.parent
STEP_1 = {"chile-data-protection": "available", "pii-identification": "available",
          "processing-activities-inventory": "available"}
STEP_2_REVIEW = "data-minimization-by-layer"   # «En revisión» en el tramo 2; el resto de los tramos 2 a 5, en desarrollo
STEPS_2_TO_5 = ("diseno-protegido", "derechos-ciclo-vida", "riesgo-terceros-incidentes", "evidencia-automatizacion")


@pytest.fixture(scope="module")
def index() -> projection.ContentIndex:
    return projection.load_index(ROOT / "content", ROOT / "schemas")


def test_privacy_route_availability(index: projection.ContentIndex) -> None:
    """Paso 1: las tres fichas disponibles; pasos 2 a 5: Minimización por capa en revisión y las demás en desarrollo."""
    for slug, status in STEP_1.items():
        assert projection.concept_summary(index, slug)["availability"] == status
    later = [slug for slug, entry in index.concepts.items() if entry.subdomain["slug"] in STEPS_2_TO_5]
    assert len(later) == 12
    assert projection.concept_summary(index, STEP_2_REVIEW)["availability"] == "in_review"
    assert {projection.concept_summary(index, slug)["availability"] for slug in later if slug != STEP_2_REVIEW} == {"in_development"}
    assert projection.concept_summary(index, "gdpr")["availability"] == "available"   # sin el campo: available


def test_unavailable_page_is_minimal(index: projection.ContentIndex) -> None:
    """La URL se publica, pero sin contenido: título, etiqueta, ayuda y vuelta al itinerario (subdomain)."""
    detail = projection.concept_detail(index, "chilean-identifier-pseudonymization")
    assert detail["availability"] == "in_development"
    assert detail["availability_text"] == {"label": "En desarrollo", "help": "Contenido y diseño en preparación.",
                                           "back_label": "Volver al itinerario"}
    assert detail["sections"] == [] and detail["sources"] == [] and detail["legal_basis"] == []
    assert "views" not in detail and "annexes" not in detail
    assert detail["title"] and detail["subdomain"] == "diseno-protegido"
    review = projection.concept_detail(index, "data-minimization-by-layer")["availability_text"]
    assert (review["label"], review["help"]) == ("En revisión", "Contenido listo; en revisión antes de publicarse.")


def test_links_to_unavailable_pages_are_marked(index: projection.ContentIndex) -> None:
    detail = projection.concept_detail(index, "pii-identification")
    assert detail["availability"] == "available" and "availability_text" not in detail
    marked = {link["slug"]: link["target_availability"] for link in detail["unavailable_links"]}
    assert marked["data-minimization-by-layer"] == "in_review"
    assert marked["privacy-controls-as-code"] == "in_development"
    assert "chile-data-protection" not in marked
    pages = [s for g in detail["views"]["sources_grouped"]["groups"] for s in g["sources"] if "page" in s]
    assert {s["page"]: s.get("target_availability") for s in pages} == {
        "chile-data-protection": None, "chilean-identifier-pseudonymization": "in_development",
        "data-minimization-by-layer": "in_review", "privacy-controls-as-code": "in_development"}
    groups = projection.relation_groups(index, "pii-identification")["groups"]
    items = {i["slug"]: i.get("target_availability") for g in groups for i in g["items"]}
    assert items["chilean-identifier-pseudonymization"] == "in_development" and items["chile-data-protection"] is None


def test_ui_files_need_their_schema(content: Path) -> None:  # noqa: F811
    write_yaml(content, "ui/availability.yaml", {"in_review": {"label": "x", "help": "y", "count": "{n} x"},
                                                 "in_development": {"label": "x", "help": "y", "count": "{n} x"},
                                                 "available": {"count": "{n} disponibles"},
                                                 "route_count": "{n} de {total}", "back_label": "z"})
    assert run(content).ok
    write_yaml(content, "ui/availability.yaml", {"in_review": {"label": "x"}, "back_label": "z"})
    assert_error(run(content), "'help' is a required property")
    write_yaml(content, "ui/otro.yaml", {"a": 1})
    assert_error(run(content), "content/ui/otro.yaml no tiene schema (ADR-031)")


def test_unavailable_pages_do_not_index_their_body(index: projection.ContentIndex) -> None:
    """La búsqueda de una ficha no disponible ve solo el título y la etiqueta (API, navegador y base)."""
    from backend.db.compiler import entity_search_document
    from scripts.static.build_static_data import search_documents

    item = next(i for i in projection.candidates(index) if i["slug"] == "data-minimization-by-layer")
    assert (item["text"], item["aliases"]) == ("En revisión", [])
    assert projection.search(index, "seudónimos")["total"] == 0 or all(
        hit["slug"] != "data-minimization-by-layer" for g in projection.search(index, "seudónimos")["groups"] for hit in g["items"])
    static = {d["slug"]: d for d in search_documents(index)}
    assert static["data-minimization-by-layer"]["tags"] == [] and static["data-minimization-by-layer"]["snippet"] == "En revisión"
    assert static["pii-identification"]["tags"]   # una ficha disponible conserva sus etiquetas
    page = index.entities["data-minimization-by-layer"]
    doc = entity_search_document(page, index.bodies["data-minimization-by-layer"])
    assert (doc["body"], doc["summary"], doc["tags"], doc["snippet"]) == ("", "", "", page["title"])
    available = entity_search_document(index.entities["pii-identification"], index.bodies["pii-identification"])
    assert available["body"]


def test_domain_detail_exposes_the_route_texts(index: projection.ContentIndex) -> None:
    """ADR-031, enmienda 1: el itinerario toma de DomainDetail las etiquetas y los conteos por tramo."""
    texts = projection.domain_detail(index, "privacy-engineering")["availability_texts"]
    assert texts["available"]["count"] == "{n} disponibles"
    assert texts["in_review"]["count"] == "{n} en revisión"
    assert texts["route_count"] == "{n} de {total} fichas disponibles"


def test_static_search_index_carries_availability(index: projection.ContentIndex) -> None:
    """A1: la búsqueda del sitio estático lee el estado y la etiqueta de search-index.json, sin llamar a una API."""
    from scripts.static.build_static_data import search_documents

    docs = {d["slug"]: d for d in search_documents(index)}
    assert docs["data-minimization-by-layer"]["availability"] == {
        "status": "in_review", "label": "En revisión", "help": "Contenido listo; en revisión antes de publicarse."}
    assert docs["chilean-identifier-pseudonymization"]["availability"]["label"] == "En desarrollo"
    assert "availability" not in docs["processing-activities-inventory"]
    assert "availability" not in docs["pii-identification"]
