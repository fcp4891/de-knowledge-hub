# ADR-017 — Kafka en KRaft con Docker en la CI

- **Estado:** Aceptado
- **Fecha:** 2026-10-19
- **Fase:** F3b — Contenido por dominio, dominio 14-streaming (decisión de Felipe al aprobar el plan de 14)
- **Referencias:** ADR-016 (Docker real en la CI, imágenes por digest), ADR-011 y ADR-013 (servicios de nube sin ejecutar o emulados).

## Contexto

14-streaming trata de eventos, productores y consumidores, brokers, topics y particiones, offsets, orden y semánticas de entrega. Los conceptos se ven mejor con un broker real: un grupo de consumidores que retoma donde quedó, un offset que se reinicia, una clave que cae siempre en la misma partición. La CI ya ejecuta Docker (ADR-016).

## Decisión

1. **Broker Kafka real en la CI.** `tests/test_kafka_snippets.py` levanta un contenedor `apache/kafka:4.3.1` (la versión vigente según *Downloads* de kafka.apache.org, del 2026-06-25) en modo KRaft, nodo único y configuración por defecto, como en *Docker* de la documentación de Kafka 4.3. La imagen va fijada por digest del índice multiplataforma, consultado el 2026-10-19 con `docker buildx imagetools inspect`:
   - `apache/kafka:4.3.1@sha256:77e3df9054047a88b520d0cc46e16696d3b22022e1d580aeccd2632df6532837`.
2. **Herramientas de la imagen, sin clientes nuevos.** Los bloques ```` ```bash ```` del §10 usan las herramientas de línea de comandos que trae la imagen (`kafka-topics.sh`, `kafka-console-producer.sh`, `kafka-console-consumer.sh`, `kafka-consumer-groups.sh`, `kafka-configs.sh`) con `docker exec`. No se agregan dependencias de Python. El contenedor se llama según `KAFKA_CONTAINER`; cada ejemplo crea su topic y lo borra al salir.
3. **En la CI no se salta.** Con `REQUIRE_DOCKER=1` (ADR-016), si Docker no responde, los tests fallan; en local se saltan.
4. **Lo que no se ejecuta.** Pub/Sub, Kinesis, MSK y Event Hubs quedan «no ejecutado». Las semánticas de entrega ante una caída del consumidor se muestran además con una simulación en Python de biblioteca estándar, marcada como simulación.
5. **Documentación citada.** Las fichas citan las páginas versionadas de Kafka 4.3 (`https://kafka.apache.org/43/...`), con la fuente existente `apache-kafka-docs`.

## Consecuencias

- La CI descarga una imagen más y espera a que el broker arranque (unos segundos).
- Actualizar Kafka es cambiar el tag y el digest en el test, en las fichas que los nombran y en este ADR, y revisar las páginas versionadas citadas.
- En local: Docker Desktop encendido; en Git Bash, `MSYS_NO_PATHCONV=1` para que `/opt/kafka/bin` no se convierta en una ruta de Windows (el test ya lo pasa).
