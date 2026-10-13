---
id: code_snippet:terraform-gcs-bucket
slug: terraform-gcs-bucket
type: code_snippet
title: Buckets de Cloud Storage para el lake y el state con Terraform
description: "Bucket raw de un data lake con acceso uniforme, prevención de acceso público, soft delete y reglas de ciclo de vida, y bucket del state de Terraform con versionado, declarados en Terraform."
language: terraform
dialect: hcl
requirements:
  - "Terraform 1.x y el provider hashicorp/google 8.x (terraform init lo descarga)."
  - "Para aplicar: un proyecto de GCP, credenciales (Application Default Credentials) y permiso para crear buckets. Para validar (terraform validate) no hacen falta credenciales."
  - "Variables project_id y prefijo; los nombres de bucket son globales, así que el prefijo debe hacerlos únicos."
classification: modern
level: basic
cloud: [gcp]
technologies: [terraform, gcp-cloud-storage]
tags: [terraform, iac, gcs, data-lake]
related_topics: [gcs-buckets-and-objects, infrastructure-as-code, terraform-state]
sources:
  - source: terraform-provider-google-docs
    url: https://github.com/hashicorp/terraform-provider-google/blob/main/website/docs/r/storage_bucket.html.markdown
    accessed: 2026-10-01
    page_title: "google_storage_bucket"
    note: "google_storage_bucket: name (minúsculas, hasta 63 caracteres) y location obligatorios; uniform_bucket_level_access (false por defecto); public_access_prevention inherited o enforced (inherited por defecto); soft_delete_policy.retention_duration_seconds entre 604800 (7 días, por defecto) y 7776000 (90 días); versioning.enabled; lifecycle_rule con action (Delete, SetStorageClass con storage_class) y condition (por ejemplo age en días; con varias condiciones deben cumplirse todas); force_destroy false por defecto: borrar un bucket con objetos falla."
  - source: gcp-cloud-storage-docs
    url: https://docs.cloud.google.com/storage/docs/uniform-bucket-level-access
    accessed: 2026-10-01
    page_title: "Uniform bucket-level access"
    note: "Con acceso uniforme a nivel de bucket, las ACL se desactivan y solo IAM concede acceso al bucket y sus objetos."
  - source: gcp-cloud-storage-docs
    url: https://docs.cloud.google.com/storage/docs/object-versioning
    accessed: 2026-10-01
    page_title: "Object Versioning"
    note: "Object Versioning conserva versiones no actuales al reemplazar o borrar; Google recomienda soft delete para protegerse de borrados accidentales o maliciosos."
  - source: gcp-cloud-storage-docs
    url: https://docs.cloud.google.com/storage/docs/storage-classes
    accessed: 2026-10-01
    page_title: "Storage classes"
    note: "Coldline tiene duración mínima de 90 días y cargos de recuperación."
  - source: terraform-docs
    url: https://developer.hashicorp.com/terraform/language/backend/gcs
    accessed: 2026-10-01
    page_title: "gcs"
    note: "El backend gcs requiere que el bucket exista antes y recomienda activar Object Versioning para recuperar el state."
relations:
  - type: IMPLEMENTS
    target: gcs-buckets-and-objects
    note: Bucket con acceso uniforme, prevención de acceso público, soft delete y ciclo de vida.
  - type: IMPLEMENTS
    target: infrastructure-as-code
    note: Los buckets declarados como código y revisados.
  - type: RELATED_TO
    target: terraform-state
    note: El segundo bucket es el backend del state, con versionado.
created_at: 2026-10-01
updated_at: 2026-10-13
last_verified: 2026-10-04
verification_status: verified
---

## 1. Qué resuelve

Declara como código los dos buckets que casi toda plataforma de datos en Google Cloud necesita: la capa raw del lake, con las protecciones que recomienda `gcs-buckets-and-objects`, y el bucket del state de Terraform, con el versionado que pide el backend `gcs`. Implementa `gcs-buckets-and-objects` e `infrastructure-as-code`.

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
  type        = string
  description = "Proyecto de GCP donde se crean los buckets."
}

