"""Valida content/ contra schemas/.

Recorre los .md (frontmatter YAML) y .yaml/.yml (uno o varios documentos
separados por ---), valida cada entidad según su `type` y verifica la
integridad global: ids y slugs únicos, referencias existentes y pares
origen/destino permitidos por relationships.schema.json.

Uso: python scripts/validate.py [--content DIR] [--schemas DIR]
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
from collections.abc import Iterator
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml
from jsonschema import Draft202012Validator
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parent.parent
CONTENT_EXTENSIONS = {".md", ".yaml", ".yml"}
SLUG_LIST_FIELDS = ("technologies", "related_topics")
TECHNOLOGY_TYPES = {"technology", "cloud_service"}


@dataclass(frozen=True)
class Document:
    path: Path
    index: int
    data: dict[str, Any]

    @property
    def location(self) -> str:
        return f"{self.path}" if self.index == 0 else f"{self.path}#{self.index}"


@dataclass
class Report:
    errors: list[str] = field(default_factory=list)
    documents: int = 0

    def add(self, location: str, message: str) -> None:
        self.errors.append(f"{location}: {message}")

    @property
    def ok(self) -> bool:
        return not self.errors


# --- Schemas -----------------------------------------------------------------


def load_registry(schemas_dir: Path) -> Registry:
    resources = []
    for path in sorted(schemas_dir.rglob("*.schema.json")):
        contents = json.loads(path.read_text(encoding="utf-8"))
        resources.append((contents["$id"], Resource.from_contents(contents)))
    return Registry().with_resources(resources)


def load_relation_catalog(schemas_dir: Path) -> dict[str, dict[str, Any]]:
    schema = json.loads((schemas_dir / "relationships.schema.json").read_text(encoding="utf-8"))
    return schema["x-relation-catalog"]


def build_validators(schemas_dir: Path) -> dict[str, Draft202012Validator]:
    registry = load_registry(schemas_dir)
    validators = {}
    for path in sorted((schemas_dir / "entities").glob("*.schema.json")):
        schema = json.loads(path.read_text(encoding="utf-8"))
        entity_type = path.name.removesuffix(".schema.json")
        validators[entity_type] = Draft202012Validator(
            schema, registry=registry, format_checker=Draft202012Validator.FORMAT_CHECKER
        )
    return validators


# --- Lectura de contenido ----------------------------------------------------


def iter_content_files(content_dir: Path) -> Iterator[Path]:
    """Archivos de contenido, ignorando carpetas o archivos que empiezan con _ o ."""
    for path in sorted(content_dir.rglob("*")):
        relative = path.relative_to(content_dir).parts
        if any(part.startswith(("_", ".")) for part in relative):
            continue
        if path.is_file() and path.suffix in CONTENT_EXTENSIONS:
            yield path


def split_frontmatter(text: str) -> str:
    """Devuelve el bloque YAML entre los delimitadores --- iniciales."""
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        raise ValueError("el archivo Markdown no empieza con frontmatter '---'")
    for i, line in enumerate(lines[1:], start=1):
        if line.strip() == "---":
            return "\n".join(lines[1:i])
    raise ValueError("frontmatter sin delimitador de cierre '---'")


def normalize(value: Any) -> Any:
    """Convierte fechas que PyYAML parsea como date/datetime a ISO string."""
    if isinstance(value, dt.datetime | dt.date):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: normalize(v) for k, v in value.items()}
    if isinstance(value, list):
        return [normalize(v) for v in value]
    return value


def parse_file(path: Path) -> list[Any]:
    text = path.read_text(encoding="utf-8")
    if path.suffix == ".md":
        return [yaml.safe_load(split_frontmatter(text))]
    return [doc for doc in yaml.safe_load_all(text) if doc is not None]


def load_documents(content_dir: Path, report: Report) -> list[Document]:
    documents = []
    for path in iter_content_files(content_dir):
        shown = path.relative_to(content_dir.parent)
        try:
            raw_docs = parse_file(path)
        except (ValueError, yaml.YAMLError) as exc:
            report.add(str(shown), f"no se pudo parsear: {exc}")
            continue
        for index, raw in enumerate(raw_docs):
            if not isinstance(raw, dict):
                report.add(str(shown), f"documento {index} no es un objeto YAML")
                continue
            documents.append(Document(shown, index, normalize(raw)))
    return documents


# --- Validación por documento ------------------------------------------------


def format_path(error_path: Any) -> str:
    parts = [str(p) for p in error_path]
    return ".".join(parts) if parts else "(raíz)"


def validate_schema(doc: Document, validators: dict[str, Draft202012Validator], report: Report) -> bool:
    entity_type = doc.data.get("type")
    validator = validators.get(entity_type) if isinstance(entity_type, str) else None
    if validator is None:
        report.add(doc.location, f"type desconocido o ausente: {entity_type!r}")
        return False
    errors = sorted(validator.iter_errors(doc.data), key=lambda e: list(e.path))
    for error in errors:
        report.add(doc.location, f"[{format_path(error.path)}] {error.message}")
    return not errors


def check_id(doc: Document, report: Report) -> None:
    expected = f"{doc.data['type']}:{doc.data['slug']}"
    if doc.data["id"] != expected:
        report.add(doc.location, f"[id] debe ser '{expected}', es '{doc.data['id']}'")


# --- Validación global -------------------------------------------------------


def index_by_slug(documents: list[Document], report: Report) -> dict[str, Document]:
    by_slug: dict[str, Document] = {}
    seen_ids: dict[str, Document] = {}
    for doc in documents:
        slug, entity_id = doc.data["slug"], doc.data["id"]
        if slug in by_slug:
            report.add(doc.location, f"[slug] '{slug}' duplicado (ya definido en {by_slug[slug].location})")
        else:
            by_slug[slug] = doc
        if entity_id in seen_ids:
            report.add(doc.location, f"[id] '{entity_id}' duplicado (ya definido en {seen_ids[entity_id].location})")
        else:
            seen_ids[entity_id] = doc
    return by_slug


def check_slug_lists(doc: Document, by_slug: dict[str, Document], report: Report) -> None:
    for field_name in SLUG_LIST_FIELDS:
        for i, slug in enumerate(doc.data.get(field_name, [])):
            target = by_slug.get(slug)
            if target is None:
                report.add(doc.location, f"[{field_name}.{i}] slug inexistente: '{slug}'")
            elif field_name == "technologies" and target.data["type"] not in TECHNOLOGY_TYPES:
                report.add(doc.location, f"[{field_name}.{i}] '{slug}' es {target.data['type']}, se esperaba technology o cloud_service")


def check_sources(doc: Document, by_slug: dict[str, Document], report: Report) -> None:
    for i, ref in enumerate(doc.data.get("sources", [])):
        target = by_slug.get(ref["source"])
        if target is None:
            report.add(doc.location, f"[sources.{i}.source] fuente inexistente: '{ref['source']}'")
        elif target.data["type"] != "source":
            report.add(doc.location, f"[sources.{i}.source] '{ref['source']}' es {target.data['type']}, no source")


def check_relations(
    doc: Document, by_slug: dict[str, Document], catalog: dict[str, dict[str, Any]], report: Report
) -> None:
    source_type = doc.data["type"]
    for i, relation in enumerate(doc.data.get("relations", [])):
        rel_type, target_slug = relation["type"], relation["target"]
        rule = catalog[rel_type]
        where = f"[relations.{i}] {rel_type} -> '{target_slug}'"
        if target_slug == doc.data["slug"]:
            report.add(doc.location, f"{where}: una entidad no puede relacionarse consigo misma")
            continue
        if source_type not in rule["source_types"]:
            report.add(doc.location, f"{where}: origen de tipo {source_type} no permitido")
        target = by_slug.get(target_slug)
        if target is None:
            report.add(doc.location, f"{where}: slug destino inexistente")
        elif target.data["type"] not in rule["target_types"]:
            report.add(doc.location, f"{where}: destino de tipo {target.data['type']} no permitido")


# --- Orquestación ------------------------------------------------------------


def validate(content_dir: Path, schemas_dir: Path) -> Report:
    report = Report()
    validators = build_validators(schemas_dir)
    catalog = load_relation_catalog(schemas_dir)
    documents = load_documents(content_dir, report)
    report.documents = len(documents)

    valid_docs = [doc for doc in documents if validate_schema(doc, validators, report)]
    for doc in valid_docs:
        check_id(doc, report)
    by_slug = index_by_slug(valid_docs, report)
    for doc in valid_docs:
        check_slug_lists(doc, by_slug, report)
        check_sources(doc, by_slug, report)
        check_relations(doc, by_slug, catalog, report)
    return report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--content", type=Path, default=ROOT / "content")
    parser.add_argument("--schemas", type=Path, default=ROOT / "schemas")
    args = parser.parse_args(argv)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    report = validate(args.content, args.schemas)
    for error in report.errors:
        print(f"ERROR {error}")
    if report.ok:
        print(f"OK: {report.documents} entidades validadas en {args.content}")
        return 0
    print(f"FALLÓ: {len(report.errors)} error(es) en {report.documents} entidades")
    return 1


if __name__ == "__main__":
    sys.exit(main())
