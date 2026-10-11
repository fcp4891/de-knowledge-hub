# Revisión B-F3.1 · Lote F3b-04a

Fichas en `content/concepts/`. Carril B no las edita. Felipe aprobó todas las filas el 2026-10-10, incluida la reclasificación del quickstart de Snowflake a Nivel 3. Para `data-vault`: Data Vault Alliance (organización del autor del método) como N4 canónico solo para lo conceptual (hubs, links, satélites, hash), mismo criterio que Kimball Group; Microsoft Learn (N1) para el uso en plataforma; la guía de Snowflake no sostiene afirmaciones. Las diez siguen en `review_required` hasta que Carril A aplique la revisión. No hay comentarios `VERIFY`.

Las 10: `conceptual-data-model`, `logical-data-model`, `physical-data-model`, `denormalization`, `kimball-methodology`, `snowflake-schema` (pattern), `conformed-dimensions` (incluye la matriz de bus), `data-vault` (pattern, `modern`), `one-big-table` (pattern, `modern`) y `semantic-models` (`modern`).

El 2026-10-10 contrasté las páginas que el pedido marca: el quickstart de Snowflake, la definición de modelo conceptual de AWS, la de OBT en las buenas prácticas de dbt, *What is Amazon Quick?* y *Working with Amazon Quick Sight Topics*. No volví a ejecutar el SQL.

Decisión aprobada para `data-vault`:

1. La guía *Building a Real-Time Data Vault in Snowflake* pasa a Nivel 3 y no sostiene afirmaciones.
2. Data Vault Alliance, organización del autor del método, queda como N4 canónico solo para lo conceptual (hubs, links, satélites, hash), mismo criterio que Kimball Group.
3. Microsoft Learn (N1) sostiene el uso en plataforma: la capa silver de Azure Databricks a menudo sigue 3NF o Data Vault.

## Criterios heredados del lote 1

| Criterio | Hallazgo | Estado |
|---|---|---|
| §14 con seguridad, observabilidad y costo | Las 10 fichas los traen como viñetas explícitas de §14. | aprobada |
| Ejemplos atómicos e idempotentes | Ocho fichas dicen que su SQL se ejecutó en PostgreSQL 17.11 local, en un esquema desechable. `conceptual-data-model` §10 es un diagrama Mermaid. `semantic-models` §10 (YAML de dbt v1.12 y LookML) dice que no se ejecutó y que el YAML solo se validó como sintaxis. `data-vault` §10 muestra que la segunda carga del mismo lote no agrega filas. No reejecuté el SQL. | aprobada |
| Relaciones completas | En las 10, cada slug de `related_topics` está en `relations`. | aprobada |
| Nivel 4 solo conceptual | Chen (`chen-er-model-1976`) está marcado Nivel 4 y el cuerpo lo usa para entidad, relación y rol. Kimball (`kimball-group-techniques`) está marcado Nivel 4 en `kimball-methodology`, `snowflake-schema` y `conformed-dimensions`, y el cuerpo lo usa para el método y la forma del modelo. La guía de Snowflake está registrada como Nivel 1; la propuesta es pasarla a Nivel 3. | aprobada |
| Afirmaciones de producto en Nivel 1–2 | Fabric, Power BI, Azure Databricks, BigQuery, Redshift, PostgreSQL, dbt, Looker y Amazon Quick Sight están en notas Nivel 1, cada una sobre su herramienta. No encontré una afirmación de producto que se apoye solo en Kimball o en Chen. | aprobada |

## `conceptual-data-model`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué acuerda el conceptual, cuándo sí y cuándo no, y §14 están. No tiene tipos ni tecnología. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | La definición sale de *What is Data Modeling?* de AWS: vista general, atributos y restricciones, reglas de negocio, organización, seguridad e integridad, diagrama sin reglas formales, también llamado modelo de dominio, con el ejemplo del concesionario. Chen (Nivel 4) aporta entidad, relación, rol y la decisión de diseño (su ejemplo del matrimonio). El cuerpo separa las dos atribuciones. | aprobada |
| Errores técnicos o simplificaciones peligrosas | Chen no se usa para un producto ni para una sintaxis. No marco otro error. | aprobada |
| Ejemplos poco realistas | El concesionario es el ejemplo de la página de AWS. | aprobada |
| Relaciones faltantes | `logical-data-model`, `physical-data-model` y `grain` están en `relations`. | aprobada |

## `logical-data-model`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Tipos, claves y reglas, cuándo sí y cuándo no, y §14 están. §11–13 dicen que el lógico es independiente del motor y remiten a `physical-data-model`. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | La definición (tipos, relaciones, claves, independiente de la tecnología, algunos equipos ágiles lo saltan) está en la nota de AWS. `CHECK`, `NOT NULL`, `UNIQUE`, `PRIMARY KEY` y `FOREIGN KEY` están en la nota de PostgreSQL 17. Chen queda como referencia conceptual del modelo entidad-relación. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El párrafo de ejecución dice que al pasar el DDL a otro motor las restricciones se comportan distinto, y remite a `physical-data-model`. No marco otro error. | aprobada |
| Ejemplos poco realistas | Una venta con vendedor y cliente, y la regla «al menos un vendedor» como consulta, es un uso habitual. | aprobada |
| Relaciones faltantes | `conceptual-data-model`, `physical-data-model` y `normalization` están en `relations`. | aprobada |

