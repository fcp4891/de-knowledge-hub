# Estado · Carril A (Claude Code)

Solo Carril A edita este archivo. El resumen del proyecto está en `docs/STATUS.md`; Carril A lo actualiza al mergear a `main`.

**Última actualización:** 2026-10-06

## Actual
- **Tarea activa:** F3b, dominio 02-sql (01-fundamentals aprobado por Felipe en el navegador, 28/28). Lote F3b-02a entregado en `review_required`; sigue F3b-02b mientras Carril B revisa 02a. 02c espera la revisión de 02a.
- **Mergeado para Carril B:** `b/static-search-fix` (3b50505), `b/f3b-review-01b` (98f13ef), `b/static-demo` (8f96908) y `b/static-search-tags` (e7bb47c) en `main`, 2026-10-06. `f/sql` (a7c0d74) mergeada en `a/f3b-batch-02a` solo con los 10 esqueletos de 02a; los otros 14 se traen por lote, sin publicar esqueletos vacíos en `main`.
- **Siguiente:** F3b-02b (10 fichas); después, 02c (4 patterns) tras la revisión de 02a. Al cerrar el dominio, `make static`.
- **Bloqueos:** —
- **Worktree:** Carril A trabaja en `D:/Proyectos_IA/DES_conocimiento-carril-a` (ROADMAP §2). El directorio principal queda para Carril B.

