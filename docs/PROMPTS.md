# Prompts de trabajo — Data Engineering Knowledge Hub

Cada prompt es una tarea cerrada: **una sesión = un prompt**. Copiar tal cual.
Carril A = Claude Code · Carril B = Cursor. Las tareas en la misma fila pueden correr en paralelo.

---

## 0. Prompts transversales

### 0.1 Inicio de sesión (ambos carriles)
```text
Lee docs/STATUS.md (resumen), tu archivo de estado (docs/status/lane-a.md o lane-b.md) y la fase actual en docs/ROADMAP.md.
Tu tarea es exclusivamente: <PEGAR TAREA>.
Antes de escribir código, dame un plan de máximo 8 pasos con los archivos que vas a crear o modificar. Espera mi aprobación.
```

### 0.2 Cierre de tarea (ambos carriles)
```text
Cierra la tarea:
1. Ejecuta validate/test (Carril A) o build/lint (Carril B) y corrige hasta que pasen.
2. Actualiza solo tu archivo de estado (docs/status/lane-a.md o lane-b.md): hecho, siguiente, bloqueos, pedidos al otro carril.
   docs/STATUS.md es un resumen: solo Carril A lo actualiza, al mergear a main.
3. Mueve a docs/BACKLOG.md cualquier idea que haya surgido fuera de alcance.
4. Haz commit en tu rama con un mensaje descriptivo.
Resume en 5 líneas lo que quedó.
```

### 0.3 Freno de deriva (usar cuando la sesión se desvía)
```text
Detente. Compara lo que estás haciendo con la tarea asignada y con la fase actual del ROADMAP.
Lista qué parte está fuera de alcance, muévela a docs/BACKLOG.md y continúa solo con lo que corresponde.
```

### 0.4 Gate de fase (Claude Code, al final de cada fase)
```text
Verifica el criterio de salida de la fase actual en docs/ROADMAP.md.
Para cada criterio indica: cumplido / no cumplido, con evidencia (archivo, comando, resultado).
Lista riesgos y deuda técnica. No avances de fase: solo reporta para mi revisión.
```

---

## F0 — Fundaciones (solo Carril A, secuencial)

### A-F0 · Repo y contratos base
```text
Contexto: vamos a iniciar el Data Engineering Knowledge Hub. El plan está en docs/plan-maestro.md y la hoja de ruta en docs/ROADMAP.md. CLAUDE.md define tus reglas.

Tarea F0 — Fundaciones:
1. Crea la estructura de directorios de la sección 3 del ROADMAP, con docs/BACKLOG.md y docs/adr/ vacíos.
2. Crea un Makefile con: validate, test, build, dev.
3. Crea schemas/ en JSON Schema (draft 2020-12):
   - base.schema.json con la metadata mínima del plan §40.
   - Un schema por tipo de entidad del §41 (Concept, Technology, CloudService, Pattern, Architecture, CodeSnippet, Lab, News, Release, Source, JobDescription, InterviewQuestion, PersonalNote), extendiendo base.
   - relationships.schema.json con los tipos de relación de §34 y §42, incluyendo qué tipos de entidad son válidos como origen y destino de cada relación.
   - Enumeraciones: classification (core/modern/emerging), level, verification_status (§33), source_type (§30).
4. Crea scripts/validate.py: recorre content/, parsea frontmatter YAML de los .md y archivos .yaml, valida contra el schema según `type`, verifica slugs únicos y que toda relación apunte a un slug existente. Salida clara con archivo y error.
5. Crea content/concepts/change-data-capture.md como ficha de ejemplo, con la estructura de 22 secciones del §22, estado review_required.
6. Tests pytest para validate.py (casos válidos e inválidos).
7. Escribe docs/adr/ADR-000-content-as-code.md: el contenido vive en Markdown+YAML versionado; la base de datos es derivada.

Criterio de salida: `make validate` y `make test` pasan.
Primero muéstrame el plan.
```

---

## F1 — Knowledge Blueprint v1

| Carril A (Claude Code) | Carril B (Cursor) |
|---|---|
| A-F1.1 Blueprint | B-F1.1 Templates |
| A-F1.2 Tecnologías + matriz | B-F1.2 Revisión del Blueprint |
| A-F1.3 Source Registry | B-F1.3 Revisión de fuentes + ADR-001 |

