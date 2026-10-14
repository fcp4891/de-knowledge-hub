---
id: concept:container-apps-for-data
slug: container-apps-for-data
type: concept
title: Container Apps para cargas de datos
description: "Cuándo y cómo usar Azure Container Apps en pipelines de datos según su documentación: dos tipos de recurso, apps (servicios que corren continuamente y escalan con KEDA) y jobs (tareas en contenedores que corren un tiempo finito y terminan), con jobs de tipo Manual, Schedule (cron) o Event; timeout y límite de reintentos por réplica, paralelismo y cantidad de réplicas que deben completar; apps y jobs comparten el entorno, la red y los logs."
domain: azure
subdomain: streaming-and-compute
category: azure
classification: modern
level: intermediate
importance: medium
cloud: [azure]
technologies: [azure-container-apps, terraform]
tags: [container-apps, jobs, serverless-containers, keda]
related_topics: [cloud-run-for-data]
sources:
  - source: azure-container-apps-docs
    url: https://learn.microsoft.com/en-us/azure/container-apps/overview
    accessed: 2026-10-13
    page_title: "Azure Container Apps overview"
    note: "Azure Container Apps overview: plataforma serverless para ejecutar aplicaciones en contenedores sin administrar la infraestructura."
  - source: azure-container-apps-docs
    url: https://learn.microsoft.com/en-us/azure/container-apps/jobs
    accessed: 2026-10-13
    page_title: "Jobs in Azure Container Apps"
    note: "Jobs in Azure Container Apps: hay dos tipos de recurso de cómputo, apps (servicios que corren de forma continua y se reinician si fallan) y jobs (tareas que empiezan, corren un tiempo finito y se detienen al terminar), que comparten el entorno (red y logs). Tipos de job: Manual (por API), Schedule (expresión cron) y Event (por una regla de escala, por ejemplo mensajes en una cola). Configuración: replicaTimeout (tiempo máximo de una réplica, en segundos), replicaRetryLimit (reintentos de una réplica fallida; 0 para no reintentar; el timeout prevalece), parallelism (réplicas por ejecución; 1 para la mayoría) y replicaCompletionCount (réplicas que deben terminar bien; menor o igual que el paralelismo)."
  - source: azure-container-apps-docs
    url: https://learn.microsoft.com/en-us/azure/container-apps/scale-app
    accessed: 2026-10-13
    page_title: "Set scaling rules in Azure Container Apps"
    note: "Set scaling rules in Azure Container Apps: las apps escalan con KEDA (Kubernetes Event-driven Autoscaling), con reglas por solicitudes HTTP, mensajes en colas, CPU y memoria, y orígenes de eventos como Azure Service Bus, Azure Event Hubs, Apache Kafka y Redis."
  - source: azure-container-apps-docs
    url: https://azure.microsoft.com/en-us/pricing/details/container-apps/
    accessed: 2026-10-14
    page_title: "Azure Container Apps pricing"
    note: "Azure Container Apps pricing: en el plan de consumo, cada ejecución de un job se cobra a la tarifa activa desde que empieza hasta que termina, y no hay cargos de uso cuando el job no tiene ejecuciones; a los jobs no se les cobran solicitudes. Una app con réplicas mínimas paga una tarifa reducida en reposo. Los montos no se copian."
  - source: gcp-cloud-run-docs
    url: https://docs.cloud.google.com/run/docs/create-jobs
    accessed: 2026-10-11
    page_title: "Create jobs"
    note: "Create jobs: cada tarea conoce su índice en CLOUD_RUN_TASK_INDEX y la cantidad total en CLOUD_RUN_TASK_COUNT; si se procesan datos en paralelo, el código decide qué subconjunto le toca a cada tarea. Timeout y reintentos por tarea: si una tarea supera sus reintentos, queda fallida, y si alguna falló, la ejecución del job queda fallida después de intentar todas. Por defecto, cada tarea corre como máximo 10 minutos, configurable hasta 168 horas (7 días); con GPU, hasta 1 hora. La ejecución del job no tiene timeout propio: termina cuando terminan sus tareas."
  - source: gcp-cloud-run-docs
    url: https://docs.cloud.google.com/run/docs/resource-model
    accessed: 2026-10-11
    page_title: "Deployment options and resource model"
    note: "Deployment options and resource model: comparación de services, jobs, worker pools e instances; los jobs ejecutan tareas en secuencia o en paralelo y corren hasta terminar, hasta 7 días; los worker pools escalan de forma manual o automática por CPU o por backlog de Pub/Sub; las funciones son una forma especializada de despliegue desde código para código de un solo propósito y orientado a eventos (solo en services)."
  - source: aws-lambda-docs
    url: https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html
    accessed: 2026-10-12
    page_title: "Lambda quotas"
    note: "Lambda quotas: timeout de función de 900 segundos (15 minutos), salvo funciones con Lambda Managed Instances en invocaciones asíncronas o por event source mapping (hasta 5.400 segundos); memoria de 128 MB a 10.240 MB, con CPU proporcional; /tmp de 512 MB a 10.240 MB; payload de 6 MB en invocación síncrona y 1 MB en asíncrona; 1.000 ejecuciones concurrentes por defecto."
  - source: aws-lambda-docs
    url: https://docs.aws.amazon.com/lambda/latest/dg/welcome.html
    accessed: 2026-10-12
    page_title: "What is AWS Lambda?"
    note: "What is AWS Lambda?: servicio de cómputo serverless; Lambda administra la infraestructura, la capacidad, el escalado y los parches. Dos primitivas: funciones (un handler conectado a un trigger como API Gateway, S3, SQS o EventBridge; cada invocación corre de forma independiente, sin estado compartido) y Lambda MicroVMs (entornos aislados con vida total de hasta 8 horas)."
