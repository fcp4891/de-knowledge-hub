# Estado · Carril B (Cursor)

Solo Carril B edita este archivo. El resumen del proyecto está en `docs/STATUS.md`; Carril A lo actualiza al mergear a `main`.

**Fase:** F2 (F1 cerrada el 2026-09-29)
**Última actualización:** 2026-09-29

## Actual
- **Tarea activa:** — en espera del contrato de API de Carril A.
- **Siguiente:** B-F2.1 · Scaffold, Home y Explorer, cuando Carril A publique el contrato (A-F2.1). Este carril no edita `content/blueprint/`.
- **Bloqueos:** espera `docs/contracts/api.yaml` y `docs/contracts/mock-data/` (A-F2.1).

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
