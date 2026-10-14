---
id: concept:azure-functions-for-data
slug: azure-functions-for-data
type: concept
title: Azure Functions para cargas de datos
description: "Cuándo y cómo usar Azure Functions en pipelines de datos según su documentación: funciones serverless con triggers y bindings, el plan Flex Consumption como el recomendado para apps serverless nuevas (Consumption es legacy), timeout de 30 minutos por defecto y sin límite en Flex, Premium y Dedicated, 230 segundos como máximo para responder HTTP, blob trigger por Event Grid o por sondeo, recibos que evitan procesar dos veces el mismo blob y modelo de programación v2 de Python con decoradores."
domain: azure
subdomain: streaming-and-compute
category: azure
classification: modern
level: intermediate
importance: medium
cloud: [azure]
technologies: [azure-functions, azure-adls, python, terraform]
tags: [azure-functions, serverless, blob-trigger, event-grid]
related_topics: [lambda-for-data]
sources:
  - source: azure-functions-docs
    url: https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview
    accessed: 2026-10-13
    page_title: "What is Azure Functions?"
    note: "What is Azure Functions?: solución serverless para construir apps con menos código e infraestructura; la plataforma provee los recursos para ejecutar el código."
  - source: azure-functions-docs
    url: https://learn.microsoft.com/en-us/azure/azure-functions/functions-scale
    accessed: 2026-10-13
    page_title: "Azure Functions hosting options"
    note: "Azure Functions hosting options (consultada el 2026-10-13): planes Flex Consumption, Premium, Dedicated y Container Apps; «The Consumption plan is a legacy hosting plan. For new serverless function apps, use the Flex Consumption plan» (Consumption en Linux: retirado). functionTimeout en host.json: por defecto 30 minutos y máximo sin límite en Flex Consumption, Premium, Dedicated y Container Apps; en Consumption, 5 y 10 minutos. Sin importar el timeout, una función con trigger HTTP tiene 230 segundos como máximo para responder."
  - source: azure-functions-docs
    url: https://learn.microsoft.com/en-us/azure/azure-functions/functions-triggers-bindings
    accessed: 2026-10-13
    page_title: "Azure Functions triggers and bindings"
    note: "Azure Functions triggers and bindings: el trigger hace que la función se ejecute; un binding conecta la función de forma declarativa con otros recursos, como entrada o salida."
  - source: azure-functions-docs
    url: https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-storage-blob-trigger
    accessed: 2026-10-13
    page_title: "Azure Blob storage trigger for Azure Functions"
    note: "Azure Blob storage trigger for Azure Functions: el decorador blob_trigger de Python tiene arg_name, path, connection y source; source=EventGrid da un trigger basado en Event Grid, con menor latencia; el valor por defecto, LogsAndContainerScan, sondea el contenedor. El runtime mantiene recibos de blobs (contenedor azure-webjobs-hosts) para no llamar dos veces a la función por el mismo blob nuevo o actualizado; tras el máximo de reintentos (MaxDequeueCount), el blob va a una cola de mensajes venenosos."
  - source: azure-functions-docs
    url: https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-error-pages
    accessed: 2026-10-13
    page_title: "Azure Functions error handling and retries"
    note: "Azure Functions error handling and retries: el origen del reintento depende del trigger: Blob Storage, Queue Storage y Service Bus (extensión 5.x), por la extensión con host.json; Event Hubs, Kafka, Cosmos DB y Timer, con políticas de reintento por función; RabbitMQ, con cola de mensajes muertos."
  - source: azure-functions-docs
    url: https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-python
    accessed: 2026-10-13
    page_title: "Azure Functions developer reference guide for Python apps"
    note: "Azure Functions developer reference guide for Python apps: el modelo de programación v2 define triggers y bindings con decoradores en el código; el v1 usa un main() en __init__.py y la configuración en function.json."
  - source: azure-functions-docs
    url: https://learn.microsoft.com/en-us/azure/azure-functions/functions-best-practices
    accessed: 2026-10-13
    page_title: "Best practices for reliable Azure Functions"
    note: "Best practices for reliable Azure Functions: evitar funciones de larga duración, escribir funciones sin estado y defensivas, y usar un patrón de reintento al acceder a recursos en la nube."
  - source: azure-functions-docs
    url: https://azure.microsoft.com/en-us/pricing/details/functions/
    accessed: 2026-10-14
    page_title: "Azure Functions pricing"
    note: "Azure Functions pricing: en Flex Consumption, las instancias On-Demand se cobran por la memoria aprovisionada mientras ejecutan funciones y por el número de ejecuciones; las Always Ready, además, por la memoria de base mientras están inactivas. Los montos no se copian."
  - source: aws-lambda-docs
    url: https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html
    accessed: 2026-10-12
    page_title: "Lambda quotas"
    note: "Lambda quotas: timeout de función de 900 segundos (15 minutos), salvo funciones con Lambda Managed Instances en invocaciones asíncronas o por event source mapping (hasta 5.400 segundos); memoria de 128 MB a 10.240 MB, con CPU proporcional; /tmp de 512 MB a 10.240 MB; payload de 6 MB en invocación síncrona y 1 MB en asíncrona; 1.000 ejecuciones concurrentes por defecto."
  - source: aws-lambda-docs
    url: https://docs.aws.amazon.com/lambda/latest/dg/invocation-retries.html
    accessed: 2026-10-12
    page_title: "Understanding retry behavior in Lambda Event Functions"
    note: "Understanding retry behavior in Lambda: en invocación asíncrona, Lambda reintenta dos veces los errores de la función, y se puede configurar una dead-letter queue; los event source mappings que leen de streams reintentan el lote completo y los errores repetidos bloquean el shard hasta resolverse o expirar los registros (vigilar Iterator Age); para colas, el tiempo entre reintentos y el destino de los fallidos los fijan el visibility timeout y la redrive policy de la cola."
  - source: aws-lambda-docs
    url: https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html
    accessed: 2026-10-12
    page_title: "Process Amazon S3 event notifications with Lambda"
    note: "Process Amazon S3 event notifications with Lambda: S3 invoca la función de forma asíncrona con un evento que describe el objeto. Advertencia: si la función usa el mismo bucket que la dispara, puede entrar en un bucle."
  - source: gcp-cloud-run-docs
    url: https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run
    accessed: 2026-10-11
    page_title: "What is Cloud Run"
    note: "What is Cloud Run: plataforma administrada para ejecutar código, funciones o contenedores; el despliegue desde código fuente construye el contenedor para lenguajes como Python. Cuatro formas de ejecutar: service (responde a solicitudes HTTP en un endpoint estable), job (ejecuta tareas paralelizables a mano o con calendario y corre hasta terminar), worker pool (cargas de fondo siempre activas, como consumidores de Kafka, Pub/Sub o RabbitMQ) e instance (cargas largas que necesitan un entorno único). Todas corren contenedores aislados en el mismo entorno de ejecución."
  - source: gcp-cloud-run-docs
    url: https://docs.cloud.google.com/run/docs/resource-model
    accessed: 2026-10-11
    page_title: "Deployment options and resource model"
    note: "Deployment options and resource model: comparación de services, jobs, worker pools e instances; los jobs ejecutan tareas en secuencia o en paralelo y corren hasta terminar, hasta 7 días; los worker pools escalan de forma manual o automática por CPU o por backlog de Pub/Sub; las funciones son una forma especializada de despliegue desde código para código de un solo propósito y orientado a eventos (solo en services)."
