---
id: code_snippet:terraform-bigquery-partitioned-table
slug: terraform-bigquery-partitioned-table
type: code_snippet
title: Tabla particionada y con clustering en BigQuery con Terraform
description: "Dataset y tabla de BigQuery declarados en Terraform, particionada por día con filtro de partición obligatorio, clustering y protección contra borrado."
language: terraform
dialect: hcl
requirements:
  - "Terraform 1.x y el provider hashicorp/google 8.x (terraform init lo descarga)."
  - "Para aplicar: un proyecto de GCP, credenciales (Application Default Credentials) y permisos para crear datasets y tablas de BigQuery. Para validar (terraform validate) no hacen falta credenciales."
  - "Variable project_id con el proyecto destino."
classification: modern
level: intermediate
cloud: [gcp]
technologies: [terraform, gcp-bigquery]
tags: [terraform, iac, bigquery, partitioning]
related_topics: [bigquery-partitioning, bigquery-clustering, partition-pruning, infrastructure-as-code, terraform-providers]
sources:
  - source: terraform-provider-google-docs
    url: https://github.com/hashicorp/terraform-provider-google/blob/main/website/docs/r/bigquery_table.html.markdown
    accessed: 2026-10-01
    page_title: "google_bigquery_table"
    note: "google_bigquery_table: dataset_id y table_id; time_partitioning con type (DAY, HOUR, MONTH, YEAR), field (si falta, partición por tiempo de carga) y expiration_ms; require_partition_filter en el nivel superior (el de time_partitioning está deprecado); clustering hasta cuatro columnas en orden de prioridad; schema es un JSON; deletion_protection: con true o sin definir, apply o destroy que borren la tabla fallan."
  - source: terraform-provider-google-docs
    url: https://github.com/hashicorp/terraform-provider-google/blob/main/website/docs/r/bigquery_dataset.html.markdown
    accessed: 2026-10-01
    page_title: "google_bigquery_dataset"
    note: "google_bigquery_dataset: dataset_id obligatorio (letras, números o guiones bajos, hasta 1.024 caracteres), location opcional; delete_contents_on_destroy en false hace fallar el destroy si el dataset tiene tablas."
  - source: terraform-docs
    url: https://developer.hashicorp.com/terraform/language/providers/requirements
    accessed: 2026-10-01
    page_title: "Provider Requirements"
    note: "Los providers se declaran en required_providers dentro del bloque terraform, con source y una restricción de versión; terraform init los instala."
  - source: terraform-provider-google-releases
    url: https://github.com/hashicorp/terraform-provider-google/releases
    accessed: 2026-10-01
    page_title: "Releases: hashicorp/terraform-provider-google"
    note: "Última versión del provider al 2026-10-01: v8.5.0 (29 de septiembre de 2026)."
relations:
  - type: IMPLEMENTS
    target: bigquery-partitioning
    note: Partición diaria por columna con filtro de partición obligatorio.
  - type: USES
    target: bigquery-clustering
    note: Clustering por la columna de filtro secundaria.
  - type: RELATED_TO
    target: partition-pruning
    note: require_partition_filter obliga a que toda consulta pueda podar particiones.
  - type: IMPLEMENTS
    target: infrastructure-as-code
    note: Dataset y tabla declarados como código, revisables y reproducibles.
  - type: IMPLEMENTS
    target: terraform-providers
    note: Declara hashicorp/google en required_providers con una restricción de versión mayor.
created_at: 2026-10-01
updated_at: 2026-10-13
last_verified: 2026-10-01
verification_status: verified
---

## 1. Qué resuelve

Declara como código una tabla de BigQuery con las decisiones de `bigquery-partitioning` ya tomadas: partición diaria por la columna de fecha, filtro de partición obligatorio para que ninguna consulta escanee toda la tabla, clustering por la columna de filtro secundaria y protección contra borrados accidentales. Aplicar el mismo código otra vez no cambia nada: Terraform compara con el estado y solo aplica diferencias.

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
  description = "Proyecto de GCP donde se crean el dataset y la tabla."
}

provider "google" {
  project = var.project_id
}

resource "google_bigquery_dataset" "dwh" {
  dataset_id                 = "dwh"
  location                   = "US"
  delete_contents_on_destroy = false # un destroy falla si el dataset tiene tablas
}

