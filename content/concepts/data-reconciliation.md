---
id: pattern:data-reconciliation
slug: data-reconciliation
type: pattern
title: Reconciliación de datos
description: "Comparar origen y destino después de una carga (conteos, sumas de control, hashes por fila o por bloque) para demostrar que no se perdió, duplicó ni alteró nada."
domain: sql
subdomain: sql-patterns
classification: core
level: intermediate
importance: high
cloud: [gcp, aws, azure, agnostic]
technologies: [gcp-bigquery, aws-dms, azure-data-factory]
tags: [sql, data-quality, reliability]
related_topics: [incremental-load, backfill, change-data-capture]
sources:
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/hash_functions
    accessed: 2026-09-30
    note: "FARM_FINGERPRINT calcula un INT64 con Fingerprint64 de FarmHash sobre un STRING o BYTES; su salida para una entrada dada no cambia nunca."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions
    accessed: 2026-09-30
    note: "BIT_XOR([DISTINCT] expression): agregado que aplica un XOR bit a bit sobre la expresión."
  - source: aws-dms-docs
    url: https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Validating.html
    accessed: 2026-09-30
    note: "La validación de datos de AWS DMS compara origen y destino, también durante la replicación continua fila a fila; requiere clave primaria o índice único; agrega carga a ambos endpoints y tiempo extra; puede correr en una tarea solo de validación (EnableValidation y ValidationOnly). Estados por tabla: registros no coincidentes, pendientes, suspendidos, sin clave primaria; los fallos se guardan en awsdms_control.awsdms_validation_failures_v1 en el destino."
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/azure/data-factory/copy-activity-data-consistency
    accessed: 2026-09-30
    note: "Verificación de consistencia de la actividad Copy (validateDataConsistency): en archivos binarios compara tamaño, fecha de modificación y checksum; en datos tabulares, la actividad falla si las filas leídas del origen difieren de las copiadas más las incompatibles omitidas; se puede abortar o omitir archivos inconsistentes."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/string_functions
    accessed: 2026-10-07
    note: "CONCAT devuelve NULL si cualquier argumento es NULL."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/operators
    accessed: 2026-10-07
    note: "IS DISTINCT FROM devuelve TRUE si los valores serían distintos para GROUP BY y nunca devuelve NULL."
relations:
  - type: RELATED_TO
    target: incremental-load
    note: Cada carga incremental debería cerrar con una reconciliación del período.
  - type: RELATED_TO
    target: backfill
    note: Tras un backfill se reconcilia cada período reprocesado.
  - type: RELATED_TO
    target: change-data-capture
    note: En replicación por CDC, la reconciliación detecta cambios perdidos o aplicados dos veces.
created_at: 2026-09-30
updated_at: 2026-10-07
last_verified: 2026-10-01
verification_status: verified
---

## 1. Resumen

Reconciliar es comparar origen y destino después de una carga para demostrar que no se perdió, duplicó ni alteró nada. Va de lo barato a lo caro: conteos, sumas de control por período, y hashes por fila o por bloque para localizar exactamente qué difiere. Es la diferencia entre "el pipeline terminó en verde" y "los datos están completos".

## 2. Qué es

Es un patrón de control con tres niveles:

- **conteos:** filas por período o por partición en origen y destino;
- **sumas de control:** totales de columnas numéricas (monto, cantidad) por período;
- **hashes:** una huella por fila (o un agregado de huellas por bloque) para detectar diferencias en cualquier columna y localizar qué filas difieren.

Se ejecuta como una tarea más del pipeline, con umbrales explícitos y un resultado registrado.

## 3. Problema que resuelve

Un pipeline puede terminar sin errores y aun así perder filas (un filtro de watermark mal puesto, una página de API saltada), duplicarlas (un reintento sin idempotencia) o alterarlas (una conversión de tipos o de zona horaria). Sin reconciliación, esos errores se descubren cuando un usuario compara con el sistema de origen.

## 4. Cómo funciona

1. **Definir la unidad:** período (día), partición o tabla completa.
2. **Calcular métricas en ambos lados** con la misma definición: conteo, sumas, y opcionalmente un hash agregado.
3. **Comparar** con tolerancias explícitas (cero para conteos de datos financieros; alguna tolerancia si el origen sigue cambiando).
4. **Si difiere, bajar de nivel:** comparar hashes por fila para listar las claves que faltan, sobran o difieren.
5. **Registrar el resultado** y fallar o alertar según la severidad.

Para comparar sin mover todos los datos, se calcula en cada lado un **hash agregado por bloque**: por ejemplo, el XOR de las huellas de todas las filas del día. Si coincide, el bloque es igual (con alta probabilidad); si no, se compara fila por fila solo ese bloque.

## 5. Cuándo utilizarlo

- Al cerrar cada carga incremental o cada período de un backfill.
- En migraciones y replicación por CDC.
- En datos financieros o regulatorios, donde hay que demostrar completitud.

## 6. Cuándo no utilizarlo

