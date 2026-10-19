---
id: concept:container-registries
slug: container-registries
type: concept
title: Registries de contenedores
description: "Qué es un registry según Docker: un lugar central para guardar y compartir imágenes, con repositorios que agrupan sus versiones. Tags mutables o inmutables, limpieza de imágenes viejas y escaneo de vulnerabilidades. Ejemplo ejecutado con un registry:2 local: un tag que se mueve y un digest que no. Artifact Registry, Amazon ECR y Azure Container Registry comparados en autenticación, tags, limpieza, escaneo y cobro, con sus diferencias."
domain: containers
subdomain: container-fundamentals
category: containers
classification: core
level: basic
importance: medium
cloud: [agnostic]
technologies: [docker, gcp-artifact-registry, aws-ecr, azure-container-registry]
tags: [registry, repository, tag-immutability, cleanup-policy, vulnerability-scanning]
related_topics: [container-images]
sources:
  - source: docker-docs
    url: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-registry/
    accessed: 2026-10-19
    page_title: "What is a registry?"
    note: "What is a registry?: «An image registry is a centralized location for storing and sharing your container images»; puede ser público o privado; Docker Hub es el registry público por defecto, y hay otros como Amazon ECR, Azure Container Registry y Google Container Registry; un registry guarda y administra imágenes, mientras que un repositorio es una colección de imágenes relacionadas dentro de un registry."
  - source: docker-docs
    url: https://docs.docker.com/reference/cli/docker/image/pull/
    accessed: 2026-10-19
    page_title: "docker image pull"
    note: "docker image pull, «Pull an image by digest (immutable identifier)»: con tags, volver a hacer pull trae la versión más nueva de ese tag; para una versión fija se baja por digest."
  - source: gcp-artifact-registry-docs
    url: https://docs.cloud.google.com/artifact-registry/docs/overview
    accessed: 2026-10-19
    page_title: "Artifact Registry overview"
    note: "Artifact Registry overview: «Artifact Registry provides a single location for storing and managing your packages and Docker container images»; se integra con Cloud Build, Cloud Run y GKE; tiene repositorios remotos que cachean fuentes públicas; «Artifact Registry expands on the capabilities of Container Registry and is the recommended container registry for Google Cloud»."
  - source: gcp-artifact-registry-docs
    url: https://docs.cloud.google.com/artifact-registry/docs/docker/pushing-and-pulling
    accessed: 2026-10-19
    page_title: "Push and pull images"
    note: "Push and pull images: la ruta de una imagen es LOCATION-docker.pkg.dev/PROJECT_ID/REPOSITORY/IMAGE:TAG; Docker se autentica con el helper de credenciales (gcloud auth configure-docker LOCATION-docker.pkg.dev) y se publica con docker push."
  - source: gcp-artifact-registry-docs
    url: https://docs.cloud.google.com/artifact-registry/docs/repositories/cleanup-policy
    accessed: 2026-10-19
    page_title: "Configure cleanup policies"
    note: "Configure cleanup policies: las políticas de limpieza automatizan la retención y el borrado de artefactos, con reglas delete y keep por estado del tag, prefijos o antigüedad; se pueden probar con un dry run; corren en un job periódico y los cambios toman efecto en aproximadamente un día; ayudan a reducir el costo de almacenamiento."
  - source: gcp-artifact-registry-docs
    url: https://cloud.google.com/artifact-registry/pricing
    accessed: 2026-10-19
    page_title: "Artifact Registry pricing"
    note: "Artifact Registry pricing (consultada el 2026-10-19): se cobran el almacenamiento, la transferencia de datos que sale de los repositorios (según el origen y el destino) y el escaneo de vulnerabilidades si está activado. Los montos no se copian."
  - source: aws-ecr-docs
    url: https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html
    accessed: 2026-10-19
    page_title: "What is Amazon Elastic Container Registry?"
    note: "What is Amazon Elastic Container Registry?: «an AWS managed container image registry service that is secure, scalable, and reliable»; repositorios privados con permisos basados en recursos de AWS IAM."
  - source: aws-ecr-docs
    url: https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html
    accessed: 2026-10-19
    page_title: "Pushing a Docker image to an Amazon ECR private repository"
    note: "Pushing a Docker image to an Amazon ECR private repository: Docker se autentica con aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<region>.amazonaws.com; se repite por cada registry."
  - source: aws-ecr-docs
    url: https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-tag-mutability.html
    accessed: 2026-10-19
    page_title: "Preventing image tags from being overwritten in Amazon ECR"
    note: "Preventing image tags from being overwritten in Amazon ECR: con tag immutability activada, publicar una imagen con un tag que ya existe devuelve ImageTagAlreadyExistsException; afecta a todos los tags, salvo exclusiones (IMMUTABLE_WITH_EXCLUSION con filtros)."
  - source: aws-ecr-docs
    url: https://docs.aws.amazon.com/AmazonECR/latest/userguide/LifecyclePolicies.html
    accessed: 2026-10-19
    page_title: "Automate the cleanup of images by using lifecycle policies in Amazon ECR"
    note: "Automate the cleanup of images by using lifecycle policies in Amazon ECR: una lifecycle policy tiene reglas que archivan o expiran imágenes según criterios, dentro de las 24 horas; cada acción queda registrada en AWS CloudTrail."
  - source: aws-ecr-docs
    url: https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html
    accessed: 2026-10-19
    page_title: "Scan images for software vulnerabilities in Amazon ECR"
    note: "Scan images for software vulnerabilities in Amazon ECR: enhanced scanning se integra con Amazon Inspector (sistema operativo y paquetes de lenguajes; al subir la imagen y en forma continua); basic scanning usa la base de CVE para el sistema operativo, al subir o a mano."
  - source: aws-ecr-docs
    url: https://aws.amazon.com/ecr/pricing/
    accessed: 2026-10-19
    page_title: "Amazon Elastic Container Registry pricing"
    note: "Amazon Elastic Container Registry pricing (consultada el 2026-10-19): sin cargos iniciales; se paga el almacenamiento en los repositorios y la transferencia de datos a internet; hay dos clases de almacenamiento, ECR Standard y ECR Archive. Los montos no se copian."
  - source: azure-container-registry-docs
    url: https://learn.microsoft.com/en-us/azure/container-registry/container-registry-intro
    accessed: 2026-10-19
    page_title: "Introduction to Azure Container Registry"
    note: "Introduction to Azure Container Registry: un servicio de registry administrado basado en la plataforma Docker open source; conviene crear el registry en la misma ubicación de Azure que los despliegues; la geo-replicación es una función de los registries Premium."
  - source: azure-container-registry-docs
    url: https://learn.microsoft.com/en-us/azure/container-registry/container-registry-get-started-docker-cli
    accessed: 2026-10-19
    page_title: "Push your first image to your Azure container registry by using the Docker CLI"
    note: "Push your first image to your Azure container registry by using the Docker CLI: el método recomendado en la línea de comandos es az acr login --name <registry>; se usa siempre el nombre completo del registry en minúsculas (myregistry.azurecr.io) al etiquetar y publicar."
  - source: azure-container-registry-docs
    url: https://learn.microsoft.com/en-us/azure/container-registry/container-registry-skus
    accessed: 2026-10-19
    page_title: "Azure Container Registry SKU features and limits"
    note: "Azure Container Registry SKU features and limits: tres planes, Basic, Standard y Premium, con distinto almacenamiento incluido, throughput y funciones; Premium agrega, entre otras, geo-replicación."
  - source: azure-container-registry-docs
    url: https://azure.microsoft.com/en-us/pricing/details/container-registry/
    accessed: 2026-10-19
    page_title: "Azure Container Registry pricing"
    note: "Azure Container Registry pricing (consultada el 2026-10-19): precio por día según el plan, con almacenamiento incluido; el almacenamiento por encima de lo incluido se cobra por GB y por día. Los montos no se copian."
