---
id: concept:event-hubs-streaming
slug: event-hubs-streaming
type: concept
title: Streaming con Event Hubs
description: "Cómo funciona Azure Event Hubs según su documentación: plataforma de streaming administrada con compatibilidad con Apache Kafka, particiones con partition key (hash estático) o asignación round-robin, grupos de consumidores como vistas independientes del stream, checkpoints a cargo del consumidor, retención por nivel (Standard hasta 7 días, Premium y Dedicated hasta 90), capacidad en throughput units o processing units y Capture hacia Blob o ADLS en Avro. Los precios se consultan en su página."
domain: azure
subdomain: streaming-and-compute
category: azure
classification: modern
level: intermediate
importance: medium
cloud: [azure]
technologies: [azure-event-hubs, apache-kafka, python, terraform]
tags: [event-hubs, streaming, partitions, consumer-groups, kafka]
related_topics: [streaming-ingestion, pubsub-topics-and-subscriptions, kinesis-data-streams]
sources:
  - source: azure-event-hubs-docs
    url: https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-about
    accessed: 2026-10-13
    page_title: "What is Azure Event Hubs?"
    note: "What is Azure Event Hubs?: plataforma de streaming de datos en tiempo real totalmente administrada, que ingiere millones de eventos por segundo con baja latencia; con compatibilidad nativa con Apache Kafka, permite correr cargas de Kafka sin cambiar el código ni administrar clústeres."
  - source: azure-event-hubs-docs
    url: https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-features
    accessed: 2026-10-13
    page_title: "Event Hubs features and terminology"
    note: "Event Hubs features and terminology: la partition key la da el emisor y pasa por una función de hash estática que asigna la partición; sin partition key, la asignación es round-robin; cambiar el mapeo de claves a particiones cambia la distribución, algo a evitar si importa el orden relativo. Un grupo de consumidores es una vista independiente del stream; hasta 5 receptores sin epoch pueden leer la misma partición dentro de un grupo. El checkpoint es responsabilidad del consumidor: el servicio da offsets y el consumidor los guarda (por ejemplo, en Blob Storage, un contenedor por grupo). Retención por tiempo: Standard 1 hora por defecto y 7 días como máximo; Premium y Dedicated, hasta 90 días; los eventos no se pueden borrar a mano."
  - source: azure-event-hubs-docs
    url: https://learn.microsoft.com/en-us/azure/event-hubs/azure-event-hubs-apache-kafka-overview
    accessed: 2026-10-13
    page_title: "What is Azure Event Hubs for Apache Kafka?"
    note: "What is Azure Event Hubs for Apache Kafka?: cada event hub expone un endpoint de Kafka; muchas aplicaciones de Kafka se conectan sin cambiar el código, solo la configuración (la cadena de conexión)."
  - source: azure-event-hubs-docs
    url: https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quotas
    accessed: 2026-10-13
    page_title: "Azure Event Hubs quotas and limits"
    note: "Azure Event Hubs quotas and limits: tamaño máximo de publicación 256 KB en Basic y 1 MB en Standard y Premium; grupos de consumidores por event hub 1 (Basic), 20 (Standard), 100 (Premium); grupos de consumidores de Kafka por namespace: no aplica en Basic, 1.000 en Standard y Premium."
  - source: azure-event-hubs-docs
    url: https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-scalability
    accessed: 2026-10-13
    page_title: "Scaling with Event Hubs"
    note: "Scaling with Event Hubs: en Standard, la capacidad son throughput units prepagadas; cada una da hasta 1 MB/s o 1.000 eventos por segundo de entrada y hasta 2 MB/s o 4.096 eventos por segundo de salida; al superarla, la entrada se limita con ServiceBusy. Premium usa processing units."
  - source: azure-event-hubs-docs
    url: https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-capture-overview
    accessed: 2026-10-13
    page_title: "Capture events through Azure Event Hubs in Azure Blob Storage or Azure Data Lake Storage"
    note: "Capture events through Azure Event Hubs in Azure Blob Storage or Azure Data Lake Storage: Capture guarda automáticamente el stream en Azure Blob Storage o ADLS, por intervalo de tiempo o de tamaño, en formato Avro, y escala con la capacidad del event hub."
  - source: azure-event-hubs-docs
    url: https://azure.microsoft.com/en-us/pricing/details/event-hubs/
    accessed: 2026-10-13
    page_title: "Event Hubs pricing"
    note: "Event Hubs pricing: precios por nivel (Basic, Standard, Premium, Dedicated), unidades de capacidad, eventos de entrada y Capture. Los montos no se copian."
  - source: aws-kinesis-docs
    url: https://docs.aws.amazon.com/streams/latest/dev/key-concepts.html
    accessed: 2026-10-12
    page_title: "Amazon Kinesis Data Streams Terminology and concepts"
    note: "Terminology and concepts: un stream es un conjunto de shards; cada shard admite hasta 5 transacciones de lectura por segundo, hasta 2 MB/s de lectura, y hasta 1.000 registros y 1 MB/s de escritura (incluidas las partition keys). Un registro tiene número de secuencia, partition key y un blob inmutable de hasta 1 MB. La partition key (hasta 256 caracteres Unicode) se pasa por MD5 a un entero de 128 bits que elige el shard. La retención por defecto es de 24 horas, ampliable hasta 8.760 horas (365 días). La Kinesis Client Library asigna un procesador por shard y guarda metadatos en tablas de DynamoDB."
  - source: aws-kinesis-docs
    url: https://docs.aws.amazon.com/streams/latest/dev/how-do-i-size-a-stream.html
    accessed: 2026-09-30
    page_title: "Choose the right mode to stream in"
    note: "Kinesis Data Streams ofrece los modos On-demand Standard, On-demand Advantage y Provisioned, y permite cambiar entre ellos."
  - source: aws-msk-docs
    url: https://docs.aws.amazon.com/msk/latest/developerguide/what-is-msk.html
    accessed: 2026-10-12
    page_title: "Welcome to the Amazon MSK Developer Guide"
    note: "Welcome to the Amazon MSK Developer Guide: servicio administrado para construir y ejecutar aplicaciones que usan Apache Kafka; MSK da las operaciones del plano de control (crear, actualizar, borrar clústeres) y deja usar las operaciones del plano de datos de Kafka (producir y consumir). Ejecuta versiones de código abierto de Kafka, así que las aplicaciones, herramientas y plugins existentes funcionan sin cambiar el código."
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/subscription-properties
    accessed: 2026-10-02
    page_title: "Subscription properties"
    note: "Retención de mensajes: 7 días por defecto, mínimo 10 minutos, máximo 31 días; retener mensajes sin confirmar más de 24 horas tiene cargo adicional. Expiración: 31 días por defecto, mínimo 1 día, o nunca. Ack deadline: 10 s por defecto, mínimo 10 s, máximo 600 s. El filtro usa atributos, no el cuerpo; los mensajes que no coinciden se confirman automáticamente y el filtro no se puede cambiar ni quitar después."
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/ordering
    accessed: 2026-09-30
    page_title: "Order messages"
    note: "El orden se define por ordering key (hasta 1 KB); hay que publicar en la misma región y habilitar el orden en la suscripción; mensajes sin clave no se ordenan; la reentrega de un mensaje provoca la reentrega de todos los posteriores de esa clave, incluso los ya confirmados."
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/subscriber
    accessed: 2026-10-02
    page_title: "Choose a subscription type"
    note: "En una suscripción pull, varios suscriptores pueden hacer pull de la misma suscripción y cada uno recibe un subconjunto de los mensajes; las suscripciones de export balancean la carga automáticamente."
  - source: aws-kinesis-docs
    url: https://docs.aws.amazon.com/kinesis/latest/APIReference/API_PutRecords.html
    accessed: 2026-10-12
    page_title: "PutRecords"
    note: "PutRecords (API Reference): la respuesta trae un registro por cada uno enviado, con ShardId y SequenceNumber si se procesó, o ErrorCode (ProvisionedThroughputExceededException o InternalFailure) si no, y FailedRecordCount. Un fallo no detiene el procesamiento de los demás, por eso PutRecords no garantiza el orden; para leer en el orden de escritura, usar PutRecord y escribir al mismo shard. Un registro escrito no se puede modificar ni cambiar de orden."