## Pedidos a Carril B
| Pedido | Estado |
|---|---|
| **B-F3.1 · Revisar el lote F3b-02a** (10 fichas, 02-sql): `sql-joins`, `sql-cte`, `sql-subqueries`, `sql-advanced-select`, `sql-case-expressions`, `sql-nulls`, `sql-qualify` (`modern`), `sql-unnest`, `sql-arrays` y `sql-structs`. Sin VERIFY y sin fuentes nuevas en el registro. Atribución estricta por motor: cada afirmación de producto cita la página de ese motor; las páginas de T-SQL se atribuyen a Fabric Warehouse solo si la página dice que aplica a él (la de subconsultas no lo dice). No se afirma qué es o no es SQL estándar salvo donde una fuente lo dice. Código: el SQL portable se ejecutó en PostgreSQL local; el de BigQuery (`QUALIFY`, `UNNEST … WITH OFFSET`, `SAFE_OFFSET`, `ARRAY<STRUCT>`) no se ejecutó, porque requiere GCP, y está marcado así en cada ficha. Revisar en especial: `sql-qualify` no se presenta como estándar ni como reemplazo de la forma con subconsulta; el modelo de arrays y structs de BigQuery frente a `SUPER` de Redshift y JSON en `varchar` de Fabric | Abierto |
| ~~Demo estática · la búsqueda no carga~~: en `frontend/lib/browserSearch.ts`, `extractField` devuelve `document.snippet` para todo campo que no sea `tags` ni `title`. MiniSearch usa `extractField` también para `idField` y para `storeFields`, así que el id de cada documento es su `snippet`: `addAll` falla con «duplicate ID» en el primer snippet repetido y la búsqueda muestra «No se pudo cargar el índice de búsqueda». Aunque no fallara, `slug`, `type` y demás campos guardados serían el snippet. Arreglo propuesto, una línea: para los demás campos, `return document[fieldName]` (con el tipo que corresponda). Probado con node y MiniSearch sobre `out/data/search-index.json`: con el arreglo, «bigquery» da 41 resultados, «avro» 4 y «governance» 3 (solo por `tags`). Después, `make static` y nuevo zip. Datos: `frontend/public/data/` la genera `make static-data` (1.020 respuestas) y **no se versiona** (decisión de Felipe): no hay que quitarla de `frontend/.gitignore`. `search-index.json` trae `tags` como lista y excluye las fuentes, porque no tienen página | Cerrado (`b/static-search-fix`, 3b50505) |
| ~~Revisar corrección en `testing-with-pytest`~~ (`verified`, aprobada por Felipe): en §10, `normalize_amount` valida el formato con `^(\d{1,3}(\.\d{3})+|\d+)$` antes de quitar los puntos. Es la expresión de `data-transformation` sin el grupo decimal `(,\d+)?`, porque la función devuelve pesos enteros. El test de negativos pasa a un test parametrizado de formatos inválidos: `'10.50'`, `'1.2.3'`, `'12.34'`, `'-5'`, `'N/D'` y `''`. 10 tests en verde y `mypy --strict`. Registrado en el historial de la ficha | Cerrado (`cards-pytest-fix.md`, 5 filas aprobadas; sin cambios; sigue `verified`) |
| ~~B-F3.1 · Revisar el lote F3b-01b~~ (5 fichas, 01-fundamentals; completa el dominio): `avro-format`, `json-format`, `csv-format`, `compression` y `data-contracts`. Sin fuentes nuevas. 1 VERIFY en `data-contracts` §11 (qué restricciones aplica BigQuery según la tabla por plataforma de dbt). Criterio de atribución estricta: cada afirmación de producto se atribuye solo a la fuente que la dice (por ejemplo, «contrato» solo donde la fuente usa la palabra: dbt, Pub/Sub, Glue, Event Hubs). Código probado: lector JSON Lines con claves duplicadas, lector CSV, gzip y detección de cambios incompatibles (Python 3.12, `mypy --strict`); el esquema Avro y `bq load` de `avro-format` no se ejecutaron contra GCP. Revisar en especial: `data-contracts` es `modern` y no se presenta como estándar cerrado; en `json-format` y `csv-format`, las diferencias de cada nube frente a los RFC | Cerrado (revisión aplicada; las 5 fichas `verified`; 01-fundamentals 28/28) |
| ~~B-F3.1 · Revisar el lote 4~~ (10 fichas): `infrastructure-as-code`, `terraform-providers`, `terraform-state`, `terraform-plan-apply`, `gcs-buckets-and-objects`, `gcp-iam-for-data`, `dimension-tables`, `python-api-consumption`, `scheduler` y `file-ingestion`. Sin VERIFY abiertos. Revisar también la §10 nueva de `pubsub-delivery-semantics` (consumidor real de Pub/Sub) | Cerrado (revisión aplicada; las 40 fichas `verified`) |
| ~~B-F3.1 · Revisar los snippets~~ (`snippets-1.md`) | Cerrado (los 8 `verified`) |
| ~~B-F3.1 · Revisar el lote F3b-01a~~ (10 fichas, 01-fundamentals): `what-is-data-engineering`, `data-lifecycle`, `data-ingestion`, `data-transformation`, `data-orchestration`, `lakehouse`, `data-mart`, `schema-on-read-vs-schema-on-write`, `data-consistency` y `cap-theorem`. Sin VERIFY. Fuentes nuevas: `gilbert-lynch-cap-2002` (Nivel 4, solo conceptual), `apache-iceberg-docs`, `delta-lake-docs`, `apache-hudi-docs`, `gcp-spanner-docs`, `gcp-data-engineer-certification`, `aws-data-engineer-certification` y `aws-what-is-data-mart` (Nivel 1). HCL en `data-lifecycle` y `data-mart` (lo valida la CI). Revisar en especial: `lakehouse` no se presenta como reemplazo del warehouse; en `cap-theorem`, la fuente de 2002 se identificó por la lista de publicaciones de Lynch y su formulación se contrastó con el paper de 2012 de los mismos autores | Cerrado (revisión aplicada; las 10 fichas `verified`) |
| ~~B-F3.1 · Revisar el lote 6~~ (10 fichas): `row-vs-columnar-formats`, `testing-with-pytest`, `sql-window-functions`, `grain`, `data-warehouse`, `streaming-ingestion`, `oltp-vs-olap`, `bigquery-cost-model` (solo el modelo de precios, sin montos), `acid` y `normalization`. Sin VERIFY. Fuentes nuevas Nivel 1: `apache-spark-docs` y `aws-firehose-docs` | Cerrado (revisión aplicada; las 60 fichas `verified`) |
| ~~Revisar cambio mínimo en `data-validation-with-pydantic`~~ (`verified`): en §10, `list[dict]` pasa a `list[dict[str, Any]]` (y `from typing import Any`) para pasar `mypy --strict`. Sin cambio de comportamiento; registrado en su historial | Cerrado (aprobado en `cards-f3b-01a.md`) |
| **Snippets que se ejecutan en la CI** (informativo): `requirements-snippets.txt` y `make snippets-deps`; `tests/test_snippet_code.py` ejecuta `pytest-ingestion-test` (7 tests, armando `ingest.py` desde las fichas) y `python-structured-logging`. Si Carril B corre `make test` en su worktree sin esas dependencias, el test de ingesta aparece como *skipped* | Informativo |
| ~~Revisar 3 snippets nuevos~~ (`snippets-3.md`), en `review_required`: `python-structured-logging` (JSON a stdout, `run_id` por filtro en el handler, redacción de campos sensibles de `extra`), `pytest-ingestion-test` (7 tests sin red ni credenciales sobre `validate_page` y `load_day`) y `pubsub-subscription-terraform` (dead letter con los permisos del agente de servicio de Pub/Sub, `*_iam_member`). Fuente nueva `pytest-docs` (Nivel 1) | Cerrado (los 3 `verified`) |
| ~~Revisar §14 de 7 fichas del lote 1~~ ya `verified`: `bigquery-partitioning`, `dead-letter-queue`, `etl-vs-elt`, `incremental-load`, `partitioning`, `scd-type-2` y `sql-merge`. La regla nueva de `validate` exige las viñetas Seguridad, Observabilidad y Costo; en varias se dio rótulo a una viñeta existente y en otras se agregó la que faltaba (ver el historial de cada ficha) | Cerrado (aprobada en `snippets-3.md`; hallazgos 1 y 2 aplicados) |
| ~~B-F3.1 · Revisar el lote 5~~ (10 fichas): `data-lake`, `python-logging`, `airflow-architecture`, `data-validation-with-pydantic`, `batch-ingestion`, `star-schema` (pattern), `dataform-incremental-tables` (pattern), `pubsub-topics-and-subscriptions`, `deduplication` (pattern) y `fact-tables`. Sin VERIFY abiertos. Fuentes nuevas Nivel 1: `pydantic-docs`, `dbt-docs`, `gcp-cloud-logging-docs`, `aws-cloudwatch-logs-docs`, `aws-lake-formation-docs` y `aws-sns-docs`. `pubsub-topics-and-subscriptions` §10 es HCL: lo valida `make validate-terraform` en la CI | Cerrado (revisión aplicada; las 50 fichas `verified`) |
| ~~Revisar 2 snippets nuevos~~ (`snippets-2.md`): `terraform-gcs-bucket` y `terraform-bigquery-iam` (recursos IAM `*_iam_member`, no autoritativos), en `review_required` | Cerrado (los 2 `verified`) |
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
- **Regla (`validate`, 2026-10-04):** la §14 de toda ficha `concept`/`pattern` no stub lleva las viñetas `- **Seguridad:**`, `- **Observabilidad:**` y `- **Costo:**` (el rótulo puede seguir, como `- **Costo y capacidad:**`). Los snippets no la llevan.
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

