# Revisión B-F3.1 · Lote F3b-09a

Fichas en `content/concepts/`, commit `d5eb9b4`. Carril B no las edita. Las ocho siguen en `review_required`. No hay comentarios `VERIFY`. No revisé `page_title`.

Las 8: `s3-data-lake`, `redshift-architecture`, `athena-serverless-queries`, `glue-catalog-and-etl`, `lake-formation-permissions`, `emr-spark-clusters`, `kinesis-data-streams` y `msk-managed-kafka`.

El 2026-10-13 contrasté el HTML de *Document history* de Firehose, *PutRecords*, la tabla de clases de S3, *What is Amazon Managed Service for Apache Flink?*, su *Document history*, las páginas de precios de Athena y de Glue, y la release `emr-7.14.0`. No reejecuté moto, PySpark ni Terraform.

`make` no está en el PATH. Con el `.venv` del proyecto, `.\.venv\Scripts\python.exe scripts\validate.py` (lo que corre `make validate`) terminó así:

```text
OK: 378 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

## Comprobación por comando

Fuentes del registro usadas por estas fichas: `aws-s3-docs`, `aws-redshift-docs`, `aws-athena-docs`, `aws-glue-docs`, `aws-lake-formation-docs`, `aws-emr-docs`, `aws-kinesis-docs`, `aws-firehose-docs`, `aws-managed-flink-docs` y `aws-msk-docs` son `official_docs`, nivel 1. `apache-spark-docs` también. Todas las fuentes de las 8 fichas tienen `accessed: 2026-10-12`.

```text
s14 Seguridad, Observabilidad y Costo: True en las 8.
Montos con $ o USD: ninguno.
related_topics ausentes en relations: ninguno.
relations no nombradas en el §17: ninguno.
page_title: False en las 8 (fuera de alcance).

s3-data-lake, redshift-architecture, athena-serverless-queries,
glue-catalog-and-etl, emr-spark-clusters, kinesis-data-streams, msk-managed-kafka:
  §17 = relations. Sin slugs sin ficha.

lake-formation-permissions:
  en el §17 y fuera de relations: aws-iam-for-data
  sin ficha en este commit: aws-iam-for-data
  el §17 dice «pendiente de ficha» (lote F3b-09b).

kinesis-data-streams aliases: [Amazon Kinesis Data Firehose]
```

`Kinesis Data Analytics` en `content/` (md y yaml):

```text
No matches found
```

Código y CI. `.github/workflows/ci.yml` pone `REQUIRE_AWS_SNIPPETS=1` y `REQUIRE_PYSPARK=1` en `make test`, y corre `make validate-terraform`. `tests/test_snippet_code.py` toma el primer bloque Python de la §10 y lo ejecuta:

```text
AWS_SNIPPETS = s3-data-lake, glue-catalog-and-etl, kinesis-data-streams
test_s3_snippet_writes_hive_partitions_idempotently
test_glue_snippet_registers_table_and_partitions_once
test_kinesis_snippet_sends_all_events_and_keeps_each_key_in_one_shard
  comentario: «Sin aserción de orden: PutRecords no lo garantiza»
test_aws_snippets_pass_mypy_strict
test_emr_spark_job_rewrites_only_its_partition  (local[2], no EMR)
```

Bloques `hcl` con `hashicorp/aws ~> 6.0` y «no se aplicó»: `s3-data-lake`, `lake-formation-permissions`, `emr-spark-clusters`, `msk-managed-kafka`. SQL «no ejecutado»: Redshift y Athena. El script `awsglue` de Glue dice «no ejecutado». MSK dice que no hay cliente de Kafka ejecutado.

Páginas (HTML, 2026-10-13):

```text
Firehose history, fila:
  «Amazon Kinesis Data Firehose is now known as Amazon Data Firehose»
  «Amazon Kinesis Data Firehose has rebranded to Amazon Data Firehose»
  fecha de esa fila: February 9, 2024
PutRecords: «PutRecords doesn't guarantee the ordering of records.
  If you need to read records in the same order they are written to the stream,
  use PutRecord instead of PutRecords, and write to the same shard.»
Flink what-is y document-history: sin «Kinesis Data Analytics», «renamed», «now known as» ni «rebrand».
S3, tabla Comparing the Amazon S3 storage classes:
  STANDARD, INTELLIGENT_TIERING y EXPRESS_ONEZONE: mínimo None
  STANDARD_IA y ONEZONE_IA: 30 days
  GLACIER_IR y GLACIER: 90 days
  DEEP_ARCHIVE: 180 days
  EXPRESS_ONEZONE: 1 zona. REDUCED_REDUNDANCY: Not recommended, mínimo None.
