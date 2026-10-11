# ADR-010 — Campo `aliases` para nombres anteriores o alternativos

- **Estado:** Aceptado
- **Fecha:** 2026-10-11
- **Fase:** F3b — Contenido por dominio (pedido de Felipe tras aprobar 07-architecture)
- **Referencias:** ADR-002 (contrato), ADR-005 (búsqueda en la API), ADR-007 (`has_page`), ADR-009.

## Contexto

Varios servicios cambiaron de nombre durante F3b, cada uno anunciado en su propia página:

- Cloud Composer → Managed Service for Apache Airflow;
- Dataplex Universal Catalog → Knowledge Catalog (10 de abril de 2026);
- Dataproc on Compute Engine y Google Cloud Serverless for Apache Spark → Managed Service for Apache Spark.

Los slugs no cambian, porque son identificadores estables de URLs y relaciones. Los títulos sí cambian. Quien busca por el nombre anterior («Composer», «Dataplex») no debería quedarse sin resultado.

Hasta ahora el nombre anterior se ponía en `tags` o en `note`. Eso mezcla temas con nombres: `tags` son slugs de tema y no admiten espacios ni mayúsculas.

## Decisión

1. **Esquema.** `aliases` es una lista opcional de strings, con elementos únicos, cada uno de 1 a 100 caracteres. Se define una vez en `schemas/base.schema.json` (`$defs/aliases`) y se habilita en `concept`, `pattern`, `technology` y `cloud_service`. Un alias es un nombre anterior o alternativo de la misma entidad, escrito como lo escribe su fuente, por ejemplo «Cloud Composer».
2. **Fuente.** Un alias que viene de un cambio de nombre lleva en `sources` la página que lo dice. Sin página, no hay alias de cambio de nombre (misma regla de atribución que el contenido).
3. **Búsqueda en la API (PostgreSQL).** Los alias se indexan con el título, con peso A en el `tsvector` de `search_documents`. `COMPILER_VERSION` pasa a `"3"`, así que la siguiente compilación reindexa todo.
4. **Búsqueda de referencia de los mocks** (`backend/app/projection.py`): una coincidencia en un alias puntúa como una coincidencia en el título.
5. **Búsqueda estática.** Cada documento de `search-index.json` tiene `aliases` (lista, vacía si no hay). Que el navegador los indexe depende del frontend (Carril B).
6. **Contrato (cambio aditivo).** `ConceptDetail` y `TechnologyDetail` incluyen `aliases: string[]`, obligatorio en la respuesta y vacío si no hay. `SearchResult` no cambia.

## Consecuencias

- Buscar «Dataplex», «Cloud Composer» o «Dataproc» en la API devuelve la entidad con su nombre actual.
- Carril B debe agregar `aliases` a los campos de MiniSearch en `frontend/lib/browserSearch.ts` para que la búsqueda estática los encuentre. También decide si la ficha muestra los alias («También conocido como…»). Debe regenerar el cliente tipado.
- `tags` vuelve a ser solo para temas. Los alias que estaban en `tags` o `note` (Composer, Dataplex) pasan a `aliases`.
- No cambian los slugs, las relaciones ni la matriz.
