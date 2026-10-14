# Data Engineering Knowledge Hub — Hoja de Ruta de Desarrollo

**Versión:** 1.0 · **Fecha:** 28-09-2026
**Base:** `docs/plan-maestro.md` (Plan Maestro v1.0)
**Herramientas:** Claude Code (Carril A) + Cursor (Carril B), en paralelo.

---

## 1. Reglas del juego (anti-deriva)

1. **Una fase a la vez.** No se abre la fase N+1 hasta cumplir el criterio de salida de la fase N.
2. **WIP = 1 por carril.** Cada carril tiene como máximo una tarea activa.
3. **Todo lo que no es de la fase actual va a `docs/BACKLOG.md`.** Sin excepciones, aunque sea "rápido".
4. **Los contratos no se tocan sin ADR.** `schemas/` y `docs/contracts/` solo cambian con un ADR en `docs/adr/`.
5. **Timebox.** Si una fase excede su tiempo en >50 %, se **recorta alcance**, no se extiende el plazo.
6. **Cierre de tarea = tests verdes + estado del carril actualizado (`docs/status/lane-*.md`) + commit.** Sin esto la tarea no está terminada. `docs/STATUS.md` es un resumen que solo actualiza Carril A al mergear.
7. **Gate humano.** Al final de cada fase, Felipe revisa y aprueba antes de avanzar.
8. **Uso real antes de automatizar.** Tras cerrar el MVP (F4) se usa la plataforma 2–3 semanas antes de construir el Update Engine.

---

## 2. Carriles y propiedad de directorios

| Carril | Herramienta | Tipo de trabajo | Directorios que posee |
|---|---|---|---|
| **A** | Claude Code | Lotes largos con spec cerrada: contenido, schemas, backend, pipelines, tests, scripts | `schemas/`, `content/`, `backend/`, `pipelines/`, `scripts/` |
| **B** | Cursor | Trabajo interactivo e iterativo: frontend, UX, revisión humana de contenido, fixes pequeños | `frontend/`, revisión en `content/` (solo edición puntual) |
| Compartido | — | Solo vía ADR | `docs/contracts/`, `docs/adr/` |

**Git:** ramas `a/<tarea>` y `b/<tarea>`, merge a `main` al cerrar cada tarea. Recomendado: un worktree por carril para que ambos trabajen simultáneamente sin conflictos.

**Handoff entre carriles:** únicamente mediante `docs/status/lane-*.md` (pedidos), el resumen `docs/STATUS.md` y los contratos. Nunca se re-explica contexto en el chat.

---

## 3. Estructura del repositorio

```text
de-knowledge-hub/
├── CLAUDE.md                     # contexto para Claude Code
├── .cursor/rules/project.mdc     # contexto para Cursor
├── Makefile                      # validate, build, test, dev
├── docs/
│   ├── plan-maestro.md
│   ├── ROADMAP.md
│   ├── STATUS.md                 # resumen (solo Carril A, al mergear)
│   ├── status/                   # lane-a.md, lane-b.md: estado de cada carril
│   ├── BACKLOG.md                # ideas fuera de fase
│   ├── adr/                      # decisiones de arquitectura
│   └── contracts/                # OpenAPI, formato de datos compilados
├── schemas/                      # JSON Schema de entidades y relaciones
├── content/                      # FUENTE DE VERDAD (content-as-code)
│   ├── blueprint/                # dominio → subdominio → concepto
│   ├── taxonomy/
│   ├── sources/                  # Source Registry
│   ├── matrix/                   # Cloud Capability Matrix
│   ├── concepts/                 # fichas .md con frontmatter YAML
│   ├── technologies/
│   ├── architectures/
│   ├── labs/
│   └── snippets/
├── scripts/                      # validate, build-graph, compile
├── backend/                      # FastAPI
├── pipelines/                    # Update Engine (F5+)
└── frontend/
```

---

## 4. Decisión de stack (ADR-001, se cierra al final de F1)

El plan exige definir el modelo funcional antes que la tecnología. Propuesta por defecto, a confirmar en el gate de F1:

| Capa | Propuesta | Motivo |
|---|---|---|
| Fuente de verdad | Markdown + frontmatter YAML en Git | Portable, versionado, exportable, diffs revisables (§49) |
| Validación | JSON Schema + script Python | Contrato único para humanos y LLM |
| Almacenamiento de consulta | PostgreSQL (tablas + tabla de aristas para el grafo, FTS) | Sin graph DB en MVP; pgvector después |
| API | FastAPI | Stack conocido |
| Frontend | Next.js (o React + Vite) | Rutas estables por concepto |
| Diagramas | Mermaid en Markdown | Versionable como texto |

