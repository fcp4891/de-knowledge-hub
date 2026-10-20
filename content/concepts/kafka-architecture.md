---
id: concept:kafka-architecture
slug: kafka-architecture
type: concept
title: Arquitectura de Kafka
description: "Cómo está armado un clúster de Kafka según la documentación de Kafka 4.3: brokers con particiones replicadas, controllers de KRaft con el quorum de metadatos, ISR y min.insync.replicas para escribir con acks=all, ELR desde 4.0, compactación por clave y las APIs Streams y Connect. Ejemplo ejecutado contra un broker real en Docker: el quorum, una partición y su compactación. MSK, Event Hubs y Pub/Sub, con sus diferencias."
domain: open-data-stack
subdomain: processing-and-messaging
category: open-data-stack
classification: modern
level: advanced
importance: medium
cloud: [agnostic]
technologies: [apache-kafka, aws-msk, azure-event-hubs, gcp-pubsub]
tags: [kafka, kraft, replication, isr, min-insync-replicas, log-compaction, kafka-connect]
related_topics: [topics-and-partitions]
sources:
  - source: apache-kafka-docs
    url: https://kafka.apache.org/43/getting-started/introduction/
    accessed: 2026-10-20
    page_title: "Introduction"
    note: "Introduction (Kafka 4.3): Kafka es un sistema distribuido de servidores y clientes; algunos servidores forman la capa de almacenamiento, los brokers; otros corren Kafka Connect para importar y exportar datos como streams de eventos; un topic puede replicarse, con factor 3 como configuración habitual de producción, y la replicación es por partición."
  - source: apache-kafka-docs
    url: https://kafka.apache.org/43/operations/kraft/
    accessed: 2026-10-20
    page_title: "KRaft"
    note: "KRaft (Kafka 4.3): cada servidor es controller, broker o ambos (process.roles); los controllers participan del quorum de metadatos, uno activo y los demás en espera; se suelen elegir 3 o 5 según el costo y las fallas simultáneas que se quieran tolerar; los servidores combinados son más simples de operar en entornos chicos."
  - source: apache-kafka-docs
    url: https://kafka.apache.org/43/design/design/
    accessed: 2026-10-20
    page_title: "Design"
    note: "Design (Kafka 4.3): un mensaje está confirmado cuando lo aplicaron todas las réplicas del ISR de su partición, y no se pierde mientras quede viva una réplica; los topics tienen min.insync.replicas, que se verifica cuando el productor pide acuse de todo el ISR; «Log compaction ensures that Kafka will always retain at least the last known value for each message key within the log of data for a single topic partition», útil para restaurar estado tras una caída o recargar cachés; todos los segmentos son elegibles para compactar salvo el último, el que se está escribiendo."
  - source: apache-kafka-docs
    url: https://kafka.apache.org/43/configuration/topic-configs/
    accessed: 2026-10-20
    page_title: "Topic Configs"
    note: "Topic Configs (Kafka 4.3): cleanup.policy delete (por defecto) descarta segmentos viejos y compact retiene el último valor por clave. min.insync.replicas es el mínimo de réplicas sincronizadas, incluido el líder, para que una escritura con acks=all tenga éxito; si el ISR tiene menos, el productor recibe NotEnoughReplicas o NotEnoughReplicasAfterAppend; el escenario típico es factor 3, min.insync.replicas=2 y acks=all; con Eligible Leader Replicas activado, la semántica de esta configuración cambia."
  - source: apache-kafka-docs
    url: https://kafka.apache.org/43/operations/eligible-leader-replicas/
    accessed: 2026-10-20
    page_title: "Eligible Leader Replicas"
    note: "Eligible Leader Replicas (Kafka 4.3): disponible desde Kafka 4.0 y activado por defecto en clústeres nuevos desde 4.1; con la regla «strict min ISR», el high watermark no avanza si el ISR es menor que min.insync.replicas, y el controller guarda como ELR réplicas fuera del ISR que pueden ser líderes con seguridad; en la elección de líder prefiere el ISR, después el ELR."
  - source: apache-kafka-docs
    url: https://kafka.apache.org/43/apis/
    accessed: 2026-10-20
    page_title: "API"
    note: "API (Kafka 4.3): seis APIs centrales; Producer API para escribir en topics, Consumer API para leerlos, Share consumer API para consumo cooperativo en grupos de share, Streams API para transformar streams de topics de entrada en topics de salida, Connect API para conectores que traen datos a Kafka o los llevan a otros sistemas, y Admin API."
  - source: aws-msk-docs
    url: https://docs.aws.amazon.com/msk/latest/developerguide/what-is-msk.html
    accessed: 2026-10-12
    page_title: "Welcome to the Amazon MSK Developer Guide"
    note: "Welcome to the Amazon MSK Developer Guide: servicio administrado para construir y ejecutar aplicaciones que usan Apache Kafka; MSK da las operaciones del plano de control (crear, actualizar, borrar clústeres) y deja usar las operaciones del plano de datos de Kafka (producir y consumir). Ejecuta versiones de código abierto de Kafka, así que las aplicaciones, herramientas y plugins existentes funcionan sin cambiar el código."
  - source: aws-msk-docs
    url: https://docs.aws.amazon.com/msk/latest/developerguide/supported-kafka-versions.html
    accessed: 2026-10-12
    page_title: "Supported Apache Kafka versions"
    note: "Supported Apache Kafka versions: lista 4.2.x, 4.1.x, 4.0.x, 3.9.x (Recommended), 3.8.x y anteriores. 3.9 es la última versión con ZooKeeper y KRaft, con soporte extendido de MSK por al menos dos años desde su lanzamiento; Kafka 4.0 exige Java 17 y deja de lado la gestión de metadatos con ZooKeeper."
  - source: azure-event-hubs-docs
    url: https://learn.microsoft.com/en-us/azure/event-hubs/azure-event-hubs-apache-kafka-overview
    accessed: 2026-10-13
    page_title: "What is Azure Event Hubs for Apache Kafka?"
    note: "What is Azure Event Hubs for Apache Kafka?: cada event hub expone un endpoint de Kafka; muchas aplicaciones de Kafka se conectan sin cambiar el código, solo la configuración (la cadena de conexión)."
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/subscription-overview
    accessed: 2026-10-02
    page_title: "Subscription overview"
    note: "Para recibir mensajes de un topic hay que crear una suscripción; solo los mensajes publicados después de crearla están disponibles. Un topic puede tener varias suscripciones; una suscripción pertenece a un solo topic. Tipos: pull, push y export (BigQuery, Bigtable en Preview, Cloud Storage); el tipo se puede cambiar después de crearla. Por defecto, entrega at-least-once sin garantía de orden."
