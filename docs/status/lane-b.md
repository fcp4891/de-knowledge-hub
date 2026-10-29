# Estado · Carril B (Cursor)

Solo Carril B edita este archivo. El resumen del proyecto está en `docs/STATUS.md`; Carril A lo actualiza al mergear a `main`.

**Fase:** F3 (F2 cerrada el 2026-09-30)
**Última actualización:** 2026-10-29

## Reglas de revisión

- **Relaciones y contenido de una ficha.** La fila «Relaciones completas», y cualquier afirmación sobre lo que contiene una ficha, se verifican con un comando y el resultado se pega en la revisión. No vale una lectura a ojo.

## Reglas de worktree

- Los agentes de Cursor, incluidos Background Agents, trabajan solo en el worktree DES_conocimiento-ui o en DES_conocimiento-review y en ramas b/*. Nunca escriben en content/, nunca abren DES_conocimiento-carril-a ni la raíz DES_conocimiento y nunca hacen push a ramas a/*.

## Actual
- **Tarea activa:** revisión review-ui-privacy. Informe en `docs/reviews/ui-privacy.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuestas media: la tarjeta del marco legal volvió a salir de Inicio, y el punto completo de la banda en oscuro queda en 1.61:1.
- **Tarea activa:** `b/ui-privacy-space` (worktree `DES_conocimiento-privacy`). `/privacidad` usa el mismo layout que la ruta de dominio. Las 15 fichas tienen página. La cabecera es lo propio: Especialización, el aviso «Este contenido no es asesoría legal.» y la caja Comprender → Aplicar → Demostrar → Profundizar. Las fichas siguen con «Esta ficha no es asesoría legal.». El laboratorio es la etapa 6 deshabilitada, una sola vez. El marco legal va debajo en el panel derecho. En mock no se consulta `/me`.
- **Siguiente:** lo que asigne Felipe.
- **Bloqueos:** ninguno.
- **Tarea activa:** revisión del lote P2. Informe en `docs/reviews/p2.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuestas media: el art. 7 sin «entre otros», el art. 14 quáter con los cuatro factores, el art. 8 bis en todos los casos, el preview de Agent Search y tres diagramas LR con cadena de 6.
- **Tarea activa:** revisión del lote A. Informe en `docs/reviews/lote-a.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuesta baja: `GET /domains` sigue diciendo 23 dominios.
- **Tarea activa:** revisión de la mejora de `chile-data-protection`. Informe en `docs/reviews/cdp-v2.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuesta media: la letra g) del art. 2 no dice «entre otros». Propuesta baja: la letra l) pide medidas técnicas y organizativas.
- **Tarea activa:** B-F3.1 del lote F3b-22a. Revisión en `docs/reviews/cards-f3b-22a.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuestas bajas: el `page_title` de time travel de Fabric y el preview de esa página; el §12 y el §13 de `modern-data-stack` sin «Según».
- **Tarea activa:** B-F3.1 del lote F3b-22b. Revisión en `docs/reviews/cards-f3b-22b.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuesta media: «Amazon Quick Sight» no es la formulación de la página. Propuesta baja: el título de Mirroring.
- **Tarea activa:** revisión de la mejora de `pii-identification`. Informe en `docs/reviews/pii-v2.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuesta baja: «combinación de columnas» no va dentro de la obligación del art. 2.
- **Tarea activa:** B-F3.1 del lote F3b-21d. Revisión en `docs/reviews/cards-f3b-21d.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Sin propuestas. El renombre de Agent Search queda en curso, como dice su página.
- **Tarea activa:** B-F3.1 del lote F3b-21c. Revisión en `docs/reviews/cards-f3b-21c.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuesta media: las rúbricas estáticas de Agent Platform puntúan, no son aprobado o reprobado. El lote 21d va en otra rama.
- **Tarea activa:** B-F3.1 del lote F3b-21a. Revisión en `docs/reviews/cards-f3b-21a.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuesta media: la tabla de renombres no tiene «Vertex AI» → «Agent Platform». El lote 21b va en otra rama.
- **Tarea activa:** B-F3.1 del lote F3b-21b. Revisión en `docs/reviews/cards-f3b-21b.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Sin propuestas. Las cifras citadas coinciden con la página y las fichas enlazadas solo suman la relación.
- **Tarea activa:** B-F3.1 del lote F3b-21e. Revisión en `docs/reviews/cards-f3b-21e.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuesta baja: el §16 de `ai-error-analysis` deja «preview» solo en Gemini Cloud Assist.
- **Tarea activa:** `b/ui-labels-diagrams`. «Obligación legal» es «art. N» en superíndice, o «Ley 21.663, art. 9» si la ley no es la 19.628. El enlace va a la fila de Base legal, que se resalta al llegar, y el tooltip muestra el `note` del artículo. «Decisión de arquitectura» sigue siendo el punto con leyenda. En el mapa de artículos, «Ficha» y «Etiqueta» no se muestran: la ficha aparece al pasar el cursor sobre el artículo. El menú tiene «Página del autor» y el dominio de la miga va en azul. Los diagramas Mermaid quedan a 14px, con scroll horizontal, botón «Ampliar» y los colores de `tokens.css`.
- **Tarea activa:** `b/ui-legal` (ADR-023 y ADR-024). «Implicancia técnica» lee `legal_basis.implication`. La padre lista «Fichas de esta ruta» en el orden de estudio de `ley21719`. Cada hija muestra «Parte de: …» hacia la padre. `PART_OF` no se repite en la lista de relaciones.
- **Tarea activa:** B-F3.1 del upgrade de 19. Revisión en `docs/reviews/cards-f3b-19-upgrade.md`. No se editó `content/` ni `frontend/`. Los pedidos 19a–19d quedan anulados.
- **Siguiente:** Esperar la aprobación de Felipe. Propuestas altas: el art. 49 no es obligación, el mínimo de 2 en gold, y el registro de vulneraciones no se lleva si no se reporta. Propuestas media: «la más gravosa entre», una etiqueta por artículo, y los 24 h solo si además hay servicios esenciales afectados.
- **Última actualización de esta entrada:** 2026-10-24. `scripts/validate.py` OK (588 entidades). El boletín, al 2026-10-24, sigue en discusión inmediata.
- **Tarea activa:** B-F3.1 del lote F3b-18c. Revisión en `docs/reviews/cards-f3b-18c.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Sin propuestas. La bóveda de `tokenization` es un dict, como pide el pedido (biblioteca estándar).
- **Tarea activa:** B-F3.1 del lote F3b-18b. Revisión en `docs/reviews/cards-f3b-18b.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuesta media: citar «Avoid passing secrets to your application through the file system or through the environment variables». Propuesta baja: la rotación automática de AWS KMS es opcional.
- **Tarea activa:** B-F3.1 del lote F3b-18a. Revisión en `docs/reviews/cards-f3b-18a.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuesta media: `GRANT ALL` en PostgreSQL 17 también concede `MAINTAIN`, y el conteo de 21 no lo incluye.
- **Tarea activa:** B-F3.1 del lote F3b-17a. Revisión en `docs/reviews/cards-f3b-17a.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Sin propuestas. El lote 17b va en otra rama.
- **Tarea activa:** B-F3.1 del lote F3b-17b. Revisión en `docs/reviews/cards-f3b-17b.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuesta media: citar «Assign at least two people as governance domain owners». El lote 17a está en `b/f3b-review-17a`.
- **Tarea activa:** B-F3.1 del lote F3b-16a. Revisión en `docs/reviews/cards-f3b-16a.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuesta media: el renombre de Cloud Composer sigue en curso. El lote 16b va en otra rama.
- **Tarea activa:** B-F3.1 del lote F3b-16b. Revisión en `docs/reviews/cards-f3b-16b.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Sin propuestas. El lote 16a está en `b/f3b-review-16a`.
- **Tarea activa:** B-F3.1 del lote F3b-15a. Revisión en `docs/reviews/cards-f3b-15a.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuesta baja: la fecha del §12 en `spark-structured-streaming`. El lote 15b va en otra rama.
- **Tarea activa:** B-F3.1 del lote F3b-15b. Revisión en `docs/reviews/cards-f3b-15b.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Sin propuestas. El lote 15a está en `b/f3b-review-15a`.
- **Tarea activa:** B-F3.1 del lote F3b-20a. Revisión en `docs/reviews/cards-f3b-20a.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuestas media: sufijos de EMR en `spark-execution-model` y el enlace a `dbt-core-concepts` en el panorama. El lote 20b va en otra rama.
- **Tarea activa:** B-F3.1 del lote F3b-20b. Revisión en `docs/reviews/cards-f3b-20b.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuestas media: Athena y Databricks sí nombran el otro formato; el §11 de dbt nombra solo páginas de Dataform; Trino y Flink sin página en la comparación. El lote 20a está en `b/f3b-review-20a`.
- **Tarea activa:** B-F3.1 del lote F3b-14a. Revisión en `docs/reviews/cards-f3b-14a.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuestas media: *Class Message* está en 2.43.0 y Pub/Sub no cobra transferencia entre zonas. El lote 14b va en otra rama.
- **Tarea activa:** B-F3.1 del lote F3b-14b. Revisión en `docs/reviews/cards-f3b-14b.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Sin propuestas. El lote 14a está en `b/f3b-review-14a`.
- **Bloqueos:** ninguno. `make` no está en el PATH; `scripts/validate.py` con `.venv` terminó OK (492 entidades).
- **Tarea activa:** B-F3.1 del lote F3b-13a. Revisión en `docs/reviews/cards-f3b-13a.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuestas: el mínimo de 1 minuto de Fargate (media); el redondeo hacia arriba de Cloud Run y la cita completa de la caché de Docker (baja). El lote 13b va en otra rama.
- **Tarea activa:** B-F3.1 del lote F3b-13b. Revisión en `docs/reviews/cards-f3b-13b.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuestas media: 1.37.1 frente a los esquemas 1.37.0, AWS CLI 2.38.2 y el mínimo de 1 minuto de Fargate. Propuesta baja: el redondeo hacia arriba de Cloud Run. El lote 13a está en `b/f3b-review-13a`.
- **Bloqueos:** ninguno. `make` no está en el PATH; `scripts/validate.py` con `.venv` terminó OK (476 entidades).
- **Tarea activa:** B-F3.1 del lote F3b-12a. Revisión en `docs/reviews/cards-f3b-12a.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Sin propuestas. El lote 12b va en otra rama.
- **Bloqueos:** ninguno. `make` no está en el PATH; `scripts/validate.py` con `.venv` terminó OK (460 entidades).
- **Tarea activa:** B-F3.1 del lote F3b-12b. Revisión en `docs/reviews/cards-f3b-12b.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Sin propuestas. El lote 12a está en `b/f3b-review-12a`.
- **Bloqueos:** ninguno. `make` no está en el PATH; `scripts/validate.py` con `.venv` terminó OK (460 entidades). Terraform no está en el PATH local; el apply sin nube se comprobó en el código del test.
- **Tarea activa:** `b/rules-lanes`. Regla de worktree y ramas para los agentes de Cursor. Sin merge a `main`.
- **Siguiente:** lo que asigne Felipe.
- **Bloqueos:** ninguno.
- **Tarea activa:** B-F3.1 del lote F3b-rel. Revisión en `docs/reviews/f3b-rel-sample.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Sin propuestas. Los lotes 11a y 11b van en otras ramas.
- **Tarea activa:** B-F3.1 del lote F3b-11a. Revisión en `docs/reviews/cards-f3b-11a.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Sin propuestas. El lote 11b va en otra rama.
- **Tarea activa:** B-F3.1 del lote F3b-11b. Revisión en `docs/reviews/cards-f3b-11b.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuesta media: citar «services and worker pools—not jobs» en `deployment-strategies`. El lote 11a está en `b/f3b-review-11a`.
- **Bloqueos:** ninguno. `make` no está en el PATH; `scripts/validate.py` con `.venv` terminó OK (451 entidades).
- **Tarea activa:** B-F3.1 del lote F3b-10a. Revisión en `docs/reviews/cards-f3b-10a.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuestas media: el panorama nombra once fichas fuera de `relations`; Azurite no cita el namespace ni el endpoint `dfs`; `athena-serverless-queries` y `bigquery-slots` faltan en `relations`. El lote 10b va en otra rama.
- **Tarea activa:** B-F3.1 del lote F3b-10b. Revisión en `docs/reviews/cards-f3b-10b.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuestas media: las deny policies de IAM en `entra-id-for-data`, la rotación de secretos en `key-vault-secrets`, y el costo de Functions y de Container Apps sin página de precios. El lote 10a está en `b/f3b-review-10a`.
- **Bloqueos:** ninguno. `make` no está en el PATH; `scripts/validate.py` con `.venv` terminó OK (418 entidades).
- **Tarea activa:** B-F3.1 del lote F3b-09b. Revisión en `docs/reviews/cards-f3b-09b.md`. No se editó `content/` ni `frontend/`.
- **Siguiente:** Esperar la aprobación de Felipe. Propuesta media: en `step-functions-workflows`, `cloudwatch-for-data-pipelines`, `bedrock-for-data-engineers` y `sagemaker-for-data-engineers`, decir en qué difieren de GCP. El lote 09a está en `b/f3b-review-09a`.
- **Bloqueos:** ninguno. `make` no está en el PATH; `scripts/validate.py` con `.venv` terminó OK (389 entidades).
- **Tarea activa:** `b/ui-aliases` (ADR-010), en origin. Sin merge a `main`.
- **Siguiente:** lo que asigne Felipe.
- **Tarea activa:** `b/ui-page-title` (ADR-012). Sin merge a `main`.
- **Siguiente:** lo que asigne Felipe. Sigue abierta la revisión F3b-08c.
- **Bloqueos:** ninguno.

### Revisión · review-ui-privacy
- `/privacidad` usa la ruta de dominio. El objetivo 7 y la banda fuera de las 6 capas coinciden con el test. Propuestas media: devolver a Inicio la tarjeta leída de `legal_framework`, y no usar `#E4C0EA` como fondo de texto blanco. No se editó `content/` ni `frontend/`.

### Título de página en las citas (`b/ui-page-title`)
- El enlace de cada cita es `page_title`. La línea secundaria, en texto muted, es «título del registro · Nivel N». Si `page_title` es null, el enlace muestra la ruta de la URL. Igual en la §20 de la ficha y en `SourceList`.
- Cliente tipado regenerado. `make test-frontend`: 13/13. En la demo estática, `bigquery-partitioning` §20 muestra las 5 citas de BigQuery con títulos distintos.
- No se editó `content/` ni el contrato.

### Alias (`b/ui-aliases`)
- MiniSearch indexa `aliases` con el mismo boost que `title`. Cliente tipado regenerado: `ConceptDetail` y `TechnologyDetail` traen `aliases`.
- Si hay alias, bajo el título: «También conocido como: …» (ficha de concepto y página de tecnología).
- `make test-frontend`: 11/11. En la demo estática, «Dataplex» encuentra Knowledge Catalog y la ficha `gcp-dataplex` muestra los dos alias.
- No se editó `content/` ni el contrato.

### Revisión · lote P2
- Cuatro fichas nuevas del dominio 24. Las salidas de la CI coinciden y OWASP y el NIST AI RMF no aparecen. Propuestas media en las notas del art. 7, el art. 14 quáter, el art. 8 bis y el preview de Agent Search. No se editó `content/` ni `frontend/`.

### Revisión · lote A
- ADR-027, migración 0007 y el marco legal. La vigencia 2026-12-01 y el boletín 18.623-07 coinciden con BCN y el Senado. Propuesta baja en el contrato. No se editó `content/` ni `frontend/`.

### Revisión · cdp-v2
- Mejora de `chile-data-protection`. `legal_basis`, vigencia, boletín, sanciones y los diagramas no cambian. Propuesta media: completar la letra g) del art. 2. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-22a
- Seis fichas de prácticas modernas. `finops-for-data` usa la FinOps Foundation solo para las fases. Propuestas bajas: el título de time travel de Fabric y el §12 y el §13 del mapa. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-22b
- Cuatro fichas de activación y acceso. Dataverse queda en Upsert y el filtro de `postgres_fdw` está en el test. Propuesta media: la formulación de Amazon Quick. No se editó `content/` ni `frontend/`.

### Revisión · pii-v2
- Mejora de `pii-identification`. La lista del art. 2 g) coincide con BCN. Propuesta baja: sacar «combinación de columnas» de la obligación legal. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-21d
- Cinco fichas de casos de uso. Agent Search sigue en renombre, el Web Crawler no admite conectores nuevos desde el 2026-09-30 y Purview no trata las descripciones generadas. Sin propuestas. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-21c
- Cinco fichas de sistemas con IA. `llm-agents` y `multi-agent-systems` dicen cuándo no conviene usarlos. Propuesta media: las rúbricas estáticas no son aprobado o reprobado. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-21a
- Siete fichas de fundamentos de modelos. Long context es 1 millón de tokens y Nova Pro es 300K / 10K. Propuesta media: quitar el renombre «Vertex AI» → «Agent Platform». No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-21b
- Seis fichas de recuperación. RAG Engine usa 1024 y 256; Azure, 512 tokens con 25 %; el hybrid de Bedrock queda en Amazon RDS, OpenSearch Serverless y MongoDB. Sin propuestas. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-21e
- Cuatro fichas emergentes. El límite de 600 restricts es de Knowledge Catalog. Propuesta baja: no llamar preview a Glue ni a Copilot. No se editó `content/` ni `frontend/`.

### B-F3.1 · upgrade de 19
- Once fichas de ingeniería de datos y Ley 21.719. El boletín y el mensaje N° 110-374 coinciden con la página del Senado. Hallazgos altos: el art. 49 etiquetado como obligación, el mínimo de 2 en gold, y el registro «aunque no se reporte». No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-18c
- Cuatro fichas de técnicas de privacidad. Lo seudonimizado sigue siendo datos de personas y la anonimización no se declara irreversible. El HMAC sin la clave no se revierte. La bóveda es un dict, con el mapeo separado. Sin propuestas. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-18b
- Cinco fichas de cifrado y secretos. AES-GCM, el TLS y los plazos de destrucción coinciden con sus páginas. Propuesta media: Secret Manager dice «Avoid passing secrets». Propuesta baja: la rotación anual de AWS KMS es el período por defecto, una vez activada. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-18a
- Ocho fichas de control de acceso. RLS, Azure ABAC y el enmascaramiento coinciden con sus páginas. La cuenta 21 / 3 / 18 es la del test. Propuesta media: `MAINTAIN` queda fuera de ese conteo. `gcp-iam-for-data` solo enlaza. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-17a
- Cinco fichas de catálogo, linaje, retención y ciclo de vida. OpenLineage escribe a un archivo. La retención no asesora y solo nombra las regulaciones de la página. DataZone y SageMaker Catalog no se presentan como reemplazo. `dataplex-governance` solo enlaza. No se editó `content/` ni `frontend/`.
### B-F3.1 · lote F3b-17b
- Cuatro fichas de dueños, stewards, dominios y clasificación. Los regex son heurística. Knowledge Catalog no define un rol de steward en la página citada. Propuesta media: Purview dice asignar al menos dos owners, no recomendarlo. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-16a
- Siete fichas de observabilidad. Lo ejecutado está en el test, con exporters en memoria. `volume-anomalies` no es ML. `data-observability` se separa de data quality. `python-logging` solo enlaza. Propuesta media: varias fichas dan por hecho el renombre de Cloud Composer. No se editó `content/` ni `frontend/`.
### B-F3.1 · lote F3b-16b
- Seis fichas de salud, SLA, SLO, alertas e incidentes. Airflow 3.3.2 cita el reemplazo del SLA. La aritmética del SLO cierra. Incident Manager y el título de Microsoft coinciden con sus páginas. El libro de SRE no respalda productos. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-15a
- Cuatro fichas de calidad. Las seis dimensiones de DAMA UK salen del marco de GOV.UK. Knowledge Catalog, Glue y Purview quedan en tablas con su página. Los textos ejecutados están en el test. La nota de EMR 7.14.0 cita la columna completa. Propuesta baja: la fecha del §12 en `spark-structured-streaming`. No se editó `content/` ni `frontend/`.
### B-F3.1 · lote F3b-15b
- Cuatro fichas de tests, assertions, GX y WAP. Lo ejecutado está en el test. GX 1.24.0 cita el nombre de la guía y el del paquete. Publish no se ejecuta. Dataform, BigQuery y Redshift coinciden con sus páginas. `dbt-core-concepts` solo enlaza. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-20a
- Cuatro fichas del open data stack. Pub/Sub no se presenta como Kafka. `min.insync.replicas` se cita y no se ejecuta; la compactación sí. La decodificación lógica queda sin ejecutar porque la CI corre con `wal_level=replica`. Spark en EMR es 3.5.8-amzn-0. Propuestas media: los sufijos de Hadoop, Iceberg, Delta y Hudi, y enlazar `dbt-core-concepts`. No se editó `content/` ni `frontend/`.
### B-F3.1 · lote F3b-20b
- Tres fichas de formatos de tabla y dbt. Iceberg, Delta y Hudi no se presentan como equivalentes. Delta y Hudi quedan sin ejecutar. Las versiones de ADR-018 coinciden con requirements-snippets. `bigquery-biglake-tables` solo enlaza. Propuestas media: lo que dicen Athena y Databricks, la fuente de dbt en el §11, y Trino y Flink. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-14a
- Siete fichas de streaming. Seis bloques corren contra Kafka 4.3.1 en Docker; `delivery-semantics` es una simulación en Python y así lo dice. Propuestas media: el `page_title` de *Class Message* (2.43.0) y la transferencia de Pub/Sub, que no cobra entre zonas. No se editó `content/` ni `frontend/`.
### B-F3.1 · lote F3b-14b
- Siete fichas de tiempo, estado y motores. Los bloques PySpark están en el test; PyFlink dice no ejecutado. Exactly-once queda por componente y la watermark de Spark no promete descartar lo tardío. Flink va en la URL de la 2.3. Las fichas verified solo enlazan. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-13a
- Cinco fichas de contenedores. Los textos que la ficha dice ejecutados están en `tests/test_docker_snippets.py`. OCI queda en la definición de imagen. Propuestas: mínimo de 1 minuto en Fargate, redondeo hacia arriba en Cloud Run y la cita de la caché con «as well». No se editó `content/` ni `frontend/`.
### B-F3.1 · lote F3b-13b
- Cuatro fichas de Compose, registries, Kubernetes y plataformas. Compose y el tag mutable están en el test de Docker. Los manifiestos dicen validados con kubeconform y no aplicados. Serverless y Kubernetes administrado quedan separados. Propuestas: el parche 1.37.1, AWS CLI 2.38.2, el mínimo de Fargate y el redondeo de Cloud Run. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-12a
- Cuatro fichas de Terraform en uso. El apply sin nube, cfn-lint, `bicep build` y las frases de sensitive, workspaces y Bicep, comprobados contra los tests y las páginas. No se editó `content/` ni `frontend/`.
### B-F3.1 · lote F3b-12b
- Cuatro fichas: drift, secretos, CloudFormation y Bicep. El test aplica el drift con `-detailed-exitcode` y deja el secreto `sensitive` en el state y el `ephemeral` fuera. El bloque de AWS queda validado y sin aplicar. cfn-lint y `bicep build` no despliegan. Las cuatro fichas verificadas solo agregan los enlaces previstos. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-rel
- Muestra de 10 fichas del ajuste del §17. El diff de `b9a8ed6` solo toca `relations`, el §17 y una línea de historial. Las relaciones nuevas y las exclusiones coinciden con el texto. No se editó `content/` ni `frontend/`.
### B-F3.1 · lote F3b-11a
- Siete fichas de Git y CI. Fuentes de nivel 1, la guía de Google solo en lo conceptual, Git y pytest en la CI, workflows con actionlint y sin ejecutar, y CodeCommit sin cambio de estado, comprobados por comando y contra sus páginas. No se editó `content/` ni `frontend/`.
### B-F3.1 · lote F3b-11b
- Seis fichas de entrega. El canary de Cloud Deploy, la redacción de secretos, el SHA de la acción de auth, Argo CD 3.5 y Flux 2.9, comprobados contra sus páginas. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-10a
- Siete fichas de analítica en Azure. Fuentes de nivel 1, §14, citas de Fabric y Synapse sin deprecación, Blob contra Azurite en la CI, y la regla del §17, comprobados por comando y contra sus páginas. No se editó `content/` ni `frontend/`.
### B-F3.1 · lote F3b-10b
- Siete fichas de cómputo, gobierno e IA en Azure. Fuentes de nivel 1, §14, alias de Entra ID y de Microsoft Foundry, CDC y Batch API en la CI, y la regla del §17, comprobados por comando y contra sus páginas. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-09a
- Ocho fichas de almacenamiento, analítica y streaming en AWS. Fuentes de nivel 1, §14, Firehose del 9 de febrero de 2024, PutRecords sin orden garantizado y el código de moto en la CI, comprobados por comando y contra sus páginas. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-09b
- Ocho fichas de orquestación, cómputo, gobierno, operación e IA en AWS. Fuentes de nivel 1, §14, SageMaker AI del 3 de diciembre de 2024, MWAA 3.3.1 frente a la CI en 3.3.2, y el código de moto en la CI, comprobados por comando y contra sus páginas. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-08c
- Siete fichas de procesamiento, orquestación y servicios. Fuentes de nivel 1, §14, código con lo ejecutado y lo no ejecutado, y la regla del §17, comprobados por comando. `validate` en verde. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-08b
- Ocho fichas de gobierno y operación. Fuentes Nivel 1, §14, GoogleSQL «no ejecutado», policy tags vigentes en la API de Data Catalog, y la tabla de clases de Cloud Storage sin precios, comprobados por comando y contra sus páginas. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-08a
- Ocho fichas de BigQuery. Fuentes Nivel 1, §14, GoogleSQL «no ejecutado» y precios ilustrativos comprobados por comando. La tabla de ediciones no coincide con la página en la celda de on-demand. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-07a
- Dos fichas de `07-architecture`: `data-mesh` y `data-products`. Felipe aprobó todas las filas el 2026-10-11, incluidas las dos propuestas: §11 alineado al aviso de Knowledge Catalog, con las bibliotecas cliente; en `data-mesh`, citar Getting started y Teams and interactions, y nombrar hub-and-spoke en el §1. No se editó `content/` ni `frontend/`.

### Fuentes locales (`b/ui-fonts-local`)
- IBM Plex Sans (400–700), Source Serif 4 (400–600) y JetBrains Mono (400–500) van en `frontend/fonts/` como woff2 latino y se cargan con `next/font/local`. El build ya no llama a Google. `next/font` las publica en `_next/static/media`, con `BASE_PATH` en el export estático.
- Las tres son OFL 1.1: `frontend/fonts/ibm-plex-sans/OFL.txt` (IBM, nombre reservado «Plex»), `frontend/fonts/source-serif-4/OFL.txt` (Adobe, nombre reservado «Source») y `frontend/fonts/jetbrains-mono/OFL.txt` (JetBrains Mono Project Authors). No se renombró la fuente.
- Lint y los dos builds en verde con el proxy de red cerrado, así que no dependieron de descargar fuentes.

### B-F3.1 · lote F3b-06a
- Ocho fichas de `06-orchestration`, tabla de §48. Felipe aprobó todas las filas el 2026-10-11, incluida la propuesta: Python 3.11.8 en el paso 2 del ejemplo de `open-source-vs-managed-orchestration`. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-05a
- Seis fichas de `05-pipelines`, tabla de §48. Felipe aprobó todas las filas el 2026-10-11, incluidas las tres propuestas: al menos tres capas y bucket de landing en AWS; los dos patrones de Fabric y un workspace por lakehouse; Eventarc distinto de las notificaciones de Cloud Storage a Pub/Sub. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-04a
- Diez fichas de `04-data-modeling`, tabla de §48. Felipe aprobó todas las filas el 2026-10-10, incluida la reclasificación del quickstart de Snowflake a Nivel 3. Para `data-vault`: Data Vault Alliance como N4 canónico solo para lo conceptual (hubs, links, satélites, hash), mismo criterio que Kimball Group; Microsoft Learn (N1) para el uso en plataforma; la guía de Snowflake no sostiene afirmaciones. No se editó `content/` ni `frontend/`.

### Fila de una celda (`b/ui-polish-3`)
- En `frontend/lib/markdown.ts`, `isTableRow` ya no exige dos celdas: `| 1 |` sigue dentro de la tabla, como en GFM. El separador de columnas no cambia (sigue pidiendo al menos dos).
- Se quitó el `todo` del test en `tests/frontend/markdown.test.ts`. `make test-frontend`: 10/10.
- No se editó `content/` ni el contrato. Ninguna ficha tiene ese caso.

### B-F3.1 · lote F3b-03b
- Once fichas de `03-python`, tabla de §48. Felipe aprobó todas las filas el 2026-10-09, incluidas las tres propuestas: mypy explícito en `pyspark-dataframes`; citar la página de comparación para el nombre anterior de Dataproc y quitar «el mismo código de PySpark corre en las dos modalidades»; en `python-concurrency`, publicar solo los 0.5 s medidos en esta máquina. No se editó `content/` ni `frontend/`.

### B-F3.1 · lote F3b-03a
- Diez fichas de `python-core`, tabla de §48. Felipe aprobó todas las filas el 2026-10-08, incluidas las cuatro propuestas: `/3.12/` en lo ejecutado y `/3/` solo para el `SyntaxWarning` del `finally`; `os.replace` atómico si tiene éxito y puede fallar entre sistemas de archivos; sin la frase de Cloud Storage en `python-context-managers`; retorno de `pares` en el §7 de `python-generators`. No se editó `content/` ni `frontend/`.

### JSON en `change-detection`
- Felipe aprobó todas las filas el 2026-10-08, incluida la propuesta: §10 con `FARM_FINGERPRINT(TO_JSON_STRING(STRUCT(...)))` como vía principal y `CONCAT` con marcador como alternativa; §2 y el comentario de BigQuery coherentes; §6 acotada a la concatenación; §20 con las dos fuentes JSON. No se editó `content/` ni `frontend/`.

### Tablas Markdown (`b/ui-polish-2`)
- El parser de `frontend/lib/markdown.ts` (el mismo en hybrid y static) reconoce tablas GFM, listas de tareas, tachado (`~~`) y enlaces automáticos (`https`, `www`, `<url>`, correo). No se añadió `remark-gfm`.
- La tabla va en `.markdown-table-wrap`: borde `var(--border)`, encabezado en negrita, padding 8px 12px y scroll horizontal si no cabe.
- En `content/` hay tablas en varias fichas SQL (unnest, subqueries, structs, recursive CTE, quality checks, window functions, surrogate keys) y en «Qué es Data Engineering». No se editó `content/`.
- Verificado en Chrome normal, export estático bajo `/DES_conocimiento/`: roles en `/concepts/what-is-data-engineering/` (sección 2), ejemplo en `/concepts/sql-window-functions/` y la tabla de 7 columnas de `/concepts/surrogate-key-generation/` a 375 px (scroll dentro del contenedor, padding 8px 12px). Listas de tareas, tachado y autolinks no aparecen en el contenido; el parser los acepta.
- Lint, `npm run build` y `npm run build:static` en verde. `dynamicParams` sigue en `true` y `personalActions.ts` sigue con `"use server"`.

### Ajustes UI · paneles, mapa e índice
- El índice de la ficha salía vacío (un punto y un hueco) porque vivía en un `<details>` cerrado. En Chrome el contenido de un `<details>` cerrado no se pinta, aunque el CSS fuerce `display`, y el marcador del resumen queda como un punto mientras la columna del grid sigue reservando 200–250 px. Ahora el índice es un `<nav>` real. Si se oculta, `display: none` y la columna desaparece.
- El menú de escritorio se contrae a 64 px (`dekh:nav` en `localStorage`). Cada ícono tiene `aria-label` y `title`. `[` lo alterna fuera de los campos de texto. «Tu estudio» se oculta con un botón (`dekh:study`); la lectura queda centrada y llega a su máximo de 70ch.
- El itinerario cabe en 320 px. Desde 1280 px las estaciones del mapa se adaptan al ancho y ninguna capa, Transversal incluida, muestra scroll horizontal. El scroll sigue en pantallas más estrechas.
- Se regeneró `frontend/public/data/` (269 entidades, 1020 respuestas) porque `main` ya traía la revisión de NULL. **No se versiona.** No se editó `content/` ni `backend/`.
- Verificado en Chrome normal, export estático bajo `/DES_conocimiento/`: a 1440, 1280 y 1024 el itinerario mide 320 px y la página no desborda; a 1440 y 1280 el mapa no hace scroll; a 1024 y 375 las capas largas sí. En Idempotencia el índice mide 250 px y lista secciones; al ocultarlo el artículo pasa de x=538 a x=256. Al ocultar el estudio, el bloque de lectura queda en 630 px, que es el 70ch calculado. El menú colapsa a 64 px, recuerda el estado y `[` lo vuelve a abrir. A 375 el botón de contraer no se muestra y sigue el de «Menú».
- Lint, `npm run build` y `npm run build:static` con `BASE_PATH=/DES_conocimiento` en verde. `dynamicParams` sigue en `true` y `personalActions.ts` sigue con `"use server"`.

### Rediseño UI · commit 5 (cierre)
- `make` no está en el PATH de Windows. Se creó `.venv` con `py -3.12` (la receta de `make venv`) y se regeneró `frontend/public/data/` con `validate` y `scripts.static.build_static_data` (la receta de `make static-data`): 1020 respuestas. **`public/data/` no se versiona.** No se editó `content/` ni `backend/`.
- Con esos datos, Schema evolution tiene ficha. Desde Idempotencia, «Siguiente en la ruta» abre «Evolución de esquema».
- Accesibilidad: enlace «Saltar al contenido», foco visible, trampa de Tab en la búsqueda y retorno del foco al botón que la abrió, Escape cierra el menú móvil, la barra de lectura es `progressbar`, objetivos y botones de nota y de copiar código llegan a 44 px, y el índice cerrado en pantallas estrechas sale del árbol de accesibilidad. `prefers-reduced-motion` deja el scroll en `auto`.
- En `hybrid`, las fichas y las rutas se renderizan en cada pedido (`dynamic = "force-dynamic"`). Sin eso, `next start` respondía 500: la página se había prerenderizado y el `no-store` de la API la volvía dinámica. El build estático quita esa línea y sigue exportando. `dynamicParams` queda en `true` y `personalActions.ts` sigue con `"use server"`.
- El `hybrid` no usa `BASE_PATH` (solo el export estático). Se probó en `http://127.0.0.1:3010/`. La búsqueda de ese servidor no llegó a la API: CORS solo admite `http://localhost:3000` y ese puerto lo ocupa el servidor del otro worktree. La API sí responde (`bigquery` devuelve resultados). En estático la búsqueda es local y sí se probó.
- No se editó `content/` ni el contrato.

Verificado en Chrome normal (no el navegador del IDE), a 1440 px y a 375 px:

- **Inicio.** Elegir «Empiezo desde cero» marca el objetivo, numera el itinerario con el color oscuro de cada capa y el botón dice «Empezar por Fundamentos». Volver a pulsarlo deja el mapa neutro: sin números y sin atenuar. A 1440 el mapa no desborda. A 375 la página no desborda, las capas largas hacen scroll dentro de la fila y los objetivos superan 44 px.
- **Ruta** (`/explorer/pipelines`). Una ficha pendiente es un `div` y dice «Ficha pendiente». Hay siguiente recomendado. Sin repasos, la píldora no está. Sin scroll horizontal a 1440 ni a 375.
- **Ficha** (Idempotencia). El índice resalta Resumen. Flecha derecha pasa a AWS y Fin a Azure. El progreso queda en `dekh:reading:idempotency` y sigue al recargar. La ficha siguiente existe. A 375 el índice cerrado no ocupa el árbol y la página no desborda.
- **Repaso.** La página carga, sin scroll horizontal a 375.
- **Búsqueda.** En estático, «bigquery» devuelve resultados, Tab no sale del diálogo y Escape lo cierra y devuelve el foco a «Buscar». Ctrl no hizo falta: el botón abre el mismo diálogo. El salto «Saltar al contenido» recibe el primer Tab. A 375, Escape cierra el menú y devuelve el foco a «Menú».
- **Contraste.** Texto principal por encima de 4.5:1. El objetivo activo, medido en `hybrid`, queda en 12.22:1 (descripción) y 8.73:1 (meta).
- Lint, `npm run build` y `npm run build:static` con `BASE_PATH=/DES_conocimiento` en verde.

### Rediseño UI · commit 1 (tokens, fuentes, layout y menú)
- `docs/design/handoff-ui/` versionado (README, `tokens.css`, `learning-paths.ts` y maquetas). `tokens.css` copiado a `frontend/styles/tokens.css` e importado en el layout raíz.
- Fuentes IBM Plex Sans, Source Serif 4 y JetBrains Mono con `next/font/google`: se descargan al compilar y se sirven desde `_next/static/media`, sin pedidos a Google en tiempo de ejecución (sirve igual en la demo de cPanel). `--font-ui`, `--font-read` y `--font-code` apuntan a esas fuentes.
- `SiteHeader` reemplazado por `SideNav`: menú lateral desde 1024 px y barra superior con botón «Menú» (`aria-expanded`) por debajo. Enlaces Inicio · Rutas (`/explorer`) · Repaso · Snippets, con `aria-current`, y Buscar (Ctrl K) que abre la búsqueda existente. **Se quitó la lista de dominios del menú.**
- Contador de Repaso: en `hybrid`, `total` de `GET /me/study-state?state=needs_review` en el layout; en `static`, desde `localStorage` (`dekh.personal`), actualizado al cambiar. Se oculta si es 0.
- Página `/repaso`: conceptos en «Necesita repaso», del estudiado hace más tiempo al más reciente, con dominio y «Hace N días» desde `last_studied_at`, y un estado vacío. En `static` la lista se arma en el navegador con el catálogo de conceptos del build.
- Las vistas existentes siguen con sus estilos: las variables anteriores (`--text`, `--muted`, `--line`) son alias de los tokens nuevos, y `--accent` toma el valor nuevo. Foco visible global.
- Verificado: lint, `npm run build` y `npm run build:static` con `BASE_PATH=/DES_conocimiento` en verde. En Edge headless, sobre el build estático: menú lateral a 1440 px, barra y menú desplegable a 375 px sin scroll horizontal, y contador y lista de Repaso con un concepto marcado en `localStorage`. Falta probar en Chrome normal (criterio del README; queda para el commit 5).

### Rediseño UI · commit 2 (Inicio)
- `/` sigue la pantalla 1: fecha, «¿Qué quieres hacer hoy?», tarjeta «Continuar donde quedaste» (el concepto *Revisando* con `last_studied_at` más reciente; en `static`, desde `localStorage`), los 6 objetivos, el itinerario y el mapa. Se quitaron las secciones vacías del inicio anterior.
- El objetivo se guarda en `localStorage` (`dekh:goal`). Volver a pulsarlo lo deselecciona y el mapa queda neutro: sin números de paso y sin atenuar. Los números del itinerario usan el color `dark` de su capa. El botón dice «Empezar por » más el nombre corto, con espacio, y enlaza a `/explorer/<slug>`.
- El mapa arma cada estación con sus dos segmentos (sin posiciones absolutas). La grilla es `minmax(92px, 1fr)` y, si no cabe, hace scroll dentro de la fila. «x/y fichas» sale de `concept_count` y de `has_page` en el listado de conceptos. El subdominio de «Continuar» sale del detalle de dominio; el contrato no lo trae en el resumen del concepto.
- La línea «Ibas en la sección N de 22» se lee de `dekh:reading:<slug>` si ya existe. La escribe la ficha (commit 4), con el número de la mayor sección vista, su título y la fecha. Si no está, esa línea y la barra no aparecen.
- No se editó `content/` ni el contrato.
- Verificado: lint, `npm run build` y `npm run build:static` con `BASE_PATH=/DES_conocimiento` en verde. Sobre el export estático, a 1440 px y a 375 px: deseleccionar el objetivo quita números y atenuado; los números del itinerario usan el color oscuro de la capa; el botón es «Empezar por DevOps»; el mapa no desborda la página y las capas largas hacen scroll dentro de la fila. Falta probar en Chrome normal (queda para el commit 5).

### Rediseño UI · commit 3 (ruta de dominio)
- `/explorer/[slug]` reemplaza el listado con filtros por la ruta de la pantalla 2: migas, «Buscar en este dominio», cabecera y la ruta vertical. Las etapas salen en el orden de los subdominios. Dentro de cada una, los conceptos van de básico a avanzado y, en el mismo nivel, en el orden del blueprint.
- Un concepto con `has_page: false` no es enlace y dice «Ficha pendiente». El siguiente recomendado es el primer concepto con ficha que no está `understood` ni `applied`. Si todos los que tienen ficha están en uno de esos dos estados, la tarjeta dice «Dominio completo» y, si hay un objetivo activo, enlaza al dominio siguiente de ese objetivo.
- La píldora «N para repasar» solo aparece si hay conceptos en `needs_review`. «~N min» sale de las palabras de la ficha (palabras / 200); si la ficha no tiene texto, no se muestra.
- No se editó `content/` ni el contrato.
- Verificado: lint, los dos builds en verde. En el export estático de Pipelines: el orden de etapas y de Ingesta coincide con el blueprint; las fichas pendientes son `div` y no enlace; con batch comprendido y archivos aplicado, el siguiente es Ingesta streaming; con todas las fichas comprendidas o aplicadas y el objetivo «Empiezo desde cero», sugiere Orquestación. Sin repasos, la píldora no está. Falta probar en Chrome normal (queda para el commit 5).

### Rediseño UI · commit 4 (ficha en modo lectura)
- `/concepts/[slug]` sigue la pantalla 3: migas, «Leído N de 22», índice agrupado con `CARD_SECTION_GROUPS`, columna de lectura y panel «Tu estudio».
- El índice no lista secciones sin texto. El resumen queda siempre visible. Las secciones 3 y 10 salen abiertas; el resto, en `<details>`. «Expandir todo / Contraer todo» abre o cierra esos `<details>`. Multicloud es un `tablist` GCP / AWS / Azure: flechas, Inicio y Fin mueven la pestaña y el foco.
- La mayor sección vista se guarda en `localStorage` (`dekh:reading:<slug>`: `section`, `title`, `at`). No baja si ya había un número más alto. Alimenta la barra de la ficha y la línea de «Continuar donde quedaste».
- El pie marca `understood` o `needs_review` (en `static`, `localStorage`; en `hybrid`, la server action que ya existía). «Siguiente en la ruta» es el concepto con ficha que sigue en el orden de la pantalla 2. En Idempotencia, el siguiente es Schema evolution.
- El panel de estudio usa los cinco estados del contrato, la casilla de profundizar y las notas. «Ver todas» abre el grafo que ya había. En la demo, las notas dicen que se guardan en el navegador.
- No se editó `content/` ni el contrato. El favorito y la lista de snippets salieron de esta ficha; un snippet relacionado sigue en el grafo.
- Verificado: lint, `npm run build` y `npm run build:static` con `BASE_PATH=/DES_conocimiento` en verde. `dynamicParams` sigue en `true` y `personalActions.ts` sigue con `"use server"`. En el export estático, a 1440 px y a 375 px, Idempotencia no desborda. El índice resalta la sección visible, las pestañas cambian con el teclado, el progreso queda en `dekh:reading:idempotency` y el Inicio muestra «Ibas en la sección N de 22». Falta probar en Chrome normal (queda para el commit 5).

### NULL en CONCAT y claves (`112f862`)
- `grain` §4, `data-reconciliation` §10, snippet `bigquery-reconciliation`, `surrogate-keys` §10 y `surrogate-key-generation` §4, §8 y §10. Filas en pendiente en `docs/reviews/fixes-null-concat.md`.
- Propuestas: advertir que el marcador `\N` no debe aparecer como valor; advertir que el separador `|` tampoco; en `data-reconciliation`, publicar el caso con `monto` NULL (los dos lados, conteo, suma, huellas y `!=` frente a `IS DISTINCT FROM`); en `grain` §4, `NONCLUSTERED` junto a `NOT ENFORCED` en Fabric; en `surrogate-keys` §10, marcar el SQL de BigQuery como no ejecutado.

### B-F3.1 · lote F3b-02c
- Cuatro patterns de 02-sql, tabla de §48. Felipe aprobó todas las filas el 2026-10-07, incluidas las propuestas: `CONCAT` y `||` de Redshift devuelven `NULL` si un argumento es `NULL`; claves no exigidas atribuidas por motor (BigQuery, Redshift y Fabric por separado); salvedades de `IDENTITY` en Redshift, Synapse y Fabric (`IDENTITY_INSERT` y `DBCC CHECKIDENT … RESEED`); Kimball solo en la definición conceptual del tipo 1; en `scd-type-1`, quitar la posibilidad de motores sin validación de duplicados. No se editó `content/` ni `frontend/`.

### B-F3.1 · lotes F3b-02a y F3b-02b
- Veinte fichas de 02-sql, tabla de §48. Felipe aprobó todas las filas el 2026-10-07, incluidas las propuestas: `USING` solo fuera de T-SQL; `IS DISTINCT FROM` no en Redshift; `JSON_VALUE` devuelve `NULL` por encima de 4000 caracteres en modo lax; «sintaxis documentada» en Spectrum; hash join, `QUALIFY`, «sintaxis ISO» y el UTC de BigQuery acotados a cada motor. No se editó `content/` ni `frontend/`.

### Demo estática
- `API_MODE=static` y `BASE_PATH` (obligatorio, no va fijo en el código). `npm run build:static` deja `frontend/out/`. Durante ese build el script pone `dynamicParams = false` en las cuatro rutas dinámicas, sustituye `personalActions.ts` por el stub sin server actions y restaura ambos al terminar.
- Los JSON salen de `frontend/public/data/` (mismo `index.json` que los mocks). **`public/data/` no se versiona** (decisión tomada): lo genera `make static-data` y sigue en `frontend/.gitignore`. No hay que quitar esa línea. El script de build solo rellena la carpeta si falta `index.json` o `search-index.json`, y no pisa los que ya existen.
- **Apache:** `frontend/scripts/write-htaccess.mjs` escribe `out/.htaccess` en cada build estático. Carril A no debe generar otro. Lleva `DirectoryIndex index.html`, `ErrorDocument 404 {BASE_PATH}/404.html`, `AddType application/json .json`, `mod_deflate`, caché de un año para `_next/static` y de 5 minutos para HTML y `data/`.
- En estático, notas, estado y favoritos van a `localStorage`. En `hybrid` siguen en la API. No se editó `content/`.
- MiniSearch indexa `title`, `snippet` y `tags`. `extractField` lee esos tres campos y, para cualquier otro (incluido `id`), devuelve `document[fieldName]`. Antes el id era el snippet y MiniSearch fallaba con "duplicate ID".
- Revisión de `normalize_amount` en `docs/reviews/cards-pytest-fix.md` (filas pendiente). No se editó `content/`.
- El Explorer de `main` (contador «N de M con ficha», filtro Contenido y etiquetas de estado) queda en el navegador: el HTML estático no puede filtrar en el servidor.

### B-F3.1 · lote F3b-01b
- Cinco fichas de 01-fundamentals. Felipe aprobó todas las filas el 2026-10-06, incluidas la tabla de BigQuery de `data-contracts` §11 (`not_null` aplicada; `primary_key` y `foreign_key` solo metadatos; `unique` y `check` no definibles), las exclusiones de la §6 y `LZO_1C` / `LZO_1X` en `compression`. No se editó `content/`.

### B-F3.1 · lote F3b-01a
- Diez fichas de 01-fundamentals y el cambio de tipos en la §10 de `data-validation-with-pydantic`. Felipe aprobó todas las filas el 2026-10-05, incluidas la disponibilidad según Gilbert y Lynch, la fuente de Lake Formation, la atribución por proveedor en `what-is-data-engineering`, las fuentes de `data-ingestion` y el `COPY` de Redshift, y el `REPLACE` de `data-transformation`. No se editó `content/`.

### Explorer · estado de contenido
- `ConceptSummary` ya trae `verification_status`. Cada concepto muestra Verificada, En revisión o Pendiente junto a la clasificación. El filtro Contenido usa `has_page` de la ficha del dominio. La cabecera del dominio dice «N de M con ficha». No se editó `content/`.

### B-F3.1 · lote 6
- Diez fichas, tabla de §48. Felipe aprobó todas las filas el 2026-10-05, incluidas las tres precisiones de `bigquery-cost-model`: compromisos solo de Enterprise y Enterprise Plus, time travel y fail-safe en almacenamiento físico, y BigQuery ML dentro de los slots de esas ediciones. No se editó `content/`.

### B-F3.2 · snippets 3
- Tres snippets y el §14 de `98bc285` (`bigquery-partitioning`, `dead-letter-queue`, `etl-vs-elt`, `incremental-load`, `partitioning`, `scd-type-2`, `sql-merge`). No se editó `content/`.

### B-F3.1 · lote 5
- Diez fichas, tabla de §48. Felipe aprobó todas las filas el 2026-10-04, incluidas `dbt-fabric` y `dbt-fabricspark`, la fuente de Preview de `onSchemaChange` y la viñeta de Observabilidad en §14. No se editó `content/`.

### B-F3.2 · snippets 2
- `terraform-gcs-bucket` y `terraform-bigquery-iam`. Felipe aprobó todas las filas el 2026-10-04. Mínimo privilegio, recursos `*_iam_member`, advertencia de authorized views y costos de Coldline. No se editó `content/`.

### B-F3.1 · lote 4
- Diez fichas, tabla de §48, y aparte el consumidor real de Pub/Sub. Felipe aprobó todas las filas el 2026-10-01. `add-iam-policy-binding` se describe como aditivo y no se llama idempotente. No se editó `content/`.

### B-F3.2 · snippets
- `/snippets` filtra con `GET /snippets` por lenguaje, cloud e `implements`.
- La ficha muestra requisitos, las secciones, el código con resaltado y copiar, y los conceptos que implementa.
- En la ficha de concepto, los snippets salen del grupo `IMPLEMENTS` entrante. Un `code_snippet` abre `/snippets/<slug>`.
- Felipe aprobó las filas de `docs/reviews/snippets-1.md` el 2026-10-01, incluida `CREATE OR REPLACE TEMP TABLE`. El resaltado de HCL quedó en `docs/BACKLOG.md`. No se editó `content/`.

### B-F3.1 · lote 3
- Diez fichas, tabla de §48. Felipe aprobó todas las filas el 2026-10-01, incluida la de `replace_partition` en `catchup` y `dag`. Ninguna afirmación de producto se apoya solo en Kimball o en una RFC. No se editó `content/`.

### B-F3.2 · grafo
- El panel de relaciones dibuja el vecindario a 1 salto con `GET /entities/{slug}/relations`.
- El color del nodo es el tipo de entidad. `origin: blueprint` es línea punteada; `origin: entity` es línea continua.
- `cytoscape` se carga solo si hay vecinos, con `import()` dinámico.
- La lista de relaciones sigue debajo. `/snippets` no entra en este cambio.
- En Chrome: la ficha de concepto y la de tecnología muestran aristas continuas y punteadas, y un clic en un vecino abre su URL.

### B-F3 UX
- El selector de estado y la casilla «Pendiente de profundizar» llaman a `PUT /me/study-state/{slug}` al cambiar, con `last_studied_at` de ahora.
- Se quitó el botón «Guardar estado». El mensaje sigue siendo «Estado guardado.».
- Cliente regenerado (ADR-007). En la búsqueda, un resultado con `has_page: false` muestra «ficha pendiente». El orden de los grupos no se toca.

### B-F3.1 · lote 2
- Diez fichas, tabla de §48, más la corrección de `MERGE` en Redshift (`cb77a2f`). Felipe aprobó todas las filas el 2026-09-30, incluidas las tres salvedades y la precisión de `REMOVE DUPLICATES`. No se editó `content/`.

### B-F3.1 · lote 1
- Una tabla de §48 por cada una de las 10 fichas del lote 1. Felipe aprobó todas las filas el 2026-09-30. No se editó `content/`.
- Los 4 VERIFY (ETL en AWS, ETL en Azure, máximo de particiones de BigQuery, capacidad y retención de Kinesis) quedan destacados y sin inventar el dato.

### B-F2.3
- Cliente regenerado desde el contrato de `main` (422 de ADR-005; PUT y DELETE de notas de ADR-006).
- Conocimiento, búsqueda y `/me` van a `http://localhost:8000/api/v1`. Ya no hay mock de `/me`.
- Búsqueda con Ctrl+K o ⌘K, debounce de 250 ms, grupos en el orden de la API.
- Al guardar el estado de estudio se envía `last_studied_at` con la fecha actual.
- Editar y Borrar notas llaman a `PUT` y `DELETE /me/notes/{slug}/{note_id}`.

### B-F2.2
- Concepto: resumen siempre visible, el resto colapsado, pestañas GCP/AWS/Azure, código con resaltado y copiar, Mermaid en arquitectura, relaciones por tipo y fuentes con nivel.
- Tecnología: cabecera y matriz de capacidades, con diferencias y pestañas de equivalentes.
- Mermaid y highlight.js se cargan solo si la ficha tiene diagrama o código.
- Un slug ausente del índice sigue en «Sin datos en modo mock.» Una ficha stub sin secciones lo dice, sin inventar contenido.
- `main` ya traía el merge de B-F2.1; esta rama lo integró al crearse.

### Límites del mock
- Solo 10 conceptos y 5 tecnologías tenían detalle en el mock. El conocimiento y `/me` salen ahora de la API.
- La búsqueda real no se reordena en el frontend. Los mocks de búsqueda siguen siendo solo ejemplos de forma (ADR-005).

## Pedidos a Carril A
| Pedido | Estado |
|---|---|
| — | — |

## Notas para Carril A
- En news, el tipo de fuente sigue en la entidad `source` y la categoría en `domain` / `tags`. No pedimos un campo `category` en el schema de news.
- El pedido de un párrafo por nivel queda sin efecto. Esos nombres no se asignan a los tramos ni hace falta un campo nuevo: la interfaz muestra la caja «Cómo estudiar cada ficha: Comprender → Aplicar → Demostrar → Profundizar».

## Historial

### Revisión · review-ui-privacy (2026-10-29)
- Revisión de `/privacidad`, la banda, el objetivo 7 y el token. No se editó `content/` ni `frontend/`.

### UI · espacio de privacidad (2026-10-28)
- `/privacidad` reutiliza la ruta de dominio. Con P2 en `main`, las 15 fichas enlazan a su concepto. El laboratorio queda como etapa 6 deshabilitada. El aviso del espacio es «Este contenido no es asesoría legal.»; el de las fichas no cambia. En el inicio no está la tarjeta del marco legal. La banda muestra solo el nombre de los cinco tramos. No se editó `content/`.

### Revisión · lote P2 (2026-10-28)
- Revisión de las cuatro fichas nuevas del dominio 24. No se editó `content/`.

### Revisión · lote A (2026-10-28)
- Revisión de ADR-027, la migración 0007, el schema, el marco legal y el contrato. No se editó `content/`.

### Revisión · cdp-v2 (2026-10-26)
- Revisión de la mejora de `chile-data-protection`. El §10 encuentra 4 brechas y los 30 días son política interna. No se editó `content/`.

### B-F3.1 · lote F3b-22a (2026-10-26)
- Revisión de las 6 fichas de prácticas modernas. La ventana de BigQuery sigue en siete días. No se editó `content/`.

### B-F3.1 · lote F3b-22b (2026-10-26)
- Revisión de las 4 fichas de activación y acceso. MetricFlow queda fuera de la ejecución. No se editó `content/`.

### Revisión · pii-v2 (2026-10-27)
- Revisión de la mejora de `pii-identification`. El §10 coincide con las líneas del test y no imprime valores. No se editó `content/`.

### B-F3.1 · lote F3b-21d (2026-10-26)
- Revisión de las 5 fichas de casos de uso. El z robusto y el reindexado coinciden con los tests. No se editó `content/`.

### B-F3.1 · lote F3b-21c (2026-10-26)
- Revisión de las 5 fichas de sistemas. El ejemplo multi-agente marca sus cifras como supuestos. No se editó `content/`.

### B-F3.1 · lote F3b-21a (2026-10-25)
- Revisión de las 7 fichas de fundamentos. La opción A de embeddings dice que los vectores no son semánticos. No se editó `content/`.

### B-F3.1 · lote F3b-21b (2026-10-25)
- Revisión de las 6 fichas de recuperación. La opción A de `rag` dice que los vectores no son semánticos. No se editó `content/`.

### B-F3.1 · lote F3b-21e (2026-10-26)
- Revisión de las 4 fichas emergentes. `agentic-data-engineering` y `data-agents` siguen pendientes. No se editó `content/`.

### B-F3.1 · upgrade de 19 (2026-10-24)
- Revisión de las 11 fichas del subdominio. Los pedidos 19a–19d quedan anulados. No se editó `content/`.

### B-F3.1 · lote F3b-18c (2026-10-21)
- Revisión de las 4 fichas de técnicas de privacidad. Sin hallazgos. No se editó `content/`. El CI no se esperó.

### B-F3.1 · lote F3b-18b (2026-10-21)
- Revisión de las 5 fichas de cifrado y secretos. Propuesta media: la frase «Avoid passing secrets» de Secret Manager. Propuesta baja: la rotación automática de AWS KMS. No se editó `content/`. El CI no se esperó.

### B-F3.1 · lote F3b-18a (2026-10-21)
- Revisión de las 8 fichas de control de acceso. Propuesta media: `MAINTAIN` en `least-privilege`. No se editó `content/`. El CI no se esperó.

### B-F3.1 · lote F3b-17a (2026-10-21)
- Revisión de las 5 fichas de catálogo, linaje y retención. Sin hallazgos. No se editó `content/`.
### B-F3.1 · lote F3b-17b (2026-10-21)
- Revisión de las 4 fichas de ownership, dominios y clasificación. Propuesta media: la frase de los dos owners de Purview. No se editó `content/`.

### B-F3.1 · lote F3b-16a (2026-10-20)
- Revisión de las 7 fichas de señales y telemetría. Propuesta media: el renombre de Cloud Composer sigue en curso. No se editó `content/`.
### B-F3.1 · lote F3b-16b (2026-10-20)
- Revisión de las 6 fichas de confiabilidad. Sin hallazgos. No se editó `content/`.

### B-F3.1 · lote F3b-15a (2026-10-20)
- Revisión de las 4 fichas de dimensiones, schema, validadores y gate. Sin hallazgos de contenido. Propuesta baja: la fecha del §12 junto a la nota de EMR. No se editó `content/`.
### B-F3.1 · lote F3b-15b (2026-10-20)
- Revisión de las 4 fichas de tests, assertions, GX y WAP. Sin hallazgos. No se editó `content/`.

### B-F3.1 · lote F3b-20a (2026-10-20)
- Revisión de las 4 fichas del open data stack. Dos propuestas media: citar los sufijos de EMR y enlazar `dbt-core-concepts`. Kafka, PostgreSQL y los seis `page_title` coinciden con los tests y el diff. No se editó `content/`.
### B-F3.1 · lote F3b-20b (2026-10-20)
- Revisión de las 3 fichas de formatos y dbt. Cuatro propuestas media: Athena, Databricks, la fuente de dbt en la comparación con Dataform, y Trino y Flink. ADR-018 coincide con requirements-snippets. No se editó `content/`.

### B-F3.1 · lote F3b-14a (2026-10-20)
- Revisión de las 7 fichas de fundamentos y semánticas de entrega. Dos propuestas media: *Class Message* 2.43.0 y la transferencia de Pub/Sub entre zonas. Kafka en la CI y la simulación coinciden con los tests. Las fichas verified solo enlazan. No se editó `content/`.
### B-F3.1 · lote F3b-14b (2026-10-20)
- Revisión de las 7 fichas de tiempo, estado y motores. Sin hallazgos. PySpark, PyFlink, exactly-once, watermarks y los estados de backpressure coinciden con los tests y las páginas. No se editó `content/`.

### B-F3.1 · lote F3b-13a (2026-10-19)
- Revisión de las 5 fichas de fundamentos de contenedores. Una propuesta media (mínimo de 1 minuto de Fargate) y dos bajas (redondeo de Cloud Run y cita de la caché). El Docker de la CI coincide con los tests. No se editó `content/`.
### B-F3.1 · lote F3b-13b (2026-10-19)
- Revisión de Compose, registries, Kubernetes y plataformas. Tres propuestas media (versión 1.37.1, AWS CLI 2.38.2, mínimo de Fargate) y una baja (redondeo de Cloud Run). No se editó `content/`.

### B-F3.1 · lote F3b-12a (2026-10-19)
- Revisión de las 4 fichas de Terraform en uso. Sin hallazgos. El test guarda el secreto en el state y la CLI lo oculta. Las fichas verificadas solo agregan los enlaces previstos. No se editó `content/`.
### B-F3.1 · lote F3b-12b (2026-10-19)
- Revisión de drift, secretos, CloudFormation y Bicep. Sin hallazgos. El apply sin nube y las herramientas sin despliegue coinciden con las fichas, y el diff de las verificadas solo enlaza. No se editó `content/`.

### Worktrees y ramas (2026-10-19)
- Regla para agentes de Cursor, incluidos Background Agents: solo el worktree DES_conocimiento-ui o DES_conocimiento-review, y ramas `b/*`. No escriben en `content/`, no abren DES_conocimiento-carril-a ni la raíz DES_conocimiento, y no hacen push a ramas `a/*`.

### B-F3.1 · lote F3b-rel (2026-10-14)
- Revisión de una muestra de 10 fichas del ajuste del §17. Sin hallazgos. Las 95 fichas solo cambian `relations`, el §17 y el historial. No se editó `content/`.
### B-F3.1 · lote F3b-11a (2026-10-14)
- Revisión de las 7 fichas de Git y CI. Sin hallazgos. La guía de Google queda en lo conceptual, el código corre en la CI y CodeCommit no registra un cambio de estado. No se editó `content/`.
### B-F3.1 · lote F3b-11b (2026-10-14)
- Revisión de las 6 fichas de entrega. Sin hallazgo alto. Propuesta media: citar la frase de Cloud Deploy sobre jobs. No se editó `content/`.

### B-F3.1 · lote F3b-10a (2026-10-14)
- Revisión de las 7 fichas de analítica en Azure. Sin hallazgo alto. Propuestas media: once fichas nombradas fuera de `relations` en el panorama, el comentario de Azurite sobre namespace y `dfs`, y las relaciones de Athena y de slots. No se editó `content/`.
### B-F3.1 · lote F3b-10b (2026-10-14)
- Revisión de las 7 fichas de cómputo, gobierno e IA en Azure. Sin hallazgo alto. Propuestas media: deny policies de IAM, rotación de secretos en las referencias de Key Vault, y el costo de Functions y de Container Apps sin página de precios. No se editó `content/`.

### B-F3.1 · lote F3b-09a (2026-10-13)
- Revisión de las 8 fichas de almacenamiento, analítica y streaming. Sin hallazgo alto. Propuesta media: el §11 de `lake-formation-permissions` no dice la diferencia con GCP. Propuesta baja: Express One Zone falta en la tabla de clases de S3. No se editó `content/`.

### B-F3.1 · lote F3b-09b (2026-10-13)
- Revisión de las 8 fichas de orquestación, cómputo, gobierno, operación e IA. Sin hallazgo alto. Propuesta media: cuatro §11 no dicen la diferencia con GCP. No se editó `content/`.

### B-F3.1 · lote F3b-08c (2026-10-12)
- Revisión de las 7 fichas de procesamiento, orquestación y servicios. Sin hallazgo alto. Propuestas media: la fecha del 15 de abril de 2026 en `composer-environments`, y el alias «Vertex AI» frente a la fila «Agent Platform». No se editó `content/`.

### B-F3.1 · lote F3b-08b (2026-10-11)
- Revisión de las 8 fichas de gobierno y operación. Sin hallazgo alto. El §17 de cuatro fichas nombra relaciones que no están en el frontmatter. No se editó `content/`.

### B-F3.1 · lote F3b-08a (2026-10-11)
- Revisión de las 8 fichas de BigQuery. Hallazgo alto: en la tabla de ediciones, on-demand figura como «sin reservas» en la fila del tamaño máximo; la página dice Cuota, y «sin acceso a reservas» es otra fila. El §17 nombra fichas que no están en `relations`. No se editó `content/`.

### B-F3.1 · lote F3b-07a (2026-10-11)
- Revisión de `data-mesh` y `data-products`. Felipe aprobó todas las filas, incluidas las dos propuestas (aviso de Knowledge Catalog con bibliotecas cliente; URLs de Getting started y Teams and interactions, y hub-and-spoke en el §1). No se editó `content/`. En espera del dominio 08.

### Proceso · verificación de fichas (2026-10-11)
- En F3b-06a, la fila «Relaciones completas» se marcó a ojo y dio por presentes 6 relaciones que no estaban en las fichas (una, `secrets-management`, no existe). Desde ahora esa fila, y cualquier afirmación sobre lo que contiene una ficha, se verifica con un comando y el resultado se pega en la revisión. En espera del lote 07a.

### B-F3.1 · lote F3b-06a (2026-10-11)
- Revisión de las 8 fichas que completan `06-orchestration`. Felipe aprobó todas las filas, incluida la propuesta (Python 3.11.8 en el ejemplo de migración). No se editó `content/`. En espera del dominio 07.

### B-F3.1 · lote F3b-05a (2026-10-11)
- Revisión de las 6 fichas que completan `05-pipelines`. Felipe aprobó todas las filas, incluidas las tres propuestas (capas de AWS, patrones de Fabric y Eventarc). No se editó `content/`. En espera del dominio 06.

### B-F3.1 · lote F3b-04a (2026-10-10)
- Revisión de las 10 fichas que completan `04-data-modeling`. Felipe aprobó todas las filas, incluida la reclasificación del quickstart de Snowflake a Nivel 3 y la fila de Data Vault Alliance (N4 conceptual; Microsoft Learn N1 para la plataforma; la guía no sostiene afirmaciones). No se editó `content/`. En espera del dominio 05.

### B-F3.1 · lote F3b-03b (2026-10-09)
- Revisión de las 11 fichas que cierran `03-python`. Felipe aprobó todas las filas, incluidas las tres propuestas. No se editó `content/`. En espera del dominio 04.

### B-F3.1 · lote F3b-03a (2026-10-08)
- Revisión de las 10 fichas de `python-core`. Felipe aprobó todas las filas, incluidas las cuatro propuestas. No se editó `content/`. En espera del lote 03b.

### JSON en `change-detection` (2026-10-07)
- Revisión de la alternativa `TO_JSON_STRING(STRUCT(...))` / `jsonb_build_array` frente a `data-reconciliation` y `surrogate-keys`. Felipe aprobó todas las filas el 2026-10-08, incluida la propuesta de la §10, la §2, la §6 y la §20. No se editó `content/`. En espera del lote 03a.

### NULL en CONCAT y claves (2026-10-07)
- Revisión de `grain` §4, `data-reconciliation` §10, el snippet `bigquery-reconciliation`, `surrogate-keys` §10 y `surrogate-key-generation` §4, §8 y §10. Filas en pendiente en `docs/reviews/fixes-null-concat.md`. No se editó `content/`.

### B-F3.1 · lote F3b-02c (2026-10-07)
- Revisión de `scd-type-1`, `change-detection`, `sql-quality-checks` y `surrogate-key-generation`. Felipe aprobó todas las filas, incluidas las propuestas de `CONCAT` con `NULL`, claves por motor e `IDENTITY`. No se editó `content/`. En espera del lote 03a.

### B-F3.1 · lotes F3b-02a y F3b-02b (2026-10-07)
- Revisión de las 20 fichas de 02-sql. Felipe aprobó todas las filas, incluidas las propuestas de atribución por motor. No se editó `content/`. En espera del lote 02c.

### B-F1b · Revisión de los MVP de 03, 06 y 12
- Revisión de los `mvp: true` de los dominios 03, 06 y 12 en `docs/reviews/`. Todas las filas aprobadas, salvo `catchup` (fila 3 de `docs/reviews/blueprint-06.md`), rechazada: sigue `core` porque el §8 lo lista como concepto independiente de proveedor.

### B-F1.3 · Fuentes y ADR-001
- `docs/adr/ADR-001-stack.md`, **Aceptado** en el gate F1.
- `docs/reviews/sources.md` quedó descartado por obsoleto (se basó en un `main` anterior a A-F1.3). Solo se adoptaron sus frecuencias de revisión.

### B-F1.2 · Revisión del Blueprint
- Dominios MVP 01, 02, 04, 05, 07 y 08 revisados y aprobados en `docs/reviews/`; los aplicó Carril A. El dominio 22 lo revisó y aplicó Carril A.

### B-F1.1 · Templates
- `content/_templates/concept.md`: las 22 secciones del §22, cada una con la pregunta de §48.
- `content/_templates/architecture.md`: secciones del §24.
- `content/_templates/lab.md`: tipos A–E del §25, con escenario, datos, restricciones, criterios y conceptos practicados. Sin solución.
- `content/_templates/news.md`: formato del §31 y relevancia del §32.
- Frontmatter compatible con `schemas/` (verificado en el gate F1). No hizo falta ningún campo nuevo.
