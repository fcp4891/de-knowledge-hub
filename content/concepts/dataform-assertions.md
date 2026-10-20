---
id: concept:dataform-assertions
slug: dataform-assertions
type: concept
title: Assertions en Dataform
description: "Las assertions de Dataform: consultas que fallan si devuelven filas, incorporadas en el config de una tabla (nonNull, rowConditions, uniqueKey, uniqueKeys) o manuales en un SQLX con type: assertion. Una assertion fallida no bloquea a los dependientes salvo que se declare como dependencia (dependOnDependencyAssertions o includeDependentAssertions). Los resultados van al scorecard de Knowledge Catalog. Código no ejecutado; Glue Data Quality y Purview, con sus diferencias."
domain: data-quality
subdomain: quality-implementations
category: data-quality
classification: modern
level: intermediate
importance: medium
cloud: [gcp]
technologies: [gcp-dataform, gcp-bigquery, gcp-dataplex, aws-glue, microsoft-purview]
tags: [data-quality, dataform, assertions, bigquery, sqlx]
related_topics: [dataform-workflows, dbt-tests]
sources:
  - source: gcp-dataform-docs
    url: https://docs.cloud.google.com/dataform/docs/test-data
    accessed: 2026-10-20
    page_title: "Test data quality"
    note: "Test data quality (Dataform): una assertion es una consulta que encuentra filas que violan condiciones; si devuelve filas, falla. Dataform corre las assertions cada vez que actualiza el workflow y avisa si alguna falla; crea vistas con los resultados en un schema de assertions (por defecto, dataform_assertions). Assertions incorporadas en el config de una tabla (nonNull, rowConditions, uniqueKey, uniqueKeys) y manuales en un archivo SQLX con type: assertion; los resultados se publican en el scorecard de calidad de Knowledge Catalog."
  - source: gcp-dataform-docs
    url: https://docs.cloud.google.com/dataform/docs/dependencies
    accessed: 2026-10-20
    page_title: "Set dependencies"
    note: "Set dependencies (Dataform): si la acción B depende de A, que tiene assertions, que fallen las assertions de A no impide que Dataform ejecute B; para correr B solo si pasan, hay que declarar las assertions de A como dependencias de B. Una assertion de un archivo type: assertion se puede declarar como dependencia o como dependiente en el config. includeDependentAssertions agrega como dependencias las assertions directas de una dependencia elegida; dependOnDependencyAssertions agrega las de todas las dependencias de la acción; los dos se aplican a acciones table, view y operations, y si están en el mismo archivo, includeDependentAssertions tiene prioridad. Dataform los agrega en cada compilación."
  - source: gcp-knowledge-catalog-docs
    url: https://docs.cloud.google.com/knowledge-catalog/docs/auto-data-quality-overview
    accessed: 2026-10-20
    page_title: "Auto data quality overview"
    note: "Auto data quality overview (Knowledge Catalog): reglas de calidad asociadas a una dimensión, por fila (con umbral de porcentaje de filas que pasan) o agregadas, incluidas reglas SQL propias (Row condition, Table condition y SQL assertion, que falla si la consulta devuelve filas)."
  - source: aws-glue-docs
    url: https://docs.aws.amazon.com/glue/latest/dg/glue-data-quality.html
    accessed: 2026-10-20
    page_title: "AWS Glue Data Quality"
    note: "AWS Glue Data Quality: la calidad para ETL jobs permite tareas proactivas, que identifican y filtran datos malos antes de cargar un dataset en el data lake; la calidad para el Data Catalog evalúa tablas ya catalogadas. Solo la de ETL jobs identifica los registros que fallaron los controles; las dos se integran con EventBridge y CloudWatch y pueden escribir resultados en S3."
  - source: microsoft-purview-docs
    url: https://learn.microsoft.com/en-us/purview/unified-catalog-data-quality-rules
    accessed: 2026-10-20
    page_title: "Create data quality rules"
    note: "Create data quality rules (Purview Unified Catalog): reglas incorporadas como Freshness, Unique values, String format match, Data type match, Duplicate rows, Empty/blank fields y Table lookup; la regla Custom valida filas con una expresión por fila (true pasa, false falla) y una expresión de filtro opcional que limita qué filas se evalúan; se escribe con expresiones regulares, expresiones de Azure Data Factory o SQL."
relations:
  - type: RELATED_TO
    target: dataform-workflows
    note: El workflow donde viven las assertions.
  - type: RELATED_TO
    target: dbt-tests
    note: La misma idea en dbt, con otras diferencias.
  - type: RELATED_TO
    target: sql-quality-checks
    note: Reglas como consultas que devuelven filas que fallan.
  - type: RELATED_TO
    target: quality-gate
    note: Hacer que una tabla espere sus assertions.
  - type: RELATED_TO
    target: data-quality-dimensions
    note: Qué dimensión mide cada assertion.