### A-F1.1 · Blueprint de dominios
```text
Tarea F1.1 — Knowledge Blueprint.
Fuente: docs/plan-maestro.md §4–§21 y §54.

Genera content/blueprint/ con un archivo YAML por dominio (01-fundamentals.yaml … 23-emerging.yaml). Cada archivo contiene:
- domain (id, slug, título)
- subdomains[] → concepts[] con: slug, title, classification (core/modern/emerging), level (basic/intermediate/advanced), importance (high/medium/low), mvp (true/false), related_technologies[] (slugs), related_concepts[] (slugs).

Reglas:
- Usa como base los listados del plan; puedes agregar conceptos claramente faltantes, marcándolos con `added_by: blueprint` para revisión.
- Marca mvp: true solo para los dominios del MVP (§51): Fundamentos, SQL, Modelado, Pipelines, Arquitectura y GCP.
- No escribas contenido de fichas todavía; solo el inventario.
- Crea el schema blueprint.schema.json si no existe y hazlo pasar por validate.
- Reutiliza los slugs de los stubs existentes (debezium, apache-kafka, gcp-datastream, idempotency).

Al final: tabla resumen con número de conceptos por dominio, cuántos son mvp y cuántos agregaste.
Trabaja dominio por dominio y valida cada 5 dominios.
```

### A-F1.2 · Inventario de tecnologías y Cloud Capability Matrix
```text
Tarea F1.2 — Tecnologías y matriz multicloud.
Fuentes: docs/plan-maestro.md §10–§13, §21 y content/blueprint/.

1. content/technologies/_inventory.yaml: toda tecnología referenciada en el blueprint, con slug, nombre, vendor (gcp/aws/azure/open-source/other), categoría, classification, mvp.
   Diferencia explícitamente proyecto open source vs servicio administrado (ej. apache-airflow vs cloud-composer vs aws-mwaa), con relación RUNS_ON o IMPLEMENTS.
2. content/matrix/capabilities.yaml: una entrada por capacidad (object storage, warehouse, streaming, processing, orchestration, governance, AI, containers, secrets, IaC…), con GCP/AWS/Azure y, por celda: servicio(s), diferencias arquitectónicas clave, cuándo NO es equivalente.
3. Todo slug usado en el blueprint debe existir en el inventario. validate debe verificarlo.

No afirmes detalles de producto que puedan haber cambiado sin marcarlos `review_required`.
```

### A-F1.3 · Borrador del Source Registry
```text
Tarea F1.3 — Source Registry (§30, §52.D).

Crea content/sources/registry.yaml con una entrada por fuente: id, nombre, url_base, tipo (official_docs, release_notes, engineering_blog, spec_paper, secondary), proveedor, nivel (1–5), frecuencia_revision, confianza, tecnologias[] (slugs).

Prioriza: documentación y release notes oficiales de todas las tecnologías mvp: true.
Verifica cada URL con una petición real; si no puedes verificarla, márcala `url_verified: false`. No inventes URLs.
Al final, lista las tecnologías mvp sin fuente Nivel 1 o 2.
```

### B-F1.1 · Templates de contenido (Cursor)
```text
@docs/plan-maestro.md @schemas/

Crea en content/_templates/ cuatro plantillas Markdown con frontmatter YAML compatible con schemas/:
- concept.md: las 22 secciones del §22.
- architecture.md: secciones del §24.
- lab.md: tipos A–E del §25, con escenario, datos de entrada, restricciones, criterios de una buena solución, conceptos practicados. Sin respuestas cerradas.
- news.md: formato del §31 más la clasificación del §32.

Cada sección lleva un comentario HTML de 1 línea con la pregunta que debe responder (§48).
No modifiques schemas/: si falta un campo, anótalo en docs/status/lane-b.md como pedido a Carril A.
```

### B-F1.2 · Revisión del Blueprint (Cursor, iterativo con Felipe)
```text
@content/blueprint/<NN-dominio>.yaml @docs/plan-maestro.md

Revisa este dominio como Senior Data Engineer:
1. Conceptos faltantes relevantes para un rol Senior.
2. Conceptos que sobran o están duplicados en otro dominio.
3. Clasificación core/modern/emerging discutible.
4. Nivel o flag mvp mal asignado.
Entrega una tabla de propuestas. No edites el archivo hasta que yo apruebe cada fila.
```

