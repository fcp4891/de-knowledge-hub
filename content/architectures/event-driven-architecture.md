---
id: architecture:event-driven-architecture
slug: event-driven-architecture
type: architecture
title: Event-driven architecture
description: "Servicios que publican eventos de negocio sin conocer a sus consumidores; cada consumidor lee con su propia posición, procesa de forma idempotente y puede sumarse después. Publish-subscribe frente a event streaming, consistencia eventual, DLQ, correlation ID y esquemas. Tres vistas; Pub/Sub y Eventarc, EventBridge, SNS y MSK, Event Grid y Event Hubs, con sus diferencias. Ejemplo ejecutado en la CI con Kafka 4.3.1."
domain: architecture
subdomain: streaming-architectures
classification: modern
level: intermediate
importance: high
cloud: [gcp, aws, azure]
technologies: [apache-kafka, gcp-pubsub, aws-msk, aws-lambda, azure-event-hubs, azure-functions]
tags: [event-driven, publish-subscribe, event-streaming, idempotency, eventual-consistency, kafka]
related_topics: [event-driven-pipelines, events, producers-and-consumers, idempotency]
sources:
  - source: azure-architecture-center
    url: https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven
    accessed: '2026-11-02'
    page_title: Event-driven architecture style
    note: 'Event-driven architecture style (Azure Architecture Center): productores que generan eventos, consumidores que los escuchan y canales (brokers o servicios de ingesta) que los transfieren; el productor no sabe qué consumidores escuchan. Dos modelos: publish-subscribe (el evento se envía a cada suscriptor y no queda en un log durable, así que un suscriptor nuevo no ve eventos pasados) y event streaming (eventos en un log, ordenados dentro de una partición y durables; el cliente avanza su posición, puede sumarse en cualquier momento y hacer replay, útil para recuperación, consumidores tardíos y reproceso tras corregir un error). Beneficios: sin integraciones punto a punto; se agregan consumidores sin modificar productores ni otros consumidores. Desafíos: entrega garantizada, consistencia eventual, orden y procesamiento una sola vez con varias instancias si no hay procesamiento idempotente, manejo de errores con DLQ, pérdida de datos, observabilidad con un correlation ID en cada evento y evolución del esquema. No conviene con flujos simples de request-response, con consistencia fuerte entre servicios o sin experiencia en sistemas asíncronos distribuidos.'
  - source: apache-kafka-docs
    url: https://kafka.apache.org/43/getting-started/introduction/
    accessed: '2026-10-19'
    page_title: Introduction
    note: 'Introduction (Kafka 4.3): «Topics are partitioned, meaning a topic is spread over a number of “buckets” located on different Kafka brokers»; así los clientes leen y escriben en muchos brokers a la vez. Un evento nuevo se agrega a una de las particiones; los eventos con la misma clave van a la misma partición, y Kafka garantiza que todo consumidor de una partición lee sus eventos en el mismo orden en que se escribieron.'
  - source: apache-kafka-docs
    url: https://kafka.apache.org/43/design/design/
    accessed: '2026-10-19'
    page_title: Design
    note: 'Design (Kafka 4.3): el productor envía directo al broker líder de la partición y el cliente controla a qué partición publica, al azar o con una clave que se hashea a una partición; el consumidor pide datos a los brokers (fetch), indica su offset en cada pedido y controla su posición; cada partición se consume por exactamente un consumidor dentro de cada grupo suscripto.'
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/subscription-overview
    accessed: '2026-10-02'
    page_title: Subscription overview
    note: 'Para recibir mensajes de un topic hay que crear una suscripción; solo los mensajes publicados después de crearla están disponibles. Un topic puede tener varias suscripciones; una suscripción pertenece a un solo topic. Tipos: pull, push y export (BigQuery, Bigtable en Preview, Cloud Storage); el tipo se puede cambiar después de crearla. Por defecto, entrega at-least-once sin garantía de orden.'
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/schemas
    accessed: '2026-10-06'
    page_title: Schema overview
    note: 'Un esquema de Pub/Sub crea un contrato entre publicador y suscriptor sobre el formato de los mensajes, y Pub/Sub lo hace cumplir: si un mensaje no se ajusta al esquema asociado al tema, no se publica. Los esquemas se definen en Apache Avro o Protocol Buffer, admiten revisiones (hasta 20 por esquema) y no deben llevar información sensible, como datos personales, en los nombres de campo; sirven como autoridad central de tipos de mensaje entre equipos.'
  - source: gcp-eventarc-docs
    url: https://docs.cloud.google.com/eventarc/docs/overview
    accessed: '2026-10-11'
    page_title: Eventarc overview
    note: Eventarc permite construir arquitecturas dirigidas por eventos sin administrar la infraestructura; ediciones Advanced y Standard, ambas serverless y administradas, enrutan mensajes de forma asíncrona desde fuentes hacia destinos (servicios de Google Cloud, aplicaciones propias, SaaS y terceros) que reaccionan a cambios de estado llamados eventos.
  - source: aws-s3-docs
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html
    accessed: '2026-10-11'
    page_title: Amazon S3 Event Notifications
    note: 'Amazon S3 Event Notifications: se configura qué eventos publica el bucket (objeto creado, borrado, restaurado, replicación, entre otros) y a qué destinos: temas de SNS, colas de SQS, funciones de Lambda y Amazon EventBridge. Las notificaciones están diseñadas para entregarse al menos una vez; normalmente llegan en segundos, pero a veces tardan un minuto o más.'
  - source: aws-sns-docs
    url: https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html
    accessed: '2026-10-02'
    page_title: Fanout Amazon SNS notifications to Amazon SQS queues for asynchronous processing
    note: 'Fanout de SNS a SQS: al suscribir una cola SQS a un topic SNS, cada publicación envía un mensaje a la cola; los mensajes persisten en SQS para procesarse después.'
  - source: aws-msk-docs
    url: https://docs.aws.amazon.com/msk/latest/developerguide/what-is-msk.html
    accessed: '2026-10-12'
    page_title: Welcome to the Amazon MSK Developer Guide
    note: 'Welcome to the Amazon MSK Developer Guide: servicio administrado para construir y ejecutar aplicaciones que usan Apache Kafka; MSK da las operaciones del plano de control (crear, actualizar, borrar clústeres) y deja usar las operaciones del plano de datos de Kafka (producir y consumir). Ejecuta versiones de código abierto de Kafka, así que las aplicaciones, herramientas y plugins existentes funcionan sin cambiar el código.'
  - source: aws-lambda-docs
    url: https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html
    accessed: '2026-10-12'
    page_title: Best practices for working with AWS Lambda Event Functions
    note: 'Best practices for working with AWS Lambda functions: escribir código idempotente, para que los eventos duplicados se traten igual, y validar los eventos.'
  - source: aws-glue-docs
    url: https://docs.aws.amazon.com/glue/latest/dg/schema-registry.html
    accessed: '2026-10-06'
    page_title: AWS Glue Schema registry
    note: 'En el AWS Glue Schema Registry, los modos de compatibilidad controlan cómo pueden evolucionar los esquemas y forman el contrato entre las aplicaciones que producen y consumen datos; una versión nueva se acepta solo si cumple el modo. Hay 8 modos: NONE, DISABLED, BACKWARD, BACKWARD_ALL, FORWARD, FORWARD_ALL, FULL y FULL_ALL.'
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/azure/event-grid/overview
    accessed: '2026-10-11'
    page_title: What is Azure Event Grid?
    note: Azure Event Grid es un servicio de publicación y suscripción administrado y escalable; usa MQTT y HTTP, permite entrega push o pull, admite la especificación CloudEvents 1.0 y sirve para construir pipelines de datos e integraciones dirigidas por eventos.
  - source: azure-event-hubs-docs
    url: https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-features
    accessed: '2026-10-13'
    page_title: Event Hubs features and terminology
    note: 'Event Hubs features and terminology: la partition key la da el emisor y pasa por una función de hash estática que asigna la partición; sin partition key, la asignación es round-robin; cambiar el mapeo de claves a particiones cambia la distribución, algo a evitar si importa el orden relativo. Un grupo de consumidores es una vista independiente del stream; hasta 5 receptores sin epoch pueden leer la misma partición dentro de un grupo. El checkpoint es responsabilidad del consumidor: el servicio da offsets y el consumidor los guarda (por ejemplo, en Blob Storage, un contenedor por grupo). Retención por tiempo: Standard 1 hora por defecto y 7 días como máximo; Premium y Dedicated, hasta 90 días; los eventos no se pueden borrar a mano.'
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-dead-letter-queues
    accessed: '2026-09-30'
    page_title: Overview of Service Bus dead-letter queues
    note: En peek-lock, cada abandono o vencimiento del bloqueo incrementa el delivery count; al superar el max delivery count (10 por defecto) el mensaje pasa a la DLQ con motivo MaxDeliveryCountExceeded.
