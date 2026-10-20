---
id: concept:root-cause-analysis
slug: root-cause-analysis
type: concept
title: Análisis de causa raíz
description: "Ir del síntoma a las causas de un incidente de datos: ordenar los errores en el tiempo, encontrar el primero y la etapa donde ocurrió, buscar qué cambió justo antes (schema, código, origen) y confirmar en un postmortem sin culpas, con causas que contribuyeron y acciones para que no se repita. Ejemplo ejecutado en la CI sobre logs JSON. Logs y trazas en Cloud Logging y Cloud Trace, CloudWatch Logs Insights y X-Ray, y Azure Monitor Logs, con sus diferencias."
domain: observability
subdomain: reliability-operations
category: observability
classification: core
level: intermediate
importance: medium
cloud: [agnostic]
technologies: [python, gcp-cloud-monitoring, aws-cloudwatch, azure-monitor]
tags: [observability, root-cause, postmortem, incidents, logs]
related_topics: [incident-response, observability-logs]
sources:
  - source: google-sre-book
    url: https://sre.google/sre-book/postmortem-culture/
    accessed: 2026-10-20
    page_title: "Postmortem Culture: Learning from Failure"
    note: "Postmortem Culture: Learning from Failure (SRE book): un postmortem es un registro escrito de un incidente, su impacto, las acciones para mitigarlo o resolverlo, las causas raíz y las acciones de seguimiento para que no se repita; sus objetivos son que el incidente quede documentado, que se entiendan todas las causas que contribuyeron y que se tomen acciones preventivas. Un postmortem blameless no apunta a personas: señala dónde y cómo mejorar los servicios."
  - source: gcp-cloud-logging-docs
    url: https://docs.cloud.google.com/logging/docs/structured-logging
    accessed: 2026-10-20
    page_title: "Structured logging"
    note: "Structured logging (Cloud Logging): si el payload es un objeto JSON guardado en jsonPayload, la entrada es un log estructurado y se pueden hacer consultas sobre rutas JSON e indexar campos; si es texto en textPayload, es no estructurado: se puede buscar pero no indexar su contenido. Para escribir logs estructurados, la aplicación escribe objetos JSON serializados; algunos servicios, como GKE y Cloud Run functions, tienen un agente que envía lo escrito en stdout o stderr."
  - source: gcp-cloud-trace-docs
    url: https://docs.cloud.google.com/trace/docs/overview
    accessed: 2026-10-20
    page_title: "Cloud Trace overview"
    note: "Cloud Trace overview: Cloud Trace es un sistema de trazas distribuidas de Google Cloud que registra la latencia de las solicitudes y ayuda a encontrar cuellos de botella entre servicios; recolecta datos de latencia de servicios de Google Cloud y de aplicaciones instrumentadas, mide la latencia de punta a punta y ayuda a encontrar logs relacionados. El índice de la documentación incluye páginas para enviar trazas con OpenTelemetry Protocol (OTLP)."
  - source: aws-cloudwatch-logs-docs
    url: https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html
    accessed: 2026-10-20
    page_title: "Supported logs and discovered fields"
    note: "Supported logs and discovered fields (CloudWatch Logs Insights): para cada log de un log group de clase Standard genera campos de sistema como @message (el evento sin parsear) y @timestamp; para muchos tipos de log descubre los campos automáticamente, entre ellos los de logs JSON; los que no descubre se extraen con el comando parse."
  - source: aws-xray-docs
    url: https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html
    accessed: 2026-10-20
    page_title: "What is AWS X-Ray?"
    note: "What is AWS X-Ray?: X-Ray recolecta datos de las solicitudes que atiende la aplicación y da herramientas para verlos y filtrarlos; para cada solicitud trazada muestra la solicitud, la respuesta y las llamadas a recursos de AWS, microservicios, bases de datos y APIs. Recibe trazas de la aplicación y de los servicios de AWS ya integrados con X-Ray."
  - source: azure-monitor-docs
    url: https://learn.microsoft.com/en-us/azure/azure-monitor/logs/data-platform-logs
    accessed: 2026-10-20
    page_title: "Azure Monitor Logs overview"
    note: "Azure Monitor Logs overview: plataforma SaaS centralizada para recolectar, analizar y actuar sobre telemetría de recursos de Azure y de otros; los datos se guardan en un Log Analytics workspace, el recurso principal, con retención por tipo de dato; se consultan con Kusto Query Language (KQL) o con herramientas basadas en KQL."
relations:
  - type: RELATED_TO
    target: incident-response
    note: Después de mitigar, la causa.
  - type: RELATED_TO
    target: observability-logs
    note: Los logs JSON son la materia prima.
  - type: RELATED_TO
    target: observability-traces
    note: La traza muestra en qué etapa empezó.
  - type: RELATED_TO
    target: schema-change-detection
    note: Un cambio de schema es una causa frecuente.
created_at: 2026-10-20
updated_at: 2026-10-20
last_verified: 2026-10-20
verification_status: review_required
---

## 1. Resumen