relations:
  - type: DEPENDS_ON
    target: container-images
    note: Un registry guarda imágenes por tag y digest.
  - type: RELATED_TO
    target: build-artifacts
    note: La imagen es el artefacto del build; el registry, su almacén.
  - type: RELATED_TO
    target: ci-cd-pipelines
    note: La CI publica la imagen en el registry.
  - type: RELATED_TO
    target: ci-cd-secrets
    note: Credenciales del registry en la CI.
  - type: RELATED_TO
    target: docker-compose-environments
    note: El entorno local baja sus imágenes de un registry.
created_at: 2026-10-19
updated_at: 2026-10-19
last_verified: 2026-10-19
verification_status: verified
---

## 1. Resumen

«An image registry is a centralized location for storing and sharing your container images». Dentro de un registry, un **repositorio** agrupa las versiones de una imagen. La CI publica ahí lo que construye y las plataformas bajan de ahí lo que corren.

Tres decisiones definen cómo se usa:

- **tags mutables o inmutables:** con tags mutables, publicar otra imagen con el mismo tag lo mueve; ECR puede rechazarlo con tag immutability;
- **limpieza:** sin reglas, el registry acumula imágenes que nadie usa y que se cobran como almacenamiento;
- **escaneo:** las vulnerabilidades se detectan al publicar o en forma continua.

