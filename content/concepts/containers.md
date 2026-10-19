---
id: concept:containers
slug: containers
type: concept
title: Contenedores
description: "Qué es un contenedor según Docker: un proceso aislado con los archivos que necesita, que comparte el kernel del host y arranca de una imagen. Lo que escribe en su capa escribible se pierde al borrarlo; por eso se diseña efímero. Ejemplo ejecutado con Docker real: el proceso es el PID 1 y un checkpoint escrito adentro no sobrevive. Cómo corren los contenedores en Cloud Run, ECS con Fargate y Container Apps, con sus diferencias."
domain: containers
subdomain: container-fundamentals
category: containers
classification: core
level: basic
importance: high
cloud: [agnostic]
technologies: [docker, gcp-cloud-run, aws-ecs, aws-fargate, azure-container-apps]
tags: [containers, docker, ephemeral, pid-1, writable-layer]
related_topics: [container-images]
sources:
  - source: docker-docs
    url: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/
    accessed: 2026-10-19
    page_title: "What is a container?"
    note: "What is a container?: «Simply put, containers are isolated processes for each of your app's components»; un contenedor es autocontenido (no depende de lo instalado en el host), aislado, independiente (se borra sin afectar a otros) y portable. Frente a una VM, que es un sistema operativo entero con su kernel, un contenedor es un proceso aislado con los archivos que necesita, y varios contenedores comparten el mismo kernel."
  - source: docker-docs
    url: https://docs.docker.com/engine/storage/
    accessed: 2026-10-19
    page_title: "Storage"
    note: "Storage: por defecto, los datos de un contenedor se escriben en una capa escribible sobre las capas de la imagen, que son de solo lectura e inmutables; «Data written to the container layer doesn't persist when the container is destroyed»; la capa escribible es única por contenedor."
  - source: docker-docs
    url: https://docs.docker.com/build/building/best-practices/
    accessed: 2026-10-19
    page_title: "Building best practices"
    note: "Building best practices, «Create ephemeral containers»: la imagen debe generar contenedores lo más efímeros posible, que se puedan detener, destruir y reemplazar con un mínimo de configuración."
  - source: docker-docs
    url: https://docs.docker.com/reference/cli/docker/container/run/
    accessed: 2026-10-19
    page_title: "docker container run"
    note: "docker container run: crea y arranca un contenedor desde una imagen; --rm lo borra al terminar. El espacio de nombres de PID aísla los procesos y permite reusar los ids, incluido el PID 1; Linux trata en forma especial a un proceso que corre como PID 1 dentro de un contenedor: ignora las señales con acción por defecto, así que no termina con SIGINT o SIGTERM salvo que esté programado para eso; --init usa un proceso init como PID 1. --restart fija la política de reinicio al salir el contenedor; por defecto, no."
  - source: docker-docs
    url: https://docs.docker.com/reference/dockerfile/
    accessed: 2026-10-19
    page_title: "Dockerfile reference"
    note: "Dockerfile reference, ENTRYPOINT: con la forma shell, el ejecutable corre como subcomando de /bin/sh -c, no es el PID 1 del contenedor y no recibe las señales Unix, por ejemplo el SIGTERM de docker stop; con la forma exec sí las recibe."
  - source: gcp-cloud-run-docs
    url: https://docs.cloud.google.com/run/docs/container-contract
    accessed: 2026-10-19
    page_title: "Container runtime contract"
    note: "Container runtime contract: los ejecutables de la imagen deben estar compilados para Linux 64-bit (ABI x86_64). El sistema de archivos del contenedor es escribible y en memoria: escribir usa la memoria de la instancia y los datos no persisten al detenerse la instancia. Antes de apagar una instancia, Cloud Run envía SIGTERM a todos sus contenedores, que marca un período de 10 segundos antes de SIGKILL."
  - source: gcp-cloud-run-docs
    url: https://cloud.google.com/run/pricing
    accessed: 2026-10-19
    page_title: "Cloud Run pricing"
    note: "Cloud Run pricing (consultada el 2026-10-19): se cobran los recursos usados, redondeados hacia arriba al tramo de 100 ms («rounded up to the nearest 100 millisecond»); hay facturación por solicitud (por defecto) y por instancia. Los montos no se copian."
  - source: aws-ecs-docs
    url: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html
    accessed: 2026-10-19
    page_title: "What is Amazon Elastic Container Service?"
    note: "What is Amazon Elastic Container Service?: «a fully managed container orchestration service that helps you easily deploy, manage, and scale containerized applications»."
  - source: aws-ecs-docs
    url: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html
    accessed: 2026-10-19
    page_title: "Amazon ECS task definitions"
    note: "Amazon ECS task definitions: una task definition es un blueprint en JSON que describe los parámetros y uno o más contenedores de la aplicación: la capacidad (por ejemplo Fargate), la imagen de cada contenedor, CPU y memoria, el modo de red, los logs, el comando que corre el contenedor al arrancar, los volúmenes y el rol de IAM."
  - source: aws-ecs-docs
    url: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-task-storage.html
    accessed: 2026-10-19
    page_title: "Fargate task ephemeral storage for Amazon ECS"
    note: "Fargate task ephemeral storage for Amazon ECS: las tareas en Fargate (plataforma 1.4.0 o posterior en Linux) reciben un mínimo de 20 GiB de almacenamiento efímero, ampliable hasta 200 GiB con el parámetro ephemeralStorage de la task definition; la imagen descargada se guarda en ese almacenamiento."
  - source: aws-ecs-docs
    url: https://aws.amazon.com/fargate/pricing/
    accessed: 2026-10-19
    page_title: "AWS Fargate Pricing"
    note: "AWS Fargate Pricing (consultada el 2026-10-19): se cobran vCPU, memoria, sistema operativo, arquitectura y almacenamiento; «Pricing is calculated per second with a 1-minute minimum», y la duración va desde que empieza la descarga de la imagen hasta que termina la tarea, «rounded up to the nearest second». Los montos no se copian."
  - source: azure-container-apps-docs
    url: https://learn.microsoft.com/en-us/azure/container-apps/containers
    accessed: 2026-10-19
    page_title: "Containers in Azure Container Apps"
    note: "Containers in Azure Container Apps: Container Apps administra Kubernetes y la orquestación; acepta cualquier imagen Linux x86-64 (linux/amd64) de cualquier registry público o privado, con sidecars e init containers opcionales. Si un contenedor de una app falla, se reinicia automáticamente; en un job, un contenedor que sale con un código distinto de cero marca la ejecución como fallida."
  - source: azure-container-apps-docs
    url: https://learn.microsoft.com/en-us/azure/container-apps/storage-mounts
    accessed: 2026-10-19
    page_title: "Use storage mounts in Azure Container Apps"
    note: "Use storage mounts in Azure Container Apps: el almacenamiento con alcance de contenedor es efímero y desaparece cuando el contenedor se apaga o se reinicia; solo lo ven los procesos de ese contenedor."
  - source: azure-container-apps-docs
    url: https://azure.microsoft.com/en-us/pricing/details/container-apps/
    accessed: 2026-10-19
    page_title: "Azure Container Apps pricing"
    note: "Azure Container Apps pricing (consultada el 2026-10-19): el plan Consumption se cobra por asignación de recursos por segundo y por solicitudes; el plan Dedicated, por vCPU-segundo y GiB-segundo asignados más un cargo base de administración. Los montos no se copian."