relations:
  - type: RELATED_TO
    target: cloud-run-for-data
    note: Cloud Run jobs, lo más cercano en GCP.
  - type: RELATED_TO
    target: lambda-for-data
    note: Lambda en AWS, para tareas cortas.
  - type: RELATED_TO
    target: azure-functions-for-data
    note: Funciones para pasos cortos; jobs para tareas que terminan y duran más.
  - type: RELATED_TO
    target: batch-ingestion
    note: Un job de calendario ejecuta la carga por lotes.
  - type: RELATED_TO
    target: retries
    note: Reintentos por réplica.
created_at: 2026-10-13
updated_at: 2026-10-14
last_verified: 2026-10-14
verification_status: verified
---

## 1. Resumen

**Azure Container Apps** ejecuta contenedores sin administrar servidores. Según su documentación, tiene dos tipos de recurso:

- **apps:** servicios que corren de forma continua y escalan con **KEDA** (por HTTP, colas, CPU, memoria o eventos como Event Hubs y Kafka);
- **jobs:** tareas que **corren un tiempo finito y terminan**.

Para datos, el caso típico es el **job**:
- de tipo **Schedule** (cron) para cargas diarias;
- de tipo **Event** para procesar mensajes de una cola;
- de tipo **Manual** para lanzarlo desde un orquestador.

Cada réplica tiene **timeout** y **reintentos**, y la ejecución define **paralelismo** y cuántas réplicas deben terminar bien.

## 2. Qué es

- **Entorno:** el límite donde corren apps y jobs, con red y logs compartidos.
- **App:** servicio que corre de forma continua y se reinicia si el contenedor falla; escala con reglas de KEDA.
- **Job:** contenedor que corre hasta terminar. Tipos:
  - *Manual*: se inicia por API;
  - *Schedule*: por expresión cron;
  - *Event*: por una regla de escala (por ejemplo, mensajes en una cola).
- **Configuración del job:**
  - `replicaTimeout`: tiempo máximo de una réplica;
  - `replicaRetryLimit`: reintentos de una réplica fallida (0 para no reintentar; el timeout prevalece);
  - `parallelism`: réplicas por ejecución (1 para la mayoría);
  - `replicaCompletionCount`: réplicas que deben terminar bien (menor o igual que el paralelismo).

