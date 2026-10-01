# Estado · Carril B (Cursor)

Solo Carril B edita este archivo. El resumen del proyecto está en `docs/STATUS.md`; Carril A lo actualiza al mergear a `main`.

**Fase:** F3 (F2 cerrada el 2026-09-30)
**Última actualización:** 2026-09-30

## Actual
- **Tarea activa:** B-F3.2, mini-grafo del vecindario en las fichas de concepto y de tecnología.
- **Siguiente:** B-F3.1 del lote 3. La vista `/snippets` espera a que Carril A cree snippets.
- **Bloqueos:** ninguno.

### B-F3.2 · grafo
- El panel de relaciones dibuja el vecindario a 1 salto con `GET /entities/{slug}/relations`.
- El color del nodo es el tipo de entidad. `origin: blueprint` es línea punteada; `origin: entity` es línea continua.
- `cytoscape` se carga solo si hay vecinos, con `import()` dinámico.
- La lista de relaciones sigue debajo. `/snippets` no entra en este cambio.
- En Chrome: la ficha de concepto y la de tecnología muestran aristas continuas y punteadas, y un clic en un vecino abre su URL.

### B-F3 UX
- El selector de estado y la casilla «Pendiente de profundizar» llaman a `PUT /me/study-state/{slug}` al cambiar, con `last_studied_at` de ahora.
- Se quitó el botón «Guardar estado». El mensaje sigue siendo «Estado guardado.».
- Cliente regenerado (ADR-007). En la búsqueda, un resultado con `has_page: false` muestra «ficha pendiente». El orden de los grupos no se toca.

### B-F3.1 · lote 2
- Diez fichas, tabla de §48, más la corrección de `MERGE` en Redshift (`cb77a2f`). Felipe aprobó todas las filas el 2026-09-30, incluidas las tres salvedades y la precisión de `REMOVE DUPLICATES`. No se editó `content/`.

### B-F3.1 · lote 1
- Una tabla de §48 por cada una de las 10 fichas del lote 1. Felipe aprobó todas las filas el 2026-09-30. No se editó `content/`.
- Los 4 VERIFY (ETL en AWS, ETL en Azure, máximo de particiones de BigQuery, capacidad y retención de Kinesis) quedan destacados y sin inventar el dato.

### B-F2.3
- Cliente regenerado desde el contrato de `main` (422 de ADR-005; PUT y DELETE de notas de ADR-006).
- Conocimiento, búsqueda y `/me` van a `http://localhost:8000/api/v1`. Ya no hay mock de `/me`.
- Búsqueda con Ctrl+K o ⌘K, debounce de 250 ms, grupos en el orden de la API.
- Al guardar el estado de estudio se envía `last_studied_at` con la fecha actual.
- Editar y Borrar notas llaman a `PUT` y `DELETE /me/notes/{slug}/{note_id}`.

### B-F2.2
- Concepto: resumen siempre visible, el resto colapsado, pestañas GCP/AWS/Azure, código con resaltado y copiar, Mermaid en arquitectura, relaciones por tipo y fuentes con nivel.
- Tecnología: cabecera y matriz de capacidades, con diferencias y pestañas de equivalentes.
- Mermaid y highlight.js se cargan solo si la ficha tiene diagrama o código.
- Un slug ausente del índice sigue en «Sin datos en modo mock.» Una ficha stub sin secciones lo dice, sin inventar contenido.
- `main` ya traía el merge de B-F2.1; esta rama lo integró al crearse.

### Límites del mock
- Solo 10 conceptos y 5 tecnologías tenían detalle en el mock. El conocimiento y `/me` salen ahora de la API.
- La búsqueda real no se reordena en el frontend. Los mocks de búsqueda siguen siendo solo ejemplos de forma (ADR-005).

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
