# Revisión B-F3.1 · Lote F3b-06a

Fichas en `content/concepts/`. Carril B no las edita. Filas en `pendiente` hasta que Felipe las apruebe. Las ocho siguen en `review_required`. No hay comentarios `VERIFY` ni fuentes Nivel 4.

Las 8: `orchestration-task`, `sensors`, `dynamic-workflows` (`modern`), `event-driven-orchestration` (`modern`), `orchestration-observability`, `airflow-operators-and-hooks` (`modern`), `open-source-vs-managed-orchestration` (`modern`) y `orchestration-landscape` (`modern`).

El 2026-10-11 contrasté las páginas de versiones de Managed Service for Apache Airflow, de MWAA y del Apache Airflow job de Fabric, y el script `make check-airflow-dag`. No reejecuté los Dags, el Python, Dagster ni Prefect.

Propuesta, en `open-source-vs-managed-orchestration`: el paso 2 del ejemplo de producción dice «Python 3.11». La lista de imágenes de Gen 3 dice Python 3.11.8. Alinear esa frase a 3.11.8.

## Criterios heredados del lote 1

| Criterio | Hallazgo | Estado |
|---|---|---|
| §14 con seguridad, observabilidad y costo | Las 8 fichas los traen como viñetas explícitas de §14. | pendiente |
| Ejemplos atómicos e idempotentes | Seis fichas tienen un bloque `# Airflow` que la CI carga con `DagBag` (Airflow 3.3.2) y un bloque de Python 3.12 que dice pasar `mypy --strict`. `orchestration-landscape` dice que Dagster 1.13.26 y Prefect 3.8.8 se ejecutaron en local, fuera de la CI, y no pasaron por `mypy`. `open-source-vs-managed-orchestration` no tiene Dag: su script de versiones dice pasar `mypy --strict`. No reejecuté el código. | pendiente |
| Relaciones completas | En las 8, cada slug de `related_topics` está en `relations`. | pendiente |
| Nivel 4 solo conceptual | No hay fuentes Nivel 4. Las afirmaciones de producto están en notas Nivel 1, con `accessed: 2026-10-11`. | pendiente |
| Imports de Airflow 3.3.2 | `FileSensor` se importa de `airflow.providers.standard.sensors.filesystem` en `sensors` y en `orchestration-task`. `FileDeleteTrigger` sale de `airflow.providers.standard.triggers.file`. Esas rutas están en las notas del provider standard 1.19.0. Las aserciones de `scripts/snippets/airflow_dag_checks.py` coinciden con los Dags (modo y timeout del sensor, tarea mapeada, Asset con watcher, callbacks, operador propio). | pendiente |

## `orchestration-task`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es una tarea, reintentos, timeout, cuándo sí y cuándo no, y §14 están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Estados, `execution_timeout`, `AirflowSkipException` y `AirflowFailException` están en la nota de Airflow 3.3.2. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El Dag `ventas_por_particion` usa `FileSensor` del provider standard y `BashOperator`, con `retries=3` en `default_args` y `execution_timeout` de 30 minutos en la carga. El checker exige esa clase, esos atributos y que `verificar_conteo` dependa de `cargar_particion`. No marco otro error. | pendiente |
| Ejemplos poco realistas | Esperar el archivo del día y reemplazar la partición para que un reintento no duplique es un uso habitual. | pendiente |
| Relaciones faltantes | `dag`, `retries` y `idempotency` están en `relations`. | pendiente |

## `sensors`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Poke, reschedule y diferible, timeout, cuándo sí y cuándo no, y §14 están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Modos, `poke_interval`, `timeout` desde el primer intento y `soft_fail` están en la nota de Airflow 3.3.2. `FileSensor` y `deferrable` están en las notas del provider standard 1.19.0, con la ruta `airflow.providers.standard.sensors.filesystem`. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El Dag declara `esperar_ventas` con `mode="reschedule"`, `poke_interval=600`, `timeout=21600` y `soft_fail=False`, y `esperar_catalogo` con `deferrable=True`. El checker exige esos valores y que `cargar` dependa de los dos. No marco otro error. | pendiente |
| Ejemplos poco realistas | Esperar un archivo de proveedor cada 10 minutos, con tope de 6 horas, es un uso habitual. | pendiente |
| Relaciones faltantes | `scheduler`, `orchestration-task` y `file-ingestion` están en `relations`. | pendiente |

## `dynamic-workflows`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Cuántas tareas se crean en ejecución, el tope, cuándo sí y cuándo no, y §14 están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | `expand`, `partial`, el producto cruzado y `max_map_length` (1024 por defecto) están en la nota de Airflow 3.3.2. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El Dag mapea `procesar` desde `listar_archivos` y `resumir` depende de `procesar`. El checker exige que `procesar` sea un `MappedOperator`. No marco otro error. | pendiente |
| Ejemplos poco realistas | Una copia por archivo del día, con un tope, es un uso habitual. | pendiente |
| Relaciones faltantes | `dag`, `orchestration-task` y `batch-ingestion` están en `relations`. | pendiente |

