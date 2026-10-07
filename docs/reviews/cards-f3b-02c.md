# Revisión B-F3.1 · Lote F3b-02c

Fichas en `content/concepts/`. Carril B no las edita. Los cuatro patterns están en `review_required`. No hay comentarios `VERIFY`. Las filas quedan en pendiente hasta que Felipe las apruebe.

Los 4: `scd-type-1`, `change-detection`, `sql-quality-checks` y `surrogate-key-generation`. Completan el dominio 02-sql.

Mismos criterios que 02a y 02b. Kimball (Nivel 4) solo para lo conceptual. Cada afirmación de producto, a la página de ese motor.

## Criterios heredados del lote 1

| Criterio | Hallazgo | Estado |
|---|---|---|
| §14 con seguridad, observabilidad y costo | Los 4 patterns los traen como viñetas explícitas de §14. | pendiente |
| Ejemplos atómicos e idempotentes | El `MERGE` tipo 1 se ejecutó dos veces en PostgreSQL (2 filas y luego 0). El SQL de BigQuery, Redshift, T-SQL y el YAML de dbt está marcado como no ejecutado. | pendiente |
| Relaciones completas | En los 4, cada slug de `related_topics` está en `relations`. | pendiente |
| Nivel 4 solo conceptual | Kimball está solo en `scd-type-1`: sobrescribir, destruir la historia y recalcular agregados afectados. El `MERGE`, los `NULL` y los errores de cada motor salen de notas Nivel 1. Las otras tres fichas no citan Kimball. | pendiente |

## `scd-type-1`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué sobrescribe, cuándo sí y cuándo no, `MERGE` idempotente, BigQuery, Redshift y Fabric, seguridad y costo están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Kimball queda en la definición del tipo 1. Los mensajes de duplicado de BigQuery y Redshift, el `MERGE` de T-SQL (aplica a Synapse dedicado y a Fabric) e `IS DISTINCT FROM` de Fabric (la página no menciona Synapse) están en notas Nivel 1. Redshift lista `IS DISTINCT FROM` como no admitido, y la ficha no se lo atribuye. | pendiente |
| Errores técnicos o simplificaciones peligrosas | La comparación de Redshift está marcada como no ejecutada y dice que la variante con `IS NULL` se probó en PostgreSQL. La §6 dice que, en motores sin la validación de duplicados, el resultado depende del orden. BigQuery, Redshift, T-SQL y PostgreSQL, en las páginas citadas o en la prueba, fallan si hay más de una fila de origen. No hay un motor citado sin esa validación. Propuesta: quitar esa segunda posibilidad. | pendiente |
| Ejemplos poco realistas | Email y teléfono en tipo 1, y segmento en tipo 2, es el uso que describe la guía de Fabric. | pendiente |
| Relaciones faltantes | `slowly-changing-dimensions`, `upsert`, `scd-type-2`, `sql-merge` y `deduplication` están en `relations`. | pendiente |

## `change-detection`

