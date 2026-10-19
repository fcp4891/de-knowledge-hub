# ADR-016 — Contenedores en la CI: Docker real con digests fijos, hadolint, kubeconform y registry:2

- **Estado:** Aceptado
- **Fecha:** 2026-10-19
- **Fase:** F3b — Contenido por dominio, dominio 13-containers (decisiones de Felipe al aprobar el plan de 13)
- **Referencias:** ADR-014 (binarios fijados con SHA-256), ADR-015 (ejecutar sin nube), ADR-013 (Azurite con `docker run`).

## Contexto

13-containers trata de contenedores, imágenes, Dockerfiles, volúmenes, redes, Compose, registries y Kubernetes. El runner de GitHub Actions (`ubuntu-24.04`) trae Docker, que la CI ya usa para Azurite. Ejecutar los ejemplos con Docker real muestra lo que la ficha afirma (la capa escribible se pierde, un volumen persiste, un nombre resuelve en una red propia) en lugar de describirlo.

## Decisión

1. **Docker real en la CI.** `tests/test_docker_snippets.py` ejecuta los bloques ```` ```bash ```` del §10 de las fichas de 13 con Docker: `docker build`, `docker run`, volúmenes y redes (y `docker compose up` en 13b). En la CI no se saltan (`REQUIRE_DOCKER=1`); en local se saltan si Docker no responde. Cada test borra lo que crea.
2. **Imágenes fijadas por digest.** Las imágenes base de los ejemplos se fijan por digest del índice multiplataforma, consultado el 2026-10-19 con `docker buildx imagetools inspect`:
   - `alpine:3.22@sha256:5291449c3df73caf6ed85e649dec1b9e818b39a5d8c871e97afc13e9cd5e8fa8`;
   - `python:3.12-slim@sha256:a6e34c598f2467ed0e9a8d349809fcd8b5c603269512df273a0bb1784edc11b1`;
   - `registry:2@sha256:a3d8aaa63ed8681a604f1dea0aa03f100d5895b6a58ace528858a7b332415373`.
3. **registry:2 local.** Los ejemplos de push y pull usan un `registry:2` local (fijado por digest) que levanta el test en el puerto 5055. Artifact Registry, ECR y ACR quedan «no ejecutado».
4. **hadolint, binario fijado.** v2.15.1 (2026-07-31); la CI descarga `hadolint-linux-x86_64` y verifica su SHA-256 (`c7187db94eeeeca956519a6af171adc31453941a1e777961f6e680f697c8c507`, digest de la release de GitHub). `make validate-dockerfile HADOLINT=./hadolint` extrae los bloques ```` ```dockerfile ```` a `build/dockerfile/…/Dockerfile` y los revisa.
5. **kubeconform, binario fijado, sin kind.** v0.8.0 (2026-06-04); la CI descarga `kubeconform-linux-amd64.tar.gz` y verifica su SHA-256 (`9bc2bffbf71f261128533edaf912153948b7ff238f9a531ae6d34466ec287883`). `make validate-k8s KUBECONFORM=./kubeconform` extrae los bloques ```` ```yaml ```` que empiezan con `# Kubernetes` y los valida contra los esquemas de la API, sin clúster. No se usa `kind`.
6. **Lo que dice la ficha.** «Ejecutado en la CI con Docker real», «revisado con hadolint», «validado con kubeconform, no aplicado a un clúster» o «no ejecutado» (servicios de nube).

## Consecuencias

- Dependencias nuevas solo de la CI (dos binarios); Docker ya estaba. Los tests de Docker suman tiempo a `make test` por la descarga de imágenes.
- Actualizar una imagen base o un binario es cambiar el digest o el checksum en las fichas, en la CI y en este ADR.
- En local: Docker Desktop encendido para los tests; `HADOLINT=<ruta>` y `KUBECONFORM=<ruta>` para los targets.