## 3. Problema que resuelve

Cargas de datos en contenedores propios (Python con sus dependencias, herramientas de línea de comandos) que duran más que una función o necesitan otra imagen, sin operar un clúster de Kubernetes.

## 4. Cómo funciona

1. Se publica la imagen del job en un registro de contenedores.
2. Se crea el job de tipo Schedule con `0 3 * * *`, timeout de 1 hora y 2 reintentos.
3. Cada día a las 3:00, el job lanza una réplica; si falla, se reintenta hasta 2 veces dentro del timeout.
4. La ejecución termina cuando la réplica completa; los logs quedan en el entorno.

## 5. Cuándo utilizarlo

- Cargas por lotes en contenedores que terminan.
- Procesar mensajes de una cola por lotes, con un job de tipo Event que arranca cuando hay mensajes.
- Pasos de un pipeline lanzados por un orquestador (job Manual).

## 6. Cuándo no utilizarlo

- Pasos cortos y reactivos: una función (ver `azure-functions-for-data`).
- Procesamiento distribuido con shuffle: Spark.
- Repartir un lote entre réplicas sin un mecanismo propio: la página del job no documenta un índice de réplica, a diferencia de Cloud Run.

## 7. Ejemplo sencillo

El job `carga-diaria` corre a las 3:00, descarga el archivo del proveedor y lo escribe en `raw/dt=<día>/`. Si la descarga falla, la réplica se reintenta.

## 8. Ejemplo de producción

Un entorno de Container Apps con:

- un job Schedule que carga los archivos del día, con timeout de 1 hora y 2 reintentos;
- un job Event que arranca cuando hay mensajes en la cola de pedidos;
- identidad administrada para leer el registro de contenedores y escribir en el lake;
- logs del entorno para cada ejecución.

## 9. Arquitectura

```mermaid
flowchart LR
  CRON["Schedule 0 3 * * *"] --> J["Job carga-diaria<br/>timeout 1 h, 2 reintentos"]
  Q["Cola"] -- "regla de escala" --> JE["Job de tipo Event"]
  J --> L["ADLS raw/"]
  JE --> L
  subgraph ENV["Entorno de Container Apps (red y logs compartidos)"]
    J
    JE
  end
```

## 10. Código

```hcl
# Terraform (validado en la CI con terraform validate, sin credenciales; no se aplicó): job de Container Apps de tipo
# Schedule (cron), con timeout por réplica, reintentos y paralelismo; termina al completar el trabajo.
# Requiere: provider hashicorp/azurerm ~> 5.0; grupo de recursos y un entorno de Container Apps existentes.
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 5.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "resource_group_name" {
  type = string
}

variable "location" {
  type    = string
  default = "eastus2"
}

variable "container_app_environment_id" {
  type = string
}

resource "azurerm_container_app_job" "carga_diaria" {
  name                         = "carga-diaria"
  resource_group_name          = var.resource_group_name
  location                     = var.location
  container_app_environment_id = var.container_app_environment_id
  replica_timeout_in_seconds   = 3600
  replica_retry_limit          = 2

  schedule_trigger_config {
    cron_expression          = "0 3 * * *"
    parallelism              = 1
    replica_completion_count = 1
  }

  template {
    container {
      name   = "carga"
      image  = "dekhacr.azurecr.io/carga-ventas:1.4.0"
      cpu    = 0.5
      memory = "1Gi"
    }
  }
}
```

El bloque de Terraform se valida en la CI con `terraform validate`, sin credenciales (`make validate-terraform`), y **no se aplicó**. Los nombres de los atributos corresponden a la configuración de *Jobs in Azure Container Apps*: timeout y reintentos por réplica, paralelismo y réplicas que deben completar. La imagen es ilustrativa.

## 11. GCP

No aplica de forma específica: esta ficha describe Container Apps. Lo más cercano en GCP son los jobs de Cloud Run (ver `cloud-run-for-data`). Las diferencias, según sus páginas:

| | Container Apps jobs | Cloud Run jobs |
|---|---|---|
| Disparo | Manual, Schedule (cron) o Event (regla de escala) | A mano o con calendario |
| Repartir trabajo entre tareas | La página no documenta un índice de réplica | Cada tarea recibe `CLOUD_RUN_TASK_INDEX` y `CLOUD_RUN_TASK_COUNT` |
| Duración | `replicaTimeout` por réplica | Timeout por tarea, de 10 minutos por defecto hasta 168 horas |

## 12. AWS

No aplica de forma específica. Lo más cercano en las fichas de AWS es Lambda (ver `lambda-for-data`), para tareas cortas. Las diferencias, según sus páginas:

| | Container Apps jobs | Lambda |
|---|---|---|
| Unidad | Contenedor propio que corre hasta terminar | Función con un handler |
| Duración | `replicaTimeout` configurable por réplica | 15 minutos como máximo |
| Disparo | Manual, cron o eventos | Eventos de servicios de AWS o invocación |

## 13. Azure

**Azure Container Apps.** Apps y jobs, los tipos de job, su configuración y el escalado con KEDA son los de sus páginas.

## 14. Buenas prácticas

- Jobs para tareas que terminan; apps para servicios continuos.
- Timeout y reintentos explícitos por réplica.
- Escribir por partición, para que un reintento no duplique.
- Imagen versionada (no `latest`) para saber qué corrió cada día.
- **Seguridad:** identidad administrada para el registro de contenedores y el lake; secretos fuera de la imagen.
- **Observabilidad:** logs del entorno por ejecución y alertas por ejecuciones fallidas.
- **Costo:** según *Azure Container Apps pricing* (consultada el 2026-10-14), en el plan de consumo cada ejecución de un job se cobra a la tarifa activa desde que empieza hasta que termina, sin cargos cuando no hay ejecuciones; una app con réplicas mínimas paga una tarifa reducida en reposo. Los montos no se copian.

## 15. Errores frecuentes

- Una app que corre todo el día para una tarea diaria.
- Timeout más corto que la tarea, que agota los reintentos.
- Paralelismo mayor que 1 sin un mecanismo para repartir el trabajo.
- Imágenes `latest` que cambian sin aviso.

## 16. Trade-offs

Container Apps da contenedores propios sin operar Kubernetes, con jobs que terminan y escalado por eventos, a cambio de armar la imagen y su ciclo de vida. Functions es más simple para pasos cortos; Spark, para procesamiento distribuido.

## 17. Conceptos relacionados

- `cloud-run-for-data` y `lambda-for-data`: lo más cercano en GCP y AWS.
- `azure-functions-for-data`: para pasos cortos.
- `batch-ingestion` y `retries`: lo que ejecuta un job y cómo se recupera.

## 18. Preguntas técnicas abiertas

1. ¿Qué tareas de tu pipeline necesitan un contenedor propio?
2. ¿Cómo repartirías un lote entre varias réplicas?
3. ¿Qué colas podrían consumirse con un job de tipo Event?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Microsoft Learn, Azure Container Apps: *Azure Container Apps overview*, *Jobs in Azure Container Apps* y *Set scaling rules in Azure Container Apps*; *Azure Container Apps pricing*.
- Google Cloud, Cloud Run: *Create jobs* y *Deployment options and resource model*. AWS: *Lambda quotas* y *What is AWS Lambda?*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-14. Pasa a `verified`: revisión B-F3.1 del lote F3b-10b aplicada, sin VERIFY pendientes.

## 22. Historial de cambios importantes

- 2026-10-13: creación (lote F3b-10b).
- 2026-10-14: revisión B-F3.1 del lote F3b-10b aplicada (docs/reviews/cards-f3b-10b.md): el costo de los jobs cita *Azure Container Apps pricing* (2026-10-14), sin montos.
- 2026-10-14: `verification_status: verified` (sin VERIFY pendientes).
