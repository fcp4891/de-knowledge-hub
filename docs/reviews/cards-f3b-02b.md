# Revisión B-F3.1 · Lote F3b-02b

Fichas en `content/concepts/`. Carril B no las edita. Felipe aprobó todas las filas el 2026-10-07, incluidas las propuestas: en BigQuery, «zona por defecto UTC» y no «se guarda en UTC»; en `sql-json-functions` §15, `JSON_VALUE` devuelve `NULL` por encima de 4000 caracteres en modo lax; en Spectrum, «sintaxis documentada» y el pushdown de PostgreSQL atribuido a esa prueba; hash, merge y nested loop solo donde la página los nombra, y el broadcast en BigQuery y en `DS_BCAST_INNER`; en Synapse, las palancas que nombra su página (distribución, estadísticas, grano de partición y clases de recursos). Las diez siguen en `review_required` hasta que Carril A aplique la revisión. No hay comentarios `VERIFY`.

Las 10: `sql-date-functions`, `sql-json-functions`, `sql-pivot`, `sql-recursive-cte`, `query-plans`, `scan-reduction`, `predicate-pushdown`, `join-optimization`, `materialization-strategies` y `cloud-warehouse-optimization`.

Mismos criterios que F3b-02a. La página general de fechas de T-SQL no se usa para Fabric. El SQL de BigQuery, Redshift y Fabric que no se ejecutó debe decirlo.

## Criterios heredados del lote 1

| Criterio | Hallazgo | Estado |
|---|---|---|
| §14 con seguridad, observabilidad y costo | Las 10 fichas los traen como viñetas explícitas de §14. | aprobada |
| Ejemplos atómicos e idempotentes | El SQL de BigQuery, Redshift y Fabric está comentado o marcado como no ejecutado. Lo ejecutado es PostgreSQL local: planes, `REFRESH` de una vista materializada y consultas de fechas, JSON y pivot. | aprobada |
| Relaciones completas | En las 10, cada slug de `related_topics` está en `relations`. | aprobada |
| Nivel 4 solo conceptual | No hay fuentes Nivel 4. Parquet, dbt y la documentación de cada motor están en notas Nivel 1. | aprobada |

## `sql-date-functions`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Instante, hora civil y fecha, cuándo sí y cuándo no, BigQuery, Redshift y Fabric, seguridad y costo están. No usa la página general de fechas de T-SQL. `AT TIME ZONE` dice que aplica a Synapse y a Warehouse en Fabric. La de tipos de Fabric dice que `datetimeoffset` no se admite en tablas. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | `DATE`/`DATETIME`/`TIMESTAMP` de BigQuery, `TIMESTAMPTZ` de Redshift y el guardado en UTC de PostgreSQL están en notas Nivel 1. La nota de PostgreSQL dice que `timestamp` equivale a `timestamp without time zone` «como exige el estándar SQL»: es una cita de esa página, y el cuerpo no la convierte en regla de los demás motores. La §15 dice que `timestamp` no significa lo mismo en BigQuery que en Redshift y PostgreSQL. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El resumen dice que los tres motores de instante «guardan en UTC». La nota de BigQuery dice que `TIMESTAMP` es un instante absoluto y que la zona por defecto es UTC. Las que dicen que el valor se guarda en UTC son Redshift y PostgreSQL. Propuesta: para BigQuery, repetir «zona por defecto UTC» y dejar el guardado en UTC en Redshift y PostgreSQL. El SQL de BigQuery está marcado como no ejecutado. La prueba de PostgreSQL (mismo instante, días distintos; día de 23 horas) dice que depende de la base de zonas de esa instalación. | aprobada |
| Ejemplos poco realistas | Ventas de las 21:00 a las 23:59 locales que caen en el día siguiente en UTC es un fallo habitual. | aprobada |
| Relaciones faltantes | `late-arriving-data`, `partitioning` y `sql-advanced-select` están en `relations`. | aprobada |

## `sql-json-functions`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Dónde vive el JSON, modo lax, cuándo sí y cuándo no, BigQuery, Redshift y Fabric, seguridad y costo están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | «Extractores estándar» es el término de la página de funciones JSON de BigQuery, y la §11 lo atribuye a esa documentación. No se presenta como estándar SQL. `JSON_VALUE` dice que aplica a Synapse y a Warehouse en Fabric. La nota de tipos dice que Fabric no admite `json` en tablas. Redshift recomienda `SUPER` sobre funciones JSON en `VARCHAR`. | aprobada |
| Errores técnicos o simplificaciones peligrosas | La §13 dice que, por encima de 4000 caracteres, `JSON_VALUE` devuelve `NULL` en modo lax. La §15 dice que «trunca a `NULL`». La página dice que devuelve `NULL`, no que corte el texto a 4000 caracteres. Propuesta: en la §15, «devuelve `NULL`». El SQL de BigQuery de la §10 está marcado como no ejecutado. Lo de PostgreSQL sí se ejecutó. | aprobada |
| Ejemplos poco realistas | Un monto que pasa de número a objeto y desaparece como `NULL` en modo lax es un fallo habitual de schema-on-read. | aprobada |
| Relaciones faltantes | `json-format`, `schema-on-read-vs-schema-on-write`, `sql-unnest` y `sql-structs` están en `relations`. | aprobada |

