# ADR-001 — Stack de la plataforma

- **Estado:** Aceptado (gate F1, 2026-09-29)
- **Fecha:** 2026-09-29
- **Fase:** F1 — Knowledge Blueprint v1 (tarea B-F1.3). Lo confirma el gate humano de F1.
- **Referencias:** ROADMAP §4 y fase F7; plan maestro §49; ADR-000.

## Contexto

El plan pide cerrar el modelo de conocimiento antes de elegir la tecnología de la plataforma. ADR-000 ya fijó que la fuente de verdad es `content/` en Git y que la base de datos es derivada. Falta decidir con qué se valida, se consulta, se sirve y se dibuja, para que F2 no abra ese debate otra vez.

El catálogo del MVP es pequeño (fichas, relaciones y búsqueda por texto). No hace falta una base de grafos ni búsqueda semántica para demostrar el recorrido Explorer → ficha → relacionados → fuente.

## Opciones consideradas

| Opción | Motivo para no adoptarla ahora |
|---|---|
| Base de datos como fuente de verdad | Ya descartada en ADR-000: sin diffs revisables y acoplada a la plataforma. |
| Base de grafos en el MVP | El recorrido del MVP es un salto por relaciones. Una tabla de aristas en PostgreSQL alcanza. |
| pgvector en el MVP | La búsqueda del MVP es texto (FTS). Los embeddings se justifican cuando el catálogo sea grande. |
| React + Vite | Cubre la interfaz. Next.js encaja mejor con una ruta estable por slug sin armar el enrutado a mano. Queda como alternativa si el gate la prefiere. |
| Solo Markdown, sin JSON Schema | Ya descartada en ADR-000: no valida metadata, vigencia ni relaciones. |

## Decisión

Propuesta por defecto del ROADMAP §4, aceptada en el gate de F1:

| Capa | Decisión |
|---|---|
| Fuente de verdad | Markdown + frontmatter YAML en Git (ADR-000). |
| Validación | JSON Schema y `scripts/validate.py`. |
| Almacenamiento de consulta | PostgreSQL: tablas por tipo de entidad, tabla de aristas para el grafo y FTS. Sin base de grafos y sin pgvector. |
| API | FastAPI. |
| Frontend | Next.js, con una ruta estable por slug. |
| Diagramas | Mermaid dentro del Markdown. |

El contenido se compila desde `content/` hacia PostgreSQL. La base se puede borrar y volver a generar. Git no.

## Consecuencias

- F2 compila a PostgreSQL y expone la API con FastAPI. El frontend arranca en Next.js.
- El estado personal (notas, estudio, favoritos) vive en PostgreSQL, no en `content/` (ADR-000).
- Cambiar esta decisión después del gate exige otro ADR.

## Qué se revisará en F7

F7 no adopta estas piezas por defecto. Se vuelven a mirar solo si el uso real del MVP lo pide:

- **pgvector.** Búsqueda semántica cuando el catálogo justifique embeddings (ROADMAP, fase F7). Hasta entonces la búsqueda es FTS.
- **Base de grafos.** Solo si la tabla de aristas deja de alcanzar para el recorrido por relaciones. Mientras el grafo sea de un salto y consultas dirigidas, PostgreSQL sigue siendo el almacenamiento.
