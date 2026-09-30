"""Valida content/ contra schemas/.

Recorre los .md (frontmatter YAML) y .yaml/.yml (uno o varios documentos
separados por ---), valida cada entidad según su `type` y verifica la
integridad global: ids y slugs únicos, referencias existentes y pares
origen/destino permitidos por relationships.schema.json.

content/blueprint/ y content/matrix/ se validan aparte contra blueprint.schema.json
(ADR-003) y matrix.schema.json (ADR-004).

Uso: python scripts/validate.py [--content DIR] [--schemas DIR] [--report]
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

if __package__ in (None, ""):  # ejecutado como `python scripts/validate.py`
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts import page_sections  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
CONTENT_EXTENSIONS = {".md", ".yaml", ".yml"}
SLUG_LIST_FIELDS = ("technologies", "related_topics")
TECHNOLOGY_TYPES = {"technology", "cloud_service"}
BLUEPRINT_DIR = "blueprint"
MATRIX_DIR = "matrix"
STRUCTURE_DIRS = frozenset({BLUEPRINT_DIR, MATRIX_DIR})
CLOUD_COLUMNS = ("gcp", "aws", "azure")


@dataclass(frozen=True)
class Document:
    path: Path
    index: int
    data: dict[str, Any]

    @property
    def location(self) -> str:
        return f"{self.path}" if self.index == 0 else f"{self.path}#{self.index}"


@dataclass(frozen=True)
class BlueprintConcept:
    location: str
    domain: str
    subdomain: str
    kind: str
    data: dict[str, Any]


@dataclass(frozen=True)
class BlueprintRow:
    domain_id: str
    domain: str
    concepts: int
    mvp: int
    added: int


@dataclass
class BlueprintIndex:
    subdomains: dict[str, set[str]] = field(default_factory=dict)
    concepts: dict[str, BlueprintConcept] = field(default_factory=dict)


@dataclass
class Report:
    errors: list[str] = field(default_factory=list)
    documents: int = 0
    blueprint_rows: list[BlueprintRow] = field(default_factory=list)
    technologies: list[dict[str, Any]] = field(default_factory=list)
    matrix_capabilities: int = 0

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


def iter_content_files(content_dir: Path, exclude_top: frozenset[str] = frozenset()) -> Iterator[Path]:
    """Archivos de contenido, ignorando carpetas o archivos que empiezan con _ o ."""
    for path in sorted(content_dir.rglob("*")):
        relative = path.relative_to(content_dir).parts
        if any(part.startswith(("_", ".")) for part in relative):
            continue
        if relative[0] in exclude_top:
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
    for path in iter_content_files(content_dir, exclude_top=STRUCTURE_DIRS):
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
        elif not same_type_group(rule, source_type, target.data["type"]):
            report.add(doc.location, f"{where}: {source_type} y {target.data['type']} no pertenecen al mismo grupo de tipos")


def same_type_group(rule: dict[str, Any], source_type: str, target_type: str) -> bool:
    """True si la relación no define type_groups o ambos tipos comparten grupo."""
    groups = rule.get("type_groups")
    if groups is None:
        return True
    return any(source_type in group and target_type in group for group in groups)


def check_mvp_source_coverage(docs: list[Document], report: Report) -> None:
    """Criterio de salida F1: toda tecnología mvp tiene una fuente Nivel 1–2 con URL verificada."""
    covered = {
        tech
        for doc in docs
        if doc.data["type"] == "source" and doc.data["authority_level"] <= 2 and doc.data.get("url_verified")
        for tech in doc.data.get("technologies", [])
    }
    for doc in docs:
        if doc.data["type"] in TECHNOLOGY_TYPES and doc.data.get("mvp") and doc.data["slug"] not in covered:
            report.add(doc.location, f"[mvp] '{doc.data['slug']}' no tiene fuente Nivel 1–2 con url_verified")


def check_page_sections(content_dir: Path, docs: list[Document], report: Report) -> None:
    """Fichas concept/pattern no stub: las 22 secciones de la plantilla (§22)."""
    titles = page_sections.template_titles(content_dir)
    if titles is None:
        return
    for doc in docs:
        if doc.path.suffix != ".md" or doc.data["type"] not in page_sections.PAGE_TYPES or doc.data.get("stub"):
            continue
        body = page_sections.body_of((content_dir.parent / doc.path).read_text(encoding="utf-8"))
        for error in page_sections.check(body, titles):
            report.add(doc.location, error)


# --- Blueprint (ADR-003) -----------------------------------------------------


def load_structure_schema(schemas_dir: Path, name: str) -> tuple[Draft202012Validator, dict[str, Any]]:
    schema = json.loads((schemas_dir / name).read_text(encoding="utf-8"))
    validator = Draft202012Validator(
        schema, registry=load_registry(schemas_dir), format_checker=Draft202012Validator.FORMAT_CHECKER
    )
    return validator, schema


def load_structures(content_dir: Path, subdir: str, report: Report) -> list[Document]:
    """Archivos YAML de una estructura no-entidad (blueprint, matriz)."""
    structure_dir = content_dir / subdir
    if not structure_dir.is_dir():
        return []
    documents = []
    for path in iter_content_files(structure_dir):
        shown = path.relative_to(content_dir.parent)
        try:
            raw = yaml.safe_load(path.read_text(encoding="utf-8"))
        except yaml.YAMLError as exc:
            report.add(str(shown), f"no se pudo parsear: {exc}")
            continue
        if not isinstance(raw, dict):
            report.add(str(shown), "el archivo no es un objeto YAML")
            continue
        documents.append(Document(shown, 0, normalize(raw)))
    return documents


def validate_structure(doc: Document, validator: Draft202012Validator, report: Report) -> bool:
    errors = sorted(validator.iter_errors(doc.data), key=lambda e: list(e.path))
    for error in errors:
        report.add(doc.location, f"[{format_path(error.path)}] {error.message}")
    return not errors


def validate_blueprint(doc: Document, validator: Draft202012Validator, report: Report) -> bool:
    if not validate_structure(doc, validator, report):
        return False
    domain = doc.data["domain"]
    expected = f"{domain['id']}-{domain['slug']}"
    if doc.path.stem != expected:
        report.add(doc.location, f"el archivo debe llamarse '{expected}{doc.path.suffix}'")
    return True


def iter_blueprint_concepts(doc: Document) -> Iterator[tuple[str, str, dict[str, Any]]]:
    """(ubicación, subdominio, concepto) de cada concepto del archivo."""
    for i, subdomain in enumerate(doc.data["subdomains"]):
        for j, concept in enumerate(subdomain["concepts"]):
            yield f"{doc.location} [subdomains.{i}.concepts.{j}]", subdomain["slug"], concept


def index_blueprint(docs: list[Document], report: Report) -> BlueprintIndex:
    index = BlueprintIndex()
    domain_ids: set[str] = set()
    for doc in docs:
        domain = doc.data["domain"]
        if domain["slug"] in index.subdomains or domain["id"] in domain_ids:
            report.add(doc.location, f"dominio duplicado: {domain['id']} {domain['slug']}")
            continue
        domain_ids.add(domain["id"])
        subdomains = index.subdomains.setdefault(domain["slug"], set())
        for subdomain in doc.data["subdomains"]:
            if subdomain["slug"] in subdomains:
                report.add(doc.location, f"subdominio duplicado: '{subdomain['slug']}'")
            subdomains.add(subdomain["slug"])
        for location, subdomain_slug, concept in iter_blueprint_concepts(doc):
            slug = concept["slug"]
            if slug in index.concepts:
                report.add(location, f"concepto '{slug}' duplicado (ya definido en {index.concepts[slug].location})")
                continue
            index.concepts[slug] = BlueprintConcept(location, domain["slug"], subdomain_slug, concept["kind"], concept)
    return index


def check_blueprint_concepts(index: BlueprintIndex, mvp_domains: set[str], report: Report) -> None:
    for slug, entry in index.concepts.items():
        for target in entry.data.get("related_concepts", []):
            if target == slug:
                report.add(entry.location, f"[related_concepts] '{slug}' no puede relacionarse consigo mismo")
            elif target not in index.concepts:
                report.add(entry.location, f"[related_concepts] concepto inexistente: '{target}'")
        needs_reason = entry.data["mvp"] and entry.domain not in mvp_domains
        if needs_reason and "mvp_reason" not in entry.data:
            report.add(entry.location, f"[mvp_reason] '{slug}' es mvp fuera de los dominios MVP y no lo justifica")


def check_blueprint_technologies(index: BlueprintIndex, by_slug: dict[str, Document], report: Report) -> None:
    for entry in index.concepts.values():
        for tech in entry.data.get("related_technologies", []):
            target = by_slug.get(tech)
            if target is None:
                report.add(entry.location, f"[related_technologies] tecnología inexistente: '{tech}'")
            elif target.data["type"] not in TECHNOLOGY_TYPES:
                report.add(
                    entry.location,
                    f"[related_technologies] '{tech}' es {target.data['type']}, se esperaba technology o cloud_service",
                )


def check_entity_in_blueprint(doc: Document, index: BlueprintIndex, report: Report) -> None:
    domain, subdomain = doc.data.get("domain"), doc.data.get("subdomain")
    if domain is not None and domain not in index.subdomains:
        report.add(doc.location, f"[domain] '{domain}' no existe en el blueprint")
    elif subdomain is not None and subdomain not in index.subdomains.get(domain, set()):
        report.add(doc.location, f"[subdomain] '{subdomain}' no existe en el dominio '{domain}' del blueprint")
    entry = index.concepts.get(doc.data["slug"])
    if entry is None:
        return
    if entry.kind != doc.data["type"]:
        report.add(doc.location, f"[type] el blueprint declara '{doc.data['slug']}' como {entry.kind}")
    if domain is not None and (domain, subdomain) != (entry.domain, entry.subdomain):
        report.add(
            doc.location,
            f"[domain] el blueprint ubica '{doc.data['slug']}' en {entry.domain}/{entry.subdomain}, no en {domain}/{subdomain}",
        )


def summarize_blueprint(docs: list[Document]) -> list[BlueprintRow]:
    rows = []
    for doc in sorted(docs, key=lambda d: d.data["domain"]["id"]):
        concepts = [concept for _, _, concept in iter_blueprint_concepts(doc)]
        rows.append(
            BlueprintRow(
                domain_id=doc.data["domain"]["id"],
                domain=doc.data["domain"]["slug"],
                concepts=len(concepts),
                mvp=sum(1 for c in concepts if c["mvp"]),
                added=sum(1 for c in concepts if c.get("added_by") == "blueprint"),
            )
        )
    return rows


def validate_blueprints(
    content_dir: Path, schemas_dir: Path, by_slug: dict[str, Document], entities: list[Document], report: Report
) -> BlueprintIndex | None:
    validator, schema = load_structure_schema(schemas_dir, "blueprint.schema.json")
    mvp_domains = set(schema["x-mvp-domains"])
    docs = load_structures(content_dir, BLUEPRINT_DIR, report)
    blueprints = [doc for doc in docs if validate_blueprint(doc, validator, report)]
    if not blueprints:
        return None
    index = index_blueprint(blueprints, report)
    check_blueprint_concepts(index, mvp_domains, report)
    check_blueprint_technologies(index, by_slug, report)
    for doc in entities:
        check_entity_in_blueprint(doc, index, report)
    report.blueprint_rows = summarize_blueprint(blueprints)
    return index


# --- Cloud Capability Matrix (ADR-004) ---------------------------------------


def check_matrix_cell(
    location: str, column: str, cell: dict[str, Any], by_slug: dict[str, Document], report: Report
) -> None:
    for i, service in enumerate(cell["services"]):
        where = f"{location}.clouds.{column}.services.{i}]"
        target = by_slug.get(service)
        if target is None:
            report.add(where, f"servicio inexistente: '{service}'")
        elif target.data["type"] != "cloud_service":
            report.add(where, f"'{service}' es {target.data['type']}, se esperaba cloud_service")
        elif target.data["provider"] != column:
            report.add(where, f"'{service}' es de {target.data['provider']}, no de {column}")


def check_matrix(doc: Document, index: BlueprintIndex | None, by_slug: dict[str, Document], report: Report) -> int:
    seen: set[str] = set()
    for i, capability in enumerate(doc.data["capabilities"]):
        location = f"{doc.location} [capabilities.{i}"
        if capability["id"] in seen:
            report.add(f"{location}]", f"capacidad duplicada: '{capability['id']}'")
        seen.add(capability["id"])
        for concept in capability["concepts"]:
            if index is None or concept not in index.concepts:
                report.add(f"{location}.concepts]", f"concepto inexistente en el blueprint: '{concept}'")
        for column in CLOUD_COLUMNS:
            check_matrix_cell(location, column, capability["clouds"][column], by_slug, report)
    return len(seen)


def validate_matrices(
    content_dir: Path, schemas_dir: Path, index: BlueprintIndex | None, by_slug: dict[str, Document], report: Report
) -> None:
    validator, _ = load_structure_schema(schemas_dir, "matrix.schema.json")
    for doc in load_structures(content_dir, MATRIX_DIR, report):
        if validate_structure(doc, validator, report):
            report.matrix_capabilities += check_matrix(doc, index, by_slug, report)


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
    check_mvp_source_coverage(valid_docs, report)
    check_page_sections(content_dir, valid_docs, report)
    index = validate_blueprints(content_dir, schemas_dir, by_slug, valid_docs, report)
    validate_matrices(content_dir, schemas_dir, index, by_slug, report)
    report.technologies = [doc.data for doc in valid_docs if doc.data["type"] in TECHNOLOGY_TYPES]
    return report


def print_blueprint_report(report: Report) -> None:
    print("\n| # | Dominio | Conceptos | MVP | Agregados |")
    print("|---|---|---|---|---|")
    for row in report.blueprint_rows:
        print(f"| {row.domain_id} | {row.domain} | {row.concepts} | {row.mvp} | {row.added} |")
    totals = [sum(getattr(r, name) for r in report.blueprint_rows) for name in ("concepts", "mvp", "added")]
    print(f"| | **Total** | {totals[0]} | {totals[1]} | {totals[2]} |")
    print_inventory_report(report)


def print_inventory_report(report: Report) -> None:
    counts: dict[str, int] = {}
    for tech in report.technologies:
        origin = tech.get("provider") or tech.get("vendor")
        key = f"{tech['type']} · {origin}"
        counts[key] = counts.get(key, 0) + 1
    print(f"\nInventario de tecnologías: {len(report.technologies)}")
    for key in sorted(counts):
        print(f"- {key}: {counts[key]}")
    mvp = sorted(tech["slug"] for tech in report.technologies if tech.get("mvp"))
    print(f"MVP ({len(mvp)}): {', '.join(mvp)}")
    print(f"Capacidades en la matriz: {report.matrix_capabilities}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--content", type=Path, default=ROOT / "content")
    parser.add_argument("--schemas", type=Path, default=ROOT / "schemas")
    parser.add_argument("--report", action="store_true", help="resumen del blueprint y tecnologías pendientes")
    args = parser.parse_args(argv)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    report = validate(args.content, args.schemas)
    for error in report.errors:
        print(f"ERROR {error}")
    if args.report:
        print_blueprint_report(report)
    if report.ok:
        print(f"OK: {report.documents} entidades validadas en {args.content}")
        return 0
    print(f"FALLÓ: {len(report.errors)} error(es) en {report.documents} entidades")
    return 1


if __name__ == "__main__":
    sys.exit(main())
