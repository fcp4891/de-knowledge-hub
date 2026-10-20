# STATUS — Data Engineering Knowledge Hub

**Fase actual:** F3b — Contenido por dominio (ADR-009), dominio 14-streaming (01-fundamentals aprobado el 2026-10-06, 02-sql el 2026-10-08, 03-python el 2026-10-10, 04-data-modeling, 05-pipelines, 06-orchestration y los conceptos de 07-architecture el 2026-10-11, 08-gcp el 2026-10-12, 09-aws el 2026-10-13, 10-azure y 11-devops el 2026-10-14, 12-infrastructure-as-code y 13-containers el 2026-10-19). F3 aprobada el 2026-10-05; F2 el 2026-09-30.
**Última actualización:** 2026-10-20

> Resumen del proyecto. **Solo Carril A lo actualiza, al mergear a `main`.**
> El estado detallado de cada carril está en `docs/status/lane-a.md` y `docs/status/lane-b.md`; cada carril edita solo el suyo.
> Los pedidos entre carriles se anotan en la sección "Pedidos" del archivo del carril que pide.

## Organización de carpetas (desde el 2026-10-07)
| Worktree | Quién | Ramas | Alcance |
|---|---|---|---|
| `D:\Proyectos_IA\DES_conocimiento-carril-a` | Carril A (Claude Code) | `a/*` | Todo menos `frontend/`. **Único que mergea a `main` y hace push de `main`.** |
| `D:\Proyectos_IA\DES_conocimiento-ui` | Cursor UI | `b/ui-redesign` (cerrada y mergeada a `main` el 2026-10-07) | Solo `frontend/` y `docs/design/`. |
| `D:\Proyectos_IA\DES_conocimiento-review` | Cursor revisión | `b/f3b-review-*` | Revisiones de fichas (`docs/reviews/`, `lane-b.md`). |
| `D:\Proyectos_IA\DES_conocimiento` (raíz) | — | — | No se edita. |

## Carriles
| Carril | Tarea activa | Siguiente | Bloqueos |
|---|---|---|---|
| A · Claude Code | 14-streaming 14/14 `verified` | 20-open-data-stack tras aprobar 14 | — |
| B · Cursor revisión | — | Lo que asigne Felipe | — |
| B · Cursor UI | — (rediseño UI cerrado y mergeado a `main`) | — | — |

## Pedidos abiertos entre carriles
| De | Para | Pedido | Estado |
|---|---|---|---|
| A | B | ~~Título de página en las citas (ADR-012)~~: `page_title` como link, «registro · Nivel N» debajo (`b/ui-page-title`) | Cerrado (2026-10-13) |
| A | B | ~~Alias en el frontend (ADR-010)~~: MiniSearch indexa `aliases` y la ficha los muestra (`b/ui-aliases`) | Cerrado (2026-10-12) |

## Criterio de salida de la fase actual (F3b, ADR-009)
- [x] 01-fundamentals: 28/28 `verified`, aprobado por Felipe en el navegador el 2026-10-06.
- [x] 02-sql: 33/33 `verified`, aprobado por Felipe en el navegador el 2026-10-08.
- [x] 03-python: 26/26 `verified`, aprobado por Felipe en el navegador el 2026-10-10.
- [x] 04-data-modeling: 17/17 `verified`, aprobado por Felipe en el navegador el 2026-10-11.
- [x] 05-pipelines: 16/16 `verified`, aprobado por Felipe en el navegador el 2026-10-11.
- [x] 06-orchestration: 12/12 `verified`, aprobado por Felipe en el navegador el 2026-10-11.
- [x] 07-architecture: 2/2 conceptos `verified`, aprobado por Felipe en el navegador el 2026-10-11 (las 15 arquitecturas: 6 en F4, 9 en el Backlog).
- [x] 08-gcp: 31/31 `verified`, aprobado por Felipe en el navegador el 2026-10-12. Sus 15 arquitecturas no son de F3b: 6 en F4 (ROADMAP) y 9 en el Backlog.
- [x] 09-aws: 16/16 `verified`, aprobado por Felipe en el navegador el 2026-10-13.
- [x] 10-azure: 14/14 `verified`, aprobado por Felipe en el navegador el 2026-10-14.
- [x] 11-devops: 13/13 `verified`, aprobado por Felipe en el navegador el 2026-10-14.
- [x] 12-infrastructure-as-code: 12/12 `verified`, aprobado por Felipe en el navegador el 2026-10-19 (ADR-015: Terraform sin nube en la CI, cfn-lint y Bicep).
- [x] 13-containers: 9/9 `verified`, aprobado por Felipe en el navegador el 2026-10-19 (ADR-016: Docker real en la CI con digests, hadolint, kubeconform contra Kubernetes 1.37.1 con esquemas fijados y registry:2 local).
- [ ] 14-streaming: 14/14 `verified` (2026-10-20), pendiente de aprobación en el navegador (ADR-017: Kafka 4.3.1 en KRaft en Docker, por digest; PySpark 4.2.0 en la CI; Flink 2.3 citado y no ejecutado).
- Orden de dominios desde 12 (2026-10-14): 12 → 13 → 14 → 20 → 15 → 16 → 17 → 18 → 19 → 21 → 22 → 23.
- [x] Lote F3b-rel: la regla del §17 es error de `make validate` (2026-10-14; `docs/reviews/f3b-rel.md`).
- [ ] Resto de dominios, uno a la vez, en el orden del blueprint (299 conceptos sin ficha al inicio de F3b).

## Fases cerradas
- **F3 — Contenido Core del MVP** (2026-10-05): 60 fichas `verified` (49 conceptos y 11 patrones) y 13 snippets `verified`, cero fichas sin fuentes; Code Library y grafo en el frontend; snippets de Python y Terraform ejecutados o validados en la CI.
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
