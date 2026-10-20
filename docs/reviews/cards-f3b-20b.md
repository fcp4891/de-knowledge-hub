# Revisión B-F3.1 · lote F3b-20b

Rama `b/f3b-review-20b`, creada desde `origin/main` (`49a2a45`). El pedido está en `docs/status/lane-a.md`. Fichas: `open-table-formats`, `table-format-comparison` y `dbt-core-concepts`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| En el §12 de `table-format-comparison`, las celdas de Athena para Delta y Hudi dicen que las páginas no lo tratan. *Query Apache Iceberg tables* nombra Apache Hudi y Linux Foundation Delta Lake: Lake Formation no administra permisos de `VACUUM`, `MERGE`, `UPDATE` ni `OPTIMIZE` sobre esos formatos, y el `ALTER` de la propiedad de Glacier se comporta distinto en Hudi. | media | Decir lo que dice esa página. S3 Tables sigue sin nombrar Delta ni Hudi. |
| En el §13, la celda de Azure Databricks para Iceberg dice que las páginas no lo tratan. *What is Delta Lake in Azure Databricks?* habla de clonar y convertir tablas Iceberg a Delta, y de seguir cambios por fila en una tabla Iceberg v3. | media | Citar esa diferencia. Fabric no nombra Iceberg en su página. |
| El §11 de `dbt-core-concepts` presenta la tabla como según *Dataform overview*, *Set dependencies* y *Test data quality*. La columna de dbt (adaptador, BigQuery Generally available, `ref()`, data tests) sale de páginas de dbt que el párrafo no nombra. | media | Nombrar en ese párrafo *Supported data platforms*, *About ref function* y *Add data tests to your DAG*. |
| El §5 y el diagrama de `table-format-comparison` nombran Trino y Flink para Iceberg, y Flink para Hudi. Esta ficha no cita la introducción de Iceberg, que es la página que lista Spark, Trino, PrestoDB, Flink, Hive e Impala (`open-table-formats`). | media | Citar esa página en esta ficha, o quitar Trino y Flink del §5 y del diagrama. |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 500 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Los avisos son de 14b.

## Comprobaciones del pedido

```
== open-table-formats
rels ['lakehouse', 'parquet-format', 'acid', 'schema-evolution', 'data-lake', 'table-format-comparison', 'bigquery-biglake-tables']
dups []
missing17 []
== table-format-comparison
rels ['open-table-formats', 'partitioning', 'change-data-capture', 'lakehouse', 'azure-databricks-lakehouse', 'bigquery-biglake-tables']
dups []
missing17 []
== dbt-core-concepts
rels ['data-transformation', 'materialization-strategies', 'dataform-workflows', 'postgresql-for-data-engineers', 'sql-quality-checks']
dups []
missing17 []
pendiente True
dbt-core==1.12.6 adr True req True
dbt-postgres==1.11.0 adr True req True
pyiceberg[sql-sqlite,pyarrow,pyiceberg-core]==0.12.0 adr True req True
delta-spark in req False
```

`dbt-tests` está en el §17 como «pendiente de ficha» y no hay archivo `content/concepts/dbt-tests.md`. No entra en `relations`.

La comparación abre con «no son equivalentes». En el §4, las celdas de partición y de cambio de partición de Delta, y varias de Hudi, dicen que las páginas citadas no lo describen. Delta y Hudi van en un bloque marcado «no ejecutado»: la tabla de *Releases* lista Delta 4.2.x y 4.3.x con Spark 4.0.x y 4.1.x, y no lista Spark 4.2. El test ejecuta PyIceberg (snapshots, time travel, evolución y particionado oculto) y `dbt build`.

*What is dbt?* dice: «the current Rust-based version generation is v2», «v2 is the current generation of dbt and the default when you install it» y «v1 The original Python-based generation of dbt, still maintained as dbt v1». La ficha lo distingue así. ADR-018 y `requirements-snippets.txt` coinciden en dbt-core 1.12.6, dbt-postgres 1.11.0 y pyiceberg 0.12.0 con los extras `sql-sqlite`, `pyarrow` y `pyiceberg-core`. `delta-spark` no está en el requirements.

§14 trae Seguridad, Observabilidad y Costo. Los `page_title` coinciden con el `h1` (en Iceberg, sin el icono de enlace; en PyIceberg, sin `¶`; en Google, sin el aviso de collections).

## Diff de bigquery-biglake-tables

`git diff 20afa0e..12cee3c -- content/concepts/bigquery-biglake-tables.md`. Solo la relación, el §17 y una línea de historial.

```diff
diff --git a/content/concepts/bigquery-biglake-tables.md b/content/concepts/bigquery-biglake-tables.md
index 6ce93e3..f292255 100644
--- a/content/concepts/bigquery-biglake-tables.md
+++ b/content/concepts/bigquery-biglake-tables.md
@@ -59,6 +59,9 @@ relations:
   - type: RELATED_TO
     target: bigquery-policy-tags
     note: Seguridad por columna y enmascaramiento sobre la tabla.
+  - type: RELATED_TO
+    target: open-table-formats
+    note: "Iceberg es uno de los formatos de tabla abiertos."
 created_at: 2026-10-11
 updated_at: 2026-10-13
 last_verified: 2026-10-11
@@ -257,7 +260,7 @@ BigLake da seguridad fina sobre datos que siguen en el lake, a cambio de operar
 - `bigquery-materialized-views`: vistas materializadas sobre BigLake.
 - `bigquery-security`: IAM, vistas autorizadas y seguridad por fila sobre la tabla.
 - `bigquery-policy-tags`: seguridad por columna y enmascaramiento sobre la tabla.
-- Del blueprint, pendiente de ficha: `open-table-formats`.
+- `open-table-formats`: qué es un formato de tabla abierto, como Iceberg.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -285,3 +288,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-11: revisión B-F3.1 del lote F3b-08a aplicada (docs/reviews/cards-f3b-08a.md), regla del §17: relations incluye `bigquery-security`, `bigquery-policy-tags`, que el §17 nombra; §17 enlaza las fichas que ya existen.
 - 2026-10-11: `verification_status: verified` (sin VERIFY pendientes).
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
+- 2026-10-20: lote F3b-20b (regla del §17): relations y el §17 enlazan `open-table-formats`, que ya tiene ficha; antes figuraba como pendiente de ficha.
```