Consulté [CONCAT](https://docs.aws.amazon.com/redshift/latest/dg/r_CONCAT.html) el 2026-10-07. La página dice que, si una o las dos expresiones son `NULL`, el resultado de `CONCAT` y de `||` es `NULL`, y remite a `NVL` o `COALESCE`.

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué detecta, cuándo sí y cuándo no, hash frente a CDC, BigQuery, Redshift y T-SQL, seguridad y costo están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | BigQuery (`CONCAT` devuelve `NULL`), T-SQL (`CONCAT` convierte `NULL` en `''`; la página aplica a Synapse y a Fabric) y PostgreSQL (`concat` y `concat_ws` ignoran `NULL`) están en notas Nivel 1. La nota de Redshift solo dice que hay que usar `NVL` o `COALESCE`. La misma página dice que el resultado es `NULL`. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El hash de la §10 usa `coalesce(..., '\N')` y separador. En PostgreSQL se comprobaron las dos colisiones: `concat_ws` sin marcador, y `concat` sin separador. BigQuery y T-SQL están marcados como no ejecutados. La §4 no dice que en Redshift `CONCAT` devuelve `NULL`, el mismo efecto que en BigQuery: sin marcador, el hash de la fila se vuelve `NULL`. Propuesta: atribuir ese resultado a la página de `CONCAT` de Redshift, distinto del de T-SQL y del de `concat`/`concat_ws` de PostgreSQL. | pendiente |
| Ejemplos poco realistas | Una foto nocturna de productos y un cambio de `NULL` que el hash no ve son el fallo que la ficha demuestra en PostgreSQL. | pendiente |
| Relaciones faltantes | `change-data-capture`, `incremental-load`, `data-reconciliation`, `sql-nulls` y `scd-type-2` están en `relations`. | pendiente |

## `sql-quality-checks`

Consulté [Use primary and foreign keys](https://docs.cloud.google.com/bigquery/docs/primary-foreign-keys) y [Defining constraints](https://docs.aws.amazon.com/redshift/latest/dg/t_Defining_constraints.html) el 2026-10-07.

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué consulta devuelve las fallas, cuándo sí y cuándo no, `ASSERT`, Dataform, dbt, BigQuery, Redshift y Fabric, seguridad y costo están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | `ASSERT`, los cuatro tests de dbt, las aserciones de Dataform, `NOT NULL` aplicado en Redshift y `CHECK` aplicado en PostgreSQL están en notas Nivel 1. La frase del estándar SQL sobre `NULL` en `UNIQUE` está solo en la nota de PostgreSQL, que es quien la dice. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El resumen dice que BigQuery, Redshift y Fabric no aplican claves primarias, únicas ni foráneas. Las páginas no dicen lo mismo: BigQuery no aplica claves primarias ni foráneas (no documenta una restricción `UNIQUE` en esa página); Redshift trata unicidad, clave primaria y clave foránea como informativas y sí aplica `NOT NULL`; Fabric admite `PRIMARY KEY` y `UNIQUE` solo como `NONCLUSTERED` y `NOT ENFORCED`, y `FOREIGN KEY` como `NOT ENFORCED`. La §16 dice que en warehouses cloud esas restricciones «no existen o no se aplican». Propuesta: repetir, por motor, lo que dice su página, y quitar «no existen». | pendiente |
| Ejemplos poco realistas | Duplicados, nulos, huérfanos y un monto negativo son fallos habituales. La prueba de PostgreSQL devolvió una falla por regla, y el `CHECK` rechazó el `INSERT`. `ASSERT` y el YAML de dbt no se ejecutaron. | pendiente |
| Relaciones faltantes | `data-reconciliation`, `data-contracts`, `sql-nulls` y `sql-joins` están en `relations`. | pendiente |

## `surrogate-key-generation`

Consulté [IDENTITY columns in Fabric Data Warehouse](https://learn.microsoft.com/en-us/fabric/data-warehouse/identity) el 2026-10-07.

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué métodos hay, cuándo sí y cuándo no, huecos, BigQuery, Redshift, Fabric y Synapse, seguridad y costo están. `ROW_NUMBER` queda descartado como clave permanente. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Redshift (`IDENTITY` generada única; el orden puede no seguir los archivos; los valores explícitos de `BY DEFAULT` no se verifican), Synapse (no contiguo; unicidad no garantizada con `IDENTITY_INSERT`, cambio de semilla o `UPDATE` de la columna de distribución) y PostgreSQL (`nextval` no se revierte) están en notas Nivel 1. La celda de BigQuery dice «no documentado en las fuentes de esta ficha», no que BigQuery carezca de identidad. | pendiente |
| Errores técnicos o simplificaciones peligrosas | La §4 dice que Fabric garantiza la unicidad mientras exista la tabla. La página de Fabric dice que la garantiza mientras no se use `IDENTITY_INSERT`, y que después de insertar valores explícitos hay que ejecutar `DBCC CHECKIDENT` con `RESEED` para que los valores nuevos no colisionen. Synapse y Redshift sí quedan con sus excepciones. Propuesta: acotar la garantía de Fabric a lo que dice esa página, incluido el reseed. | pendiente |
| Ejemplos poco realistas | Una recarga con `ROW_NUMBER` que corre las claves, y un hueco tras `ROLLBACK`, son fallos habituales. El hash y el hueco se ejecutaron en PostgreSQL. `FARM_FINGERPRINT` y `ASSERT` están marcados como no ejecutados. | pendiente |
| Relaciones faltantes | `surrogate-keys`, `scd-type-2`, `dimension-tables` y `sql-quality-checks` están en `relations`. | pendiente |