## `physical-data-model`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué decide el físico, cuándo sí y cuándo no, y §14 están. El SQL mostrado es de PostgreSQL. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | La definición está en la nota de AWS. Particiones, pruning y la clave que incluye la columna de partición están en PostgreSQL 17. Partición, clustering y claves no aplicadas de BigQuery, distribución y sort keys de Redshift, y `NONCLUSTERED` / `NOT ENFORCED` de Fabric están en notas Nivel 1. | aprobada |
| Errores técnicos o simplificaciones peligrosas | §11–13 describen el comportamiento que está en esas notas: bytes leídos y clustering en BigQuery, claves no aplicadas, `AUTO` / `EVEN` / `KEY` / `ALL` y `SORTKEY AUTO` en Redshift, `NONCLUSTERED` y `NOT ENFORCED` en Fabric. No hay un `CREATE TABLE` de BigQuery, Redshift ni Fabric. El párrafo posterior al §10 dice que ese DDL no se escribió ni se ejecutó. No marco otro error. | aprobada |
| Ejemplos poco realistas | Una tabla de ventas particionada por mes, con el plan que descarta septiembre, es un uso habitual. | aprobada |
| Relaciones faltantes | `logical-data-model`, `partitioning` y `clustering` están en `relations`. | aprobada |

## `denormalization`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué se repite, cuándo sí y cuándo no, y §14 están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Desnormalizar y los campos anidados y repetidos de BigQuery, la recomendación de Azure Databricks contra un 3NF en el lakehouse, y la tabla única de Power BI están en notas Nivel 1. No hay fuente Nivel 4. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El ejemplo muestra la copia desactualizada hasta el `REFRESH`. No marco otro error. | aprobada |
| Ejemplos poco realistas | Aplanar líneas de pedido y refrescar la vista cuando cambia la región es un uso habitual. | aprobada |
| Relaciones faltantes | `normalization`, `star-schema` y `one-big-table` están en `relations`. | aprobada |

## `kimball-methodology`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Los cuatro pasos, el bus, la matriz, cuándo sí y cuándo no, y §14 están. §11–12 dicen que la metodología es independiente de la tecnología. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Los cuatro pasos, el bus y la estrella en bases relacionales están en notas de Kimball marcadas Nivel 4, conceptual. Fabric recomienda el esquema estrella y cita el libro; Power BI explica la estrella para sus modelos semánticos. Esas dos frases están en notas de Microsoft Learn. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El SQL ilustra los cuatro pasos en PostgreSQL. La frase sobre warehouses que no aplican la unicidad remite a `physical-data-model`, no a Kimball. No marco otro error. | aprobada |
| Ejemplos poco realistas | Ventas en tienda, grano de línea de ticket, y un segundo proceso que reutiliza dimensiones es el caso habitual del método. | aprobada |
| Relaciones faltantes | `star-schema`, `conformed-dimensions` y `grain` están en `relations`. | aprobada |

## `snowflake-schema`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué normaliza, cuándo sí y cuándo no, y §14 están. §11–12 dicen que no citan fuente de GCP ni de AWS. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | La forma del copo de nieve, la recomendación de evitarlo y el outrigger están en notas de Kimball marcadas Nivel 4, conceptual. Power BI (más tablas, cadenas de filtros, jerarquías de una sola tabla, conviene la tabla única) y Azure Databricks (estrella y copo de nieve rinden bien; evitar 3NF) están en notas Nivel 1, cada una sobre su herramienta. | aprobada |
| Errores técnicos o simplificaciones peligrosas | §13 deja los dos consejos de Microsoft en su herramienta y no los presenta como la misma recomendación de producto. El ejemplo dice que no mide el rendimiento. No marco otro error. | aprobada |
| Ejemplos poco realistas | Producto, subcategoría y categoría, y la misma consulta en estrella y en copo de nieve, es un uso habitual. | aprobada |
| Relaciones faltantes | `star-schema`, `normalization` y `denormalization` están en `relations`. | aprobada |

## `conformed-dimensions`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué se comparte, la matriz de bus, el drill-across, cuándo sí y cuándo no, y §14 están. §11–12 dicen que no aplica de forma específica al motor. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Misma columna y mismo dominio, la matriz (filas = procesos, columnas = dimensiones), el drill-across y las dimensiones reducidas están en notas de Kimball marcadas Nivel 4, conceptual. Fabric describe dimensiones compartidas por varias estrellas y el ejemplo de la dimensión fecha con Sales e Inventory, en una nota de Microsoft Learn. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El SQL de drill-across es el ejemplo de la ficha en PostgreSQL (agregar cada hecho y alinear). No se atribuye a Fabric el `FULL JOIN` ni el sort-merge de Kimball. No marco otro error. | aprobada |
| Ejemplos poco realistas | Ventas e inventario por fecha y categoría, y el error de sumar el stock dos veces, es el caso habitual. | aprobada |
| Relaciones faltantes | `kimball-methodology`, `dimension-tables` y `fact-tables` están en `relations`. | aprobada |