relations:
  - type: RELATED_TO
    target: lambda-for-data
    note: Lambda en AWS, con otros límites y otro modelo de reintentos.
  - type: RELATED_TO
    target: cloud-run-for-data
    note: Cloud Run en GCP, donde las funciones son una forma de desplegar un service.
  - type: RELATED_TO
    target: event-driven-pipelines
    note: Funciones que reaccionan a un archivo nuevo.
  - type: RELATED_TO
    target: idempotency
    note: La función debe dar el mismo resultado si se reintenta.
  - type: RELATED_TO
    target: adls-gen2-storage
    note: El blob que dispara la función y el que escribe.
created_at: 2026-10-13
updated_at: 2026-10-14
last_verified: 2026-10-14
verification_status: verified
---

## 1. Resumen

**Azure Functions** ejecuta código ante un evento, sin servidores que administrar. Para datos sirve en pasos cortos y reactivos: un archivo llega al lake, un mensaje llega a una cola. Según su documentación:

- el plan recomendado para apps serverless nuevas es **Flex Consumption**; el plan Consumption es «legacy»;
- el **timeout** por defecto es de **30 minutos**, sin máximo en Flex, Premium y Dedicated; una función HTTP tiene **230 segundos** para responder, sin importar el timeout;
- el **blob trigger** puede basarse en **Event Grid** (menor latencia) o sondear el contenedor (por defecto);
- el runtime guarda **recibos** para no llamar dos veces a la función por el mismo blob.