resource "google_bigquery_table" "eventos" {
  dataset_id = google_bigquery_dataset.dwh.dataset_id
  table_id   = "eventos"

  time_partitioning {
    type  = "DAY"
    field = "fecha"
  }
  require_partition_filter = true                       # toda consulta debe filtrar por la partición
  clustering               = ["tenant_id", "tipo_evento"] # primero la columna más filtrada
  deletion_protection      = true                       # apply o destroy que borren la tabla fallan

  schema = jsonencode([
    { name = "fecha", type = "DATE", mode = "REQUIRED" },
    { name = "tenant_id", type = "STRING", mode = "REQUIRED" },
    { name = "tipo_evento", type = "STRING", mode = "NULLABLE" },
    { name = "payload", type = "JSON", mode = "NULLABLE" },
  ])
}
```

## 3. Cómo funciona

- `required_providers` fija el provider `hashicorp/google` en la versión mayor 8; `terraform init` lo descarga.
- `time_partitioning` con `type = "DAY"` y `field = "fecha"` crea una partición por día según esa columna. Sin `field`, la partición sería por tiempo de carga.
- `require_partition_filter = true` hace fallar las consultas que no filtran por la partición. Va en el nivel superior: dentro de `time_partitioning` está deprecado.
- `clustering` ordena por hasta cuatro columnas, en orden de prioridad.
- `deletion_protection = true` hace fallar cualquier `apply` o `destroy` que borraría la tabla.
- `schema` es un JSON; `jsonencode` lo genera desde HCL.

Es **idempotente**: un segundo `terraform apply` sin cambios no modifica nada.

## 4. Cuándo usarlo

- Tablas de eventos o hechos grandes que se consultan por fecha.
- Cuando la infraestructura de datos se versiona y revisa como código.

## 5. Cuándo no usarlo

- Tablas pequeñas: la partición agrega metadatos sin beneficio.
- Tablas creadas y reemplazadas por el propio pipeline (por ejemplo, por Dataform): gestionarlas también con Terraform produce conflictos de propiedad.
- Si el filtro habitual no es por fecha: la partición por día no ayuda; considerar partición por rango de enteros o solo clustering.

## 6. Riesgos

- **Cambios que borrarían la tabla:** si un cambio implica borrar la tabla, `deletion_protection` hace fallar el `apply`; revisar siempre el `terraform plan` antes de aplicar.
- **Diferencias en `schema`:** como es un texto JSON, cualquier cambio en el texto genera un diff aunque el JSON sea equivalente; generarlo desde HCL con `jsonencode` evita editar el texto a mano.
- **Seguridad:** las credenciales que aplican Terraform crean y modifican datasets; usar una cuenta de servicio dedicada al despliegue, no la de los pipelines.
- **Costo:** `require_partition_filter` evita consultas que escanean toda la tabla.

## 7. Requisitos y cómo ejecutarlo

Ver `requirements` en el encabezado. Guardar el código como `main.tf`:

- validar sin credenciales: `terraform init -backend=false` y `terraform validate`; la CI del proyecto lo hace en cada push;
- aplicar: `terraform init`, `terraform plan -var project_id=MI_PROYECTO` y `terraform apply -var project_id=MI_PROYECTO`.

## 8. Conceptos relacionados

- `bigquery-partitioning`: el patrón que implementa.
- `bigquery-clustering`: el orden dentro de cada partición.
- `partition-pruning`: lo que garantiza `require_partition_filter`.
- `infrastructure-as-code` y `terraform-providers`: el marco y el provider que implementa.
- `terraform-gcs-bucket` y `terraform-bigquery-iam`: los snippets de Cloud Storage e IAM.

## 9. Fuentes

- HashiCorp: documentación de `google_bigquery_table` y `google_bigquery_dataset` (repositorio oficial del provider), *Provider requirements* y releases del provider.

El detalle está en `sources` del encabezado.

## 10. Historial de cambios

- 2026-10-01: creación (A-F3.2).
- 2026-10-01: `verification_status: verified` (revisión B-F3.2 de snippets aprobada y aplicada; sin VERIFY pendientes).
- 2026-10-01: implementa también `infrastructure-as-code` y `terraform-providers`, verificadas con el lote 4.
- 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