## `data-vault`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Hubs, links y satélites, capa de integración, cuándo sí y cuándo no, y §14 están. §11 dice que no cita Google Cloud. §12 dice que los materiales de AWS encontrados son blogs de nivel 3 y no se usan. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | La página citada es el quickstart *Building a Real-Time Data Vault in Snowflake*. Ella misma dice que es una versión extendida de un artículo de Data Vault Alliance, que no detalla los estándares de DV2.1 y que remite a Data Vault Alliance para la formación. El registro la clasifica como `official_docs`, Nivel 1. Propuesta: Nivel 3. No es documentación de producto ni release notes. Microsoft Learn solo dice que la silver a menudo sigue 3NF o Data Vault. Esa frase no define hubs, links, satélites, PIT, Bridge ni el hash. Si la guía baja de nivel, la metodología no queda sostenida por Microsoft Learn. `ON CONFLICT DO NOTHING` sí está en PostgreSQL 17. | aprobada |
| Errores técnicos o simplificaciones peligrosas | §2 atribuye las estructuras a la guía. §20 dice que Linstedt no se cita y que el año y la exigencia de consistencia del hash vienen de esa guía. §6 escribe «DV2.1 exige» como regla del método. La fila siguiente fija el sostén: Data Vault Alliance para lo conceptual y Microsoft Learn para la plataforma. La guía de Snowflake no sostiene esa frase. El §10 dice que el hash del ejemplo es una decisión de esta base, no del estándar de Data Vault. | aprobada |
| Ejemplos poco realistas | Tres sistemas de pólizas y un satélite nuevo para el cuarto es un uso habitual de una capa de integración. | aprobada |
| Relaciones faltantes | `kimball-methodology`, `surrogate-key-generation` y `change-detection` están en `relations`. | aprobada |
| Fuente de la metodología | Data Vault Alliance (organización del autor del método) como N4 canónico solo para lo conceptual (hubs, links, satélites, hash), mismo criterio que Kimball Group. Microsoft Learn (N1) para el uso en plataforma. La guía de Snowflake no sostiene afirmaciones. | aprobada |

## `one-big-table`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué junta, cuándo sí y cuándo no, y §14 están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | La definición está en la guía de buenas prácticas de dbt (*Tactical terminology*): el sistema más desnormalizado es OBT, reunir en una tabla cada columna interesante de un concepto para que el analista solo haga `SELECT`. La guía de marts (con Semantic Layer, marts normalizados; sin ella, marts anchos) es la otra nota de dbt. BigQuery (anidar en lugar de aplanar uno a muchos) y Azure Databricks (más campos en una tabla) están en notas Nivel 1. No es un post de blog. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El resumen y el §5 dicen que se construye sobre la estrella y no en su lugar. El §6 remite a la guía de dbt para quedarse normalizado cuando hay Semantic Layer. No la presenta como reemplazo del modelo dimensional. No marco otro error. | aprobada |
| Ejemplos poco realistas | Una tabla ancha de ventas reconstruida de noche, y el BI sobre la estrella, es un uso habitual. | aprobada |
| Relaciones faltantes | `denormalization`, `star-schema` y `scan-reduction` están en `relations`. | aprobada |

## `semantic-models`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué centraliza, cuándo sí y cuándo no, y §14 están. §6 dice que cada herramienta tiene su formato y que mover definiciones implica reescribirlas. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | dbt (semantic models de MetricFlow, YAML, Semantic Layer como motor de desnormalización), LookML (explores, joins, dimensiones y medidas), Power BI (fuente lista para reportes, Analysis Services, «semantic model» y «model» como sinónimos, medida distinta de la del esquema estrella) y Amazon Quick Sight están en notas Nivel 1, cada una con su página. | aprobada |
| Errores técnicos o simplificaciones peligrosas | §2 lista lo común y después lo propio de cada herramienta. §15 dice que no hay que suponer que «semantic model» significa lo mismo en dbt, Power BI, Looker y Quick Sight. *What is Amazon Quick?* llama Amazon Quick al servicio y Amazon Quick Sight a la función de BI (antes QuickSight). La página de Topics llama al Topic «the multi-dataset semantic layer», con hasta 12 datasets, joins internos en tiempo de ejecución y cada dataset en su granularidad. El §12 dice eso de Quick Sight y lo distingue de dbt y de Looker. No marco otro error. | aprobada |
| Ejemplos poco realistas | Una métrica definida una vez, y un segundo semantic model de Power BI que se compara con el de dbt, es un uso habitual. | aprobada |
| Relaciones faltantes | `star-schema`, `kimball-methodology` y `one-big-table` están en `relations`. | aprobada |
