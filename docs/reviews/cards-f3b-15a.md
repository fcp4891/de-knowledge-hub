# Revisión B-F3.1 · lote F3b-15a

Rama `b/f3b-review-15a`, creada desde `origin/main` (`c249b64`). El pedido está en `docs/status/lane-a.md`. Fichas: `data-quality-dimensions`, `schema-validation`, `custom-data-validators` y `quality-gate`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Sin hallazgos de contenido. Las seis dimensiones salen del marco de GOV.UK, cada una con su definición. Knowledge Catalog, Glue y Purview quedan en tablas, con la página de cada lado. | ninguna | — |
| En `spark-structured-streaming`, el diff de la nota de EMR también cambia la fecha del §12 (`consultado el 2026-10-12` pasa a `2026-10-20`). La versión sigue siendo Spark 3.5.8-amzn-0. | baja | Dejar la fecha: es la de la misma consulta que la nota. |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 512 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Los avisos son de 14b.

## Comprobaciones

```
== data-quality-dimensions
rels 5 dups []
missing17 []
sec14 True
titles 4 empty 0
== schema-validation
rels 7 dups []
missing17 []
sec14 True
titles 6 empty 0
== custom-data-validators
rels 6 dups []
missing17 []
sec14 True
titles 5 empty 0
== quality-gate
rels 8 dups []
missing17 []
sec14 True
titles 8 empty 0
```

Las frases que las fichas dicen impresas están en `tests/test_quality_snippets.py`:

```
"completitud: 4/5 = 80%", "unicidad: 4/5 = 80%", "validez: 3/5 = 60%",
"consistencia: 3/4 = 75%", "exactitud: 2/4 = 50%", "oportunidad: 4/5 = 80%"
"P1: ok", "P2: $.moneda enum; $.monto minimum", "P3: $ additionalProperties",
"P4: $ required; $.fecha format", "2026-02-30 sin format_checker: válido=True",
"2026-02-30 con format_checker: válido=False"
"rechazado E2: Value error, región desconocida: oeste",
"rechazado E3: Value error, la entrega es anterior al pedido",
"ids únicos: 0.25 (umbral 0.00) -> ERROR", "entregas de más de 7 días: 0.75 (umbral 0.25) -> WARN"
"lote-1: publicado {'norte': 45, 'sur': 10}"
"lote-2: BLOQUEADO (rechazos 2/3); se mantiene lo publicado"
```

`schema-validation` no corre `mypy`: la ficha lo dice. Las otras tres sí.

*The Government Data Quality Framework* (H1 igual al `page_title`): «There are six core data quality dimensions, as defined by DAMA UK». Completeness, Uniqueness, Consistency, Timeliness, Validity y Accuracy están definidas en esa página. La fuente es Nivel 4 y la ficha la usa para las dimensiones, no para un producto.

Knowledge Catalog lista siete: Freshness, Volume, Completeness, Validity, Consistency, Accuracy y Uniqueness. Freshness «measures when the data was last updated»; Volume «measures whether all of the expected data is present». La nota de nombres propios está: «You can create a custom dimension name when you use the gcloud CLI or the REST API», con el ejemplo timeliness. DQDL lista tipos de regla (`IsComplete`, `IsUnique`, `CustomSQL`, `DataFreshness`…) y la página no usa la palabra dimension. Purview nombra completeness, consistency, conformity, accuracy, freshness y uniqueness; no aparecen validity ni timeliness.

`format` en el draft 2020-12: «MUST be disabled by default». jsonschema: «If unprovided, no format validation is done, and the presence of format within schemas is strictly informational». Glue Schema Registry: «Draft-04, Draft-06, and Draft-07» con Everit, y la página no nombra 2020-12. Event Hubs: «Schema evolution is supported for Avro schema format only» y «compatibility modes at the schema group level». Pub/Sub: «Pub/Sub does not validate the default values».

El gate de Glue filtra `DataQualityEvaluationResult == "Passed"` y escribe esas filas en S3 (`#Write the Passed records to the destination`). Knowledge Catalog y Purview describen escaneos, puntajes y alertas. La columna emr-7.14.0 de la página, el 2026-10-20, sigue con Spark `3.5.8-amzn-0`, Hadoop `3.4.2-amzn-2`, Iceberg `1.10.1-amzn-1`, Delta `3.3.2-amzn-3` y Hudi `1.0.2-amzn-3`, como la nota.

Los `page_title` coinciden con el `h1` (en Google, sin el aviso de collections; en jsonschema, sin `¶`).

## Diff de las fichas verified

