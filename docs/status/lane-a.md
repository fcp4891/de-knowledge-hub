# Estado · Carril A (Claude Code)

Solo Carril A edita este archivo. El resumen del proyecto está en `docs/STATUS.md`; Carril A lo actualiza al mergear a `main`.

**Última actualización:** 2026-09-29

## Actual
- **Tarea activa:** A-F2.1 · Contrato de API y mock-data (plan pendiente de aprobación).
- **Siguiente:** A-F2.2 · Compilador `content/` → PostgreSQL.
- **Bloqueos:** —
- **Worktree:** Carril A trabaja en `D:/Proyectos_IA/DES_conocimiento-carril-a` (ROADMAP §2). El directorio principal queda para Carril B.

## Pedidos a Carril B
| Pedido | Estado |
|---|---|
| — | — |

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