### F3b-02a (2026-10-06)
- 01-fundamentals aprobado por Felipe en el navegador (28/28). Plan de 02-sql aprobado: lotes 02a (10), 02b (10) y 02c (4 patterns).
- `f/sql` mergeada en `a/f3b-batch-02a` borrando en el mismo commit de merge los 14 esqueletos que no son de 02a; ningún commit de `main` contiene esqueletos vacíos.
- 10 fichas en `review_required`, sin VERIFY. 37 URLs con HTTP 200 y URL final igual a la citada (las de Microsoft Learn se citan con `?view=sql-server-ver17`, la URL final). Sin fuentes nuevas en el registro.
- Hallazgos de las fuentes: Fabric Warehouse sí documenta `QUALIFY` (página propia y orden lógico de `SELECT` de T-SQL «solo en Fabric Data Warehouse»); BigQuery ejecuta una CTE no recursiva una vez por cada referencia; la nota del esqueleto «QUALIFY no es SQL estándar» no se pudo respaldar en una fuente oficial y no se afirma.
- Código ejecutado en PostgreSQL local: joins (filtro en `ON` frente a `WHERE`, anti-join, `NOT IN` con `NULL`), CTE, subconsultas (incluido el error de más de una fila), `ROLLUP` con `GROUPING`, `CASE`, nulos, el equivalente portable de `QUALIFY`, `unnest … WITH ORDINALITY`, arrays desde 1 y tipos compuestos. No ejecutado: el SQL propio de BigQuery.

