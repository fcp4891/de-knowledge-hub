---
id: concept:data-sla
slug: data-sla
type: concept
title: SLA
description: "Un SLA de datos es un acuerdo con los consumidores que incluye consecuencias si no se cumplen sus objetivos (por ejemplo, el reporte antes de las 08:00 en el 90 % de los días hábiles). Se distingue del SLO, que es el objetivo interno, más estricto y sin consecuencia pactada. Ejemplo ejecutado en la CI. En Airflow 3 los SLA se quitaron y los reemplazaron las Deadline Alerts (3.1). Los SLA de BigQuery, S3 y Azure son de disponibilidad del servicio, no de los datos."
domain: observability
subdomain: reliability-operations
category: observability
classification: core
level: intermediate
importance: medium
cloud: [agnostic]
technologies: [python, apache-airflow, gcp-bigquery, aws-s3]
tags: [observability, sla, slo, reliability, agreements]
related_topics: [data-slo, data-freshness]
sources:
  - source: google-sre-book
    url: https://sre.google/sre-book/service-level-objectives/
    accessed: 2026-10-20
    page_title: "Service Level Objectives"
    note: "Service Level Objectives (SRE book): un SLI es una medida cuantitativa de algún aspecto del nivel de servicio; un SLO es un valor o rango objetivo para un nivel de servicio medido por un SLI; un SLA es un contrato explícito o implícito con los usuarios que incluye consecuencias de cumplir (o no) los SLO que contiene, más fáciles de ver cuando son financieras (un reembolso o una penalidad). Para distinguirlos: si no cumplir no tiene una consecuencia explícita, casi seguro es un SLO."
  - source: apache-airflow-docs
    url: https://airflow.apache.org/docs/apache-airflow/3.3.2/core-concepts/tasks.html
    accessed: 2026-10-20
    page_title: "Tasks"
    note: "Tasks (Airflow 3.3.2): la función de SLA de Airflow 2 se eliminó en 3.0 y se reemplazó en Airflow 3.1 con Deadline Alerts."
  - source: apache-airflow-docs
    url: https://airflow.apache.org/docs/apache-airflow/3.3.2/howto/deadline-alerts.html
    accessed: 2026-10-20
    page_title: "Deadline Alerts"
    note: "Deadline Alerts (Airflow 3.3.2): función experimental que puede cambiar sin aviso en versiones futuras. Permite fijar umbrales de tiempo para las corridas de un Dag y responder cuando se superan: se elige un punto de referencia (por ejemplo, cuando la corrida entra en cola, o un método propio que devuelve un timestamp), un intervalo y un callback que se ejecuta si se pasa el plazo; el callback puede ser un Notifier de Airflow o una función propia."
  - source: gcp-bigquery-docs
    url: https://cloud.google.com/bigquery/sla
    accessed: 2026-10-20
    page_title: "BigQuery Service Level Agreement (SLA)"
    note: "BigQuery Service Level Agreement (SLA): cada servicio cubierto da un Monthly Uptime Percentage (cada uno, un Service Level Objective): BigQuery, salvo la edición Standard, >= 99.99 %; edición Standard, >= 99.9 %. BigQuery Data Transfer Service tiene además un Data Delivery SLO de 24 horas o menos, solo para corridas programadas automáticamente. Si no se cumple, el cliente puede recibir Financial Credits, que son su único remedio; se calculan por mes calendario y por proyecto."
  - source: aws-s3-docs
    url: https://aws.amazon.com/s3/sla/
    accessed: 2026-10-20
    page_title: "Amazon S3 Service Level Agreement"
    note: "Amazon S3 Service Level Agreement: AWS hace esfuerzos comercialmente razonables para que S3 esté disponible con un Monthly Uptime Percentage en cada ciclo de facturación mensual (el Service Commitment); si no se cumple, el cliente puede recibir un Service Credit, calculado como porcentaje de lo pagado por la clase de almacenamiento afectada en la región."
  - source: microsoft-online-services-sla
    url: https://www.microsoft.com/licensing/docs/view/Service-Level-Agreements-SLA-for-Online-Services
    accessed: 2026-10-20
    page_title: "Service Level Agreements (SLA) for Online Services"
    note: "Service Level Agreements (SLA) for Online Services (Microsoft): los SLA describen los compromisos de Microsoft de disponibilidad y conectividad para sus servicios en línea; las ediciones actuales y archivadas se descargan y cubren Azure, Dynamics 365, Office 365 e Intune."
relations:
  - type: RELATED_TO
    target: data-slo
    note: El objetivo interno que avisa antes de tocar el SLA.
  - type: RELATED_TO
    target: data-freshness
    note: Un SLA de datos suele ser de frescura o de entrega.
  - type: RELATED_TO
    target: orchestration-observability
    note: Plazos y callbacks en el orquestador.
  - type: RELATED_TO
    target: data-contracts
    note: El contrato puede incluir el nivel de servicio.