Athena pricing: mínimo de 10 MB por consulta. Glue pricing: mínimo de 2 DPU; por defecto 10 DPU en Spark.
emr-7.14.0: la página contiene «Spark 3.5.8».
```

## `s3-data-lake`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Ocho fuentes de nivel 1, consultadas el 2026-10-12. §14 completo, sin montos. El boto3 dice ejecutado en la CI contra moto y no corrido contra AWS; el test de la CI es `test_s3_snippet_writes_hive_partitions_idempotently` y `mypy --strict`. El Terraform dice validado y no aplicado. `relations` coincide con el §17. El §11 nombra otras clases, otros mínimos y otro modelo de nombres frente a Cloud Storage. | ninguna | — |
| La tabla del §2 dice «según su tabla al 2026-10-12». Las siete filas que trae coinciden con *Comparing the Amazon S3 storage classes* (mínimos None, 30, 90 y 180 días). Esa tabla también tiene S3 Express One Zone (`EXPRESS_ONEZONE`): mínimo ninguno y una sola zona. La nota de la fuente lo nombra; la tabla del §2 no. La misma página marca Reduced Redundancy como no recomendada; la ficha no la lista. | baja | Agregar la fila de Express One Zone, o decir que la tabla es un recorte y no incluye esa clase ni Reduced Redundancy. |

## `redshift-architecture`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Trece fuentes de nivel 1, consultadas el 2026-10-12. §14 completo, sin montos. El SQL dice «no ejecutado». `relations` coincide con el §17. El §11 dice que BigQuery tiene otro modelo de cómputo y capacidad, y que los slices y las sort keys no tienen equivalente directo. | ninguna | — |

## `athena-serverless-queries`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Diez fuentes de nivel 1, consultadas el 2026-10-12. §14 completo, sin montos. El mínimo de 10 MB por consulta está en *Amazon Athena pricing*; no hay cifras en dólares. El SQL dice «no ejecutado». `relations` coincide con el §17. El §11 dice que las tablas externas de BigQuery se consultan dentro del warehouse y se cobran con el modelo de BigQuery. | ninguna | — |

## `glue-catalog-and-etl`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Nueve fuentes de nivel 1, consultadas el 2026-10-12. §14 completo, sin montos. El mínimo de 2 DPU y las 10 DPU por defecto de un job Spark están en *AWS Glue pricing*; no hay cifras en dólares. El primer Python es el que corre la CI contra moto (`test_glue_snippet_registers_table_and_partitions_once`, `mypy --strict`). El script `awsglue` dice «no ejecutado». `relations` coincide con el §17. El §11 dice que en GCP no hay una pieza única equivalente a Glue. | ninguna | — |

## `lake-formation-permissions`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Ocho fuentes de nivel 1, consultadas el 2026-10-12. §14 completo, sin montos. No hay política IAM ejecutada: el HCL dice validado en la CI y no aplicado. `aws-iam-for-data` no tiene ficha en `d5eb9b4`; el §17 la deja como pendiente de ficha y fuera de `relations`. | ninguna | — |
| El §11 dice que Knowledge Catalog y los policy tags «son mecanismos distintos, no equivalentes», y no dice en qué difieren. Las notas de las fuentes dicen «otro modelo» y «otro mecanismo», también sin la diferencia. | media | En el §11, decir la diferencia: Lake Formation entrega credenciales temporales a los motores integrados y filtra columna, fila y celda; esas fichas de GCP gobiernan el catálogo y la columna con otro mecanismo. |

## `emr-spark-clusters`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Diez fuentes de nivel 1, consultadas el 2026-10-12. §14 completo, sin montos. La release `emr-7.14.0` en su página contiene Spark 3.5.8. El job de PySpark lo corre la CI en local (`test_emr_spark_job_rewrites_only_its_partition`), no en EMR. El Terraform dice validado y no aplicado. `relations` coincide con el §17. El §11 dice que Dataflow es un modelo Beam y no un Spark administrado. | ninguna | — |

## `kinesis-data-streams`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Diez fuentes de nivel 1, consultadas el 2026-10-12. §14 completo, sin montos. El boto3 dice ejecutado en la CI contra moto y no corrido contra AWS. El test no afirma orden. `PutRecords` en la API Reference dice que no garantiza el orden y que, para leer en el orden de escritura, hay que usar `PutRecord` al mismo shard. La ficha dice eso en el §1, el §2 y el comentario del código. `relations` coincide con el §17. El §11 dice que Pub/Sub tiene otro modelo de capacidad y de orden. | ninguna | — |
| La fila del *Document history* de Firehose, con fecha February 9, 2024, titula «Amazon Kinesis Data Firehose is now known as Amazon Data Firehose» y describe «Amazon Kinesis Data Firehose has rebranded to Amazon Data Firehose». El §1 y la nota de la fuente citan esa fila. El alias es «Amazon Kinesis Data Firehose». Kinesis Data Analytics no aparece en la ficha ni en las páginas de Managed Service for Apache Flink consultadas. | ninguna | — |

## `msk-managed-kafka`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Seis fuentes de nivel 1, consultadas el 2026-10-12. §14 completo, sin montos. El Terraform dice validado y no aplicado. La ficha dice que no hay cliente de Kafka ejecutado y que moto no simula ese plano de datos. `relations` coincide con el §17. El §11 dice que Pub/Sub no es Kafka administrado. | ninguna | — |
