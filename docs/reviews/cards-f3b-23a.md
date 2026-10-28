# Revisión · lote 23a

Rama `b/review-23a`, creada desde `b6eb31d`. Seis fichas `emerging`: `model-context-protocol`, `data-agents`, `agentic-workflows`, `agentic-data-engineering`, `llm-driven-automation` y `ai-assisted-development`. No se editó `content/` ni `frontend/`. Estado: pendiente de la aprobación de Felipe.

El foco pedido: que cada estado de madurez y cada renombre esté citado tal cual, y que ninguna ficha presente a los agentes como reemplazo de la orquestación, la revisión o la CI.

## Común

Las seis fichas dicen que el patrón **no reemplaza** la orquestación, el modelado, el ciclo de desarrollo, la automatización determinista o la revisión y la CI. Las seis tienen `## 11.`, `## 12.` y `## 13.` separados. Los diagramas son `LR` y la cadena más larga tiene 5 nodos o menos. `ai-pipeline-generation`, `natural-language-catalog-interfaces` y `dataplex-governance` nombran en el §17 la ficha nueva y la tienen en `relations`.

No hay una fecha de fin de soporte de Amazon Q Developer en las seis fichas. La página *Using Amazon Q Developer on the command line* tampoco la trae.

`scripts/validate.py` sobre este mismo `b6eb31d` (corrida de la revisión P1, sin cambios de contenido):

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 662 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

Las release notes de los servidores MCP de Google Cloud no se reabrieron en esta pasada.

## Por ficha

### `model-context-protocol`

**Hallazgo.** Sin hallazgo en las páginas reabiertas. La versión vigente, el silencio de AWS sobre preview y la ausencia de estado en Azure están citados tal cual.

**Severidad.** ninguna

**Evidencia.** *Versioning*, https://modelcontextprotocol.io/docs/2026-07-28/learn/versioning : «The current protocol version is 2026-07-28.» El §1 lo cita así.

*AWS MCP Server*, https://docs.aws.amazon.com/agent-toolkit/latest/userguide/mcp-server.html : el texto no marca el servidor como preview. El §12 dice «La página actual no lo marca como preview».

*What Is the Azure MCP Server?*, https://learn.microsoft.com/en-us/azure/developer/azure-mcp-server/overview : no declara GA ni preview. Dice «The local MCP server is intended strictly for developer use within your organization.» El §13 dice que la página no declara un estado de madurez y que el servidor local es solo para desarrollo dentro de la organización.

**Corrección.** Ninguna.

### `data-agents`

**Hallazgo.** El `page_title` de Fabric no es el título de la página. La frase de GA sí está.

**Severidad.** baja

**Evidencia.** https://learn.microsoft.com/en-us/fabric/data-science/concept-data-agent titula «Fabric data agent creation». La ficha usa «Fabric data agent concepts». El cuerpo de esa página dice «Data agent in Microsoft Fabric is a generally available feature» y «These features are currently in preview» para los controles de Purview. El §1 y el §13 citan esas dos frases.

*Conversational Analytics API release notes*, https://docs.cloud.google.com/gemini/data-agents/conversational-analytics-api/release-notes , entrada del 23 de junio de 2026: «The Conversational Analytics API is generally available (GA) for BigQuery and Looker.» El §12 lo cita con esa fecha.

**Corrección.** Cambiar el `page_title` a «Fabric data agent creation».

### `agentic-workflows`

**Hallazgo.** Sin hallazgo. El estado «superseded» está citado con la frase de la página, y el §1 dice que no reemplaza la orquestación determinista.

**Severidad.** ninguna

**Evidencia.** *Template agent workflows*, https://adk.dev/agents/workflow-agents/ : «Starting in ADK 2.0 for Python and Go, template workflows have been superseded by more flexible workflow structures, including graph-based workflows and dynamic workflows.» La nota de la fuente trae la frase completa. El diagrama es `LR` con cadena de 4 nodos (T–A–L–H).

**Corrección.** Ninguna.

### `agentic-data-engineering`

**Hallazgo.** Sin hallazgo. El preview de Project Osmos está citado tal cual, junto con que no es para producción.

**Severidad.** ninguna

**Evidencia.** *What is Fabric data engineering agent (Project Osmos)? (preview)*, https://learn.microsoft.com/en-us/fabric/data-engineering/data-engineering-agent-overview : «The Data engineering agent (Project Osmos) is in preview. Preview features are released with limited capabilities and are subject to separate supplemental preview terms. They're not intended for production use». El `page_title` coincide con ese título. El §13 y el §4 usan el preview y el «no para producción». El §1 dice que no reemplaza el ciclo de desarrollo.

**Corrección.** Ninguna.

### `llm-driven-automation`

**Hallazgo.** Sin hallazgo en el criterio de esta revisión. El §1 dice que no reemplaza la automatización determinista y que la usa después de una puerta de evaluación.

**Severidad.** ninguna

**Evidencia.** El §1 (línea 61): «no reemplaza la automatización determinista: la usa.» Las confirmaciones de ADK, Bedrock y Logic Apps quedan marcadas «no ejecutado». Esas tres páginas no se reabrieron en esta pasada.

**Corrección.** Ninguna.

### `ai-assisted-development`

**Hallazgo.** Sin hallazgo. Los dos renombres de Kiro están citados tal cual y no hay una fecha de fin de soporte.

**Severidad.** ninguna

**Evidencia.** *Using Amazon Q Developer on the command line*, https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line.html : «The Q CLI has become the Kiro CLI.» El título de la página sigue siendo «Using Amazon Q Developer on the command line». No trae una fecha de fin de soporte.

*Upgrade to Kiro*, https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/upgrade-to-kiro.html : «The Amazon Q Developer CLI has been rebranded to Kiro.» Y: «The Kiro console is a rebrand of the Amazon Q Developer console, with all the same functionality.» El §12 cita las dos frases. El §1 dice que no reemplaza la revisión ni la CI.

**Corrección.** Ninguna.
