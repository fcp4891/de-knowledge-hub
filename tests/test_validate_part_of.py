"""Tests de la jerarquía de fichas padre e hijas (ADR-024) en backend/content/validate.py."""

from __future__ import annotations

from pathlib import Path

from backend.app import projection as p
from tests.test_blueprint import bp_concept, domain_doc, write_domain
from tests.test_validate import ROOT, SCHEMAS, assert_error, concept, content, run, technology, write_md, write_yaml  # noqa: F401

PARENT_BODY = "## 17. Conceptos relacionados\n\n- `b`: hija.\n- `c`: hija.\n"
CHILD_BODY = "## 17. Conceptos relacionados\n\n- `a`: ficha padre.\n"


def part_of(target: str) -> list[dict[str, str]]:
    return [{"type": "PART_OF", "target": target}]


def family(content: Path, parent_body: str = PARENT_BODY) -> None:
    write_md(content, "concepts/a.md", concept("a"), body=parent_body)
    for slug in ("b", "c"):
        write_md(content, f"concepts/{slug}.md", concept(slug, relations=part_of("a")), body=CHILD_BODY)


def test_parent_naming_its_children_passes(content: Path) -> None:
    family(content)
    report = run(content)
    assert report.ok, report.errors


def test_parent_must_name_every_child_in_related_section(content: Path) -> None:
    family(content, parent_body="## 17. Conceptos relacionados\n\n- `b`: hija.\n")
    assert_error(run(content), "[§17] 'c' es ficha hija (PART_OF) y el §17 no lo nombra")


def test_children_count_for_related_topics_of_the_parent(content: Path) -> None:
    write_md(content, "concepts/a.md", concept("a", related_topics=["b"]), body="## 17. Conceptos relacionados\n\n- `b`: hija.\n")
    write_md(content, "concepts/b.md", concept("b", relations=part_of("a")), body=CHILD_BODY)
    report = run(content)
    assert report.ok, report.errors


def test_at_most_one_parent(content: Path) -> None:
    write_md(content, "concepts/a.md", concept("a"))
    write_md(content, "concepts/d.md", concept("d"))
    write_md(content, "concepts/b.md", concept("b", relations=part_of("a") + part_of("d")))
    assert_error(run(content), "PART_OF -> a, d: una ficha tiene a lo sumo una ficha padre")


def test_cycle_is_an_error(content: Path) -> None:
    write_md(content, "concepts/a.md", concept("a", relations=part_of("b")))
    write_md(content, "concepts/b.md", concept("b", relations=part_of("a")))
    assert_error(run(content), "PART_OF -> 'b': la jerarquía forma un ciclo", "PART_OF -> 'a': la jerarquía forma un ciclo")


def test_parent_in_another_subdomain_of_the_same_domain_passes(content: Path) -> None:
    """Enmienda de ADR-024 por ADR-027: la padre puede estar en otro subdominio del mismo dominio."""
    doc = domain_doc("01", "fundamentals", bp_concept("a"))
    doc["subdomains"].append({"slug": "other-topics", "title": "Otra", "concepts": [bp_concept("b")]})
    write_domain(content, doc)
    write_md(content, "concepts/a.md", concept("a", domain="fundamentals"), body=PARENT_BODY.replace("- `c`: hija.\n", ""))
    write_md(content, "concepts/b.md", concept("b", domain="fundamentals", relations=part_of("a")), body=CHILD_BODY)
    report = run(content)
    assert not [e for e in report.errors if "PART_OF" in e], report.errors


def test_parent_in_another_domain_is_an_error(content: Path) -> None:
    write_domain(content, domain_doc("01", "fundamentals", bp_concept("a")))
    write_domain(content, domain_doc("02", "sql", bp_concept("b")))
    write_md(content, "concepts/a.md", concept("a", domain="fundamentals"))
    write_md(content, "concepts/b.md", concept("b", domain="sql", relations=part_of("a")))
    assert_error(run(content), "PART_OF -> 'a': la ficha padre es de otro dominio")


def test_part_of_only_between_fichas(content: Path) -> None:
    write_md(content, "concepts/a.md", concept("a"))
    write_yaml(content, "technologies/kafka.yaml", technology("kafka", relations=part_of("a")))
    assert_error(run(content), "PART_OF -> 'a': origen de tipo technology no permitido")


def test_children_follow_blueprint_order_and_parent_is_outgoing() -> None:
    index = p.load_index(ROOT / "content", SCHEMAS)
    groups = {(g["type"], g["direction"]): g for g in p.relation_groups(index, "chile-data-protection")["groups"]}
    children = [i["slug"] for i in groups[("PART_OF", "incoming")]["items"]]
    domain = [s for s, e in index.concepts.items() if e.domain["slug"] == "privacy-engineering" and s in index.entities]
    assert groups[("PART_OF", "incoming")]["label"] == "has_part"
    assert children == [s for s in domain if s != "chile-data-protection"]   # los cinco tramos, en orden (ADR-027)
    child = {(g["type"], g["direction"]): g for g in p.relation_groups(index, "retention-and-erasure")["groups"]}
    assert [i["slug"] for i in child[("PART_OF", "outgoing")]["items"]] == ["chile-data-protection"]
