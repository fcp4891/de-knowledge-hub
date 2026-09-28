# STATUS — Data Engineering Knowledge Hub

**Fase actual:** F0 — Fundaciones
**Última actualización:** 2026-09-28

---

## Carril A — Claude Code
- **Tarea activa:** — (A-F0 cerrada, pendiente del gate humano)
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
  - 32 tests en `tests/test_validate.py`. `make validate` y `make test` en verde.
  - `docs/adr/ADR-000-content-as-code.md`.
- **Siguiente:** gate humano de F0 y después A-F1.1 (Blueprint).
- **Bloqueos:** —
- **Cambios de contrato (con ADR):** creación inicial de `schemas/` (ADR-000).
- **Notas para Carril B:**
  - Los valores de `type` están en snake_case (`cloud_service`, `code_snippet`…).
  - Las relaciones solo se guardan en la entidad origen. Para mostrar la inversa, usar `x-relation-catalog.<TIPO>.inverse` de `schemas/relationships.schema.json`.

## Carril B — Cursor
- **Tarea activa:** —
- **Hecho:** —
- **Siguiente:** —
- **Bloqueos:** —

## Pedidos entre carriles
| De | Para | Pedido | Estado |
|---|---|---|---|
| | | | |

## Criterio de salida de la fase actual
- [x] `make validate` pasa con la ficha de ejemplo `change-data-capture` (11 entidades; `make test`: 32 passed)

## Decisiones pendientes para el gate humano
- Revisar los pares origen/destino de `x-relation-catalog` en `schemas/relationships.schema.json`. Son la propuesta inicial; cambiarlos más adelante requerirá un ADR.
- `Technology` y `CloudService` son tipos separados y ambos se guardan en `content/technologies/`.
