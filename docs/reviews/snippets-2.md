# Revisión B-F3.2 · Snippets 2

Snippets en `content/snippets/`. Carril B no los edita. Todas las filas quedan en **pendiente**. Los dos están en `review_required`.

Los 2: `terraform-gcs-bucket` y `terraform-bigquery-iam`.

El criterio es el de la plantilla: el código se puede ejecutar, o `requirements` dice exactamente qué hace falta (proyecto, variables, versión, comando).

## Atención pedida

| Criterio | Hallazgo | Estado |
|---|---|---|
| Mínimo privilegio | `terraform-bigquery-iam` crea una cuenta de servicio y concede `roles/bigquery.jobUser` en el proyecto (el nivel más bajo donde ese rol existe), `roles/bigquery.dataEditor` en un dataset y `roles/storage.objectViewer` en un bucket. No usa Owner ni Editor. | pendiente |
| Recursos IAM non-authoritative | El código usa `google_project_iam_member`, `google_bigquery_dataset_iam_member` y `google_storage_bucket_iam_member`. El texto dice que cada uno agrega un miembro y conserva el resto, y distingue `*_iam_policy` y `*_iam_binding`. | pendiente |
| Authorized views y `google_bigquery_dataset_access` | `requirements`, el «cuándo no» y los riesgos dicen que esos recursos IAM no se mezclan con `google_bigquery_dataset_access` ni con el campo `access`, y que eliminan los permisos de authorized views. La nota del provider dice lo mismo y apunta a `google_bigquery_dataset_access` para conservarlas. | pendiente |
| Costos del ciclo de vida | En `terraform-gcs-bucket`, a los 90 días el objeto pasa a Coldline y a los 1095 se borra. Esos 1095 dejan más de 90 días desde el cambio de clase. §5 y §6 avisan que Coldline tiene duración mínima de 90 días y cobra la recuperación, y que leer seguido después de los 90 días sale más caro. La nota de clases de almacenamiento dice lo mismo. | pendiente |

## `terraform-gcs-bucket`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Código ejecutable o requisitos exactos | Pide Terraform 1.x, el provider `hashicorp/google` 8.x, `project_id`, un prefijo que haga únicos los nombres, y la diferencia entre `terraform validate` (sin credenciales) y `apply`. El nombre en minúsculas y el tope de 63 caracteres están en la nota del provider. | pendiente |
| Idempotencia | Un segundo `apply` sin cambios no modifica lo que ya coincide. Si el nombre global ya existe, el `apply` falla; el texto lo dice y no llama idempotente a `gcloud storage buckets create`. | pendiente |
| Errores técnicos | No marco un error. Acceso uniforme, prevención de acceso público, soft delete de 30 días (el rango de la nota es 7 a 90) y `force_destroy = false` coinciden con la nota de `google_storage_bucket`. El bucket del state lleva versionado y el texto dice crearlo antes de usarlo como backend. | pendiente |

## `terraform-bigquery-iam`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Código ejecutable o requisitos exactos | Pide Terraform 1.x, el provider 8.x, credenciales que puedan crear la cuenta y tocar las tres políticas, y `project_id`, `dataset_id` y `bucket` de recursos que ya existen. `project` va explícito en `google_project_iam_member`; en el dataset el provider usa el proyecto configurado. | pendiente |
| Idempotencia | «Un segundo `apply` sin cambios no modifica nada» se dice de Terraform con el recurso ya en el state. No afirma que `add-iam-policy-binding` sea idempotente. | pendiente |
| Errores técnicos | No marco un error. Los tres recursos son la variante `*_iam_member`. La advertencia de authorized views está en el requisito, en el «cuándo no» y en los riesgos, y coincide con la documentación del provider. | pendiente |
