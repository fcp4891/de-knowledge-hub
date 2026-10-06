# Estado · Carril B (Cursor)

Solo Carril B edita este archivo. El resumen del proyecto está en `docs/STATUS.md`; Carril A lo actualiza al mergear a `main`.

**Fase:** F3 (F2 cerrada el 2026-09-30)
**Última actualización:** 2026-10-06

## Actual
- **Tarea activa:** ninguna. B-F3.1 del lote F3b-01b quedó aprobada y la búsqueda estática indexa también `tags`.
- **Siguiente:** esperar a que Carril A deje `tags` en `search-index.json`.
- **Bloqueos:** ninguno.

### Demo estática
- `API_MODE=static` y `BASE_PATH` (obligatorio, no va fijo en el código). `npm run build:static` deja `frontend/out/`. Durante ese build el script pone `dynamicParams = false` en las cuatro rutas dinámicas, sustituye `personalActions.ts` por el stub sin server actions y restaura ambos al terminar.
- Los JSON salen de `frontend/public/data/` (mismo `index.json` que los mocks). Esa carpeta está en `.gitignore`. El script la copia desde los mocks si no hay `index.json`, y arma `search-index.json` (`{ documents: [...] }`) si Carril A todavía no lo dejó. Cuando publique los archivos, hay que quitar `/public/data/` de `frontend/.gitignore` para versionarlos. El script no pisa un `index.json` ni un `search-index.json` ya existentes.
- **Apache:** `frontend/scripts/write-htaccess.mjs` escribe `out/.htaccess` en cada build estático. Carril A no debe generar otro. Lleva `DirectoryIndex index.html`, `ErrorDocument 404 {BASE_PATH}/404.html`, `AddType application/json .json`, `mod_deflate`, caché de un año para `_next/static` y de 5 minutos para HTML y `data/`.
- En estático, notas, estado y favoritos van a `localStorage`. En `hybrid` siguen en la API. No se editó `content/`.
- MiniSearch indexa `title`, `snippet` y `tags`. Carril A incluirá `tags` en `search-index.json` (texto o lista). Si el índice todavía no los trae, la búsqueda sigue por título y snippet.
- El Explorer de `main` (contador «N de M con ficha», filtro Contenido y etiquetas de estado) queda en el navegador: el HTML estático no puede filtrar en el servidor.

### B-F3.1 · lote F3b-01b
- Cinco fichas de 01-fundamentals. Felipe aprobó todas las filas el 2026-10-06, incluidas la tabla de BigQuery de `data-contracts` §11 (`not_null` aplicada; `primary_key` y `foreign_key` solo metadatos; `unique` y `check` no definibles), las exclusiones de la §6 y `LZO_1C` / `LZO_1X` en `compression`. No se editó `content/`.

### B-F3.1 · lote F3b-01a
- Diez fichas de 01-fundamentals y el cambio de tipos en la §10 de `data-validation-with-pydantic`. Felipe aprobó todas las filas el 2026-10-05, incluidas la disponibilidad según Gilbert y Lynch, la fuente de Lake Formation, la atribución por proveedor en `what-is-data-engineering`, las fuentes de `data-ingestion` y el `COPY` de Redshift, y el `REPLACE` de `data-transformation`. No se editó `content/`.

### Explorer · estado de contenido
- `ConceptSummary` ya trae `verification_status`. Cada concepto muestra Verificada, En revisión o Pendiente junto a la clasificación. El filtro Contenido usa `has_page` de la ficha del dominio. La cabecera del dominio dice «N de M con ficha». No se editó `content/`.

### B-F3.1 · lote 6
- Diez fichas, tabla de §48. Felipe aprobó todas las filas el 2026-10-05, incluidas las tres precisiones de `bigquery-cost-model`: compromisos solo de Enterprise y Enterprise Plus, time travel y fail-safe en almacenamiento físico, y BigQuery ML dentro de los slots de esas ediciones. No se editó `content/`.

### B-F3.2 · snippets 3
- Tres snippets y el §14 de `98bc285` (`bigquery-partitioning`, `dead-letter-queue`, `etl-vs-elt`, `incremental-load`, `partitioning`, `scd-type-2`, `sql-merge`). No se editó `content/`.

### B-F3.1 · lote 5
- Diez fichas, tabla de §48. Felipe aprobó todas las filas el 2026-10-04, incluidas `dbt-fabric` y `dbt-fabricspark`, la fuente de Preview de `onSchemaChange` y la viñeta de Observabilidad en §14. No se editó `content/`.

### B-F3.2 · snippets 2
- `terraform-gcs-bucket` y `terraform-bigquery-iam`. Felipe aprobó todas las filas el 2026-10-04. Mínimo privilegio, recursos `*_iam_member`, advertencia de authorized views y costos de Coldline. No se editó `content/`.

### B-F3.1 · lote 4
- Diez fichas, tabla de §48, y aparte el consumidor real de Pub/Sub. Felipe aprobó todas las filas el 2026-10-01. `add-iam-policy-binding` se describe como aditivo y no se llama idempotente. No se editó `content/`.

### B-F3.2 · snippets
- `/snippets` filtra con `GET /snippets` por lenguaje, cloud e `implements`.
- La ficha muestra requisitos, las secciones, el código con resaltado y copiar, y los conceptos que implementa.
- En la ficha de concepto, los snippets salen del grupo `IMPLEMENTS` entrante. Un `code_snippet` abre `/snippets/<slug>`.
- Felipe aprobó las filas de `docs/reviews/snippets-1.md` el 2026-10-01, incluida `CREATE OR REPLACE TEMP TABLE`. El resaltado de HCL quedó en `docs/BACKLOG.md`. No se editó `content/`.

