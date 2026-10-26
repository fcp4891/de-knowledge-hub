# Revisión B-F3.1 · lote F3b-21e

Rama `b/f3b-review-21e`, creada desde `7faa596`. Fichas: `ai-metadata-enrichment`, `ai-pipeline-generation`, `ai-error-analysis` y `natural-language-catalog-interfaces`, todas `emerging`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| En `ai-error-analysis`, el §16 dice que las funciones están en preview o cambian seguido. *Investigate workloads with AI-powered Gemini Cloud Assist* sí declara preview. *Generative AI troubleshooting for Apache Spark in AWS Glue* y *Get started with Copilot in Fabric in the Data Factory workload* no usan la palabra preview. | baja | Dejar «preview» solo en Gemini Cloud Assist. |
| Sin otros hallazgos. Las cuatro dicen que no reemplazan lo consolidado. `agentic-data-engineering` y `data-agents` quedan como pendiente de ficha, fuera de `relations`. | ninguna | — |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 622 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Los avisos son de Spark.

## Comprobaciones

```
ai-metadata-enrichment miss [] nodos 6
ai-pipeline-generation miss [] nodos 6
ai-error-analysis miss [] nodos 6
natural-language-catalog-interfaces miss [] nodos 7
```

`miss []`: cada `relations` apunta a una ficha que existe. Los diagramas tienen 6, 6, 6 y 7 nodos. Cada §14 tiene Seguridad, observabilidad y costo.

Pendientes del dominio 23, solo en el §17 y fuera de `relations`:

```
ai-pipeline-generation.md: Pendiente de ficha: agentic-data-engineering (dominio 23)
natural-language-catalog-interfaces.md: Pendiente de ficha: data-agents (dominio 23)
```

Páginas, el 2026-10-26. Las fuentes dicen `accessed: 2026-10-26`.

- *About enrichment tasks*, H1 exacto, Last updated 2026-10-23 UTC: el encabezado dice «Preview» y «Pre-GA Offerings Terms». «Knowledge Studio is currently available as a gated preview.»
- *Evaluate and approve enrichment proposals*: el mismo encabezado «Preview».
- *About search in Knowledge Catalog*: «Search in Knowledge Catalog (formerly Dataplex Universal Catalog)». «an access control limit of 600 restricts (permission evaluation rules)». Si se pasa, «search results might omit assets». La página no dice preview.
- *Release notes for Amazon SageMaker Unified Studio*, entrada «June 4, 2026»: «SageMaker Data Agent now integrates with SageMaker Catalog business context and metadata», incluida la sincronizada desde Collibra, Atlan y Alation, para descubrir datasets y generar SQL y Python con terminología de negocio. Esa entrada no menciona 600.
- *Sample setup for data governance*, H1 exacto: «select Get suggested terms to have generative AI propose a few based on the description and name of the domain». «Select Get suggestions to have generative AI help pick from the assets in your data map».
- *Application card: Microsoft Purview Unified Catalog*: «Natural language search (preview)».
- *Investigate workloads with AI-powered Gemini Cloud Assist*: encabezado «Preview» y «during public preview».
- *Use the Data Engineering Agent to build and modify data pipelines*: «The Data Engineering Agent cannot execute pipelines. You must review and run or schedule pipelines.» El «Preview» de esa página está en la investigación con Gemini Cloud Assist, no en el agente que arma el pipeline.
- *Amazon Q data integration in AWS Glue*, *Generative AI troubleshooting…*, *Using machine learning and generative AI…* y las dos páginas de Copilot en Data Factory: el texto no dice preview.

`tests/test_ai_emerging_snippets.py` exige los rechazos de metadata, `aplicadas: 1` y `aplicadas otra vez: 0`, el orden de la propuesta A y los cinco motivos de la B, `OUT_OF_MEMORY` con líneas `[2, 3, 4]`, y `finanzas.ingresos_contables visible: False`. Esas líneas están en el párrafo o en la tabla de cada ficha.

## Por ficha

### `ai-metadata-enrichment`

| Punto | Resultado |
|---|---|
| Preview | La página lo declara, y Knowledge Studio como gated preview |
| No reemplaza | El §1 dice que no reemplaza la gestión de metadata con dueños |
| Purview | *Sample setup* respalda «Get suggested terms» y «Get suggestions» |

### `ai-pipeline-generation`

| Punto | Resultado |
|---|---|
| Preview | Las tres páginas del agente, de Amazon Q y de Copilot no lo declaran, y la ficha tampoco |
| No reemplaza | El §1 dice que no reemplaza el diseño ni la revisión de pipelines |
| Pendiente | `agentic-data-engineering`, dominio 23, fuera de `relations` |
| Código | Orden de A y los cinco rechazos de B coinciden con el test |

### `ai-error-analysis`

| Punto | Resultado |
|---|---|
| Preview de Gemini Cloud Assist | La página lo declara |
| §16 | Baja. Extiende «preview» a funciones cuyas páginas no lo dicen |
| No reemplaza | El §1 dice que no reemplaza el análisis de causa raíz |
| Código | Una hipótesis se mantiene, dos se descartan y no hay acción automática |

### `natural-language-catalog-interfaces`

| Punto | Resultado |
|---|---|
| 600 restricts | La página de búsqueda de Knowledge Catalog: «600 restricts (permission evaluation rules)» y resultados que pueden omitir activos. Las release notes del 2026-06-04 no traen ese número |
| SageMaker Data Agent | La entrada del 4 de junio de 2026 describe la integración con el contexto de SageMaker Catalog, Collibra, Atlan y Alation |
| Preview de Purview | La application card dice «Natural language search (preview)» |
| No reemplaza | El §1 dice que no reemplaza la búsqueda por palabras ni el catálogo gobernado |
| Pendiente | `data-agents`, dominio 23, fuera de `relations` |
