# Revisión B-F3.1 · lote F3b-21c

Rama `b/f3b-review-21c`, creada desde `9e1524d`. Fichas: `llm-evaluation`, `llm-observability`, `guardrails`, `llm-agents` y `multi-agent-systems`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| En `llm-evaluation`, el §2 dice que una rúbrica es «aprobado o reprobado», adaptativa o estática. *Gen AI evaluation service overview* (Last updated 2026-10-22 UTC) reserva el aprobado o reprobado para las adaptativas. Las estáticas usan un puntaje numérico, y la página pone como ejemplo 1 a 5. | media | Dejar el aprobado o reprobado en las adaptativas. Decir que las estáticas puntúan con una escala numérica. |
| Sin otros hallazgos. El renombre a Evals está formulado como hecho. `llm-agents` y `multi-agent-systems` dicen cuándo no conviene usarlos. Las cifras del ejemplo multi-agente están marcadas como supuestos. | ninguna | — |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 613 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Los avisos son de Spark.

## Comprobaciones

```
llm-evaluation miss=[] extra_topics=[] not17=[] legal=False sec14=True cajas=6
llm-observability miss=[] extra_topics=[] not17=[] legal=False sec14=True cajas=5
guardrails miss=[] extra_topics=[] not17=[] legal=False sec14=True cajas=4
llm-agents miss=[] extra_topics=[] not17=[] legal=False sec14=True cajas=5
multi-agent-systems miss=[] extra_topics=[] not17=[] legal=False sec14=True cajas=6
```

Ese conteo mira corchetes. Con los rombos, los diagramas tienen 7, 6, 6, 7 y 7 nodos. Ninguno pasa de 8. `legal=False`: el cuerpo no nombra la Ley 19.628, un artículo ni «Obligación legal». `llm-agents` enlaza `dpia-and-automated-decisions` como decisión sobre personas, sin afirmar una obligación.

H1 comprobados el 2026-10-26. Las fuentes dicen `accessed: 2026-10-26`.

- «Gen AI evaluation service overview»: el título se conserva. «Adaptive rubrics» son «pass or fail». «Static rubrics» son «numerical scoring-based» y «a single numerical score (such as 1-5)».
- «Gemini Enterprise Agent Platform name changes»: «have been renamed». La fila es «Gen AI evaluation service on Vertex AI» → «Gemini Enterprise Agent Platform Evals».
- «Semantic conventions for generative client AI spans», commit `0b9555d`: **Status** Development. El nombre del span de inferencia es `{gen_ai.operation.name} {gen_ai.request.model}`.
- «Semantic conventions for generative AI client inference»: `gen_ai.input.messages` y `gen_ai.output.messages` son Opt-In, y la nota dice que es probable que contengan datos personales.
- «Remove PII from conversations by using sensitive information filters»: el filtro evalúa solo texto y, con tool use, no evalúa los argumentos de la herramienta ni los resultados que la aplicación devuelve.
- «AI agent orchestration patterns», H1 exacto: «Before you adopt a multiagent orchestration pattern, evaluate whether your scenario requires one.» Cada nivel agrega «coordination overhead, latency, and cost». «Use the lowest level of complexity that reliably meets your requirements.» Llamada directa si el prompt resuelve la tarea. Un agente con herramientas es «Often the right default» y pide «iteration limits».
- «Agent evaluators», H1 exacto: Task Adherence e Intent Resolution están en preview y son Pass/Fail. Tool Call Accuracy es 1 a 5 convertido a Pass/Fail con umbral.

`git diff --stat 60dd778 025006e` de las cuatro fichas enlazadas:

```
 content/concepts/prompt-engineering.md | 6 +++++-
 content/concepts/rag.md                | 9 +++++++--
 content/concepts/reranking.md          | 7 ++++++-
 content/concepts/tool-calling.md       | 8 ++++++--
 4 files changed, 24 insertions(+), 6 deletions(-)
```

Cada diff agrega la relación, nombra la ficha en el §17 y deja una línea de historial del 2026-10-26. Donde el texto decía «pendiente de ficha», ahora nombra la ficha. En `rag`, `rag-over-technical-docs` sigue pendiente.

`tests/test_ai_systems_snippets.py` exige `v1: {'recall@3': 1.0, 'mrr': 0.875, 'acierto': 1.0, 'citas_correctas': 1.0}`, el bloqueo de v2, los spans `tokens=52+11` con `PII en el span=False`, las seis decisiones de guardrails, `corte: 4 pasos sin respuesta final` y las tres líneas de llamadas del multi-agente. Esas cifras están en el párrafo o en la tabla de cada ficha.

## Por ficha

### `llm-evaluation`

| Punto | Resultado |
|---|---|
| Rúbrica estática como aprobado o reprobado | Media. La página la describe con puntaje numérico |
| Título y renombre a Evals | El H1 sigue siendo «Gen AI evaluation service overview». El cambio de nombre está formulado como hecho |
| Código | recall@3 1.0, MRR 0.875 y la puerta que bloquea v2 coinciden con el test. El juez queda «no ejecutado» |

### `llm-observability`

| Punto | Resultado |
|---|---|
| Estado Development | El commit `0b9555d` lo dice en el encabezado |
| Contenido opt-in | La página advierte datos personales. El ejemplo no los pone en el span |
| Código | `tokens=52+11` y el texto enmascarado coinciden con el test |
| Enlace a 19 | Técnico. Sin afirmación legal |

### `guardrails`

| Punto | Resultado |
|---|---|
| Filtro de PII de Bedrock | Solo texto. No evalúa argumentos ni resultados de herramientas |
| Código | Las seis decisiones del test están en el párrafo. El servicio con modelos queda «no ejecutado» |

### `llm-agents`

| Punto | Resultado |
|---|---|
| Clasificación | `emerging`. El §1 dice que no reemplaza un pipeline determinista |
| Cuándo no | Pasos conocidos, escritura sin aprobación, decisiones sobre personas y una sola llamada que ya resuelve |
| Límites | Máximo de pasos. La guía de Azure pide límites de iteración contra los ciclos |
| Código | Termina en el paso 3, pausa en el 2 y corta a los 4 |

### `multi-agent-systems`

| Punto | Resultado |
|---|---|
| Clasificación | `emerging`. No se presenta como reemplazo de un pipeline |
| Cuándo no | Clasificar, resumir o extraer; un solo dominio; pasos conocidos; sin evaluación; por moda. Coincide con los tres niveles de la guía |
| Cifras | El §7 y el código dicen que las llamadas y los segundos son supuestos del ejemplo |
| Código | 1 llamada, 3 llamadas y 6 llamadas, con ~2 s por llamada |
