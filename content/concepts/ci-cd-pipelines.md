---
id: concept:ci-cd-pipelines
slug: ci-cd-pipelines
type: concept
title: Pipelines de CI/CD
description: "Qué es un pipeline de CI/CD y cómo se arma según cada plataforma: en GitHub Actions, workflows con eventos, jobs en paralelo salvo dependencias (needs) y pasos en un runner; en GitLab, stages que ordenan jobs paralelos; en Azure Pipelines, triggers, stages, jobs y agentes; en Cloud Build, pasos que corren como contenedores; en AWS, CodeBuild con su buildspec y CodePipeline para las etapas. Cobro de cada una, sin montos."
domain: devops
subdomain: ci-cd
category: devops
classification: core
level: intermediate
importance: high
cloud: [agnostic]
technologies: [github-actions, gitlab-ci, azure-devops]
tags: [ci-cd, github-actions, gitlab-ci, azure-pipelines, cloud-build, codebuild]
related_topics: [automated-testing-in-ci]
sources:
  - source: github-docs
    url: https://docs.github.com/en/actions/get-started/understand-github-actions
    accessed: 2026-10-14
    page_title: "Understanding GitHub Actions"
    note: "Understanding GitHub Actions: plataforma de CI/CD para automatizar build, test y despliegue; un workflow es un proceso automatizado en YAML dentro de .github/workflows que corre uno o más jobs, disparado por un evento del repositorio, a mano o por horario; un job es un conjunto de pasos en el mismo runner, que corren en orden y comparten datos; por defecto los jobs no tienen dependencias y corren en paralelo; un runner corre un job a la vez y cada corrida usa una máquina virtual nueva."
  - source: github-docs
    url: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
    accessed: 2026-10-14
    page_title: "Workflow syntax for GitHub Actions"
    note: "Workflow syntax for GitHub Actions: concurrency asegura que corra a la vez un solo job o workflow del mismo grupo, y cancel-in-progress: true cancela el que estaba corriendo; permissions modifica los permisos por defecto del GITHUB_TOKEN para dar solo el acceso mínimo, a nivel de workflow o de job."
  - source: github-docs
    url: https://docs.github.com/en/billing/concepts/product-billing/github-actions
    accessed: 2026-10-14
    page_title: "GitHub Actions billing"
    note: "GitHub Actions billing: el uso es gratis con runners propios (self-hosted) y en repositorios públicos con runners estándar de GitHub; en repositorios privados, cada cuenta recibe una cuota de minutos y de almacenamiento según su plan, y el exceso se cobra; los runners más grandes siempre se cobran. Los montos no se copian."
  - source: gitlab-docs
    url: https://docs.gitlab.com/ci/
    accessed: 2026-10-14
    page_title: "Get started with GitLab CI/CD"
    note: "Get started with GitLab CI/CD: el archivo .gitlab-ci.yml en la raíz define stages, jobs y scripts del pipeline; los stages fijan el orden (por ejemplo build, test y deploy) y los jobs, las tareas de cada stage; los runners son los agentes que corren los jobs, opcionalmente en una imagen de contenedor."
  - source: gitlab-docs
    url: https://docs.gitlab.com/ci/yaml/
    accessed: 2026-10-14
    page_title: "CI/CD YAML syntax reference"
    note: "CI/CD YAML syntax reference, stages: sin stages declarados, los stages por defecto son .pre, build, test, deploy y .post; los jobs de un mismo stage corren en paralelo y los del stage siguiente corren cuando los del anterior terminan bien."
  - source: azure-devops-docs
    url: https://learn.microsoft.com/en-us/azure/devops/pipelines/get-started/key-pipelines-concepts?view=azure-devops
    accessed: 2026-10-14
    page_title: "Key Azure Pipelines concepts"
    note: "Key Azure Pipelines concepts: un trigger es el evento que hace correr un pipeline (manual, por horario, por push o al terminar otro build); un stage es un límite lógico (build, test, producción) con uno o más jobs, y los stages corren uno tras otro por defecto; un job es un conjunto de pasos secuenciales en el mismo agente; un agente corre un job a la vez; las aprobaciones y checks validan antes de que corra un stage."
  - source: azure-devops-docs
    url: https://azure.microsoft.com/en-us/pricing/details/devops/azure-devops-services/
    accessed: 2026-10-14
    page_title: "Pricing for Azure DevOps"
    note: "Pricing for Azure DevOps: Azure Pipelines se cobra por jobs en paralelo (Microsoft-hosted o self-hosted), con un job gratis de cada tipo y cobro por cada job en paralelo adicional. Los montos no se copian."
  - source: gcp-cloud-build-docs
    url: https://docs.cloud.google.com/build/docs/overview
    accessed: 2026-10-14
    page_title: "Overview of Cloud Build"
    note: "Overview of Cloud Build: servicio que ejecuta builds en Google Cloud a partir de un archivo de configuración en YAML o JSON; por cada paso del build ejecuta un contenedor de Docker como una instancia de docker run; los artifacts construidos se pueden subir a Artifact Registry."
  - source: gcp-cloud-build-docs
    url: https://cloud.google.com/build/pricing
    accessed: 2026-10-14
    page_title: "Cloud Build pricing"
    note: "Cloud Build pricing: cobra por build-minutos consumidos mientras el build está en proceso (los minutos parciales, por segundo), con una cuota mensual gratis por cuenta de facturación; no se cobra el tiempo en cola; el precio depende del tipo de máquina. Los montos no se copian."
  - source: aws-codebuild-docs
    url: https://docs.aws.amazon.com/codebuild/latest/userguide/welcome.html
    accessed: 2026-10-14
    page_title: "What is AWS CodeBuild?"
    note: "What is AWS CodeBuild?: servicio de build administrado que compila el código, corre tests unitarios y produce artifacts listos para desplegar, sin servidores de build propios."
  - source: aws-codebuild-docs
    url: https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html
    accessed: 2026-10-14
    page_title: "Build specification reference for CodeBuild"
    note: "Build specification reference for CodeBuild: un buildspec es una colección de comandos de build y opciones en YAML; va con el código o se define en el proyecto; se organiza en fases (install, pre_build, build, post_build)."
  - source: aws-codebuild-docs
    url: https://aws.amazon.com/codebuild/pricing/
    accessed: 2026-10-14
    page_title: "AWS CodeBuild pricing"
    note: "AWS CodeBuild pricing: pago por uso, sin costos iniciales; se cobra el cómputo según la duración del build, con una tarifa que depende del tipo de cómputo elegido. Los montos no se copian."
  - source: aws-codepipeline-docs
    url: https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html
    accessed: 2026-10-14
    page_title: "What is AWS CodePipeline?"
    note: "What is AWS CodePipeline?: servicio de entrega continua para modelar, visualizar y automatizar los pasos de un release, configurando las etapas del proceso."