En Python, el **modelo v2** declara triggers y bindings con decoradores.

## 2. Qué es

- **Function app:** el conjunto de funciones que se despliega junto, en un plan de hosting.
- **Trigger y bindings:** el trigger dispara la función; los bindings conectan entradas y salidas sin código de cliente.
- **Planes:**
  - *Flex Consumption*: el recomendado para serverless nuevo;
  - *Premium* y *Dedicated*: instancias reservadas;
  - *Container Apps*: funciones en un entorno de Container Apps;
  - *Consumption*: legacy (en Linux, retirado).
- **Timeout:** `functionTimeout` en `host.json`; 30 minutos por defecto; sin máximo en Flex, Premium, Dedicated y Container Apps; 230 segundos para responder HTTP.
- **Blob trigger:** `source="EventGrid"` o el sondeo por defecto (`LogsAndContainerScan`); recibos en `azure-webjobs-hosts`; tras los reintentos, el blob va a una cola de mensajes venenosos.
- **Reintentos:** el origen depende del trigger: la extensión (Blob, Queue, Service Bus), una política por función (Event Hubs, Kafka, Timer) o una cola de mensajes muertos (RabbitMQ).

## 3. Problema que resuelve

Muchos pasos de un pipeline son chicos y reactivos: validar o limpiar un archivo al llegar, mover un mensaje. Functions los corre al ocurrir el evento, escala con la cantidad de eventos y, en Flex Consumption, cobra por uso.

## 4. Cómo funciona

1. Un archivo nuevo llega a `raw/` en la cuenta del lake.
2. Event Grid avisa y el blob trigger dispara `limpiar_ventas`.
3. La función lee el blob, descarta líneas inválidas y escribe el resultado en `curated/` con el mismo nombre, por el binding de salida.
4. El recibo marca el blob como procesado; si la función falla, se reintenta y, al agotar los reintentos, el blob va a la cola de mensajes venenosos.

## 5. Cuándo utilizarlo

- Limpiezas, validaciones o copias chicas al llegar un archivo.
- Consumir mensajes de colas o eventos con lógica corta.
- Pegamento entre servicios.

## 6. Cuándo no utilizarlo

- Respuestas HTTP que tardan más de 230 segundos.
- Transformaciones distribuidas de grandes volúmenes: Spark.
- Proyectos nuevos en el plan Consumption: su página lo marca como legacy.

## 7. Ejemplo sencillo

Un proveedor deja `raw/lote-01.jsonl`. La función escribe `curated/lote-01.jsonl` solo con las filas válidas y los montos redondeados. Si el mismo blob se vuelve a escribir, la función corre de nuevo y sobrescribe la salida.

## 8. Ejemplo de producción

Una function app en Flex Consumption con Python 3.12 e identidad administrada:

- blob trigger por Event Grid sobre `raw/`;
- salida en otro contenedor, para que la función no se dispare a sí misma;
- los blobs que agotan los reintentos se revisan desde la cola de mensajes venenosos;
- la identidad tiene acceso solo a esos dos contenedores.

