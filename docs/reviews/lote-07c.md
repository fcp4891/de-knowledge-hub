# Revisión · lote 07c

Rama `b/review-07c`, creada desde `20cbe86` (`origin/main`). Cinco arquitecturas: `cdc-architecture`, `api-to-warehouse-architecture`, `iot-pipeline-architecture`, `ml-feature-pipeline-architecture` y `rag-data-pipeline-architecture`. No se editó `content/` ni `frontend/`. Estado: pendiente de la aprobación de Felipe.

Páginas reabiertas el 2026-11-03: *47.1. Logical Decoding Examples* y *F.43. test_decoding* (PostgreSQL 17), *What is AWS IoT?*, *What is Azure IoT Hub?*, *What is managed feature store?* y *Gemini Enterprise Agent Platform name changes*. El resto de §11–§13 no se volvió a abrir en esta pasada.

## Común

`scripts/validate.py` en este árbol terminó en `OK: 697 entidades`, con el aviso nuevo de dos URLs de Spark en `streaming-pipeline-architecture` y los tres avisos de Spark ya conocidos. Ningún aviso en estas cinco fichas.

Las 15 vistas miden 7 nodos o menos contando subgraph. Cada una tiene un diagrama. Las de contexto en `LR` tienen cadena de 5 cajas o menos. En los cinco §9 el barrido de montos (`$`, USD, €) devolvió vacío.

En el mismo `pytest` del lote 07b (`..s.....s.`, código 0), api-to-warehouse, iot, ml-feature y cdc exigieron igualdad exacta del bloque `text` y pasaron. CDC corrió contra el PostgreSQL 17 con `wal_level=logical` que el test levanta en Docker. RAG se saltó:

```
SKIPPED [1] tests\test_ai_snippets.py:34: falta numpy (make snippets-deps)
```

El §10 de RAG dice ejecutado en la CI con numpy. Aquí no se reejecutó. Las filas de nube que dicen «No ejecutado» lo dicen. CDC dice que `test_decoding` es un plugin de ejemplo y que en producción Debezium y Datastream usan `pgoutput`.

Relaciones y §17:

```
cdc-architecture
  rel sin 17 []
  17 sin rel []
api-to-warehouse-architecture
  rel sin 17 []
  17 sin rel []
iot-pipeline-architecture
  rel sin 17 []
  17 sin rel []
ml-feature-pipeline-architecture
  rel sin 17 []
  17 sin rel []
rag-data-pipeline-architecture
  rel sin 17 []
  17 sin rel []
```

`related_topics` queda dentro de `relations` en las cinco.

El §18 no se contradice con el lote 07b: CDC puede publicar los cambios en un broker (`streaming-pipeline-architecture`); API → warehouse puede pasar la parte incremental a eventos y deja la extracción completa como reconciliación; IoT puede bajar la decisión al field gateway; el feature pipeline puede calcular el store online en streaming; RAG dice que las preguntas tabulares se responden en el warehouse. RAG es `emerging` y la descripción dice que no reemplaza al warehouse.

Laboratorio en F4, como el ROADMAP: CDC y API → warehouse lo prometen. IoT, el feature pipeline y RAG dicen «Sin laboratorio en F4». El §12 de CDC deja la ejecución de Debezium para F4, que es lo que dice el ROADMAP.

## H1 de Fabric (ADR-012)

El HTML de la página de medallion, leído el 2026-11-03, tiene `<h1>Understand medallion architecture for Fabric with OneLake</h1>`. La etiqueta `<title>` es «Implement Medallion Lakehouse Architecture in Fabric». El `page_title` de `medallion-architecture` es el H1.

## Fuentes nuevas sin URL

**Hallazgo:** las cinco citas nuevas traen `page_title` y nota, y no traen `url`.

**Severidad:** media.

**Evidencia:** CDC (*47.1. Logical Decoding Examples* y *F.43. test_decoding*), IoT (*What is Azure IoT Hub?* y *What is AWS IoT?*) y el feature pipeline (*What is managed feature store?*). Las notas coinciden con las páginas abiertas el 2026-11-03. PostgreSQL 17: «Once changes are read, they're consumed and not emitted in a subsequent call» y «test_decoding is an example of a logical decoding output plugin». IoT Hub: el endpoint integrado «retained for up to seven days». AWS IoT: MQTT, MQTT sobre WSS, HTTPS y LoRaWAN. Feature store: «The primary cost associated with feature store usage involves managed Spark materialization jobs», que es la frase del §9, y el online en Redis y el offline en ADLS Gen2.