relations:
  - type: DEPENDS_ON
    target: topics-and-partitions
    note: Las particiones son la unidad que se replica.
  - type: RELATED_TO
    target: message-brokers
    note: El rol de broker, en general.
  - type: RELATED_TO
    target: offsets
    note: La posición de los consumidores dentro de cada partición.
  - type: RELATED_TO
    target: delivery-semantics
    note: acks y min.insync.replicas en la durabilidad.
  - type: RELATED_TO
    target: exactly-once-semantics
    note: Transacciones entre topics.
  - type: RELATED_TO
    target: msk-managed-kafka
    note: Kafka administrado en AWS.
  - type: RELATED_TO
    target: event-hubs-streaming
    note: Endpoint de Kafka en Azure.
created_at: 2026-10-20
updated_at: 2026-10-20
last_verified: 2026-10-20
verification_status: review_required
---

## 1. Resumen

Un clúster de Kafka tiene dos roles. Los **brokers** guardan las particiones de los topics y atienden a productores y consumidores. Los **controllers**, en modo KRaft, forman un quorum que guarda los metadatos del clúster: qué topics hay, qué broker lidera cada partición, qué réplicas están sincronizadas.

La durabilidad sale de tres piezas:

- **replicación por partición**, con factor 3 como configuración habitual de producción;
- **ISR** (in-sync replicas): un mensaje está confirmado cuando lo aplicaron todas las réplicas del ISR;
- **`min.insync.replicas` con `acks=all`**: el mínimo de réplicas sincronizadas para aceptar una escritura; el escenario típico es factor 3, mínimo 2 y `acks=all`. Desde Kafka 4.0, Eligible Leader Replicas (activado por defecto en clústeres nuevos desde 4.1) cambia esa semántica.

Además, la **compactación** conserva el último valor de cada clave, y Kafka trae APIs para procesar (Streams) e integrar sistemas (Connect).

## 2. Qué es

- **Broker:** guarda particiones y sus réplicas.
- **Controller:** miembro del quorum de metadatos de KRaft; uno activo y los demás en espera; se suelen usar 3 o 5.
- **Servidor combinado:** broker y controller a la vez (`process.roles=broker,controller`); más simple para entornos chicos.
- **Líder, réplicas e ISR:** cada partición tiene un líder; el ISR es el conjunto de réplicas al día.
- **ELR:** réplicas fuera del ISR que el controller considera seguras para ser líderes.
- **Compactación:** `cleanup.policy=compact` retiene al menos el último valor por clave en cada partición.
- **Connect y Streams:** conectores con otros sistemas y procesamiento de topics a topics.

## 3. Problema que resuelve

Un equipo usa Kafka como si fuera una cola y pierde mensajes cuando cae un broker. Mirando la arquitectura descubre que los topics tienen factor 1 y que el productor usa `acks=1`. Con factor 3, `min.insync.replicas=2` y `acks=all`, una escritura aceptada está en al menos dos réplicas. Para una tabla de saldos, un topic compactado guarda el último saldo de cada cuenta sin crecer sin límite.