relations:
  - type: RELATED_TO
    target: automated-testing-in-ci
    note: Los tests son el job central del pipeline de CI.
  - type: RELATED_TO
    target: build-artifacts
    note: El pipeline construye y guarda los artifacts.
  - type: RELATED_TO
    target: pull-requests
    note: El pipeline corre en cada pull request y sus resultados son checks.
  - type: RELATED_TO
    target: git-tags-and-releases
    note: Un push de tag dispara el pipeline de release.
  - type: RELATED_TO
    target: infrastructure-as-code
    note: El Terraform se valida y aplica desde el pipeline.
created_at: 2026-10-14
updated_at: 2026-10-14
last_verified: 2026-10-14
verification_status: review_required
---

## 1. Resumen

Un pipeline de CI/CD automatiza lo que pasa después de un push: construir, probar y desplegar. Las plataformas usan nombres distintos para las mismas piezas:

- un **disparador** (evento, trigger): push, pull request, tag, horario;
- **etapas o jobs**: unidades que corren en un agente o runner;
- **pasos**: comandos o acciones dentro de un job, en orden.

Lo que cambia entre plataformas es cómo se ordenan los jobs. En GitHub Actions corren en paralelo salvo que declaren dependencias (`needs`). En GitLab, los stages fijan el orden y los jobs de un mismo stage corren en paralelo.

## 2. Qué es