## 2. Qué es

- **Registry:** el servicio que guarda y entrega imágenes (Docker Hub, Artifact Registry, ECR, ACR, `registry:2` local).
- **Repositorio:** la colección de imágenes relacionadas, como `dekh/ingesta`.
- **Referencia:** `<registry>/<repositorio>:<tag>` o `<registry>/<repositorio>@sha256:<digest>`.
- **Tag inmutable:** un tag que el registry no deja reasignar.
- **Política de limpieza:** reglas que borran o archivan imágenes por antigüedad, tag o prefijo.

## 3. Problema que resuelve

La CI construye la imagen de un job y producción necesita bajarla, con permisos, cerca de donde corre y sin que alguien la reemplace por error. Un registry de la nube da autenticación con la identidad de esa nube, un lugar cercano a la plataforma y reglas sobre tags, limpieza y escaneo.

## 4. Cómo funciona

1. La CI se autentica en el registry con un helper de credenciales o un token.
2. Etiqueta la imagen con la dirección del repositorio y la publica con `docker push`.
3. El registry guarda la imagen por digest y apunta el tag a ese digest.
4. Si llega otra imagen con el mismo tag, el tag pasa a apuntar a ella (o el registry la rechaza, si los tags son inmutables).
5. La plataforma baja la imagen por tag o por digest.

## 5. Cuándo utilizarlo

- Siempre que una imagen se construye en un lugar y corre en otro.
- El registry de la misma nube y región que la plataforma, para autenticar con su identidad y bajar cerca.
- Tags inmutables en los repositorios de producción.

## 6. Cuándo no utilizarlo

- Docker Hub público para imágenes internas.
- Un tag como única referencia de lo que corre en producción: el digest es lo que no cambia.
- Un registry sin limpieza ni escaneo.

## 7. Ejemplo sencillo

En un `registry:2` local, se publica `dekh/ingesta:1.0` con la etiqueta `build-1` y después otra imagen con el mismo tag y la etiqueta `build-2`. El tag `1.0` pasa a traer `build-2`. El digest de la primera publicación sigue trayendo `build-1`.

## 8. Ejemplo de producción

El registry de un equipo de datos:

- un repositorio por job, en la región donde corren los jobs;
- tags inmutables iguales al hash del commit, y despliegue por digest;
- escaneo al publicar, con una alerta si aparece una vulnerabilidad crítica;
- una política que conserva las últimas versiones y borra las imágenes sin tag pasado un tiempo;
- la CI publica con una identidad que solo puede escribir en sus repositorios.

## 9. Arquitectura

```mermaid
flowchart LR
  CI["CI: build"] -- "docker push :tag" --> R["Registry<br/>repositorio dekh/ingesta"]
  R -- "tag 1.0 → sha256:…" --> D["digest"]
  R -- "pull por digest" --> P["Plataforma<br/>(Cloud Run, ECS, Container Apps, Kubernetes)"]
  L["Política de limpieza"] -. "borra lo viejo" .-> R
  S["Escaneo"] -. "vulnerabilidades" .-> R
```

