# Revisión B-F3.1 · Lote F3b-08a

Fichas en `content/concepts/`, commit `0b2f824` (sin cambios en `e1b8211`). Carril B no las edita. Las ocho siguen en `review_required`. No hay comentarios `VERIFY`.

Las 8: `bigquery-architecture`, `bigquery-sql-dialect`, `bigquery-slots`, `bigquery-query-optimization`, `bigquery-materialized-views`, `bigquery-external-tables`, `bigquery-biglake-tables` y `bigquery-incremental-models`.

El 2026-10-11 contrasté la página de ediciones y la de Apache Iceberg managed tables. No reejecuté el SQL, el Python ni Terraform. `make validate` no corrió: en este worktree no hay `.venv`.

## Comprobación por comando

Fuentes, §14, SQL y relaciones (salida resumida del script sobre el frontmatter y el §17):

```text
Las 8 fuentes son gcp-bigquery-docs, authority_level 1, official_docs, accessed 2026-10-11.
has N1-2: True en las 8.
s14 Seguridad, Observabilidad y Costo: True en las 8.
related_topics ausentes en relations: ninguno.
missing entity (related_topics y relations): ninguno.
```

Bloques `sql` (grep ` ```sql `):

```text
bigquery-sql-dialect.md:151: -- BigQuery, GoogleSQL (no ejecutado: requiere un proyecto de GCP; ...)
bigquery-query-optimization.md:155: -- BigQuery, GoogleSQL (no ejecutado: requiere un proyecto de GCP). ...
bigquery-materialized-views.md:156: -- BigQuery, GoogleSQL (no ejecutado: requiere un proyecto de GCP). ...
bigquery-external-tables.md:180: -- BigQuery, GoogleSQL (no ejecutado: requiere un proyecto de GCP). ...
bigquery-incremental-models.md:142: -- BigQuery, GoogleSQL (no ejecutado: requiere un proyecto de GCP). ...
```

`bigquery-architecture`, `bigquery-slots` y `bigquery-biglake-tables` no tienen bloque `sql`.

Slugs del §17 que el script marcó fuera de `relations`:

```text
finops-for-data: NO
open-table-formats: NO
bigquery-security: content/concepts/bigquery-security.md
bigquery-policy-tags: content/concepts/bigquery-policy-tags.md
oltp-vs-olap: content/concepts/oltp-vs-olap.md
bigquery-clustering: content/concepts/bigquery-clustering.md
sql-quality-checks: content/concepts/sql-quality-checks.md
cloud-warehouse-optimization: content/concepts/cloud-warehouse-optimization.md
bigquery-cost-model: content/concepts/bigquery-cost-model.md
incremental-pipelines: content/concepts/incremental-pipelines.md
upsert: content/concepts/upsert.md
backfill: content/concepts/backfill.md
```

`make validate` en este worktree:

```text
NO_VENV
```

## `bigquery-architecture`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Seis fuentes Nivel 1 (`gcp-bigquery-docs`, `accessed: 2026-10-11`). §14 con las tres viñetas. El Python dice ejecutado y `mypy --strict`. No hay bloque GoogleSQL. | ninguna | — |
| El §17 nombra `oltp-vs-olap`, `bigquery-clustering`, `bigquery-materialized-views`, `bigquery-external-tables` y `bigquery-biglake-tables`. Esas fichas existen y no están en `relations`. | media | Agregar esas cinco relaciones. |

## `bigquery-sql-dialect`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Seis fuentes Nivel 1. §14 completo. El bloque GoogleSQL dice «no ejecutado» en el comentario y otra vez después del bloque. GoogleSQL y legacy SQL se atribuyen a *Introduction to SQL in BigQuery* y *Migrating to GoogleSQL*. | ninguna | — |
| El §17 nombra `bigquery-query-optimization`, `bigquery-incremental-models` y `sql-quality-checks`. Esas fichas existen y no están en `relations`. | media | Agregar esas tres relaciones. |

## `bigquery-slots`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| La tabla del §11 dice fecha 2026-10-11 y no copia montos. El script marca `6.0` y `0.05` como ilustrativos, en el comentario y debajo del bloque. SLO, 1.600 slots, descuentos del 20 % y del 40 %, BI Engine y recuperación ante desastres coinciden con *Understand BigQuery editions*. En «Máximo por reserva», on-demand dice «sin reservas». Esa página pone Cuota en el tamaño máximo de reserva, y «No access to reservations» en otra fila (máximo de reservas por proyecto de administración). La fila de cobro pone el mínimo de 1 minuto solo en Standard; la página lo pone en las tres ediciones, con fluid scaling opcional. La nota de fuente ya dice las tres. | alta | En «Máximo por reserva», on-demand: Cuota. «Sin reservas» va en la fila del máximo de reservas por proyecto. En el cobro de las tres ediciones: mínimo de 1 minuto por defecto y fluid scaling opcional. |
| El §17 nombra `cloud-warehouse-optimization`, que tiene ficha y no está en `relations`. `finops-for-data` no tiene ficha; el §17 lo deja pendiente. | media | Agregar la relación a `cloud-warehouse-optimization`. |

## `bigquery-query-optimization`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Cinco fuentes Nivel 1. §14 completo. El GoogleSQL dice «no ejecutado». Las prácticas de cómputo se atribuyen a *Optimize query computation*. | ninguna | — |
| El §17 nombra `bigquery-cost-model`, `bigquery-clustering` y `bigquery-materialized-views`. Esas fichas existen y no están en `relations`. | media | Agregar esas tres relaciones. |

## `bigquery-materialized-views`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Tres fuentes Nivel 1. §14 completo. El GoogleSQL dice «no ejecutado». El Terraform dice validado en la CI y no aplicado. | ninguna | — |
| El §17 nombra `bigquery-biglake-tables`. Tiene ficha y no está en `relations`. | media | Agregar esa relación. |

## `bigquery-external-tables`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Cuatro fuentes Nivel 1. §14 completo. El GoogleSQL dice «no ejecutado». El Terraform dice validado en la CI y no aplicado. | ninguna | — |
| El §17 nombra `bigquery-architecture`. Tiene ficha y no está en `relations`. | media | Agregar esa relación. |

## `bigquery-biglake-tables`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Cinco fuentes Nivel 1. §14 completo. No hay bloque GoogleSQL. El Terraform dice validado en la CI y no aplicado. La página *Apache Iceberg managed tables* abre con «Apache Iceberg managed tables (formerly BigLake tables for Apache Iceberg in BigQuery)». El §2 y el §11 citan esa página para el nombre anterior. | ninguna | — |
| El §17 llama pendientes de ficha a `bigquery-security` y `bigquery-policy-tags`. En este `main` (`e1b8211`) esas dos fichas ya existen. `open-table-formats` sigue sin ficha. | baja | Quitar «pendiente de ficha» de esas dos y agregarlas a `relations`. Dejar `open-table-formats` como pendiente. |

## `bigquery-incremental-models`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Cuatro fuentes Nivel 1. §14 completo. El GoogleSQL dice «no ejecutado». El §4 y el SQL dicen que el optimizador intenta podar, como la nota de *Update partitioned table data using DML*. El resumen lo separa de `dataform-incremental-tables`: el SQL es a mano y Dataform es la implementación de producto. | ninguna | — |
| El §17 nombra `incremental-pipelines`, `upsert`, `backfill` y `bigquery-materialized-views`. Esas fichas existen y no están en `relations`. | media | Agregar esas cuatro relaciones. |