variable "prefijo" {
  type        = string
  description = "Prefijo para que los nombres de bucket sean únicos (los nombres son globales)."
}

provider "google" {
  project = var.project_id
}

# Capa raw del lake: solo IAM, sin acceso público, con soft delete y ciclo de vida.
resource "google_storage_bucket" "lake_raw" {
  name                        = "${var.prefijo}-lake-raw"
  location                    = "US-CENTRAL1"
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
  force_destroy               = false # borrar el bucket con objetos falla

  soft_delete_policy {
    retention_duration_seconds = 2592000 # 30 días (rango permitido: 7 a 90 días)
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 1095
    }
    action {
      type = "Delete"
    }
  }
}

# Backend del state de Terraform: versionado para recuperar el state ante errores.
resource "google_storage_bucket" "tfstate" {
  name                        = "${var.prefijo}-tfstate"
  location                    = "US-CENTRAL1"
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
  force_destroy               = false

  versioning {
    enabled = true
  }
}
```

## 3. Cómo funciona

- **`lake_raw`:**
  - `uniform_bucket_level_access` desactiva las ACL, así que solo IAM concede acceso;
  - `public_access_prevention = "enforced"` impide exponer el bucket;
  - `soft_delete_policy` retiene 30 días los objetos borrados, dentro del rango de 7 a 90 días;
  - una regla pasa a Coldline los objetos de más de 90 días y otra los borra a los 1095 días (3 años);
  - `force_destroy = false` hace fallar el borrado del bucket si tiene objetos.
- **`tfstate`:** mismo acceso, más `versioning.enabled = true`, que el backend `gcs` recomienda para recuperar el state. Se crea antes de configurar el backend, porque el backend exige que el bucket ya exista.

Es **idempotente**: un segundo `apply` sin cambios no modifica nada.

## 4. Cuándo usarlo

- Al crear la capa raw de un lake en Cloud Storage.
- Al preparar el backend remoto del state de Terraform.

## 5. Cuándo no usarlo

- Para datos de lectura frecuente después de 90 días: la regla a Coldline encarecería las lecturas.
- Si los datos raw deben conservarse más de 3 años por regulación: ajustar o quitar la regla de borrado.
- Para el bucket del state, no gestionarlo desde la misma configuración que lo usa como backend: se crea en una configuración aparte o antes.

## 6. Riesgos

- **Regla de borrado:** borra objetos de forma automática; revisar la retención con el negocio antes de aplicarla.
- **Coldline:** tiene duración mínima de 90 días y cobra la recuperación; si se leen seguido, cuesta más que Standard.
- **Nombres globales:** si el nombre ya existe en otro proyecto, el `apply` falla; el prefijo debe ser propio.
- **Seguridad:** el bucket del state puede contener secretos; restringir su acceso a la cuenta de despliegue y a administradores.

## 7. Requisitos y cómo ejecutarlo

Ver `requirements` en el encabezado. Validar sin credenciales con `terraform init -backend=false` y `terraform validate` (la CI lo hace en cada push). Aplicar con `terraform plan -var project_id=MI_PROYECTO -var prefijo=miempresa` y `terraform apply` del plan revisado.

## 8. Conceptos relacionados

- `gcs-buckets-and-objects` e `infrastructure-as-code`: lo que implementa.
- `terraform-state`: el bucket del state y su backend.

## 9. Fuentes

- HashiCorp: documentación de `google_storage_bucket` (repositorio oficial del provider) y backend `gcs`.
- Google Cloud: *Uniform bucket-level access*, *Object Versioning* y *Storage classes*.

El detalle está en `sources` del encabezado.

## 10. Historial de cambios

- 2026-10-01: creación (A-F3.2, lote 4), tras la revisión B-F3.1 del lote 4.
- 2026-10-04: `verification_status: verified` (revisión B-F3.2 de `docs/reviews/snippets-2.md` aprobada, sin cambios pedidos; sin VERIFY pendientes).
- 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
