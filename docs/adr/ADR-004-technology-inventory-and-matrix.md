# ADR-004 — Inventario de tecnologías y Cloud Capability Matrix

- **Estado:** Aceptado
- **Fecha:** 2026-09-28
- **Fase:** F1 — Knowledge Blueprint v1 (tarea A-F1.2)
- **Referencias:** plan maestro §2.1, §10–§13, §21, §51, §52.C; ADR-000, ADR-003.

## Contexto

El blueprint (ADR-003) referencia tecnologías por slug en `related_technologies`. Para que esas referencias sean verificables, cada tecnología tiene que existir como entidad. Además, el plan pide una vista transversal por capacidad que compare GCP, AWS y Azure sin presentar los productos como idénticos (§13).

## Decisión

1. **Inventario: un archivo por tecnología** en `content/technologies/<slug>.yaml`, de tipo `technology` o `cloud_service`. No hay un `_inventory.yaml` central: los archivos con `_` se ignoran y cada tecnología tendrá su propia ficha en F2. La vista consolidada la genera `python scripts/validate.py --report`.
2. **Campos nuevos en `technology` y `cloud_service`:**
   - `mvp` (booleano opcional): `true` solo para las tecnologías iniciales de §51 (BigQuery, Cloud Storage, Pub/Sub, Dataflow, Airflow, Composer, Dataform, Python, Terraform);
   - `note` (opcional): matices para la revisión;
   - `category`: pasa de ser un slug libre a la enumeración `category` de `enums.schema.json`. Esa enumeración también da los identificadores de las filas de la matriz.
3. **Clasificación por tipo:**
   - servicios administrados de un proveedor cloud → `cloud_service`, con prefijo de proveedor (convención de ADR-003);
   - proyectos open source y productos de otros proveedores → `technology`.
   - Los productos de Microsoft que no son solo Azure (`microsoft-fabric`, `microsoft-purview`, `microsoft-entra-id`, `azure-devops`) son `cloud_service` con `provider: azure` y una `note`. Por ejemplo, Fabric es SaaS y no un servicio de Azure en sentido estricto.
4. **Relaciones entre open source y servicio administrado:**
   - `<open source> RUNS_ON <servicio administrado>`; la UI la muestra en la otra dirección como `hosts`. Ejemplo: `apache-airflow RUNS_ON gcp-cloud-composer`.
   - `IMPLEMENTS` se usa solo hacia conceptos o patrones: `debezium IMPLEMENTS change-data-capture`.
5. **Cloud Capability Matrix** en `content/matrix/capabilities.yaml`, validada contra `schemas/matrix.schema.json`:
   - una entrada por capacidad, con conceptos ancla del blueprint (concepto antes que producto, §2.1);
   - una celda por cloud, con `services[]`, `differences` y `not_equivalent_when`, los tres obligatorios;
   - la matriz no es una entidad y `validate.py` la procesa aparte, igual que el blueprint.
6. **Integridad que verifica `validate.py`:**
   - cada `related_technologies` del blueprint debe existir y ser `technology` o `cloud_service`; deja de ser un pendiente (ADR-003 §6) y pasa a ser error;
   - cada servicio de una celda debe ser un `cloud_service` del proveedor de su columna;
   - cada concepto ancla debe existir en el blueprint;
   - los ids de capacidad deben ser únicos.
7. **Vigencia.** Toda tecnología nueva es `stub: true` con `verification_status: review_required`. Toda celda de la matriz es `review_required` hasta que se verifique con fuentes de Nivel 1–2 (A-F1.3 en adelante).

## Consecuencias

- Agregar una tecnología al blueprint obliga a crear su entidad en el mismo cambio.
- La matriz puede incluir servicios que el blueprint no referencia. Viven en el inventario igual que el resto.
- Una capacidad sin servicio administrado claro en algún cloud (por ejemplo, IaC nativo o transformación SQL) no entra en la matriz hasta que se decida cómo representarla. Terraform, como tecnología multicloud, queda fuera de las columnas.
