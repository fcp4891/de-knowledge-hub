# STATUS — Data Engineering Knowledge Hub

**Fase actual:** F3 — Contenido Core del MVP (criterios 1 y 2 cumplidos; gate humano pendiente). Siguiente: F3b — Contenido por dominio (ADR-009), desde 01-fundamentals. F2 aprobada el 2026-09-30.
**Última actualización:** 2026-10-05

> Resumen del proyecto. **Solo Carril A lo actualiza, al mergear a `main`.**
> El estado detallado de cada carril está en `docs/status/lane-a.md` y `docs/status/lane-b.md`; cada carril edita solo el suyo.
> Los pedidos entre carriles se anotan en la sección "Pedidos" del archivo del carril que pide.

## Carriles
| Carril | Tarea activa | Siguiente | Bloqueos |
|---|---|---|---|
| A · Claude Code | Lote 6 `verified` (60 fichas `verified`) | Gate de F3; F3b por dominio, desde 01-fundamentals | — |
| B · Cursor | — | Revisión del cambio de tipos en `data-validation-with-pydantic`; F3b | — |

## Pedidos abiertos entre carriles
| De | Para | Pedido | Estado |
|---|---|---|---|
| A | B | Revisar el cambio de tipos en §10 de `data-validation-with-pydantic` (ver `lane-a.md`) | Abierto |

## Criterio de salida de la fase actual (F3)
- [x] 60–80 fichas `verified` (hoy: 60 fichas, las 60 `verified`).
- [ ] Cero fichas sin fuentes.
- [ ] Gate humano.

## Fases cerradas
- **F2 — Plataforma MVP** (2026-09-30):
  - contrato de API y mocks (ADR-002), compilador a PostgreSQL, API FastAPI con FTS en español e inglés (ADR-005) y estado personal `/me` (ADR-006);
  - frontend Next.js: Home, Explorer, fichas, búsqueda (Ctrl+K), relaciones, estado de estudio y notas contra la API real;
  - lote 1 de F3 adelantado (10 fichas) y validación de las 22 secciones;
  - remoto en GitHub con CI verde (Linux).
- **F0 — Fundaciones** (2026-09-28): `make validate` en verde con la ficha `change-data-capture`.
- **F1 — Knowledge Blueprint v1** (2026-09-29):
  - blueprint de 23 dominios (359 conceptos, 80 MVP) con los dominios MVP revisados;
  - 92 tecnologías y matriz de 18 capacidades;
  - Source Registry con fuentes Nivel 1–2 verificadas para las 9 tecnologías MVP;
  - templates cerrados; ADR-000, 001, 003 y 004 aceptados.

## Decisiones pendientes para el gate humano
- —