### B-F1.3 · Revisión de fuentes y ADR-001 (Cursor)
```text
@content/sources/registry.yaml @docs/ROADMAP.md

1. Revisa el registro: fuentes secundarias con nivel inflado, tecnologías MVP sin fuente oficial, frecuencias de revisión poco realistas. Propón cambios en tabla.
2. Redacta docs/adr/ADR-001-stack.md con la propuesta de la sección 4 del ROADMAP: contexto, opciones consideradas, decisión, consecuencias, qué se revisará en F7 (pgvector, graph DB).
Estado del ADR: "Propuesto".
```

---

## F2 — Plataforma MVP

| Carril A (Claude Code) | Carril B (Cursor) |
|---|---|
| A-F2.1 Contrato + mocks (**primero, bloqueante**) | — |
| A-F2.2 Compilador content → PostgreSQL | B-F2.1 Scaffold + Home + Explorer |
| A-F2.3 API + búsqueda | B-F2.2 Fichas de concepto y tecnología |
| A-F2.4 Notas y estado personal | B-F2.3 Búsqueda, relaciones, notas |

### A-F2.1 · Contrato de API y mocks
```text
Tarea F2.1 — Contrato. Es bloqueante para Carril B: hazla primero y compacta.

1. docs/contracts/api.yaml (OpenAPI 3.1) con los endpoints de solo lectura para el MVP:
   GET /domains, /domains/{slug}
   GET /concepts, /concepts/{slug}
   GET /technologies, /technologies/{slug}
   GET /entities/{slug}/relations
   GET /sources/{id}
   GET /search?q=&type=&domain=&classification=
   GET/PUT /me/study-state/{slug}, GET/POST /me/notes/{slug}, GET/PUT /me/favorites/{slug}
   Toda entidad expone metadata §40, incluyendo last_verified y verification_status.
2. docs/contracts/mock-data/: respuestas JSON de ejemplo para cada endpoint, construidas a partir de content/ real (al menos 10 conceptos y 5 tecnologías).
3. ADR-002-api-contract.md.
Actualiza docs/status/lane-a.md y, al mergear, docs/STATUS.md, avisando a Carril B que puede comenzar.
```

### A-F2.2 · Compilador content → PostgreSQL
```text
Tarea F2.2 — Compilador.
Lee: schemas/, docs/adr/ADR-000, ADR-001.

1. backend/db/: migraciones (Alembic) con tablas por tipo de entidad, tabla `edges` (source_slug, relation_type, target_slug, metadata) y tabla `sources`.
2. scripts/compile.py: valida content/ y hace upsert idempotente a PostgreSQL. Elimina lo que ya no existe en content/. Registra hash del archivo para compilar solo cambios.
3. docker-compose.yml con PostgreSQL local.
4. Tests: compilar dos veces seguidas no cambia nada; borrar una ficha la elimina con sus aristas.
```

### A-F2.3 · API y búsqueda
```text
Tarea F2.3 — API FastAPI según docs/contracts/api.yaml (no modificar el contrato sin ADR).
1. backend/app/ con routers por recurso, Pydantic, repositorio sobre PostgreSQL.
2. Búsqueda con PostgreSQL FTS en español e inglés sobre título, resumen, tags y cuerpo; ranking que priorice coincidencias en título y conceptos core.
3. Tests de contrato: cada respuesta valida contra api.yaml.
```

### A-F2.4 · Estado personal
```text
Tarea F2.4 — Seguimiento personal (§37): estados (No revisado, Revisando, Comprendido, Aplicado, Necesita repaso), fecha de último estudio, notas, favoritos, pendiente de profundización.
Se guarda en PostgreSQL (no en content/), usuario único por ahora. Endpoints según el contrato. Tests.
```