El **análisis de causa raíz** va del síntoma («la publicación se bloqueó») a lo que lo provocó («el origen cambió el tipo de `monto`»). En datos, casi siempre sirve el mismo camino:

1. ordenar los errores en el tiempo y encontrar el **primero**: los siguientes suelen ser consecuencias;
2. ver en qué **etapa** ocurrió;
3. buscar **qué cambió** justo antes: schema, código, configuración, el origen;
4. confirmar la hipótesis y escribirla en un **postmortem** sin culpas, con las causas que contribuyeron y las acciones para que no se repita (*Postmortem Culture: Learning from Failure*, libro de SRE de Google).

El libro habla de causas raíz en plural: un incidente suele tener varias que contribuyen.

## 2. Qué es

- **Síntoma:** lo que vio el consumidor o la alerta.
- **Primer error:** el más temprano de la corrida; los demás suelen derivar de él.
- **Cambio previo:** algo que cambió antes de la corrida que falló.
- **Causa candidata:** una hipótesis que hay que confirmar.
- **Postmortem:** registro del incidente, su impacto, lo hecho para mitigarlo, las causas y las acciones de seguimiento.

## 3. Problema que resuelve

Una corrida termina con tres errores: en `transform`, en `load` y en `publish`. El equipo empieza por el último, «publicación bloqueada», y revisa el gate. Ordenando por tiempo, el primero es en `transform` («monto sin decimales») y 20 minutos antes de la corrida el origen cambió `monto` de `numeric` a `bigint`. La causa candidata aparece en minutos.

## 4. Cómo funciona

1. Reunir logs y trazas de la corrida afectada (por `run_id` o `trace_id`).
2. Filtrar los `ERROR` y ordenarlos por hora.
3. Tomar el primero y su etapa.
4. Buscar eventos de cambio previos a la corrida: schema, despliegues, configuración, origen.
5. Formular la causa candidata y confirmarla (reproducir, revertir, comparar con la corrida anterior).
6. Escribir el postmortem: línea de tiempo, causas, acciones.

## 5. Cuándo utilizarlo

- Después de mitigar todo incidente con impacto.
- Ante errores repetidos aunque no hayan escalado a incidente.

## 6. Cuándo no utilizarlo

- Antes de mitigar, si los consumidores siguen afectados.
- Para buscar a quién culpar: el postmortem blameless apunta a mejorar los servicios.

## 7. Ejemplo sencillo

| Hora | Etapa | Evento |
|---|---|---|
| 05:40 | — | Schema cambió: `monto numeric -> bigint` en `raw_pedidos` |
| 06:00 | extract | Filas leídas |
| 06:02 | transform | ERROR: monto sin decimales, margen 0 |
| 06:03 | load | ERROR: test margen > 0 falló |
| 06:04 | publish | ERROR: publicación bloqueada |

Primer error en `transform`; cambio previo 20 minutos antes. Causa candidata: el cambio de schema, a confirmar.

## 8. Ejemplo de producción

- Logs JSON con `run_id`, `stage` y `trace_id`; eventos de cambio (schema, despliegues) en el mismo lugar.
- Una consulta guardada: «errores de la corrida X ordenados por hora» y «cambios en las 24 h previas».
- Plantilla de postmortem: resumen, impacto, línea de tiempo, causas que contribuyeron, qué funcionó, acciones con dueño y fecha.
- Las acciones del postmortem se siguen hasta cerrarse.

## 9. Arquitectura

```mermaid
flowchart LR
  L["Logs y trazas<br/>de la corrida"] --> E["Errores ordenados"]
  E --> P["Primer error + etapa"]
  C["Eventos de cambio"] --> H["Causa candidata"]
  P --> H
  H --> V["Confirmar"]
  V --> PM["Postmortem<br/>causas · acciones"]
```

## 10. Código

```python
"""Del síntoma a la causa: el primer error de cada corrida, la etapa donde ocurrió y qué cambió justo antes."""
import json
from collections import Counter
from datetime import datetime

LOGS = """\
{"ts": "2026-10-19T06:00", "run": "r19", "stage": "load", "severity": "INFO", "message": "filas escritas", "rows": 1000}
{"ts": "2026-10-20T05:40", "run": "-", "stage": "-", "severity": "INFO", "message": "schema cambió: monto numeric -> bigint", "table": "raw_pedidos"}
{"ts": "2026-10-20T06:00", "run": "r20", "stage": "extract", "severity": "INFO", "message": "filas leídas", "rows": 1000}
{"ts": "2026-10-20T06:02", "run": "r20", "stage": "transform", "severity": "ERROR", "message": "monto sin decimales: margen 0"}
{"ts": "2026-10-20T06:03", "run": "r20", "stage": "load", "severity": "ERROR", "message": "test margen > 0 falló"}
{"ts": "2026-10-20T06:04", "run": "r20", "stage": "publish", "severity": "ERROR", "message": "publicación bloqueada"}
"""
eventos = [json.loads(linea) for linea in LOGS.splitlines()]
errores = [e for e in eventos if e["severity"] == "ERROR"]
primero = min(errores, key=lambda e: e["ts"])
inicio_corrida = min(e["ts"] for e in eventos if e["run"] == primero["run"])
cambios_previos = [e for e in eventos if e["run"] == "-" and e["ts"] < inicio_corrida]

print(f"errores: {len(errores)} en etapas {dict(Counter(e['stage'] for e in errores))}")
print(f"primer error: {primero['stage']} a las {primero['ts'][11:]}: {primero['message']}")
for c in cambios_previos:
    antes = datetime.fromisoformat(inicio_corrida) - datetime.fromisoformat(c["ts"])
    print(f"cambio previo ({int(antes.total_seconds() // 60)} min antes de la corrida): {c['message']} en {c['table']}")
print("síntoma: publicación bloqueada; causa candidata: el cambio de schema; a confirmar en el postmortem")
```