relations:
  - {type: USES, target: events, note: "Lo que se publica: un hecho de negocio."}
  - {type: USES, target: producers-and-consumers, note: "Productores y consumidores desacoplados."}
  - {type: USES, target: idempotency, note: "Cada consumidor absorbe los reintentos."}
  - {type: USES, target: dead-letter-queue, note: "Lo que un consumidor no puede procesar."}
  - {type: RELATED_TO, target: event-driven-pipelines, note: "Pipelines de datos disparados por eventos de almacenamiento."}
  - {type: RELATED_TO, target: message-brokers, note: "El canal de eventos."}
  - {type: RELATED_TO, target: replay, note: "En event streaming, un consumidor nuevo lee la historia."}
  - {type: RELATED_TO, target: data-contracts, note: "El esquema del evento como contrato."}
  - {type: RELATED_TO, target: streaming-pipeline-architecture, note: "Ingesta continua para analítica; no es lo mismo que reaccionar a eventos."}
  - {type: RELATED_TO, target: kappa-architecture, note: "El log de eventos como fuente de verdad."}
created_at: 2026-11-02
updated_at: 2026-11-03
last_verified: 2026-11-02
owner_approved_at: 2026-11-03
verification_status: verified
---

## 1. Resumen

En una arquitectura event-driven, los servicios publican **eventos de negocio** («pedido creado», «pedido pagado») en un canal, y otros servicios los consumen sin que el productor sepa quiénes son. Hay productores que generan eventos, consumidores que los escuchan y canales que los transfieren; un consumidor nuevo se agrega sin modificar al productor ni a los demás consumidores (*Event-driven architecture style*).