relations:
  - type: DEPENDS_ON
    target: container-images
    note: Un contenedor arranca de una imagen.
  - type: RELATED_TO
    target: dockerfile
    note: El Dockerfile define la imagen y el proceso que corre el contenedor.
  - type: RELATED_TO
    target: container-volumes
    note: Lo que debe sobrevivir al contenedor va a un volumen.
  - type: RELATED_TO
    target: container-networking
    note: Cómo se comunican los contenedores.
  - type: RELATED_TO
    target: checkpoints
    note: Un checkpoint en la capa escribible se pierde con el contenedor.
  - type: RELATED_TO
    target: idempotency
    note: Un contenedor efímero se puede reintentar si el job es idempotente.
  - type: RELATED_TO
    target: cloud-run-for-data
    note: Contenedores serverless en GCP.
  - type: RELATED_TO
    target: container-apps-for-data
    note: Contenedores serverless en Azure.
created_at: 2026-10-19
updated_at: 2026-10-19
last_verified: 2026-10-19
verification_status: verified
---

## 1. Resumen

Según Docker, «containers are isolated processes for each of your app's components». Un contenedor es un proceso del sistema operativo que corre aislado, con los archivos que necesita, y que arranca de una imagen. A diferencia de una máquina virtual, no trae su propio kernel: todos los contenedores de un host comparten el mismo.

