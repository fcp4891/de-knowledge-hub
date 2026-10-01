# Estado · Carril A (Claude Code)

Solo Carril A edita este archivo. El resumen del proyecto está en `docs/STATUS.md`; Carril A lo actualiza al mergear a `main`.

**Última actualización:** 2026-10-01

## Actual
- **Tarea activa:** — (lote 4 de F3 entregado).
- **Mergeado para Carril B:** `b/f3-graph` (ce313db) y `b/f3-review-3` (3f35a80) en `main`, 2026-10-01.
- **Siguiente:** aplicar la revisión B-F3.1 del lote 4 cuando esté aprobada y, en ese mismo commit, crear los snippets `terraform-gcs-bucket` y `terraform-bigquery-iam` (recursos IAM de miembro, aditivos). Snippets: siguen en `review_required` hasta `docs/reviews/snippets-1.md`. Lote 5: `batch-ingestion` y `python-logging` entre otras. Arquitecturas (`cdc-architecture`, `batch-pipeline-architecture`) quedan para F4.
- **Bloqueos:** —
- **Worktree:** Carril A trabaja en `D:/Proyectos_IA/DES_conocimiento-carril-a` (ROADMAP §2). El directorio principal queda para Carril B.

## Pedidos a Carril B
| Pedido | Estado |
|---|---|
| **B-F3.1 · Revisar el lote 4** (10 fichas en `review_required`): `infrastructure-as-code`, `terraform-providers`, `terraform-state`, `terraform-plan-apply`, `gcs-buckets-and-objects`, `gcp-iam-for-data`, `dimension-tables`, `python-api-consumption`, `scheduler` y `file-ingestion`. Sin VERIFY abiertos. Revisar también la §10 nueva de `pubsub-delivery-semantics` (consumidor real de Pub/Sub) | Abierto |
| **B-F3.1 · Revisar los snippets** (`docs/reviews/snippets-1.md`): los 8 de la Code Library siguen en `review_required` | Abierto |
| **B-F3.2 · Vista `/snippets` (Code Library, ADR-008, cambio aditivo del contrato).** Regenerar el cliente tipado (`npm run generate:api`). Endpoints nuevos: `GET /snippets` (filtros `language`, `cloud`, `implements`; `limit`, `offset`; devuelve `SnippetList`) y `GET /snippets/{slug}` (`SnippetDetail`: metadata común, `language`, `dialect`, `requirements`, `implements` y `sections` con 10 claves fijas: `what_it_solves`, `code`, `how_it_works`, `when_to_use`, `when_not_to_use`, `risks`, `requirements`, `related_concepts`, `sources`, `change_history`). La búsqueda devuelve resultados `type: code_snippet` (`ResultType`). En la ficha de concepto, los snippets salen de `GET /entities/{slug}/relations`, grupo `IMPLEMENTS` entrante (`label: implemented_by`). Mocks: `GET /snippets?limit=500`, `GET /snippets/<slug>` y `GET /entities/<slug>/relations` de los snippets (8 desde el 2026-10-01, con `bigquery-reconciliation`; 107 respuestas en total). **El contrato de snippets ya está en `main`** (ADR-008, a76907b) | Abierto |
| ~~B-F3.1 · Revisar el lote 3~~ (10 fichas): `clustering`, `python-error-handling-and-retries` (pattern), `slowly-changing-dimensions`, `api-ingestion`, `catchup`, `data-reconciliation` (pattern), `parquet-format`, `schema-evolution`, `surrogate-keys` y `dag`. Sin VERIFY abiertos. Revisar también la regla nueva de niveles (Nivel 4 canónico solo para afirmaciones conceptuales; ver Notas) | Cerrado (revisión aplicada; las 30 fichas `verified`) |
| ~~B-F3.1 · Revisar el lote 2~~ (10 fichas): `backfill`, `replay`, `retries` (pattern), `pubsub-delivery-semantics`, `data-pipeline`, `incremental-pipelines` (pattern), `late-arriving-data`, `partition-pruning`, `upsert` (pattern) y `bigquery-clustering`. Sin VERIFY abiertos. Revisar también la corrección de `MERGE` de Redshift en `sql-merge`, `scd-type-2` e `idempotency` (cb77a2f), porque cambia filas aprobadas en B-F3.1 | Cerrado (revisión aplicada; las 20 fichas `verified`) |
| **Entorno de Python del proyecto:** `.venv/` con Python 3.12 (`make venv`; README, «Entorno de Python»). El `Makefile` y la CI lo usan; si Carril B ejecuta objetivos de Python en su worktree (por ejemplo `make dev` o `make mocks`), primero `make venv` allí | Informativo |
| **Mocks regenerados con 20 fichas `verified`**: cambian solo datos (`verification_status`); el contrato no cambia | Informativo |
| **Contrato (ADR-007, aditivo): `has_page` en cada resultado de `/search`.** `false` = concepto del blueprint sin ficha (mostrar "ficha pendiente"); `true` = tiene entidad (ficha, tecnología o fuente). La búsqueda suma 0.3 a los resultados con ficha. Regenerar el cliente tipado (`npm run generate:api`); mocks de búsqueda regenerados | Cerrado (B-F3 UX) |
| **UX hallada en el gate F2:** el estado de estudio solo se guarda con "Guardar estado", mientras que el favorito se guarda al instante; sin aviso de cambios sin guardar. Propuesta: guardar al cambiar el estado o marcar "sin guardar" | Cerrado (B-F3 UX) |
| **Mocks regenerados con 10 fichas reales** (lote 1 de F3): `change-data-capture`, `idempotency`, `etl-vs-elt`, `batch-vs-streaming`, `partitioning`, `sql-merge`, `scd-type-2` (pattern), `incremental-load` (pattern), `dead-letter-queue` (pattern) y `bigquery-partitioning` tienen `has_page: true` y sus 22 secciones. Cambian solo datos; el contrato no cambia. Los 3 patrones tienen `type: pattern` | Informativo |
| **`/me` real disponible (A-F2.4): ya se puede quitar el mock de `/me`.** Con `make db-up && make build && make dev`, toda la API (conocimiento, búsqueda y `/me`) sirve datos reales en `http://localhost:8000/api/v1`. Ver ADR-006: `last_studied_at` lo envía el cliente (si no viene se conserva); un slug sin registro devuelve `not_reviewed` | Cerrado (B-F2.3) |
| **Cambio de contrato (notas, ADR-006, aditivo):** nuevos `PUT /me/notes/{slug}/{note_id}` (cuerpo `NoteUpdate`, devuelve `Note`) y `DELETE /me/notes/{slug}/{note_id}` (204). Nuevo mock `me/notes/change-data-capture.updated.json`. Regenerar el cliente tipado (también cubre el `422` de ADR-005) | Cerrado (B-F2.3) |
| **API real disponible (A-F2.3).** `make db-up && make build && make dev` → `http://localhost:8000/api/v1` (CORS para `http://localhost:3000`). Sirve exactamente los mocks de conocimiento. Excepciones: `/search` (FTS real; los mocks de búsqueda solo son ejemplos de forma, ADR-005) y `/me` (sigue en mock hasta A-F2.4) | Cerrado (B-F2.3) |
| **Regenerar el cliente tipado** (`frontend/lib/api/schema.d.ts`): el contrato declara ahora `422` (problem+json) en todas las operaciones con parámetros (ADR-005, cambio aditivo) | Cerrado (B-F2.3) |
| **`b/f2-frontend` (dae1677) mergeada en `main`** (merge 947cbd1, 2026-09-30). Traer `main` a la rama de trabajo de Carril B antes de B-F2.2 | Informativo |
| **B-F2.1 puede empezar.** Contrato en `docs/contracts/api.yaml` (ADR-002) y mocks en `docs/contracts/mock-data/` (`index.json` asocia `MÉTODO /ruta` con su archivo). Los conceptos salen del blueprint con `has_page`; los que no tienen ficha traen `sections: []`. Si el contrato no alcanza, pedirlo aquí en `lane-b.md`, sin modificarlo | Cerrado (B-F2.1 mergeada) |

