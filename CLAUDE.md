# CLAUDE.md — Data Engineering Knowledge Hub

## Qué es este proyecto
Plataforma personal de estudio y actualización continua para Data Engineering.
Plan completo: `docs/plan-maestro.md`. Hoja de ruta: `docs/ROADMAP.md`.
**El activo central es el modelo de conocimiento, no el frontend ni la IA.**

## Tu rol: Carril A
Trabajas en paralelo con Cursor (Carril B, frontend y revisión).
- **Tus directorios:** `schemas/`, `content/`, `backend/`, `pipelines/`, `scripts/`.
- **No toques** `frontend/`.
- `docs/contracts/` y `schemas/` solo cambian con un ADR en `docs/adr/`.

## Al iniciar cada sesión
1. Lee `docs/STATUS.md` (resumen) y `docs/status/lane-a.md` (tu estado detallado).
2. Confirma la fase actual en `docs/ROADMAP.md`.
3. Trabaja **solo** en la tarea asignada. Ideas fuera de alcance → `docs/BACKLOG.md`.

## Al cerrar cada tarea
1. `make validate` y `make test` en verde.
2. Actualiza `docs/status/lane-a.md`: qué se hizo, qué queda, bloqueos, cambios de contrato y pedidos a Carril B.
3. Al mergear a `main`, actualiza el resumen `docs/STATUS.md`. Solo Carril A lo edita; nunca edites `docs/status/lane-b.md`.
4. Commit en la rama `a/<tarea>` con mensaje descriptivo.

## Reglas de contenido (no negociables)
- Fuente de verdad: Markdown + frontmatter YAML en `content/`. La base de datos es derivada.
- Toda ficha cumple el schema de `schemas/` y la plantilla de `content/_templates/`.
- Toda afirmación que pueda quedar obsoleta lleva fuente (Nivel 1–2 del Source Registry) y `last_verified`.
- Si no puedes verificar contra documentación oficial: `verification_status: review_required`. Nunca inventes URLs.
- Distingue `core` / `modern` / `emerging`. Emerging nunca se presenta como reemplazo de lo consolidado.
- Las equivalencias multicloud incluyen diferencias; nunca "son lo mismo".
- Sin quizzes, sin alternativas A/B/C/D, sin gamificación.
- §17 y `relations` coinciden: si la ficha nombrada existe, va en `relations`; si no existe, queda como texto «pendiente de ficha», fuera de `relations`; todo lo que está en `relations` se nombra en el §17.

## Reglas de código
- Python 3.12, FastAPI, tipado estricto, Pydantic, pytest.
- Funciones pequeñas, sin dependencias nuevas sin justificarlas en el commit.
- Idempotencia en compiladores y pipelines: re-ejecutar no duplica nada.

## Idioma
Contenido y documentación en español; identificadores, slugs y código en inglés.