## 4. Cómo funciona

1. Los controllers eligen un líder del quorum y mantienen los metadatos.
2. Cada partición tiene un broker líder; los demás brokers con réplicas la copian.
3. El productor escribe en el líder; con `acks=all`, espera a que la escritura llegue a todo el ISR.
4. Si el ISR queda por debajo de `min.insync.replicas`, la escritura se rechaza (o, con ELR, el high watermark no avanza).
5. Si cae el líder, el controller elige otro: primero del ISR, después del ELR.
6. En un topic compactado, el log cleaner reescribe los segmentos cerrados y deja el último valor de cada clave.

## 5. Cuándo utilizarlo

- Kafka propio cuando hace falta control total de versión, configuración y red.
- Factor 3 y `min.insync.replicas=2` para datos que no se pueden perder.
- Topics compactados para estado por clave (saldos, configuraciones, el último estado de una entidad).

## 6. Cuándo no utilizarlo

- Factor 1 en producción.
- Topics compactados como reemplazo de una base de datos con consultas.
- Operar un clúster propio cuando un servicio administrado cubre el caso (ver §11 a §13).

## 7. Ejemplo sencillo

Un broker de un nodo en KRaft es su propio controller: el quorum tiene un solo votante. Un topic `saldos` compactado, con una partición, recibe cinco eventos de dos cuentas. Después de compactar, quedan `cuenta-1=75` y `cuenta-2=60`: el último saldo de cada una.

## 8. Ejemplo de producción

Un clúster de Kafka para los eventos de la empresa:

- tres controllers dedicados y seis brokers, en tres zonas;
- factor 3, `min.insync.replicas=2` y productores con `acks=all`;
- topics de eventos con `delete` y retención por tiempo; topics de estado con `compact`;
- Kafka Connect para traer cambios de las bases y llevar eventos al lake;
- alertas por particiones con el ISR por debajo del mínimo.

## 9. Arquitectura

```mermaid
flowchart TB
  subgraph Q["Quorum de controllers (KRaft)"]
    C1["controller activo"] --- C2["en espera"] --- C3["en espera"]
  end
  subgraph B["Brokers"]
    B1["broker 1<br/>líder P0"] -- "réplica" --> B2["broker 2<br/>ISR P0"]
    B1 -- "réplica" --> B3["broker 3<br/>ISR P0"]
  end
  Q -. "metadatos y elección de líder" .-> B
  P["Productor acks=all"] --> B1
  CN["Kafka Connect"] <--> B
```

## 10. Código

```bash
# Bash y Kafka (ejecutado en la CI con un broker Kafka 4.3.1 en KRaft, en Docker; ADR-017): el quorum de controllers que
# guarda los metadatos, el estado de una partición (líder, réplicas, ISR, ELR) y la compactación del log, que conserva
# el último valor de cada clave. Segmentos chicos y una proporción baja de log sucio hacen que el cleaner compacte pronto.
set -euo pipefail
K="${KAFKA_CONTAINER:-dekh-kafka}"
kafka() { docker exec -i "$K" /opt/kafka/bin/"$1" --bootstrap-server localhost:9092 "${@:2}"; }
trap 'kafka kafka-topics.sh --delete --topic saldos > /dev/null 2>&1 || true' EXIT

kafka kafka-metadata-quorum.sh describe --status | grep -E '^(LeaderId|CurrentVoters):' | tr -s ' '

kafka kafka-topics.sh --create --topic saldos --partitions 1 --replication-factor 1 \
  --config cleanup.policy=compact --config segment.ms=100 --config min.cleanable.dirty.ratio=0.01 > /dev/null
kafka kafka-topics.sh --describe --topic saldos | awk -F'\t' '/^\tTopic/ {print $3 ", " $4 ", " $5 ", " $6}'

send() { printf '%s\n' "$@" | kafka kafka-console-producer.sh --topic saldos --reader-property parse.key=true \
           --reader-property key.separator='|'; }
send 'cuenta-1|100' 'cuenta-2|50' 'cuenta-1|90' 'cuenta-1|75' 'cuenta-2|60'
read_all() { kafka kafka-console-consumer.sh --topic saldos --from-beginning --timeout-ms 5000 \
               --formatter-property print.key=true 2> /dev/null; }
echo "antes de compactar: $(read_all | wc -l) eventos"

for _ in $(seq 1 30); do   # el segmento activo no se compacta: un evento nuevo cierra el anterior
  sleep 2
  send 'cierre|0'
  remaining=$(read_all | grep -c '^cuenta-' || true)
  [ "$remaining" -le 2 ] && break
done
echo "después de compactar: $(read_all | grep '^cuenta-' | sort | tr '\t\n' '= ')"
```