## Notas para Carril B
- **Regla de niveles de fuente (F3, lote 3, 2026-09-30):** las afirmaciones **de producto** (servicios, APIs, límites, valores por defecto) exigen fuente Nivel 1–2. Las afirmaciones **conceptuales** pueden apoyarse en una referencia canónica Nivel 4 (`source_type: spec_paper`), como `kimball-group-techniques` (modelado dimensional) o `ietf-rfc` (semántica HTTP). `validate` lo refleja así: en fichas `concept`/`pattern` rechaza fuentes Nivel 3 y 5, exige al menos una fuente Nivel 1–2 por ficha y comprueba que `authority_level` coincida con `source_type`. La separación entre afirmación conceptual y de producto la verifica la revisión B-F3.1. La regla también está en la cabecera de `content/sources/registry.yaml`.
- **Regla (F3, 2026-09-30):** cuando se aplica la revisión aprobada de un lote y la ficha no tiene VERIFY pendientes, pasa a `verification_status: verified` con `last_verified` de ese día. Lotes 1, 2 y 3: las 30 fichas están `verified`.
- **Nombres:** B-F3.1 es la revisión de fichas (cada lote); B-F3.2 es la Code Library.
- **Regla (gate F1):** Cursor revisa y propone cambios sobre `content/blueprint/`; solo Carril A edita esos archivos.
- **Regla (F2):** cada carril actualiza solo su archivo en `docs/status/`. `docs/STATUS.md` es un resumen que actualiza Carril A al mergear.
- Los valores de `type` están en snake_case (`cloud_service`, `code_snippet`…).
- Tecnologías: `category` es una enumeración (`enums.schema.json#/$defs/category`) y `mvp` marca las 9 de §51. La matriz está en `content/matrix/capabilities.yaml` (schema `matrix.schema.json`).
- Las relaciones solo se guardan en la entidad origen. Para mostrar la inversa, usar `x-relation-catalog.<TIPO>.inverse` de `schemas/relationships.schema.json`.

