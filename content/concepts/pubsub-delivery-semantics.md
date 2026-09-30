---
id: concept:pubsub-delivery-semantics
slug: pubsub-delivery-semantics
type: concept
title: Entrega, orden y reintentos en Pub/Sub
description: Qué garantiza Pub/Sub al entregar mensajes (at-least-once por defecto, exactly-once opcional, orden por clave) y qué debe hacer el consumidor.
domain: gcp
subdomain: messaging-and-processing
category: gcp
classification: modern
level: advanced
importance: high
cloud: [gcp]
technologies: [gcp-pubsub]
tags: [streaming, messaging, gcp]
related_topics: [idempotency, dead-letter-queue, retries, replay]
sources:
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/subscription-overview
    accessed: 2026-09-30
    note: Por defecto, Pub/Sub entrega al menos una vez (at-least-once) y sin garantías de orden en todos los tipos de suscripción.
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/exactly-once-delivery
    accessed: 2026-09-30
    note: Exactly-once delivery solo en suscripciones pull (no push ni export), dentro de una región y basado en el message ID de Pub/Sub; los suscriptores deben conectarse en la misma región; con exactly-once no se reciben entregas duplicadas.
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/ordering
    accessed: 2026-09-30
    note: El orden se define por ordering key (hasta 1 KB); hay que publicar en la misma región y habilitar el orden en la suscripción; mensajes sin clave no se ordenan; la reentrega de un mensaje provoca la reentrega de todos los posteriores de esa clave, incluso los ya confirmados.
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/subscription-retry-policy
    accessed: 2026-09-30
    note: Reentrega inmediata por defecto o backoff exponencial configurable entre 0 y 600 segundos.
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/dead-letter-topics
    accessed: 2026-09-30
    note: Dead-letter topic con 5 a 100 intentos de entrega (5 por defecto); el conteo es aproximado porque el reenvío es best-effort.
  - source: aws-sqs-docs
    url: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html
    accessed: 2026-09-30
    note: En SQS, un mensaje no borrado antes del visibility timeout vuelve a ser visible.
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-features
    accessed: 2026-09-30
    note: En Event Hubs, los consumidores leen por offset dentro de particiones ordenadas y guardan su posición con checkpointing.
relations:
  - type: RELATED_TO
    target: idempotency
    note: La entrega at-least-once exige consumidores idempotentes.
  - type: RELATED_TO
    target: dead-letter-queue
    note: El dead-letter topic limita los intentos de entrega.
  - type: RELATED_TO
    target: retries
    note: La política de reintento de la suscripción define las esperas entre reentregas.
  - type: RELATED_TO
    target: replay
    note: Seek permite reentregar mensajes desde un snapshot o un timestamp.
created_at: 2026-09-30
updated_at: 2026-09-30
last_verified: 2026-09-30
verification_status: review_required
---

## 1. Resumen

Por defecto, Pub/Sub entrega cada mensaje **al menos una vez** y **sin orden garantizado**. Se puede activar exactly-once (solo en suscripciones pull y dentro de una región) y orden por *ordering key*, cada uno con condiciones. En la práctica, el consumidor debe ser idempotente: exactly-once cubre la entrega de Pub/Sub dentro de una región, no la escritura en el destino, y el orden por clave provoca reentregas en cascada.

## 2. Qué es

Es el conjunto de garantías de entrega de Pub/Sub y de las opciones que las modifican: el tipo de entrega (at-least-once o exactly-once), el orden (por clave), la política de reintento y el dead-letter topic.

## 3. Problema que resuelve

Diseñar un consumidor correcto exige saber qué puede pasar: duplicados, desorden, reentregas masivas, mensajes que nunca se procesan. Suponer "exactly-once y en orden" sin configurarlo, o sin entender sus límites, produce duplicados y datos inconsistentes en el destino.

## 4. Cómo funciona

- **At-least-once (por defecto):** si el consumidor no confirma a tiempo, Pub/Sub reentrega. Un mensaje puede llegar más de una vez.
- **Exactly-once:** opcional y solo en suscripciones pull. Se basa en el message ID de Pub/Sub y aplica dentro de una región, con suscriptores conectados en la misma región.
- **Orden:** por *ordering key* (hasta 1 KB). Hay que publicar todos los mensajes de una clave en la misma región y habilitar el orden en la suscripción. Los mensajes sin clave no se ordenan. Si se reentrega un mensaje, también se reentregan todos los posteriores de esa clave, **incluso los ya confirmados**.
- **Reintentos:** reentrega inmediata por defecto, o backoff exponencial configurable entre 0 y 600 segundos.
- **Dead-letter topic:** aparta los mensajes tras 5 a 100 intentos (conteo aproximado).

## 5. Cuándo utilizarlo

Siempre que se diseñe un consumidor de Pub/Sub: al elegir el tipo de suscripción, si hace falta orden, cómo confirmar y cómo escribir en el destino.

## 6. Cuándo no utilizarlo

- No conviene depender de exactly-once para la corrección del destino si el consumidor escribe en otro sistema: esa garantía es de la entrega de Pub/Sub, no de la escritura en BigQuery u otro destino.
- No conviene activar el orden si no se necesita: agrega condiciones de publicación y reentregas en cascada por clave.