relations:
  - type: RELATED_TO
    target: streaming-ingestion
    note: Event Hubs es el bus de ingesta de streaming de Azure.
  - type: RELATED_TO
    target: kinesis-data-streams
    note: El servicio de streams de AWS, con shards en lugar de particiones y otra retención.
  - type: RELATED_TO
    target: msk-managed-kafka
    note: Kafka administrado en AWS; Event Hubs expone un endpoint de Kafka sin brokers.
  - type: RELATED_TO
    target: pubsub-topics-and-subscriptions
    note: El servicio de mensajería de GCP, sin particiones que elegir.
  - type: RELATED_TO
    target: checkpoints
    note: El consumidor guarda su avance por partición.
  - type: RELATED_TO
    target: avro-format
    note: Capture escribe en Avro.
  - type: RELATED_TO
    target: adls-gen2-storage
    note: Capture entrega el stream a Blob o ADLS.
created_at: 2026-10-13
updated_at: 2026-10-13
last_verified: 2026-10-14
verification_status: verified
---

## 1. Resumen

**Azure Event Hubs** es la plataforma de streaming administrada de Azure. Según su documentación:

- un event hub tiene **particiones**; con una **partition key**, una función de hash estática elige la partición, así los eventos de una misma clave van juntos; sin clave, la asignación es round-robin;
- cada **grupo de consumidores** es una vista independiente del stream, y el **checkpoint** (dónde quedó cada consumidor) lo guarda el consumidor;
- la **retención** es por tiempo: en Standard, de 1 hora por defecto a 7 días; en Premium y Dedicated, hasta 90 días;
- expone un **endpoint de Kafka**: muchas aplicaciones de Kafka se conectan cambiando solo la configuración;
- **Capture** guarda el stream en Blob o ADLS en Avro, sin código.