Para Data Engineering importan dos consecuencias:

- **el job corre igual en la laptop, en la CI y en la nube**, porque lleva sus dependencias;
- **lo que el contenedor escribe en su capa escribible se pierde al borrarlo**: los datos que deben sobrevivir van a un volumen o a almacenamiento externo.

## 2. Qué es

- **Contenedor:** un proceso aislado, creado desde una imagen, con una capa escribible propia.
- **Imagen:** el paquete de solo lectura del que arranca (ver `container-images`).
- **Capa escribible:** donde el contenedor escribe por defecto; es única por contenedor y se borra con él.
- **PID 1:** el proceso principal del contenedor, en su propio espacio de nombres de procesos. Linux lo trata en forma especial con las señales.
- **Efímero:** un contenedor que se puede detener, borrar y reemplazar con una configuración mínima.

## 3. Problema que resuelve

Un job de ingesta en Python funciona en la laptop de quien lo escribió y falla en el servidor porque hay otra versión de Python o falta una biblioteca. Con un contenedor, el job lleva su runtime y sus dependencias. El servidor solo necesita un runtime de contenedores.

## 4. Cómo funciona

1. `docker run` crea un contenedor desde la imagen y arranca su proceso principal.
2. El proceso ve su propio árbol de procesos, en el que él es el PID 1, y un sistema de archivos que une las capas de la imagen con una capa escribible.
3. Lo que escribe va a la capa escribible. Otro contenedor de la misma imagen no lo ve.
4. Cuando el proceso termina, el contenedor se detiene; con `--rm`, Docker lo borra, y la capa escribible desaparece con él.

## 5. Cuándo utilizarlo

- Jobs de ingesta y transformación que deben correr igual en local, en la CI y en producción.
- Cargas que una plataforma de contenedores (Cloud Run, ECS, Container Apps) ejecuta y escala por ti.
- Herramientas con dependencias que no quieres instalar en el host, como una base de datos para pruebas.

## 6. Cuándo no utilizarlo

- Como lugar donde guardar datos: la capa escribible no persiste.
- Cuando el proceso necesita un kernel distinto del host: los contenedores comparten el kernel.
- Para un script de una línea sin dependencias, donde el contenedor solo agrega pasos.

## 7. Ejemplo sencillo

Un contenedor de Alpine escribe `lote 42` en `/tmp/checkpoint.txt` y termina. Se borra. Un contenedor nuevo de la misma imagen busca ese archivo y no lo encuentra: arranca de la imagen, no del contenedor anterior.

## 8. Ejemplo de producción

Un job diario de carga:

- corre en un contenedor que la plataforma crea para cada ejecución y borra al terminar;
- lee la entrada de un bucket y escribe el resultado en otro bucket o en el warehouse, nunca en su propio disco;
- guarda su avance en almacenamiento externo, para que un reintento continúe donde quedó;
- es idempotente, porque la plataforma puede reintentarlo.

## 9. Arquitectura

```mermaid
flowchart LR
  I["Imagen<br/>(capas de solo lectura)"] --> C1["Contenedor 1<br/>+ capa escribible"]
  I --> C2["Contenedor 2<br/>+ capa escribible"]
  C1 -. "docker rm:<br/>la capa se borra" .-> X["(nada)"]
  K["Kernel del host<br/>(compartido)"] --- C1
  K --- C2
```

