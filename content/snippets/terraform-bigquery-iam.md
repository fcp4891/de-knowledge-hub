---
id: code_snippet:terraform-bigquery-iam
slug: terraform-bigquery-iam
type: code_snippet
title: Cuenta de servicio de un pipeline con permisos mínimos en Terraform
description: "Cuenta de servicio de un pipeline con concesiones IAM aditivas (recursos *_iam_member): ejecutar consultas en el proyecto, editar un dataset de BigQuery y leer un bucket, sin reemplazar las políticas existentes."
language: terraform
dialect: hcl
requirements:
  - "Terraform 1.x y el provider hashicorp/google 8.x (terraform init lo descarga)."
  - "Para aplicar: credenciales con permiso para crear cuentas de servicio y modificar las políticas IAM del proyecto, del dataset y del bucket. Para validar (terraform validate) no hacen falta credenciales."
  - "Variables project_id, dataset_id (dataset existente) y bucket (bucket existente)."
  - "El dataset no debe gestionar su acceso con google_bigquery_dataset_access ni con el campo access de google_bigquery_dataset (ver riesgos)."
classification: modern
level: intermediate
cloud: [gcp]
technologies: [terraform, gcp-iam, gcp-bigquery, gcp-cloud-storage]
tags: [terraform, iac, iam, security]
related_topics: [gcp-iam-for-data, infrastructure-as-code]
sources:
  - source: terraform-provider-google-docs
    url: https://github.com/hashicorp/terraform-provider-google/blob/main/website/docs/r/google_project_iam.html.markdown
    accessed: 2026-10-01
    page_title: "IAM policy for projects"
    note: "google_project_iam_policy es autoritativo (reemplaza la política); google_project_iam_binding es autoritativo por rol; google_project_iam_member es no autoritativo: agrega un miembro a un rol y conserva los demás. policy no se puede combinar con binding ni member; binding y member se combinan solo si no conceden el mismo rol. Argumentos: project, role, member."
  - source: terraform-provider-google-docs
    url: https://github.com/hashicorp/terraform-provider-google/blob/main/website/docs/r/bigquery_dataset_iam.html.markdown
    accessed: 2026-10-01
    page_title: "IAM policy for BigQuery Dataset"
    note: "google_bigquery_dataset_iam_member es no autoritativo (dataset_id, role, member). Estos recursos no se pueden usar junto con google_bigquery_dataset_access ni con el campo access de google_bigquery_dataset; usarlos elimina los permisos de authorized views del dataset; requieren los roles completos (roles/bigquery.dataEditor), no los legados OWNER, WRITER o READER."
  - source: terraform-provider-google-docs
    url: https://github.com/hashicorp/terraform-provider-google/blob/main/website/docs/r/storage_bucket_iam.html.markdown
    accessed: 2026-10-01
    page_title: "IAM policy for Cloud Storage Bucket"
    note: "google_storage_bucket_iam_member es no autoritativo (bucket, role, member): agrega un miembro a un rol y conserva los demás; google_storage_bucket_iam_policy no se combina con binding ni member."
  - source: terraform-provider-google-docs
    url: https://github.com/hashicorp/terraform-provider-google/blob/main/website/docs/r/google_service_account.html.markdown
    accessed: 2026-10-01
    page_title: "google_service_account"
    note: "google_service_account: account_id obligatorio (6 a 30 caracteres, RFC1035; cambiarlo crea otra cuenta), display_name y description opcionales; exporta email y member con la forma serviceAccount:{email}."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/access-control
    accessed: 2026-10-01
    page_title: "BigQuery IAM roles and permissions"
    note: "roles/bigquery.jobUser permite ejecutar consultas y solo se concede en proyectos, carpetas u organizaciones; roles/bigquery.dataEditor sobre un dataset permite modificar sus tablas."
  - source: gcp-cloud-storage-docs
    url: https://docs.cloud.google.com/storage/docs/access-control/iam-roles
    accessed: 2026-10-01
    page_title: "IAM roles for Cloud Storage"
    note: "roles/storage.objectViewer permite ver y listar objetos; se concede como mínimo sobre el bucket."
relations:
  - type: IMPLEMENTS
    target: gcp-iam-for-data
    note: Cuenta de servicio por pipeline y roles predefinidos en el recurso más específico.
  - type: IMPLEMENTS
    target: infrastructure-as-code
    note: Concesiones declaradas como código, aditivas.
created_at: 2026-10-01
updated_at: 2026-10-13
last_verified: 2026-10-04
verification_status: verified
---

## 1. Qué resuelve

Da a un pipeline exactamente los permisos que necesita y nada más: una cuenta de servicio propia que puede ejecutar consultas en el proyecto, editar las tablas de un dataset y leer los archivos de un bucket. Usa recursos IAM **de miembro**, que según el provider son no autoritativos: agregan la concesión y conservan las demás, así que no borran permisos de otros equipos. Implementa `gcp-iam-for-data`.

