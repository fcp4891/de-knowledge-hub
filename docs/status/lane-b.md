# Estado · Carril B (Cursor)

Solo Carril B edita este archivo. El resumen del proyecto está en `docs/STATUS.md`; Carril A lo actualiza al mergear a `main`.

**Fase:** F2 (F1 cerrada el 2026-09-29)
**Última actualización:** 2026-09-30

## Actual
- **Tarea activa:** B-F2.3 cerrada. Búsqueda global, relaciones contra la API y estudio personal en la ficha.
- **Siguiente:** conectar Editar y Borrar notas cuando `docs/status/lane-a.md` confirme PUT y DELETE en el contrato (A-F2.4).
- **Bloqueos:** ninguno.

### B-F2.3
- Cliente regenerado desde `docs/contracts/api.yaml` (422, ADR-005).
- Modo híbrido por defecto: conocimiento y búsqueda en `http://localhost:8000/api/v1`. `/me` sigue en mock, con cambios en memoria del proceso de Next.
- Búsqueda con Ctrl+K o ⌘K, debounce de 250 ms, grupos en el orden de la API.
- Al guardar el estado de estudio se envía `last_studied_at` con la fecha actual.
- Editar y Borrar notas están en la ficha y deshabilitados: `lane-a.md` todavía no confirma esas operaciones.

### B-F2.2
- Concepto: resumen siempre visible, el resto colapsado, pestañas GCP/AWS/Azure, código con resaltado y copiar, Mermaid en arquitectura, relaciones por tipo y fuentes con nivel.
- Tecnología: cabecera y matriz de capacidades, con diferencias y pestañas de equivalentes.
- Mermaid y highlight.js se cargan solo si la ficha tiene diagrama o código.
- Un slug ausente del índice sigue en «Sin datos en modo mock.» Una ficha stub sin secciones lo dice, sin inventar contenido.
- `main` ya traía el merge de B-F2.1; esta rama lo integró al crearse.

### Límites del mock
- Solo 10 conceptos y 5 tecnologías tienen detalle. Casi todas las fichas de concepto están vacías; la completa de ejemplo es `change-data-capture`.
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