## Cambios de contrato (con ADR)
- Creación inicial de `schemas/` y ajuste de pares en el gate de F0 (ADR-000).
- `blueprint.schema.json` (ADR-003).
- Enumeración `category`, `mvp` y `note` en tecnologías, y `matrix.schema.json` (ADR-004).
- Code Library: `/snippets`, `/snippets/{slug}`, `Language`, `Snippet*` y `code_snippet` en `ResultType` (ADR-008, aditivo).

## Historial

### Lote 4 de F3 y consumidor de Pub/Sub (2026-10-01)
- `b/f3-review-3` ya estaba en `main` (5ee8499); nada que mergear.
- `pubsub-delivery-semantics` §10: consumidor real de Pub/Sub (google-cloud-pubsub, streaming pull) con upsert idempotente en PostgreSQL (psycopg 3), verificado contra el quickstart y la referencia del cliente de Python y la documentación de psycopg; probado con módulos simulados y el UPSERT contra PostgreSQL. Fuente nueva `psycopg-docs`.
- Lote 4: 10 fichas en `review_required` (4 de Terraform, `gcs-buckets-and-objects`, `gcp-iam-for-data` y 4 por criterio). 81 URLs verificadas; los VERIFY que surgieron (gcloud storage, gcloud add-iam-policy-binding, DDL de BigQuery, nombres de providers) se resolvieron con documentación oficial o se reformularon. Fuentes nuevas: `gcp-iam-docs`, `gcp-terraform-docs`, `gcp-infrastructure-manager-docs`, `aws-s3-docs`, `aws-iam-docs`, `aws-cloudformation-docs`, `aws-eventbridge-scheduler-docs`.

### Revisión del lote 3, verified y reconciliación (2026-10-01)
- Merge de `b/f3-graph` y `b/f3-review-3`.
- `data-pipeline` §10 alineada con el snippet ejecutable `airflow-daily-partition-dag`. Auditoría de código de fichas `verified`: la otra con funciones no definidas es `pubsub-delivery-semantics` §10 (esquema con `parse` y `upsert_customer`), pendiente de decisión.
- Revisión B-F3.1 del lote 3 aplicada: `catchup` y `dag` muestran la transacción de reemplazo de la partición y su código es ejecutable. El código de `api-ingestion` no cambió.
- Lote 3 `verified` (30 fichas `verified` en total). Snippet `bigquery-reconciliation`; `python-api-ingestion-retries` y `airflow-daily-partition-dag` enlazados a las fichas del lote 3. 474 tests.