## 10. Código

```bash
# Bash y Docker (ejecutado en la CI con Docker real; ADR-016): un contenedor es un proceso aislado que arranca de una
# imagen. Lo que escribe en su capa escribible desaparece al borrarlo; otro contenedor de la misma imagen no lo ve.
set -euo pipefail
IMG="alpine:3.22@sha256:5291449c3df73caf6ed85e649dec1b9e818b39a5d8c871e97afc13e9cd5e8fa8"  # fijada por digest

docker run --rm "$IMG" sh -c 'echo "pid del proceso principal: $$"'      # el proceso del contenedor es el PID 1
docker run --name extract-1 "$IMG" sh -c 'echo "lote 42" > /tmp/checkpoint.txt'
docker rm extract-1 > /dev/null                                          # se borra con su capa escribible
docker run --rm "$IMG" sh -c 'cat /tmp/checkpoint.txt 2>/dev/null || echo "sin checkpoint: el contenedor nuevo arranca de la imagen"'
```

El script se **ejecuta en la CI con Docker real** (ADR-016), con la imagen de Alpine fijada por digest. Muestra que el proceso del contenedor es el PID 1 (`pid del proceso principal: 1`) y que un archivo escrito en un contenedor borrado no aparece en otro (`sin checkpoint: el contenedor nuevo arranca de la imagen`).

## 11. GCP

En GCP, **Cloud Run** ejecuta contenedores sin servidores que administrar (ver `cloud-run-for-data`). Las diferencias con un contenedor en Docker local, según *Container runtime contract* y *Cloud Run pricing*:

| | Docker local | Cloud Run |
|---|---|---|
| Qué ejecuta | Un contenedor desde una imagen, en el kernel del host | Contenedores con ejecutables para Linux 64-bit (ABI x86_64) |
| Escritura local | Capa escribible; se borra con el contenedor | Sistema de archivos en memoria: usa la memoria de la instancia y no persiste |
| Al apagar | `docker stop` envía SIGTERM al PID 1 | SIGTERM a todos los contenedores y 10 segundos antes de SIGKILL |
| Cobro (consultado el 2026-10-19) | — | Recursos usados, redondeados hacia arriba al tramo de 100 ms; facturación por solicitud o por instancia |

## 12. AWS

En AWS, **Amazon ECS** orquesta contenedores y **Fargate** les da cómputo sin servidores que administrar. Las diferencias, según *Amazon ECS task definitions*, *Fargate task ephemeral storage for Amazon ECS* y *AWS Fargate Pricing*:

| | Docker local | ECS con Fargate |
|---|---|---|
| Qué ejecuta | `docker run` con sus opciones | Una task definition en JSON: imagen, CPU, memoria, red, comando y rol de IAM de cada contenedor |
| Escritura local | Capa escribible; se borra con el contenedor | Almacenamiento efímero de la tarea: 20 GiB como mínimo, hasta 200 GiB con `ephemeralStorage` |
| Cobro (consultado el 2026-10-19) | — | vCPU, memoria, sistema operativo, arquitectura y almacenamiento, por segundo con un mínimo de 1 minuto, desde que empieza la descarga de la imagen hasta que termina la tarea, redondeado hacia arriba al segundo |

## 13. Azure

En Azure, **Container Apps** ejecuta contenedores y administra Kubernetes por ti (ver `container-apps-for-data`). Las diferencias, según *Containers in Azure Container Apps*, *Use storage mounts in Azure Container Apps* y *Azure Container Apps pricing*:

| | Docker local | Container Apps |
|---|---|---|
| Qué ejecuta | Cualquier imagen que corra en el host | Imágenes Linux x86-64 (`linux/amd64`) de cualquier registry |
| Si el proceso falla | Se reinicia según `--restart` (por defecto, no) | En una app se reinicia solo; en un job, un código de salida distinto de cero marca la ejecución como fallida |
| Escritura local | Capa escribible; se borra con el contenedor | Almacenamiento del contenedor, efímero: desaparece cuando se apaga o se reinicia |
| Cobro (consultado el 2026-10-19) | — | Consumption: recursos asignados por segundo y solicitudes; Dedicated: vCPU-segundo y GiB-segundo más un cargo base |

