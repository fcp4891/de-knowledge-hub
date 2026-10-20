---
id: concept:alerting
slug: alerting
type: concept
title: Alertas
description: "Alertar por síntomas que afectan al consumidor (el SLO de frescura se consume rápido) y no por cada causa posible, con burn rate en dos ventanas para no disparar por un pico breve, y una sola alerta abierta por problema hasta que se resuelve. Ejemplo ejecutado en la CI. Alertas y estados en Cloud Monitoring, alarmas y alarmas compuestas de CloudWatch, y alertas stateful con action groups en Azure Monitor, con sus diferencias."
domain: observability
subdomain: reliability-operations
category: observability
classification: core
level: intermediate
importance: high
cloud: [agnostic]
technologies: [python, gcp-cloud-monitoring, aws-cloudwatch, azure-monitor]
tags: [observability, alerting, burn-rate, slo, on-call]
related_topics: [data-slo, incident-response]
sources:
  - source: gcp-cloud-monitoring-docs
    url: https://docs.cloud.google.com/stackdriver/docs/solutions/slo-monitoring/alerting-on-budget-burn-rate
    accessed: 2026-10-20
    page_title: "Alerting on your burn rate"
    note: "Alerting on your burn rate (Google Cloud Observability): el error budget de un período es (1 − meta del SLO) × eventos elegibles del período; el burn rate dice qué tan rápido se consume, depende de los eventos elegibles y de los eventos con error, y está normalizado: mayor que uno significa que, si la tasa de error se sostiene, el budget se agota antes de terminar el período. En una alerta, el período de lookback se usa también como período de cumplimiento para calcular el budget."
  - source: google-sre-book
    url: https://sre.google/sre-book/embracing-risk/
    accessed: 2026-10-20
    page_title: "Embracing Risk"
    note: "Embracing Risk (SRE book): el error budget se define a partir del SLO y da una medida objetiva de cuánta falta de confiabilidad se permite en un período (en el ejemplo del libro, un trimestre); la diferencia entre el SLO y lo medido es el budget que queda. Si el equipo necesita lanzar más rápido, puede aflojar el SLO y aumentar el budget; 100 % casi nunca es el objetivo correcto."
  - source: gcp-cloud-monitoring-docs
    url: https://docs.cloud.google.com/monitoring/alerts/incidents-events
    accessed: 2026-10-20
    page_title: "Alerts for metric-based alerting policies"
    note: "Alerts for metric-based alerting policies (Cloud Monitoring): cuando se cumplen las condiciones de una política, Monitoring abre una alerta, salvo si la política está pausada (snoozed) o deshabilitada, o se superan los límites. Estados: abierta; Acknowledged (abierta y marcada a mano como reconocida, normalmente porque se investiga); Closed (la condición dejó de cumplirse, alguien la cerró, o pasaron 7 días sin observar que siguiera)."
  - source: aws-cloudwatch-docs
    url: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Alarms.html
    accessed: 2026-10-20
    page_title: "Using Amazon CloudWatch alarms"
    note: "Using Amazon CloudWatch alarms: las alarmas vigilan métricas y envían notificaciones o hacen cambios cuando se cruza un umbral. Una alarma compuesta pasa a ALARM solo si se cumplen todas las condiciones de su regla, que puede incluir alarmas de métricas y otras compuestas; usarlas puede reducir el ruido de alarmas."
  - source: azure-monitor-docs
    url: https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-overview
    accessed: 2026-10-20
    page_title: "What are Azure Monitor alerts?"
    note: "What are Azure Monitor alerts?: las alertas avisan cuando los datos de Azure Monitor indican un posible problema; se puede alertar sobre cualquier métrica o fuente de logs de la plataforma. Una regla de alerta evalúa la condición y, si se cumple, dispara el action group asociado. Las alertas pueden ser stateless (disparan cada vez que se cumple la condición) o stateful (no vuelven a disparar hasta que la condición se resuelve); la respuesta del usuario puede ser New, Acknowledged o Closed."
  - source: azure-monitor-docs
    url: https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/action-groups
    accessed: 2026-10-20
    page_title: "Action groups"
    note: "Action groups (Azure Monitor): colecciones de preferencias de notificación y acciones automáticas que se adjuntan a las alertas; definen a quién se avisa y qué se hace cuando una alerta dispara. Notificaciones: llamada de voz, SMS, push y correo; acciones: webhook, Azure Function o un workflow de Logic Apps, entre otras."
relations:
  - type: RELATED_TO
    target: data-slo
    note: Alertar cuando el error budget se consume rápido.
  - type: RELATED_TO
    target: incident-response
    note: Una alerta abre la respuesta a un incidente.
  - type: RELATED_TO
    target: pipeline-health
    note: Un pipeline en rojo alerta.
  - type: RELATED_TO
    target: volume-anomalies
    note: Otra señal sobre la que se alerta.
