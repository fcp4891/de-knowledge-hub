# Revisión B-F1b · Dominio 06 Orquestación

Archivo de origen: `content/blueprint/06-orchestration.yaml`. Carril B no lo edita. Solo los cinco conceptos con `mvp: true`. El tope de ~5 de este dominio no se mueve.

| Fila | Slug | Propuesta | Estado |
|---|---|---|---|
| 1 | `dag` | Mantener `core`, `basic`, `high` y `mvp: true`. Agregar `scheduler` e `idempotency` en `related_concepts`. Nota: lo mínimo de una task idempotente va aquí; el detalle sigue en `orchestration-task`, fuera del MVP. | aprobada |
| 2 | `scheduler` | Agregar `gcp-cloud-composer` en `related_technologies`. Mantener los flags. Nota: decidir cuándo corre el DAG no es catchup. | aprobada |
| 3 | `catchup` | No pasar `classification` a `modern`. Se mantiene `core`: el §8 lo lista como concepto independiente de proveedor. | rechazada |
| 4 | `airflow-architecture` | Agregar `gcp-cloud-composer` en `related_technologies` y `open-source-vs-managed-orchestration` en `related_concepts`. Nota: webserver, scheduler, workers y base de metadatos. Composer los administra; el diagrama no es el de un Airflow auto-hospedado. Los flags se quedan. | aprobada |
| 5 | `open-source-vs-managed-orchestration` | Agregar `composer-environments` en `related_concepts`. Nota: Composer y MWAA no son Airflow con otro nombre; difieren la versión pinneada, la red y qué opera el usuario. Los flags se quedan. | aprobada |
| 6 | Los cinco MVP | Siguen en `mvp: true`. No se promueven `orchestration-task`, `sensors` ni `airflow-operators-and-hooks`. | aprobada |