## 10. Código

```bash
# Bash y Docker (ejecutado en la CI con un registry:2 local; ADR-016): en un repositorio con tags mutables, publicar
# otra imagen con el mismo tag lo mueve; la imagen anterior sigue disponible por su digest.
set -euo pipefail
REGISTRY="${REGISTRY:-localhost:5055}"   # registry:2 local que levanta el test
REPO="$REGISTRY/dekh/ingesta"

publish() {   # construye una imagen con la etiqueta de versión $1, la publica como :1.0 y devuelve su digest
  docker build -q -t "$REPO:1.0" - > /dev/null <<EOF
FROM alpine:3.22@sha256:5291449c3df73caf6ed85e649dec1b9e818b39a5d8c871e97afc13e9cd5e8fa8
LABEL org.opencontainers.image.version="$1"
EOF
  docker push -q "$REPO:1.0" > /dev/null
  docker image inspect --format '{{range .RepoDigests}}{{println .}}{{end}}' "$REPO:1.0" | grep "^$REPO@" | cut -d@ -f2
}
version() { docker image inspect --format '{{index .Config.Labels "org.opencontainers.image.version"}}' "$1"; }

FIRST=$(publish build-1)
SECOND=$(publish build-2)
[ "$FIRST" != "$SECOND" ] && echo "el tag 1.0 se movió a otro digest"

docker image rm -f "$REPO:1.0" "$REPO@$FIRST" > /dev/null 2>&1 || true
docker pull -q "$REPO:1.0" > /dev/null
echo "1.0 trae hoy: $(version "$REPO:1.0")"
docker pull -q "$REPO@$FIRST" > /dev/null
echo "el digest anterior trae: $(version "$REPO@$FIRST")"
```

El script se **ejecuta en la CI con Docker real y un `registry:2` local** (ADR-016), fijado por digest. Imprime `el tag 1.0 se movió a otro digest`, `1.0 trae hoy: build-2` y `el digest anterior trae: build-1`. Contra Artifact Registry, ECR o ACR cambia la dirección del repositorio y la autenticación (§11 a §13), y eso **no se ejecutó**.

## 11. GCP

En GCP, **Artifact Registry** es el registry recomendado, según *Artifact Registry overview*. Frente al `registry:2` local, según *Push and pull images*, *Configure cleanup policies* y *Artifact Registry pricing*:

| | `registry:2` local | Artifact Registry |
|---|---|---|
| Dirección | `localhost:5055/dekh/ingesta` | `LOCATION-docker.pkg.dev/PROJECT_ID/REPOSITORY/IMAGE` |
| Autenticación | Ninguna en el ejemplo | Helper de credenciales: `gcloud auth configure-docker LOCATION-docker.pkg.dev` |
| Limpieza | — | Políticas delete y keep por tag, prefijo o antigüedad, con dry run; efecto en aproximadamente un día |
| Cobro (consultado el 2026-10-19) | — | Almacenamiento, transferencia de salida y escaneo si está activado |

## 12. AWS

En AWS, **Amazon ECR** es el registry administrado. Según *Pushing a Docker image to an Amazon ECR private repository*, *Preventing image tags from being overwritten in Amazon ECR*, *Automate the cleanup of images by using lifecycle policies in Amazon ECR*, *Scan images for software vulnerabilities in Amazon ECR* y *Amazon Elastic Container Registry pricing*:

| | `registry:2` local | Amazon ECR |
|---|---|---|
| Autenticación | Ninguna en el ejemplo | `aws ecr get-login-password` pasado a `docker login` |
| Tags | Mutables: el ejemplo mueve `1.0` | Mutables o inmutables; con inmutabilidad, el segundo push de `1.0` falla con `ImageTagAlreadyExistsException` |
| Limpieza | — | Lifecycle policies que archivan o expiran imágenes dentro de las 24 horas |
| Escaneo | — | Basic (sistema operativo) o enhanced con Amazon Inspector (sistema operativo y paquetes, continuo) |
| Cobro (consultado el 2026-10-19) | — | Almacenamiento (Standard y Archive) y transferencia a internet |

