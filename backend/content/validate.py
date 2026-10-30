"""Valida content/ contra schemas/.

Recorre los .md (frontmatter YAML) y .yaml/.yml (uno o varios documentos
separados por ---), valida cada entidad según su `type` y verifica la
integridad global: ids y slugs únicos, referencias existentes y pares
origen/destino permitidos por relationships.schema.json.

content/blueprint/, content/matrix/ y content/legal-frameworks/ se validan aparte contra blueprint.schema.json
(ADR-003), matrix.schema.json (ADR-004) y legal-framework.schema.json (ADR-027).

Uso: python -m backend.content.validate [--content DIR] [--schemas DIR] [--report]
(`python scripts/validate.py` y `make validate` delegan aquí).
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
import unicodedata
from collections.abc import Iterator
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml
from jsonschema import Draft202012Validator
from referencing import Registry, Resource

from backend.content import diagrams, page_sections

ROOT = Path(__file__).resolve().parents[2]
CONTENT_EXTENSIONS = {".md", ".yaml", ".yml"}
SLUG_LIST_FIELDS = ("technologies", "related_topics")
TECHNOLOGY_TYPES = {"technology", "cloud_service"}
BLUEPRINT_DIR = "blueprint"
MATRIX_DIR = "matrix"
LEGAL_FRAMEWORKS_DIR = "legal-frameworks"   # ADR-027: marco legal verificado de un dominio
STRUCTURE_DIRS = frozenset({BLUEPRINT_DIR, MATRIX_DIR, LEGAL_FRAMEWORKS_DIR})
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
    warnings: list[str] = field(default_factory=list)
    documents: int = 0
    blueprint_rows: list[BlueprintRow] = field(default_factory=list)
    technologies: list[dict[str, Any]] = field(default_factory=list)
    matrix_capabilities: int = 0

    def add(self, location: str, message: str) -> None:
        self.errors.append(f"{location}: {message}")

    def warn(self, location: str, message: str) -> None:
        self.warnings.append(f"{location}: {message}")

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


def check_duplicate_citations(doc: Document, report: Report) -> None:
    """Aviso (no error), ADR-012: dos citas con la misma URL, o con el mismo page_title y la misma fuente del
    registro, no se distinguen. El mismo título en fuentes distintas se distingue por la línea del registro."""
    urls: dict[str, int] = {}
    titles: dict[tuple[str, str], int] = {}
    for i, ref in enumerate(doc.data.get("sources", [])):
        if url := ref.get("url"):
            if url in urls:
                report.warn(doc.location, f"[sources.{i}.url] repite el de sources.{urls[url]}: '{url}'")
            else:
                urls[url] = i
        if title := ref.get("page_title"):
            key = (ref["source"], title)
            if key in titles:
                report.warn(doc.location, f"[sources.{i}.page_title] repite el de sources.{titles[key]} con la misma fuente '{ref['source']}': '{title}'")
            else:
                titles[key] = i


def check_page_titles(doc: Document, report: Report) -> None:
    """Error: un page_title es el h1 de la página como texto. Los caracteres de uso privado (p. ej. U+F0C1, el
    icono de enlace permanente de Sphinx) y los espacios en los extremos vienen de copiar el HTML."""
    for i, ref in enumerate(doc.data.get("sources", [])):
        title = ref.get("page_title")
        if not title:
            continue
        private = [f"U+{ord(ch):04X}" for ch in title if unicodedata.category(ch) == "Co"]
        if private:
            report.add(doc.location, f"[sources.{i}.page_title] caracteres de uso privado {', '.join(private)}: {title!r}")
        if title != title.strip():
            report.add(doc.location, f"[sources.{i}.page_title] espacios en los extremos: {title!r}")


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


# enums.schema.json#/$defs/source_type: nivel de autoridad que corresponde a cada tipo de fuente (§30).
SOURCE_TYPE_LEVEL = {
    "official_docs": 1, "release_notes": 2, "engineering_blog": 3, "spec_paper": 4, "secondary": 5, "legislative": 1,
}
PAGE_SOURCE_LEVELS = {1, 2, 4}  # Nivel 4 solo como referencia conceptual canónica (spec_paper)
PRODUCT_SOURCE_LEVELS = {1, 2}


def check_source_level(doc: Document, report: Report) -> None:
    """Fuente: authority_level coherente con su source_type."""
    if doc.data["type"] != "source":
        return
    expected = SOURCE_TYPE_LEVEL[doc.data["source_type"]]
    if doc.data["authority_level"] != expected:
        report.add(
            doc.location,
            f"[authority_level] {doc.data['source_type']} corresponde al Nivel {expected}, no al {doc.data['authority_level']}",
        )


def check_page_source_levels(docs: list[Document], by_slug: dict[str, Document], report: Report) -> None:
    """Fichas y snippets: fuentes Nivel 1–2 o Nivel 4 canónico, y al menos una Nivel 1–2 (afirmaciones de producto)."""
    for doc in docs:
        if doc.data["type"] not in page_sections.SECTIONED_TYPES or doc.data.get("stub"):
            continue
        levels = []
        for i, ref in enumerate(doc.data.get("sources", [])):
            target = by_slug.get(ref["source"])
            if target is None or target.data["type"] != "source":
                continue  # check_sources ya lo reporta
            level = target.data["authority_level"]
            levels.append(level)
            if level not in PAGE_SOURCE_LEVELS:
                report.add(
                    doc.location,
                    f"[sources.{i}.source] '{ref['source']}' es Nivel {level}: en fichas solo Nivel 1–2 o Nivel 4 canónico",
                )
        if levels and not PRODUCT_SOURCE_LEVELS.intersection(levels):
            report.add(doc.location, "[sources] la ficha necesita al menos una fuente Nivel 1–2 (afirmaciones de producto)")


def check_topics_in_relations(docs: list[Document], report: Report) -> None:
    """Fichas y snippets: todo related_topics debe estar en relations (el grafo solo ve relations); en la
    ficha padre cuentan también sus hijas (PART_OF entrante, ADR-024)."""
    children = children_by_parent(docs)
    for doc in docs:
        if doc.data["type"] not in page_sections.SECTIONED_TYPES:
            continue
        targets = {r["target"] for r in doc.data.get("relations", [])} | children.get(doc.data["slug"], set())
        for slug in doc.data.get("related_topics", []):
            if slug not in targets:
                report.add(doc.location, f"[related_topics] '{slug}' no está en relations: el grafo no lo verá")


INLINE_SLUG = re.compile(r"`([a-z0-9]+(?:-[a-z0-9]+)*)`")
FENCE = re.compile(r"^```.*?^```", re.S | re.M)
PENDING = re.compile(r"pendientes? de ficha")
RELATED_SECTION = 17
HISTORY_SECTION = 22  # el historial describe cambios, no relaciones temáticas
# Menciones incidentales fuera del §17 que no son relaciones (docs/reviews/f3b-rel.md).
INCIDENTAL_MENTIONS = frozenset({
    ("pipeline-dependencies", "retries"),  # `retries` es el parámetro de Airflow, no la ficha
    ("dag", "api-ingestion"),  # remite a un ejemplo de reintentos en Step Functions
})


def named_fichas(text: str, fichas: set[str], own: str) -> set[str]:
    """Slugs entre backticks que son fichas (concept o pattern) existentes, sin la propia."""
    return {slug for slug in INLINE_SLUG.findall(text) if slug in fichas and slug != own}


def check_related_section(content_dir: Path, docs: list[Document], report: Report) -> None:
    """Regla del §17: la ficha nombrada que existe va en relations; la que no existe queda como
    «pendiente de ficha»; todo lo de relations se nombra en el §17. Un slug de ficha existente
    nombrado en otra sección (salvo el historial y los bloques de código) también debe estar en
    relations, salvo las menciones incidentales listadas (revisión de 10a, lote F3b-rel). Las hijas
    (PART_OF entrante, ADR-024) cuentan como relaciones de la padre, que debe nombrarlas todas."""
    fichas = {doc.data["slug"] for doc in docs if doc.data["type"] in page_sections.PAGE_TYPES}
    children = children_by_parent(docs)
    for doc in docs:
        if doc.data["type"] not in page_sections.PAGE_TYPES or doc.path.suffix != ".md" or doc.data.get("stub"):
            continue
        own = doc.data["slug"]
        targets = {r["target"] for r in doc.data.get("relations", [])} | children.get(own, set())
        body = FENCE.sub("", page_sections.body_of((content_dir.parent / doc.path).read_text(encoding="utf-8")))
        parts = page_sections.sections(body)
        if not any(n == RELATED_SECTION for n, _, _ in parts):
            continue  # sin §17 (la estructura la valida check_page_sections)
        related ="".join(c for n, _, c in parts if n == RELATED_SECTION)
        other = "".join(c for n, _, c in parts if n not in (RELATED_SECTION, HISTORY_SECTION))
        pending = "\n".join(line for line in related.splitlines() if PENDING.search(line))
        linked = "\n".join(line for line in related.splitlines() if not PENDING.search(line))
        for slug in sorted(named_fichas(pending, fichas, own)):
            report.add(doc.location, f"[§17] '{slug}' ya tiene ficha: no es «pendiente de ficha»")
        for slug in sorted(named_fichas(linked, fichas, own) - targets):
            report.add(doc.location, f"[§17] '{slug}' se nombra en el §17 y no está en relations")
        for slug in sorted(targets - set(INLINE_SLUG.findall(related))):
            kind = "es ficha hija (PART_OF)" if slug in children.get(own, set()) else "está en relations"
            report.add(doc.location, f"[§17] '{slug}' {kind} y el §17 no lo nombra")
        in_body = named_fichas(other, fichas, own) - targets - named_fichas(related, fichas, own)
        for slug in sorted(s for s in in_body if (own, s) not in INCIDENTAL_MENTIONS):
            report.add(doc.location, f"[§17] '{slug}' tiene ficha, se nombra en el cuerpo y no está en relations")


# --- Fichas padre e hijas (ADR-024) -------------------------------------------

PART_OF = "PART_OF"


def part_of_targets(doc: Document) -> list[str]:
    return [r["target"] for r in doc.data.get("relations", []) if r["type"] == PART_OF]


def parent_by_child(docs: list[Document]) -> dict[str, str]:
    """Hija -> padre (la primera PART_OF si hay varias; check_part_of reporta el resto)."""
    return {doc.data["slug"]: targets[0] for doc in docs if (targets := part_of_targets(doc))}


def children_by_parent(docs: list[Document]) -> dict[str, set[str]]:
    result: dict[str, set[str]] = {}
    for child, parent in parent_by_child(docs).items():
        result.setdefault(parent, set()).add(child)
    return result


def check_part_of(docs: list[Document], index: BlueprintIndex | None, report: Report) -> None:
    """ADR-024 (enmendado por ADR-027): a lo sumo una ficha padre, del mismo dominio, y sin ciclos. La padre puede
    estar en otro subdominio del dominio (24: la padre abre el primer tramo y las hijas están en los cinco)."""
    for doc in docs:
        if len(targets := part_of_targets(doc)) > 1:
            report.add(doc.location, f"[relations] PART_OF -> {', '.join(targets)}: una ficha tiene a lo sumo una ficha padre")
    parents = parent_by_child(docs)
    locations = {doc.data["slug"]: doc.location for doc in docs}
    for child, parent in sorted(parents.items()):
        if index is not None:
            a, b = index.concepts.get(child), index.concepts.get(parent)
            if a is not None and b is not None and a.domain != b.domain:
                report.add(locations[child], f"[relations] PART_OF -> '{parent}': la ficha padre es de otro dominio")
        seen, node = {child}, parent
        while node in parents and node not in seen:
            seen.add(node)
            node = parents[node]
        if node == child:
            report.add(locations[child], f"[relations] PART_OF -> '{parent}': la jerarquía forma un ciclo")


def check_diagrams(content_dir: Path, docs: list[Document], report: Report) -> None:
    """Estándar de la §9 (CLAUDE.md): aviso, no error, si un diagrama Mermaid supera
    diagrams.MAX_NODES nodos o diagrams.MAX_EDGES aristas."""
    for doc in docs:
        if doc.path.suffix != ".md":
            continue
        text = (content_dir.parent / doc.path).read_text(encoding="utf-8")
        for i, code in enumerate(diagrams.mermaid_blocks(text), start=1):
            size = diagrams.diagram_size(code)
            if size.too_big:
                report.warn(doc.location, f"[mermaid {i}] {size.kind}: {size.nodes} nodos y {size.edges} aristas "
                            f"(máximo {diagrams.MAX_NODES} y {diagrams.MAX_EDGES}): dividir o agrupar")


def check_page_sections(content_dir: Path, docs: list[Document], report: Report) -> None:
    """Fichas (22 secciones, §22) y snippets (10 secciones, §23) no stub: las secciones de su plantilla.
    En las fichas, además, las viñetas Seguridad, Observabilidad y Costo en la §14."""
    titles = {kind: page_sections.template_titles(content_dir, path) for kind, path in page_sections.TEMPLATES.items()}
    for doc in docs:
        expected = titles.get(doc.data["type"])
        if expected is None or doc.path.suffix != ".md" or doc.data.get("stub"):
            continue
        body = page_sections.body_of((content_dir.parent / doc.path).read_text(encoding="utf-8"))
        errors = page_sections.check(body, expected)
        if doc.data["type"] in page_sections.PAGE_TYPES:
            errors += page_sections.check_practices(body)
        for error in errors:
            report.add(doc.location, error)


def check_snippets(docs: list[Document], by_slug: dict[str, Document], report: Report) -> None:
    """Code Library (§23, ADR-008): requirements no vacío y al menos un IMPLEMENTS hacia un concept/pattern verified."""
    for doc in docs:
        if doc.data["type"] != page_sections.SNIPPET_TYPE:
            continue
        if not doc.data.get("requirements"):
            report.add(doc.location, "[requirements] un snippet debe indicar qué necesita para ejecutarse")
        verified = [
            r["target"]
            for r in doc.data.get("relations", [])
            if r["type"] == "IMPLEMENTS"
            and by_slug.get(r["target"]) is not None
            and by_slug[r["target"]].data["type"] in page_sections.PAGE_TYPES
            and by_slug[r["target"]].data["verification_status"] == "verified"
        ]
        if not verified:
            report.add(doc.location, "[relations] un snippet necesita al menos un IMPLEMENTS hacia un concept o pattern verified")


# --- Contenido con origen legal (ADR-023) -------------------------------------

LEGAL_DOMAINS = ("privacy-engineering",)   # ADR-023, enmendado por ADR-027 (19 integrado al 24 desde el 2026-10-30)
LEGISLATIVE = "legislative"
DISCLAIMER = "Esta ficha no es asesoría legal"
EVIDENCE_HEADING = re.compile(r"^### Evidencia de cumplimiento\s*$", re.M)
# Enmienda 4: «Obligación legal · GDPR art. N» y «Obligación legal · LGPD art. N» para los marcos comparados (EU y BR).
LABEL = (r"\*\*\[(?:Obligación legal · (?:(Ley [0-9.]+), |(GDPR|LGPD) )?art\. ([0-9]+(?: [a-záéíóú]+)?)"
         r"|Buena práctica|Decisión de arquitectura)\]\*\*")
LABEL_RE = re.compile(LABEL)
LABELED_SECTIONS = (2, 3, 4, 14)  # cada ítem y párrafo empieza con una etiqueta
TABLE_SECTIONS = (2, 3, 4, 11, 12, 13, 14)  # toda tabla lleva la columna «Etiqueta»
# Enmienda 3: en §4 y §11–13, si todas las filas llevan la misma etiqueta, va una línea «Etiqueta: […]» antes de la
# tabla, sin columna; la columna queda solo para tablas con etiquetas distintas.
UNIFORM_SECTIONS = (4, 11, 12, 13)
UNIFORM_LINE = re.compile(rf"^Etiqueta: ({LABEL})\s*$")
LIST_ITEM = re.compile(r"^\s*(?:[-*]|\d+\.)\s+")
REVIEW_DAYS = 31  # revisión mensual


FOREIGN_LAWS = {"eu-2016-679": "GDPR", "br-lei-13709": "LGPD"}   # Enmienda 4


def law_label(law: str) -> str:
    """ley-21719 -> «Ley 21.719» y eu-2016-679 -> «GDPR», como se escribe en la etiqueta."""
    if law in FOREIGN_LAWS:
        return FOREIGN_LAWS[law]
    return f"Ley {int(law.removeprefix('ley-')):,}".replace(",", ".")


def blocks(content: str) -> Iterator[str]:
    """Ítems de lista y párrafos de una sección, sin tablas, encabezados, citas ni comentarios."""
    paragraph: list[str] = []
    for line in content.splitlines():
        stripped = line.strip()
        is_item = bool(LIST_ITEM.match(line))
        if not stripped or is_item or stripped.startswith(("|", "#", ">", "<!--")) or UNIFORM_LINE.match(stripped):
            if paragraph:
                yield " ".join(paragraph)
                paragraph = []
            if is_item:
                yield LIST_ITEM.sub("", line, count=1)
            continue
        if line.startswith((" ", "\t")) and not paragraph:
            continue  # continuación de un ítem
        paragraph.append(stripped)
    if paragraph:
        yield " ".join(paragraph)


def table_rows(content: str) -> Iterator[list[list[str]]]:
    """Cada tabla Markdown de la sección como lista de filas (celdas), sin la fila separadora."""
    for _, table in tables_with_lead(content):
        yield table


def tables_with_lead(content: str) -> Iterator[tuple[str, list[list[str]]]]:
    """Cada tabla con la última línea no vacía que la precede (para la línea «Etiqueta: […]»)."""
    table: list[list[str]] = []
    lead, previous = "", ""
    for line in [*content.splitlines(), ""]:
        if line.strip().startswith("|"):
            if not table:
                lead = previous
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if not all(re.fullmatch(r":?-+:?", c) for c in cells):
                table.append(cells)
            continue
        if table:
            yield lead, table
            table = []
        if line.strip():
            previous = line.strip()


def check_legal_body(doc: Document, body: str, report: Report) -> set[tuple[str | None, str]]:
    """Aviso, evidencia, etiqueta por ítem y columna «Etiqueta»; devuelve los artículos citados (ley o None, art.)."""
    clean = FENCE.sub("", body)
    parts = {n: content for n, _, content in page_sections.sections(clean)}
    if DISCLAIMER not in parts.get(1, ""):
        report.add(doc.location, f"[§1] falta el aviso «{DISCLAIMER}» (ADR-023)")
    if not EVIDENCE_HEADING.search(parts.get(8, "")):
        report.add(doc.location, "[§8] falta la subsección «### Evidencia de cumplimiento» (ADR-023)")
    for number in LABELED_SECTIONS:
        for block in blocks(parts.get(number, "")):
            if not re.match(LABEL, block):
                report.add(doc.location, f"[§{number}] ítem o párrafo sin etiqueta (ADR-023): {block[:60]!r}")
    for number in TABLE_SECTIONS:
        for lead, table in tables_with_lead(parts.get(number, "")):
            check_label_table(doc, number, lead, table, report)
    return {(m.group(1) or m.group(2), m.group(3)) for m in LABEL_RE.finditer(clean) if m.group(3)}


def check_label_table(doc: Document, number: int, lead: str, table: list[list[str]], report: Report) -> None:
    """Columna «Etiqueta» con celdas válidas; en §4 y §11–13 (Enmienda 3), línea «Etiqueta: […]» si son iguales."""
    header = table[0]
    uniform_allowed = number in UNIFORM_SECTIONS
    if "Etiqueta" not in header:
        if uniform_allowed and UNIFORM_LINE.match(lead):
            return
        hint = " ni línea «Etiqueta: […]» antes" if uniform_allowed else ""
        report.add(doc.location, f"[§{number}] tabla sin columna «Etiqueta»{hint} (ADR-023): {header}")
        return
    col = header.index("Etiqueta")
    cells = [row[col] if col < len(row) else "" for row in table[1:]]
    for cell in cells:
        if not re.fullmatch(LABEL, cell):
            report.add(doc.location, f"[§{number}] celda «Etiqueta» inválida (ADR-023): {cell!r}")
    if uniform_allowed and cells and len(set(cells)) == 1:
        report.add(doc.location, f"[§{number}] todas las filas llevan {cells[0]}: va la línea «Etiqueta: {cells[0]}» "
                                 "antes de la tabla, sin columna (ADR-023, Enmienda 3)")


def check_legal_basis(
    doc: Document, by_slug: dict[str, Document], cited: set[tuple[str | None, str]], report: Report
) -> None:
    """Cada url de legal_basis es una cita legislative de la misma jurisdicción; artículos del cuerpo y de
    legal_basis coinciden (la etiqueta nombra la ley si el artículo existe en más de una)."""
    jurisdiction = set(doc.data["jurisdiction"])
    legislative = {
        ref.get("url")
        for ref in doc.data.get("sources", [])
        if (target := by_slug.get(ref["source"])) is not None
        and target.data.get("source_type") == LEGISLATIVE
        and set(target.data.get("jurisdiction", [])) <= jurisdiction
    }
    basis = doc.data.get("legal_basis", [])
    if not basis:
        report.add(doc.location, "[legal_basis] una ficha con jurisdiction necesita legal_basis (ADR-023)")
    declared: set[tuple[str, str]] = set()
    for i, item in enumerate(basis):
        declared.add((law_label(item["law"]), item["article"]))
        if item["url"] not in legislative:
            report.add(doc.location, f"[legal_basis.{i}.url] no es una cita legislative de sources con la misma jurisdicción")
    for law, article in sorted(cited, key=str):
        matches = {d for d in declared if d[1] == article and (law is None or d[0] == law)}
        if not matches:
            where = f"{law} " if law in FOREIGN_LAWS.values() else f"{law}, " if law else ""
            report.add(doc.location, f"[legal_basis] el cuerpo cita {where}art. {article} y no está en legal_basis")
        elif law is None and len(matches) > 1:
            report.add(doc.location, f"[legal_basis] art. {article} existe en varias leyes: la etiqueta debe nombrar la ley")
    for law, article in sorted(declared):
        if (law, article) not in cited and (None, article) not in cited:
            report.add(doc.location, f"[legal_basis] {law}, art. {article} está en legal_basis y el cuerpo no lo cita")


def check_legal_source(doc: Document, report: Report) -> None:
    data = doc.data
    if data["source_type"] == LEGISLATIVE:
        if len(data.get("jurisdiction", [])) != 1:
            report.add(doc.location, "[jurisdiction] una fuente legislative declara exactamente un país (ADR-023)")
        if data.get("review_frequency") != "monthly":
            report.add(doc.location, "[review_frequency] una fuente legislative se revisa monthly (ADR-023)")
    elif "jurisdiction" in data:
        report.add(doc.location, "[jurisdiction] solo las fuentes legislative declaran jurisdiction (ADR-023)")


def check_without_jurisdiction(doc: Document, by_slug: dict[str, Document], report: Report) -> None:
    for f in ("legal_basis", "owner_approved_at"):
        if f in doc.data:
            report.add(doc.location, f"[{f}] requiere jurisdiction (ADR-023)")
    for i, ref in enumerate(doc.data.get("sources", [])):
        target = by_slug.get(ref["source"])
        if target is not None and target.data.get("source_type") == LEGISLATIVE:
            report.add(doc.location, f"[sources.{i}] '{ref['source']}' es legislative: solo en fichas con jurisdiction (ADR-023)")


def check_legal_content(
    content_dir: Path, docs: list[Document], by_slug: dict[str, Document], report: Report, today: dt.date | None = None
) -> None:
    """ADR-023: fuentes legislative, jurisdiction solo en fichas de los dominios legales, legal_basis, etiquetas,
    aviso, evidencia, cita legal consultada el día de last_verified, revisión mensual y aprobación del dueño."""
    today = today or dt.date.today()
    for doc in docs:
        data = doc.data
        if data["type"] == "source":
            check_legal_source(doc, report)
            continue
        if "jurisdiction" not in data:
            check_without_jurisdiction(doc, by_slug, report)
            continue
        if data["type"] not in page_sections.PAGE_TYPES or data.get("domain") not in LEGAL_DOMAINS:
            report.add(doc.location, f"[jurisdiction] solo en fichas (concept o pattern) de los dominios {' y '.join(LEGAL_DOMAINS)} (ADR-023)")
            continue
        if data["verification_status"] == "verified" and "owner_approved_at" not in data:
            report.add(doc.location, "[owner_approved_at] verified exige la aprobación explícita del dueño (ADR-023)")
        last = data.get("last_verified")
        for i, ref in enumerate(data.get("sources", [])):
            target = by_slug.get(ref["source"])
            if target is not None and target.data.get("source_type") == LEGISLATIVE and ref.get("accessed") != last:
                report.add(doc.location, f"[sources.{i}.accessed] la cita legal se consulta el día de last_verified ({last})")
        if last and (today - dt.date.fromisoformat(str(last))).days > REVIEW_DAYS:
            report.warn(doc.location, f"[last_verified] {last}: más de {REVIEW_DAYS} días; revisar o pasar a potentially_outdated (ADR-023)")
        cited: set[tuple[str | None, str]] = set()
        if doc.path.suffix == ".md" and not data.get("stub"):
            body = page_sections.body_of((content_dir.parent / doc.path).read_text(encoding="utf-8"))
            cited = check_legal_body(doc, body, report)
        check_legal_basis(doc, by_slug, cited, report)


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


# --- Marcos legales (ADR-027) -------------------------------------------------


def validate_legal_frameworks(
    content_dir: Path, schemas_dir: Path, by_slug: dict[str, Document], report: Report
) -> set[str]:
    """Cada archivo cumple su schema, se llama como su slug y cita fuentes legislative del Source Registry."""
    validator, _ = load_structure_schema(schemas_dir, "legal-framework.schema.json")
    slugs: set[str] = set()
    for doc in load_structures(content_dir, LEGAL_FRAMEWORKS_DIR, report):
        if not validate_structure(doc, validator, report):
            continue
        if Path(doc.path).stem != doc.data["slug"]:
            report.add(doc.location, f"[slug] el archivo debe llamarse {doc.data['slug']}.yaml")
        slugs.add(doc.data["slug"])
        for i, fact in enumerate(doc.data["facts"]):
            target = by_slug.get(fact["source"])
            if target is None or target.data.get("source_type") != LEGISLATIVE:
                report.add(doc.location, f"[facts.{i}.source] '{fact['source']}' no es una fuente legislative del registro")
    return slugs


def check_domain_legal_frameworks(content_dir: Path, frameworks: set[str], report: Report) -> None:
    for doc in load_structures(content_dir, BLUEPRINT_DIR, Report()):
        ref = doc.data.get("domain", {}).get("legal_framework")
        if ref is not None and ref not in frameworks:
            report.add(doc.location, f"[domain.legal_framework] '{ref}' no existe en content/{LEGAL_FRAMEWORKS_DIR}/")


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
        check_duplicate_citations(doc, report)
        check_page_titles(doc, report)
        check_relations(doc, by_slug, catalog, report)
        check_source_level(doc, report)
    check_mvp_source_coverage(valid_docs, report)
    check_page_sections(content_dir, valid_docs, report)
    check_diagrams(content_dir, valid_docs, report)
    check_topics_in_relations(valid_docs, report)
    check_related_section(content_dir, valid_docs, report)
    check_page_source_levels(valid_docs, by_slug, report)
    check_snippets(valid_docs, by_slug, report)
    check_legal_content(content_dir, valid_docs, by_slug, report)
    index = validate_blueprints(content_dir, schemas_dir, by_slug, valid_docs, report)
    check_part_of(valid_docs, index, report)
    validate_matrices(content_dir, schemas_dir, index, by_slug, report)
    check_domain_legal_frameworks(content_dir, validate_legal_frameworks(content_dir, schemas_dir, by_slug, report), report)
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
    for warning in report.warnings:
        print(f"AVISO {warning}")
    if args.report:
        print_blueprint_report(report)
    if report.ok:
        print(f"OK: {report.documents} entidades validadas en {args.content}")
        return 0
    print(f"FALLÓ: {len(report.errors)} error(es) en {report.documents} entidades")
    return 1


if __name__ == "__main__":
    sys.exit(main())