### Búsqueda de la demo estática y revisión de normalize_amount (2026-10-06)
- Merge de `b/static-search-fix` (3b50505): `extractField` devuelve el campo pedido, así que MiniSearch usa el id real.
- `cards-pytest-fix.md`: las 5 filas aprobadas por Felipe, sin cambios en la ficha; `testing-with-pytest` sigue `verified`. Pedido cerrado.
- `make static` con la corrección: `dist/dekh-static-2026-10-06.zip`, 8.345.159 bytes. Búsqueda verificada en Edge headless por el protocolo de DevTools, sobre el zip extraído y servido en `/DES_conocimiento/`: abrir el diálogo, escribir y leer los resultados del DOM. «bigquery» da 41 resultados, «governance» 3 (por `tags`) e «idempotencia» 4, sin mensaje de error. Los 11 enlaces mostrados responden 200 bajo `/DES_conocimiento/`.

### Demo estática para cPanel (2026-10-06)
- `scripts/static/build_static_data.py` genera `frontend/public/data/` con la misma proyección y formato que los mocks, para todo el contenido: 23 dominios, 359 conceptos (284 sin ficha, con `sections: []`), 92 tecnologías, 13 snippets, relaciones de cada uno y 65 fuentes; 1.020 respuestas, 5,6 MB. Sin `/me` ni `/search`. `search-index.json`: 464 documentos (`id`, `slug`, `title`, `type`, `domain`, `classification`, `has_page`, `snippet` con el mismo texto que la búsqueda de la API, y `tags`). Reutiliza `MockWriter`; los mocks no cambian.
- `scripts/static/package_static.py` y `make static`: `validate`, datos, `npm run build:static` con `BASE_PATH` (por defecto `/DES_conocimiento`) y zip con el contenido de `frontend/out/` en la raíz; falla si faltan `index.html`, `404.html`, `.htaccess` o `data/`, o si `index.html` no usa el `BASE_PATH`. El Makefile desactiva la conversión de rutas de Git Bash, que convertía `/DES_conocimiento` en `C:/Program Files/Git/DES_conocimiento`. `dist/` en `.gitignore`.
- `tests/test_static_data.py` (11 tests): cada elemento de las listas tiene su detalle y relaciones; claves que lee `staticRead`; sin `/me` ni `/search`; forma del índice; idempotencia; validación de `BASE_PATH`.
- Verificación sobre el zip extraído y servido en `/DES_conocimiento/`: 36 páginas con 200 (inicio, los 23 dominios del Explorer, una ficha de cada lote, un concepto sin ficha, snippets, un snippet y una tecnología) y 153 enlaces y recursos internos con 200, todos bajo `/DES_conocimiento/`. En Edge headless: el grafo de `data-contracts` dibuja sus canvas de cytoscape; el Explorer de 01 dice «28 de 28 con ficha». La búsqueda falla por `extractField` (pedido a Carril B). `http.server` no aplica el `.htaccess`: el 404 propio y la caché se comprueban en cPanel.
- README: sección «Demo estática en cPanel».

### F3b-01b verified: 01-fundamentals 28/28 (2026-10-06)
- Merge de `b/f3b-review-01b`, `b/static-demo` y `b/static-search-tags` (conflicto en `lane-b.md` resuelto combinando ambos lados) y de `a/testing-pytest-amount`.
- Revisión aplicada: `data-contracts` §11 con la tabla de restricciones de BigQuery según dbt (`not_null` aplicada; `primary_key` y `foreign_key` solo metadatos; `unique` y `check` no definibles), sin VERIFY; §6 con todas las exclusiones de dbt; `compression` §11 con `LZO_1C` y `LZO_1X`.
- Las 5 fichas `verified`. Menciones «pendiente de ficha» actualizadas en 7 fichas; solo cambia el texto.

