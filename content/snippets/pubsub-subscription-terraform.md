---
id: code_snippet:pubsub-subscription-terraform
slug: pubsub-subscription-terraform
type: code_snippet
title: Suscripción de Pub/Sub con filtro, reintentos y dead letter en Terraform
description: "Topic, suscripción pull filtrada por atributo, retry policy, dead letter con su propia suscripción y los permisos del agente de servicio de Pub/Sub que la dead letter necesita, declarados en Terraform."
language: terraform
dialect: hcl
requirements:
  - "Terraform 1.x y el provider hashicorp/google 8.x (terraform init lo descarga)."
  - "Para aplicar: un proyecto de GCP con la API de Pub/Sub habilitada, credenciales (Application Default Credentials) y permiso para crear topics y suscripciones y modificar sus políticas IAM. Para validar (terraform validate) no hacen falta credenciales."
  - "Variable project_id; el número del proyecto lo resuelve data.google_project."
classification: modern
level: intermediate
cloud: [gcp]
technologies: [terraform, gcp-pubsub, gcp-iam]
tags: [terraform, iac, pubsub, dead-letter]
related_topics: [pubsub-topics-and-subscriptions, dead-letter-queue, infrastructure-as-code]
sources:
  - source: terraform-provider-google-docs
    url: https://github.com/hashicorp/terraform-provider-google/blob/main/website/docs/r/pubsub_subscription.html.markdown
    accessed: 2026-10-04
    page_title: "google_pubsub_subscription"
    note: "google_pubsub_subscription: ack_deadline_seconds, message_retention_duration (600s a 2678400s), expiration_policy.ttl (\"\" = nunca expira), filter (no modificable después de crear), dead_letter_policy (max_delivery_attempts entre 5 y 100; el agente de servicio de Pub/Sub necesita permiso para publicar en el topic de dead letter y para confirmar en la suscripción; los mensajes publicados en un topic sin suscripciones se pierden) y retry_policy (minimum_backoff y maximum_backoff entre 0 y 600 s)."
  - source: terraform-provider-google-docs
    url: https://github.com/hashicorp/terraform-provider-google/blob/main/website/docs/r/pubsub_topic_iam.html.markdown
    accessed: 2026-10-04
    page_title: "IAM policy for Cloud Pub/Sub Topic"
    note: "google_pubsub_topic_iam_member es no autoritativo: agrega un miembro a un rol y conserva los demás miembros del rol en el topic. Argumentos topic, role y member."
  - source: terraform-provider-google-docs
    url: https://github.com/hashicorp/terraform-provider-google/blob/main/website/docs/r/pubsub_subscription_iam.html.markdown
    accessed: 2026-10-04
    page_title: "IAM policy for Pubsub Subscription"
    note: "google_pubsub_subscription_iam_member es no autoritativo: agrega un miembro a un rol y conserva los demás. Argumentos subscription (nombre o id), role y member."
  - source: terraform-provider-google-docs
    url: https://github.com/hashicorp/terraform-provider-google/blob/main/website/docs/d/project.html.markdown
    accessed: 2026-10-04
    page_title: "google_project"
    note: "El data source google_project expone number, el identificador numérico del proyecto; sin project_id usa el proyecto del provider."
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/dead-letter-topics
    accessed: 2026-10-04
    page_title: "Dead-letter topics"
    note: "El agente de servicio service-NÚMERO_DE_PROYECTO@gcp-sa-pubsub.iam.gserviceaccount.com necesita roles/pubsub.publisher en el topic de dead letter (para reenviar los mensajes no entregables) y roles/pubsub.subscriber en la suscripción de origen (para confirmarlos)."
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/access-control
    accessed: 2026-10-05
    page_title: "Access control with Identity and Access Management"
    note: "Pub/Sub Subscriber (roles/pubsub.subscriber) da acceso a consumir mensajes de una suscripción; se puede conceder a nivel de suscripción, topic o snapshot. Pub/Sub Publisher (roles/pubsub.publisher) da acceso a publicar en un topic."
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/subscription-overview
    accessed: 2026-10-04
    page_title: "Subscription overview"
    note: "Solo los mensajes publicados después de crear la suscripción están disponibles para ella."
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/subscription-properties
    accessed: 2026-10-04
    page_title: "Subscription properties"
    note: "El filtro no se puede cambiar ni quitar después de aplicarlo; retener mensajes sin confirmar más de 24 horas tiene cargo adicional."
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/subscription-message-filter
    accessed: 2026-10-04
    page_title: "Filter messages from a subscription"
    note: "Sintaxis de filtros por atributos, como attributes.name = \"com\"."
