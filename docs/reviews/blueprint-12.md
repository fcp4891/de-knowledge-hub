# Revisión B-F1b · Dominio 12 Infrastructure as Code

Archivo de origen: `content/blueprint/12-infrastructure-as-code.yaml`. Carril B no lo edita. Solo los cuatro conceptos con `mvp: true`. No se devuelve `terraform-modules` al MVP (gate F1).

| Fila | Slug | Propuesta | Estado |
|---|---|---|---|
| 1 | `infrastructure-as-code` | Mantener `core`, `basic`, `high` y `mvp: true`. Agregar `terraform-state` y `terraform-plan-apply` en `related_concepts`. Nota: la ficha es el marco (declarativo, versionado, reproducible), no el tutorial de Terraform. | aprobada |
| 2 | `terraform-providers` | Agregar `gcp-bigquery`, `gcp-cloud-storage` y `gcp-iam` en `related_technologies`. Nota: el provider de Google no equivale al de AWS ni al de Azure. El pin de versión va aquí. Los flags se quedan. | aprobada |
| 3 | `terraform-state` | Agregar `terraform-security` en `related_concepts`. Nota: el backend remoto en Cloud Storage se menciona aquí; `terraform-remote-state` sigue fuera del MVP. Los secretos en el state se apuntan, sin volver MVP a `terraform-security`. Los flags se quedan. | aprobada |
| 4 | `terraform-plan-apply` | Subir `level` a `intermediate`. Siguen `modern`, `high` y `mvp: true`. Nota: leer el plan y no aplicar a ciegas. Los módulos siguen fuera del MVP. | aprobada |
| 5 | Los cuatro MVP | Siguen en `mvp: true`. `terraform-modules` sigue en `mvp: false`. | aprobada |