El contenido **se compila** desde `content/` hacia PostgreSQL. La base de datos es desechable; Git no.

---

## 5. Fases

### F0 — Fundaciones · 1–2 días · secuencial (solo Carril A)

No hay paralelismo: todo lo demás depende de esto.

- Repo, estructura, Makefile, CI mínima.
- `CLAUDE.md`, `.cursor/rules/project.mdc`, `STATUS.md`, `BACKLOG.md`.
- `schemas/` v0: metadata mínima (§40), tipos de entidad (§41), relaciones (§34, §42).
- `scripts/validate.py` que valida todo `content/` contra los schemas.
- Una ficha de ejemplo (`change-data-capture`) que pasa la validación.

**Salida:** `make validate` pasa con la ficha de ejemplo.

---

### F1 — Knowledge Blueprint v1 · 1–1,5 semanas · paralelo

Corresponde a la Etapa 0 del plan y a los insumos A–J (§52).

| Carril A (Claude Code) | Carril B (Cursor) |
|---|---|
| A1. Blueprint de los 23 dominios (§54): subdominios, conceptos, clasificación, nivel, flag `mvp` | B1. Templates: ficha, arquitectura, lab, novedad (§22, §24, §25, §31) |
| A2. Inventario de tecnologías + relaciones | B2. Revisión humana del Blueprint por dominio (marcar huecos y excesos) |
| A3. Cloud Capability Matrix con diferencias (§13) | B3. Source Registry: revisión y priorización de fuentes Nivel 1–2 |
| A4. Borrador de Source Registry | B4. Borrador de ADR-001 (stack) |

**Salida:**
- Blueprint validado con los 23 dominios; conceptos del MVP marcados.
- Templates cerrados.
- Source Registry con fuentes oficiales para todas las tecnologías del MVP.
- ADR-001 aprobado.
- **Gate humano.**

---

### F2 — Plataforma MVP (esqueleto funcional) · 2 semanas · paralelo

| Carril A (Claude Code) | Carril B (Cursor) |
|---|---|
| A1. **Primero:** contrato `docs/contracts/api.yaml` (OpenAPI) + `mock-data/` | B1. Scaffold frontend consumiendo mocks |
| A2. Compilador `content/` → PostgreSQL (entidades + aristas) | B2. Home + Knowledge Explorer (navegación por dominio) |
| A3. API: conceptos, tecnologías, relaciones, fuentes | B3. Ficha de concepto y ficha de tecnología (niveles progresivos §2.2) |
| A4. Búsqueda (FTS) + endpoint | B4. Búsqueda + navegación por relaciones |
| A5. Notas personales y estado de estudio (§37) | B5. Notas, estado, favoritos |

El contrato A1 desbloquea al Carril B desde el día 1.

**Salida:** con 10 fichas reales se puede navegar Explorer → ficha → relacionados → fuente → búsqueda → nota. **Gate humano.**

---

### F3 — Contenido Core del MVP · 2–3 semanas · paralelo

Alcance fijo (§51): Fundamentos, SQL, Modelado, Pipelines, Arquitectura, GCP (BigQuery, Cloud Storage, Pub/Sub, Dataflow, Composer/Airflow, Dataform, Python, Terraform).

| Carril A (Claude Code) | Carril B (Cursor) |
|---|---|
| Generación de fichas **en lotes de 10**, con fuentes y `last_verified` | Revisión humana de cada lote antes del siguiente |
| Snippets asociados (SQL, Python, Terraform) | Vista Code Library |
| Relaciones entre fichas | Vista de grafo local / conceptos relacionados |

**Regla:** si una afirmación dinámica no tiene fuente Nivel 1–2, la ficha queda `review_required`.

**Salida:** 60–80 fichas `verified`; cero fichas sin fuentes. **Gate humano.**

---

### F3b — Contenido por dominio · continuo · paralelo (ADR-009)

Cambio de alcance del 2026-10-05: antes de F4 se completan las fichas de **todos** los conceptos del blueprint (MVP y no MVP), **un dominio a la vez**, en el orden del blueprint, empezando por `01-fundamentals`.

| Carril A (Claude Code) | Carril B (Cursor) | Felipe |
|---|---|---|
| Plan de lotes de 10 del dominio | — | Aprueba el plan |
| Fichas por lote, mismos criterios que F3 | Revisión de cada lote (B-F3.1) | Aprueba las filas |
| Lote `verified` al aplicar la revisión | — | — |
| — | — | Revisa el dominio completo **en el navegador** y lo aprueba antes del siguiente |