Reaccionar a eventos de negocio no es lo mismo que un pipeline de ingesta continua para analítica (`streaming-pipeline-architecture`), aunque compartan el broker. Conviene cuando varios subsistemas procesan los mismos eventos y necesitan escalar por separado. No conviene con flujos simples de request-response, con consistencia fuerte entre servicios o sin experiencia operando sistemas asíncronos (*Event-driven architecture style*).

## 2. Escenario y requerimientos

Escenario: el servicio de pedidos de una tienda en línea publica cada pedido creado y pagado. Facturación, notificaciones y, más adelante, auditoría reaccionan cada una a su manera.

| Requerimiento | Valor del escenario |
|---|---|
| Desacople | Pedidos no conoce a sus consumidores ni espera su respuesta |
| Independencia | Cada consumidor lee a su ritmo y con su propia posición |
| Reintentos | Un evento repetido no factura dos veces |
| Crecimiento | Auditoría se suma después y lee la historia completa |
| Errores | Un evento que un consumidor no puede procesar no bloquea a los demás |

## 3. Vista de contexto

```mermaid
flowchart LR
  P["Productor: servicio<br/>de pedidos"] --> C["Canal"]
  C --> F["Facturación"]
  C --> N["Notificaciones"]
  C --> A["Auditoría"]
  F --> D["DLQ"]
  R["Registro de esquemas"] -.-> C
```

## 4. Componentes

| Componente | Responsabilidad | Por qué está |
|---|---|---|
| Productor | Publica un hecho de negocio con `event_id` y clave | No llama a nadie: solo registra lo que pasó |
| Canal | Guarda y entrega los eventos | Desacopla productor y consumidores |
| Grupo o suscripción por consumidor | Posición propia de cada consumidor | Cada uno lee todo, a su ritmo |
| Consumidor idempotente | Procesa y recuerda los `event_id` ya aplicados | El canal entrega al menos una vez |
| DLQ | Eventos que el consumidor no pudo procesar | No bloquean al resto |
| Registro de esquemas | Versiones del formato del evento | Productores y consumidores se despliegan por separado |