## 2. Qué es

- **Namespace y event hub:** el namespace agrupa event hubs y define el nivel (Basic, Standard, Premium, Dedicated).
- **Partición:** secuencia ordenada de eventos; la partition key decide la partición por hash.
- **Grupo de consumidores:** vista independiente; hasta 5 receptores sin epoch por partición dentro de un grupo. Standard admite 20 grupos por event hub; Basic, 1.
- **Checkpoint:** el servicio da offsets; el consumidor los guarda, por ejemplo en Blob Storage, un contenedor por grupo.
- **Capacidad:** en Standard, throughput units: cada una, hasta 1 MB/s o 1.000 eventos/s de entrada y 2 MB/s o 4.096 eventos/s de salida. Premium usa processing units.
- **Tamaño de evento:** hasta 1 MB en Standard y Premium (256 KB en Basic).
- **Kafka:** endpoint de Kafka por event hub; no disponible en Basic.
- **Capture:** entrega a Blob o ADLS en Avro, por tiempo o tamaño.

## 3. Problema que resuelve

Recibir eventos continuos de muchos productores, guardarlos ordenados por clave durante un tiempo y dejar que varias aplicaciones los lean a su ritmo, sin operar brokers. Para equipos con clientes de Kafka, sin migrar el código.

## 4. Cómo funciona

1. El productor envía eventos con una partition key (por ejemplo, el id del pedido).
2. Event Hubs aplica el hash y escribe en la partición, en orden.
3. Cada aplicación consumidora tiene su grupo y lee las particiones desde su último checkpoint.
4. Si la entrada supera las throughput units, se limita con `ServiceBusy`.
5. Capture, si está activo, escribe el stream en ADLS en archivos Avro.

## 5. Cuándo utilizarlo

- Ingesta de eventos en Azure con orden por clave y varios consumidores.
- Aplicaciones de Kafka que se quieren llevar a un servicio administrado.
- Archivar el stream en el lake sin escribir un consumidor: Capture.

## 6. Cuándo no utilizarlo

- Retener eventos meses en Standard: el máximo es 7 días.
- Usar el stream como base de datos: los eventos no se pueden borrar ni consultar por clave.
- Necesitar Kafka en Basic: no tiene endpoint de Kafka.

## 7. Ejemplo sencillo

Los eventos de un pedido (`creado`, `pagado`) llevan como partition key el id del pedido, así caen en la misma partición y se leen en orden. Pedidos distintos se reparten entre particiones y se leen en paralelo.