| Pieza | GitHub Actions | GitLab CI/CD |
|---|---|---|
| Archivo | YAML en `.github/workflows/` | `.gitlab-ci.yml` en la raíz |
| Disparo | Evento del repositorio, manual o por horario | Pipeline definido en `.gitlab-ci.yml` |
| Orden | Jobs en paralelo por defecto; `needs` para dependencias | Stages en orden; jobs de un stage en paralelo |
| Ejecución | Runner: un job a la vez, máquina virtual nueva por corrida | Runner: agente que corre los jobs, con imagen opcional |

## 3. Problema que resuelve

Sin pipeline, alguien corre los tests en su máquina (o no) y despliega a mano. En una plataforma de datos eso termina en DAGs rotos en producción, modelos sin probar y nadie sabe qué versión corre. El pipeline hace que cada cambio pase por los mismos pasos, en una máquina limpia.

## 4. Cómo funciona

En GitHub Actions:

1. Un evento (push a main, pull request) dispara el workflow.
2. Cada job corre en un runner nuevo; sus pasos comparten el sistema de archivos.
3. `needs: lint` hace que el job de tests espere al de lint.
4. `concurrency` con `cancel-in-progress: true` cancela la corrida anterior de la misma rama cuando llega una nueva.
5. `permissions` deja al `GITHUB_TOKEN` solo con el acceso mínimo.

En GitLab, los mismos dos pasos son dos stages: `test` empieza cuando `lint` termina bien.

## 5. Cuándo utilizarlo

- En todo repositorio con código que se despliega: pipelines, DAGs, modelos, Terraform.
- CI en cada pull request; CD al integrar en main o al empujar una tag.
- Con `concurrency` en ramas con muchos pushes seguidos.

## 6. Cuándo no utilizarlo

- Un pipeline que nadie mira cuando falla: es solo costo.
- Pasos que dependen de la máquina de alguien o de estado fuera del repositorio.
- Desplegar a producción desde ramas sin protección.

## 7. Ejemplo sencillo

Un repositorio con un pipeline de Python: el workflow corre `ruff` y, si pasa, `pytest`. Un pull request con un error de lint no llega a correr los tests.

## 8. Ejemplo de producción

Una plataforma con:

- CI en cada pull request: lint, tests y `terraform validate`;
- CD al integrar en main: despliegue al entorno de desarrollo;
- release por tag: despliegue a producción con aprobación;
- `permissions: contents: read` por defecto y escritura solo en el job que la necesita.

## 9. Arquitectura

```mermaid
flowchart LR
  E["push / pull_request"] --> L["job lint"]
  L -- "needs" --> T["job test"]
  T --> S["check de estado<br/>en el pull request"]
  E2["push de tag"] --> D["workflow de release"]
```

## 10. Código

```yaml
# GitHub Actions (.github/workflows/ci.yml; validado con actionlint en la CI, no ejecutado): en cada push y pull
# request, un job de lint y uno de tests que espera al primero (needs). Una corrida nueva de la misma rama cancela la
# anterior.
name: ci

on:
  push:
    branches: [main]
  pull_request:

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  lint:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-python@v7
        with:
          python-version: "3.12"
      - run: pip install ruff
      - run: ruff check .

  test:
    needs: lint
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-python@v7
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - run: pytest -q
```

```yaml
# GitLab CI (.gitlab-ci.yml; no ejecutado): el mismo pipeline en dos stages. Los jobs de un stage corren en paralelo
# y el stage siguiente empieza cuando los anteriores terminan bien.
stages:
  - lint
  - test

lint:
  stage: lint
  image: python:3.12
  script:
    - pip install ruff
    - ruff check .

test:
  stage: test
  image: python:3.12
  script:
    - pip install -r requirements.txt
    - pytest -q
```

El workflow de GitHub Actions se **valida con actionlint en la CI** (ADR-014) **y no se ejecutó**: actionlint revisa la sintaxis, las expresiones y las entradas de las acciones, pero no corre el workflow. El `.gitlab-ci.yml` **no se ejecutó** ni se validó. Los dos describen el mismo pipeline: en GitHub, el orden lo da `needs`; en GitLab, los stages.

## 11. GCP

En GCP, **Cloud Build**. Las diferencias, según sus páginas:

| | GitHub Actions | Cloud Build |
|---|---|---|
| Unidad | Workflow con jobs y pasos en runners | Build con pasos; cada paso corre un contenedor de Docker (`docker run`) |
| Configuración | YAML en `.github/workflows/` | Archivo de configuración en YAML o JSON |
| Cobro | Gratis en repositorios públicos con runners estándar; cuota por plan en privados | Build-minutos mientras el build está en proceso, según el tipo de máquina, con cuota gratis mensual |

