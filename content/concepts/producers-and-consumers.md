---
id: concept:producers-and-consumers
slug: producers-and-consumers
type: concept
title: Productores y consumidores
description: "Cómo se relacionan productores y consumidores según la documentación de Kafka 4.3: están desacoplados (el productor nunca espera al consumidor), el productor elige la partición y el consumidor pide los datos y lleva su posición; un grupo de consumidores se reparte las particiones y cada grupo lee todo por su cuenta. Ejemplo ejecutado contra un broker Kafka real en Docker. Suscripciones de Pub/Sub, consumidores de Kinesis y grupos de Event Hubs, con sus diferencias."
domain: streaming
subdomain: streaming-fundamentals
category: streaming
classification: core
level: basic
importance: high
cloud: [agnostic]
technologies: [apache-kafka, gcp-pubsub, aws-kinesis, azure-event-hubs]
tags: [producers, consumers, consumer-groups, pull, decoupling, kafka]
related_topics: [events]
sources:
  - source: apache-kafka-docs
    url: https://kafka.apache.org/43/getting-started/introduction/
    accessed: 2026-10-19
    page_title: "Introduction"
    note: "Introduction (Kafka 4.3): «Producers are those client applications that publish (write) events to Kafka, and consumers are those that subscribe to (read and process) these events»; productores y consumidores están totalmente desacoplados y no se conocen, y «producers never need to wait for consumers»; un topic puede tener cero, uno o muchos productores y consumidores."
  - source: apache-kafka-docs
    url: https://kafka.apache.org/43/design/design/
    accessed: 2026-10-19
    page_title: "Design"
    note: "Design (Kafka 4.3): el productor envía directo al broker líder de la partición y el cliente controla a qué partición publica, al azar o con una clave que se hashea a una partición; el consumidor pide datos a los brokers (fetch), indica su offset en cada pedido y controla su posición; cada partición se consume por exactamente un consumidor dentro de cada grupo suscripto."
  - source: apache-kafka-docs
    url: https://kafka.apache.org/43/configuration/consumer-configs/
    accessed: 2026-10-19
    page_title: "Consumer and Share Consumer Configs"
    note: "Consumer and Share Consumer Configs (Kafka 4.3): enable.auto.commit (por defecto true) confirma el offset en segundo plano; auto.offset.reset define qué hacer si no hay offset inicial: earliest, latest (por defecto) o by_duration."
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/subscription-overview
    accessed: 2026-10-02
    page_title: "Subscription overview"
    note: "Para recibir mensajes de un topic hay que crear una suscripción; solo los mensajes publicados después de crearla están disponibles. Un topic puede tener varias suscripciones; una suscripción pertenece a un solo topic. Tipos: pull, push y export (BigQuery, Bigtable en Preview, Cloud Storage); el tipo se puede cambiar después de crearla. Por defecto, entrega at-least-once sin garantía de orden."
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/subscriber
    accessed: 2026-10-02
    page_title: "Choose a subscription type"
    note: "En una suscripción pull, varios suscriptores pueden hacer pull de la misma suscripción y cada uno recibe un subconjunto de los mensajes; las suscripciones de export balancean la carga automáticamente."
  - source: aws-kinesis-docs
    url: https://docs.aws.amazon.com/streams/latest/dev/enhanced-consumers.html
    accessed: 2026-10-12
    page_title: "Develop enhanced fan-out consumers with dedicated throughput"
    note: "Develop enhanced fan-out consumers: cada consumidor con enhanced fan-out recibe hasta 2 MB/s por shard, dedicados, por push (SubscribeToShard), sin competir con los demás; los consumidores compartidos se reparten 2 MB/s por shard. Hasta 20 consumidores con enhanced fan-out por stream en On-demand Standard y Provisioned; hasta 50 en On-demand Advantage."
  - source: azure-event-hubs-docs
    url: https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-features
    accessed: 2026-10-13
    page_title: "Event Hubs features and terminology"
    note: "Event Hubs features and terminology: la partition key la da el emisor y pasa por una función de hash estática que asigna la partición; sin partition key, la asignación es round-robin; cambiar el mapeo de claves a particiones cambia la distribución, algo a evitar si importa el orden relativo. Un grupo de consumidores es una vista independiente del stream; hasta 5 receptores sin epoch pueden leer la misma partición dentro de un grupo. El checkpoint es responsabilidad del consumidor: el servicio da offsets y el consumidor los guarda (por ejemplo, en Blob Storage, un contenedor por grupo). Retención por tiempo: Standard 1 hora por defecto y 7 días como máximo; Premium y Dedicated, hasta 90 días; los eventos no se pueden borrar a mano."