`git diff 8298b17^..8298b17` en las dos notas de EMR, y `git diff a0db1ba^..a0db1ba -- content/concepts/data-reconciliation.md`. `azure-databricks-lakehouse` y `data-reconciliation` solo cambian la nota o la relación, el §17 y el historial (y `accessed` de la cita de EMR). `spark-structured-streaming` además mueve la fecha del §12. `dbt-core-concepts` es del lote 15b.

```diff
diff --git a/content/concepts/azure-databricks-lakehouse.md b/content/concepts/azure-databricks-lakehouse.md
index 159db94..9b6264b 100644
--- a/content/concepts/azure-databricks-lakehouse.md
+++ b/content/concepts/azure-databricks-lakehouse.md
@@ -57,9 +57,9 @@ sources:
     note: "Understanding how to create and work with Amazon EMR clusters: un clúster es un conjunto de instancias de EC2; cada instancia es un nodo con un rol (tipo de nodo) y EMR instala en cada tipo los componentes que le corresponden en una aplicación distribuida como Hadoop."
   - source: aws-emr-docs
     url: https://docs.aws.amazon.com/emr/latest/ReleaseGuide/emr-7140-release.html
-    accessed: 2026-10-12
+    accessed: 2026-10-20
     page_title: "Amazon EMR release 7.14.0"
-    note: "Amazon EMR release 7.14.0: incluye Spark 3.5.8-amzn-0, Hadoop 3.4.2, Iceberg 1.10.1, Delta 3.3.2 y Hudi 1.0.2, entre otras aplicaciones."
+    note: "Amazon EMR release 7.14.0 (consultada el 2026-10-20), columna emr-7.14.0 de la tabla de versiones de aplicaciones: AWS SDK for Java 2.44.5, 1.12.797; Python 3.9, 3.11; Scala 2.12.18; AmazonCloudWatchAgent 1.300032.2-amzn-0; Delta 3.3.2-amzn-3; Flink 1.20.0-amzn-8; Ganglia -; HBase 2.6.4-amzn-2; HCatalog 3.1.3-amzn-24; Hadoop 3.4.2-amzn-2; Hive 3.1.3-amzn-24; Hudi 1.0.2-amzn-3; Hue 4.11.0; Iceberg 1.10.1-amzn-1; JupyterEnterpriseGateway 2.6.0; JupyterHub 1.5.0; Livy 0.8.0-incubating; MXNet -; Mahout -; Oozie 5.2.1; Phoenix 5.3.0; Pig 0.17.0; Presto 0.287-amzn-8; Spark 3.5.8-amzn-0; Sqoop -; TensorFlow 2.19.0; Tez 0.10.2-amzn-22; Trino (PrestoSQL) 479-amzn-2; Zeppelin 0.11.1; ZooKeeper 3.9.3-amzn-7."
   - source: aws-lake-formation-docs
     url: https://docs.aws.amazon.com/lake-formation/latest/dg/what-is-lake-formation.html
     accessed: 2026-10-02
@@ -324,3 +324,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-13: creación (lote F3b-10a).
 - 2026-10-14: revisión B-F3.1 del lote F3b-10a aplicada (docs/reviews/cards-f3b-10a.md): filas aprobadas sin cambios en esta ficha.
 - 2026-10-14: `verification_status: verified` (sin VERIFY pendientes).
+- 2026-10-20: lote F3b-15a: la nota de *Amazon EMR release 7.14.0* cita la columna emr-7.14.0 completa, con los sufijos de la tabla (consultada el 2026-10-20); antes recortaba la lista.
diff --git a/content/concepts/spark-structured-streaming.md b/content/concepts/spark-structured-streaming.md
index 2a86d86..1713603 100644
--- a/content/concepts/spark-structured-streaming.md
+++ b/content/concepts/spark-structured-streaming.md
@@ -37,9 +37,9 @@ sources:
     note: "Compare Managed Service for Apache Spark serverless and cluster deployments: Managed Service for Apache Spark incluye las opciones antes llamadas Dataproc on Compute Engine (despliegue en clúster) y Google Cloud Serverless for Apache Spark (despliegue serverless); la página compara ambos despliegues."
   - source: aws-emr-docs
     url: https://docs.aws.amazon.com/emr/latest/ReleaseGuide/emr-7140-release.html
-    accessed: 2026-10-12
+    accessed: 2026-10-20
     page_title: "Amazon EMR release 7.14.0"
-    note: "Amazon EMR release 7.14.0: incluye Spark 3.5.8-amzn-0, Hadoop 3.4.2, Iceberg 1.10.1, Delta 3.3.2 y Hudi 1.0.2, entre otras aplicaciones."
+    note: "Amazon EMR release 7.14.0 (consultada el 2026-10-20), columna emr-7.14.0 de la tabla de versiones de aplicaciones: AWS SDK for Java 2.44.5, 1.12.797; Python 3.9, 3.11; Scala 2.12.18; AmazonCloudWatchAgent 1.300032.2-amzn-0; Delta 3.3.2-amzn-3; Flink 1.20.0-amzn-8; Ganglia -; HBase 2.6.4-amzn-2; HCatalog 3.1.3-amzn-24; Hadoop 3.4.2-amzn-2; Hive 3.1.3-amzn-24; Hudi 1.0.2-amzn-3; Hue 4.11.0; Iceberg 1.10.1-amzn-1; JupyterEnterpriseGateway 2.6.0; JupyterHub 1.5.0; Livy 0.8.0-incubating; MXNet -; Mahout -; Oozie 5.2.1; Phoenix 5.3.0; Pig 0.17.0; Presto 0.287-amzn-8; Spark 3.5.8-amzn-0; Sqoop -; TensorFlow 2.19.0; Tez 0.10.2-amzn-22; Trino (PrestoSQL) 479-amzn-2; Zeppelin 0.11.1; ZooKeeper 3.9.3-amzn-7."
   - source: aws-emr-docs
     url: https://aws.amazon.com/emr/pricing/
     accessed: 2026-10-12
@@ -225,7 +225,7 @@ En AWS, Spark corre en **Amazon EMR**. Según *Amazon EMR release 7.14.0* y *Ama
 
 | | Spark 4.2.0 (esta ficha) | Amazon EMR |
 |---|---|---|
-| Versión | Spark 4.2.0 | La release 7.14.0 incluye Spark 3.5.8-amzn-0 (consultado el 2026-10-12): conviene revisar la versión antes de copiar código |
+| Versión | Spark 4.2.0 | La release 7.14.0 incluye Spark 3.5.8-amzn-0 (consultado el 2026-10-20): conviene revisar la versión antes de copiar código |
 | Cobro (consultado el 2026-10-12) | — | Por opción de despliegue (EC2, EKS, Serverless), además de las instancias o recursos usados |
 
 ## 13. Azure
@@ -298,3 +298,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-19: §10: el ejemplo fija la fecha de modificación de cada archivo, porque la fuente procesa en ese orden y la watermark depende de él.
 - 2026-10-20: revisión B-F3.1 del lote F3b-14b aplicada (docs/reviews/cards-f3b-14b.md): sin hallazgos en esta ficha; sin cambios.
 - 2026-10-20: `verification_status: verified` (sin VERIFY pendientes).
+- 2026-10-20: lote F3b-15a: la nota de *Amazon EMR release 7.14.0* cita la columna emr-7.14.0 completa, con los sufijos de la tabla (consultada el 2026-10-20); antes recortaba la lista.
diff --git a/content/concepts/data-reconciliation.md b/content/concepts/data-reconciliation.md
index 2d3832c..52b4c64 100644
--- a/content/concepts/data-reconciliation.md
+++ b/content/concepts/data-reconciliation.md
@@ -70,6 +70,9 @@ relations:
   - type: RELATED_TO
     target: sql-quality-checks
     note: "Controles de calidad en SQL."
+  - type: RELATED_TO
+    target: data-quality-dimensions
+    note: Completitud y exactitud, dos de las dimensiones que mide.
 created_at: 2026-09-30
 updated_at: 2026-10-13
 last_verified: 2026-10-01
@@ -264,7 +267,7 @@ Los conteos y sumas son baratos, pero no detectan cambios que se compensan. Los
 - `backfill`: cada período reprocesado se reconcilia.
 - `change-data-capture`: la replicación por CDC se valida contra el origen.
 - Con ficha: `sql-quality-checks`, `change-detection`.
-- Del blueprint, pendiente de ficha: `data-quality-dimensions`.
+- `data-quality-dimensions`: la reconciliación mide completitud y exactitud contra el origen.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -297,3 +300,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-07: revisión de los cambios mínimos de NULL aplicada (docs/reviews/fixes-null-concat.md, aprobada por Felipe): la huella pasa de `CONCAT` con marcador `'\\N'` a `FARM_FINGERPRINT(TO_JSON_STRING(STRUCT(...)))`, respaldado por la tabla de codificaciones JSON de BigQuery (NULL → `null`; texto entre comillas con escape), que elimina la ambigüedad del marcador y la del separador. Sigue `verified`. §10 publica el caso completo en PostgreSQL (dos lados, conteo, suma, tres huellas y `!=` frente a `IS DISTINCT FROM`) con `jsonb_build_array`, el equivalente documentado.
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
 - 2026-10-14: lote F3b-rel (regla del §17): relations incluye `change-detection`, `sql-quality-checks`.
+- 2026-10-20: lote F3b-15a (regla del §17): relations y el §17 enlazan `data-quality-dimensions`, que ya tiene ficha; antes figuraba como pendiente de ficha.
```