Precios consultados el 2026-10-14 en *GitHub Actions billing* y *Cloud Build pricing*; los montos no se copian.

## 12. AWS

En AWS, **CodeBuild** construye y **CodePipeline** orquesta las etapas. Las diferencias, según sus páginas:

| | GitHub Actions | AWS CodeBuild y CodePipeline |
|---|---|---|
| Unidad | Workflow con jobs y pasos | CodeBuild: build con fases (`install`, `pre_build`, `build`, `post_build`) en un buildspec; CodePipeline: etapas del release |
| Configuración | YAML en el repositorio | Buildspec en YAML, con el código o en el proyecto |
| Cobro | Cuota por plan en privados | CodeBuild: duración del build según el tipo de cómputo, pago por uso |

Precios consultados el 2026-10-14 en *AWS CodeBuild pricing*; los montos no se copian.

## 13. Azure

En **Azure Pipelines**, un trigger hace correr el pipeline. Un stage es un límite lógico (build, test, producción) y los stages corren uno tras otro por defecto. Un job es un conjunto de pasos secuenciales en un agente, y las aprobaciones y checks validan antes de que corra un stage (*Key Azure Pipelines concepts*). Se cobra por jobs en paralelo, con uno gratis de cada tipo (*Pricing for Azure DevOps*, consultada el 2026-10-14; sin montos).

## 14. Buenas prácticas

- El pipeline en el repositorio, revisado como el código.
- Jobs rápidos primero (lint) y los caros después.
- Cancelar corridas viejas de la misma rama.
- **Seguridad:** `permissions` con el acceso mínimo al `GITHUB_TOKEN`; escritura solo en el job que la necesita; sin secretos en el YAML.
- **Observabilidad:** cada corrida queda con sus logs y su resultado como check del pull request o del commit.
- **Costo:** cada plataforma cobra distinto (minutos, build-minutos, jobs en paralelo); un pipeline lento o que corre de más se paga.

## 15. Errores frecuentes

- Jobs que podrían correr en paralelo encadenados sin necesidad, o al revés.
- Permisos de escritura para todo el workflow.
- Pasos que instalan versiones sin fijar y fallan de un día para otro.
- Un pipeline que pasa en verde sin correr los tests.

## 16. Trade-offs

Más jobs en paralelo acortan el tiempo de respuesta a cambio de más minutos facturados. Un pipeline administrado (GitHub Actions, Cloud Build, CodeBuild) evita mantener servidores de build, a cambio de depender de su modelo de cobro y de sus runners. Encadenar jobs ahorra cómputo cuando el primero falla, pero alarga la corrida cuando todo pasa.

## 17. Conceptos relacionados

- `automated-testing-in-ci`: el job de tests.
- `build-artifacts`: lo que construye el pipeline.
- `pull-requests`: donde aparecen sus resultados.
- `git-tags-and-releases`: el pipeline de release.
- `infrastructure-as-code`: el Terraform que valida y aplica.

## 18. Preguntas técnicas abiertas

1. ¿Qué jobs de tu pipeline podrían correr en paralelo?
2. ¿Qué permisos tiene hoy el token de tus workflows?
3. ¿Cuánto tarda tu pipeline desde el push hasta el resultado, y cuánto de eso es espera?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- GitHub Docs: *Understanding GitHub Actions*, *Workflow syntax for GitHub Actions* y *GitHub Actions billing*.
- GitLab Docs: *Get started with GitLab CI/CD* y *CI/CD YAML syntax reference*.
- Microsoft Learn: *Key Azure Pipelines concepts*; *Pricing for Azure DevOps*.
- Google Cloud: *Overview of Cloud Build*; *Cloud Build pricing*.
- AWS: *What is AWS CodeBuild?*, *Build specification reference for CodeBuild* y *What is AWS CodePipeline?*; *AWS CodeBuild pricing*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-14. `review_required`: pendiente de revisión B-F3.1 del lote F3b-11a.

## 22. Historial de cambios importantes

- 2026-10-14: creación (lote F3b-11a).