**Alcance:** conceptos y patrones. Las arquitecturas (`kind: architecture`) quedan en F4.

**Orden de dominios desde 12 (decisión de Felipe, 2026-10-14):** se cierra por capas del mapa: 12 → 13 → 14 → 20 → 15 → 16 → 17 → 18 → 19 → 21 → 22 → 23. Los dominios 01 a 11 siguieron el orden del blueprint.

**Salida:** todos los dominios aprobados, o decisión explícita de pasar a F4 con los restantes en el backlog. **Gate humano por dominio.**

---

### F4 — Architecture Lab + Labs · 1,5–2 semanas · paralelo

| Carril A (Claude Code) | Carril B (Cursor) |
|---|---|
| 6 arquitecturas completas (batch, streaming, CDC PG→BQ, API→DWH, Medallion, event-driven) | Vista de arquitectura (diagrama Mermaid, trade-offs, alternativas) |
| 10 labs (tipos A–E, §25) | Vista de laboratorio + registro de solución personal |
| Endpoints de arquitecturas y labs | Navegación por problema (§36) |

**Nota (gate F1):** las arquitecturas de F4 pueden referenciar conceptos que no son MVP en el blueprint. Por ejemplo, `medallion-architecture` se mantiene en F4 aunque tenga `mvp: false`.

**Nota (plan de 07-architecture, 2026-10-11):** `event-driven-architecture` (`mvp: true` en el blueprint) pasa a ser la sexta arquitectura de F4, por decisión de Felipe. El dominio 07 tiene 15 arquitecturas (`kind: architecture`); las 9 que no están entre las 6 de F4 no entran en el MVP y van al Backlog. En F3b, el dominio 07 cubre solo sus dos conceptos, `data-mesh` y `data-products`.

**Salida: MVP cerrado.** → **Pausa de uso real: 2–3 semanas.** Solo se corrigen bugs y se completa contenido. Todo lo nuevo va al Backlog.

---

### F5 — Update Engine · 2–3 semanas (solo GCP al inicio)

| Carril A | Carril B |
|---|---|
| Ingesta de release notes oficiales de GCP | Vista "Novedades" (§31) |
| Clasificación Critical/Important/Useful/Watch (§32) | Cola de revisión humana |
| Vinculación con el grafo + marcado `review_required` en fichas afectadas (§33) | Dashboard: "Cambios en herramientas que utilizo" |

**Salida:** una semana de ejecución real sin ruido relevante.

---

### F6 — Career Engine + Interview Mode · 2 semanas

| Carril A | Carril B |
|---|---|
| Extracción y normalización de requisitos desde una JD | Carga de JD y reporte de gaps |
| Mapeo contra el grafo, gaps, ruta recomendada | Interview Mode (preguntas abiertas, sin nota) |

---

### F7 — Expansión

AWS → Azure → Modern → Emerging (§44, fases de contenido 3–5), reutilizando el pipeline de F3. Búsqueda semántica (pgvector) cuando el catálogo lo justifique.

---

## 6. Calendario orientativo

| Fase | Duración | Acumulado |
|---|---|---|
| F0 | 2 días | semana 1 |
| F1 | 1,5 semanas | semana 2 |
| F2 | 2 semanas | semana 4 |
| F3 | 2–3 semanas | semana 7 |
| F3b | por dominio (unos 30 lotes) | orientativo desde aquí (ADR-009) |
| F4 | 2 semanas | semana 9 — **MVP** |
| Uso real | 2–3 semanas | semana 12 |
| F5 | 2–3 semanas | semana 15 |
| F6 | 2 semanas | semana 17 |
| F7 | continuo | — |

---

## 7. Ahorro de recursos

**Claude Code**
- Una tarea por sesión; limpiar el contexto entre tareas.
- Tareas grandes: pedir primero el plan, aprobarlo y luego ejecutar.
- Indicar siempre los archivos concretos; nunca "lee todo `content/`".
- Modelo más capaz para diseño, schemas y ADR; modelo más económico para lotes repetitivos (fichas, snippets, tests).
- Leer `STATUS.md` y el archivo de estado del carril en lugar de re-explicar el contexto.

**Cursor**
- Prompts acotados con referencias `@archivo`.
- Evitar modo agente sobre todo el repo; trabajar por componente.
- La regla `.cursor/rules/project.mdc` carga el contexto fijo automáticamente.

**Ambos**
- Los contratos (`api.yaml`, `schemas/`) sustituyen la coordinación verbal.
- Nunca dos carriles sobre el mismo archivo.