## 9. Arquitectura

```mermaid
flowchart LR
  R["Contenedor raw/"] -- "Event Grid" --> F["Function app (Flex Consumption)<br/>limpiar_ventas"]
  F -- "binding de salida" --> C["Contenedor curated/"]
  F -. "recibos" .-> H["azure-webjobs-hosts"]
  F -. "agotó reintentos" .-> P["Cola de mensajes venenosos"]
```

## 10. Código

```python
# Python 3.12, modelo de programación v2 de Azure Functions (no ejecutado: requiere el host de Functions y una cuenta de
# almacenamiento; no se desplegó). Un blob nuevo en raw/ dispara la función, que escribe su versión limpia en curated/
# con el mismo nombre (otro contenedor: la salida no vuelve a disparar la función; un reintento sobrescribe).
import json

import azure.functions as func

app = func.FunctionApp()


def limpiar(texto: str) -> str:
    filas = []
    for linea in texto.splitlines():
        try:
            fila = json.loads(linea)
        except json.JSONDecodeError:
            continue
        if isinstance(fila, dict) and "id" in fila and isinstance(fila.get("monto"), (int, float)):
            filas.append(json.dumps({"id": fila["id"], "monto": round(float(fila["monto"]), 2)}))
    return "".join(f + "\n" for f in filas)


@app.blob_trigger(arg_name="entrada", path="raw/{name}", connection="LakeStorage", source="EventGrid")
@app.blob_output(arg_name="salida", path="curated/{name}", connection="LakeStorage")
def limpiar_ventas(entrada: func.InputStream, salida: func.Out[str]) -> None:
    salida.set(limpiar(entrada.read().decode("utf-8")))
```

```hcl
# Terraform (validado en la CI con terraform validate, sin credenciales; no se aplicó): function app en el plan Flex
# Consumption, el que su página recomienda para apps serverless nuevas, con Python e identidad administrada.
# Requiere: provider hashicorp/azurerm ~> 5.0; grupo de recursos y cuenta de almacenamiento existentes.
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

variable "storage_blob_endpoint" {
  type        = string
  description = "Endpoint de Blob de la cuenta de almacenamiento de la app (https://<cuenta>.blob.core.windows.net)"
}

resource "azurerm_service_plan" "flex" {
  name                = "dekh-func-flex"
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "FC1"
}

resource "azurerm_function_app_flex_consumption" "ventas" {
  name                        = "dekh-func-ventas"
  resource_group_name         = var.resource_group_name
  location                    = var.location
  service_plan_id             = azurerm_service_plan.flex.id
  storage_container_type      = "blobContainer"
  storage_container_endpoint  = "${var.storage_blob_endpoint}/deployments"
  storage_authentication_type = "SystemAssignedIdentity"
  runtime_name                = "python"
  runtime_version             = "3.12"
  maximum_instance_count      = 40
  instance_memory_in_mb       = 2048

  identity {
    type = "SystemAssigned"
  }

  site_config {}
}
```

El script en Python 3.12 con el modelo v2 **no se ejecutó**: necesita el host de Azure Functions y una cuenta de almacenamiento, y no se desplegó (ADR-013). Los parámetros del decorador (`path`, `connection`, `source="EventGrid"`) son los de la página del blob trigger.

El bloque de Terraform se valida en la CI con `terraform validate`, sin credenciales (`make validate-terraform`), y **no se aplicó**.

## 11. GCP

No aplica de forma específica: esta ficha describe Azure Functions. Lo más cercano en GCP es Cloud Run (ver `cloud-run-for-data`). Las diferencias, según sus páginas:

| | Azure Functions | Cloud Run |
|---|---|---|
| Modelo | Function app con triggers y bindings declarativos | Services, jobs, worker pools e instances; las funciones son una forma de desplegar código como service |
| Disparo por archivo | Blob trigger por Event Grid o por sondeo | Un service que recibe el evento por HTTP |
| Recursos | Planes de hosting (Flex Consumption recomendado) | Contenedores administrados por Cloud Run |

