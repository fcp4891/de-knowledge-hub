# Revisión B-F3.1 · lote F3b-15b

Rama `b/f3b-review-15b`, creada desde `origin/main` (`c249b64`). El pedido está en `docs/status/lane-a.md`. Fichas: `dbt-tests`, `dataform-assertions`, `great-expectations-validation` y `write-audit-publish`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Sin hallazgos. Lo que las fichas dicen ejecutado está en el test. GX cita la guía y el nombre real del método en 1.24.0. Write y Audit corren; Publish no. BigQuery, Redshift y la assertion de Dataform están citados como en sus páginas. | ninguna | — |

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
== dbt-tests dups [] missing17 [] sec14 True titles 7 empty 0
== dataform-assertions dups [] missing17 [] sec14 True titles 5 empty 0
== great-expectations-validation dups [] missing17 [] sec14 True titles 8 empty 0
== write-audit-publish dups [] missing17 [] sec14 True titles 5 empty 0
```

`tests/test_quality_snippets.py` exige las frases de las fichas:

```
"build ok: False"
"relationships_stg_envios_tienda_id__id__ref_raw_tiendas_: fail (1 fallas)"
"envios_por_tienda: skipped"
"accepted_values_stg_envios_estado__entregado__en_camino: warn (1 fallas)"
"envios_lentos: warn (1 fallas)"
"unique_stg_envios_id: pass (0 fallas)"
"tablas de fallas: 5"
"filas huérfanas guardadas: [(3,)]"
"lote-1: success=False"
"expect_column_values_to_be_between [warning]: True (inesperados: 1)"
"expect_column_values_to_be_in_set [warning]: False (inesperados: 1)"
"falla más grave: warning -> publicar"
"lote-2: success=False"
"expect_column_values_to_be_unique [critical]: False (inesperados: 2)"
"falla más grave: critical -> bloquear"
"audit-1: auditoría pasa; filas en la rama: 3; filas en main: 2"
"audit-2: auditoría falla; filas en la rama: 3; filas en main: 2"
"ramas: ['audit-1', 'main']"
"montos en main: [10.0, 25.0]"
```

El test de WAP elige el bloque que empieza por `PyIceberg 0.12 y PyArrow`. El bloque de `fast_forward_branch` no se corre.

*About dbt build command*: «If model_b depends on model_a, and a unique test on model_a fails, then model_b will SKIP».

*Set dependencies*: «When workflow action B depends on workflow action A, which has assertions, the failure of the assertions of action A does not block Dataform from executing action B».

Las URLs de GX son `docs.greatexpectations.io/docs/core/…`, sin versión, con `accessed: 2026-10-20`. El registro dice: «la versión 1.x no publica URLs versionadas (ADR-019)». La página muestra «Version: 1.24.0» y nombra `get_maximum_severity_failure`. En el tag `1.24.0` del código, `expectation_validation_result.py` define `get_max_severity_failure` y no `get_maximum_severity_failure`. La ficha lo dice en el §4 y en el comentario del ejemplo. `requirements-snippets.txt` fija `great_expectations==1.24.0`.

En PyIceberg 0.12.0, `update/snapshot.py` tiene `create_branch(snapshot_id, branch_name)` y `remove_branch`; no tiene `fast_forward`. `append` acepta `branch`. *Python API* (la guía vigente) sí documenta `fast_forward_branch`, `create_branch`, `remove_branch`, `append`, `refs`, `scan` y `manage_snapshots`. El ejemplo ejecutado usa esos, más `SqlCatalog`, que está en *Getting started with PyIceberg*. El Publish queda en un bloque «no ejecutado».

BigQuery: «Iceberg managed tables don't support table copies or CREATE TABLE COPY statements», y lo mismo para `CREATE TABLE CLONE` y `CREATE SNAPSHOT TABLE`. Redshift: «The table must be using Parquet as default data format. […] The table must not enable Write-Audit-Publish (WAP)».

Las tablas de Knowledge Catalog, Glue y Purview nombran la página de cada lado y no presentan los productos como lo mismo. Los `page_title` coinciden con el `h1` (en Iceberg, sin la marca de enlace; en Google, sin el aviso de collections).

## Diff de dbt-core-concepts

`git diff c5db13b^..c5db13b -- content/concepts/dbt-core-concepts.md`. Solo la relación, el §17 y una línea de historial. Las notas de EMR 7.14.0 están en la revisión de 15a.

```diff
diff --git a/content/concepts/dbt-core-concepts.md b/content/concepts/dbt-core-concepts.md
index e77f56a..0c4d583 100644
--- a/content/concepts/dbt-core-concepts.md
+++ b/content/concepts/dbt-core-concepts.md
@@ -86,6 +86,9 @@ relations:
   - type: RELATED_TO
     target: sql-quality-checks
     note: Los data tests como controles de calidad.
+  - type: RELATED_TO
+    target: dbt-tests
+    note: Los data tests en detalle.
 created_at: 2026-10-20
 updated_at: 2026-10-20
 last_verified: 2026-10-20
@@ -303,7 +306,7 @@ dbt trae disciplina de ingeniería (versiones, grafo, tests) al SQL del warehous
 - `dataform-workflows`: Dataform en GCP.
 - `postgresql-for-data-engineers`: el warehouse del ejemplo.
 - `sql-quality-checks`: los tests como controles de calidad.
-- Del blueprint, pendiente de ficha: `dbt-tests`.
+- `dbt-tests`: los data tests de dbt, con severidad y store_failures.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -331,3 +334,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-20: creación (lote F3b-20b).
 - 2026-10-20: revisión B-F3.1 del lote F3b-20b aplicada (docs/reviews/cards-f3b-20b.md): el §11 nombra también las páginas de dbt del lado dbt.
 - 2026-10-20: `verification_status: verified` (sin VERIFY pendientes).
+- 2026-10-20: lote F3b-15b (regla del §17): relations y el §17 enlazan `dbt-tests`, que ya tiene ficha; antes figuraba como pendiente de ficha.
```
