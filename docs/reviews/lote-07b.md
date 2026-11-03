# Revisión · lote 07b

Rama `b/review-07b`, creada desde `20cbe86` (`origin/main`). Cinco arquitecturas: `streaming-pipeline-architecture`, `event-driven-architecture`, `lambda-architecture`, `kappa-architecture` y `real-time-analytics-architecture`. No se editó `content/` ni `frontend/`. Estado: pendiente de la aprobación de Felipe.

Páginas reabiertas el 2026-11-03: *Big data architectures*, *Event-driven architecture style* y el H1 de la página de Fabric sobre medallion. El resto de §11–§13 no se volvió a abrir en esta pasada.

## Común

`scripts/validate.py` terminó así:

```
AVISO content\architectures\streaming-pipeline-architecture.md: [sources.8.page_title] repite el de sources.7 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 697 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

El aviso nuevo de streaming son dos URLs del mismo guide de Spark 4.2.0 (Getting Started y APIs on DataFrames) con el mismo H1. Los otros tres avisos son los de siempre.

Las 15 vistas miden 7 nodos o menos contando subgraph. Cada una tiene un diagrama. Las de contexto en `LR` tienen cadena de 5 cajas o menos. En los cinco §9 el barrido de montos (`$`, USD, €) devolvió vacío.

`pytest tests/test_architecture_snippets.py` con el filtro de este lote y del 07c terminó con código 0 y la línea `..s.....s.`. En este lote, lambda, real-time, event-driven y kappa exigieron igualdad exacta del bloque `text` y pasaron (Kafka 4.3.1 en Docker). Streaming se saltó:

```
SKIPPED [1] tests\test_snippet_code.py:111: falta pyspark (make snippets-deps)
```

El §10 de streaming dice ejecutado en la CI con PySpark 4.2.0. Aquí no se reejecutó. Beam y Dataflow dicen «No ejecutado».

Relaciones y §17, con el slug entre comillas invertidas:

```
streaming-pipeline-architecture
  rel sin 17 []
  17 sin rel []
event-driven-architecture
  rel sin 17 []
  17 sin rel []
lambda-architecture
  rel sin 17 []
  17 sin rel []
kappa-architecture
  rel sin 17 []
  17 sin rel []
real-time-analytics-architecture
  rel sin 17 []
  17 sin rel []
```

`related_topics` queda dentro de `relations` en las cinco.

El §18 se encadena: streaming llega desde batch y puede sumar kappa o real-time; event-driven puede pasar a kappa; lambda dice que no es el diseño por defecto y suele evolucionar a kappa; kappa llega desde lambda o desde event-driven y el §15 dice «Presentarla como reemplazo de todo batch». Real-time se describe como la consulta, no el pipeline que trae los datos.

Laboratorio en F4, como el ROADMAP (batch, streaming, CDC, API→DWH, Medallion y event-driven): streaming y event-driven lo prometen. Lambda, kappa y real-time dicen «Sin laboratorio en F4: no está entre las 6 arquitecturas de F4».

## H1 de Fabric (ADR-012)

**Hallazgo:** ninguna. El `page_title` guardado es el H1 del HTML.

**Severidad:** ninguna.

**Evidencia:** el HTML de [Understand medallion architecture for Fabric with OneLake](https://learn.microsoft.com/en-us/fabric/onelake/onelake-medallion-lakehouse-architecture), leído el 2026-11-03:

```
<h1 id="understand-medallion-architecture-for-fabric-with-onelake">Understand medallion architecture for Fabric with OneLake</h1>
```

La etiqueta `<title>` es «Implement Medallion Lakehouse Architecture in Fabric - Microsoft Fabric | Microsoft Learn». ADR-012 usa el encabezado principal, no esa etiqueta. `medallion-architecture` guarda `page_title: Understand medallion architecture for Fabric with OneLake`.

## Fuentes nuevas sin URL

**Hallazgo:** tres citas nuevas del Azure Architecture Center traen `page_title` y nota, y no traen `url`.

**Severidad:** media.

**Evidencia:** el frontmatter de event-driven (*Event-driven architecture style*), lambda y kappa (*Big data architectures*) no tiene `url`. El H1 del HTML, el 2026-11-03, es exactamente ese `page_title`. La nota de Lambda y Kappa coincide con la página: dos caminos, speed layer «at the expense of accuracy», dato crudo inmutable, y Kappa con un solo camino y replay. La nota de event-driven coincide con publish-subscribe, event streaming y la frase «Larger payloads increase transport cost and bandwidth consumption», que es la cita del §9.

**Corrección:** agregar `https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven` y `https://learn.microsoft.com/en-us/azure/architecture/databases/guide/big-data-architectures`.

## streaming-pipeline-architecture

**Hallazgo:** la vista de despliegue junta Validación y Ventanas y watermark en un nodo, «Validación y ventanas».

**Severidad:** baja.

**Evidencia:** el §4 nombra las dos piezas por separado. El §3 y el §5 las separan. El §6 dice «Validación y ventanas». Las 15 etiquetas de las otras cajas empiezan por el nombre del §4 (Broker, DLQ, Checkpoint, Sink idempotente). `view_nodes`: 7, 7 y 7.

**Corrección:** en el §6, dos nodos con esos nombres, o un subgraph cuyo título no reemplace a los dos.

## event-driven-architecture

**Hallazgo:** la vista de datos llama «Grupo facturación» al componente «Grupo o suscripción por consumidor».

**Severidad:** baja.

**Evidencia:** el §4 usa ese nombre. El §5 dice «Grupo facturación: su offset» y «Grupo auditoría: su offset». «Consumidor idempotente», «Canal», «Productor», «DLQ» y «Registro de esquemas» sí aparecen. `view_nodes`: 7, 7 y 7. El §9 cita el costo de los payloads grandes, y esa frase está en la página.

**Corrección:** titular el nodo «Grupo o suscripción / por consumidor» y dejar «facturación» en el texto, no en el nombre.

## lambda-architecture

**Hallazgo:** no hay un nodo llamado Corte. La palabra va dentro de otras etiquetas.

**Severidad:** baja.

**Evidencia:** el §4 lista Corte. El §5 dice «desde el corte», «hasta el corte» y la arista «nuevo corte». Capa batch, Capa speed, Capa de servicio y Master dataset sí son nodos. `view_nodes`: 6, 5 y 7. La descripción dice que no es el diseño por defecto. El §19 no promete laboratorio.

**Corrección:** un nodo «Corte» en la vista de datos, entre la capa batch y la capa speed.

## kappa-architecture

**Hallazgo:** ninguna en el foco de esta pasada.

**Severidad:** ninguna.

`view_nodes`: 6, 7 y 6. Los nodos usan Log de eventos, Posición v1/v2, Vista v1/v2, Selector y Procesador v1/v2. El §15 advierte no presentarla como reemplazo de todo batch. El §16 deja lambda como alternativa. El §19 no promete laboratorio. El bloque `text` pasó la igualdad exacta contra Kafka.

## real-time-analytics-architecture

**Hallazgo:** Medición de frescura está en el §4 y en ninguna de las tres vistas.

**Severidad:** baja.

**Evidencia:** el §3 usa «Pipeline streaming» como la caja de entrada, que es el pipeline de al lado y no un componente de esta ficha. El §5 y el §6 usan Ingesta con deduplicación, Crudo reciente, Rollups por minuto, Almacén columnar y Capa de consulta. `view_nodes`: 7, 6 y 7. El §19 no promete laboratorio. El bloque `text` pasó la igualdad exacta.

**Corrección:** un nodo «Medición de frescura» en la vista de datos o en la de contexto, junto a la capa de consulta.
