# Revisión B-F1.2 · Dominio 01 Fundamentos

Archivo de origen: `content/blueprint/01-fundamentals.yaml`. Carril B no lo edita. Carril A aplica las filas aprobadas.

| Fila | Slug | Propuesta | Estado |
|---|---|---|---|
| 1 | `data-pipeline` | Agregar `change-data-capture`, `backfill` y `replay` en `related_concepts`. No crear esas fichas aquí. | aprobada |
| 2 | `data-orchestration` | Dejarla como visión general, con la nota al dominio 06. | aprobada |
| 3 | `lakehouse` | Agregar `lakehouse-architecture` en `related_concepts`. Sigue `modern`, `intermediate`, `high`, `mvp: true`. | aprobada |
| 4 | `schema-on-read-vs-schema-on-write` (nuevo) | En almacenamiento. `concept`, `core`, `intermediate`, `importance: high`, `mvp: false`. Relacionarlo con `data-lake`, `data-warehouse` y `lakehouse`. | aprobada |
| 5 | `csv-format` (nuevo) | En formatos. `concept`, `core`, `basic`, `importance: medium`, `mvp: false`. Relacionarlo con `file-ingestion` y `json-format`. | aprobada |
| 6 | `partitioning` | Agregar una nota: es el layout físico. `partition-pruning` y `clustering` siguen en SQL. Los flags actuales se quedan. | aprobada |
| 7 | `idempotency` | Agregar `delivery-semantics` en `related_concepts`. La semántica de entrega sigue en streaming. | aprobada |
| 8 | `late-arriving-data` | Agregar `event-time-vs-processing-time` en `related_concepts`. Esa ficha sigue en streaming. | aprobada |
| 9 | `data-consistency` | Subir `importance` a `high`. `mvp` sigue en `false`; ACID ya es la ficha MVP. | aprobada |
| 10 | `data-ingestion`, `data-transformation`, `data-orchestration` | Dejar `mvp: false`. Las reúne `data-pipeline`, que ya es MVP. | aprobada |
| 11 | `data-contracts` | Mantener `modern`, `intermediate`, `medium`, `mvp: false`. | aprobada |
| 12 | Resto del dominio | La clasificación `core` se queda. Nada de este archivo pasa a `emerging`. | aprobada |
