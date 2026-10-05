# ADR-009 — F3b: contenido por dominio antes de F4

- **Estado:** Aceptado
- **Fecha:** 2026-10-05
- **Fase:** F3b — Contenido por dominio (entre F3 y F4)
- **Referencias:** ADR-000, ADR-003, ROADMAP §5 (F3 y F4).

## Contexto

F3 cerró con 60 fichas `verified`, todas del MVP (§51). El blueprint tiene 359 conceptos en 23 dominios; quedan 299 sin ficha, incluidos 20 del MVP. Felipe decidió completar el contenido antes de construir el Architecture Lab (F4), para que las arquitecturas y los labs se apoyen en fichas ya escritas y revisadas.

## Decisión

1. **Nueva fase F3b entre F3 y F4:** se escriben las fichas de todos los conceptos del blueprint, MVP o no, **un dominio a la vez**, en el orden numérico del blueprint, empezando por `01-fundamentals`.
2. **Ciclo por dominio:**
   1. Carril A propone los lotes de 10 del dominio y Felipe aprueba el plan.
   2. Por cada lote: Carril A escribe y Cursor revisa (B-F3.1), igual que en F3.
   3. Con todos los lotes del dominio `verified`, Felipe lo **revisa en el navegador** (`make dev` y el frontend) y lo aprueba.
   4. Recién entonces empieza el dominio siguiente.
3. **Mismos criterios que F3:** plantilla de 22 secciones; fuentes Nivel 1–2 para afirmaciones de producto, con Nivel 4 canónico solo para lo conceptual; `<!-- VERIFY -->` y `review_required` cuando algo no se puede verificar; viñetas de Seguridad, Observabilidad y Costo en §14; regla de `verified` al aplicar la revisión; distinción core/modern/emerging; multicloud con diferencias.
4. **Alcance:** conceptos y patrones (`kind: concept` y `pattern`). Las arquitecturas (`kind: architecture`) quedan para F4, que tiene su propia plantilla y vista. Un concepto que no conviene escribir todavía (por ejemplo, sin fuente oficial estable) se anota en `docs/BACKLOG.md` con el motivo, y el dominio puede cerrarse sin él si Felipe lo aprueba.
5. **Salida de F3b:** todos los dominios aprobados por Felipe, o una decisión explícita de pasar a F4 con los dominios restantes en el backlog.

## Consecuencias

- F4 se posterga; el calendario del ROADMAP pasa a ser orientativo a partir de F3b. Al ritmo de F3 (un lote por ciclo de revisión), los 299 conceptos son unos 30 lotes.
- Cursor revisa por lote, como en F3, y Felipe agrega una aprobación por dominio en la interfaz real: así se detectan problemas de navegación y relaciones que la revisión del Markdown no muestra.
- Los dominios con contenido emergente (`21-ai-for-data-engineering`, `23-emerging-technologies`) siguen la regla de no presentar lo emergente como reemplazo de lo consolidado.
- El gate humano de F3 sigue siendo necesario para cerrar formalmente F3; F3b no lo reemplaza.
