# Revisión B-F3.1 · Lote F3b-02a

Fichas en `content/concepts/`. Carril B no las edita. Felipe aprobó todas las filas el 2026-10-07, incluidas las propuestas: `USING` solo en PostgreSQL, BigQuery y Redshift; el ejemplo de `sql-cte` con `ON` o sin atribuirlo a T-SQL; quitar T-SQL del comentario de error de `sql-subqueries`; acotar `QUALIFY` en el resumen de `sql-advanced-select`, decir «sintaxis antigua, no ISO» y citar *Aggregation extensions* de Redshift para `GROUPING()`; en `sql-case-expressions`, sintaxis documentada y ejecución solo en PostgreSQL; `IS DISTINCT FROM` no como comportamiento de Redshift (sí en PostgreSQL y BigQuery; en Fabric, con su página y sin Synapse) y `SUM` de cero filas atribuido a PostgreSQL y, si se mantiene en BigQuery, a *Aggregate functions*; en `sql-structs`, sin la frase de validación de esquema. Las diez siguen en `review_required` hasta que Carril A aplique la revisión. No hay comentarios `VERIFY`.

Las 10: `sql-joins`, `sql-cte`, `sql-subqueries`, `sql-advanced-select`, `sql-case-expressions`, `sql-nulls`, `sql-qualify`, `sql-unnest`, `sql-arrays` y `sql-structs`.

Criterio de este lote: cada afirmación de producto se atribuye al motor cuya página la dice. Las páginas de T-SQL se atribuyen a Fabric Warehouse solo si dicen que aplican. No se afirma qué es o no es SQL estándar salvo donde una fuente lo dice. El SQL de BigQuery que no se ejecutó debe decirlo.

## Criterios heredados del lote 1

| Criterio | Hallazgo | Estado |
|---|---|---|
| §14 con seguridad, observabilidad y costo | Las 10 fichas los traen como viñetas explícitas de §14. | aprobada |
| Ejemplos atómicos e idempotentes | El SQL de nube está comentado o marcado como no ejecutado. Lo que escribe estado (`CREATE TYPE`, `INSERT`) está en el ejemplo local de `sql-structs` y se ejecutó en PostgreSQL. El resto son consultas. | aprobada |
| Relaciones completas | En las 10, cada slug de `related_topics` está en `relations`. | aprobada |
| Nivel 4 solo conceptual | No hay fuentes Nivel 4. Las afirmaciones de producto están en notas Nivel 1. La frase «no está en el estándar SQL» de `sql-cte` está en la nota de PostgreSQL, que es quien lo dice, y el cuerpo no la usa como regla general. | aprobada |

## `sql-joins`