## 14. Buenas prácticas

- Diseñar contenedores efímeros: nada que no se pueda perder en la capa escribible.
- Un proceso principal en forma exec, que reciba SIGTERM y termine bien.
- Imágenes fijadas por digest para que cada ejecución use lo mismo (ver `container-images`).
- **Seguridad:** el contenedor aísla procesos, pero comparte el kernel del host; correr como usuario sin privilegios (ver `dockerfile`).
- **Observabilidad:** un archivo de log escrito en la capa escribible se borra con el contenedor; los logs que deben quedar se envían fuera de él.
- **Costo:** en Cloud Run, Fargate y Container Apps se paga el tiempo y los recursos del contenedor (consultado el 2026-10-19), así que un job que termina apenas acaba cuesta menos que uno que queda esperando.

## 15. Errores frecuentes

- Guardar el estado del job en el sistema de archivos del contenedor y perderlo en el reintento.
- Tratar un contenedor como una máquina virtual: entrar con una shell y cambiarlo a mano.
- Un proceso principal que ignora SIGTERM y termina por SIGKILL a mitad de una escritura.
- Llenar el sistema de archivos en memoria de Cloud Run y quedarse sin memoria.

## 16. Trade-offs

Un contenedor arranca rápido y es liviano porque comparte el kernel del host; a cambio, aísla menos que una máquina virtual. Que sea efímero facilita reintentar y escalar, y obliga a sacar el estado afuera. Las plataformas administradas quitan el trabajo de operar servidores, con sus propias reglas: en Cloud Run el disco es memoria, en Fargate el almacenamiento efímero tiene un tamaño configurable y en Container Apps la app se reinicia sola.

## 17. Conceptos relacionados

- `container-images`: de dónde arranca el contenedor.
- `dockerfile`: cómo se define la imagen y su proceso principal.
- `container-volumes`: dónde guardar lo que debe sobrevivir.
- `container-networking`: cómo se comunican los contenedores.
- `checkpoints`: el avance de un job, fuera del contenedor.
- `idempotency`: para que reintentar el contenedor sea seguro.
- `cloud-run-for-data`: contenedores serverless en GCP.
- `container-apps-for-data`: contenedores serverless en Azure.

## 18. Preguntas técnicas abiertas

1. ¿Qué escribe hoy tu job en su disco local que se perdería en un reintento?
2. ¿Cómo sabe tu proceso que la plataforma lo va a apagar?
3. ¿Qué parte de tu pipeline necesita un kernel o un sistema operativo distinto?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Docker: *What is a container?*, *Storage*, *Building best practices*, *docker container run* y *Dockerfile reference*.
- Google Cloud: *Container runtime contract* y *Cloud Run pricing*.
- AWS: *What is Amazon Elastic Container Service?*, *Amazon ECS task definitions*, *Fargate task ephemeral storage for Amazon ECS* y *AWS Fargate Pricing*.
- Microsoft Learn: *Containers in Azure Container Apps*, *Use storage mounts in Azure Container Apps* y *Azure Container Apps pricing*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-19. Pasa a `verified`: revisión B-F3.1 del lote F3b-13a aplicada, sin VERIFY pendientes.

## 22. Historial de cambios importantes

- 2026-10-19: creación (lote F3b-13a).
- 2026-10-19: revisión B-F3.1 del lote F3b-13a aplicada (docs/reviews/cards-f3b-13a.md): Fargate cita «per second with a 1-minute minimum» y «rounded up to the nearest second»; Cloud Run redondea hacia arriba al tramo de 100 ms (*AWS Fargate Pricing* y *Cloud Run pricing*, consultadas el 2026-10-19).
- 2026-10-19: `verification_status: verified` (sin VERIFY pendientes).