created_at: 2026-10-20
updated_at: 2026-10-20
last_verified: 2026-10-20
verification_status: review_required
---

## 1. Resumen

Una **alerta** pide la atención de una persona. Por eso conviene que avise de **síntomas que afectan al consumidor**, no de cada causa posible: «la tabla `pedidos` está consumiendo su error budget de frescura diez veces más rápido de lo permitido» y no «la CPU del worker pasó el 80 %».

Tres reglas de diseño:

- **por síntoma**, ligado a un SLO (`data-slo`), con **burn rate** (*Alerting on your burn rate*);
- **dos ventanas**, una corta y una larga, para que un pico breve no dispare;
- **una alerta abierta por problema**, que no vuelve a disparar hasta que se resuelve (las alertas stateful de Azure Monitor funcionan así, *What are Azure Monitor alerts?*).

## 2. Qué es

- **Regla de alerta:** condición sobre una métrica o un log.
- **Síntoma:** lo que ve el consumidor (atraso, datos faltantes).
- **Burn rate:** velocidad de consumo del error budget; 1 es el ritmo que lo agota justo al final del período.
- **Estados:** abierta, reconocida (acknowledged), cerrada.
- **Destino:** quién recibe la alerta y por qué canal (en Azure, action groups).

## 3. Problema que resuelve

Un equipo recibe 200 alertas por semana: CPU, memoria, reintentos, cada tarea fallida. Las silencia todas, y el día que la tabla de finanzas se atrasa cuatro horas nadie se entera. Con alertas por síntoma y burn rate, recibe pocas alertas y cada una significa que un consumidor está afectado.

## 4. Cómo funciona

1. Cada pocos minutos se calcula el burn rate en dos ventanas (aquí, 5 y 60 minutos).
2. Si las dos superan el umbral y no hay una alerta abierta, se abre una.
3. Mientras está abierta, no se abren otras por el mismo problema.
4. Cuando el síntoma desaparece en la ventana corta, se cierra.
5. La alerta abre la respuesta a un incidente (`incident-response`).

El umbral (aquí, 10) y las ventanas son decisiones del equipo según su SLO.

## 5. Cuándo utilizarlo

- Para síntomas con un SLO detrás.
- Para fallas que requieren acción humana pronto.
- Con un destino claro (la guardia, un canal).

## 6. Cuándo no utilizarlo

- Para causas que no afectan al consumidor: van a un tablero.
- Para información que nadie va a actuar: va a un reporte.
- Con una sola ventana corta: alerta por cualquier pico.

## 7. Ejemplo sencillo

Ocho horas de mediciones por minuto, con un pico de 6 minutos (min 100) y un problema sostenido de 90 minutos (min 300):

| Minuto | Evento |
|---|---|
| 100–106 | Pico: burn rate alto en 5 min, bajo en 60 min → no alerta |
| 310 | ABRE alerta (burn 5 min 100, 60 min 17) |
| 395 | Cierra alerta |

Una sola alerta en total.

## 8. Ejemplo de producción

- Un SLO de frescura por tabla crítica.
- Dos reglas por SLO: burn rate alto en ventanas cortas (urgente, a la guardia) y moderado en ventanas largas (a un canal, para el día siguiente).
- Alertas stateful: una por problema, con su estado.
- Cada alerta trae enlace al tablero, a los logs de la corrida y al runbook.

## 9. Arquitectura

```mermaid
flowchart LR
  M["Mediciones del SLI"] --> B5["Burn rate 5 min"]
  M --> B60["Burn rate 60 min"]
  B5 --> C{"ambas > umbral<br/>y sin alerta abierta?"}
  B60 --> C
  C -- "sí" --> A["Abrir alerta → guardia"]
  A -- "síntoma desaparece" --> X["Cerrar"]
```

## 10. Código

```python
"""Alertar por síntoma con burn rate en dos ventanas, y no abrir una alerta nueva mientras la anterior sigue abierta."""
SLO = 0.99
# Por minuto: 1 si la tabla estaba atrasada en ese minuto. Un pico de 6 minutos y un problema sostenido de 90.
MALOS = set(range(100, 106)) | set(range(300, 390))
UMBRAL = 10.0   # burn rate a partir del cual se alerta (decisión del equipo)


def burn(fin: int, ventana: int) -> float:
    errores = sum(fin - ventana <= m < fin for m in MALOS)
    return (errores / ventana) / (1 - SLO)


abierta, eventos = False, []
for minuto in range(0, 480, 5):                           # se evalúa cada 5 minutos
    corta, larga = burn(minuto, 5), burn(minuto, 60)
    if not abierta and corta > UMBRAL and larga > UMBRAL:  # las dos ventanas: un pico breve no alcanza
        abierta = True
        eventos.append(f"min {minuto}: ABRE alerta (burn 5 min {corta:.0f}, 60 min {larga:.0f})")
    elif abierta and corta == 0:                           # se cierra cuando el síntoma desaparece
        abierta = False
        eventos.append(f"min {minuto}: cierra alerta")
print("\n".join(eventos))
print(f"alertas abiertas en total: {sum('ABRE' in e for e in eventos)}")
```

