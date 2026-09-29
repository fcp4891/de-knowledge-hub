# Revisión B-F1.2 · Dominio 04 Modelado

Archivo de origen: `content/blueprint/04-data-modeling.yaml`. Carril B no lo edita. Medallion, Data Mesh y Data Products siguen en el dominio 07. El tope de 80 fichas MVP no se mueve.

| Fila | Slug | Propuesta | Estado |
|---|---|---|---|
| 1 | `kimball-methodology` | No crear aquí `medallion-architecture`, `data-mesh` ni `data-products`. Agregarlos en `related_concepts`, con nota: el plan los pide en modelado y las fichas viven en 07. | pendiente |
| 2 | `conformed-dimensions` | Mantener (`added_by: blueprint`). Subir `importance` a `high`. `mvp` sigue en `false`. La ficha incluye el bus matrix; no crear `bus-matrix`. | pendiente |
| 3 | `fact-tables` | Agregar nota: hechos de transacción, snapshot periódico, snapshot acumulativo y factless van en esta ficha. No crear un slug por tipo. | pendiente |
| 4 | `dimension-tables` | Agregar nota: degenerate, role-playing, junk y bridge (many-to-many) van en esta ficha. No crear slugs nuevos. | pendiente |
| 5 | `slowly-changing-dimensions` | Agregar nota: la ficha cubre los tipos 0, 1, 2, 3, 4 y 6. El SQL de tipo 1 y 2 sigue en el dominio 02. Agregar `late-arriving-data` en `related_concepts`. | pendiente |
| 6 | `data-vault` | Mantener `modern`, `advanced`, `medium`, `mvp: false`. Agregar nota: no reemplaza a Kimball. | pendiente |
| 7 | `one-big-table` | Agregar `scan-reduction` en `related_concepts`. Sigue `modern`, `intermediate`, `medium`, `mvp: false`. | pendiente |
| 8 | `semantic-models` | Agregar `semantic-layer` en `related_concepts`. Nota: esta ficha es la estructura del modelo; `semantic-layer` (22) es la capa de métricas gobernadas. | pendiente |
| 9 | `surrogate-keys` | Agregar nota: la ficha cubre natural vs surrogate. La generación SQL sigue en `surrogate-key-generation`. | pendiente |
| 10 | Resto del dominio | La clasificación `core` se queda. Conceptual, lógico y físico siguen en `mvp: false`. No se agregan fichas MVP. | pendiente |
