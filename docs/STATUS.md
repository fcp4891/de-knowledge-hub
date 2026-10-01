# STATUS — Data Engineering Knowledge Hub

**Fase actual:** F3 — Contenido Core del MVP. F2 aprobada el 2026-09-30.
**Última actualización:** 2026-10-01

> Resumen del proyecto. **Solo Carril A lo actualiza, al mergear a `main`.**
> El estado detallado de cada carril está en `docs/status/lane-a.md` y `docs/status/lane-b.md`; cada carril edita solo el suyo.
> Los pedidos entre carriles se anotan en la sección "Pedidos" del archivo del carril que pide.

## Carriles
| Carril | Tarea activa | Siguiente | Bloqueos |
|---|---|---|---|
| A · Claude Code | — (lote 4 entregado) | Aplicar la revisión B-F3.1 del lote 4 y crear los snippets de GCS e IAM | — |
| B · Cursor | — | B-F3.2 · vista `/snippets`; B-F3.1 · lote 4 y `snippets-1.md` | — |

## Pedidos abiertos entre carriles
| De | Para | Pedido | Estado |
|---|---|---|---|
| A | B | B-F3.2 · Vista `/snippets` sobre ADR-008 (regenerar cliente) | Abierto |
| A | B | B-F3.1 · Revisar el lote 4 y los 8 snippets (`snippets-1.md`) | Abierto |

## Criterio de salida de la fase actual (F3)
- [ ] 60–80 fichas `verified` (hoy: 40 fichas; 30 `verified` y 10 en `review_required`).
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