created_at: 2026-10-20
updated_at: 2026-10-20
last_verified: 2026-10-20
verification_status: review_required
---

## 1. Resumen

Un **SLA** (service level agreement) es un **acuerdo** con quien consume, que incluye **consecuencias** si no se cumplen sus objetivos. Sin consecuencia explícita, lo que hay es un SLO (*Service Level Objectives*, libro de SRE de Google). En datos, un SLA suele ser de entrega o de frescura: «el reporte diario antes de las 08:00 en el 90 % de los días hábiles; si no, revisión con finanzas y plan de corrección».

Tres distinciones:

- **SLA frente a SLO:** el SLA es lo acordado con consecuencia; el SLO, el objetivo interno, más estricto, que avisa antes (`data-slo`).
- **SLA de datos frente a SLA del proveedor:** los SLA de BigQuery, S3 o Azure son de disponibilidad del servicio (Monthly Uptime Percentage), no de que tus datos lleguen a tiempo.
- **«SLA» en Airflow:** era una función de Airflow 2 que se quitó en 3.0; desde 3.1 la reemplazan las **Deadline Alerts** (*Tasks*, Airflow 3.3.2).

## 2. Qué es

| | SLA | SLO |
|---|---|---|
| Qué es | Acuerdo con consecuencias | Objetivo medido por un SLI |
| Con quién | Con los consumidores | Interno del equipo |
| Si no se cumple | La consecuencia pactada | Se prioriza la confiabilidad |
| Exigencia | Lo que se puede prometer | Más estricta que el SLA |

## 3. Problema que resuelve

Finanzas dice que «el reporte siempre llega tarde». El equipo dice que «casi siempre llega bien». No hay número acordado ni consecuencia: cada retraso es una discusión. Con un SLA (hora, porcentaje y consecuencia), el cumplimiento del mes es un dato, y un SLO interno más estricto avisa antes de llegar al límite.

## 4. Cómo funciona

1. Se acuerda con el consumidor: qué se entrega, a qué hora, en qué porcentaje de días y qué pasa si no.
2. El equipo fija un SLO más estricto (más temprano o más alto).
3. Se mide cada día con un SLI (la hora real de entrega).
4. Al cierre del período se calcula el cumplimiento del SLO y del SLA.
5. Si se incumple el SLA, se aplica la consecuencia; si se incumple el SLO, el equipo actúa antes.

## 5. Cuándo utilizarlo

- Con consumidores que toman decisiones a una hora fija (cierres, reportes regulatorios).
- Cuando los retrasos generan discusiones sin dato.
- Para priorizar: qué tablas tienen compromisos y cuáles no.

## 6. Cuándo no utilizarlo

- Para todas las tablas: un SLA sin consumidor que lo pida es solo papeleo.
- Sin poder medir el SLI.
- Con un SLA más estricto que el SLO interno.

## 7. Ejemplo sencillo

Las 22 entregas de octubre, con el SLO interno (antes de 07:45 en el 95 %) y el SLA (antes de 08:00 en el 90 %):

| Objetivo | Cumplimiento | Resultado |
|---|---|---|
| SLO interno | 86,4 % | no cumple |
| SLA | 90,9 % | cumple, sin consecuencia |

El SLO avisó antes de que el SLA se incumpliera.

## 8. Ejemplo de producción

- Un documento por SLA: dato, hora, porcentaje, período, consecuencia, contacto y excepciones (feriados, caídas del proveedor).
- El SLI se mide automáticamente (hora de publicación de la tabla).
- Un tablero mensual con SLO y SLA; una alerta cuando el SLO se acerca al límite.
- En Airflow 3.1 o posterior, una Deadline Alert sobre la corrida avisa en el momento en que se pasa el plazo (experimental en 3.3.2).

## 9. Arquitectura

```mermaid
flowchart LR
  E["Entrega diaria"] -- "hora real (SLI)" --> M["Medición"]
  M --> O{"SLO interno<br/>07:45 · 95 %"}
  M --> A{"SLA<br/>08:00 · 90 %"}
  O -- "no cumple" --> AV["Aviso al equipo"]
  A -- "no cumple" --> C["Consecuencia pactada"]
```

## 10. Código

```python
"""Un SLA de datos con su consecuencia y un SLO interno más estricto, medidos sobre las entregas de un mes."""
from datetime import time

# Hora de entrega del reporte diario a finanzas en los 22 días hábiles de octubre.
ENTREGAS = [time(7, 10)] * 17 + [time(7, 55), time(8, 20), time(7, 40), time(9, 5), time(7, 30)]
SLA_HORA, SLA_META = time(8, 0), 0.90       # acordado con finanzas, con consecuencia
SLA_CONSECUENCIA = "revisión con finanzas y plan de corrección"
SLO_HORA, SLO_META = time(7, 45), 0.95      # objetivo interno, más estricto que lo acordado


def cumplimiento(hora: time) -> float:
    return sum(e <= hora for e in ENTREGAS) / len(ENTREGAS)


slo, sla = cumplimiento(SLO_HORA), cumplimiento(SLA_HORA)
print(f"SLO interno (antes de 07:45 en el 95 %): {slo:.1%} -> {'cumple' if slo >= SLO_META else 'no cumple'}")
print(f"SLA (antes de 08:00 en el 90 %): {sla:.1%} -> {'cumple' if sla >= SLA_META else 'no cumple'}")
print(f"consecuencia: {SLA_CONSECUENCIA}" if sla < SLA_META else "sin consecuencia del SLA; el SLO avisó antes")
```

