# Revisión B-F3.1 · lote F3b-21d

Rama `b/f3b-review-21d`, creada desde `bf92de3`. Fichas: `ai-assisted-sql-generation`, `ai-data-classification`, `ai-anomaly-detection`, `rag-over-technical-docs` y `ai-generated-documentation`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Sin hallazgos. El renombre de Agent Search está formulado como en curso, el cierre de conectores nuevos del Web Crawler coincide con la fecha de la página, y la celda de Azure en `ai-generated-documentation` dice que la página revisada no trata la generación de descripciones. | ninguna | — |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 618 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Los avisos son de Spark.

## Comprobaciones

```
ai-assisted-sql-generation miss=[] extra=[] not17=[] legal=False sec14=True
ai-data-classification miss=[] extra=[] not17=[] legal=False sec14=True
ai-anomaly-detection miss=[] extra=[] not17=[] legal=False sec14=True
rag-over-technical-docs miss=[] extra=[] not17=[] legal=False sec14=True
ai-generated-documentation miss=[] extra=[] not17=[] legal=False sec14=True
```

`legal=False`: el cuerpo no nombra la Ley 19.628, un artículo ni «Obligación legal». Diagramas, contando rombos: 6, 7, 6, 7 y 7 nodos. Ninguno pasa de 8. Cada §14 tiene Seguridad, observabilidad y costo.

Estado de producto, el 2026-10-26. Las fuentes dicen `accessed: 2026-10-26`.

- *Parse and chunk documents*, H1 «Parse and chunk documents», Last updated 2026-10-22 UTC. La nota de la página dice: «Vertex AI Search is being renamed to Agent Search. We are in the process of updating content to reflect the new branding.» La ficha lo deja como renombre en curso.
- *Crawl web pages for your knowledge base*: «Starting September 30, 2026, the creation of new connectors for Confluence, Microsoft SharePoint, Salesforce, and Web Crawler will no longer be supported on customer-managed knowledge bases. Existing connectors of these types will continue to function.» La nota y el §12 hablan de conectores nuevos desde el 2026-09-30.
- *Application card: Microsoft Purview Unified Catalog*, H1 «Application card: Microsoft Purview Unified Catalog». Las capacidades de IA de la página son búsqueda en lenguaje natural, sugerencia de activos y sugerencia de reglas de calidad, las tres en preview. La página no describe generación de descripciones de tablas. Una búsqueda en Learn el 2026-10-26 encuentra comentarios generados por IA en Unity Catalog de Azure Databricks y la edición manual de descripciones en Data Map. No aparece una página N1 de Purview que genere esas descripciones.
- *About data insights for structured data*: «The Knowledge Catalog (formerly Dataplex Universal Catalog)». La ficha dice «antes», como cambio ya hecho.

`git diff --stat 9e1524d 41128c7` de las dos fichas enlazadas:

```
 content/concepts/llm-agents.md | 6 +++++-
 content/concepts/rag.md        | 6 +++++-
 2 files changed, 10 insertions(+), 2 deletions(-)
```

Cada diff agrega la relación, reemplaza «pendiente de ficha» en el §17 y deja una línea de historial del 2026-10-26.

`tests/test_ai_usecases_snippets.py` exige `SET TRANSACTION` vía el bloque que corre (`EXPLAIN (FORMAT JSON)` dentro de `READ ONLY`), `z robusto -30.4`, `{'vectorizadas': 3`, luego `0` y luego `1`, y `confianza 0.55 < 0.8`. Esas cifras están en el §7 o en el párrafo de cada ficha.

## Por ficha

### `ai-assisted-sql-generation`

| Punto | Resultado |
|---|---|
| EXPLAIN en solo lectura | El código hace `SET TRANSACTION READ ONLY` y `EXPLAIN (FORMAT JSON)`. El test exige las dos aceptadas y las tres rechazadas, entre ellas `UndefinedColumn` |
| Escrituras | La nota de *SET TRANSACTION* dice que `READ ONLY` no permite INSERT, UPDATE, DELETE ni `EXPLAIN ANALYZE` de esos comandos |

### `ai-data-classification`

| Punto | Resultado |
|---|---|
| Umbral 0.8 | El §7 y `UMBRAL = 0.8`. El test exige `0.55 < 0.8` |
| Regla y modelo | La regla gana si hay un dato personal. Lo dudoso y la etiqueta fuera de la taxonomía van a revisión |

### `ai-anomaly-detection`

| Punto | Resultado |
|---|---|
| Quién detecta | El §1 y el código dicen que la detección es el z robusto y que el modelo solo redacta un borrador |
| z −30.4 | El párrafo documenta `z robusto -30.4`, que es la línea que exige el test |
| Cuándo no | El §6 descarta usar el LLM como detector |

### `rag-over-technical-docs`

| Punto | Resultado |
|---|---|
| Renombre en curso | La nota de la página de parseo dice «is being renamed» y «in the process of updating» |
| Conectores nuevos | Desde el 2026-09-30, en knowledge bases administradas por el cliente. La página agrega que los conectores ya creados siguen funcionando |
| Reindexado 3 → 0 → 1 | El §7 tiene 3, 0 y 1 vectorizadas. El test exige esas tres líneas. Los vectores del ejemplo son léxicos |

### `ai-generated-documentation`

| Punto | Resultado |
|---|---|
| Azure | El §13 dice «No lo trata la página revisada». La application card no describe generación de descripciones de tablas |
| Código | El test exige 5 columnas, 4 aceptadas, `descuento` rechazada y `creado` sin descripción |
