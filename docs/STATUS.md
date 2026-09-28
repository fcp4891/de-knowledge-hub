# STATUS — Data Engineering Knowledge Hub

**Fase actual:** F1 — Knowledge Blueprint v1 (F0 cerrada y aprobada el 2026-09-28)
**Última actualización:** 2026-09-28

---

## Carril A — Claude Code
- **Tarea activa:** A-F1.1 · Blueprint de dominios (rama `a/f1-blueprint`), en curso
- **Progreso A-F1.1:** plan aprobado (opción B, tope ~80 mvp). Bloques 1–3/5 (01–15) validados: 263 conceptos, 80 mvp (tope alcanzado), 6 agregados, 81 tecnologías pendientes para A-F1.2.
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
- **Siguiente:** A-F1.2 (Tecnologías y matriz), después de A-F1.1.
- **Bloqueos:** —
- **Cambios de contrato (con ADR):** creación inicial de `schemas/` y ajuste de pares en el gate de F0 (ADR-000).
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
| A | B | Iniciar B-F1.1 (Templates): `schemas/` v0 ya está en `main` | Abierto |
| A | B | B-F1.2 (revisión del Blueprint) puede empezar: dominios 01–10 en `content/blueprint/` de la rama `a/f1-blueprint`. Proponer cambios en tabla; no editar hasta el cierre de A-F1.1 | Abierto |

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
