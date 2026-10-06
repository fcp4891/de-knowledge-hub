# Revisión B-F3.1 · Lote F3b-01b

Fichas en `content/concepts/`. Carril B no las edita. Las cinco están en `review_required`. Hay un comentario `VERIFY` en `data-contracts` §11; se resolvió el 2026-10-06 abriendo la pestaña BigQuery de la página de contratos de dbt.

Las 5: `avro-format`, `json-format`, `csv-format`, `compression` y `data-contracts`.

## Criterios heredados del lote 1

| Criterio | Hallazgo | Estado |
|---|---|---|
| §14 con seguridad, observabilidad y costo | Las 5 fichas los traen como viñetas explícitas de §14. | pendiente |
| Ejemplos atómicos e idempotentes | `avro-format` carga con `--replace=true`. El Python de las otras fichas lee, compara o comprime en memoria y no escribe en un destino. El YAML de `data-contracts` es declarativo. | pendiente |
| Relaciones completas | En las 5, cada slug de `related_topics` está en `relations`. `data-contracts` agrega además `data-pipeline`, que también está en la §17. | pendiente |
| Nivel 4 solo conceptual | No hay fuentes Nivel 4. Las RFC 8259 y 4180 son la referencia canónica de JSON y CSV. Las afirmaciones de producto están en notas Nivel 1. | pendiente |

## `data-contracts`

