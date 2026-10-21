# Revisión B-F3.1 · lote F3b-16b

Rama `b/f3b-review-16b`, creada desde `origin/main` (`37b88d0`). El pedido está en `docs/status/lane-a.md`. Fichas: `pipeline-health`, `data-sla`, `data-slo`, `alerting`, `incident-response` y `root-cause-analysis`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Sin hallazgos. Airflow 3.3.2 dice que el SLA se quitó en 3.0 y lo reemplazan las Deadline Alerts en 3.1. La aritmética del SLO cierra. Incident Manager está citado como cerrado a clientes nuevos. El `page_title` de Microsoft es el encabezado del documento. Los bullets de costo no afirman un cobro. El libro de SRE no respalda productos. `pipeline-health` cita el renombre de Composer en curso; las fichas que lo dan por hecho están en `docs/reviews/cards-f3b-16a.md`. | ninguna | — |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 533 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Los avisos son de 14b.

## Comprobaciones

```
== pipeline-health dups [] missing17 [] sec14 True titles 5 sources 5 empty 0
== data-sla dups [] missing17 [] sec14 True titles 6 sources 6 empty 0
== data-slo dups [] missing17 [] sec14 True titles 6 sources 6 empty 0
== alerting dups [] missing17 [] sec14 True titles 6 sources 6 empty 0
== incident-response dups [] missing17 [] sec14 True titles 4 sources 4 empty 0
== root-cause-analysis dups [] missing17 [] sec14 True titles 6 sources 6 empty 0
```

`tests/test_observability_snippets.py` exige las frases de las fichas:

```
"ventas_diarias: amarillo (última corrida 98 min vs mediana 30)"
"clientes: rojo (éxito 43%; sin éxito hace 79 h)"
"inventario: verde"
"SLO interno (antes de 07:45 en el 95 %): 86.4% -> no cumple"
"SLA (antes de 08:00 en el 90 %): 90.9% -> cumple"
"sin consecuencia del SLA; el SLO avisó antes"
"SLI: 0.9931 (SLO 0.99) -> cumple"
"error budget: 7.2 horas malas permitidas; consumidas 5; quedan 2.2"
"burn rate 30 días: 0.69"
"burn rate últimas 24 h: 8.33"
"min 310: ABRE alerta (burn 5 min 100, 60 min 17)"
"min 395: cierra alerta"
"alertas abiertas en total: 1"
"severidad: SEV2"
"tiempo hasta detectar: 35 min"
"consumidores avisados antes de mitigar: True"
"errores: 3 en etapas {'transform': 1, 'load': 1, 'publish': 1}"
"primer error: transform a las 06:02: monto sin decimales: margen 0"
```

*Tasks* de Airflow 3.3.2: «The SLA feature from Airflow 2 has been removed in 3.0 and was replaced in Airflow 3.1 with Deadlines Alerts». El texto del enlace lleva una ese de más. La página de destino, también en 3.3.2, se titula *Deadline Alerts* y avisa: «Deadline Alerts are new in Airflow 3.1 and should be considered experimental». La ficha usa ese título y dice que en 3.3.2 siguen experimentales.

Aritmética de `data-slo`, a mano. 30 × 24 = 720 horas. Horas malas: 3 el día 12 y 2 en las últimas 24 h, en total 5. SLI = 1 − 5/720 = 0,993055…, que con cuatro decimales es 0,9931. Budget = 0,01 × 720 = 7,2. Quedan 7,2 − 5 = 2,2. Burn de 30 días = (5/720) / 0,01 = 0,6944…, que con dos decimales es 0,69. Burn de 24 h = (2/24) / 0,01 = 8,333…, que es 8,33.

*What Is AWS Systems Manager Incident Manager?*: «AWS Systems Manager Incident Manager is no longer open to new customers. Existing customers can continue to use the service as normal.» La ficha lo dice en la nota y en la tabla del §12.

La página de Microsoft tiene dos `h1`. El primero es el del sitio, «Licensing Resources and Documents». El del documento es «Service Level Agreements (SLA) for Online Services», y ese es el `page_title`. El texto de la página coincide con la nota: compromisos de disponibilidad y conectividad, ediciones actuales y archivadas, Azure, Dynamics 365, Office 365 e Intune.

Los bullets de costo no nombran un precio ni un cobro de un servicio:

```
pipeline-health: leer el historial cada hora es barato; consultar cada tarea de cada corrida, no.
data-sla: un SLA más estricto exige más redundancia y más guardias; acordar lo que se puede sostener.
data-slo: cada nueve adicional cuesta más redundancia y más guardias; elegir el SLO por lo que necesita el consumidor.
alerting: cada alerta interrumpe a una persona; menos alertas y más precisas cuestan menos que muchas ignoradas.
incident-response: cada hora de incidente cuesta tiempo de varias personas; la mitigación rápida lo reduce.
root-cause-analysis: retener logs el tiempo suficiente para investigar; menos retención ahorra y puede dejar sin datos el análisis.
```

Las notas de `google-sre-book` definen SLI, SLO, SLA, error budget y postmortem. No nombran BigQuery, S3, CloudWatch, Azure ni Composer. Monthly Uptime Percentage, Financial Credits, Service Credit, el error budget de Cloud Monitoring y los burn rates de CloudWatch están en las notas de cada producto. El libro acompaña la columna del concepto.

`pipeline-health` dice que la página de Composer trae «is evolving to become». Esa frase sigue en *Managed Airflow overview*, consultada el 2026-10-20.

Los `page_title` coinciden con el `h1` del artículo. En las páginas de Google, el aviso de collections va en el mismo `h1` y no entra en el título. En el libro de SRE, el primer `h1` es el del capítulo.

## Fichas que ya existían

`git diff --diff-filter=M --name-only b19e8d1^..4a8f7ad -- content/concepts` no lista ninguna ficha modificada. El lote solo agrega las seis nuevas. `python-logging` se enlazó en el lote 16a.