## 8. Ejemplo de producción

Un namespace Standard con 2 throughput units tiene el event hub `pedidos` con 8 particiones y 7 días de retención:

- el grupo `fraude` lee en tiempo real y guarda checkpoints en un contenedor propio;
- Capture escribe en `lake/raw/pedidos/` cada pocos minutos, en Avro;
- una alarma vigila las respuestas `ServiceBusy`, que indican que faltan unidades.

## 9. Arquitectura

```mermaid
flowchart LR
  P["Productores<br/>partition key = pedido"] --> EH["Event hub 'pedidos'<br/>8 particiones"]
  EH --> G1["Grupo 'fraude'<br/>checkpoints en Blob"]
  EH --> K["Clientes Kafka<br/>endpoint de Kafka"]
  EH -- "Capture (Avro)" --> L["ADLS lake/raw/pedidos/"]
```

## 10. Código

```python
# Python 3.12 y azure-eventhub (no ejecutado: el SDK de Event Hubs no tiene emulador en la CI y no se corrió contra
# Azure). Productor: un lote por pedido con partition_key, así todos los eventos de un pedido van a la misma partición.
import json

from azure.eventhub import EventData, EventHubProducerClient
from azure.identity import DefaultAzureCredential

producer = EventHubProducerClient(
    fully_qualified_namespace="dekh-eventos.servicebus.windows.net",
    eventhub_name="pedidos",
    credential=DefaultAzureCredential(),
)
eventos = [{"id_pedido": 7, "estado": "creado"}, {"id_pedido": 7, "estado": "pagado"}]
with producer:
    batch = producer.create_batch(partition_key="7")
    for evento in eventos:
        batch.add(EventData(json.dumps(evento)))
    producer.send_batch(batch)
```

```hcl
# Terraform (validado en la CI con terraform validate, sin credenciales; no se aplicó): namespace Standard, un event
# hub con particiones y retención, y un grupo de consumidores por aplicación.
# Requiere: provider hashicorp/azurerm ~> 5.0; un grupo de recursos existente.
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

resource "azurerm_eventhub_namespace" "eventos" {
  name                = "dekh-eventos"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "Standard"
  capacity            = 2 # throughput units
}

resource "azurerm_eventhub" "pedidos" {
  name              = "pedidos"
  namespace_id      = azurerm_eventhub_namespace.eventos.id
  partition_count   = 8
  message_retention = 7 # días; el máximo de Standard
}

resource "azurerm_eventhub_consumer_group" "fraude" {
  name                = "fraude"
  namespace_name      = azurerm_eventhub_namespace.eventos.name
  eventhub_name       = azurerm_eventhub.pedidos.name
  resource_group_name = var.resource_group_name
}
```

El script en Python 3.12 con `azure-eventhub` **no se ejecutó**: Event Hubs no tiene emulador en la CI (ADR-013) y no se corrió contra Azure. Usa `create_batch(partition_key=...)` para que todos los eventos del pedido vayan a la misma partición.

El bloque de Terraform se valida en la CI con `terraform validate`, sin credenciales (`make validate-terraform`), y **no se aplicó**. La retención de 7 días es el máximo de Standard según *Event Hubs features and terminology*.

## 11. GCP

No aplica de forma específica: esta ficha describe Event Hubs. El equivalente es Pub/Sub (ver `pubsub-topics-and-subscriptions`). Las diferencias, según sus páginas:

| | Event Hubs | Pub/Sub |
|---|---|---|
| Unidad de paralelismo | Particiones; la partition key elige la partición por hash | Sin particiones que elegir; el orden se pide con ordering key y se habilita en la suscripción |
| Lectores | Grupos de consumidores con checkpoints propios | Suscripciones; varios suscriptores de una suscripción pull se reparten los mensajes |
| Retención | Standard: 1 hora por defecto, hasta 7 días; Premium y Dedicated, hasta 90 | En la suscripción: 7 días por defecto, de 10 minutos a 31 días |

## 12. AWS

No aplica de forma específica. Lo más cercano es Kinesis Data Streams (ver `kinesis-data-streams`), y para Kafka, MSK (ver `msk-managed-kafka`). Las diferencias, según sus páginas:

| | Event Hubs | Kinesis Data Streams | MSK |
|---|---|---|---|
| Capacidad | Throughput units (Standard): 1 MB/s o 1.000 eventos/s de entrada cada una | Shards (1 MB/s o 1.000 registros/s de escritura cada uno) o modos on-demand | Brokers de Kafka (provisionado) o serverless |
| Retención | 7 días máximo en Standard, 90 en Premium y Dedicated | De 24 horas a 365 días | Las páginas citadas de MSK no la tratan |
| API de los clientes | La de Event Hubs o el endpoint de Kafka, sin brokers que operar | Su propia API (`PutRecords`, `GetRecords`) | La de Kafka de código abierto |

## 13. Azure

**Azure Event Hubs.** Las particiones, la partition key, los grupos de consumidores, los checkpoints, la retención por nivel, las throughput units, el endpoint de Kafka y Capture son los de sus páginas. Los precios por nivel y unidades se consultan en la página de precios.

## 14. Buenas prácticas

- Partition key con muchos valores y tráfico parejo; no cambiar el número de particiones si importa el orden.
- Un grupo de consumidores por aplicación, con su contenedor de checkpoints.
- Consumidores idempotentes: un consumidor que retoma desde su checkpoint puede releer eventos.
- Capture para archivar en el lake en lugar de un consumidor propio.
- **Seguridad:** identidades administradas y roles por namespace o event hub; nada de cadenas de conexión con claves en el código.
- **Observabilidad:** seguir el retraso de cada grupo de consumidores y las respuestas `ServiceBusy`.
- **Costo:** depende del nivel, las unidades de capacidad, los eventos y Capture. Los montos se consultan en la página de precios.

## 15. Errores frecuentes

- Una partition key constante que manda todo a una partición.
- Varias aplicaciones en el mismo grupo de consumidores pisándose los checkpoints.
- Contar con más de 7 días de retención en Standard.
- Elegir Basic y descubrir que no tiene endpoint de Kafka.

## 16. Trade-offs

Event Hubs no exige operar brokers y acepta clientes de Kafka, a cambio de límites por nivel (retención, grupos, tamaño de evento) y de capacidad comprada en unidades. MSK da Kafka completo con más que operar; Kinesis y Pub/Sub tienen sus propios modelos de capacidad y de lectura.

## 17. Conceptos relacionados

- `streaming-ingestion`: el patrón.
- `kinesis-data-streams`, `msk-managed-kafka` y `pubsub-topics-and-subscriptions`: los equivalentes en AWS y GCP.
- `checkpoints`: el avance del consumidor.
- `avro-format` y `adls-gen2-storage`: el destino de Capture.

## 18. Preguntas técnicas abiertas

1. ¿Qué partition key usarías para tus eventos?
2. ¿Cuántos grupos de consumidores necesitas, y quién guarda sus checkpoints?
3. ¿Te alcanzan 7 días de retención o necesitas Premium?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Microsoft Learn, Azure Event Hubs: *What is Azure Event Hubs?*, *Event Hubs features and terminology*, *What is Azure Event Hubs for Apache Kafka?*, *Azure Event Hubs quotas and limits*, *Scaling with Event Hubs* y *Capture events through Azure Event Hubs in Azure Blob Storage or Azure Data Lake Storage*; *Event Hubs pricing*.
- AWS: *Amazon Kinesis Data Streams Terminology and concepts*, *Choose the right mode to stream in* y *Welcome to the Amazon MSK Developer Guide*.
- Google Cloud, Pub/Sub: *Subscription properties*, *Order messages* y la página de suscriptores; AWS, *PutRecords* (API Reference).

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-14. Pasa a `verified`: revisión B-F3.1 del lote F3b-10a aplicada, sin VERIFY pendientes.

## 22. Historial de cambios importantes

- 2026-10-13: creación (lote F3b-10a).
- 2026-10-14: revisión B-F3.1 del lote F3b-10a aplicada (docs/reviews/cards-f3b-10a.md): filas aprobadas sin cambios en esta ficha.
- 2026-10-14: `verification_status: verified` (sin VERIFY pendientes).