### Corrección de normalize_amount en testing-with-pytest (2026-10-06)
- Aprobada por Felipe tras el informe del patrón `REPLACE`. §10 valida el formato antes de convertir (expresión de `data-transformation` sin decimales) y prueba como inválidos `'10.50'`, `'1.2.3'`, `'12.34'`, `'-5'`, `'N/D'` y `''`. La ficha sigue `verified`; queda para revisión de Cursor.

### F3b-01b (2026-10-06)
- 5 fichas de 01-fundamentals en `review_required`: `avro-format`, `json-format`, `csv-format`, `compression` y `data-contracts` (`modern`). 27 URLs con HTTP 200 y URL final igual a la citada. Sin fuentes nuevas en el registro.
- Atribución estricta por fuente: cada nota de `sources` recoge solo lo que dice esa página, y el cuerpo atribuye a cada servicio solo lo que dice su documentación. Un VERIFY: en `data-contracts` §11, las restricciones que aplica BigQuery (las pestañas por plataforma de la página de dbt no llevan nombre en el texto extraído).
- Código ejecutado: lector JSON Lines estricto (`json-format`), lector CSV con comillas y líneas multilínea (`csv-format`), gzip sin pérdida, de 1.056.661 a 144.050 bytes (`compression`), y detección de cambios incompatibles con los criterios de dbt (`data-contracts`); los de Python pasan `mypy --strict`. No ejecutados: el esquema Avro con `bq load` y el YAML de dbt (no hay GCP ni dbt locales).
- Pendiente al pasar a `verified`: 7 fichas `verified` todavía listan alguno de estos 5 conceptos como «pendiente de ficha»; se actualizan al aplicar la revisión, como en F3b-01a.

### Revisión del patrón de conversión numérica con REPLACE (2026-10-06)
- Búsqueda en fichas y snippets de conversiones que quitan el punto (`REPLACE(..., '.', '')`, `.replace(".", "")`) y convierten a número. Un caso: `testing-with-pytest` §10, `normalize_amount` hace `int(raw.replace(".", "").strip())`: convierte sin error `'10.50'` en 1050, `'1.2.3'` en 123 y `'12.34'` en 1234 (comprobado). Los tests de la ficha no cubren esos casos. Corregido el 2026-10-06 tras la aprobación de Felipe (ver arriba).
- Sin el problema: `data-reconciliation` y `bigquery-reconciliation` usan `CAST(monto AS STRING)` para una huella, no para convertir texto a número; `data-transformation` ya valida el formato.

### F3b-01a verified (2026-10-06)
- Merge de `b/f3b-review-01a` y `b/f3b-explorer-tags` (conflicto en `lane-b.md` resuelto combinando ambos lados). Revisión aplicada: `data-transformation` valida el formato del monto antes de convertir ('10.50' ya no pasa a 1050; probado en PostgreSQL y Python); atribución estricta por fuente en `what-is-data-engineering`; disponibilidad según Gilbert y Lynch y fuente cambiada a la copia legible del autor (NUS); fuentes para Lake Formation, `COPY`, Glue, Event Hubs, mirroring y Debezium.
- Las 10 fichas `verified`. Cerrado el pedido del cambio de tipos en `data-validation-with-pydantic`.
- Menciones «pendiente de ficha» actualizadas en 33 fichas y 1 snippet (`dataform-incremental-model`): los conceptos que ya tienen ficha pasan a «Con ficha». Solo cambia el texto; no se agregaron relaciones.

### F3b-01a (2026-10-05)
- 10 fichas de 01-fundamentals en `review_required`, sin VERIFY; 60 URLs con HTTP 200, URL final igual a la citada y sin 404 «suaves» (la guía de Google Cloud «What is data engineering» responde 200 con contenido 404 y se descartó; se usaron las páginas oficiales de certificación de Google Cloud y AWS y la de Fabric Data Engineering).
- `cap-theorem`: la prueba de Gilbert y Lynch (2002) se registra como Nivel 4 con la copia del MIT CSAIL (`Brewer6.pdf`; el DOI de ACM responde 403 a clientes automáticos). El texto del PDF no se puede extraer automáticamente (fuentes Type 3); la identidad se confirmó en la lista de publicaciones de Lynch y la formulación del teorema, en *Perspectives on the CAP Theorem* (2012), que la reproduce.
- Código: el demo de aislamiento de `data-consistency` se ejecutó contra PostgreSQL local, (10, 7) y (10, 10); la simulación de `cap-theorem` se ejecutó y pasa `mypy --strict`; el DAG de `data-orchestration` solo se compiló (sin Airflow instalado).
- Tests: el concepto sin ficha pasa a `data-mesh` (dominio 07) en `test_search_flags_pages` y en `test_concept_without_page_has_no_sections`.