### A-F3.2 · Code Library (2026-10-01)
- Plantilla `content/_templates/snippet.md` (10 secciones, §23). `validate`: secciones de la plantilla, `requirements` no vacío y al menos un `IMPLEMENTS` hacia un concept o pattern `verified`; también `related_topics` = `relations` y regla de niveles de fuente.
- 7 snippets en `review_required`, reutilizando el código corregido de las fichas: `bigquery-incremental-merge-watermark`, `bigquery-scd-type-2`, `bigquery-deduplicate-latest`, `dataform-incremental-model`, `airflow-daily-partition-dag`, `python-api-ingestion-retries` y `terraform-bigquery-partitioned-table`. 22 URLs verificadas. Diferidos: reconciliación (espera el lote 3) y Terraform de Cloud Storage e IAM (lote 4).
- ADR-008: endpoints `/snippets` y `/snippets/{slug}`, `code_snippet` en la búsqueda. Los snippets no reciben el bonus de ficha de ADR-007, para no superar a la ficha del concepto en consultas conceptuales.
- CI: `make validate-terraform` (extrae el HCL y ejecuta `terraform init -backend=false` y `terraform validate` con `hashicorp/setup-terraform@v4`, sin credenciales).
- Tests: el código Python de los snippets compila y la ingesta se ejecuta con red simulada (paginación, 429, 404, reejecución idempotente).

### Lote 3 de F3 (2026-09-30)
- Regla de niveles de fuente: producto Nivel 1–2; conceptual también Nivel 4 canónico (`spec_paper`). `validate`: fuentes Nivel 3 y 5 rechazadas en fichas, al menos una Nivel 1–2 por ficha, `authority_level` coherente con `source_type` (4 tests).
- Fuentes nuevas: `kimball-group-techniques` e `ietf-rfc` (Nivel 4); `apache-parquet-docs`, `apache-avro-docs`, `aws-boto3-docs`, `gcp-python-api-core-docs`, `aws-step-functions-docs`, `aws-mwaa-docs` (Nivel 1).
- 10 fichas (8 concept, 2 pattern) en `review_required`; 61 URLs verificadas con HTTP 200 y URL final. Los VERIFY que surgieron (API de TaskFlow, `max_active_runs`, `ADD COLUMN IF NOT EXISTS`, modos de Event Hubs, cliente HTTP) se resolvieron con documentación oficial; el ejemplo de ingesta usa `urllib.request` de la biblioteca estándar. Los ejemplos de reintento se probaron con fallos simulados. 395 tests.

### Entorno, revisión del lote 2 y verified (2026-09-30)
- `.venv/` propio (Python 3.12): `make venv`; el `Makefile` usa siempre su intérprete y se detiene si falta; `scripts/` corta con instrucciones si corre con otro Python; la CI crea el entorno con `make venv`. README nuevo con el procedimiento. No se instala nada en el Python global.
- Merge de `b/f3-review-2` y revisión B-F3.1 del lote 2 aplicada: watermark de `incremental-pipelines` tomado del lote leído, con corte para timestamps futuros y rollback si falta o cambia la fila de control; transacción de `replace_partition` en `data-pipeline`; «Managed Service for Apache Airflow (ex Cloud Composer)» con la página oficial de Managed Airflow; precisión de `REMOVE DUPLICATES` en `sql-merge`, `scd-type-2`, `idempotency` y `upsert`.
- Regla de `verified`: lote 2 completo y las 3 fichas pendientes del lote 1. Las 20 fichas quedan `verified`. 391 tests.

### Deuda técnica de F3 (2026-09-30)
- `validate.py` y `page_sections.py` se movieron a `backend/content/` (BACKLOG A-F2.3). El compilador, el lector y la proyección importan de ahí; `scripts/validate.py` queda como punto de entrada de `make validate`.
- Warning de pytest en la CI (`StarletteDeprecationWarning`): starlette ≥ 1.2 pide `httpx2` para el `TestClient`. `requirements.txt` cambia `httpx` por `httpx2>=2.13,<3` y fija `starlette>=1.2,<2`. El entorno local estaba en fastapi 0.116 / starlette 0.46 y la CI instalaba fastapi 0.142 / starlette 1.7; ahora ambos coinciden.
- `ResourceWarning` ocultas: el `env.py` de Alembic no liberaba su engine y dejaba una conexión abierta por migración. Se libera con `dispose()`, y pytest ahora muestra las `ResourceWarning` (`filterwarnings`).
- Regla nueva: 7 fichas del lote 1 pasan a `verified`.