Consulté [FROM (Transact-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/queries/from-transact-sql?view=sql-server-ver17) el 2026-10-07. Aplica a Synapse y a Warehouse en Fabric. La gramática de join de Fabric y la de Synapse es `ON search_condition`. La página no menciona `USING`.

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, cuándo sí y cuándo no, `ON` frente a `WHERE`, semi-join y anti-join, BigQuery, Redshift y T-SQL, seguridad y costo están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Tipos de join, `EXISTS` y `NOT IN` con `NULL` están en notas Nivel 1. La página de `FROM` de T-SQL sí dice que aplica a Fabric Warehouse. | aprobada |
| Errores técnicos o simplificaciones peligrosas | La §4 atribuye el orden `ON` antes del join y `WHERE` después a PostgreSQL, que es la página que lo dice. El comentario de la §10 dice que «la misma lógica funciona» en BigQuery, Redshift y T-SQL. Esas páginas, en las notas de la ficha, no describen esa trampa del `LEFT JOIN`. La §2 presenta `USING` como forma general, junto con los cuatro motores. La gramática de T-SQL consultada solo tiene `ON`. Propuesta: en la §10, dejar el ejemplo como ejecutado en PostgreSQL y no afirmar el mismo resultado en los otros motores; en la §2, limitar `USING` a PostgreSQL, BigQuery y Redshift. | aprobada |
| Ejemplos poco realistas | El filtro en `WHERE` que convierte un `LEFT JOIN` en interno, y el `NOT IN` con un `NULL`, son fallos habituales. Los conteos son de la prueba en PostgreSQL. | aprobada |
| Relaciones faltantes | `sql-subqueries`, `sql-nulls`, `sql-unnest` y `fact-tables` están en `relations`. | aprobada |

## `sql-cte`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, cuándo sí y cuándo no, materialización por motor, BigQuery, Redshift y T-SQL, seguridad y costo están. La página de `WITH` dice que aplica a Fabric Warehouse, y la ficha lo usa solo para CTE no recursivas. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | La tabla de la §4 atribuye a cada motor lo que dice su nota: BigQuery reejecuta la CTE no recursiva, PostgreSQL la calcula una vez por defecto, Redshift habla de tabla temporal y T-SQL dice que no se materializa. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El comentario de la §10 dice que la misma consulta funciona en T-SQL. Esa consulta une con `USING (cliente_id)`. La página de `FROM` de T-SQL no documenta `USING` (ver `sql-joins`). BigQuery y Redshift sí documentan `USING`. Propuesta: reescribir el join del ejemplo portable con `ON`, que es lo que T-SQL documenta, o no incluir T-SQL en ese comentario. | aprobada |
| Ejemplos poco realistas | Una cadena de pasos de pedidos y el costo duplicado al referenciar dos veces una CTE en BigQuery coinciden con lo que dice su documentación. | aprobada |
| Relaciones faltantes | `sql-subqueries` y `data-transformation` están en `relations`. | aprobada |

## `sql-subqueries`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, cuándo sí y cuándo no, cero filas y más de una fila, BigQuery y Redshift, seguridad y costo están. La §13 dice que la página de subconsultas de SQL Server no menciona Warehouse en Fabric, y `technologies` no incluye `microsoft-fabric`. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Cero filas → `NULL` y más de una fila → error están en las notas de BigQuery y Redshift, y se observó en PostgreSQL. La nota de T-SQL solo habla de rendimiento frente a un join. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El comentario de la §10 dice que la misma lógica funciona en T-SQL, incluida la consulta que falla con más de una fila. La página citada no documenta ese error ni aplica a Fabric Warehouse. El cuerpo, en la §4 y la §13, no hace esa atribución. Propuesta: quitar T-SQL de ese comentario. | aprobada |
| Ejemplos poco realistas | Un promedio y la fecha del último pedido son consultas habituales. El mensaje de error es el de PostgreSQL, y el texto dice que BigQuery y Redshift documentan un error equivalente. | aprobada |
| Relaciones faltantes | `sql-cte`, `sql-joins` y `sql-nulls` están en `relations`. | aprobada |

## `sql-advanced-select`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Orden lógico, `ROLLUP`, `CUBE`, `GROUPING SETS`, `HAVING`, los tres motores y el costo están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | El orden de PostgreSQL, BigQuery y T-SQL está en notas Nivel 1. La página de `SELECT` de T-SQL dice que aplica a Fabric Warehouse e incluye `QUALIFY` solo para Fabric Data Warehouse; la ficha lo dice así. Redshift documenta `GROUPING()` en [Aggregation extensions](https://docs.aws.amazon.com/redshift/latest/dg/r_GROUP_BY_aggregation-extensions.html), página que la ficha no cita. La nota citada solo nombra `GROUPING SETS`, `ROLLUP`, `CUBE` y `GROUP BY ALL`. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El resumen lista «ventanas y `QUALIFY`» dentro del orden lógico general. PostgreSQL no tiene `QUALIFY`. La §4 sí dice «donde el motor los admite». La §14 llama «sintaxis ISO» a `GROUP BY ROLLUP (...)`. La nota de T-SQL dice que `WITH ROLLUP` y `WITH CUBE` son sintaxis antigua, no ISO; no dice que la forma nueva sea el estándar. El comentario de la §10 afirma que `GROUPING` existe en Redshift sin citar la página que lo define. Propuesta: acotar `QUALIFY` en el resumen; decir «sintaxis antigua, no ISO» como la fuente; citar la página de extensiones de Redshift si se mantiene `GROUPING` para ese motor. | aprobada |
| Ejemplos poco realistas | Subtotales con `ROLLUP` y el alias usado en `WHERE` son casos habituales. El error citado es el de PostgreSQL. | aprobada |
| Relaciones faltantes | `sql-case-expressions`, `sql-nulls` y `sql-window-functions` están en `relations`. | aprobada |

## `sql-case-expressions`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Formas simple y buscada, `ELSE`, agregación condicional, cortocircuito, los tres motores, seguridad y costo están. La página de `CASE` dice que aplica a Fabric Warehouse. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Orden de evaluación, `IF`/`IFNULL` de BigQuery, el `1/0` de PostgreSQL y el error 8133 de T-SQL están en notas Nivel 1. La nota de Redshift solo documenta las dos formas, con un ejemplo de cada una. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El comentario de la §10 dice «Igual en BigQuery, Redshift y T-SQL». La misma ficha documenta diferencias: T-SQL evalúa antes los agregados de los `WHEN` y puede dar el error 8133. Propuesta: decir que las dos consultas usan la sintaxis de `CASE` documentada en esos motores y que solo se ejecutaron en PostgreSQL. | aprobada |
| Ejemplos poco realistas | Tramos de monto y dos métricas en una pasada son habituales. El resultado de `WHEN NULL` es el de la prueba en PostgreSQL. | aprobada |
| Relaciones faltantes | `sql-nulls`, `sql-advanced-select` y `data-transformation` están en `relations`. | aprobada |

## `sql-nulls`

Consulté [Unsupported PostgreSQL functions](https://docs.aws.amazon.com/redshift/latest/dg/c_unsupported-postgresql-functions.html) y [IS DISTINCT FROM (Transact-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/queries/is-distinct-from-transact-sql?view=sql-server-ver17) el 2026-10-07. Redshift lista `IS DISTINCT FROM` entre las funciones de PostgreSQL no admitidas. La página de T-SQL aplica a SQL Server 2022, Azure SQL y Warehouse en Fabric; el encabezado consultado no incluye Synapse.

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, comparaciones, agregados, `NOT IN`, los tres motores, seguridad y costo están. La página de `NULL` y `UNKNOWN` dice que aplica a Fabric Warehouse. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | `IS DISTINCT FROM` está en las notas de PostgreSQL y de BigQuery. `SUM` de cero filas está en la nota de PostgreSQL. La de BigQuery sobre `SUM` de un grupo vacío existe en *Aggregate functions*, y la ficha no la cita. Las notas de Redshift y de T-SQL no definen `IS DISTINCT FROM` ni el `SUM` de cero filas. | aprobada |
| Errores técnicos o simplificaciones peligrosas | La §2 dice que las cuatro fuentes coinciden en la tabla, y esa tabla incluye `IS DISTINCT FROM` y `SUM` de cero filas. El comentario de la §10 dice que ese comportamiento está documentado para Redshift. La página de funciones no admitidas de Redshift lista `IS DISTINCT FROM`. Propuesta: dejar `IS DISTINCT FROM` en PostgreSQL y BigQuery; no presentarlo como comportamiento de Redshift; si se mantiene para Fabric, citar su página y no extenderlo a Synapse; atribuir el `SUM` de cero filas a PostgreSQL y, si se mantiene para BigQuery, citar *Aggregate functions*. | aprobada |
| Ejemplos poco realistas | Un cambio a `NULL` que `<>` no detecta, y una suma vacía en un día sin reembolsos, son fallos habituales. `FILTER` está marcado como sintaxis de PostgreSQL. | aprobada |
| Relaciones faltantes | `sql-joins`, `sql-case-expressions`, `sql-subqueries` y `data-reconciliation` están en `relations`. | aprobada |

## `sql-qualify`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué filtra, cuándo sí y cuándo no, el equivalente con subconsulta, BigQuery, Redshift y Fabric, seguridad y costo están. Sigue `modern`. El resumen dice que la forma con subconsulta sigue siendo válida y no queda obsoleta. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Cada motor cita su página. La de `QUALIFY` de Microsoft aplica al SQL analytics endpoint y a Warehouse en Fabric. La de `SELECT` dice que `QUALIFY` va en el orden lógico solo en Fabric Data Warehouse. El historial dice que no se afirma si es estándar SQL, porque ninguna fuente consultada lo dice. | aprobada |
| Errores técnicos o simplificaciones peligrosas | No se presenta como estándar ni como reemplazo. El ejemplo de BigQuery de la §10 está marcado como no ejecutado y dice que requiere GCP. El equivalente se ejecutó en PostgreSQL. No marco otro error. | aprobada |
| Ejemplos poco realistas | Quedarse con la última versión por clave, con desempate, es el uso habitual de la deduplicación. | aprobada |
| Relaciones faltantes | `sql-window-functions`, `deduplication`, `sql-advanced-select` y `sql-subqueries` están en `relations`. | aprobada |

## `sql-unnest`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué aplana, arrays vacíos, posición, BigQuery, Redshift, Athena y Fabric, seguridad y costo están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | `WITH OFFSET` y el `LEFT JOIN` de BigQuery, PartiQL/`UNNEST` de Redshift, el array vacío de Athena y `OPENJSON` están en notas Nivel 1. La página de `OPENJSON` dice que aplica a Synapse y a Warehouse en Fabric. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El SQL de BigQuery (`UNNEST … WITH OFFSET`) está marcado como no ejecutado. El resultado esperado se contrasta con la prueba de PostgreSQL y con la documentación, sin presentarlo como ejecutado. No marco otro error. | aprobada |
| Ejemplos poco realistas | Perder eventos sin etiquetas al aplanar con `CROSS JOIN` es un fallo habitual. | aprobada |
| Relaciones faltantes | `sql-arrays`, `sql-structs` y `sql-joins` están en `relations`. | aprobada |

## `sql-arrays`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, diferencias de modelo, cuándo sí y cuándo no, posición, BigQuery, Redshift, Fabric y PostgreSQL, seguridad y costo están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | `ARRAY` de BigQuery, `OFFSET`/`SAFE_OFFSET`, `SUPER` (16 MB) y la lista de tipos de Fabric (`varchar` para JSON, sin tipo array) están en notas Nivel 1. La celda «Ver límites de BigQuery» no inventa un número. | aprobada |
| Errores técnicos o simplificaciones peligrosas | No presenta el `ARRAY` de BigQuery como el `SUPER` de Redshift ni como un tipo de Fabric. `SAFE_OFFSET` está marcado como no ejecutado. El acceso desde 1 se ejecutó en PostgreSQL. No marco otro error. | aprobada |
| Ejemplos poco realistas | Etiquetas de un evento y el fallo de `OFFSET` sobre un array vacío son habituales. | aprobada |
| Relaciones faltantes | `sql-unnest`, `sql-structs` y `json-format` están en `relations`. | aprobada |

## `sql-structs`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, columnas anidadas, cuándo sí y cuándo no, límites de BigQuery, Redshift y Fabric, seguridad y costo están. La recomendación de desnormalizar se atribuye a BigQuery y el resumen dice que no es una regla general. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Igualdad por orden de campos, 15 niveles, incompatibilidad con `DISTINCT` y `UNION`, `SUPER` y la ausencia de tipos struct en Fabric están en notas Nivel 1. `OPENJSON` aplica a Fabric Warehouse. | aprobada |
| Errores técnicos o simplificaciones peligrosas | La §13 dice que en Fabric «la validación del esquema ocurre al leer, no al escribir». Las notas dicen que no hay tipo struct y que `OPENJSON … WITH` declara columnas al leer; no dicen que el motor valide un esquema al leer. Propuesta: describir lo que dicen esas dos páginas, sin la frase de validación. El `ARRAY<STRUCT>` de la §10 está marcado como no ejecutado. El tipo compuesto se ejecutó en PostgreSQL. | aprobada |
| Ejemplos poco realistas | Un pedido con líneas anidadas en BigQuery y el mismo dato como JSON en `varchar` para Fabric es el contraste que piden las fuentes. | aprobada |
| Relaciones faltantes | `sql-arrays`, `sql-unnest` y `star-schema` están en `relations`. | aprobada |