## `sql-pivot`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué rota, valores constantes, cuándo sí y cuándo no, BigQuery, Redshift y T-SQL, seguridad y costo están. La página de `PIVOT`/`UNPIVOT` dice que aplica a Synapse y a Warehouse en Fabric. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Constantes del `IN` en BigQuery y Redshift, y que `UNPIVOT` no es la inversa exacta, están en notas Nivel 1. Esa última frase es de la página de T-SQL, y la §4 y la §10 la atribuyen a T-SQL. PostgreSQL no tiene `PIVOT` en `SELECT`; `crosstab` está en `tablefunc`. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El `PIVOT` de BigQuery está marcado como no ejecutado. El pivot portable se ejecutó en PostgreSQL con `FILTER`, y el comentario dice que en los otros motores vale `SUM(CASE …)`, no que `FILTER` exista allí. No marco otro error. | aprobada |
| Ejemplos poco realistas | Una planilla con una columna por mes, y una columna nueva que el `UNPIVOT` no lista, es un archivo habitual. | aprobada |
| Relaciones faltantes | `sql-case-expressions`, `sql-advanced-select` y `sql-nulls` están en `relations`. | aprobada |

## `sql-recursive-cte`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Término base y recursivo, ciclos, cuándo sí y cuándo no, BigQuery, Redshift y Fabric, seguridad y costo están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Límites de BigQuery y Redshift, `CYCLE` de PostgreSQL y `MAXRECURSION` de T-SQL están en notas Nivel 1. La de superficie de T-SQL de Fabric lista las consultas recursivas entre lo no admitido. La §13 deja `MAXRECURSION` en otros entornos T-SQL y no se lo atribuye a Fabric. | aprobada |
| Errores técnicos o simplificaciones peligrosas | Fabric Warehouse figura como motor que no admite la recursión, con la alternativa de aplanar al cargar. El código es PostgreSQL ejecutado. No hay SQL de BigQuery ni de Redshift presentado como ejecutado. No marco otro error. | aprobada |
| Ejemplos poco realistas | Un organigrama y una tabla puente con un tope de profundidad son un uso habitual. | aprobada |
| Relaciones faltantes | `sql-cte`, `sql-joins` y `dimension-tables` están en `relations`. | aprobada |

## `query-plans`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué muestra el plan, estimado frente a real, cuándo sí y cuándo no, BigQuery, Redshift y Fabric, seguridad y costo están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | `EXPLAIN`/`EXPLAIN ANALYZE`, etiquetas `DS_*`, el plan del job de BigQuery, el *dry run* sin plan, `SHOWPLAN_XML` y `queryinsights` están en notas Nivel 1. `SHOWPLAN_XML` dice que aplica al pool dedicado de Synapse y a Warehouse en Fabric. | aprobada |
| Errores técnicos o simplificaciones peligrosas | La §11 dice que BigQuery no tiene `EXPLAIN` previo y que el plan viene con el job. La tabla de la §2 deja el plan real de Redshift como «no detallado en esta ficha», sin inventarlo. Los planes mostrados son de PostgreSQL ejecutado. No marco otro error. | aprobada |
| Ejemplos poco realistas | Una poda que desaparece al envolver la columna en una función, y un `DS_BCAST_INNER` cuando la dimensión crece, son señales habituales. | aprobada |
| Relaciones faltantes | `partition-pruning`, `sql-joins` y `clustering` están en `relations`. | aprobada |

## `scan-reduction`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Columnas, particiones y orden físico, cuándo sí y cuándo no, BigQuery, Redshift, Spectrum y Fabric, seguridad y costo están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | `LIMIT` que no reduce bytes en BigQuery, el filtro de partición constante, la sort key de Redshift, Parquet en Spectrum, el data clustering y V-Order de Fabric, y el page index de Parquet están en notas Nivel 1. | aprobada |
| Errores técnicos o simplificaciones peligrosas | `LIMIT` se atribuye a BigQuery, no a todos los motores. El `ALTER TABLE … require_partition_filter` está marcado como no ejecutado. La poda con y sin función se ejecutó en PostgreSQL. No marco otro error. | aprobada |
| Ejemplos poco realistas | Un `SELECT *` sobre una tabla grande para mostrar pocas columnas y pocos días es un fallo habitual. | aprobada |
| Relaciones faltantes | `partition-pruning`, `clustering`, `predicate-pushdown` y `row-vs-columnar-formats` están en `relations`. | aprobada |