### B-F2.1 · Scaffold, Home y Explorer (Cursor)
```text
@docs/contracts/api.yaml @docs/contracts/mock-data/ @.cursor/rules/project.mdc

Crea frontend/ con el stack de ADR-001. Cliente de API tipado generado desde api.yaml, con modo mock activado por variable de entorno.
Implementa:
- Layout general con navegación por dominio.
- Home (§38) solo con: Continuar estudiando, Necesita repaso, Conceptos recientes. El resto de secciones queda como placeholder vacío, no inventes datos.
- Knowledge Explorer: dominios → subdominios → conceptos, con filtros por clasificación, nivel y mvp.
```

### B-F2.2 · Fichas (Cursor)
```text
@docs/contracts/api.yaml @content/_templates/concept.md

Implementa /concepts/[slug] y /technologies/[slug]:
- Profundidad progresiva: secciones colapsables, el resumen siempre visible.
- Cabecera con clasificación, nivel, last_verified y verification_status (badge visible si review_required o potentially_outdated).
- Bloque GCP / AWS / Azure con pestañas.
- Código con resaltado y botón copiar.
- Panel lateral de conceptos relacionados agrupados por tipo de relación.
- Fuentes al final, con nivel de fuente.
```

### B-F2.3 · Búsqueda, relaciones y notas (Cursor)
```text
@docs/contracts/api.yaml

1. Búsqueda global (atajo de teclado) con resultados agrupados por tipo (§35).
2. Navegación entre entidades por relaciones.
3. En la ficha: selector de estado de estudio, favoritos y notas personales en Markdown.
Cuando el backend real esté listo (ver docs/STATUS.md y docs/status/lane-a.md), desactiva los mocks y prueba de extremo a extremo.
```

---

## F3 — Contenido Core del MVP

| Carril A (Claude Code) | Carril B (Cursor) |
|---|---|
| A-F3.1 Lote de 10 fichas (repetir) | B-F3.1 Revisión del lote |
| A-F3.2 Snippets | B-F3.2 Code Library + vista de grafo |

### A-F3.1 · Lote de fichas (repetible)
```text
Tarea F3.1 — Lote <N> de fichas.
Conceptos del lote: <LISTA DE 10 SLUGS, tomados de content/blueprint/ con mvp: true>.

Para cada uno, crea content/concepts/<slug>.md usando content/_templates/concept.md:
- Consulta la documentación oficial registrada en content/sources/registry.yaml antes de escribir cualquier afirmación sobre productos.
- Cada afirmación dinámica (límites, precios, comportamiento de servicios, versiones) lleva su fuente.
- Si no pudiste verificar: verification_status: review_required y un comentario <!-- VERIFY: ... -->.
- Ejemplo sencillo + ejemplo de producción realista.
- Sección "Cuándo NO utilizarlo" obligatoria.
- 3 preguntas técnicas abiertas (§26), sin respuestas.
- Relaciones solo hacia slugs existentes.

Al final: tabla con slug, estado de verificación, número de fuentes y puntos marcados VERIFY. No inicies el siguiente lote.
```

### B-F3.1 · Revisión del lote (Cursor, con Felipe)
```text
@content/concepts/<slug>.md

Revisa esta ficha contra §48 del plan. Reporta en tabla:
- Preguntas de §48 no respondidas.
- Afirmaciones sin fuente o con fuente de nivel bajo.
- Errores técnicos o simplificaciones peligrosas.
- Ejemplos poco realistas.
- Relaciones faltantes.
Solo corrige directamente erratas y redacción; lo técnico lo propones y yo decido.
```

### A-F3.2 · Snippets
```text
Tarea F3.2 — Code Library (§23) para los conceptos verificados del MVP.
content/snippets/<slug>.md: código + explicación del patrón + cuándo usarlo + riesgos + conceptos relacionados (relación IMPLEMENTS hacia el pattern/concept).
Prioridad: MERGE incremental, SCD2, deduplicación, reconciliación en BigQuery; ingesta API con retries en Python; Terraform de BigQuery, GCS e IAM; DAG de Airflow; modelo Dataform incremental.
El SQL y Python deben ser ejecutables o incluir exactamente qué requieren.
```

### B-F3.2 · Code Library y grafo (Cursor)
```text
@docs/contracts/api.yaml

1. Vista /snippets con filtros por lenguaje, patrón y cloud; ficha de snippet con explicación y conceptos relacionados.
2. En la ficha de concepto: mini-grafo del vecindario a 1 salto (nodos coloreados por tipo de entidad), clicable.
Si faltan endpoints, pídelos en docs/status/lane-b.md.
```