### Lote 2 de F3 y revisión del lote 1 (2026-09-30)
- Merge de `b/f3-ux` y `b/f3-review` a `main`.
- Revisión B-F3.1 aplicada (54 filas): ejemplos DELETE+INSERT dentro de una transacción; el `MERGE` simple de `sql-merge` asigna la cantidad y marca la variante aditiva como no idempotente; seguridad, observabilidad y costo en §14; 15 relaciones nuevas. Nueva regla de `validate`: todo `related_topics` debe estar en `relations`.
- Los 4 VERIFY del lote 1 se resolvieron con documentación oficial (nueva fuente `aws-glue-docs`).
- Corrección de `MERGE` en Redshift en 3 fichas del lote 1 (falla ante varias filas de origen por fila destino; la eliminación de duplicados es solo del modo `REMOVE DUPLICATES`).
- Lote 2: 10 fichas (7 concept, 3 pattern) en `review_required`, 37 URLs verificadas con HTTP 200 y texto leído, sin VERIFY abiertos. Nueva fuente `aws-managed-flink-docs`. Mocks regenerados (84 respuestas). 391 tests.

### F3 · Tareas previas (2026-09-30)
- Búsqueda: `has_page` en cada resultado y +0.3 a lo que tiene ficha (ADR-007, cambio aditivo del contrato). Mocks de búsqueda regenerados.
- CI: job de frontend (npm ci, lint, build con `API_MODE=mock`), acciones `@v7` (node24) y `ubuntu-24.04`.
- Respaldo del estado personal: `make backup-me` / `make restore-me` (pg_dump de `me_*` a `BACKUP_DIR`, fuera del repo).
- Volumen Docker viejo `des_conocimiento-carril-a_dekh-pgdata` eliminado (sin contenedores que lo usaran; estado personal vacío). La base de desarrollo usa `dekh_dekh-pgdata` (proyecto Compose `dekh`).

### Lote 1 de F3, adelantado para el gate de F2 (2026-09-30)
- `validate.py` + `scripts/page_sections.py`: las fichas `concept`/`pattern` que no son stub deben tener las 22 secciones de la plantilla, en orden, con sus títulos y sin secciones vacías. También se comprueba que domain y subdomain coincidan con el blueprint. (Primera tarea de F3 del BACKLOG.)
- 10 fichas en `content/concepts/` (7 concept y 3 pattern), todas en `review_required` hasta la revisión B-F3.1: 40 referencias a fuentes y 4 puntos VERIFY.
- Cada afirmación de producto se verificó leyendo la página oficial (texto extraído), no solo la URL. Nuevas fuentes: `aws-redshift-docs`, `aws-sqs-docs`, `aws-athena-docs`, `aws-kinesis-docs` (también en el generador).
- Base recompilada y mocks regenerados (83 respuestas). 379 tests, 0 omitidos.
- Remoto `origin` = github.com/fcp4891/de-knowledge-hub; la CI en GitHub Actions (Linux) pasa: 352 tests en el primer push.

### A-F2.4 · Estado personal /me (2026-09-30)
- Migración `0003`: `me_study_states`, `me_notes`, `me_favorites`, con `user_id` fijo `default` en la PK. Sin FK a contenido: el compilador nunca las toca.
- `backend/app/personal.py` (SQL por petición, upserts) y `routers/me.py` (cuerpos validados con Pydantic). 404 si el slug no es concepto ni tecnología.
- Estado de slugs que ya no existen: se conserva, se oculta de los listados y su `GET` da 404. `last_studied_at` lo fija el cliente.
- Contrato: `PUT` y `DELETE /me/notes/{slug}/{note_id}` (aditivo). ADR-006.
- 44 tests contra PostgreSQL real: mocks de `/me` reproducidos (salvo campos del servidor), contrato, semántica de estados, notas y favoritos, independencia del compilador, huérfanos.