## `predicate-pushdown`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Niveles del filtro, qué no se empuja, Parquet, Athena, Spectrum, `postgres_fdw` y Fabric, seguridad y costo están. La §13 dice que la guía de Fabric no usa la palabra *pushdown*. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Page index, mínimos y máximos de Athena, la lista de Spectrum (`GROUP BY`, `LIKE`, agregados; no `DISTINCT` ni `ORDER BY`) y lo que `postgres_fdw` envía están en notas Nivel 1. La fila «optimizadores en general» de la §2 no cita un motor. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El comentario de la §10 llama «sintaxis estándar» al ejemplo de Spectrum. Ninguna fuente de la ficha dice que esa sentencia sea SQL estándar. El SQL está comentado y marcado como no ejecutado, y solo usa operaciones que la página de Spectrum lista. Propuesta: «sintaxis documentada», como en las otras fichas, y atribuir el pushdown del ejemplo de PostgreSQL a esa prueba, no a «optimizadores en general». | aprobada |
| Ejemplos poco realistas | Archivos Parquet desordenados por `created_at`, con estadísticas que no saltan páginas, es el caso que describe Athena. | aprobada |
| Relaciones faltantes | `scan-reduction`, `parquet-format`, `partition-pruning` y `query-plans` están en `relations`. | aprobada |

## `join-optimization`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Reducir antes de unir, tipos de clave, distribución, cuándo sí y cuándo no, BigQuery, Redshift, Synapse dedicado y Fabric, seguridad y costo están. La §13 dice que Fabric no expone claves de distribución como Synapse. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Broadcast y `INT64` de BigQuery, `DISTKEY`/`ALL` y etiquetas `DS_*` de Redshift, las condiciones de Synapse y los tipos de Fabric están en notas Nivel 1. Las estrategias hash, merge y nested loop están en la nota de PostgreSQL. La de Redshift menciona el hash join al recomendar el sort merge. | aprobada |
| Errores técnicos o simplificaciones peligrosas | La tabla de la §2 dice que el hash join aparece en «PostgreSQL, Redshift y la mayoría de los motores». BigQuery y Fabric, en las páginas citadas, no lo nombran así: BigQuery documenta el broadcast join. Propuesta: dejar hash, merge y nested loop en los motores cuyas páginas los nombran, y el broadcast en BigQuery y en `DS_BCAST_INNER`. El `DISTKEY` de la §10 está marcado como no ejecutado. El hash join de PostgreSQL sí se ejecutó. | aprobada |
| Ejemplos poco realistas | Hechos distribuidos `EVEN` que pasan a la clave del join, y una dimensión chica en `ALL`, es el diseño que recomienda Redshift. | aprobada |
| Relaciones faltantes | `sql-joins`, `query-plans`, `star-schema` y `scan-reduction` están en `relations`. | aprobada |

## `materialization-strategies`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Vista, tabla, incremental, efímera y vista materializada, cuándo sí y cuándo no, dbt, BigQuery, Redshift y Fabric, seguridad y costo están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Las cinco materializaciones de dbt, la vista lógica y la vista materializada de BigQuery (`max_staleness` de 30 minutos a 3 días), el `REFRESH` de Redshift y el de PostgreSQL están en notas Nivel 1. La superficie de T-SQL de Fabric lista las vistas materializadas entre lo no admitido. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El resumen no presenta la vista materializada como disponible en Fabric. El `REFRESH` se ejecutó en PostgreSQL. El texto dice que el refresco de BigQuery y Redshift no se ejecutó. No marco otro error. | aprobada |
| Ejemplos poco realistas | Un tablero que agrega años de pedidos en cada visita, y la alternativa de tabla incremental donde no hay vista materializada, es un caso habitual. | aprobada |
| Relaciones faltantes | `incremental-load`, `data-transformation`, `scan-reduction` y `sql-cte` están en `relations`. | aprobada |

## `cloud-warehouse-optimization`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué decide el equipo y qué el motor, cuándo sí y cuándo no, BigQuery, Redshift, Synapse dedicado y Fabric, seguridad y costo están. Sigue `modern`. El resumen remite el detalle de BigQuery a `bigquery-query-optimization`. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Particiones y vistas materializadas de BigQuery, `JOBS` (180 días, excluir `SCRIPT`), optimización automática y `ENCODE AUTO` de Redshift, y estadísticas, caché, V-Order y snapshot de Fabric están en notas Nivel 1. La distribución de BigQuery y la de Fabric se dejan como no expuestas, no como ausentes por inferencia. | aprobada |
| Errores técnicos o simplificaciones peligrosas | La celda de Synapse en la tabla de la §2 dice «índices columnstore, particiones». La nota citada habla de distribución, estadísticas, grano de partición y clases de recursos, y nombra columnstore como tipo de tabla que se beneficia de más memoria, no como el equivalente de una sort key. Propuesta: describir esas palancas como las nombra la página. Las dos consultas de la §10 están marcadas como no ejecutadas. | aprobada |
| Ejemplos poco realistas | Medir las consultas más caras antes de cambiar el diseño, y no juzgar Fabric por el primer acceso en frío, es lo que describen `JOBS` y la guía de Fabric. | aprobada |
| Relaciones faltantes | `scan-reduction`, `join-optimization`, `materialization-strategies` y `query-plans` están en `relations`. | aprobada |
