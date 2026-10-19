---
id: concept:message-brokers
slug: message-brokers
type: concept
title: Brokers de mensajes
description: "Qué hace un broker según la documentación de Kafka 4.3: los brokers son la capa de almacenamiento de un clúster, guardan los eventos de forma durable por un tiempo configurable y replican cada partición (en producción, factor 3). Ejemplo ejecutado contra un broker Kafka real en Docker: retención por topic y un factor de replicación que un solo broker no puede cumplir. Pub/Sub, Kinesis, MSK y Event Hubs como brokers administrados, con cobro sin montos."
domain: streaming
subdomain: streaming-fundamentals
category: streaming
classification: core
level: intermediate
importance: high
cloud: [agnostic]
technologies: [apache-kafka, gcp-pubsub, aws-kinesis, aws-msk, azure-event-hubs]
tags: [brokers, kafka, kraft, replication, retention, managed-streaming]
related_topics: [producers-and-consumers]
sources:
  - source: apache-kafka-docs
    url: https://kafka.apache.org/43/getting-started/introduction/
    accessed: 2026-10-19
    page_title: "Introduction"
    note: "Introduction (Kafka 4.3): Kafka es un sistema distribuido de servidores y clientes; algunos servidores forman la capa de almacenamiento, los brokers; un clúster es escalable y tolerante a fallas. Todo topic puede replicarse para que varios brokers tengan una copia; «A common production setting is a replication factor of 3»; la replicación es por partición."
  - source: apache-kafka-docs
    url: https://kafka.apache.org/43/configuration/topic-configs/
    accessed: 2026-10-19
    page_title: "Topic Configs"
    note: "Topic Configs (Kafka 4.3): retention.ms es el tiempo máximo que se retiene un log antes de descartar segmentos viejos con la política delete; con -1 no hay límite de tiempo."
  - source: apache-kafka-docs
    url: https://kafka.apache.org/43/getting-started/docker/
    accessed: 2026-10-19
    page_title: "Docker"
    note: "Docker (Kafka 4.3): la imagen apache/kafka arranca un broker con la configuración por defecto en el puerto 9092 con docker run -p 9092:9092 apache/kafka:4.3.1."
  - source: apache-kafka-docs
    url: https://kafka.apache.org/43/operations/kraft/
    accessed: 2026-10-19
    page_title: "KRaft"
    note: "KRaft (Kafka 4.3): en modo KRaft cada servidor es controller, broker o ambos (process.roles); los controllers participan en el quorum de metadatos, uno activo y los demás en espera; se suelen elegir 3 o 5; un servidor que es broker y controller a la vez es un servidor combinado."
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/subscription-properties
    accessed: 2026-10-02
    page_title: "Subscription properties"
    note: "Retención de mensajes: 7 días por defecto, mínimo 10 minutos, máximo 31 días; retener mensajes sin confirmar más de 24 horas tiene cargo adicional. Expiración: 31 días por defecto, mínimo 1 día, o nunca. Ack deadline: 10 s por defecto, mínimo 10 s, máximo 600 s. El filtro usa atributos, no el cuerpo; los mensajes que no coinciden se confirman automáticamente y el filtro no se puede cambiar ni quitar después."
  - source: gcp-pubsub-docs
    url: https://cloud.google.com/pubsub/pricing
    accessed: 2026-10-19
    page_title: "Pub/Sub pricing"
    note: "Pub/Sub pricing (consultada el 2026-10-19): tres componentes, throughput de publicación y entrega, transferencia de datos que cruza zonas o regiones y almacenamiento de mensajes retenidos; se cobra por uso (bytes publicados, entregados o guardados). Los montos no se copian."
  - source: aws-kinesis-docs
    url: https://docs.aws.amazon.com/streams/latest/dev/how-do-i-size-a-stream.html
    accessed: 2026-10-12
    page_title: "Choose the right mode to stream in"
    note: "Choose the right mode to stream in: tres modos. On-demand Standard escala solo, sin planificar capacidad. On-demand Advantage es una configuración de cuenta por región para todos los streams on-demand: permite calentar la capacidad de escritura y cambia la estructura de precios (sin cargo fijo por stream). Provisioned exige indicar la cantidad de shards, ajustable con UpdateShardCount; para tráfico predecible y control fino del reparto entre shards."
  - source: aws-kinesis-docs
    url: https://aws.amazon.com/kinesis/data-streams/pricing/
    accessed: 2026-10-12
    page_title: "Amazon Kinesis Data Streams pricing"
    note: "Amazon Kinesis Data Streams pricing: precios por modo de capacidad, por datos escritos y leídos, retención extendida y enhanced fan-out. Los montos no se copian."
  - source: aws-msk-docs
    url: https://docs.aws.amazon.com/msk/latest/developerguide/what-is-msk.html
    accessed: 2026-10-12
    page_title: "Welcome to the Amazon MSK Developer Guide"
    note: "Welcome to the Amazon MSK Developer Guide: servicio administrado para construir y ejecutar aplicaciones que usan Apache Kafka; MSK da las operaciones del plano de control (crear, actualizar, borrar clústeres) y deja usar las operaciones del plano de datos de Kafka (producir y consumir). Ejecuta versiones de código abierto de Kafka, así que las aplicaciones, herramientas y plugins existentes funcionan sin cambiar el código."
  - source: aws-msk-docs
    url: https://aws.amazon.com/msk/pricing/
    accessed: 2026-10-12
    page_title: "Amazon MSK pricing"
    note: "Amazon MSK pricing: precios de clústeres provisionados (por broker y almacenamiento), de MSK Serverless y de MSK Connect. Los montos no se copian."
  - source: azure-event-hubs-docs
    url: https://learn.microsoft.com/en-us/azure/event-hubs/azure-event-hubs-apache-kafka-overview
    accessed: 2026-10-13
    page_title: "What is Azure Event Hubs for Apache Kafka?"
    note: "What is Azure Event Hubs for Apache Kafka?: cada event hub expone un endpoint de Kafka; muchas aplicaciones de Kafka se conectan sin cambiar el código, solo la configuración (la cadena de conexión)."
  - source: azure-event-hubs-docs
    url: https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-scalability
    accessed: 2026-10-13
    page_title: "Scaling with Event Hubs"
    note: "Scaling with Event Hubs: en Standard, la capacidad son throughput units prepagadas; cada una da hasta 1 MB/s o 1.000 eventos por segundo de entrada y hasta 2 MB/s o 4.096 eventos por segundo de salida; al superarla, la entrada se limita con ServiceBusy. Premium usa processing units."
  - source: azure-event-hubs-docs
    url: https://azure.microsoft.com/en-us/pricing/details/event-hubs/
    accessed: 2026-10-13
    page_title: "Event Hubs pricing"
    note: "Event Hubs pricing: precios por nivel (Basic, Standard, Premium, Dedicated), unidades de capacidad, eventos de entrada y Capture. Los montos no se copian."