**Corrección:** agregar estas URL:

- `https://www.postgresql.org/docs/17/logicaldecoding-example.html`
- `https://www.postgresql.org/docs/17/test-decoding.html`
- `https://learn.microsoft.com/en-us/azure/iot-hub/iot-concepts-and-iot-hub`
- `https://docs.aws.amazon.com/iot/latest/developerguide/what-is-aws-iot.html`
- `https://learn.microsoft.com/en-us/azure/machine-learning/concept-what-is-managed-feature-store`

## cdc-architecture

**Hallazgo:** Plugin de salida está en el §4 y en ninguna de las tres vistas.

**Severidad:** baja.

**Evidencia:** el §4 dice «`pgoutput` en producción; `test_decoding` es un ejemplo». El §3, el §5 y el §6 nombran PostgreSQL (origen), Slot de replicación, Captura de cambios, Warehouse (destino) y Monitoreo del slot. `view_nodes`: 5, 6 y 7. El bloque `text` pasó la igualdad exacta. El §19 promete el laboratorio de F4, que es una de las 6 del ROADMAP.

**Corrección:** un nodo «Plugin de salida» entre el WAL y la captura.

## api-to-warehouse-architecture

**Hallazgo:** ninguna en el foco de esta pasada.

**Severidad:** ninguna.

`view_nodes`: 6, 6 y 7. Los nodos usan Orquestador, Extractor, Zona de aterrizaje, Warehouse, Watermark y Secreto. El §19 promete el laboratorio de F4. El bloque `text` pasó la igualdad exacta. El §18 deja el conector propio del proveedor como señal para no adoptarla.

## iot-pipeline-architecture

**Hallazgo:** ninguna en el foco de esta pasada.

**Severidad:** ninguna.

`view_nodes`: 7, 6 y 6. Los nodos usan Registro de dispositivos, Gateway, Hot path, Cold path y Alertas. El §11 y el §13 dicen «No ejecutado». La retención de siete días y los protocolos de AWS IoT coinciden con las páginas. El §19 no promete laboratorio. El bloque `text` pasó la igualdad exacta.

## ml-feature-pipeline-architecture

**Hallazgo:** Chequeo de consistencia está en el §4 y en ninguna vista. La nota de renombres cita «Last updated 2026-10-09 UTC»; el pie de esa página dice 2026-10-30 UTC.

**Severidad:** baja.

**Evidencia:** el §3, el §5 y el §6 usan Pipeline de features, Store offline, Store online y Join point-in-time. `view_nodes`: 6, 6 y 6. En [Gemini Enterprise Agent Platform name changes](https://docs.cloud.google.com/gemini-enterprise-agent-platform/vertex-ai-name-changes), leída el 2026-11-03, están «Vertex AI Feature Store» y «Feature Store on Gemini Enterprise Agent Platform», y el único «Last updated» de la página es «Last updated 2026-10-30 UTC.» El §11 nombra Feature Store de Gemini Enterprise Agent Platform y dice que la plataforma es el nombre nuevo de Vertex AI Platform. SageMaker AI queda como el nombre del 3 de diciembre de 2024, en la nota ya guardada; esa página no se reabrió hoy. El §19 no promete laboratorio. El bloque `text` pasó la igualdad exacta.

**Corrección:** un nodo «Chequeo de consistencia» junto a los dos stores. Poner en la nota la fecha que muestra la página, 2026-10-30 UTC.

## rag-data-pipeline-architecture

**Hallazgo:** ninguna en el foco de esta pasada.

**Severidad:** ninguna.

`classification: emerging`. La descripción dice que no reemplaza al warehouse. `view_nodes`: 5, 7 y 7. Los nodos usan Documentos (fuente), Pipeline de indexación, Fragmentación por sección, Hash por fragmento, Índice vectorial y Asistente RAG. El §11 nombra RAG Engine de Gemini Enterprise Agent Platform y dice «No ejecutado». El §9 cita los límites de almacenamiento de *Vector indexes in Azure AI Search* y no pone montos. El §18 manda las preguntas tabulares al warehouse. El §19 no promete laboratorio. El test de numpy no corrió en esta máquina.