El script se **ejecuta en la CI contra un broker Kafka 4.3.1 en KRaft, en Docker** (ADR-017). Imprime el líder del quorum y sus votantes, el estado de la partición (`Leader: 1, Replicas: 1, Isr: 1`), `antes de compactar: 5 eventos` y `después de compactar: cuenta-1=75 cuenta-2=60`. La compactación la hace el log cleaner en segundo plano, por eso el script espera hasta verla. La regla de `min.insync.replicas` necesita varios brokers y se cita de *Topic Configs* y *Eligible Leader Replicas*; con un solo broker no se reproduce.

## 11. GCP

En GCP, el broker administrado que citan las fichas es **Pub/Sub**, que no es Kafka. Según *Subscription overview* (no ejecutado):

| | Kafka | Pub/Sub |
|---|---|---|
| Modelo | Topics particionados, grupos de consumidores con offsets | Topics y suscripciones; cada suscripción recibe los mensajes publicados después de crearla |
| Qué opera el equipo | Brokers, controllers y réplicas | Nada de infraestructura |

## 12. AWS

En AWS, **Amazon MSK** es Kafka administrado. Según *Welcome to the Amazon MSK Developer Guide* y *Supported Apache Kafka versions* (no ejecutado):

| | Kafka propio | Amazon MSK |
|---|---|---|
| Qué opera el equipo | Todo el clúster | MSK opera el plano de control (crear, actualizar y borrar clústeres); se usa el plano de datos de Kafka |
| Versiones | Las que elija el equipo, como 4.3 en esta ficha | Las que lista MSK: 4.2.x, 4.1.x, 4.0.x, 3.9.x y anteriores (consultado el 2026-10-12) |

## 13. Azure

En Azure, **Event Hubs** expone un endpoint de Kafka. Según *What is Azure Event Hubs for Apache Kafka?* (no ejecutado):

| | Kafka | Event Hubs |
|---|---|---|
| Qué es | El clúster de Kafka | Un servicio propio con un endpoint compatible con Kafka |
| Clientes | Clientes de Kafka | Muchas aplicaciones de Kafka se conectan cambiando solo la configuración |

## 14. Buenas prácticas

- Factor 3, `min.insync.replicas=2` y `acks=all` para datos importantes.
- 3 o 5 controllers en producción, separados de los brokers cuando el clúster crece.
- `compact` para estado por clave; `delete` para eventos.
- **Seguridad:** autenticación de clientes y autorización por topic; cifrado entre brokers y clientes.
- **Observabilidad:** particiones con el ISR por debajo del mínimo, líder del quorum, lag de los consumidores.
- **Costo:** el factor de replicación multiplica el almacenamiento y el tráfico entre zonas.

## 15. Errores frecuentes

- Factor 1 o `acks=1` en datos que no se pueden perder.
- Un número par de controllers.
- Esperar que un topic compactado quede con un solo evento por clave al instante: el segmento activo no se compacta.
- Copiar un manual de Kafka 3.x sobre ZooKeeper a un clúster 4.x en KRaft.

## 16. Trade-offs

Más réplicas y un `min.insync.replicas` alto dan durabilidad, a cambio de latencia y de rechazar escrituras cuando faltan réplicas. KRaft elimina un sistema aparte para los metadatos, a cambio de operar el quorum. La compactación mantiene el estado por clave con almacenamiento acotado, con un proceso en segundo plano que hay que vigilar.

## 17. Conceptos relacionados

- `topics-and-partitions`: la unidad de replicación.
- `message-brokers`: el rol de broker.
- `offsets`: la posición de los consumidores.
- `delivery-semantics`: acks y durabilidad.
- `exactly-once-semantics`: transacciones entre topics.
- `msk-managed-kafka`: Kafka en AWS.
- `event-hubs-streaming`: el endpoint de Kafka en Azure.

## 18. Preguntas técnicas abiertas

1. ¿Con qué factor de replicación y `min.insync.replicas` corren tus topics críticos?
2. ¿Qué datos de tu plataforma serían un buen topic compactado?
3. ¿Qué te da operar Kafka que no te da MSK o Event Hubs?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Apache Kafka 4.3: *Introduction*, *KRaft*, *Design*, *Topic Configs*, *Eligible Leader Replicas* y *API*.
- Google Cloud: *Subscription overview*.
- AWS: *Welcome to the Amazon MSK Developer Guide* y *Supported Apache Kafka versions*.
- Microsoft Learn: *What is Azure Event Hubs for Apache Kafka?*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-20. `review_required`: pendiente de revisión B-F3.1 del lote F3b-20a.

## 22. Historial de cambios importantes

- 2026-10-20: creación (lote F3b-20a).