### F3b en el ROADMAP (2026-10-05)
- ADR-009: fase F3b entre F3 y F4, un dominio a la vez en el orden del blueprint, lotes de 10 con los criterios de F3, revisión de Cursor por lote y aprobación de Felipe en el navegador por dominio. Las arquitecturas quedan en F4. 299 conceptos sin ficha (unos 30 lotes).

### Gate de F3 (prompt 0.4, 2026-10-05)
- Criterio 1, 60–80 fichas `verified`: **cumplido**. 60 fichas (49 concept, 11 pattern), las 60 `verified`; además 13 snippets `verified`.
- Criterio 2, cero fichas sin fuentes: **cumplido**. 0 fichas y 0 snippets sin `sources`; 0 marcadores VERIFY; 539 citas (503 Nivel 1, 2 Nivel 2, 34 Nivel 4 conceptuales).
- Criterio 3, gate humano: **aprobado** por Felipe el 2026-10-05, junto con ADR-009 y el plan de 01-fundamentals.
- Evidencia: `make validate` OK (222 entidades); CI de `main` ef90c8a en verde (518 tests, 8 HCL válidos, frontend lint y build).
- Riesgos y deuda: 20 conceptos MVP sin ficha (15 conceptos y las 5 arquitecturas de F4); el SQL de BigQuery de las fichas no se ejecuta contra BigQuery; `terraform-provider-google-docs` sigue `review_required` en el registro; la revisión de snippets-3 no fue independiente; `f/sql` sin mergear; pedido abierto a Cursor por el cambio de tipos en `data-validation-with-pydantic`.

### Lote 6 verified (2026-10-05)
- Merge de `b/f3-review-6`. Revisión del lote 6 aplicada: en `bigquery-cost-model`, compromisos solo en Enterprise y Enterprise Plus, time travel y fail-safe cobrados solo con facturación física, y BigQuery ML incluido en las reservas de esas ediciones (página de precios consultada el 2026-10-05). Las 10 fichas `verified`: 60 en total.
- Pendientes aplicados: `bigquery-deduplicate-latest` implementa `sql-window-functions`; `pytest-ingestion-test` implementa `testing-with-pytest`; `deduplication` pasa `sql-window-functions` de pendiente a relación (`DEPENDS_ON`).

### Tipos en data-validation-with-pydantic (2026-10-05)
- §10: `list[dict]` → `list[dict[str, Any]]` en `validate_page` y `rejected`, con `from typing import Any`. Se usa `Any` porque `pytest-ingestion-test` indexa los valores (`rejected[0]["errors"]`). `mypy --strict` pasa sobre el bloque, sobre `ingest.py` armado desde las fichas y sobre el test del snippet (7 tests en verde). La ficha sigue `verified`; pendiente de revisión de Cursor. Las 10 fichas del lote 6 no se tocaron.

### snippets-3 aplicada, snippets en la CI y lote 6 (2026-10-05)
- Merge de `b/f3-review-snippets-3` (d53e31b, revisión de Cursor sin hallazgos). La revisión paralela de Carril A (6 hallazgos) había quedado en un commit sobre `main` local sin push (a19a3b3); se descartó de `main` y su contenido se integró en `snippets-3.md` al marcar todo `aprobada`.
- snippets-3 aplicada: §14 Costo de `sql-merge` (según la fuente de DML de BigQuery) y de `partitioning` (Athena y Synapse); fuentes de `monkeypatch` y *Access control*; `setattr` en el logging; `Protocol` `LoadClient` en `batch-ingestion` §10 (pasa `mypy --strict` con `bigquery.Client` y con el cliente falso). Los 3 snippets `verified`.
- Dataform: se quita la frase de la CLI; el Preview de `onSchemaChange` queda citado solo desde la referencia de core.
- `requirements-snippets.txt` + `make snippets-deps` + paso en la CI; `tests/test_snippet_code.py`. En la CI: 518 tests, ninguno saltado.
- Lote 6 (10 fichas `review_required`), con 77 URLs verificadas (HTTP 200, URL final igual a la citada). SQL de `sql-window-functions`, `oltp-vs-olap`, `acid` y `normalization` probado en PostgreSQL 17 local; pytest de `testing-with-pytest` ejecutado (5 tests). `test_search_flags_pages` usa `lakehouse` como concepto sin ficha.
- Pendiente menor (fuera de alcance): `list[dict]` sin parámetros de tipo en la §10 de `data-validation-with-pydantic` (mypy `--strict` lo marca). Resuelto el 2026-10-05, ver abajo.