## 12. AWS

No aplica de forma específica. Lo más cercano es Lambda (ver `lambda-for-data`). Las diferencias, según sus páginas:

| | Azure Functions | Lambda |
|---|---|---|
| Duración máxima | Sin máximo en Flex, Premium y Dedicated (30 minutos por defecto); 230 segundos para responder HTTP | 15 minutos |
| Disparo por archivo | Blob trigger (Event Grid o sondeo), con recibos para no repetir | Notificación de S3, invocación asíncrona; advertencia de bucles si escribe en el mismo bucket |
| Reintentos | Según el trigger: extensión (Blob, Queue), política por función (Event Hubs, Kafka) | Dos en asíncrona; lote completo en streams; los fija la cola en SQS |

## 13. Azure

**Azure Functions.** Los planes, el timeout, los triggers y bindings, el blob trigger con Event Grid y recibos, los reintentos y el modelo v2 de Python son los de sus páginas.

## 14. Buenas prácticas

- Flex Consumption para apps serverless nuevas, como recomienda su página.
- Blob trigger por Event Grid y salida en otro contenedor.
- Funciones sin estado y defensivas, y nada de procesos largos dentro de una función.
- Revisar la cola de mensajes venenosos.
- **Seguridad:** identidad administrada para la function app y conexiones sin claves; acceso solo a los contenedores que usa.
- **Observabilidad:** seguir ejecuciones fallidas, duración y mensajes venenosos; un aumento indica datos de entrada inválidos.
- **Costo:** depende del plan de hosting. Según *Azure Functions pricing* (consultada el 2026-10-14), en Flex Consumption las instancias bajo demanda se cobran por la memoria aprovisionada mientras ejecutan funciones y por el número de ejecuciones; las instancias siempre listas suman la memoria de base mientras están inactivas. Los montos no se copian.

## 15. Errores frecuentes

- Escribir la salida en el mismo contenedor que dispara la función.
- Crear apps nuevas en el plan Consumption legacy.
- Una función HTTP que tarda más de 230 segundos.
- Ignorar la cola de mensajes venenosos.

## 16. Trade-offs

Functions dispara código con poco esfuerzo y bindings declarativos, a cambio de los límites de cada plan y de un modelo de reintentos que cambia por trigger. Container Apps aguanta procesos más largos y contenedores propios, con más que configurar.

## 17. Conceptos relacionados

- `lambda-for-data` y `cloud-run-for-data`: lo más cercano en AWS y GCP.
- `event-driven-pipelines` e `idempotency`: el patrón y su requisito.
- `adls-gen2-storage`: el lake donde llegan los archivos.

## 18. Preguntas técnicas abiertas

1. ¿Qué paso de tu pipeline es corto y reactivo, y podría ser una función?
2. ¿Qué haces con un blob que agota los reintentos?
3. ¿Cuándo pasarías una función a un job de Container Apps?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Microsoft Learn, Azure Functions: *What is Azure Functions?*, *Azure Functions hosting options*, *Azure Functions triggers and bindings*, *Azure Blob storage trigger for Azure Functions*, *Azure Functions error handling and retries*, *Azure Functions developer reference guide for Python apps* y *Best practices for reliable Azure Functions*; *Azure Functions pricing*.
- AWS, Lambda: *Lambda quotas*, *Understanding retry behavior in Lambda* y *Process Amazon S3 event notifications with Lambda*. Google Cloud, Cloud Run: *What is Cloud Run* y *Deployment options and resource model*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-14. Pasa a `verified`: revisión B-F3.1 del lote F3b-10b aplicada, sin VERIFY pendientes.

## 22. Historial de cambios importantes

- 2026-10-13: creación (lote F3b-10b).
- 2026-10-14: revisión B-F3.1 del lote F3b-10b aplicada (docs/reviews/cards-f3b-10b.md): el costo de Flex Consumption cita *Azure Functions pricing* (2026-10-14), sin montos.
- 2026-10-14: `verification_status: verified` (sin VERIFY pendientes).