El script se **ejecuta en la CI** y pasa `mypy --strict`. Imprime `min 310: ABRE alerta (burn 5 min 100, 60 min 17)`, `min 395: cierra alerta` y `alertas abiertas en total: 1`: el pico del minuto 100 no alerta porque la ventana de 60 minutos no supera el umbral.

## 11. GCP

En GCP, **Cloud Monitoring**. Según *Alerting on your burn rate* y *Alerts for metric-based alerting policies* (no ejecutado):

| | Alerta por burn rate (este concepto) | Cloud Monitoring |
|---|---|---|
| Burn rate | Calculado en dos ventanas | Políticas sobre el burn rate de un SLO; el lookback es también el período de cumplimiento |
| Estados | Abierta y cerrada | Abierta, Acknowledged y Closed (también se cierra sola a los 7 días sin observar la condición) |

## 12. AWS

En AWS, **CloudWatch alarms**. Según *Alerting on your burn rate* y *Using Amazon CloudWatch alarms* (no ejecutado):

| | Dos ventanas (este concepto) | CloudWatch |
|---|---|---|
| Combinar condiciones | Las dos ventanas deben superar el umbral | Alarma compuesta: pasa a ALARM solo si se cumplen todas las condiciones de su regla |
| Ruido | Evita alertar por picos breves | La página dice que las alarmas compuestas pueden reducir el ruido |

## 13. Azure

En Azure, **Azure Monitor alerts**. Según *What are Azure Monitor alerts?* y *Action groups* (no ejecutado):

| | Una alerta por problema (este concepto) | Azure Monitor |
|---|---|---|
| Repetición | No se abre otra mientras está abierta | Alertas stateful: no vuelven a disparar hasta que la condición se resuelve; las stateless disparan cada vez |
| A quién avisar | Destino configurado | Action groups: voz, SMS, push, correo, y acciones como webhook, Azure Function o Logic Apps |
| Respuesta | Reconocer y cerrar | New, Acknowledged o Closed |

## 14. Buenas prácticas

- Alertar por síntomas ligados a un SLO.
- Dos ventanas para las alertas urgentes.
- Cada alerta con dueño, canal y runbook.
- Revisar cada mes las alertas que nadie actuó.
- **Seguridad:** las alertas no deben llevar datos sensibles en el texto; enlazan a donde están protegidos.
- **Observabilidad:** guardar cuándo se abrió, reconoció y cerró cada alerta.
- **Costo:** cada alerta interrumpe a una persona; menos alertas y más precisas cuestan menos que muchas ignoradas.

## 15. Errores frecuentes

- Alertar por causas (CPU, memoria) que no afectan al consumidor.
- Una alerta por cada tarea fallida.
- Alertas sin dueño.
- Un umbral copiado sin relación con el SLO.

## 16. Trade-offs

Umbrales sensibles detectan antes y despiertan más gente por nada. Ventanas largas reducen el ruido y avisan más tarde. Pocas alertas por síntoma pueden dejar pasar causas que más tarde darán síntomas; un tablero de causas complementa.

## 17. Conceptos relacionados

- `data-slo`: el SLO y su budget.
- `incident-response`: qué pasa después de la alerta.
- `pipeline-health`: salud de pipelines.
- `volume-anomalies`: otra señal.

## 18. Preguntas técnicas abiertas

1. ¿Cuántas alertas recibió tu equipo la semana pasada y cuántas requirieron acción?
2. ¿Cuáles de tus alertas son síntomas y cuáles causas?
3. ¿Cada alerta tiene un runbook?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Google Cloud: *Alerting on your burn rate* y *Alerts for metric-based alerting policies*.
- Google, *Site Reliability Engineering*: *Embracing Risk*.
- AWS: *Using Amazon CloudWatch alarms*.
- Microsoft Learn: *What are Azure Monitor alerts?* y *Action groups*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-20. `review_required`: pendiente de revisión B-F3.1 del lote F3b-16b.

## 22. Historial de cambios importantes

- 2026-10-20: creación (lote F3b-16b).
