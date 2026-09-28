# ADR-003 — Modelo del Knowledge Blueprint

- **Estado:** Aceptado
- **Fecha:** 2026-09-28
- **Fase:** F1 — Knowledge Blueprint v1 (tarea A-F1.1)
- **Referencias:** plan maestro §4–§21, §51, §52.A, §54; ADR-000.
- **Numeración:** los números 001 (stack) y 002 (contrato de API) están reservados por la hoja de ruta.

## Contexto

El Blueprint es el inventario jerárquico de todo el conocimiento: dominio → subdominio → concepto. Alimenta el modelo de datos, la navegación, el buscador y la priorización del MVP. No es una ficha. Es el mapa desde el que se crearán las fichas.

## Decisión

1. **Formato.** Un archivo por dominio en `content/blueprint/<id>-<slug>.yaml`, validado contra `schemas/blueprint.schema.json`. Estos archivos no son entidades: no llevan `type` ni `id` de entidad, y `validate.py` los procesa por separado.
2. **Qué lleva cada concepto:**
   - `slug`, `title`;
   - `kind` (concept, pattern o architecture): el tipo de entidad que tendrá su ficha;
   - `classification`, `level`, `importance`, `mvp`;
   - `related_technologies[]`, `related_concepts[]`;
   - `added_by: blueprint` si no figura en el plan maestro;
   - `note`, opcional.
3. **Unicidad.** El slug de un concepto es único en todo el blueprint y es el slug que tendrá su ficha. Los temas que el plan repite en varios dominios (por ejemplo, backfill en §4.1, §7 y §8) tienen un único dominio y los demás los enlazan con `related_concepts`. Los conceptos propios de un producto llevan prefijo (`bigquery-partitioning`) y se relacionan con el concepto genérico (`partitioning`).
4. **MVP:**
   - `x-mvp-domains` lista los dominios del MVP (§51): fundamentals, sql, data-modeling, pipelines, architecture y gcp.
   - Fuera de esos dominios, `mvp: true` exige `mvp_reason` que nombre la tecnología del MVP que lo requiere (Python, Airflow/Composer, Terraform).
   - Límites acordados: unos 5 conceptos MVP por dominio no-MVP y unos 80 en total. `validate.py --report` muestra los conteos.
5. **Integridad que verifica `validate.py`:**
   - `related_concepts` apunta a conceptos existentes del blueprint;
   - toda entidad de `content/` con `domain`/`subdomain` apunta a un par existente;
   - si una entidad comparte slug con un concepto del blueprint, su `type` coincide con `kind`;
   - un `related_technologies` que ya existe como entidad debe ser `technology` o `cloud_service`.
6. **Tecnologías pendientes.** Mientras no exista el inventario (A-F1.2), un `related_technologies` sin entidad no es error. `validate.py --report` lo lista como pendiente. A-F1.2 convertirá esa comprobación en error.
7. **Convención de slugs de tecnología:**
   - servicios cloud con prefijo de proveedor (`gcp-bigquery`, `aws-s3`, `azure-event-hubs`), como el stub `gcp-datastream`;
   - productos de Microsoft que no son solo Azure con prefijo `microsoft-` (`microsoft-fabric`, `microsoft-purview`);
   - proyectos open source con su nombre (`apache-airflow`, `dbt`, `terraform`).

## Consecuencias

- B-F1.2 revisa el blueprint dominio por dominio sobre archivos pequeños.
- Los enlaces entre dominios se escriben en un solo sentido. La navegación inversa se deriva, igual que las relaciones (ADR-000).
- La convención de slugs de tecnología es vinculante para A-F1.2.