created_at: 2026-10-20
updated_at: 2026-10-20
last_verified: 2026-10-20
verification_status: review_required
---

## 1. Resumen

En **Dataform**, una **assertion** es una consulta que busca filas que violan una regla: si devuelve filas, falla (*Test data quality*). Hay dos formas:

- **incorporadas**, en el bloque `config` de una tabla: `nonNull`, `rowConditions`, `uniqueKey` y `uniqueKeys`;
- **manuales**, un archivo SQLX con `type: "assertion"` y una consulta que debe devolver cero filas.

Dataform corre las assertions cada vez que actualiza el workflow, avisa si alguna falla, crea vistas con los resultados en un schema de assertions y publica el resultado en el scorecard de calidad de Knowledge Catalog. Que falle una assertion **no impide** ejecutar lo que depende de esa tabla: para que una tabla no se construya si fallan las assertions de lo que lee, hay que declararlas como dependencias (*Set dependencies*).

## 2. Qué es

- **Assertion incorporada:** una regla en `config.assertions` de la tabla.
- **Assertion manual:** un SQLX `type: "assertion"`, útil para reglas más complejas o para datasets que Dataform no crea.
- **Schema de assertions:** donde Dataform crea las vistas con los resultados (por defecto `dataform_assertions`).
- **`includeDependentAssertions`:** agrega las assertions de una dependencia elegida como dependencias.
- **`dependOnDependencyAssertions`:** agrega las de todas las dependencias.

## 3. Problema que resuelve

Una tabla `ventas_diarias` lee `stg_pedidos`. Si `stg_pedidos` trae ids repetidos, `ventas_diarias` duplica montos. Con un `uniqueKey` en `stg_pedidos` y `dependOnDependencyAssertions: true` en `ventas_diarias`, la assertion falla y la tabla que depende de ella no se construye con datos duplicados.

## 4. Cómo funciona

1. La tabla declara sus assertions incorporadas en `config`.
2. Para reglas más complejas, un SQLX `type: "assertion"` con una consulta que devuelve las filas inválidas.
3. Dataform compila cada assertion a una consulta y crea una vista en el schema de assertions.
4. En cada ejecución, si la consulta devuelve filas, la assertion falla y Dataform avisa.
5. Con `dependOnDependencyAssertions` o `includeDependentAssertions`, las assertions pasan a ser dependencias de la tabla que lee: se ejecutan antes.

## 5. Cuándo utilizarlo

- En todo workflow de Dataform: clave única y no nulos en cada tabla.
- `rowConditions` para reglas por fila (rangos, formatos).
- Assertions manuales para reglas entre tablas o sobre tablas que Dataform no crea.

## 6. Cuándo no utilizarlo

- Para validar datos antes de cargarlos a BigQuery: las assertions corren sobre tablas ya cargadas.
- Como reemplazo de los tests unitarios de Dataform (`type: "test"`), que prueban la lógica con datos de entrada propios.

## 7. Ejemplo sencillo

| Archivo | Assertion | Falla si |
|---|---|---|
| `stg_pedidos.sqlx` | `uniqueKey: ["id"]`, `nonNull: ["id", "tienda"]` | Hay ids repetidos o nulos |
| `stg_pedidos.sqlx` | `rowConditions: ["monto >= 0"]` | Una fila tiene monto negativo |
| `pedidos_sin_tienda.sqlx` | Manual: pedidos cuya tienda no está en el maestro | La consulta devuelve filas |
| `ventas_diarias.sqlx` | `dependOnDependencyAssertions: true` | — (espera las assertions de `stg_pedidos`) |

## 8. Ejemplo de producción

Un repositorio de Dataform de ventas:

- cada tabla de staging con `uniqueKey` y `nonNull`;
- assertions manuales para integridad referencial con los maestros;
- las tablas de marts con `dependOnDependencyAssertions: true`;
- un schema de assertions por entorno, configurado en el archivo de settings del workflow;
- el scorecard de Knowledge Catalog como vista de calidad para los consumidores.

## 9. Arquitectura

```mermaid
flowchart LR
  P["stg_pedidos"] --> A1["uniqueKey · nonNull · rowConditions"]
  M["maestro de tiendas"] --> A2["assertion manual"]
  P --> A2
  A1 --> V["ventas_diarias<br/>(dependOnDependencyAssertions)"]
  A2 --> V
  A1 -. "resultados" .-> KC["Scorecard de Knowledge Catalog"]
```

## 10. Código

```sql
-- definitions/stg_pedidos.sqlx (Dataform, no ejecutado): assertions incorporadas
config {
  type: "table",
  assertions: {
    uniqueKey: ["id"],
    nonNull: ["id", "tienda"],
    rowConditions: ["monto >= 0"]
  }
}
SELECT id, tienda, monto, fecha FROM ${ref("raw_pedidos")}
```