relations:
  - type: IMPLEMENTS
    target: pubsub-topics-and-subscriptions
    note: Topic, suscripción pull con filtro, retención, expiración, retry policy y dead letter.
  - type: IMPLEMENTS
    target: dead-letter-queue
    note: Dead letter con su propia suscripción de revisión y los permisos del agente de servicio.
  - type: IMPLEMENTS
    target: infrastructure-as-code
    note: Recursos y permisos declarados y versionados en Terraform.
created_at: 2026-10-04
updated_at: 2026-10-13
last_verified: 2026-10-05
verification_status: verified
---

## 1. Qué resuelve

Declara una suscripción de Pub/Sub lista para producción: filtrada por un atributo, con backoff en los reintentos y con una dead letter que funciona de verdad. Para que funcione, la dead letter necesita tres cosas que suelen olvidarse:

- su propia suscripción, porque los mensajes que llegan a un topic sin suscripciones se pierden;
- permiso del agente de servicio de Pub/Sub para **publicar** en el topic de dead letter;
- permiso del mismo agente para **confirmar** (ack) en la suscripción de origen.

Es la sección 10 de `pubsub-topics-and-subscriptions`, completada con esos permisos.

## 2. Código

```hcl
# Topic, suscripción pull filtrada con reintentos y dead letter, y los permisos del agente de
# servicio de Pub/Sub que la dead letter necesita.
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
  description = "Proyecto de GCP donde se crean los recursos."
}

provider "google" {
  project = var.project_id
}

data "google_project" "this" {}

locals {
  # Agente de servicio de Pub/Sub del proyecto: reenvía a la dead letter y confirma en el origen.
  pubsub_agent = "serviceAccount:service-${data.google_project.this.number}@gcp-sa-pubsub.iam.gserviceaccount.com"
}

resource "google_pubsub_topic" "pedidos" {
  name = "pedidos"
}

resource "google_pubsub_topic" "pedidos_dead_letter" {
  name = "pedidos-dead-letter"
}

# Un topic sin suscripciones pierde lo que recibe: la dead letter necesita la suya.
resource "google_pubsub_subscription" "pedidos_dead_letter_revision" {
  name                       = "pedidos-dead-letter-revision"
  topic                      = google_pubsub_topic.pedidos_dead_letter.id
  message_retention_duration = "604800s" # 7 días para revisar

  expiration_policy {
    ttl = "" # nunca expira
  }
}

resource "google_pubsub_subscription" "pedidos_cl" {
  name                       = "pedidos-cl"
  topic                      = google_pubsub_topic.pedidos.id
  ack_deadline_seconds       = 60
  message_retention_duration = "259200s"                    # 3 días
  filter                     = "attributes.region = \"cl\"" # no se puede modificar después

  expiration_policy {
    ttl = ""
  }

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "300s"
  }

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.pedidos_dead_letter.id
    max_delivery_attempts = 10
  }
}

# Permisos de la dead letter: publicar en el topic de dead letter y confirmar en el origen.
# *_iam_member es aditivo: no quita a otros miembros del rol.
resource "google_pubsub_topic_iam_member" "dead_letter_publisher" {
  topic  = google_pubsub_topic.pedidos_dead_letter.name
  role   = "roles/pubsub.publisher"
  member = local.pubsub_agent
}

resource "google_pubsub_subscription_iam_member" "source_subscriber" {
  subscription = google_pubsub_subscription.pedidos_cl.name
  role         = "roles/pubsub.subscriber"
  member       = local.pubsub_agent
}
```

## 3. Cómo funciona

