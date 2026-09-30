"""Búsqueda de texto completo en PostgreSQL (A-F2.3, ADR-005).

Consulta search_documents con websearch_to_tsquery en español (es_unaccent) y en inglés
(en_unaccent) y toma el mejor rank de ambos. El slug (en inglés) se indexa con peso A junto al
título (en español). Suma 1.0 si alguna palabra del título (sin tildes) o del slug empieza por la
consulta, 0.5 más si el título o el slug coinciden exactamente, y 0.1 a lo `core`. Un concepto con ficha tiene dos documentos (blueprint y ficha): se
queda el de mayor puntaje, prefiriendo la ficha si empatan. Agrupa por tipo como §35.
"""

from __future__ import annotations

from typing import Any

from sqlalchemy import Engine, text

TITLE_BONUS = 1.0
EXACT_BONUS = 0.5
CORE_BONUS = 0.1
FILTER_COLUMNS = ("type", "domain", "classification")

# Alguna palabra del título o del slug empieza por la consulta ("particion" no coincide con "Compartición").
PREFIX_MATCH = r"""(
    unaccent(lower(d.title)) LIKE q.title_word || '%' ESCAPE '\'
    OR unaccent(lower(d.title)) LIKE '% ' || q.title_word || '%' ESCAPE '\'
    OR d.slug LIKE q.slug_word || '%' ESCAPE '\'
    OR d.slug LIKE '%-' || q.slug_word || '%' ESCAPE '\'
)"""

BASE_QUERY = r"""
WITH q AS (
    SELECT websearch_to_tsquery('es_unaccent', :q) AS q_es,
           websearch_to_tsquery('en_unaccent', :q) AS q_en,
           unaccent(lower(:plain)) AS title_word,
           :slug_plain AS slug_word,
           unaccent(lower(:exact)) AS title_exact,
           :slug_exact AS slug_exact
),
scored AS (
    SELECT d.slug, d.type, d.title, d.domain, d.classification, d.snippet, d.origin,
           greatest(ts_rank(d.tsv_es, q.q_es), ts_rank(d.tsv_en, q.q_en))
           + CASE WHEN {prefix_match} THEN :title_bonus ELSE 0 END
           + CASE WHEN unaccent(lower(d.title)) = q.title_exact OR d.slug = q.slug_exact
                  THEN :exact_bonus ELSE 0 END AS base
    FROM search_documents d, q
    WHERE d.tsv_es @@ q.q_es OR d.tsv_en @@ q.q_en OR {prefix_match}
),
best AS (
    SELECT DISTINCT ON (slug) *
    FROM scored
    ORDER BY slug, base DESC, (origin = 'entity') DESC
)
SELECT slug, type, title, domain, classification, snippet,
       round((base + CASE WHEN classification = 'core' THEN :core_bonus ELSE 0 END)::numeric, 4)::float AS score
FROM best
WHERE {filters}
ORDER BY score DESC, lower(title), slug
LIMIT :limit
"""


def escape_like(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def slug_form(query: str) -> str:
    """Consulta en forma de slug: minúsculas y guiones ("Data Lake" -> "data-lake")."""
    return "-".join(query.lower().split())


def build_query(filters: dict[str, str | None]) -> str:
    """Solo columnas de FILTER_COLUMNS; los valores van como parámetros enlazados."""
    clauses = [f"{column} = :{column}" for column in FILTER_COLUMNS if filters.get(column) is not None]
    return BASE_QUERY.format(filters=" AND ".join(clauses) or "true", prefix_match=PREFIX_MATCH)


def search(engine: Engine, query: str, limit: int = 20, filters: dict[str, str | None] | None = None) -> dict[str, Any]:
    active = {k: v for k, v in (filters or {}).items() if k in FILTER_COLUMNS and v is not None}
    params = {
        "q": query, "plain": escape_like(query.strip()), "slug_plain": escape_like(slug_form(query)),
        "exact": query.strip(), "slug_exact": slug_form(query),
        "limit": limit, "title_bonus": TITLE_BONUS, "exact_bonus": EXACT_BONUS, "core_bonus": CORE_BONUS, **active,
    }
    with engine.connect() as conn:
        rows = conn.execute(text(build_query(active)), params).mappings().all()
    groups: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        groups.setdefault(row["type"], []).append(dict(row))
    return {"query": query, "total": len(rows), "groups": [{"type": k, "items": v} for k, v in groups.items()]}