relations:
  - type: RELATED_TO
    target: producers-and-consumers
    note: El broker queda entre productores y consumidores.
  - type: RELATED_TO
    target: topics-and-partitions
    note: El broker guarda y replica particiones.
  - type: RELATED_TO
    target: msk-managed-kafka
    note: Kafka administrado en AWS.
  - type: RELATED_TO
    target: kinesis-data-streams
    note: El broker propio de AWS.
  - type: RELATED_TO
    target: event-hubs-streaming
    note: El broker de Azure, con endpoint de Kafka.
  - type: RELATED_TO
    target: pubsub-topics-and-subscriptions
    note: El broker de GCP.
created_at: 2026-10-19
updated_at: 2026-10-19
last_verified: 2026-10-19
verification_status: review_required
---

## 1. Resumen

Un broker es el servicio que recibe los eventos de los productores, los guarda y los entrega a los consumidores. En Kafka, los brokers son la capa de almacenamiento del clúster.

Dos responsabilidades definen a un broker:

- **retención:** cuánto tiempo guarda los eventos, configurable por topic (`retention.ms`);
- **replicación:** cuántas copias tiene cada partición en brokers distintos; según la documentación, «A common production setting is a replication factor of 3».

En la nube, el broker se compra administrado: Pub/Sub, Kinesis Data Streams, Amazon MSK (Kafka administrado) y Event Hubs (con endpoint de Kafka). No son equivalentes: cambian la retención, la capacidad y el cobro.

## 2. Qué es

- **Broker:** un servidor que guarda particiones y atiende a productores y consumidores.
- **Clúster:** varios brokers; en KRaft, algunos servidores son controllers y forman el quorum de metadatos (3 o 5, por lo general).
- **Líder y réplicas:** cada partición tiene un broker líder y copias en otros brokers.
- **Factor de replicación:** la cantidad de copias de cada partición.
- **Retención:** el tiempo (o tamaño) que el broker guarda los eventos antes de descartarlos.

