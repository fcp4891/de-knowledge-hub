# ADR-000 — Content as code

- **Estado:** Aceptado
- **Fecha:** 2026-09-28
- **Fase:** F0 — Fundaciones
- **Referencias:** plan maestro §2.4, §33, §40–§42, §49; ROADMAP §4.

## Contexto

El activo central del Knowledge Hub es el modelo de conocimiento: conceptos, tecnologías, relaciones, fuentes y fechas de verificación. Este modelo tiene que poder revisarse cambio por cambio, versionarse, exportarse y regenerarse sin depender de ninguna base de datos ni de ningún frontend concreto. También tiene que servir como contrato común para las personas, para los dos carriles de desarrollo y para los LLM que generan contenido.

## Decisión

1. **La fuente de verdad es `content/`**, versionado en Git:
   - Las fichas son archivos Markdown con frontmatter YAML (`.md`).
   - Los datos estructurados sin cuerpo (registro de fuentes, stubs, blueprint, matriz) son archivos YAML (`.yaml`). Un archivo puede contener varios documentos separados por `---`.
2. **El contrato es `schemas/`** (JSON Schema draft 2020-12):
   - `enums.schema.json`: vocabularios controlados.
   - `base.schema.json`: metadata mínima (§40).
   - `entities/<type>.schema.json`: un schema por tipo de entidad (§41).
   - `relationships.schema.json`: tipos de relación, con sus pares origen/destino permitidos y su nombre inverso (§34, §42).
3. **Cada entidad lleva `id = <type>:<slug>`.** El `slug` es único en todo `content/`.
4. **Las relaciones se declaran en la entidad origen y en una sola dirección.** La inversa (por ejemplo, `IMPLEMENTS` ↔ `implemented_by`) no se almacena: se deriva al consultar, usando el campo `inverse` de `x-relation-catalog`.
5. **`scripts/validate.py` controla la entrada** (`make validate`, también en CI). Rechaza:
   - schemas incumplidos;
   - ids o slugs duplicados;
   - referencias a slugs inexistentes;
   - relaciones con pares de tipos no permitidos.
6. **La base de datos es derivada y desechable.** Desde F2, un compilador idempotente carga `content/` en PostgreSQL. Nunca se edita contenido directamente en la base de datos.
   - **Excepción:** el estado personal (notas, estado de estudio, favoritos, §37) vive en la base de datos porque es dato de uso, no conocimiento.
7. **Los marcadores mínimos llevan `stub: true`.** Son entidades con contenido pendiente que existen para sostener relaciones reales.

## Opciones consideradas

| Opción | Motivo de descarte |
|---|---|
| Base de datos como fuente de verdad (CMS o admin web) | Sin diffs revisables, difícil de versionar, acopla el contenido a la plataforma. |
| Base de datos de grafos desde el inicio | Complejidad prematura; una tabla de aristas en PostgreSQL basta para el MVP (ROADMAP §4). |
| Solo Markdown, sin schema | No permite validar metadata, vigencia ni relaciones de forma automática. |

## Consecuencias

- Todo cambio de contenido pasa por Git y por `make validate`.
- Cambiar `schemas/` es cambiar el contrato: requiere un ADR (CLAUDE.md).
- El compilador de F2 debe ser idempotente y eliminar de la base de datos lo que ya no existe en `content/`.
- La validación de relaciones impone un orden de creación: el destino debe existir antes que la relación. Los stubs resuelven esa dependencia.