relations:
  - type: DEPENDS_ON
    target: events
    note: Productores y consumidores intercambian eventos.
  - type: RELATED_TO
    target: message-brokers
    note: El broker queda entre los dos.
  - type: RELATED_TO
    target: offsets
    note: El consumidor lleva su posición con offsets.
  - type: RELATED_TO
    target: pubsub-topics-and-subscriptions
    note: En Pub/Sub, cada aplicación lectora tiene su suscripción.
  - type: RELATED_TO
    target: streaming-ingestion
    note: El consumidor como primer paso de una ingesta en streaming.
  - type: RELATED_TO
    target: delivery-semantics
    note: Cuándo confirmar el offset.
created_at: 2026-10-19
updated_at: 2026-10-19
last_verified: 2026-10-19
verification_status: review_required
---

## 1. Resumen

En Kafka, los **productores** escriben eventos y los **consumidores** los leen. Están desacoplados: según la documentación, «producers never need to wait for consumers».

Tres ideas explican casi todo:

- **el productor elige la partición**, al azar o por clave;
- **el consumidor pide los datos y lleva su posición** (su offset) en cada partición;
- **un grupo de consumidores se reparte las particiones**, y cada grupo lee el topic entero por su cuenta.

## 2. Qué es

- **Productor:** la aplicación que publica eventos en un topic.
- **Consumidor:** la aplicación que se suscribe a un topic y procesa sus eventos.
- **Grupo de consumidores:** consumidores con el mismo `group.id`; cada partición la lee uno solo de ellos.
- **Pull:** el consumidor pide los datos al broker (fetch) desde su offset, a su ritmo.
- **Desacople:** el productor no sabe quién lee ni espera a nadie.

## 3. Problema que resuelve

Una app de pedidos llama directo al data warehouse, a facturación y a alertas. Si uno de ellos se cae, la app falla o se atrasa. Con un broker en el medio, la app escribe el pedido una vez y sigue. Cada sistema lee cuando puede, desde donde quedó.

## 4. Cómo funciona

1. El productor envía el evento al broker líder de la partición elegida.
2. El broker lo agrega al log de esa partición.
3. Cada consumidor de un grupo recibe algunas particiones y pide eventos desde su offset.
4. El consumidor confirma su offset (por defecto, en segundo plano con `enable.auto.commit`).
5. Si el consumidor vuelve, retoma desde el offset confirmado; un grupo nuevo empieza según `auto.offset.reset` (por defecto, `latest`).

## 5. Cuándo utilizarlo

- Varios sistemas que necesitan los mismos eventos, cada uno a su ritmo.
- Separar el ritmo de quien produce del ritmo de quien procesa.
- Escalar la lectura: más consumidores en el grupo, hasta una por partición.

## 6. Cuándo no utilizarlo

- Cuando el productor necesita la respuesta del procesamiento para seguir.
- Más consumidores que particiones en un grupo: los que sobran no reciben nada, porque cada partición la lee uno solo.
- Un grupo compartido por dos aplicaciones distintas: se reparten los eventos en vez de recibirlos todos.

## 7. Ejemplo sencillo

El productor escribe tres pedidos en `pedidos` sin ningún consumidor conectado. El grupo `carga-dwh` lee los tres. Si vuelve a leer, no hay nada nuevo: ya confirmó sus offsets. El grupo `alertas`, que nunca había leído, recibe los tres.

## 8. Ejemplo de producción

Un topic `pedidos` con 12 particiones:

- la app de pedidos produce con clave = id del pedido;
- el grupo `carga-dwh` corre 4 consumidores que se reparten las 12 particiones;
- el grupo `antifraude` corre aparte, con su propia posición;
- si `carga-dwh` se detiene una hora, al volver retoma desde su offset sin afectar a `antifraude`.

## 9. Arquitectura

```mermaid
flowchart LR
  P["Productor<br/>app de pedidos"] --> T["Topic pedidos<br/>P0 · P1 · P2"]
  T -- "P0, P1" --> C1["carga-dwh<br/>consumidor 1"]
  T -- "P2" --> C2["carga-dwh<br/>consumidor 2"]
  T -- "P0, P1, P2" --> A["alertas<br/>consumidor 1"]
```

## 10. Código

```bash
# Bash y Kafka (ejecutado en la CI con un broker Kafka 4.3.1 en KRaft, en Docker; ADR-017): el productor escribe sin
# esperar a nadie; cada grupo de consumidores lee todo por su cuenta y retoma donde quedó.
set -euo pipefail
K="${KAFKA_CONTAINER:-dekh-kafka}"
kafka() { docker exec -i "$K" /opt/kafka/bin/"$1" --bootstrap-server localhost:9092 "${@:2}"; }
trap 'kafka kafka-topics.sh --delete --topic pedidos > /dev/null 2>&1 || true' EXIT

kafka kafka-topics.sh --create --topic pedidos --partitions 1 > /dev/null
printf '%s\n' 'pedido 1' 'pedido 2' 'pedido 3' | kafka kafka-console-producer.sh --topic pedidos
echo "el productor escribió 3 eventos sin ningún consumidor conectado"

consume() {   # lee con el grupo $1 lo que ese grupo todavía no leyó
  kafka kafka-console-consumer.sh --topic pedidos --group "$1" --from-beginning --timeout-ms 8000 2> /dev/null | wc -l
}
echo "carga-dwh lee: $(consume carga-dwh)"
echo "carga-dwh vuelve a leer: $(consume carga-dwh)"   # ya confirmó sus offsets: no hay nada nuevo
echo "alertas lee: $(consume alertas)"                 # otro grupo, otra posición
```