## 3. Problema que resuelve

Si los productores escribieran directo a los consumidores, un consumidor caído perdería eventos y uno lento frenaría al productor. El broker los guarda en forma durable, con copias en varios servidores, para que nadie dependa de que el otro esté disponible en ese momento.

## 4. Cómo funciona

1. El topic se crea con particiones, un factor de replicación y una retención.
2. Cada partición tiene un líder; el productor escribe en el líder y las réplicas copian.
3. Los consumidores leen del broker a su ritmo.
4. Los segmentos más viejos que la retención se descartan.
5. Si un broker cae, otra réplica toma el lugar de líder.

## 5. Cuándo utilizarlo

- Integrar productores y consumidores que no deben depender entre sí.
- Guardar eventos el tiempo suficiente para reprocesar o para que un consumidor caído se ponga al día.
- Un servicio administrado cuando el equipo no quiere operar un clúster.

## 6. Cuándo no utilizarlo

- Un clúster de Kafka propio para un volumen que un servicio administrado cubre.
- Factor de replicación 1 en producción: un broker caído deja la partición sin datos disponibles.
- Como base de datos de consulta: el broker guarda eventos en orden, no responde consultas.

## 7. Ejemplo sencillo

En un broker Kafka de un nodo se crea `logs-app` con 2 particiones, factor de replicación 1 y retención de un día. Cada partición tiene el broker 1 como líder y única réplica. El contenedor corre un servidor combinado (broker y controller). Pedir un factor de replicación 3 falla: con un solo broker no hay dónde poner las otras dos copias.

## 8. Ejemplo de producción

Un clúster de streaming de un equipo de datos:

- tres brokers como mínimo, en zonas distintas, con factor de replicación 3;
- retención por topic según para qué se usa: horas para métricas, días para pagos;
- un servicio administrado (MSK, Event Hubs o Pub/Sub) en lugar de operar los brokers;
- alertas si una partición queda con menos réplicas sincronizadas que las esperadas.

## 9. Arquitectura

```mermaid
flowchart LR
  P["Productores"] --> L["Broker 1<br/>líder P0"]
  L -- "replica" --> B2["Broker 2<br/>réplica P0"]
  L -- "replica" --> B3["Broker 3<br/>réplica P0"]
  L --> C["Consumidores"]
  R["retention.ms"] -. "descarta lo viejo" .-> L
```

## 10. Código

```bash
# Bash y Kafka (ejecutado en la CI con un broker Kafka 4.3.1 en KRaft, en Docker; ADR-017): el broker guarda los eventos
# por un tiempo configurable por topic y replica cada partición en tantos brokers como pida el factor de replicación.
set -euo pipefail
K="${KAFKA_CONTAINER:-dekh-kafka}"
kafka() { docker exec -i "$K" /opt/kafka/bin/"$1" --bootstrap-server localhost:9092 "${@:2}"; }
trap 'kafka kafka-topics.sh --delete --topic logs-app > /dev/null 2>&1 || true' EXIT

kafka kafka-topics.sh --create --topic logs-app --partitions 2 --replication-factor 1 \
  --config retention.ms=86400000 > /dev/null                                   # retiene 1 día
kafka kafka-topics.sh --describe --topic logs-app |
  awk -F'\t' '/^\tTopic/ {print $3 " → " $4 ", " $5}'                      # una línea por partición: líder y réplicas
kafka kafka-configs.sh --describe --entity-type topics --entity-name logs-app | grep -o 'retention.ms=[0-9]*' | head -1

# Con un solo broker, un factor de replicación 3 no se puede cumplir.
{ kafka kafka-topics.sh --create --topic logs-replicado --partitions 1 --replication-factor 3 2>&1 || true; } |
  grep -o 'The target replication factor of 3 cannot be reached because only 1 broker(s) are registered' | head -1
```

El script se **ejecuta en la CI contra un broker Kafka 4.3.1 en KRaft, en Docker** (ADR-017). Imprime el líder y las réplicas de cada partición, `retention.ms=86400000` y el error de Kafka ante un factor de replicación 3 con un solo broker.

## 11. GCP

En GCP, **Pub/Sub** es el broker administrado. Las diferencias con Kafka, según *Subscription properties* y *Pub/Sub pricing* (no ejecutado):

| | Kafka | Pub/Sub |
|---|---|---|
| Qué se opera | Brokers y su replicación, o un servicio administrado | Nada: topics y suscripciones |
| Retención | `retention.ms` por topic | Por suscripción: 7 días por defecto, de 10 minutos a 31 días |
| Cobro (consultado el 2026-10-19) | La infraestructura | Throughput de publicación y entrega, transferencia entre zonas o regiones y almacenamiento de mensajes retenidos |

