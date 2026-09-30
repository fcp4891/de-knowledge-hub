# Estado · Carril A (Claude Code)

Solo Carril A edita este archivo. El resumen del proyecto está en `docs/STATUS.md`; Carril A lo actualiza al mergear a `main`.

**Última actualización:** 2026-09-29

## Actual
- **Tarea activa:** — (lote 1 de F3 adelantado para el gate de F2; mergeado en `main`)
- **Mergeado para Carril B:** `b/f2-cards` (3e50c05) en `main`, 2026-09-30.
- **Siguiente:** gate de F2.
- **Bloqueos:** —
- **Worktree:** Carril A trabaja en `D:/Proyectos_IA/DES_conocimiento-carril-a` (ROADMAP §2). El directorio principal queda para Carril B.

## Pedidos a Carril B
| Pedido | Estado |
|---|---|
| **Mocks regenerados con 10 fichas reales** (lote 1 de F3): `change-data-capture`, `idempotency`, `etl-vs-elt`, `batch-vs-streaming`, `partitioning`, `sql-merge`, `scd-type-2` (pattern), `incremental-load` (pattern), `dead-letter-queue` (pattern) y `bigquery-partitioning` tienen `has_page: true` y sus 22 secciones. Cambian solo datos; el contrato no cambia. Los 3 patrones tienen `type: pattern` | Informativo |
| **`/me` real disponible (A-F2.4): ya se puede quitar el mock de `/me`.** Con `make db-up && make build && make dev`, toda la API (conocimiento, búsqueda y `/me`) sirve datos reales en `http://localhost:8000/api/v1`. Ver ADR-006: `last_studied_at` lo envía el cliente (si no viene se conserva); un slug sin registro devuelve `not_reviewed` | Abierto |
| **Cambio de contrato (notas, ADR-006, aditivo):** nuevos `PUT /me/notes/{slug}/{note_id}` (cuerpo `NoteUpdate`, devuelve `Note`) y `DELETE /me/notes/{slug}/{note_id}` (204). Nuevo mock `me/notes/change-data-capture.updated.json`. Regenerar el cliente tipado (también cubre el `422` de ADR-005) | Abierto |
| **API real disponible (A-F2.3).** `make db-up && make build && make dev` → `http://localhost:8000/api/v1` (CORS para `http://localhost:3000`). Sirve exactamente los mocks de conocimiento. Excepciones: `/search` (FTS real; los mocks de búsqueda solo son ejemplos de forma, ADR-005) y `/me` (sigue en mock hasta A-F2.4) | Abierto |
| **Regenerar el cliente tipado** (`frontend/lib/api/schema.d.ts`): el contrato declara ahora `422` (problem+json) en todas las operaciones con parámetros (ADR-005, cambio aditivo) | Abierto |
| **`b/f2-frontend` (dae1677) mergeada en `main`** (merge 947cbd1, 2026-09-30). Traer `main` a la rama de trabajo de Carril B antes de B-F2.2 | Informativo |
| **B-F2.1 puede empezar.** Contrato en `docs/contracts/api.yaml` (ADR-002) y mocks en `docs/contracts/mock-data/` (`index.json` asocia `MÉTODO /ruta` con su archivo). Los conceptos salen del blueprint con `has_page`; los que no tienen ficha traen `sections: []`. Si el contrato no alcanza, pedirlo aquí en `lane-b.md`, sin modificarlo | Cerrado (B-F2.1 mergeada) |

## Notas para Carril B
- **Regla (gate F1):** Cursor revisa y propone cambios sobre `content/blueprint/`; solo Carril A edita esos archivos.
- **Regla (F2):** cada carril actualiza solo su archivo en `docs/status/`. `docs/STATUS.md` es un resumen que actualiza Carril A al mergear.
- Los valores de `type` están en snake_case (`cloud_service`, `code_snippet`…).
- Tecnologías: `category` es una enumeración (`enums.schema.json#/$defs/category`) y `mvp` marca las 9 de §51. La matriz está en `content/matrix/capabilities.yaml` (schema `matrix.schema.json`).
- Las relaciones solo se guardan en la entidad origen. Para mostrar la inversa, usar `x-relation-catalog.<TIPO>.inverse` de `schemas/relationships.schema.json`.

## Cambios de contrato (con ADR)
- Creación inicial de `schemas/` y ajuste de pares en el gate de F0 (ADR-000).
- `blueprint.schema.json` (ADR-003).
- Enumeración `category`, `mvp` y `note` en tecnologías, y `matrix.schema.json` (ADR-004).

## Historial

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