El script se **ejecuta en la CI** y pasa `mypy --strict`. Imprime `errores: 3 en etapas {'transform': 1, 'load': 1, 'publish': 1}`, `primer error: transform a las 06:02: monto sin decimales: margen 0`, `cambio previo (20 min antes de la corrida): schema cambió: monto numeric -> bigint en raw_pedidos` y la causa candidata «a confirmar en el postmortem».

## 11. GCP

En GCP, **Cloud Logging** y **Cloud Trace**. Según *Postmortem Culture: Learning from Failure*, *Structured logging* y *Cloud Trace overview* (no ejecutado):

| | Análisis de causa raíz (este concepto) | Cloud Logging y Cloud Trace |
|---|---|---|
| Ordenar errores | Por hora, en los logs de la corrida | Logs estructurados en `jsonPayload`, con consultas sobre campos |
| Encontrar la etapa | El primer error y su etapa | Cloud Trace mide la latencia de punta a punta y ayuda a encontrar los logs relacionados |
| Postmortem | Parte del proceso | Las páginas citadas no lo tratan |

## 12. AWS

En AWS, **CloudWatch Logs Insights** y **X-Ray**. Según *Postmortem Culture: Learning from Failure*, *Supported logs and discovered fields* y *What is AWS X-Ray?* (no ejecutado):

| | Análisis de causa raíz (este concepto) | CloudWatch Logs Insights y X-Ray |
|---|---|---|
| Consultar logs | Por `run_id` y `severity` | Campos descubiertos en logs JSON, o extraídos con `parse` |
| Recorrido | Etapas de la corrida | X-Ray muestra cada solicitud y sus llamadas a recursos de AWS, servicios, bases de datos y APIs |

## 13. Azure

En Azure, **Azure Monitor Logs**. Según *Postmortem Culture: Learning from Failure* y *Azure Monitor Logs overview* (no ejecutado):

| | Análisis de causa raíz (este concepto) | Azure Monitor Logs |
|---|---|---|
| Dónde están los datos | Logs y eventos de cambio juntos | Un Log Analytics workspace |
| Consultas | Errores por hora, cambios previos | KQL o herramientas basadas en KQL |

## 14. Buenas prácticas

- Empezar por el primer error, no por el último.
- Registrar los cambios (schema, despliegues, configuración) donde están los logs.
- Hablar de causas que contribuyeron, en plural.
- Postmortems sin culpas, con acciones que tengan dueño y fecha.
- **Seguridad:** el postmortem se comparte; sin datos personales ni credenciales.
- **Observabilidad:** cada acción del postmortem que agregue una señal que habría detectado antes el problema.
- **Costo:** retener logs el tiempo suficiente para investigar; menos retención ahorra y puede dejar sin datos el análisis.

## 15. Errores frecuentes

- Arreglar el síntoma (desbloquear la publicación) y no la causa.
- Una sola «causa raíz» cuando hubo varias.
- Postmortems que no se leen ni se siguen.
- Buscar culpables.

## 16. Trade-offs

Un análisis profundo encuentra causas de fondo y toma tiempo; uno superficial cierra rápido y deja que el incidente se repita. Más retención de logs facilita investigar y cuesta almacenamiento.

## 17. Conceptos relacionados

- `incident-response`: la respuesta.
- `observability-logs`: logs JSON.
- `observability-traces`: trazas.
- `schema-change-detection`: una causa frecuente.

## 18. Preguntas técnicas abiertas

1. ¿Tus logs permiten ordenar los errores de una corrida en el tiempo?
2. ¿Dónde quedan registrados los cambios de schema y los despliegues?
3. ¿Las acciones de tu último postmortem se cerraron?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Google, *Site Reliability Engineering*: *Postmortem Culture: Learning from Failure*.
- Google Cloud: *Structured logging* y *Cloud Trace overview*.
- AWS: *Supported logs and discovered fields* y *What is AWS X-Ray?*.
- Microsoft Learn: *Azure Monitor Logs overview*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-20. `review_required`: pendiente de revisión B-F3.1 del lote F3b-16b.

## 22. Historial de cambios importantes

- 2026-10-20: creación (lote F3b-16b).