## `event-driven-orchestration`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Quién inicia la corrida, el riesgo de programarla sin parar, cuándo sí y cuándo no, y §14 están. El resumen dice que la fuente, el enrutamiento y el manejador están en `event-driven-pipelines`. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Assets, `AssetWatcher` y la restricción a `BaseEventTrigger` están en la nota de Airflow 3.3.2. Esa nota describe la programación infinita: un trigger que espera un estado que queda verdadero (un archivo que existe) dispara el Dag en cada revisión, con el ejemplo de `S3KeyTrigger`. `FileDeleteTrigger` está en la nota del provider: se dispara una vez y borra el archivo. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El cuerpo separa esta ficha (el orquestador inicia la corrida) de `event-driven-pipelines` (fuente, enrutamiento, manejador) y de un sensor (espera dentro de una corrida ya iniciada). El Dag usa `FileDeleteTrigger` para que la condición no quede verdadera. El checker exige que el trigger del Asset `PEDIDOS` sea `BaseEventTrigger` y que el horario del Dag sea de Asset. No marco otro error. | pendiente |
| Ejemplos poco realistas | Un aviso que se consume al detectarse, frente a vigilar «el archivo existe», es el caso que describe la documentación. | pendiente |
| Relaciones faltantes | `scheduler`, `sensors` y `event-driven-pipelines` están en `relations`. | pendiente |

## `orchestration-observability`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué se observa, callbacks, timeouts, cuándo sí y cuándo no, y §14 están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Callbacks, `execution_timeout`, `dagrun_timeout` y la eliminación de SLA en Airflow 3.0 están en notas de Airflow 3.3.2. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El Dag pone `on_success_callback` en el Dag y `on_failure_callback`, `on_retry_callback`, `retries=2` y `execution_timeout` de una hora en `default_args`. El checker exige esos callbacks y esos atributos en `cargar`. No marco otro error. | pendiente |
| Ejemplos poco realistas | Alertar un fallo de carga y cortar una tarea colgada al cabo de una hora es un uso habitual. | pendiente |
| Relaciones faltantes | `python-logging`, `retries` y `failure-recovery` están en `relations`. | pendiente |

## `airflow-operators-and-hooks`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Operador, hook y operador propio, cuándo sí y cuándo no, y §14 están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | `BaseOperator`, crear el hook en `execute` y `template_fields` están en la nota de Airflow 3.3.2. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El Dag declara `ExportarVentasOperator` con `template_fields=("fecha",)` y `conn_id="api_ventas"`, y `SQLExecuteQueryOperator` aguas abajo. El checker exige esa clase, esos atributos y esa dependencia. No marco otro error. | pendiente |
| Ejemplos poco realistas | Exportar con la fecha de la corrida y registrar la carga en SQL es un uso habitual. | pendiente |
| Relaciones faltantes | `orchestration-task`, `python-api-consumption` y `secrets-management` están en `relations`. | pendiente |

## `open-source-vs-managed-orchestration`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué opera el equipo y qué el servicio, cuándo sí y cuándo no, y §14 están. La tabla dice que las celdas no son una equivalencia. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Cada cifra está en la nota de su página, con `accessed: 2026-10-11`. El 2026-10-11 esas páginas siguen diciendo lo mismo: Gen 3, `composer-3-airflow-3.3.1-build.3` con Python 3.11.8 (Latest build) y `composer-3-airflow-2.11.1-build.20` como Default build; MWAA v3.3.1 (1 de septiembre de 2026, Python 3.12); Fabric, Airflow 2.10.5 y Python 3.12. «Cloud Composer» aparece en el cuerpo solo dentro de la frase de la página de introducción («Cloud Composer is evolving to become Managed Service for Apache Airflow»). | pendiente |
| Errores técnicos o simplificaciones peligrosas | El resumen dice que no son Airflow con otro nombre ni equivalentes. §11–13 describen cada servicio desde su página. El paso 2 del ejemplo de producción dice «Python 3.11». La lista de imágenes dice 3.11.8. Propuesta: escribir 3.11.8 en ese paso. La tabla, el §11 y el script ya usan 3.11.8. | pendiente |
| Ejemplos poco realistas | Elegir la imagen 3.3.1 y no la de por defecto antes de migrar Dags probados en 3.3.2 es el caso que la tabla de versiones obliga a mirar. | pendiente |
| Relaciones faltantes | `airflow-architecture` y `orchestration-landscape` están en `relations`. | pendiente |

## `orchestration-landscape`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué más hay además de Airflow, cuándo mirarlo y cuándo no, y §14 están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Workflows, Step Functions, Data Factory, los pipelines de Fabric, Dagster y Prefect están en notas Nivel 1, cada uno con su página. Dagster se cita como la versión 1.13.26 de su documentación; Prefect, como Prefect 3. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El resumen y la tabla dicen que las filas no se equivalen. Dagster y Prefect se presentan como herramientas a observar, y el §6 dice que no se migra desde Airflow por novedad. El párrafo posterior al código dice que los dos bloques se ejecutaron en local, en un entorno aparte, no en la CI, y que no se pasaron por `mypy`. No marco otro error. | pendiente |
| Ejemplos poco realistas | El mismo flujo de dos pasos en assets de Dagster y en funciones de Prefect, con la plataforma principal en Airflow, es una evaluación acotada. | pendiente |
| Relaciones faltantes | `data-orchestration`, `dag` y `airflow-architecture` están en `relations`. | pendiente |
