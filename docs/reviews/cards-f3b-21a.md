# Revisión B-F3.1 · lote F3b-21a

Rama `b/f3b-review-21a`, creada desde `origin/main` (`f528b88`). Fichas: `llm-fundamentals`, `tokens`, `context-windows`, `embeddings`, `structured-outputs`, `tool-calling` y `prompt-engineering`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| En `llm-fundamentals`, la nota y el §11 dicen que «Vertex AI» pasa a «Agent Platform». La página *Gemini Enterprise Agent Platform name changes* (Last updated 2026-10-22 UTC) dice que algunos productos «have been renamed» y la tabla abre con «Vertex AI Platform» → «Gemini Enterprise Agent Platform». No hay una fila «Vertex AI» → «Agent Platform». «Vertex AI Model Garden» → «Gemini Enterprise Agent Platform Model Garden» sí está. | media | Dejar solo las filas de la tabla. El cambio está formulado como hecho («have been renamed»). |
| Sin otros hallazgos. Long context es «1-million-token» de serie. Nova Pro es 300K de contexto y 10K de salida. Los límites de embeddings coinciden con sus páginas. La opción A dice que sus vectores son léxicos y no miden calidad semántica. Los enlaces a fichas de 19 no afirman nada legal. | ninguna | — |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 606 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Los avisos son de Spark.

## Comprobaciones

```
llm-fundamentals rel_miss=[] legal=False sec14=True
tokens rel_miss=[] legal=False sec14=True
context-windows rel_miss=[] legal=False sec14=True
embeddings rel_miss=[] legal=False sec14=True
structured-outputs rel_miss=[] legal=False sec14=True
tool-calling rel_miss=[] legal=False sec14=True
prompt-engineering rel_miss=[] legal=False sec14=True
```

`legal=False`: el cuerpo no nombra la Ley 19.628, un artículo ni «Obligación legal». `llm-fundamentals` y `embeddings` enlazan `processors-and-international-transfers` y `chilean-identifier-pseudonymization` como flujo técnico (proveedor externo, seudonimizar antes de indexar).

H1 de las páginas, el 2026-10-25. En Google se descarta el sufijo de colecciones. Las fuentes dicen `accessed: 2026-10-25`.

- «Long context»: «Gemini comes standard with a 1-million-token context window.»
- «Nova Pro»: «Context window: 300K tokens Max output tokens: 10K».
- «Get text embeddings»: «250 input texts», «20,000» tokens, «2048 tokens» por texto, «3072» y «768».
- «Amazon Titan Text Embeddings models»: «8,192 tokens or 50,000 characters», «1,024 (default), 512, 256».
- «Generate embeddings with Azure OpenAI»: «8,192 tokens», arreglo de «2,048», agregado de «300,000».
- «Gemini Enterprise Agent Platform name changes», Last updated 2026-10-22 UTC: «have been renamed».
- «What is Microsoft Foundry?»: «Azure AI Studio / Azure AI Foundry» → «Microsoft Foundry»; «Azure AI Services» → «Foundry Tools»; «Foundry (classic) portal» para los proyectos hub, y las inversiones nuevas van al portal nuevo.

Diagramas: 5, 4, 5, 5, 4, 4 y 4 nodos. Ninguno pasa de 8.

`tests/test_ai_snippets.py` exige, entre otras, `estimado local: 41 tokens; CountTokens (respuesta fija): 47 tokens`, `ventana 300000 con 10000 de salida reservados: cabe`, `temperatura 0.2: pedidos=0.92`, `dimensiones: 256` y el orden léxico, `dimensiones: 384` en la opción B, `intento aceptado: {'tabla': 'silver.pedidos', 'severidad': 'alta', 'filas_afectadas': 1200}`, `stopReason: tool_use` y `plantilla v8fce0a2acc01`. Esas cifras están en el párrafo de cada ficha. Bedrock usa `Stubber` y un cliente sin firma. La opción B usa fastembed y, si la descarga falla, el test queda «no ejecutado».

## Por ficha

### `llm-fundamentals`

| Punto | Resultado |
|---|---|
| «Vertex AI» → «Agent Platform» | Media. No está en la tabla |
| «Vertex AI Platform» → «Gemini Enterprise Agent Platform» y Model Garden | Están en la tabla. El cambio ya ocurrió |
| Foundry, Foundry Tools y Foundry (classic) | Coinciden con *What is Microsoft Foundry?* |
| Código | Temperatura 0.2 → 0.92 y la lista de cinco corridas coinciden con el test |
| Enlace a 19 | Técnico. Sin afirmación legal |

### `tokens`

| Punto | Resultado |
|---|---|
| CountTokens y el Stubber | El 47 es respuesta fija. El test exige `47 tokens` y `ParamValidationError` |
| Ventana de 300 000 y 10 000 | Es el ejemplo, y coincide con la ficha de Nova Pro (300K / 10K) |
| §14 y diagrama | Seguridad, observabilidad y costo. 4 nodos |

### `context-windows`

| Punto | Resultado |
|---|---|
| 1 millón de tokens | «1-million-token context window», de serie |
| Nova Pro 300K / 10K | La ficha del modelo lo dice así |
| Código | `12 de 12`, `190 tokens`, `4 de 12`, `74 tokens` y el error de la ventana de 30 están en el test |

### `embeddings`

| Punto | Resultado |
|---|---|
| Límites de Agent Platform, Titan V2 y Azure OpenAI | 250 / 20 000 / 2048, 8192 o 50 000 y 1024 (512 o 256), 2048 entradas y 300 000 tokens. Las páginas lo dicen |
| Opción A | El comentario dice que son vectores léxicos y que no miden la calidad semántica |
| Opción B | fastembed, revisión `faf4aa42`, `dimensiones: 384` |
| Enlace a 19 | Seudonimizar antes de indexar. Sin artículo |

### `structured-outputs`

| Punto | Resultado |
|---|---|
| Código | El test exige el rechazo de `filas_afectadas` y `severidad`, y el intento aceptado con 1200 |
| §14 y diagrama | Presentes. 4 nodos |

### `tool-calling`

| Punto | Resultado |
|---|---|
| Código | Stubber. El test exige `stopReason: tool_use`, `filas: 0` y el error de la herramienta no declarada |
| §14 y diagrama | Presentes. 4 nodos |

### `prompt-engineering`

| Punto | Resultado |
|---|---|
| Código | `v8fce0a2acc01`, 5 de desarrollo y 3 de prueba. El test comprueba que el ejemplo de prueba no entra al prompt |
| §14 y diagrama | Presentes. 4 nodos |
