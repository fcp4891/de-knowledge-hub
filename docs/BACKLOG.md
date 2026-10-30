# BACKLOG — ideas fuera de la fase actual

Formato: `- [fase sugerida] idea — origen`

- ~~**[F3 · primera tarea]** validar las 22 secciones de las fichas~~ — hecho (lote 1 de F3, adelantado en F2)
- [F1] validate.py: comprobar que `sources[].url` pertenezca al dominio del `url` de la fuente referenciada — A-F0
- [F1] validate.py: avisar si una entidad tiene `stub: true` y `verification_status: verified` — A-F0
- [F1] Ampliar las fuentes de la ficha CDC y crear las entidades SCD2, MERGE incremental, streaming y WAL, hoy mencionadas solo en texto — A-F0
- [F5] Un script que compruebe periódicamente `url_verified` de las fuentes, en lugar de hacerlo a mano — A-F0
- [F1] Blueprint: añadir "fuentes candidatas" por dominio (§54) cuando exista el Source Registry (A-F1.3) — A-F1.1
- [F1] Revisar si `data-quality-dimensions` debe separarse en una ficha por dimensión — A-F1.1
- [F2] Explorer: mostrar los conceptos del blueprint que aún no tienen ficha como "pendiente", en vez de ocultarlos — A-F1.1
- ~~[F4] Blueprint 07: agregar `corporate-data-platform-architecture`~~ — **descartado**: la revisión 07, fila 14, decidió no crear el slug; lo cubren `modern-data-warehouse-architecture`, `lakehouse-architecture` y `data-mesh`
- [F2] Dividir `backend/content/validate.py` (unas 580 líneas) en módulos: entidades, blueprint y matriz — A-F1.2
- [F1/F3] Matriz: decidir cómo representar las capacidades sin un servicio nativo equivalente en cada cloud (IaC, transformación SQL, CI/CD) — A-F1.2
- [F3] Inventario: agregar los servicios PostgreSQL administrados de Azure y Aurora de AWS si las fichas de CDC o relacionales los necesitan — A-F1.2
- [F7] Source Registry, bloque 2: una fuente Nivel 1 verificada para cada una de las 83 tecnologías no MVP — A-F1.3
- [F5] Source Registry: agregar `feed_url` (RSS/XML) a las fuentes `release_notes`, para que las ingiera el Update Engine; requiere ADR — A-F1.3
- [F3] Verificar a mano `terraform-provider-google-docs`: es una SPA y el título genérico no confirma el contenido — A-F1.3
- [F3] Ficha CDC: actualizar las URLs de `cloud.google.com/...` a su destino final en `docs.cloud.google.com` — A-F1.3
- [F3] Blueprint y matriz: actualizar los títulos y textos que dicen "Cloud Composer" (p. ej. `composer-environments`) al nombre nuevo «Managed Service for Apache Airflow» cuando se redacten las fichas — gate F1
- [F2/F3] Validar `docs/contracts/api.yaml` como OpenAPI 3.1 con `openapi-spec-validator` (dependencia nueva, justificar en el commit) — A-F2.1
- ~~[F2 · A-F2.3] Mover `projection.py` a `backend/app/`~~ — hecho en A-F2.3
- ~~[F3] Mover `scripts/validate.py` a un paquete compartido (`backend/content/`)~~ — hecho en la deuda técnica de F3
- ~~[F4] Respaldo del estado personal~~ — hecho en F3 (`make backup-me` / `make restore-me`)
- [F4] Laboratorio integral de privacidad (dominio 24, ADR-027) desde `docs/briefs/privacy-program/06-laboratorio-integral-gcp.md`: el brief es un guion, no una fuente; datos ficticios y RUT según el criterio vigente — lote A (2026-10-28)
- [F4] Programar `make backup-me` (tarea programada de Windows o cron) y rotar respaldos antiguos — F3
- [F3] Resaltar HCL en los bloques de código: highlight.js no trae Terraform, así que esos snippets quedan en texto plano con Copiar — B-F3.2
- [post-F4] Dominio 07: las 9 arquitecturas que no están entre las 6 de F4, con la plantilla de arquitectura: `modern-data-warehouse-architecture`, `data-lake-architecture`, `lakehouse-architecture`, `lambda-architecture`, `kappa-architecture`, `real-time-analytics-architecture`, `iot-pipeline-architecture`, `ml-feature-pipeline-architecture` y `rag-data-pipeline-architecture` — plan de 07-architecture (2026-10-11)
- ~~[F3b · dominio 08 o 17] Tecnología `gcp-dataplex`: título al nombre Knowledge Catalog~~ — hecho el 2026-10-11: título «Knowledge Catalog», alias «Dataplex» en `tags` y `note` (el esquema no tiene campo de alias; agregarlo requiere ADR), fuente `gcp-knowledge-catalog-docs`; el slug no cambia — F3b-07a
- [F3b] Regla del §17 en fichas anteriores a 08a: 80 fichas tienen brechas (76 con slugs con ficha en el §17 que no están en `relations`; 3 con `relations` que el §17 no nombra: `airflow-operators-and-hooks`→`idempotency`, `checkpoints`→`python-file-handling`, `python-generators`→`python-comprehensions`; 5 con «pendiente de ficha» de fichas que ya existen: `dag` y `scheduler`→`catchup`, `data-mart`→`data-warehouse`, `incremental-pipelines`→`checkpoints`, `replay`→`checkpoints` y `failure-recovery`). Alinear por dominio, como cambio mínimo con historial — revisión de 08a/08b (2026-10-11)
- ~~[F3b] Corregir los avisos del chequeo del §17 (201 en 97 fichas de 01 a 09) y convertir el chequeo en error~~ — hecho (lote F3b-rel, 2026-10-14)
- [post-19] Normas sectoriales chilenas de datos (banca, CMF, Ley Fintec) como complemento del subdominio «Ingeniería de datos y Ley 21.719», con el mismo enfoque técnico y fuentes de Nivel 1 — decisión de Felipe, 2026-10-21
- ~~[post-19] `gdpr` y `lgpd` (subdominio «Marcos regulatorios» de 19): quedan en el blueprint sin ficha porque el schema no admite subdominios vacíos; escribirlas requiere un ADR que agregue las jurisdicciones UE y BR y sus fuentes legislative (EUR-Lex, Planalto) — plan de 19 (2026-10-21)~~ Hecho en el lote P4 (2026-10-30), con la Enmienda 4 de ADR-023; las fuentes legislative son el BOE (reproducción del DOUE) y la Câmara, porque EUR-Lex y Planalto bloquearon la lectura automática
- [post-19] `corporate-data-policies`: salió del blueprint de 19; se superpone con `data-ownership`, `data-retention` y `data-classification` (17) — plan de 19 (2026-10-21)