## 13. Azure

En Azure, **Azure Container Registry** es el registry administrado. Según *Push your first image to your Azure container registry by using the Docker CLI*, *Azure Container Registry SKU features and limits* y *Azure Container Registry pricing*:

| | `registry:2` local | Azure Container Registry |
|---|---|---|
| Dirección | `localhost:5055` | `<registry>.azurecr.io`, en minúsculas |
| Autenticación | Ninguna en el ejemplo | `az acr login --name <registry>` |
| Planes | — | Basic, Standard y Premium; geo-replicación en Premium |
| Cobro (consultado el 2026-10-19) | — | Precio por día según el plan, con almacenamiento incluido; lo que excede, por GB y por día |

## 14. Buenas prácticas

- Un repositorio por imagen y tags únicos por build.
- Tags inmutables donde el registry lo permita, y despliegue por digest.
- Registry en la misma región que la plataforma.
- **Seguridad:** la CI publica con una identidad que solo escribe en sus repositorios; las plataformas solo leen; escaneo activado.
- **Observabilidad:** en ECR, las acciones de las lifecycle policies quedan en CloudTrail; registrar en el despliegue el digest que se bajó.
- **Costo:** los tres cobran el almacenamiento (consultado el 2026-10-19); una política de limpieza evita pagar por imágenes que nadie usa.

## 15. Errores frecuentes

- Republicar un tag y desplegar sin saber qué imagen corre.
- Credenciales de larga duración del registry guardadas en la CI.
- Un registry en otra región que la plataforma.
- Una política de limpieza sin dry run que borra imágenes en uso.

## 16. Trade-offs

Tags mutables son cómodos para desarrollo y peligrosos en producción; los inmutables obligan a un tag nuevo por build. La limpieza agresiva ahorra almacenamiento y puede borrar una imagen que se necesita para volver atrás. El escaneo continuo detecta vulnerabilidades nuevas en imágenes viejas, con un costo según el registry.

## 17. Conceptos relacionados

- `container-images`: lo que guarda el registry.
- `build-artifacts`: construir una vez y publicar.
- `ci-cd-pipelines`: la CI que publica.
- `ci-cd-secrets`: credenciales del registry.
- `docker-compose-environments`: el entorno local que baja imágenes.

## 18. Preguntas técnicas abiertas

1. ¿Puede alguien hoy republicar el tag que corre en producción?
2. ¿Cuántas imágenes guarda tu registry que nadie va a volver a usar?
3. ¿Quién se entera cuando una imagen en uso tiene una vulnerabilidad nueva?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Docker: *What is a registry?* y *docker image pull*.
- Google Cloud: *Artifact Registry overview*, *Push and pull images*, *Configure cleanup policies* y *Artifact Registry pricing*.
- AWS: *What is Amazon Elastic Container Registry?*, *Pushing a Docker image to an Amazon ECR private repository*, *Preventing image tags from being overwritten in Amazon ECR*, *Automate the cleanup of images by using lifecycle policies in Amazon ECR*, *Scan images for software vulnerabilities in Amazon ECR* y *Amazon Elastic Container Registry pricing*.
- Microsoft Learn: *Introduction to Azure Container Registry*, *Push your first image to your Azure container registry by using the Docker CLI*, *Azure Container Registry SKU features and limits* y *Azure Container Registry pricing*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-19. Pasa a `verified`: revisión B-F3.1 del lote F3b-13b aplicada, sin VERIFY pendientes.

## 22. Historial de cambios importantes

- 2026-10-19: creación (lote F3b-13b).
- 2026-10-19: revisión B-F3.1 del lote F3b-13b aplicada (docs/reviews/cards-f3b-13b.md): sin hallazgos en esta ficha; sin cambios.
- 2026-10-19: `verification_status: verified` (sin VERIFY pendientes).