## 2. Código

```hcl
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 8.0"
    }
  }
}

variable "project_id" {
  type = string
}

variable "dataset_id" {
  type        = string
  description = "Dataset existente que el pipeline escribe."
}

variable "bucket" {
  type        = string
  description = "Bucket existente que el pipeline lee."
}

provider "google" {
  project = var.project_id
}

resource "google_service_account" "pipeline_ventas" {
  account_id   = "pipeline-ventas"
  display_name = "Pipeline de ventas"
}

# Ejecutar consultas: jobUser solo se concede a nivel de proyecto (o carpeta u organización).
resource "google_project_iam_member" "job_user" {
  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = google_service_account.pipeline_ventas.member
}

# Editar las tablas de un solo dataset, no de todo el proyecto.
resource "google_bigquery_dataset_iam_member" "data_editor" {
  dataset_id = var.dataset_id
  role       = "roles/bigquery.dataEditor"
  member     = google_service_account.pipeline_ventas.member
}

# Leer los objetos de un solo bucket.
resource "google_storage_bucket_iam_member" "object_viewer" {
  bucket = var.bucket
  role   = "roles/storage.objectViewer"
  member = google_service_account.pipeline_ventas.member
}
```

## 3. Cómo funciona

- `google_service_account` crea la identidad del pipeline; su atributo `member` ya tiene la forma `serviceAccount:{email}`.
- Cada `*_iam_member` agrega **un** miembro a **un** rol en **un** recurso y conserva los demás miembros y roles: es la variante no autoritativa del provider. Las variantes `*_iam_policy` (reemplazan toda la política) y `*_iam_binding` (autoritativa para un rol) podrían borrar concesiones de otros.
- Los roles van al recurso más específico donde se pueden conceder: `jobUser` al proyecto (no se concede más abajo), `dataEditor` al dataset y `objectViewer` al bucket.

Es **idempotente**: un segundo `apply` sin cambios no modifica nada.

## 4. Cuándo usarlo

- Al crear la identidad de un pipeline nuevo.
- Cuando la infraestructura IAM la gestionan varios equipos y nadie debe reemplazar la política completa.

## 5. Cuándo no usarlo

- Si el acceso al dataset se gestiona con `google_bigquery_dataset_access` o con el campo `access` del dataset: el provider indica que se pelean por la política; hay que elegir un solo mecanismo.
- Si el dataset usa authorized views: según el provider, estos recursos eliminan esos permisos; corresponde `google_bigquery_dataset_access`.
- Si se quiere que Terraform sea la única fuente de verdad de todos los miembros de un rol: corresponde `*_iam_binding`, sabiendo que es autoritativo.

## 6. Riesgos

- **Mezclar variantes:** `*_iam_policy` no se combina con `binding` ni `member`; `binding` y `member` solo si no conceden el mismo rol. Combinarlos mal produce cambios que se revierten entre sí en cada `apply`.
- **Authorized views:** los recursos IAM de dataset eliminan los permisos de authorized views; revisar el dataset antes de aplicar.
- **Seguridad:** la cuenta que aplica esta configuración necesita permiso para modificar políticas IAM; es una cuenta privilegiada y debe ser solo la del pipeline de despliegue.
- **Costo:** `jobUser` permite ejecutar consultas que se facturan al proyecto; darlo solo a pipelines que deben consumir ese presupuesto.

## 7. Requisitos y cómo ejecutarlo

Ver `requirements` en el encabezado. Validar sin credenciales con `terraform init -backend=false` y `terraform validate` (la CI lo hace en cada push). Aplicar con `terraform plan -var project_id=MI_PROYECTO -var dataset_id=ventas -var bucket=miempresa-lake-raw` y `terraform apply` del plan revisado.

## 8. Conceptos relacionados

- `gcp-iam-for-data`: el patrón que implementa.
- `infrastructure-as-code`: las concesiones como código.

## 9. Fuentes

- HashiCorp: documentación de `google_project_iam`, `google_bigquery_dataset_iam`, `google_storage_bucket_iam` y `google_service_account` (repositorio oficial del provider).
- Google Cloud: *BigQuery IAM roles and permissions* e *IAM roles for Cloud Storage*.

El detalle está en `sources` del encabezado.

## 10. Historial de cambios

- 2026-10-01: creación (A-F3.2, lote 4), tras la revisión B-F3.1 del lote 4.
- 2026-10-04: `verification_status: verified` (revisión B-F3.2 de `docs/reviews/snippets-2.md` aprobada, sin cambios pedidos; sin VERIFY pendientes).
- 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