### A-F2.3 · API FastAPI y búsqueda FTS (2026-09-30)
- `backend/app/`: routers por recurso (domains, concepts, technologies, relations, sources, search), repositorio con índice en memoria leído de PostgreSQL (se recarga si cambia `content_files`), errores `problem+json`, CORS y `/openapi.json` = contrato. `make dev`.
- `projection.py` movido a `backend/app/`; filtros de `/concepts` y `/technologies`.
- Búsqueda: migración `0002` (`search_documents`, `es_unaccent` / `en_unaccent`, índices GIN); ranking en español e inglés con slug indexado, prefijo de palabra, coincidencia exacta y `core`. ADR-005.
- Contrato: `422` declarado en todas las operaciones con parámetros (aditivo, ADR-005).
- Dependencias en requirements: FastAPI, uvicorn, httpx.
- Tests contra PostgreSQL real: 61 respuestas idénticas a sus mocks (todas las de conocimiento); contrato (incluidos 404/422 y búsqueda); filtros contra `content/`; ranking FTS; recarga tras recompilar.

### A-F2.2 · Compilador content/ → PostgreSQL (2026-09-30)
- `backend/db/schema.py` (SQLAlchemy Core) + migración Alembic `0001_initial`, que coincide con el esquema: lo verifica un test.
  - Tablas: `entities` (columnas §40 + `data` JSONB con el frontmatter completo + `body_markdown`), `technologies`, `sources`, `concept_pages`, `entity_sources`, `edges` (origin entity/blueprint, `metadata` JSONB), `domains`, `subdomains`, `concepts`, `capabilities`, `capability_cells` y `content_files` (sha256 + versión del compilador).
  - Cada fila guarda su `file_path` con ON DELETE CASCADE: recompilar o borrar un archivo elimina exactamente lo que produjo.
- `backend/db/compiler.py` + `scripts/compile.py`: valida antes; compila solo archivos cambiados; en una transacción; en dos fases (borrar, luego insertar), así un slug puede moverse de archivo. `--full` fuerza todo.
- `backend/db/reader.py`: reconstruye el `ContentIndex` desde PostgreSQL; la proyección de A-F2.1 lo sirve sin cambios. Los mocks generados desde la base son idénticos byte a byte a los versionados.
- `docker-compose.yml` (postgres:17, puerto 54329), `.env.example`, Makefile (`db-up`, `db-down`, `migrate`, `compile`; `build` = validate + migrate + compile), CI con servicio PostgreSQL.
- Dependencias nuevas: SQLAlchemy, psycopg y Alembic (justificadas en el commit).
- 9 tests de base de datos contra PostgreSQL real, 0 omitidos: idempotencia, recompilación completa, solo lo cambiado, borrado con aristas, slug movido, contenido inválido sin cambios, migración vs. esquema y equivalencia con los mocks. 190 tests en total.

### A-F2.1 · Contrato de API y mock-data (2026-09-29)
- `docs/contracts/api.yaml`: OpenAPI 3.1, 14 rutas (18 operaciones), metadata §40 en todo detalle; ADR-002.
- Decisiones: conceptos desde el blueprint con `has_page`; relaciones de entidades + blueprint (`origin`); `/sources/{slug}`; listados `GET /me/study-state?state=` y `GET /me/favorites`.
- `scripts/contracts/projection.py` (referencia ejecutable de las formas) y `build_mocks.py` (`make mocks`): 74 respuestas generadas desde `content/`, con 10 conceptos, 5 tecnologías, 23 dominios, relaciones, fuentes citadas, 3 búsquedas y estado personal de ejemplo.
- Tests de contrato: cada mock cumple su schema, cada operación tiene mock, mocks al día, enums del contrato iguales a `schemas/`.

### Revisión B-F1b de 03, 06 y 12 (2026-09-29)
- 16 filas aprobadas aplicadas: relaciones, tecnologías, notas de alcance; `python-logging` y `terraform-plan-apply` pasan a `intermediate`.
- Fila 06-3 rechazada (catchup a `modern`): no se aplica, `catchup` sigue `core`.
- `b/f1b-review` mergeada; conflicto add/add en `lane-b.md` resuelto combinando ambas versiones.

### F2 · Ajustes previos (2026-09-29)
- Estado dividido en `docs/status/lane-a.md` y `docs/status/lane-b.md`; `docs/STATUS.md` pasa a ser un resumen.
- Generadores de arranque versionados en `scripts/generators/` (`technologies.py`, `sources.py`), con rutas relativas y datos al día. Tests: la salida valida contra los schemas, son idempotentes y el registro generado solo difiere del actual en `updated_at`. `sources.py` no sobrescribe sin `--force`.
- BACKLOG: la validación de las 22 secciones queda como primera tarea de F3.