## 5. Vista de datos

```mermaid
flowchart TB
  E["Evento: event_id,<br/>tipo, clave, payload"] --> L["Canal: partición<br/>por clave"]
  L --> G["Grupo o suscripción<br/>por consumidor"]
  L --> H["Grupo o suscripción<br/>de otro consumidor"]
  G --> V{"Consumidor idempotente:<br/>¿event_id ya aplicado?"}
  V -- "sí" --> I["Se ignora"]
  V -- "no" --> T["Efecto + registro<br/>del event_id"]
```

Cada consumidor (en el §10, facturación y auditoría) tiene su grupo con su propio offset. Con la misma clave, los eventos van a la misma partición, y todo consumidor de una partición los lee en el orden en que se escribieron (*Introduction*, Kafka 4.3). El payload puede llevar todos los atributos o solo claves para que el consumidor consulte la fuente: lo primero evita consultas, lo segundo mantiene un solo sistema de registro (*Event-driven architecture style*).

## 6. Vista de despliegue

```mermaid
flowchart TB
  subgraph PUB["Servicio de pedidos"]
    P["Productor"]
  end
  subgraph BUS["Canal administrado"]
    T["Canal: topic<br/>con retención"]
  end
  subgraph SUBS["Consumidores"]
    F["Facturación (N instancias)"]
    N["Notificaciones"]
  end
  P --> T
  T --> F
  T --> N
```

Cada tipo de consumidor suele correr en varias instancias para no ser un punto único de falla; eso complica el orden y el procesamiento una sola vez si no hay lógica idempotente (*Event-driven architecture style*).

## 7. Seguridad y gobierno

- Permisos por rol: el productor solo publica en su topic; cada consumidor solo lee su suscripción o grupo.
- Los eventos suelen quedar visibles para muchos componentes: incluir solo lo necesario, con la mentalidad de «assume breach» (*Event-driven architecture style*).
- El esquema es un contrato: Pub/Sub rechaza la publicación de un mensaje que no cumple el esquema del tema (*Schema overview*) y Glue Schema Registry acepta una versión nueva solo si cumple su modo de compatibilidad (*AWS Glue Schema registry*).

## 8. Escalabilidad, observabilidad y operación

- **Escala:** cada consumidor escala por separado; en Kafka, cada partición la consume un solo consumidor de cada grupo (*Design*, Kafka 4.3).
- **Qué se mide:** lag por grupo, eventos en DLQ y tiempo entre la publicación y el efecto en cada consumidor (consistencia eventual).
- **Trazas:** un correlation ID en cada evento para unir el recorrido de una transacción por productores, canales y consumidores (*Event-driven architecture style*).
- **Runbook:** consumidor caído → al volver retoma desde su posición; evento en DLQ → corregir y reenviar al canal original, sabiendo que llega fuera de orden.

## 9. Costos

Cada consumidor nuevo lee de nuevo todos los eventos: el costo de entrega crece con la cantidad de consumidores, no solo con los eventos publicados. La retención del canal también se paga. Payloads grandes suben el costo de transporte y ancho de banda (*Event-driven architecture style*). Los montos dependen del servicio y se calculan con la calculadora de cada nube.

## 10. Código y configuración