## 7. Ejemplo sencillo

Un consumidor pull recibe el mensaje `m1`, lo procesa y tarda en confirmar. Pub/Sub lo reentrega y el consumidor lo procesa de nuevo. Con una escritura idempotente por `message_id`, el destino queda igual.

## 8. Ejemplo de producción

Eventos de cambios de clientes, publicados con `customer_id` como ordering key en una región. La suscripción pull tiene orden habilitado, backoff exponencial y dead-letter topic. El consumidor escribe con `MERGE` por `customer_id` y versión, así que tolera la reentrega en cascada de una clave y los duplicados. Una alerta vigila la antigüedad del mensaje más antiguo sin confirmar.

## 9. Arquitectura

```mermaid
flowchart LR
  PUB[Publicador con ordering key] --> T[Tópico]
  T --> S[Suscripción pull: orden + backoff + DLT]
  S --> C[Consumidor idempotente]
  C -->|MERGE por clave y versión| D[(Destino)]
  S -->|agotados| DLT[Dead-letter topic]
```

## 10. Código

```python
# Consumidor idempotente (esquema): la corrección no depende de que el mensaje llegue una sola vez.
# Requiere: google-cloud-pubsub y una tabla destino con MERGE por (customer_id, version).
def handle(message) -> None:
    event = parse(message.data)                     # validación: si falla, se registra y se confirma
    upsert_customer(event.customer_id, event.version, event.payload)  # MERGE: repetir no duplica
    message.ack()                                   # confirmar después de escribir, nunca antes
```

## 11. GCP

Esta ficha trata de **Pub/Sub**. El tipo de suscripción limita las opciones: exactly-once solo existe en pull, no en push ni en las suscripciones de exportación (como las que escriben directamente en BigQuery).

## 12. AWS

En **SQS** el modelo es distinto: un mensaje no borrado antes de que venza el *visibility timeout* vuelve a ser visible y otro consumidor puede recibirlo. También ahí el consumidor debe tolerar la repetición. No es el mismo mecanismo que el plazo de confirmación de Pub/Sub, aunque cumple un papel parecido.

## 13. Azure

En **Event Hubs** no hay confirmación por mensaje: los consumidores leen por *offset* dentro de particiones ordenadas y guardan su posición con *checkpointing*. Tras un reinicio, se reprocesa lo posterior al último checkpoint. El orden es por partición, no por ordering key como en Pub/Sub.

## 14. Buenas prácticas

- Diseñar el consumidor como idempotente aunque se active exactly-once.
- Confirmar después de escribir en el destino, no antes.
- Activar el orden solo si el negocio lo necesita, y elegir claves de buena cardinalidad.
- Combinar backoff exponencial con dead-letter topic.
- **Observabilidad:** vigilar la antigüedad del mensaje más antiguo sin confirmar, la tasa de reentregas y los mensajes que llegan al dead-letter topic.
- **Seguridad:** separar los permisos de publicar y de suscribirse, y dar a la cuenta de servicio de Pub/Sub solo los permisos que exige el dead-letter topic.
- **Costo:** las reentregas y los mensajes retenidos también se procesan y se almacenan; un consumidor que confirma tarde paga su propio retraso en reentregas.

## 15. Errores frecuentes

- Confirmar el mensaje antes de escribir y perderlo si la escritura falla.
- Suponer que exactly-once cubre la escritura en el destino.
- Publicar la misma ordering key desde varias regiones y perder el orden.
- No prever la reentrega en cascada de una clave ordenada.

## 16. Trade-offs

At-least-once es simple y de menor latencia, pero exige idempotencia. Exactly-once reduce los duplicados de entrega, a cambio de restricciones (pull, región). El orden por clave simplifica la lógica del consumidor, pero impone condiciones de publicación y reentregas en cascada.

## 17. Conceptos relacionados

- `idempotency`: la defensa principal ante reentregas.
- `dead-letter-queue`: el límite de intentos.
- `retries`: la política de reentrega.
- `replay`: seek a un snapshot o a un timestamp.
- Del blueprint, pendientes de ficha: `delivery-semantics`, `exactly-once-semantics`, `event-ordering`.

## 18. Preguntas técnicas abiertas

1. ¿Qué garantía le das al negocio sobre duplicados en BigQuery si el consumidor lee de Pub/Sub con exactly-once activado?
2. ¿Cómo elegirías la ordering key para eventos de pedidos y qué riesgos tiene elegirla mal?
3. ¿Qué harías si la antigüedad del mensaje más antiguo sin confirmar crece sin parar?

## 19. Laboratorio relacionado

Pendiente (F4): arquitectura "Streaming pipeline" (§24).

## 20. Fuentes

- Google Cloud: *Subscription overview*, *Exactly-once delivery*, *Order messages*, *Subscription retry policy* y *Dead-letter topics* (Pub/Sub).
- AWS: *Amazon SQS visibility timeout*.
- Microsoft Learn: *Event Hubs features and terminology*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-09-30. La ficha queda en `review_required` hasta la revisión humana (B-F3.2).

## 22. Historial de cambios importantes

- 2026-09-30: creación (lote 2 de F3).