### Lote 5 verified, regla de §14 y 3 snippets (2026-10-04)
- Merge de `b/f3-review-snippets-2` y `b/f3-review-5` (conflicto en `lane-b.md` resuelto combinando ambos lados). `terraform-gcs-bucket` y `terraform-bigquery-iam` `verified`.
- Revisión del lote 5 aplicada: viñeta de Observabilidad en §14 de las 10; `dbt-fabric` (Warehouse) y `dbt-fabricspark` (Lakehouse) con fuente de Microsoft Learn; Preview de `onSchemaChange` citado desde la referencia de Dataform core. La página *Create tables*, consultada el 2026-10-04, sí incluye «Preview» y «isn't available with the Dataform CLI»; la frase de la CLI se mantiene con esa fuente.
- `validate`: §14 exige Seguridad, Observabilidad y Costo; fallaban 7 fichas del lote 1, corregidas.
- Lote 5 `verified` (50 fichas). `bigquery-deduplicate-latest` implementa también `deduplication`.
- Snippets nuevos (`review_required`): `python-structured-logging`, `pytest-ingestion-test` y `pubsub-subscription-terraform`. Fuente nueva `pytest-docs`. El test de pytest se ejecutó en un entorno temporal con pytest 9.1.1, pydantic 2.13.5 y google-cloud-bigquery 3.46.1 (7 pasan; con `WRITE_APPEND`, 2 fallan).

### Lote 5 de F3 (2026-10-02)
- 10 fichas en `review_required`: `data-lake`, `python-logging`, `airflow-architecture`, `data-validation-with-pydantic`, `batch-ingestion`, `star-schema`, `dataform-incremental-tables`, `pubsub-topics-and-subscriptions`, `deduplication` y `fact-tables`. Sin VERIFY; 86 URLs citadas con HTTP 200 y URL final igual a la citada.
- 6 fuentes Nivel 1 nuevas en el registro y en el generador (`LATER_DATES`).
- Código: Python de `python-logging`, `data-validation-with-pydantic` (pydantic 2.13.5) y `batch-ingestion` (cliente de BigQuery simulado) ejecutado; HCL de `pubsub-topics-and-subscriptions` validado por la CI.
- Hallazgos: los Apache Airflow jobs de Fabric soportan Airflow 2.10.5, no Airflow 3; la tabla de adaptadores de dbt no incluye Fabric; `onSchemaChange` de Dataform está en Preview.
- `test_search_flags_pages`: `data-lake` ya tiene ficha; el caso "concepto sin ficha" pasa a `data-warehouse`.

### Snippets y lote 4 verified, HCL de fichas en la CI (2026-10-01)
- Merge de `b/f3-snippets-ui` y `b/f3-review-4`.
- Revisión de snippets aplicada (`CREATE OR REPLACE TEMP TABLE`, también en `incremental-pipelines` §10); los 8 snippets `verified`.
- Revisión del lote 4 sin cambios pedidos; las 40 fichas `verified`. Snippets nuevos `terraform-gcs-bucket` y `terraform-bigquery-iam` (`review_required`); `terraform-bigquery-partitioned-table` implementa también `infrastructure-as-code` y `terraform-providers`.
- `make validate-terraform` valida también el HCL de las fichas (3 bloques, ninguno excluido); marcador `<!-- validate-terraform: excluido — motivo -->` para fragmentos intencionales.

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
