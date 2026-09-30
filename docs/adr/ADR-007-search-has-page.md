# ADR-007 — `has_page` en los resultados de búsqueda

- **Estado:** Aceptado
- **Fecha:** 2026-09-30
- **Fase:** F3 — Contenido Core del MVP (tarea previa, hallazgo del gate de F2)
- **Referencias:** ADR-002, ADR-005.

## Contexto

La búsqueda indexa los 359 conceptos del blueprint, aunque la mayoría todavía no tiene ficha. En el gate de F2, la consulta "data lake" puso primero `data-lake`, un concepto sin ficha: la interfaz solo mostraba "Esta ficha todavía no tiene secciones" después de abrirlo. Los resultados no permitían distinguir de antemano qué conceptos tenían contenido.

## Decisión

1. **Cambio aditivo del contrato:** `SearchResult` incluye `has_page` (booleano y obligatorio en la respuesta). Vale `true` si el resultado tiene entidad en `content/`: una ficha de concepto o patrón, una tecnología o una fuente. Un concepto del blueprint sin ficha devuelve `false`. Es la misma semántica que `has_page` en `ConceptSummary`.
2. **Ranking:** se suma 0.3 al puntaje de los resultados con `has_page`. El bonus es menor que el de coincidencia en el título (1.0) y el de coincidencia exacta (0.5), así que no sube por encima de ellos un resultado con ficha pero menos relevante. Solo desempata a favor de lo que tiene contenido.
3. `has_page` se calcula con el documento de entidad del slug, aunque ese documento no coincida con la consulta; por ejemplo, cuando solo coincide el documento del blueprint.
4. La búsqueda de referencia de los mocks (`backend/app/projection.py`) aplica el mismo campo y el mismo bonus. Los mocks de búsqueda siguen siendo ejemplos de forma (ADR-005).

## Consecuencias

- Carril B puede marcar los resultados sin ficha ("ficha pendiente") antes de que el usuario los abra. Debe regenerar el cliente tipado.
- A medida que los lotes de F3 creen fichas, esos conceptos suben en la búsqueda sin más cambios.