El script se **ejecuta en la CI** y pasa `mypy --strict`. Imprime `SLO interno (antes de 07:45 en el 95 %): 86.4% -> no cumple`, `SLA (antes de 08:00 en el 90 %): 90.9% -> cumple` y `sin consecuencia del SLA; el SLO avisó antes`.

## 11. GCP

En GCP, el **SLA de BigQuery** es un compromiso del proveedor. Según *Service Level Objectives* y *BigQuery Service Level Agreement (SLA)* (no ejecutado):

| | SLA de datos (este concepto) | SLA de BigQuery |
|---|---|---|
| Qué promete | Que tus datos lleguen a tiempo | Monthly Uptime Percentage del servicio (>= 99.99 %, o >= 99.9 % en la edición Standard); Data Transfer Service, un Data Delivery SLO de 24 h o menos para corridas programadas |
| Consecuencia | La que acuerdes | Financial Credits, el único remedio del cliente |
| Período | El que acuerdes | Mes calendario, por proyecto |

Que BigQuery cumpla su SLA no dice nada de si tu pipeline entregó a tiempo.

## 12. AWS

En AWS, el **SLA de Amazon S3**. Según *Service Level Objectives* y *Amazon S3 Service Level Agreement* (no ejecutado):

| | SLA de datos (este concepto) | SLA de Amazon S3 |
|---|---|---|
| Qué promete | Entrega o frescura de tus datos | Monthly Uptime Percentage del servicio en cada ciclo de facturación |
| Consecuencia | La que acuerdes | Service Credit, como porcentaje de lo pagado por la clase de almacenamiento afectada |

## 13. Azure

En Azure, los **SLA for Online Services**. Según *Service Level Objectives* y *Service Level Agreements (SLA) for Online Services* (no ejecutado):

| | SLA de datos (este concepto) | SLA de Microsoft |
|---|---|---|
| Qué promete | Entrega o frescura de tus datos | Disponibilidad y conectividad de los servicios en línea |
| Dónde está | En un acuerdo con tus consumidores | En documentos descargables, actuales y archivados, que cubren Azure, Dynamics 365, Office 365 e Intune |

## 14. Buenas prácticas

- Pocos SLA, solo donde un consumidor los necesita.
- Siempre con un SLO interno más estricto.
- Consecuencia y excepciones por escrito.
- **Seguridad:** el documento del SLA no debe incluir credenciales ni detalles de acceso.
- **Observabilidad:** el SLI se mide automáticamente; nunca a mano al cierre del mes.
- **Costo:** un SLA más estricto exige más redundancia y más guardias; acordar lo que se puede sostener.

## 15. Errores frecuentes

- Llamar SLA a un objetivo sin consecuencia.
- Prometer en el SLA lo mismo que el SLO interno: no queda margen.
- Confundir el SLA del proveedor con el de los datos.
- Buscar la función de SLA en Airflow 3: se quitó en 3.0.

## 16. Trade-offs

Un SLA da claridad a los consumidores y compromete al equipo. Más estricto exige más inversión en confiabilidad. Sin SLA, cada retraso se discute; con demasiados, el equipo vive cumpliendo acuerdos de bajo valor.

## 17. Conceptos relacionados

- `data-slo`: el objetivo interno.
- `data-freshness`: la frescura como SLI.
- `orchestration-observability`: plazos y callbacks en el orquestador.
- `data-contracts`: el nivel de servicio en el contrato.

## 18. Preguntas técnicas abiertas

1. ¿Qué consumidor tuyo necesita un SLA y cuál le basta con un SLO?
2. ¿Qué consecuencia tendría no cumplirlo?
3. ¿Tu SLO interno es más estricto que lo que prometiste?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Google, *Site Reliability Engineering*: *Service Level Objectives*.
- Apache Airflow 3.3.2: *Tasks* y *Deadline Alerts*.
- Google Cloud: *BigQuery Service Level Agreement (SLA)*.
- AWS: *Amazon S3 Service Level Agreement*.
- Microsoft: *Service Level Agreements (SLA) for Online Services*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-20. `review_required`: pendiente de revisión B-F3.1 del lote F3b-16b.

## 22. Historial de cambios importantes

- 2026-10-20: creación (lote F3b-16b).