- No hace falta una comparación fila a fila en cada carga de datos voluminosos y de bajo riesgo: basta con conteos y sumas, y el detalle solo cuando difieren.
- No sirve como sustituto de la idempotencia: detecta el duplicado, no lo evita.
- Si el origen cambia constantemente y no hay un corte consistente, la comparación exacta dará falsos positivos; hay que reconciliar contra un snapshot o con tolerancia.

## 7. Ejemplo sencillo

Después de cargar las ventas del 29 de septiembre, se compara: origen 10.482 filas y 3.201.554,20 de monto; destino 10.482 filas y 3.201.554,20. Coinciden: el día queda reconciliado.

## 8. Ejemplo de producción

Cada carga diaria termina con una tarea de reconciliación:

- el extractor guarda, junto a los datos, el conteo y la suma de montos que informó el origen para ese día;
- la tarea calcula lo mismo en el destino y, además, un hash agregado por día;
- si el conteo o la suma difieren, la tarea falla y se ejecuta la comparación por clave para listar faltantes y sobrantes;
- el resultado queda en una tabla `reconciliacion` con período, métricas de ambos lados y estado.

## 9. Arquitectura

```mermaid
flowchart LR
  SRC[(Origen)] -->|conteo, sumas, hash por día| M1[Métricas origen]
  DST[(Destino)] -->|conteo, sumas, hash por día| M2[Métricas destino]
  M1 --> CMP{¿Coinciden?}
  M2 --> CMP
  CMP -->|sí| OK[Registrar reconciliado]
  CMP -->|no| DET[Comparación por clave: faltantes, sobrantes, distintos] --> ALERT[Alerta + registro]
```

## 10. Código

```sql
-- BigQuery: reconciliación de un día entre el snapshot del origen y el destino.
-- Requiere: stg_ventas_origen (copia del origen para el día) y dwh.ventas; @dia es el día lógico.
WITH origen AS (
  SELECT COUNT(*) AS filas, SUM(monto) AS monto,
         BIT_XOR(FARM_FINGERPRINT(CONCAT(IFNULL(CAST(venta_id AS STRING), '\\N'), '|',
                                            IFNULL(CAST(monto AS STRING), '\\N')))) AS huella
  FROM `proyecto.staging.stg_ventas_origen`
  WHERE fecha = @dia
),
destino AS (
  SELECT COUNT(*) AS filas, SUM(monto) AS monto,
         BIT_XOR(FARM_FINGERPRINT(CONCAT(IFNULL(CAST(venta_id AS STRING), '\\N'), '|',
                                            IFNULL(CAST(monto AS STRING), '\\N')))) AS huella
  FROM `proyecto.dwh.ventas`
  WHERE fecha = @dia
)
SELECT
  o.filas AS filas_origen, d.filas AS filas_destino,
  o.monto AS monto_origen, d.monto AS monto_destino,
  o.huella = d.huella AS huella_coincide
FROM origen AS o CROSS JOIN destino AS d;

-- Si no coincide: detalle por clave (faltantes, sobrantes y distintos).
SELECT COALESCE(o.venta_id, d.venta_id) AS venta_id,
       CASE WHEN d.venta_id IS NULL THEN 'falta en destino'
            WHEN o.venta_id IS NULL THEN 'sobra en destino'
            ELSE 'monto distinto' END AS diferencia
FROM (SELECT venta_id, monto FROM `proyecto.staging.stg_ventas_origen` WHERE fecha = @dia) AS o
FULL OUTER JOIN (SELECT venta_id, monto FROM `proyecto.dwh.ventas` WHERE fecha = @dia) AS d
  ON o.venta_id = d.venta_id
WHERE o.venta_id IS NULL OR d.venta_id IS NULL OR o.monto IS DISTINCT FROM d.monto;
```

Son consultas de solo lectura: repetirlas no cambia nada. Una limitación del XOR: dos filas idénticas duplicadas se anulan entre sí, así que el conteo sigue siendo imprescindible junto a la huella. El marcador `'\\N'` evita que una fila con `monto` nulo quede fuera de la huella.

```sql
-- PostgreSQL (ejecutado): por qué hace falta el marcador. fp() reproduce FARM_FINGERPRINT (60 bits del MD5);
-- || con un NULL devuelve NULL, como CONCAT en BigQuery.
-- Origen (1, 100), (2, NULL) y destino (1, 100), (3, NULL): mismo conteo, misma suma y filas distintas.
SELECT bit_xor(fp(venta_id::text || '|' || monto::text)) FROM origen;      -- sin marcador: la fila 2 no cuenta
SELECT bit_xor(fp(coalesce(venta_id::text, '\N') || '|' || coalesce(monto::text, '\N'))) FROM origen;  -- con marcador
```

Sin marcador, el conteo (2 y 2), la suma (100 y 100) y la huella coinciden, porque la huella de cada fila con `monto` nulo es `NULL` y `BIT_XOR` la omite: la reconciliación da por buena una carga con filas distintas. Con el marcador, la huella ya no coincide y la diferencia se detecta. En la misma prueba, un `monto` que pasa de 100 a `NULL` no aparece en el detalle con `!=` y sí con `IS DISTINCT FROM`. El SQL de BigQuery de arriba no se ejecutó: requiere GCP.