### B-F3.1 · lote 3
- Diez fichas, tabla de §48. Felipe aprobó todas las filas el 2026-10-01, incluida la de `replace_partition` en `catchup` y `dag`. Ninguna afirmación de producto se apoya solo en Kimball o en una RFC. No se editó `content/`.

### B-F3.2 · grafo
- El panel de relaciones dibuja el vecindario a 1 salto con `GET /entities/{slug}/relations`.
- El color del nodo es el tipo de entidad. `origin: blueprint` es línea punteada; `origin: entity` es línea continua.
- `cytoscape` se carga solo si hay vecinos, con `import()` dinámico.
- La lista de relaciones sigue debajo. `/snippets` no entra en este cambio.
- En Chrome: la ficha de concepto y la de tecnología muestran aristas continuas y punteadas, y un clic en un vecino abre su URL.

### B-F3 UX
- El selector de estado y la casilla «Pendiente de profundizar» llaman a `PUT /me/study-state/{slug}` al cambiar, con `last_studied_at` de ahora.
- Se quitó el botón «Guardar estado». El mensaje sigue siendo «Estado guardado.».
- Cliente regenerado (ADR-007). En la búsqueda, un resultado con `has_page: false` muestra «ficha pendiente». El orden de los grupos no se toca.

### B-F3.1 · lote 2
- Diez fichas, tabla de §48, más la corrección de `MERGE` en Redshift (`cb77a2f`). Felipe aprobó todas las filas el 2026-09-30, incluidas las tres salvedades y la precisión de `REMOVE DUPLICATES`. No se editó `content/`.

### B-F3.1 · lote 1
- Una tabla de §48 por cada una de las 10 fichas del lote 1. Felipe aprobó todas las filas el 2026-09-30. No se editó `content/`.
- Los 4 VERIFY (ETL en AWS, ETL en Azure, máximo de particiones de BigQuery, capacidad y retención de Kinesis) quedan destacados y sin inventar el dato.

### B-F2.3
- Cliente regenerado desde el contrato de `main` (422 de ADR-005; PUT y DELETE de notas de ADR-006).
- Conocimiento, búsqueda y `/me` van a `http://localhost:8000/api/v1`. Ya no hay mock de `/me`.
- Búsqueda con Ctrl+K o ⌘K, debounce de 250 ms, grupos en el orden de la API.
- Al guardar el estado de estudio se envía `last_studied_at` con la fecha actual.
- Editar y Borrar notas llaman a `PUT` y `DELETE /me/notes/{slug}/{note_id}`.

### B-F2.2
- Concepto: resumen siempre visible, el resto colapsado, pestañas GCP/AWS/Azure, código con resaltado y copiar, Mermaid en arquitectura, relaciones por tipo y fuentes con nivel.
- Tecnología: cabecera y matriz de capacidades, con diferencias y pestañas de equivalentes.
- Mermaid y highlight.js se cargan solo si la ficha tiene diagrama o código.
- Un slug ausente del índice sigue en «Sin datos en modo mock.» Una ficha stub sin secciones lo dice, sin inventar contenido.
- `main` ya traía el merge de B-F2.1; esta rama lo integró al crearse.

### Límites del mock
- Solo 10 conceptos y 5 tecnologías tenían detalle en el mock. El conocimiento y `/me` salen ahora de la API.
- La búsqueda real no se reordena en el frontend. Los mocks de búsqueda siguen siendo solo ejemplos de forma (ADR-005).

## Pedidos a Carril A
| Pedido | Estado |
|---|---|
| — | — |

## Notas para Carril A
- En news, el tipo de fuente sigue en la entidad `source` y la categoría en `domain` / `tags`. No pedimos un campo `category` en el schema de news.

## Historial

### B-F1b · Revisión de los MVP de 03, 06 y 12
- Revisión de los `mvp: true` de los dominios 03, 06 y 12 en `docs/reviews/`. Todas las filas aprobadas, salvo `catchup` (fila 3 de `docs/reviews/blueprint-06.md`), rechazada: sigue `core` porque el §8 lo lista como concepto independiente de proveedor.

### B-F1.3 · Fuentes y ADR-001
- `docs/adr/ADR-001-stack.md`, **Aceptado** en el gate F1.
- `docs/reviews/sources.md` quedó descartado por obsoleto (se basó en un `main` anterior a A-F1.3). Solo se adoptaron sus frecuencias de revisión.

### B-F1.2 · Revisión del Blueprint
- Dominios MVP 01, 02, 04, 05, 07 y 08 revisados y aprobados en `docs/reviews/`; los aplicó Carril A. El dominio 22 lo revisó y aplicó Carril A.

### B-F1.1 · Templates
- `content/_templates/concept.md`: las 22 secciones del §22, cada una con la pregunta de §48.
- `content/_templates/architecture.md`: secciones del §24.
- `content/_templates/lab.md`: tipos A–E del §25, con escenario, datos, restricciones, criterios y conceptos practicados. Sin solución.
- `content/_templates/news.md`: formato del §31 y relevancia del §32.
- Frontmatter compatible con `schemas/` (verificado en el gate F1). No hizo falta ningún campo nuevo.
