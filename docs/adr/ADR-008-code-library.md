# ADR-008 — Code Library: snippets en content/ y endpoints /snippets

- **Estado:** Aceptado
- **Fecha:** 2026-10-01
- **Fase:** F3 — Contenido Core del MVP (A-F3.2)
- **Referencias:** ADR-000, ADR-002, ADR-005, ADR-007; plan maestro §23.

## Contexto

La Code Library (§23) guarda código importante explicando el patrón que implementa, no solo el código. El schema `code_snippet` existía desde F0 (`language`, `dialect`, `requirements`) y el catálogo de relaciones ya admitía `code_snippet → IMPLEMENTS → concept/pattern`, pero no había snippets, ni plantilla, ni forma de leerlos desde la API: el contrato no tenía endpoints de snippets y la búsqueda no los devolvía. B-F3.2 (vista `/snippets` y ficha de snippet) los necesita.

## Decisión

1. **Contenido:** un snippet es `content/snippets/<slug>.md` de tipo `code_snippet`. Su cuerpo sigue `content/_templates/snippet.md`, con 10 secciones: Qué resuelve, Código, Cómo funciona, Cuándo usarlo, Cuándo no usarlo, Riesgos, Requisitos y cómo ejecutarlo, Conceptos relacionados, Fuentes e Historial de cambios.
2. **Reglas de `validate`** (sin cambio de schema):
   - las 10 secciones de la plantilla, en orden y sin secciones vacías;
   - `requirements` no vacío: el código es ejecutable o dice exactamente qué requiere;
   - al menos un `IMPLEMENTS` hacia un `concept` o `pattern` con `verification_status: verified`; la Code Library solo cubre conceptos verificados;
   - las mismas reglas que las fichas para `related_topics` (deben estar en `relations`) y para los niveles de fuente.
3. **Contrato (cambio aditivo):**
   - `GET /snippets`: página de `SnippetSummary` ordenada por slug, con filtros `language`, `cloud` e `implements` (slug del concept o pattern implementado);
   - `GET /snippets/{slug}`: `SnippetDetail`, con la metadata común (`Metadata`), `language`, `dialect`, `requirements`, `implements` y `sections` (`SnippetSection`, claves fijas);
   - `ResultType` de la búsqueda incluye `code_snippet`, y los snippets se indexan como cualquier entidad (`has_page: true`).
   - **Ranking:** los snippets no reciben el bonus de ficha de ADR-007 (+0.3). Ese bonus favorece las fichas de conocimiento frente a los conceptos sin ficha; un snippet es contenido derivado de una ficha, y con el bonus una consulta conceptual («partición») ponía primero un snippet que solo menciona el término sobre la ficha del concepto.
4. **Relaciones:** no hay endpoint nuevo. `GET /entities/{slug}/relations` de un concepto ya devuelve sus snippets en el grupo `IMPLEMENTS` entrante (`implemented_by`).
5. Mocks: `GET /snippets?limit=500` y el detalle y las relaciones de cada snippet.

## Consecuencias

- Carril B regenera el cliente tipado y construye la vista `/snippets` y la ficha de snippet sobre estos endpoints.
- Un snippet deja de validar si el concepto que implementa pierde el estado `verified`. Así la Code Library no queda apuntando a contenido sin verificar.
- Los snippets se revisan como las fichas y pasan a `verified` con la misma regla.
- El HCL de Terraform de los snippets se valida en la CI (`terraform init -backend=false` y `terraform validate`, sin credenciales).