---

## F4 — Architecture Lab y Labs

### A-F4.1 · Arquitecturas
```text
Tarea F4.1 — 5 arquitecturas en content/architectures/ con la plantilla architecture.md:
batch pipeline, streaming pipeline, CDC PostgreSQL → BigQuery, API → Data Warehouse, Medallion.
Cada una con diagrama Mermaid, razón de cada componente, trade-offs, costo, seguridad, observabilidad, implementación GCP completa y equivalencia AWS/Azure con diferencias.
Relaciones USES hacia tecnologías y conceptos existentes. Mismas reglas de fuentes que F3.
```

### A-F4.2 · Labs
```text
Tarea F4.2 — 10 labs en content/labs/ (2 por tipo A–E del §25), anclados a conceptos y arquitecturas existentes.
Cada lab: escenario, datos o código de partida, restricciones, qué debe cubrir una buena solución, conceptos practicados. Sin solución cerrada ni puntaje.
Incluye endpoints de arquitecturas y labs en el contrato mediante ADR y actualiza la API.
```

### B-F4.1 · Vistas de arquitectura, labs y navegación por problema (Cursor)
```text
@docs/contracts/api.yaml

1. /architectures/[slug] con render de Mermaid, secciones colapsables y pestañas GCP/AWS/Azure.
2. /labs/[slug] con editor de solución personal (se guarda como nota) y conceptos practicados.
3. Página "¿Qué necesito resolver?" (§36): lista de problemas que enlaza a conceptos, arquitecturas y labs.
```

---

## F5 — Update Engine (después de 2–3 semanas de uso real)

### A-F5.1 · Pipeline de novedades
```text
Tarea F5.1 — Update Engine para GCP (§29–§33).
pipelines/update_engine/:
1. Ingesta de release notes oficiales desde content/sources/registry.yaml (solo tipo release_notes, proveedor gcp).
2. Deduplicación idempotente por id/URL/fecha.
3. Clasificación Critical/Important/Useful/Watch con criterios explícitos en un archivo de reglas; el LLM solo sugiere, con justificación.
4. Vinculación a tecnologías del grafo.
5. Si una novedad afecta una ficha verified, marcarla potentially_outdated / review_required.
6. Salida en content/news/ con plantilla news.md, estado pending_review.
Ejecución manual por comando; programación después.
```

### B-F5.1 · Novedades y cola de revisión (Cursor)
```text
Vistas: /news con filtros por relevancia y tecnología; cola de revisión (aprobar/descartar novedades, ver fichas afectadas); bloque del Home "Cambios en herramientas que utilizo" según el perfil (§39).
```

---

## F6 — Career Engine + Interview Mode

### A-F6.1 · Análisis de ofertas
```text
Tarea F6.1 — Career Engine (§27).
Entrada: texto de una JD. Proceso: extracción de requisitos (LLM con salida estructurada validada por Pydantic) → normalización contra slugs del grafo → clasificación en: existente, gap de contenido, desconocido.
Salida: tecnologías, conceptos, arquitecturas relacionadas, ruta de estudio recomendada, labs y preguntas relevantes.
Los términos no mapeados se proponen como candidatos al blueprint, nunca se crean automáticamente.
```

### B-F6.1 · Career e Interview Mode (Cursor)
```text
1. /career: pegar JD, ver reporte de gaps y ruta de estudio, historial de ofertas analizadas.
2. /interview: preguntas abiertas por concepto o por JD; al revelar, mostrar elementos que una respuesta sólida debería mencionar y conceptos relacionados. Sin nota ni puntaje.
```

---

## Tabla rápida: ¿qué herramienta uso?

| Situación | Herramienta |
|---|---|
| Generar muchos archivos con spec clara | Claude Code |
| Schemas, compiladores, pipelines, tests | Claude Code |
| Verificar contra documentación oficial | Claude Code |
| Componentes de UI e iteración visual | Cursor |
| Revisar una ficha con criterio humano | Cursor |
| Bug puntual en un archivo | Cursor |
| Cambio que cruza backend y frontend | ADR + una tarea por carril |
