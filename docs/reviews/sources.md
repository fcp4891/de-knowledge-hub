# Revisión B-F1.3 · Fuentes de las 9 tecnologías MVP

Alcance reducido: solo `apache-airflow`, `gcp-cloud-composer`, `gcp-bigquery`, `gcp-cloud-storage`, `gcp-pubsub`, `gcp-dataflow`, `gcp-dataform`, `python` y `terraform`. Carril B no edita `content/sources/registry.yaml`.

El registry actual (6 entradas de F0) no lista ninguna de las nueve en `technologies`. No hay fuente secundaria con nivel inflado para ellas: el hueco es la ausencia. Las URLs de abajo respondieron HTTP 200 el 2026-09-29. Las de Google son la URL final, tras la redirección desde `cloud.google.com`.

Frecuencias propuestas: la documentación de referencia, trimestral; las release notes de productos que publican seguido (GCP, Airflow, Terraform), mensual. Python cambia en ciclo anual: trimestral también en las notas de versión. Mensual en la documentación de Python, o semanal en cualquier release note, no es realista para este registro.

| Fila | Tecnología | Propuesta | Estado |
|---|---|---|---|
| 1 | Las 9 | Agregar, por tecnología, una fuente `official_docs` de nivel 1 y una `release_notes` de nivel 2. No reutilizar `microsoft-learn`, `aws-dms-docs` ni `postgresql-docs` para estos productos. | pendiente |
| 2 | `gcp-bigquery` | Nivel 1: `https://docs.cloud.google.com/bigquery/docs` (trimestral). Nivel 2: `https://docs.cloud.google.com/bigquery/docs/release-notes` (mensual). | pendiente |
| 3 | `gcp-cloud-storage` | Nivel 1: `https://docs.cloud.google.com/storage/docs` (trimestral). Nivel 2: `https://docs.cloud.google.com/storage/docs/release-notes` (mensual). | pendiente |
| 4 | `gcp-pubsub` | Nivel 1: `https://docs.cloud.google.com/pubsub/docs` (trimestral). Nivel 2: `https://docs.cloud.google.com/pubsub/docs/release-notes` (mensual). | pendiente |
| 5 | `gcp-dataflow` | Nivel 1: `https://docs.cloud.google.com/dataflow/docs` (trimestral). Nivel 2: `https://docs.cloud.google.com/dataflow/docs/release-notes` (mensual). La documentación de Apache Beam queda fuera: Beam no es tecnología MVP. | pendiente |
| 6 | `apache-airflow` | Nivel 1: `https://airflow.apache.org/docs/apache-airflow/stable/` (trimestral). Nivel 2: `https://airflow.apache.org/docs/apache-airflow/stable/release_notes.html` (mensual). No sustituye la fuente de Composer. | pendiente |
| 7 | `gcp-cloud-composer` | Nivel 1: `https://docs.cloud.google.com/composer/docs` (trimestral). Nivel 2: `https://docs.cloud.google.com/composer/docs/release-notes` (mensual). Cubre el servicio administrado, no el proyecto Airflow. | pendiente |
| 8 | `gcp-dataform` | Nivel 1: `https://docs.cloud.google.com/dataform/docs` (trimestral). Nivel 2: `https://docs.cloud.google.com/dataform/docs/release-notes` (mensual). | pendiente |
| 9 | `python` | Nivel 1: `https://docs.python.org/3/` (trimestral). Nivel 2: `https://docs.python.org/3/whatsnew/index.html` (trimestral). | pendiente |
| 10 | `terraform` | Nivel 1: `https://developer.hashicorp.com/terraform/docs` (trimestral). Nivel 2: `https://github.com/hashicorp/terraform/releases` (mensual). | pendiente |