## 11. GCP

En **BigQuery**, `FARM_FINGERPRINT` da una huella `INT64` estable (la misma entrada da siempre la misma salida) y `BIT_XOR` la agrega por bloque. Con ambas se reconcilian bloques grandes comparando un solo número por lado, y se baja a la comparación por clave solo donde difieren.

## 12. AWS

**AWS DMS** trae **validación de datos** integrada:

- compara origen y destino, también durante la replicación continua, fila a fila;
- requiere clave primaria o índice único;
- informa por tabla registros no coincidentes, pendientes y suspendidos, y guarda los fallos en la tabla `awsdms_control.awsdms_validation_failures_v1` del destino;
- agrega carga a ambos extremos y tiempo extra, por eso puede correr como una tarea **solo de validación**, separada de la migración.

Es reconciliación administrada para lo que mueve DMS; para otros pipelines hay que construirla.

## 13. Azure

En **Data Factory**, la actividad Copy tiene **verificación de consistencia** (`validateDataConsistency`):

- en archivos binarios compara tamaño, fecha de modificación y checksum;
- en datos tabulares, la actividad falla si las filas leídas del origen difieren de las copiadas más las incompatibles omitidas.

Es un control de conteo de la copia, no una comparación de contenido fila a fila como la de DMS.

## 14. Buenas prácticas

- Reconciliar por período, no la tabla completa: localiza el problema y escala mejor.
- Guardar las métricas del origen en el momento de la extracción, para comparar contra el mismo corte.
- Empezar por conteos y sumas; usar hashes por fila solo cuando difieren.
- Registrar cada reconciliación (período, métricas, estado) en una tabla consultable.
- **Seguridad:** las consultas de detalle pueden exponer datos sensibles en los logs; registrar claves y tipos de diferencia, no el contenido de las filas.
- **Observabilidad:** alertar ante cualquier diferencia en conteos y ante una tasa creciente de períodos no reconciliados.
- **Costo:** los hashes por fila leen todas las columnas incluidas; limitar la entrada del hash a las columnas que importan y reconciliar al detalle solo los bloques que difieren.

## 15. Errores frecuentes

- Comparar contra el origen "ahora", cuando ya cambió desde la extracción.
- Confiar solo en el XOR de huellas: filas duplicadas idénticas se anulan.
- Definir las métricas distinto en cada lado (zona horaria, redondeo, filtros).
- Reconciliar pero no fallar ni alertar cuando hay diferencias.

## 16. Trade-offs

Los conteos y sumas son baratos, pero no detectan cambios que se compensan. Los hashes por fila detectan cualquier diferencia, a cambio de leer más datos y de requerir una normalización idéntica en ambos lados. La validación administrada (DMS) evita construirla, pero solo cubre lo que mueve ese servicio.

## 17. Conceptos relacionados

- `incremental-load`: cada carga incremental cierra con una reconciliación.
- `backfill`: cada período reprocesado se reconcilia.
- `change-data-capture`: la replicación por CDC se valida contra el origen.
- Con ficha: `sql-quality-checks`, `change-detection`.
- Del blueprint, pendiente de ficha: `data-quality-dimensions`.

## 18. Preguntas técnicas abiertas

1. ¿Qué tolerancia aceptarías al reconciliar una tabla cuyo origen sigue recibiendo cambios durante la extracción?
2. ¿Cómo reconciliarías una tabla de miles de millones de filas sin compararla fila a fila cada día?
3. ¿Qué harías si la reconciliación falla solo en los días de cambio de horario?

## 19. Laboratorio relacionado

Pendiente (F4): lab de tipo B sobre duplicados tras un reproceso (§25).

## 20. Fuentes

- Google Cloud: *Hash functions* y *Aggregate functions* (BigQuery).
- AWS: *AWS DMS data validation*.
- Microsoft Learn: *Data consistency verification in copy activity* (Data Factory).

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-01. Pasa a `verified`: revisión B-F3.1 del lote 3 aplicada, sin VERIFY pendientes.

## 22. Historial de cambios importantes

- 2026-09-30: creación (lote 3 de F3).
- 2026-10-01: `verification_status: verified` (revisión B-F3.1 del lote 3 aplicada; sin VERIFY pendientes).
- 2026-10-07: la sección de conceptos relacionados ya no lista como pendientes de ficha a `sql-quality-checks`, `change-detection`, que ya tienen ficha.
- 2026-10-07: cambio mínimo (aprobado por Felipe): la huella usa un marcador de NULL (`IFNULL(…, '\\N')`, el de `change-detection`) porque `CONCAT` de BigQuery devuelve NULL con un argumento NULL y `BIT_XOR` omitía esas filas; el detalle por clave compara con `IS DISTINCT FROM` en lugar de `!=`. Sigue `verified`, pendiente de revisión de Cursor. §10 agrega un caso con `monto` NULL probado en PostgreSQL.