## 12. AWS

En AWS hay dos brokers administrados, **Kinesis Data Streams** y **Amazon MSK**. Según *Choose the right mode to stream in*, *Amazon Kinesis Data Streams pricing*, *Welcome to the Amazon MSK Developer Guide* y *Amazon MSK pricing* (no ejecutado):

| | Kinesis Data Streams | Amazon MSK |
|---|---|---|
| Qué es | El servicio de streaming propio de AWS, con shards | Kafka de código abierto administrado: AWS opera el plano de control y se usa la API de Kafka |
| Capacidad | On-demand Standard, On-demand Advantage o Provisioned | Clústeres provisionados o MSK Serverless |
| Cobro (consultado el 2026-10-12) | Por modo de capacidad, datos escritos y leídos, retención extendida y enhanced fan-out | Por broker y almacenamiento, MSK Serverless y MSK Connect |

## 13. Azure

En Azure, **Event Hubs** es el broker administrado, con un endpoint de Kafka. Según *What is Azure Event Hubs for Apache Kafka?*, *Scaling with Event Hubs* y *Event Hubs pricing* (no ejecutado):

| | Kafka | Event Hubs |
|---|---|---|
| Protocolo | Kafka | Propio y un endpoint de Kafka: muchas aplicaciones de Kafka se conectan cambiando solo la configuración |
| Capacidad | Brokers | Standard: throughput units; Premium: processing units |
| Cobro (consultado el 2026-10-13) | La infraestructura | Por nivel (Basic, Standard, Premium, Dedicated), unidades de capacidad, eventos de entrada y Capture |

## 14. Buenas prácticas

- Factor de replicación 3 en producción, como sugiere la documentación de Kafka.
- Retención definida por topic, según cuánto atrás hace falta reprocesar.
- Un broker administrado salvo que haya una razón para operar Kafka.
- **Seguridad:** autenticación de clientes y permisos por topic; cifrado en tránsito.
- **Observabilidad:** particiones con réplicas atrasadas, espacio en disco y lag de los consumidores.
- **Costo:** la retención es almacenamiento y la replicación lo multiplica; en los servicios administrados se paga además el throughput o la capacidad (consultado el 2026-10-19 en Pub/Sub; ver las fechas de cada tabla).

## 15. Errores frecuentes

- Factor de replicación 1 copiado de un entorno de desarrollo a producción.
- Retención más corta que el tiempo que un consumidor puede estar caído.
- Suponer que Event Hubs es Kafka: expone el protocolo, pero su capacidad y su cobro son los suyos.
- Operar un clúster propio sin alertas de réplicas.

## 16. Trade-offs

Más réplicas dan durabilidad y disponibilidad, a cambio de almacenamiento y escritura más lenta. Más retención permite reprocesar más atrás y cuesta más. Operar Kafka da control total; un servicio administrado quita operación y fija límites y precios propios.

## 17. Conceptos relacionados

- `producers-and-consumers`: los clientes del broker.
- `topics-and-partitions`: lo que el broker guarda y replica.
- `msk-managed-kafka`: Kafka administrado en AWS.
- `kinesis-data-streams`: el broker propio de AWS.
- `event-hubs-streaming`: el broker de Azure.
- `pubsub-topics-and-subscriptions`: el broker de GCP.

## 18. Preguntas técnicas abiertas

1. ¿Cuánto tiempo puede estar caído tu consumidor antes de perder eventos por la retención?
2. ¿Con qué factor de replicación corren tus topics de producción?
3. ¿Qué te daría operar Kafka que no te da un servicio administrado?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Apache Kafka 4.3: *Introduction*, *Topic Configs*, *Docker* y *KRaft*.
- Google Cloud: *Subscription properties* y *Pub/Sub pricing*.
- AWS: *Choose the right mode to stream in*, *Amazon Kinesis Data Streams pricing*, *Welcome to the Amazon MSK Developer Guide* y *Amazon MSK pricing*.
- Microsoft Learn: *What is Azure Event Hubs for Apache Kafka?*, *Scaling with Event Hubs* y *Event Hubs pricing*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-19. `review_required`: pendiente de revisión B-F3.1 del lote F3b-14a.

## 22. Historial de cambios importantes

- 2026-10-19: creación (lote F3b-14a).
