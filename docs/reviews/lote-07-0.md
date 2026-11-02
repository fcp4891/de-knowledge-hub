# Revisión · lote 07-0

Rama `b/review-07-0`, creada desde `cd76503`. ADR-028, validador, compilador, contrato y el título de `gcp-biglake`. No se editó `content/` ni `frontend/`. Estado: pendiente de la aprobación de Felipe.

## Común

`scripts/validate.py` terminó así:

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 686 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

Los tres avisos son los de Spark ya conocidos. El validador no avisó de diagramas.

Claves de arquitectura, leídas de `ARCHITECTURE_SECTION_KEYS`:

```
architecture keys 22 concept keys 22 equal_len True
keys: summary, scenario, context_view, components, data_view, deployment_view, security, operations, costs, code, gcp, aws, azure, risks, common_mistakes, trade_offs, related_concepts, evolution, related_lab, sources, last_verified, change_history
```

El orden es el de la plantilla de 22 secciones. `COMPILER_VERSION` sigue en `"7"`. No hay migración `0008`. `SEARCHABLE_TYPES` incluye `architecture`. `insert_typed` escribe `concept_pages` solo cuando el tipo es `concept`. `tests/test_generators.py` copia `content/architectures` antes de validar el paquete generado.

`Section.number` llega a 22. El enum de `Section.key` conserva las claves de concepto y suma `scenario`, `context_view`, `components`, `data_view`, `deployment_view`, `security`, `operations`, `costs`, `risks` y `evolution`.

El test de la vista inflada espera el error `[§5] la vista de datos tiene 9 nodos contando los subgraph; máximo 8` (7 nodos internos y 2 subgraph). El de la vista ausente espera `[§5] la vista de datos necesita un diagrama Mermaid (ADR-028)`.

## ADR-028 y la plantilla

**Hallazgo:** ninguna.

**Severidad:** ninguna.

La decisión deja las arquitecturas en `/concepts` con `kind: architecture`, tres vistas (§3, §5, §6) de 8 nodos como máximo y cada subgraph contado como nodo. La plantilla numera las 22 secciones en el mismo orden que `ARCHITECTURE_SECTION_KEYS`. El §14 de prácticas sigue limitado a concept y pattern.

## Validador

**Hallazgo:** `architecture_views` exige el diagrama y el tope de nodos. No compara las etiquetas con la primera columna del §4. El aviso general de diagramas sigue diciendo «dividir o agrupar» y cuenta con `diagram_size`, que no suma los subgraph. En las tres vistas, un subgraph suma un nodo y pasar de 8 es error.

**Severidad:** baja.

**Evidencia:** `architecture_views` recorre `VIEW_SECTIONS` (3 contexto, 5 datos, 6 despliegue), pide al menos un bloque Mermaid y compara `view_nodes` con `MAX_NODES`. `check_diagrams` avisa con el texto «dividir o agrupar» si `diagram_size` supera 8 nodos o 10 aristas. El comentario de la plantilla, en el §4, dice «Los nombres son los de las tres vistas.»

**Corrección:** dejar escrito en el ADR que la igualdad de nombres la revisa una persona, o hacer que el validador compare las etiquetas de las tres vistas con la primera columna del §4. En el aviso general, no invitar a agrupar con un subgraph cuando ese subgraph cuenta como nodo en las vistas de arquitectura.

## Compilador

**Hallazgo:** ninguna.

**Severidad:** ninguna.

`cd76503` incluye `content/architectures` en el paquete que vuelve a validar `test_generated_bundle_validates`. Las arquitecturas entran como entidades buscables. No tienen fila en `concept_pages`, igual que los patterns, y el ADR descarta una tabla propia y una migración.

## Contrato

**Hallazgo:** ninguna.

**Severidad:** ninguna.

El cambio de `Section.key` es aditivo. `number` máximo 22. No aparece un endpoint `/architectures`.

## Renombre Lakehouse

**Hallazgo:** la nota de `gcp-biglake` cita las dos frases del cambio de nombre y después dice que la API y los roles IAM conservan «BigLake». El banner también deja igual el nombre en las bibliotecas cliente y en la CLI.

**Severidad:** baja.

**Evidencia:** el HTML de [Set up the Apache Iceberg REST catalog endpoint](https://docs.cloud.google.com/lakehouse/docs/set-up-lakehouse-iceberg-rest-catalog), leído el 2026-11-02, trae el banner (el Markdown de la herramienta lo omite porque va en `data-nosnippet`):

> As of April 20th, 2026, BigLake is now called Lakehouse. BigLake metastore is now called the Lakehouse runtime catalog. Lakehouse APIs, client libraries, CLI commands, and IAM names remain unchanged and still reference BigLake.

El H1 es «Set up the Apache Iceberg REST catalog endpoint», igual que `page_title`. El título de la tecnología es «Lakehouse»; los alias son «BigLake» y «BigLake metastore». El cuerpo de la página sigue con `roles/biglake.admin` y `gcloud biglake iceberg catalogs create`. `gcp-vertex-ai` ya se titula «Gemini Enterprise Agent Platform» y `gcp-dataplex` ya se titula «Knowledge Catalog»; este lote no les cambia el título.

**Corrección:** en la nota de `gcp-biglake`, añadir que las bibliotecas cliente y la CLI también siguen diciendo BigLake, como la tercera frase del banner.