1. **Topic y suscripción:** `pedidos-cl` solo entrega los mensajes con `region = "cl"`. Pub/Sub confirma automáticamente los que no coinciden, y el filtro no se puede cambiar después de crearla.
2. **Reintentos:** tras un nack o un ack deadline vencido, Pub/Sub espera entre 10 y 300 s, con backoff, antes de reenviar.
3. **Dead letter:** después de 10 intentos, el mensaje se reenvía a `pedidos-dead-letter`, que tiene su propia suscripción de revisión con 7 días de retención.
4. **Permisos del agente:** `data.google_project` resuelve el número de proyecto, con el que se arma la cuenta del agente de servicio. Los dos `*_iam_member` le dan `roles/pubsub.publisher` en la dead letter y `roles/pubsub.subscriber` en la suscripción de origen, solo sobre esos recursos y no sobre el proyecto.

Un segundo `apply` sin cambios no modifica nada. El `filter` no se puede modificar después de crear la suscripción: cambiarlo implica una suscripción nueva, que solo recibe lo publicado desde su creación.

## 4. Cuándo usarlo

- Suscripciones pull consumidas por servicios propios (Cloud Run, GKE, Dataflow) que necesitan aislar los mensajes que fallan siempre.
- Cuando cada consumidor solo debe recibir una parte del topic, según un atributo.
- Como base para varias suscripciones del mismo topic, cada una con su filtro y su dead letter.

## 5. Cuándo no usarlo

- Para suscripciones de export a BigQuery o Cloud Storage, que tienen otros bloques de configuración y permisos propios.
- Si hay que filtrar por el contenido del mensaje: el filtro solo usa atributos; filtrar en el consumidor o publicar el atributo.
- Si la política IAM del topic o de la suscripción se administra entera desde otro lugar con recursos autoritativos (`*_iam_policy`): mezclarlos genera conflictos.

## 6. Riesgos

- **Filtro inmutable:** cambiar `filter` implica una suscripción nueva, que no recibe lo publicado antes de crearse ni los pendientes de la anterior. Planificarlo creando la nueva antes de retirar la vieja.
- **Dead letter sin revisión:** si nadie mira `pedidos-dead-letter-revision`, los mensajes vencen a los 7 días; conviene alertar cuando su backlog crece.
- **Permisos faltantes:** sin los dos `*_iam_member`, la dead letter no recibe nada y los mensajes siguen reintentándose.
- **Seguridad:** el agente de servicio recibe roles solo sobre el topic de dead letter y la suscripción de origen, no sobre el proyecto. Las cuentas de los consumidores necesitan aparte `roles/pubsub.subscriber` en su suscripción.
- **Costo:** retener mensajes sin confirmar más de 24 horas tiene cargo adicional; la suscripción de revisión acumula hasta 7 días.

## 7. Requisitos y cómo ejecutarlo

Ver `requirements` en el encabezado. Validar sin credenciales con `terraform init -backend=false` y `terraform validate` (la CI lo hace en cada push). Aplicar con `terraform plan -var project_id=MI_PROYECTO` y `terraform apply` del plan revisado.

## 8. Conceptos relacionados

- `pubsub-topics-and-subscriptions`: el modelo de topics, suscripciones y propiedades.
- `dead-letter-queue`: el patrón de la dead letter.
- `infrastructure-as-code`: declarar recursos y permisos en Terraform.

## 9. Fuentes

- HashiCorp: documentación de `google_pubsub_subscription`, `google_pubsub_topic_iam`, `google_pubsub_subscription_iam` y del data source `google_project` (repositorio oficial del provider).
- Google Cloud: *Dead-letter topics*, *Access control with IAM*, *Subscription overview*, *Subscription properties* y *Filter messages from a subscription* (Pub/Sub).

El detalle está en `sources` del encabezado.

## 10. Historial de cambios

- 2026-10-04: creación (propuesta aprobada tras el lote 5), desde la sección 10 de `pubsub-topics-and-subscriptions` con los permisos del agente de servicio.
- 2026-10-05: revisión B-F3.2 (`docs/reviews/snippets-3.md`) aplicada: fuente de *Access control* para el rol de los consumidores. `verification_status: verified` (sin VERIFY pendientes).
- 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
