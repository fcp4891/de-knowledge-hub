# Revisión B-F3.1 · lote F3b-13b

Rama `b/f3b-review-13b`, creada desde `origin/main` (`ee15ab8`). El pedido es `c2f8726`. Fichas: `docker-compose-environments`, `container-registries`, `kubernetes-fundamentals` y `container-platforms-by-cloud`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| *Releases* de kubernetes.io lista el parche **1.37.1** (2026-09-15). La documentación muestra **v1.37**. `kubernetes-fundamentals` llama «Kubernetes 1.37.0» a los esquemas de kubeconform. 1.37.0 no aparece en esas páginas. | media | Decir que la documentación es la 1.37, que el parche vigente es 1.37.1, y que `v1.37.0` es el directorio de esquemas. |
| *run-task* (la página `/cli/latest/`) dice «AWS CLI 2.38.2 Command Reference». `container-platforms-by-cloud` cita 2.38.1. | media | Poner 2.38.2, que es lo que muestra la página. |
| *AWS Fargate Pricing* cobra por segundo con mínimo de 1 minuto y redondea hacia arriba. La ficha de plataformas dice «redondeado al segundo» y no menciona el mínimo. | media | Citar «per second with a 1-minute minimum» y «rounded up to the nearest second». |
| *Cloud Run pricing* dice «rounded up to the nearest 100 milliseconds». La ficha de plataformas dice «redondeados a los 100 ms». | baja | Decir que el redondeo es hacia arriba. |

## Validación

```
OK: 476 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`.

## Docker y kubeconform

Lo que Compose y el registry dicen que imprimieron está en `tests/test_docker_snippets.py`:

```
173:    assert "servicios activos: datos-api job" in out
174:    assert "con el perfil debug: datos-api debug job" in out
175:    assert "job: la API respondió en http://datos-api:8000/" in out
184:    assert "el tag 1.0 se movió a otro digest" in out
185:    assert "1.0 trae hoy: build-2" in out
186:    assert "el digest anterior trae: build-1" in out
```

El único bloque de Kubernetes del contenido empieza por `# Kubernetes` y la ficha dice que kubeconform 0.8.0 lo valida contra los esquemas y que no se aplicó a un clúster. No hay `kubectl apply` en el test. Los comandos `gcloud`, `aws` y `az` de `container-platforms-by-cloud` dicen «no ejecutado». Publicar en Artifact Registry, ECR o ACR, en `container-registries`, tampoco.

## Plataformas

`container-platforms-by-cloud` abre con «no son equivalentes» y separa serverless de contenedores (Cloud Run, ECS con Fargate, Container Apps) de Kubernetes administrado (GKE, EKS, AKS). La frase de Microsoft está en la página: «If you require access to the Kubernetes APIs and control plane, you should use Azure Kubernetes Service». §11, §12 y §13 nombran la fuente de cada lado. OCI no es fuente de estas cuatro fichas.

## Cifras que sí coinciden

58 URLs: los `page_title` coinciden con un `h1` y las citas entre comillas están en la página.

```
Releases: Latest Release: 1.37.1 (released: 2026-09-15) ; 1.37.0 no está
Overview: selector v1.37
Create jobs: up to 10,000 tasks ; default is 3 ; 0 to 10 ; 10 minutes ; 168 hours
ECR: ImageTagAlreadyExistsException ; within 24 hours
Secrets: Kubernetes Secrets are, by default, stored unencrypted in the API server's underlying data store (etcd)
AKS: control plane for you at no cost
run-task: AWS CLI 2.38.2 Command Reference
Fargate: per second with a 1-minute minimum ; rounded up to the nearest second
Cloud Run: rounded up to the nearest 100 milliseconds
```

GKE muestra una tarifa por clúster y por hora; la ficha no copia el monto. EKS dice «additional cost» para el soporte extendido. Los `$1` de `container-registries` son el parámetro de bash, no un precio.

## Estructura

```
docker-compose-environments page_title 11/11 rels17 ok topics ok dollars none s11 True s12 True s13 True seg True obs True costo True mentioned_not_rel ok oci False
container-registries page_title 16/16 rels17 ok topics ok dollars ['$1', '$1', '$1'] s11 True s12 True s13 True seg True obs True costo True mentioned_not_rel ok oci False
kubernetes-fundamentals page_title 17/17 rels17 ok topics ok dollars none s11 True s12 True s13 True seg True obs True costo True mentioned_not_rel ok oci False
container-platforms-by-cloud page_title 17/17 rels17 ok topics ok dollars none s11 True s12 True s13 True seg True obs True costo True mentioned_not_rel ok oci False
```

§14 trae Seguridad, Observabilidad y Costo. Cada `relations` está en el §17.
