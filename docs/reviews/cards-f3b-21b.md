# Revisión B-F3.1 · lote F3b-21b

Rama `b/f3b-review-21b`, creada desde `origin/main` (`f528b88`). Fichas: `vector-databases`, `chunking`, `rag`, `hybrid-rag`, `reranking` y `metadata-filtering`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Sin hallazgos. Las cifras citadas coinciden con la página N1 del 2026-10-25. La opción A de `rag` dice que los vectores no son semánticos. El hybrid de Bedrock queda limitado a Amazon RDS, Amazon OpenSearch Serverless y MongoDB. Las seis fichas enlazadas solo cambian `relations`, el §17 y el historial, y quitan «pendiente de ficha» donde la ficha ya existe. | ninguna | — |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 606 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Los avisos son de Spark.

## Comprobaciones

```
vector-databases rel_miss=[] legal=False
chunking rel_miss=[] legal=False
rag rel_miss=[] legal=False
hybrid-rag rel_miss=[] legal=False
reranking rel_miss=[] legal=False
metadata-filtering rel_miss=[] legal=False
```

`legal=False`: el cuerpo no nombra la Ley 19.628, un artículo ni «Obligación legal».

```
vector-databases nodos=6 sec14=True
chunking nodos=5 sec14=True
rag nodos=8 sec14=True
hybrid-rag nodos=5 sec14=True
reranking nodos=4 sec14=True
metadata-filtering nodos=4 sec14=True
```

Ese conteo mira las cajas con corchetes. El rombo de `vector-databases` usa llaves, así que el diagrama tiene 7 nodos. `rag` tiene 8 (documentos, chunking, índice, pregunta, recuperar, prompt, modelo, verificar citas). Ninguno pasa de 8. Cada §14 tiene Seguridad, observabilidad y costo.

H1 de las páginas, el 2026-10-25. En Google se descarta el sufijo de colecciones. Las fuentes dicen `accessed: 2026-10-25`.

- «Fine-tune RAG transformations»: «The default chunk size is 1,024 tokens.» «The default chunk overlap is 256 tokens.»
- «Chunk large documents for RAG and vector search in Azure AI Search»: «512 tokens» y «an initial overlap of 25%, which equals 128 tokens.»
- «Reranking for RAG Engine on Gemini Enterprise Agent Platform»: «Very low (less than 100 milliseconds)» y «High (1 to 2 seconds)».
- «Semantic ranking in Azure AI Search»: «only the top 50 results progress to semantic ranking.»
- «Relevance scoring in hybrid search using Reciprocal Rank Fusion (RRF)»: «k to a small value, such as 60», constante distinta del k de vecinos.
- «Configure and customize queries and response generation»: «Hybrid search is only supported for Amazon RDS, Amazon OpenSearch Serverless, and MongoDB vector stores that contain a filterable text field.»
- README de pgvector v0.8.7, «Filtering»: con el 10 % de las filas, HNSW y `hnsw.ef_search` 40, en promedio 4 filas.

`git diff --stat 0945a10 1cd450b` de las seis fichas enlazadas:

```
 content/concepts/azure-ai-for-data-engineers.md  |  6 +++++-
 content/concepts/bedrock-for-data-engineers.md   |  6 +++++-
 content/concepts/context-windows.md              |  8 ++++++--
 content/concepts/embeddings.md                   | 16 +++++++++++++---
 content/concepts/llm-fundamentals.md             |  6 +++++-
 content/concepts/vertex-ai-for-data-engineers.md |  7 ++++++-
 6 files changed, 40 insertions(+), 9 deletions(-)
```

Cada diff agrega la relación, nombra la ficha en el §17 y deja una línea de historial del 2026-10-25. Donde el texto decía «pendiente de ficha», ahora nombra la ficha. En `vertex-ai-for-data-engineers`, `ml-feature-pipeline-architecture` sigue como pendiente. En `embeddings`, el §1 y el paso 5 dejan de decir pendiente. En `context-windows`, el §6 también.

`tests/test_retrieval_snippets.py` exige `usa el índice HNSW: True`, `HNSW, ef_search 40, filtro del 10 %: menos de 10: True`, `HNSW con iterative_scan = strict_order: 10 de 10`, `doc 1: léxica 1, vectorial 1, RRF 0.0328`, el top de MMR con la escalada, `runbook-ventas#timeout` en 0.62 y el modelo local de la opción B. Esas líneas están en el párrafo de cada ficha.

## Por ficha

### `vector-databases`

| Punto | Resultado |
|---|---|
| Código | HNSW y el mismo top 3. El comentario dice que los vectores son léxicos |
| §14 y diagrama | Presentes. 7 nodos contando el rombo |

### `chunking`

| Punto | Resultado |
|---|---|
| 1024 y 256 | Valores por defecto de RAG Engine |
| 512 tokens y 25 % | Punto de partida de Azure, igual a 128 tokens. La nota también cita el ejemplo de 10-15 % |
| Código | El test exige 5 fragmentos por tamaño y 3 por sección |

### `rag`

| Punto | Resultado |
|---|---|
| Opción A | El comentario dice «no semánticos» |
| Código | `runbook-ventas#timeout` 0.62, `#dueno` 0.42, citas válidas y la opción B con el modelo local |
| Enlace a 19 | Técnico. Sin afirmación legal |
| Diagrama | 8 nodos |

### `hybrid-rag`

| Punto | Resultado |
|---|---|
| RRF k=60 | La página dice «a small value, such as 60», distinto del k de vecinos. El ejemplo usa `1/(60 + posición)` |
| Hybrid de Bedrock | La nota dice Amazon RDS, Amazon OpenSearch Serverless y MongoDB, con un campo de texto filtrable |
| Lado vectorial del ejemplo | Vectores léxicos por n-gramas. El párrafo dice que no entienden sinónimos |
| Código | `RRF 0.0328` y `0.0161` |

### `reranking`

| Punto | Resultado |
|---|---|
| Menos de 100 ms y 1 a 2 s | Latencias de la página de RAG Engine |
| Top 50 | «only the top 50 results» de Azure |
| Código | MMR. El reranker administrado queda «no ejecutado». El test exige que la escalada entre solo con MMR |

### `metadata-filtering`

| Punto | Resultado |
|---|---|
| 10 % y `ef_search` 40 | El README de pgvector v0.8.7 dice que llegan en promedio 4 filas |
| Código | Menos de 10 sin iterative scan y 10 de 10 con `strict_order` |
