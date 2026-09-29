# STATUS — Data Engineering Knowledge Hub

**Fase actual:** F1 — Knowledge Blueprint v1 (F0 cerrada y aprobada el 2026-09-28)
**Última actualización:** 2026-09-28

---

## Carril A — Claude Code
- **Tarea activa:** — (A-F1.2 cerrada y mergeada en `main`)
- **Revisión B-F1.2 del dominio 01 aplicada** (12 filas aprobadas en `docs/reviews/blueprint-01.md`, rama `b/f1-review`):
  - 8 filas con cambios: +`schema-on-read-vs-schema-on-write`, +`csv-format`, relaciones y notas, y `data-consistency` pasa a importance high;
  - 4 filas confirman valores actuales y no cambian nada.
- **Hecho (A-F1.2 · Tecnologías y Cloud Capability Matrix):**
  - `docs/adr/ADR-004-technology-inventory-and-matrix.md`:
    - un archivo por tecnología; la vista de inventario sale de `--report`;
    - campos `mvp` y `note`, y enumeración `category`;
    - `RUNS_ON` para open source → servicio administrado; `IMPLEMENTS` solo hacia concepto o patrón;
    - productos de Microsoft como `cloud_service` con `provider: azure`.
  - Inventario: 92 tecnologías en `content/technologies/`, todas `stub: true` y `review_required`.
    - Por tipo: 61 `cloud_service` (19 GCP, 24 AWS, 18 Azure) y 31 `technology`.
    - 9 MVP, las de §51.
    - 5 servicios agregados solo para la matriz: `gcp-dataproc`, `gcp-cloud-monitoring`, `aws-secrets-manager`, `aws-kms`, `azure-monitor`.
  - `content/matrix/capabilities.yaml`: 18 capacidades ancladas a conceptos del blueprint.
    - Cada celda lleva `differences` y `not_equivalent_when`.
    - Todas las celdas quedan en `review_required`.
  - `validate.py`:
    - un `related_technologies` sin resolver ahora es error;
    - valida la matriz: schema, conceptos ancla, y que cada servicio sea un `cloud_service` del proveedor de su columna;
    - `--report` muestra el inventario por tipo, vendor y MVP.
  - Tests: 74 en total (12 nuevos).
- **Worktree:** Carril A trabaja en `D:/Proyectos_IA/DES_conocimiento-carril-a` (ROADMAP §2). El directorio principal queda para Carril B.
- **Cerrado y mergeado en `main`:** A-F1.1 · Blueprint de dominios.
- **Hecho (A-F1.1 · Blueprint de dominios):**
  - `schemas/blueprint.schema.json` y `docs/adr/ADR-003-knowledge-blueprint.md`: modelo del blueprint y convención de slugs de tecnología.
  - `content/blueprint/01-fundamentals.yaml` … `23-emerging-technologies.yaml`: 23 dominios, 353 conceptos, 80 `mvp: true`, 15 `added_by: blueprint`.
  - MVP (opción B): 5 en `python`, 5 en `orchestration` y 4 en `infrastructure-as-code`, todos con `mvp_reason`. Tope de ~80 respetado.
  - Revisión del dominio 22 aplicada: +3 conceptos (`data-platform-engineering`, `data-versioning`, `zero-etl-and-federation`), ajustes de importancia, nivel y relaciones.
  - Medallion se mantiene en F4 aunque no sea MVP (nota en ROADMAP F4).
  - Ajuste de MVP en el gate (el total sigue en 80):
    - 12: entra `infrastructure-as-code`, sale `terraform-modules`.
    - 07: entra `event-driven-architecture`, sale `medallion-architecture`.
  - `validate.py`: validación del blueprint y cruce con las entidades existentes. `--report` imprime el resumen y las tecnologías pendientes.
  - 20 tests nuevos; en total 62, en verde.