```bash
# Bash y Kafka (ejecutado en la CI con un broker Kafka 4.3.1 en KRaft, en Docker; ADR-017): arquitectura event-driven
# de punta a punta. El servicio de pedidos publica eventos de negocio sin conocer a sus consumidores; facturación y
# notificaciones los leen cada una con su grupo; facturación descarta por event_id el reintento del productor; un
# consumidor nuevo (auditoría) se suscribe después y lee la historia completa sin tocar al productor.
set -euo pipefail
K="${KAFKA_CONTAINER:-dekh-kafka}"
kafka() { docker exec -i "$K" /opt/kafka/bin/"$1" --bootstrap-server localhost:9092 "${@:2}"; }
trap 'kafka kafka-topics.sh --delete --topic pedidos-eventos > /dev/null 2>&1 || true' EXIT

kafka kafka-topics.sh --create --topic pedidos-eventos --partitions 3 > /dev/null
printf '%s\n' \
  'p-1|{"event_id": "e-1", "tipo": "PedidoCreado", "pedido": "p-1", "monto": 120}' \
  'p-2|{"event_id": "e-2", "tipo": "PedidoCreado", "pedido": "p-2", "monto": 80}' \
  'p-2|{"event_id": "e-2", "tipo": "PedidoCreado", "pedido": "p-2", "monto": 80}' \
  'p-2|{"event_id": "e-3", "tipo": "PedidoPagado", "pedido": "p-2", "monto": 80}' |
  kafka kafka-console-producer.sh --topic pedidos-eventos --reader-property parse.key=true --reader-property 'key.separator=|'
echo "pedidos publicó 4 eventos (e-2 dos veces: un reintento del productor)"

consume() {   # lee con el grupo $1 lo que ese grupo todavía no leyó
  kafka kafka-console-consumer.sh --topic pedidos-eventos --group "$1" --from-beginning --timeout-ms 8000 2> /dev/null
}
consume facturacion > facturacion.log
echo "facturación recibe: $(wc -l < facturacion.log); procesa: $(grep -o '"event_id": "[^"]*"' facturacion.log | sort -u | wc -l)"
echo "notificaciones recibe: $(consume notificaciones | wc -l)"
echo "facturación vuelve a leer: $(consume facturacion | wc -l)"        # ya confirmó sus offsets
echo "auditoría, suscrita después, recibe: $(consume auditoria | wc -l)"  # nadie cambió el productor
```

El script se **ejecuta en la CI contra un broker Kafka 4.3.1 en KRaft, en Docker** (ADR-017):

```text
pedidos publicó 4 eventos (e-2 dos veces: un reintento del productor)
facturación recibe: 4; procesa: 3
notificaciones recibe: 4
facturación vuelve a leer: 0
auditoría, suscrita después, recibe: 4
```

Facturación recibe el evento `e-2` dos veces y lo procesa una, porque deduplica por `event_id`; notificaciones recibe los mismos 4 eventos con su propio grupo; auditoría se suscribe después y lee la historia completa sin que nadie cambie al productor. Lo que no ejecuta: el efecto real de cada consumidor (facturar, enviar un correo) ni una DLQ.

## 11. GCP

| Pieza | Servicio | Detalle y diferencia |
|---|---|---|
| Canal | Pub/Sub | Un topic con varias suscripciones; solo se reciben los mensajes publicados después de crear la suscripción y la entrega es at-least-once sin orden por defecto (*Subscription overview*). Un consumidor nuevo no lee la historia, a diferencia del §10 |
| Enrutamiento | Eventarc | Enruta eventos de forma asíncrona desde fuentes de Google Cloud, aplicaciones propias, SaaS y terceros hacia destinos (*Eventarc overview*) |

## 12. AWS

| Pieza | Servicio | Detalle y diferencia |
|---|---|---|
| Publish-subscribe | SNS con colas SQS | Fanout: cada publicación envía un mensaje a cada cola suscrita, donde persiste para procesarse después (*Fanout Amazon SNS notifications…*) |
| Eventos de servicios | Notificaciones de S3 | Destinos SNS, SQS, Lambda y EventBridge; entrega al menos una vez (*Amazon S3 Event Notifications*) |
| Event streaming | Amazon MSK | Kafka de código abierto administrado; las aplicaciones existentes funcionan sin cambiar el código (*Welcome to the Amazon MSK Developer Guide*) |
| Consumidor | Lambda | Escribir código idempotente, para tratar igual los eventos duplicados (*Best practices for working with AWS Lambda Event Functions*) |

## 13. Azure

| Pieza | Servicio | Detalle y diferencia |
|---|---|---|
| Publish-subscribe | Event Grid | Publicación y suscripción administrada, push o pull, con CloudEvents 1.0 (*What is Azure Event Grid?*) |
| Event streaming | Event Hubs | Grupos de consumidores como vistas independientes; el checkpoint lo guarda el consumidor (*Event Hubs features and terminology*) |
| DLQ | Service Bus | Cada cola y suscripción tiene su subcola DLQ (*Overview of Service Bus dead-letter queues*) |