### Cierre F1 (2026-09-29)
- Revisiones 07 y 08 aplicadas (32 filas aprobadas):
  - en 08, `gcs-buckets-and-objects` entra al MVP y `gcs-storage-classes-and-lifecycle` sale;
  - `lambda-architecture` pasa a `modern` y `rag-data-pipeline-architecture` a `emerging`;
  - importancias, relaciones y notas de alcance.
- Frecuencias del registro alineadas a la propuesta de Carril B: documentación trimestral, release notes mensual, Python trimestral.
- ADR-001 Aceptado. `b/f1-templates` y `b/f1-review` mergeadas en `main`.
- Revisiones B-F1.2 de 01, 02, 04 y 05 aplicadas (51 filas): +`schema-on-read-vs-schema-on-write`, +`csv-format`, +`sql-nulls`, `sql-qualify` a `modern`, importancias, relaciones y notas.
- `gcp-cloud-composer`: título «Managed Service for Apache Airflow (ex Cloud Composer)», tags `cloud-composer` y `composer`; la nota cita el anuncio del 2026-04-15 en las release notes oficiales. El slug no cambia.

### A-F1.3 · Source Registry
- `content/sources/registry.yaml`: 26 fuentes.
  - Las 6 de F0, reverificadas y enlazadas a sus tecnologías.
  - 20 nuevas para las 9 tecnologías MVP: documentación (Nivel 1) y release notes (Nivel 2). Terraform suma las del provider Google.
- Verificación real de cada URL: HTTP 200 y `<title>` del producto; se guarda la URL final (GCP redirige a `docs.cloud.google.com`).
- 25 fuentes con `url_verified: true`. La excepción es `terraform-provider-google-docs` (SPA con título genérico).
- `validate.py`: toda tecnología `mvp` sin una fuente Nivel 1–2 con `url_verified` es error.

### A-F1.2 · Tecnologías y Cloud Capability Matrix
- ADR-004:
  - un archivo por tecnología; la vista de inventario sale de `--report`;
  - campos `mvp` y `note`, y enumeración `category`;
  - `RUNS_ON` para open source → servicio administrado; `IMPLEMENTS` solo hacia concepto o patrón;
  - productos de Microsoft como `cloud_service` con `provider: azure`.
- Inventario: 92 tecnologías en `content/technologies/`, todas `stub: true` y `review_required`: 61 `cloud_service` (19 GCP, 24 AWS, 18 Azure) y 31 `technology`; 9 MVP.
- `content/matrix/capabilities.yaml`: 18 capacidades con `differences` y `not_equivalent_when` por celda, todas en `review_required`.
- `validate.py`: `related_technologies` sin resolver es error; valida la matriz (schema, conceptos ancla, servicio del proveedor de su columna).

### A-F1.1 · Blueprint de dominios
- `schemas/blueprint.schema.json` y ADR-003: modelo del blueprint y convención de slugs de tecnología.
- `content/blueprint/`: 23 dominios. Al cierre de F1: 359 conceptos, 80 `mvp: true`.
- MVP (opción B): 5 en `python`, 5 en `orchestration` y 4 en `infrastructure-as-code`, todos con `mvp_reason`.
- Revisión del dominio 22: +`data-platform-engineering`, +`data-versioning`, +`zero-etl-and-federation`.
- Medallion se mantiene en F4 aunque no sea MVP (nota en ROADMAP F4).
- Ajustes de MVP en el gate: 12 (entra `infrastructure-as-code`, sale `terraform-modules`); 07 (entra `event-driven-architecture`, sale `medallion-architecture`).

### A-F0 · Repo y contratos base
- Estructura del repo, `Makefile`, `.gitattributes` (`eol=lf`), CI en `.github/workflows/ci.yml`.
- `schemas/` v0: `enums`, `base` (§40 + `relations`, `stub`), `relationships` (14 relaciones con pares permitidos e inversa) y 13 schemas de entidad (§41).
- `scripts/validate.py`: schema por `type`, `id = <type>:<slug>`, unicidad, referencias existentes, pares de relación permitidos.
- Ficha de ejemplo `change-data-capture` (22 secciones, `review_required`) y stubs `debezium`, `apache-kafka`, `gcp-datastream`, `idempotency`.
- ADR-000.