- **Cerrado:** A-F0 · Repo y contratos base (merge en `main`)
- **Hecho (A-F0 · Repo y contratos base):**
  - Estructura del repo según ROADMAP §3, `Makefile` (validate, test, build, dev, install), `.gitattributes` (`eol=lf`), CI en `.github/workflows/ci.yml`.
  - `rules/project.mdc` movido a `.cursor/rules/project.mdc`.
  - `schemas/` v0:
    - `enums.schema.json`, `base.schema.json` (§40 + `relations`, `stub`), `relationships.schema.json`.
    - 13 schemas en `schemas/entities/` (§41).
    - `relationships.schema.json` contiene 14 relaciones con los pares origen/destino permitidos y el nombre inverso para la UI.
  - `scripts/validate.py`:
    - valida contra el schema de cada `type` y comprueba `id = <type>:<slug>`;
    - comprueba que ids y slugs sean únicos y que `technologies`, `related_topics`, `sources` y `relations` apunten a entidades existentes;
    - comprueba que cada relación use un par origen/destino permitido.
  - Contenido:
    - Ficha de ejemplo `content/concepts/change-data-capture.md` con las 22 secciones, en `review_required`.
    - Stubs (`stub: true`): `debezium`, `apache-kafka`, `gcp-datastream`, `idempotency`.
    - `content/sources/registry.yaml` con 6 fuentes de Nivel 1; URLs comprobadas con HTTP 200 el 2026-09-28.
  - Ajuste de gate: `RELATED_TO` abierta a cualquier tipo; `ALTERNATIVE_TO` con `type_groups` (mismo tipo; technology y cloud_service comparten grupo). Test que fija los pares que necesitan F2–F6.
  - 42 tests en `tests/test_validate.py`. `make validate` y `make test` en verde.
  - `docs/adr/ADR-000-content-as-code.md`.
- **Siguiente:** A-F1.3 (Source Registry). La prioridad son las fuentes Nivel 1–2 de las 9 tecnologías MVP. Después hay que verificar las celdas de la matriz.
- **Bloqueos:** —
- **Cambios de contrato (con ADR):**
  - creación inicial de `schemas/` y ajuste de pares en el gate de F0 (ADR-000);
  - `blueprint.schema.json` (ADR-003);
  - enumeración `category`, `mvp` y `note` en tecnologías, y `matrix.schema.json` (ADR-004).
- **Notas para Carril B:**
  - **Regla (gate F1):** Cursor revisa y propone cambios sobre `content/blueprint/`; solo Carril A edita esos archivos.
  - Los valores de `type` están en snake_case (`cloud_service`, `code_snippet`…).
  - Tecnologías: `category` es ahora una enumeración (`enums.schema.json#/$defs/category`) y `mvp` marca las 9 de §51. La matriz está en `content/matrix/capabilities.yaml` (schema `matrix.schema.json`).
  - Las relaciones solo se guardan en la entidad origen. Para mostrar la inversa, usar `x-relation-catalog.<TIPO>.inverse` de `schemas/relationships.schema.json`.

## Carril B — Cursor
- **Tarea activa:** —
- **Hecho:** —
- **Siguiente:** —
- **Bloqueos:** —

## Pedidos entre carriles
| De | Para | Pedido | Estado |
|---|---|---|---|
| A | B | Iniciar B-F1.1 (Templates): `schemas/` v0 ya está en `main` | Abierto (en curso en `b/f1-templates`) |
| A | B | B-F1.2: crear la rama `b/f1-review` desde `main`. El blueprint completo (23 dominios) ya está mergeado. Revisar en especial los 15 `added_by: blueprint`. El dominio 22 ya está revisado y aplicado | Abierto |

## Criterio de salida de la fase actual
- [ ] Blueprint validado con los 23 dominios; conceptos del MVP marcados.
- [ ] Templates cerrados.
- [ ] Source Registry con fuentes oficiales para todas las tecnologías del MVP.
- [ ] ADR-001 aprobado.
- [ ] Gate humano.

## Fases cerradas
- **F0 — Fundaciones** (2026-09-28): `make validate` en verde con la ficha `change-data-capture`; 42 tests.

## Decisiones pendientes para el gate humano
- —