Consulté [Model contracts](https://docs.getdbt.com/docs/mesh/govern/model-contracts) el 2026-10-06. El sitio abrió la versión 2 de la documentación (`?version=2`). En «Platform constraint support» abrí la pestaña **BigQuery**.

| Criterio | Hallazgo | Estado |
|---|---|---|
| VERIFY §11 · restricciones de BigQuery | La tabla de la pestaña BigQuery, en esa URL, dice: `not_null` se puede definir y se aplica; `primary_key` y `foreign_key` se pueden definir y no se aplican (quedan como metadatos); `unique` y `check` no se pueden definir ni se aplican. La §11 dice que los contratos aplican nombres y tipos y que, según dbt, la mayoría de las plataformas solo aplica `not_null`. Eso coincide con lo que BigQuery aplica, y no dice qué se puede declarar sin aplicarse. Propuesta: anotar la tabla de la pestaña (aplicada, solo metadatos, no definible) y quitar el comentario `VERIFY`. | pendiente |
| Casos que dbt no admite | La misma página, en Prerequisites, dice que no hay contrato en modelos Python, vistas materializadas, materializaciones `ephemeral`, materializaciones custom (salvo que el autor las agregue), modelos con CTE recursivas en BigQuery, ni en seeds, snapshots y sources. Las vistas sí admiten nombres y tipos, no restricciones. Los incrementales solo con `on_schema_change: append_new_columns` o `fail`. La §6 lista Python, `ephemeral`, seeds, snapshots, sources y vistas sin restricciones. No nombra la vista materializada, la CTE recursiva de BigQuery ni el límite de `on_schema_change`. Propuesta: completar esa lista. | pendiente |
| Preguntas de §48 no respondidas | Qué es, por qué no es un estándar cerrado, cuándo sí y cuándo no, dbt, Pub/Sub, Glue y Event Hubs, seguridad y costo están. `modern` se mantiene en la clasificación y en el resumen. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | La palabra «contrato» se usa donde la fuente la usa: dbt, Pub/Sub y Glue. Event Hubs queda como gestión del contrato fuera del evento, como dice Microsoft Learn. Los 8 modos de Glue y los tres de Event Hubs (Backward, Forward, None), con evolución solo en Avro, están en las notas. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El resumen no presenta el contrato como especificación única. La §13 dice que Glue y Event Hubs no son equivalentes. El Python avisa que no es el código de dbt y que no cubre modificar una restricción ni borrar el modelo. No marco otro error fuera de las dos filas de arriba. | pendiente |
| Ejemplos poco realistas | Un modelo público con `contract.enforced` y un tema con esquema Avro es el caso que las fuentes describen. | pendiente |
| Relaciones faltantes | `schema-evolution`, `avro-format`, `data-validation-with-pydantic` y `data-pipeline` están en `relations`. | pendiente |

## `avro-format`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, la resolución de esquemas, cuándo sí y cuándo no, BigQuery, Pub/Sub, Redshift, Athena, Glue, Data Factory y Event Hubs, seguridad y costo están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Esquema JSON, bloques comprimibles, defaults solo al leer, carga preferida de BigQuery, esquema del archivo alfabéticamente último, decimal a NUMERIC, BIGNUMERIC o STRING, Pub/Sub sin validar defaults, COPY de Redshift, Athena `STORED AS AVRO`, codecs de Data Factory y Snappy fuera de la Copy activity están en notas Nivel 1. | pendiente |
| Errores técnicos o simplificaciones peligrosas | Agregar un campo con default y que el lector viejo ignore el campo nuevo coincide con la especificación. El `bq load` no se ejecutó contra GCP; el comando lleva `--replace=true` y lo dice el comentario. No marco un error. | pendiente |
| Ejemplos poco realistas | Eventos Avro, aterrizaje en archivos y carga a BigQuery sin declarar esquema es el uso que describe la documentación de BigQuery. | pendiente |
| Relaciones faltantes | `row-vs-columnar-formats`, `parquet-format`, `schema-evolution` y `compression` están en `relations`. | pendiente |

## `json-format`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, JSON Lines, cuándo sí y cuándo no, BigQuery, Redshift y Data Factory, seguridad y costo están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Nombres que deberían ser únicos, UTF-8, límite de precisión, JSON Lines y gzip de BigQuery (sin paralelismo, sin mezclar, 4 GB), tipo `JSON` frente a `STRUCT`, políticas de fila que no aplican a columnas `JSON`, `COPY` de Redshift con `auto` y sin partir anidados, y los dos patrones de Data Factory están en notas Nivel 1. | pendiente |
| Errores técnicos o simplificaciones peligrosas | La §12 dice que Redshift lleva el JSON a columnas de una tabla que ya existe, a diferencia del tipo `JSON` de BigQuery. La §13 distingue JSON Lines de un array único. El lector rechaza nombres repetidos; sin el hook, Python se queda con el último. No marco un error. | pendiente |
| Ejemplos poco realistas | Guardar la respuesta de una API en JSON Lines y tipar al cargar es un diseño habitual. | pendiente |
| Relaciones faltantes | `csv-format`, `avro-format`, `schema-on-read-vs-schema-on-write`, `api-ingestion` y `compression` están en `relations`. | pendiente |

## `csv-format`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, el dialecto, cuándo sí y cuándo no, BigQuery, Redshift y Data Factory, seguridad y costo están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | La RFC 4180, `newline=''` y `strict` de Python, las opciones de carga de BigQuery, `QUOTE AS` de Redshift y el `escapeChar` por defecto de Data Factory (barra invertida) están en notas Nivel 1. | pendiente |
| Errores técnicos o simplificaciones peligrosas | La §13 distingue el escape por defecto de Data Factory del de la RFC y de Redshift. BigQuery no admite anidados en CSV. El ejemplo de producción declara delimitador, encabezado, saltos entre comillas y `--max_bad_records=0`. No marco un error. | pendiente |
| Ejemplos poco realistas | Un CSV de un socio con punto y coma, encabezado y saltos de línea dentro de campos es un archivo habitual. | pendiente |
| Relaciones faltantes | `file-ingestion`, `json-format`, `compression` y `schema-on-read-vs-schema-on-write` están en `relations`. | pendiente |

## `compression`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, archivo completo frente a compresión interna, cuándo sí y cuándo no, BigQuery, Redshift, Athena y Data Factory, seguridad y costo están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | BigQuery no carga Avro, Parquet ni ORC comprimidos enteros; CSV y JSON en gzip no se leen en paralelo; codecs de Parquet; bloques de Avro; Athena (Snappy, ZSTD, sin `tar.gz`, sin escribir Parquet con LZ4 ni LZO); `ENCODE AUTO` y COPY de Redshift; codecs de Data Factory. Están en notas Nivel 1. | pendiente |
| Errores técnicos o simplificaciones peligrosas | La §11 resume los codecs de Parquet en BigQuery como «LZO». La nota de la fuente lista `LZO_1C` y `LZO_1X`. Propuesta: usar esos dos nombres. El resto (no gzip de Parquet, Avro o ORC enteros; Snappy y LZ4 fuera de la Copy activity) coincide con las notas. | pendiente |
| Ejemplos poco realistas | Partir un `.csv.gz` grande y pasar la capa curada a Parquet es coherente con el límite de paralelismo que documenta BigQuery. El 14 % es el resultado de ese CSV repetitivo, y el texto dice que con datos poco repetitivos el ahorro es menor. | pendiente |
| Relaciones faltantes | `parquet-format`, `avro-format`, `csv-format`, `json-format` y `row-vs-columnar-formats` están en `relations`. | pendiente |