## 14. Riesgos y modos de falla

| Riesgo | Cómo se detecta | Cómo se recupera |
|---|---|---|
| Consumidor no idempotente | Efectos duplicados (doble factura) | Registrar `event_id` aplicados en la misma transacción que el efecto |
| Cambio de esquema incompatible | Errores de deserialización o DLQ que crece | Registro de esquemas con modo de compatibilidad |
| Lag de un consumidor | Vistas desactualizadas entre servicios | Alerta por lag y escalado del consumidor |
| Transacción repartida sin coordinación | Estados que no cuadran entre servicios | Saga o transacción compensatoria |

## 15. Errores frecuentes

| Error | Consecuencia |
|---|---|
| Publicar comandos («factura esto») en vez de hechos | El productor vuelve a conocer a sus consumidores |
| Esperar orden global | Solo hay orden dentro de una partición o clave |
| Usar publish-subscribe y esperar replay | Un consumidor nuevo no ve eventos pasados |
| Eventos sin `event_id` ni correlation ID | No se puede deduplicar ni trazar |

## 16. Trade-offs y alternativas

| Opción | Gana | Cuesta |
|---|---|---|
| Event streaming (log) | Replay y consumidores tardíos | Operar retención y particiones |
| Publish-subscribe | Simple, sin posición que administrar | Sin historia para consumidores nuevos |
| Llamadas síncronas | Consistencia inmediata y depuración simple | Acoplamiento y fallas en cadena |

## 17. Conceptos relacionados

- `events` y `producers-and-consumers`: qué se publica y quién lo lee.
- `idempotency` y `dead-letter-queue`: reintentos y errores.
- `event-driven-pipelines`: pipelines de datos disparados por eventos.
- `message-brokers`: el canal.
- `replay`: releer la historia.
- `data-contracts`: el esquema del evento.
- `streaming-pipeline-architecture`: ingesta continua para analítica.
- `kappa-architecture`: el log como fuente de verdad.

## 18. Evolución

Se llega desde integraciones punto a punto cuando cada consumidor nuevo obliga a cambiar al productor. Si el log de eventos pasa a ser la fuente de verdad y las vistas se recalculan releyéndolo, evoluciona a `kappa-architecture`. La señal para no adoptarla: un solo consumidor que necesita la respuesta en el momento.

## 19. Laboratorio relacionado

F4: laboratorio en la nube con un topic, dos consumidores con suscripciones propias, un evento duplicado y un consumidor que se suma después, con `terraform apply` en sandbox, costo estimado con fuente, teardown verificado y evidencia de la corrida.

## 20. Fuentes

- Microsoft Learn: *Event-driven architecture style*; *What is Azure Event Grid?*; *Event Hubs features and terminology*; *Overview of Service Bus dead-letter queues*.
- Apache Kafka 4.3: *Introduction*; *Design*.
- Google Cloud: *Subscription overview*; *Schema overview*; *Eventarc overview*.
- AWS: *Amazon S3 Event Notifications*; *Fanout Amazon SNS notifications to Amazon SQS queues for asynchronous processing*; *Welcome to the Amazon MSK Developer Guide*; *Best practices for working with AWS Lambda Event Functions*; *AWS Glue Schema registry*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-11-02: fichas de origen de cada cita revisadas y *Event-driven architecture style* leída hoy (H1 y contenido). `verified`: aprobada el 2026-11-03 (`owner_approved_at`).

## 22. Historial de cambios importantes

- 2026-11-02: creación (lote 07b, ADR-028).
- 2026-11-02: las tres vistas usan los nombres del §4 (criterio de la revisión de 07a).
- 2026-11-03: revisión de 07b aplicada (docs/reviews/lote-07b.md): las citas nuevas del lote llevan su `url` (faltaba); el §5 usa el nombre del §4, «Grupo o suscripción por consumidor».
- 2026-11-03: `verification_status: verified`, aprobada con lista explícita (`owner_approved_at: 2026-11-03`).
