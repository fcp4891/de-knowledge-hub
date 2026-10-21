# CLAUDE.md — Data Engineering Knowledge Hub

## Qué es este proyecto
Plataforma personal de estudio y actualización continua para Data Engineering.
Plan completo: `docs/plan-maestro.md`. Hoja de ruta: `docs/ROADMAP.md`.
**El activo central es el modelo de conocimiento, no el frontend ni la IA.**
Demo estática: https://felipe-a-cespedes-perez.cl/aprendizaje-continuo/ (`make static`; `BASE_PATH` por defecto `/aprendizaje-continuo`, se sobrescribe con `make static BASE_PATH=/otra`).

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
- No citar versiones de parche de SDKs ni CLIs; sí de motores y frameworks cuando el comportamiento depende de la versión.
- Renombres: usar la formulación exacta de la página (completado vs. en curso); no inferir que un cambio terminó.
- Sin quizzes, sin alternativas A/B/C/D, sin gamificación.
- §17 y `relations` coinciden: si la ficha nombrada existe, va en `relations`; si no existe, queda como texto «pendiente de ficha», fuera de `relations`; todo lo que está en `relations` se nombra en el §17.

## Reglas de código
- Python 3.12, FastAPI, tipado estricto, Pydantic, pytest.
- Funciones pequeñas, sin dependencias nuevas sin justificarlas en el commit.
- Idempotencia en compiladores y pipelines: re-ejecutar no duplica nada.

## Eficiencia
- En local, corre solo los tests de lo que cambió; la suite completa corre en la CI.
- Verifica solo las URLs nuevas o modificadas.
- Espera el CI una sola vez, en `main`.
- La CI completa corre solo en push a `main` y en pull requests (más `workflow_dispatch` a mano), no en cada push a ramas `a/*` o `b/*`; `concurrency` con `cancel-in-progress` cancela el run anterior de la misma ref.
- Las entregas llevan solo tablas y decisiones pendientes.

## Idioma
Contenido y documentación en español; identificadores, slugs y código en inglés.
