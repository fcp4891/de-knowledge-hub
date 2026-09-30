# BACKLOG — ideas fuera de la fase actual

Formato: `- [fase sugerida] idea — origen`

- [F1] validate.py: verificar que el cuerpo de las fichas `concept` contenga las 22 secciones de `content/_templates/concept.md`, una vez cerrada la plantilla (B-F1.1) — A-F0
- [F1] validate.py: comprobar que `sources[].url` pertenezca al dominio del `url` de la fuente referenciada — A-F0
- [F1] validate.py: avisar si una entidad tiene `stub: true` y `verification_status: verified` — A-F0
- [F1] Ampliar las fuentes de la ficha CDC y crear las entidades SCD2, MERGE incremental, streaming y WAL, hoy mencionadas solo en texto — A-F0
- [F5] Un script que compruebe periódicamente `url_verified` de las fuentes, en lugar de hacerlo a mano — A-F0
- [F1] Blueprint: añadir "fuentes candidatas" por dominio (§54) cuando exista el Source Registry (A-F1.3) — A-F1.1
- [F1] Revisar si `data-quality-dimensions` debe separarse en una ficha por dimensión — A-F1.1
- [F2] Explorer: mostrar los conceptos del blueprint que aún no tienen ficha como "pendiente", en vez de ocultarlos — A-F1.1
- [F4] Blueprint 07: agregar `corporate-data-platform-architecture` (§24, ejemplo 9) como implementación de referencia de `data-platform-engineering` — revisión del dominio 22
- [F2] Dividir `scripts/validate.py` (unas 530 líneas) en módulos: entidades, blueprint y matriz — A-F1.2
- [F1/F3] Matriz: decidir cómo representar las capacidades sin un servicio nativo equivalente en cada cloud (IaC, transformación SQL, CI/CD) — A-F1.2
- [F3] Inventario: agregar los servicios PostgreSQL administrados de Azure y Aurora de AWS si las fichas de CDC o relacionales los necesitan — A-F1.2
- [F7] Source Registry, bloque 2: una fuente Nivel 1 verificada para cada una de las 83 tecnologías no MVP — A-F1.3
- [F5] Source Registry: agregar `feed_url` (RSS/XML) a las fuentes `release_notes`, para que las ingiera el Update Engine; requiere ADR — A-F1.3
- [F3] Verificar a mano `terraform-provider-google-docs`: es una SPA y el título genérico no confirma el contenido — A-F1.3
- [F3] Ficha CDC: actualizar las URLs de `cloud.google.com/...` a su destino final en `docs.cloud.google.com` — A-F1.3
- [F3] Blueprint y matriz: actualizar los títulos y textos que dicen "Cloud Composer" (p. ej. `composer-environments`) al nombre nuevo «Managed Service for Apache Airflow» cuando se redacten las fichas — gate F1