```sql
-- definitions/pedidos_sin_tienda.sqlx (Dataform, no ejecutado): assertion manual; falla si devuelve filas
config { type: "assertion" }
SELECT p.id, p.tienda
FROM ${ref("stg_pedidos")} p
LEFT JOIN ${ref("tiendas")} t ON t.nombre = p.tienda
WHERE t.nombre IS NULL
```

```sql
-- definitions/ventas_diarias.sqlx (Dataform, no ejecutado): espera las assertions de lo que lee
config { type: "table", dependOnDependencyAssertions: true }
SELECT fecha, tienda, SUM(monto) AS total FROM ${ref("stg_pedidos")} GROUP BY fecha, tienda
```

El código **no se ejecutó**: necesita un repositorio de Dataform y BigQuery. La forma sigue *Test data quality* y *Set dependencies*.

## 11. GCP

**Dataform** y **Knowledge Catalog** pueden medir la calidad de la misma tabla. Según *Test data quality* y *Auto data quality overview* (no ejecutado):

| | Assertions de Dataform | Reglas de Knowledge Catalog |
|---|---|---|
| Dónde se definen | En el código del workflow (SQLX) | En un escaneo de calidad sobre la tabla |
| Cuándo corren | En cada actualización del workflow | Según el escaneo |
| Umbral | Falla si devuelve una fila | Por fila, con umbral de porcentaje de filas que pasan |
| Relación | Dataform publica sus resultados en el scorecard de Knowledge Catalog | Cada regla se asocia a una dimensión |

## 12. AWS

En AWS, **AWS Glue Data Quality**. Según *Test data quality* y *AWS Glue Data Quality* (no ejecutado):

| | Assertions de Dataform | AWS Glue Data Quality |
|---|---|---|
| Momento | Sobre tablas ya construidas en BigQuery | En ETL jobs, antes de cargar (proactivo), o sobre tablas del Data Catalog |
| Filas que fallan | Vistas en el schema de assertions | Solo la calidad para ETL jobs identifica los registros que fallaron |

## 13. Azure

En Azure, **Microsoft Purview Unified Catalog**. Según *Test data quality* y *Create data quality rules* (no ejecutado):

| | Assertions de Dataform | Microsoft Purview |
|---|---|---|
| Reglas | En el código, versionadas con el workflow | Incorporadas y Custom, en el catálogo |
| Lenguaje | SQL | Expresiones regulares, de Azure Data Factory o SQL |

## 14. Buenas prácticas

- `uniqueKey` y `nonNull` en cada tabla de staging.
- `dependOnDependencyAssertions` en las tablas que leen otras con assertions.
- Assertions manuales con nombres que digan la regla.
- **Seguridad:** las vistas de assertions muestran filas reales; el schema de assertions tiene los mismos permisos que los datos.
- **Observabilidad:** usar el scorecard de Knowledge Catalog o las vistas de assertions para seguir fallas a lo largo del tiempo.
- **Costo:** cada assertion es una consulta en BigQuery que lee la tabla; en tablas grandes conviene limitarla a la partición nueva.

## 15. Errores frecuentes

- Assertions que fallan y no impiden nada: sin declararlas como dependencias, Dataform ejecuta igual las acciones que dependen de la tabla.
- Confundir assertions (datos) con tests unitarios (`type: "test"`, lógica).
- Assertions sobre tablas enteras que se escanean completas en cada ejecución.

## 16. Trade-offs

Declarar las assertions como dependencias protege a los consumidores y detiene las tablas que dependen de una falla. Una assertion falla con una sola fila: no hay umbral de porcentaje como en las reglas de Knowledge Catalog. Las assertions corren donde ya están los datos, sin moverlos, pero después de cargarlos.

## 17. Conceptos relacionados

- `dataform-workflows`: el workflow.
- `dbt-tests`: tests de dbt.
- `sql-quality-checks`: reglas en SQL.
- `quality-gate`: bloquear lo que depende.
- `data-quality-dimensions`: qué mide cada assertion.

## 18. Preguntas técnicas abiertas

1. ¿Tus tablas de marts esperan las assertions de lo que leen?
2. ¿Qué regla entre tablas necesitaría una assertion manual?
3. ¿Quién mira hoy las vistas de assertions?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Google Cloud: *Test data quality* y *Set dependencies* (Dataform), *Auto data quality overview* (Knowledge Catalog).
- AWS: *AWS Glue Data Quality*.
- Microsoft Learn: *Create data quality rules*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-20. `review_required`: pendiente de revisión B-F3.1 del lote F3b-15b.

## 22. Historial de cambios importantes

- 2026-10-20: creación (lote F3b-15b).
