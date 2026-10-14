# Revisión B-F3.1 · Lote F3b-rel

Informe de Carril A: `docs/reviews/f3b-rel.md` (commit `6158b1e`). Las 95 fichas cambiaron en `b9a8ed6`. Carril B no las edita. El mismo commit regenera mocks. `verification_status` no cambia: `git diff -G verification_status --stat b9a8ed6^ b9a8ed6 -- content` no devolvió nada.

`.\.venv\Scripts\python.exe scripts\validate.py` terminó así:

```text
OK: 451 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

El lote cubre 8 dominios (01, 02, 03, 04, 05, 06, 08 y 09). La muestra son 10 fichas, las ocho dominios y dos más de 01 y 02.

## Qué cambió en las 95 fichas

Un script clasificó `git diff -U0 b9a8ed6^ b9a8ed6` de `content/concepts` y `content/patterns`:

```text
files 95
OTHER 2
content/concepts/incremental-pipelines.md
  OTHER:- Del blueprint, pendientes de ficha: `watermarks`, `checkpoints`, `full-refresh`.
  OTHER:- Del blueprint, pendientes de ficha: `watermarks` y `full-refresh`.
content/concepts/replay.md
  OTHER:- Del blueprint, pendientes de ficha: `offsets`, `checkpoints`, `failure-recovery`.
  OTHER:- Del blueprint, pendiente de ficha: `offsets`.
history_added distinto de 1: ninguno
```

Esas dos líneas «OTHER» son el §17 del caso B: se saca el slug que ya tiene ficha de la lista de pendientes. Cada ficha suma una sola línea de historial del 2026-10-14. El resto de las líneas añadidas o quitadas son `relations` o viñetas del §17.

## Muestra

| Ficha | Dominio | Relación nueva | Dónde ya estaba |
|---|---|---|---|
| `data-ingestion` | 01 | `data-lake`, `oltp-vs-olap` | §2, fila de ingesta federada |
| `json-format` | 01 | `python-logging` | §5, «Logs estructurados» |
| `sql-joins` | 02 | `join-optimization`, `sql-structs` | §17 ya decía «Con ficha»; §16, columnas anidadas |
| `scan-reduction` | 02 | `query-plans` y el detalle de BigQuery, `materialization-strategies` | §17, §11 y §16 |
| `python-generators` | 03 | `python-concurrency`, `python-context-managers`, `python-file-processing`; el §17 nombra `python-comprehensions` | el §17 ya las nombraba; la expresión generadora ya estaba en `relations` |
| `kimball-methodology` | 04 | ocho, entre ellas `normalization`, `denormalization`, `physical-data-model`, `semantic-models` | §6, §10, §11 y §13, con «ver» |
| `incremental-pipelines` | 05 | `checkpoints` | salió de «pendientes de ficha» |
| `dynamic-workflows` | 06 | `idempotency`, `retries`, `open-source-vs-managed-orchestration`, `pyspark-dataframes` | §17, §11 y §6 |
| `bigquery-sql-dialect` | 08 | `bigquery-security` | §14, permisos frente a `EXCEPT` |
| `lake-formation-permissions` | 09 | `bigquery-security` | §11, seguridad fina en BigQuery |

Ninguna es una mención de paso. Cada nota repite el renglón en el que la ficha ya usaba ese slug.

`git diff -U2` de las diez solo muestra bloques de `relations`, viñetas del §17 y la línea de historial. Ejemplo (`json-format`):

```text
+  - type: RELATED_TO
+    target: python-logging
+    note: "Logs estructurados en JSON (§5)."
+- `python-logging`: logs estructurados en JSON (§5).
+- 2026-10-14: lote F3b-rel (regla del §17): relations incluye `python-logging`; ...
```

## Lo que no se agregó

```text
dag.md:79          target: catchup
scheduler.md:58    target: catchup
data-mart.md:55    target: data-warehouse
pipeline-dependencies.md   target: retries   (sin coincidencias)
dag.md             target: api-ingestion    (sin coincidencias)
```

Falsos positivos. El renglón no dice «pendiente de ficha»:

```text
dag.md:259        `catchup`: creación automática de ejecuciones pendientes.
scheduler.md:218  `catchup`: la política para intervalos pendientes.
data-mart.md:243  `data-warehouse`: la fuente de un mart dependiente.
```

Los tres slugs ya estaban en `relations`. El detector ahora exige «pendiente(s) de ficha».

Menciones incidentales, en `INCIDENTAL_MENTIONS`:

```text
pipeline-dependencies.md:109
  Si una tarea falla y se agotan sus reintentos (`retries`), ...
dag.md:229
  En Step Functions los reintentos se declaran por estado (ver `api-ingestion`), ...
```

`retries` es el parámetro de Airflow, al lado de `retry_delay`, no la ficha. `api-ingestion` aparece en el §12 de `dag` solo como el sitio donde ya está el ejemplo de reintentos de Step Functions; una relación entre las dos fichas diría otra cosa.

Solo en el §22, y el chequeo ya no lo mira:

```text
surrogate-keys.md:229       `change-detection`, `sql-quality-checks`  (historial)
testing-with-pytest.md:287  `data-transformation`                     (historial)
```

Esas tres búsquedas no dieron otra línea.

## §11, §12, precios, §14 y page_title

El diff no toca esas secciones. En las 10 fichas de la muestra:

```text
page_title vacío: ninguno
§14 Seguridad, Observabilidad y Costo: True
montos: 0
```

La tabla del §11 y del §12 no es de este lote: son fichas ya revisadas. En la muestra, solo `lake-formation-permissions` tiene tabla en el §11.

## Resultado

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| 193 correcciones en 95 fichas, solo en `relations`, el §17 y una línea de historial. Las 10 de la muestra enlazan un slug que la ficha ya usaba con sentido. Los 3 falsos positivos y las 2 menciones incidentales coinciden con el texto. `validate` en verde, con el chequeo como error. | ninguna | — |
