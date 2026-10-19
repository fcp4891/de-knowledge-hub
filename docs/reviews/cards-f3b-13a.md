# Revisión B-F3.1 · lote F3b-13a

Rama `b/f3b-review-13a`, creada desde `origin/main` (`ee15ab8`). El pedido es `4266da3`. Fichas: `containers`, `container-images`, `dockerfile`, `container-volumes` y `container-networking`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| En *AWS Fargate Pricing*, la duración se cobra por segundo con un mínimo de 1 minuto y se redondea hacia arriba. `containers` dice «redondeado al segundo» y no menciona el mínimo. `container-images` dice que el cobro corre desde la descarga hasta que termina la tarea, también sin el mínimo. | media | Citar «per second with a 1-minute minimum» y «rounded up to the nearest second». |
| *Cloud Run pricing* dice «rounded up to the nearest 100 milliseconds». `containers` lo resume como «redondeados a los 100 ms más cercanos». | baja | Decir que se redondea hacia arriba al tramo de 100 ms. |
| En `dockerfile`, el cuerpo cita «Once a layer changes, then all downstream layers need to be rebuilt» y la página sigue con «as well». La nota de la fuente trae la frase completa. | baja | Cerrar la cita con «as well». |

## Validación

```
OK: 476 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`.

## Docker en la CI

Lo que cada ficha dice que imprimió el script está en `tests/test_docker_snippets.py`:

```
SI pid del proceso principal: 1
SI sin checkpoint: el contenedor nuevo arranca de la imagen
SI capas: 1
SI bajada por digest: dekh-base
SI usuario de la imagen: 10001
SI "rows": 2, "total": 14.75
SI corrida 1: ya procesados 0, ahora 2
SI corrida 2: ya procesados 2, ahora 2
SI la entrada es de solo lectura
SI red propia: datos-api responde
SI bridge por defecto: el nombre no resuelve
```

```
tests/test_docker_snippets.py
  130:    assert "etapa test: el código compila" in out
```

`container-images` dice que publicar en Artifact Registry, ECR o ACR no se ejecutó. Estas cinco fichas no traen manifiestos de Kubernetes.

## Cifras y citas

Páginas consultadas el 2026-10-19. 29 URLs distintas: 28 `page_title` coinciden con un `h1`. *Cloud Run pricing* no trae `h1`; el `<title>` es «Cloud Run pricing».

```
HIT 20 GiB: receive a minimum of 20 GiB of ephemeral storage
HIT 200 GiB: up to a maximum of 200 GiB ... ephemeralStorage
HIT 1.4.0: platform version 1.4.0 or later
HIT 10 second: a 10 second period before the actual shutdown ... SIGKILL
HIT 8 GB: container images totaling up to 8 GB for each app or job replica
HIT /27 ... minimum required subnet size is /27
HIT /23 ... minimum required subnet size is /23
```

Las citas entre comillas de Docker («Simply put, containers are isolated processes…», «Image tags are mutable», «Volumes are the preferred mechanism for persisting data…», «User-defined bridges provide automatic DNS resolution between containers») están en sus páginas. La de la caché también, con el «as well» que el cuerpo de `dockerfile` recorta.

Fargate, salida de la página de precios:

```
Duration Pricing is calculated per second with a 1-minute minimum.
Duration is calculated from the time you start to download your container image
until the Amazon ECS Task ... terminates, rounded up to the nearest second.
```

Cloud Run:

```
rounded up to the nearest 100 millisecond
Billable instance time is rounded up to the nearest 100 milliseconds
```

## OCI

`opencontainers-image-spec` es Nivel 4 y solo está en `container-images`. El cuerpo la usa para la definición: manifiesto, índice opcional, capas y configuración. La frase de la especificación v1.1.1 está en el Markdown de la etiqueta `v1.1.1`. El `h1` de esa página incluye «Open Container Initiative», que es el `page_title`.

## Estructura

```
containers page_title 14/14 rels17 ok topics ok dollars none s11 True s12 True s13 True seg True obs True costo True mentioned_not_rel ok
container-images page_title 9/9 rels17 ok topics ok dollars none s11 True s12 True s13 True seg True obs True costo True mentioned_not_rel ok
dockerfile page_title 8/8 rels17 ok topics ok dollars none s11 True s12 True s13 True seg True obs True costo True mentioned_not_rel ok
container-volumes page_title 9/9 rels17 ok topics ok dollars none s11 True s12 True s13 True seg True obs True costo True mentioned_not_rel ok
container-networking page_title 5/5 rels17 ok topics ok dollars none s11 True s12 True s13 True seg True obs True costo True mentioned_not_rel ok
```

§11, §12 y §13 son tablas. Cada sección nombra la página del lado de la nube; el lado Docker sale de `docker-docs` en la misma ficha. No hay montos en dólares. §14 trae Seguridad, Observabilidad y Costo. Cada `relations` está en el §17.
