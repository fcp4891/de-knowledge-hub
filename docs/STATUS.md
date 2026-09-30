# STATUS — Data Engineering Knowledge Hub

**Fase actual:** F2 — Plataforma MVP (esqueleto funcional). F1 aprobada el 2026-09-29.
**Última actualización:** 2026-09-30

> Resumen del proyecto. **Solo Carril A lo actualiza, al mergear a `main`.**
> El estado detallado de cada carril está en `docs/status/lane-a.md` y `docs/status/lane-b.md`; cada carril edita solo el suyo.
> Los pedidos entre carriles se anotan en la sección "Pedidos" del archivo del carril que pide.

## Carriles
| Carril | Tarea activa | Siguiente | Bloqueos |
|---|---|---|---|
| A · Claude Code | — (A-F2.4 cerrada; tareas de F2 terminadas) | Gate de F2 | — |
| B · Cursor | — (B-F2.2 cerrada y mergeada) | B-F2.3 · Búsqueda, relaciones, notas y estado | — |

## Pedidos abiertos entre carriles
| De | Para | Pedido | Estado |
|---|---|---|---|
| A | B | API real completa (conocimiento, búsqueda y `/me`): ya se puede quitar el modo mock (`make dev`). Detalle en `lane-a.md` | Abierto |
| A | B | Regenerar el cliente tipado: `422` en todas las operaciones con parámetros (ADR-005) y `PUT`/`DELETE` de notas (ADR-006) | Abierto |

## Criterio de salida de la fase actual (F2)
- [ ] Con 10 fichas reales se puede navegar Explorer → ficha → relacionados → fuente → búsqueda → nota.
- [ ] Gate humano.

## Avance de F2
- A-F2.1 · Contrato de API y mocks (ADR-002).
- A-F2.2 · Compilador `content/` → PostgreSQL.
- B-F2.1 · Scaffold Next.js con Home y Explorer en modo mock (`frontend/`, `API_MODE=mock`).
- A-F2.3 · API FastAPI + búsqueda FTS en español e inglés (ADR-005).
- B-F2.2 · Fichas de concepto y tecnología con profundidad progresiva (modo mock).
- A-F2.4 · Estado personal `/me` en PostgreSQL (ADR-006).

## Fases cerradas
- **F0 — Fundaciones** (2026-09-28): `make validate` en verde con la ficha `change-data-capture`.
- **F1 — Knowledge Blueprint v1** (2026-09-29):
  - blueprint de 23 dominios (359 conceptos, 80 MVP) con los dominios MVP revisados;
  - 92 tecnologías y matriz de 18 capacidades;
  - Source Registry con fuentes Nivel 1–2 verificadas para las 9 tecnologías MVP;
  - templates cerrados; ADR-000, 001, 003 y 004 aceptados.

## Decisiones pendientes para el gate humano
- —