El script se **ejecuta en la CI contra un broker Kafka 4.3.1 en KRaft, en Docker** (ADR-017). Imprime `carga-dwh lee: 3`, `carga-dwh vuelve a leer: 0` y `alertas lee: 3`.

## 11. GCP

En GCP, **Pub/Sub** separa la lectura en suscripciones. Las diferencias con Kafka, según *Subscription overview* y *Choose a subscription type* (no ejecutado):

| | Kafka | Pub/Sub |
|---|---|---|
| Lector independiente | Un grupo de consumidores | Una suscripción; un topic puede tener varias |
| Repartir la carga | Las particiones se reparten dentro del grupo | Varios suscriptores de la misma suscripción pull reciben cada uno una parte de los mensajes |
| Qué recibe un lector nuevo | Según `auto.offset.reset` | Solo los mensajes publicados después de crear la suscripción |

## 12. AWS

En AWS, **Kinesis Data Streams** tiene consumidores compartidos y con enhanced fan-out. Las diferencias, según *Develop enhanced fan-out consumers with dedicated throughput* (no ejecutado):

| | Kafka | Kinesis Data Streams |
|---|---|---|
| Cómo lee | El consumidor pide datos (pull) | Compartido: se reparten 2 MB/s por shard; enhanced fan-out: 2 MB/s dedicados por consumidor y por shard, por push |

## 13. Azure

En Azure, **Event Hubs** usa grupos de consumidores. Las diferencias, según *Event Hubs features and terminology* (no ejecutado):

| | Kafka | Event Hubs |
|---|---|---|
| Lector independiente | Un grupo de consumidores | Un grupo de consumidores, vista independiente del stream |
| Varios lectores por partición | Uno por grupo | Hasta 5 receptores sin epoch por partición dentro de un grupo |
| Posición | Offset confirmado en Kafka | El servicio da offsets y el consumidor hace su checkpoint (por ejemplo, en Blob Storage) |

## 14. Buenas prácticas

- Un grupo de consumidores por aplicación lectora, con un nombre que diga cuál es.
- Tantas particiones como el máximo de consumidores que se espera en un grupo.
- Confirmar el offset después de procesar (ver `delivery-semantics`).
- **Seguridad:** cada aplicación con su propia identidad y permiso solo sobre sus topics y su grupo.
- **Observabilidad:** el lag del grupo dice cuánto le falta (ver `offsets`).
- **Costo:** en Kinesis, el enhanced fan-out tiene su propio precio (ver `message-brokers`).

## 15. Errores frecuentes

- Dos aplicaciones con el mismo `group.id` que se roban los eventos.
- Un grupo nuevo con `latest` (el valor por defecto) que no ve los eventos ya escritos.
- Más consumidores que particiones, esperando más velocidad.
- Un productor que espera la respuesta de un consumidor por el broker.

## 16. Trade-offs

El desacople deja que cada sistema avance a su ritmo, a cambio de que el productor no sepa si alguien procesó el evento. El pull da control al consumidor, que lee a su velocidad, y lo obliga a llevar su posición. Más particiones permiten más consumidores, con más recursos en el broker.

## 17. Conceptos relacionados

- `events`: lo que se produce y se consume.
- `message-brokers`: el servicio en el medio.
- `offsets`: la posición de cada grupo.
- `pubsub-topics-and-subscriptions`: suscripciones en Pub/Sub.
- `streaming-ingestion`: el consumidor como paso de una ingesta.
- `delivery-semantics`: confirmar antes o después de procesar.

## 18. Preguntas técnicas abiertas

1. ¿Qué sistema de tu arquitectura hoy llama a otro y podría escribir un evento?
2. ¿Cuántos grupos de consumidores leen tu topic principal y quién es dueño de cada uno?
3. ¿Qué pasa con tu consumidor si arranca un grupo nuevo con `latest`?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Apache Kafka 4.3: *Introduction*, *Design* y *Consumer and Share Consumer Configs*.
- Google Cloud: *Subscription overview* y *Choose a subscription type*.
- AWS: *Develop enhanced fan-out consumers with dedicated throughput*.
- Microsoft Learn: *Event Hubs features and terminology*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-19. `review_required`: pendiente de revisión B-F3.1 del lote F3b-14a.

## 22. Historial de cambios importantes

- 2026-10-19: creación (lote F3b-14a).
