# Revisión B-F3.1 · lote F3b-12b

Rama `b/f3b-review-12b`, creada desde `origin/main` (`7958843`). El lote es `afc402a`. Fichas: `terraform-drift`, `terraform-security`, `cloudformation-basics`, `bicep-basics`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| El test de drift aplica `hashicorp/local`, cambia el archivo fuera de Terraform y comprueba `plan -detailed-exitcode` con salida 2, el refresh-only con «Objects have changed outside of Terraform» y el plan siguiente con 0. | ninguna | — |
| El test de secretos aplica el primer bloque: el token `sensitive` queda en `terraform.tfstate` y la contraseña `ephemeral` no. Persistirla falla con «Invalid use of ephemeral value». El bloque `aws_db_instance` con `password_wo` dice «validado… no se aplicó» y no lleva la marca de exclusión, así que `terraform validate` de la CI lo cubre. | ninguna | — |
| Hay dos plantillas `# CloudFormation` y dos archivos `bicep` en todo `content/`. Las de este lote dicen revisadas con cfn-lint o compiladas con `bicep build`, y no desplegadas. Los comandos de AWS CLI y Azure CLI dicen «no ejecutado». | ninguna | — |
| §11 y §12 de las cuatro fichas son tablas. Cada lado cita su página (plan y drift de Terraform, IAM y preview de Infrastructure Manager, drift y change sets de CloudFormation, what-if y overview de Bicep, precios con fecha y sin montos). | ninguna | — |
| `git diff 7de2294..afc402a` de las cuatro fichas verificadas solo agrega `relations`, el §17 y una línea de historial por enlace. | ninguna | — |

## Validación

```
OK: 460 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Terraform no está en el PATH de esta máquina; las comprobaciones de apply salen del código del test, que es el que corre la CI con `REQUIRE_TERRAFORM=1`.

## Drift y secretos en el test

`tests/test_terraform_local.py`:

```
def test_plan_detects_drift_and_apply_restores_the_configuration
    plan = tf(..., "plan", "-detailed-exitcode", ...)
    assert plan.returncode == 2
    refresh = tf(..., "plan", "-refresh-only", "-detailed-exitcode", ...)
    assert refresh.returncode == 2 and "Objects have changed outside of Terraform" in refresh.stdout
    assert ...["batch_size"] == 500
    assert tf(..., "plan", "-detailed-exitcode", ...).returncode == 0

def test_ephemeral_values_stay_out_of_state_and_cannot_be_persisted
    local, _aws = hcl_blocks("terraform-security")
    assert "token-sensible-123" in state
    assert "clave-efimera-456" not in state
    assert "Invalid use of ephemeral value" in rejected.stderr
```

La ficha de drift describe ese mismo recorrido y acota el reemplazo del archivo a `hashicorp/local`. La de secretos describe el token en el state, la contraseña ausente y el error al persistir el valor ephemeral. El segundo bloque, el de `aws_db_instance`, queda fuera del test (`_aws` se descarta) y el texto dice que se validó y no se aplicó.

Marca de exclusión, solo en el bloque que el test aplica:

```
content/concepts/terraform-drift.md
  <!-- validate-terraform: excluido — se ejecuta con init, plan y apply en los tests, y se modifica fuera de Terraform (ADR-015) -->
content/concepts/terraform-security.md
  <!-- validate-terraform: excluido — se ejecuta con init, plan y apply en los tests (ADR-015) -->
```

## CloudFormation y Bicep

Conteo de bloques en `content/`:

```
BICEP bicep-basics.md
CFN cloudformation-basics.md
CFN terraform-variables-and-outputs.md
BICEP terraform-variables-and-outputs.md
TOTAL_CFN 2 TOTAL_BICEP 2
```

Los dos de 12a ya estaban. Este lote agrega la plantilla del stack y el archivo de la zona cruda. Ninguno dice que se desplegó.

## Estructura

```
terraform-drift page_title 9 / 9 rels_in_17 ok topics ok dollars none s11_table True s12_table True seg True obs True costo True
terraform-security page_title 11 / 11 rels_in_17 ok topics ok dollars none s11_table True s12_table True seg True obs True costo True
cloudformation-basics page_title 13 / 13 rels_in_17 ok topics ok dollars none s11_table True s12_table True seg True obs True costo True
bicep-basics page_title 9 / 9 rels_in_17 ok topics ok dollars none s11_table True s12_table True seg True obs True costo True
```

## Páginas citadas (2026-10-19)

- *Manage sensitive data*: «Terraform stores those secrets in its state and plan files». En la misma página: ephemeral desde Terraform 1.10 y write-only desde 1.11. *Use temporary write-only arguments* pide Terraform 1.11 y muestra `password_wo` y `password_wo_version` en `aws_db_instance`.
- *terraform plan command*: `-detailed-exitcode` y el modo refresh-only. *terraform refresh command*: «This command is deprecated».
- *Manage resource drift*: «or "drift," from the real infrastructure».
- *Access control with IAM*: lista `config.resourcedrifts.get` y `config.resourcedrifts.list`, sin describir la detección. *Preview an update*: «A preview executes the Terraform plan command».
- *DeletionPolicy attribute*: «If a resource has no DeletionPolicy attribute, CloudFormation deletes the resource by default» y `Retain` para un bucket. *View a change set* y *Execute a change set* usan el ARN en `--change-set-name`.
- *AWS CloudFormation pricing*: «no additional charge» para `AWS::*` y `Alexa::*`. *Infrastructure Manager pricing*: cobra Cloud Build y Cloud Storage. Las fichas ponen la fecha 2026-10-19 y no copian montos.
- *What is Bicep?*: «No state or state files to manage: Azure stores all states».

## Diff de las cuatro fichas verificadas

`git diff 7de2294..afc402a -- content/concepts/infrastructure-as-code.md content/concepts/terraform-plan-apply.md content/concepts/terraform-providers.md content/concepts/terraform-state.md`

El rango incluye los enlaces de 12a (historial 2026-10-14: `terraform-modules`, `terraform-remote-state`) y los de 12b (historial 2026-10-19: `terraform-drift`, `terraform-security`). No cambia `verification_status` ni el cuerpo fuera del §17.

```diff
diff --git a/content/concepts/infrastructure-as-code.md b/content/concepts/infrastructure-as-code.md
index 5117bed..bd3c484 100644
--- a/content/concepts/infrastructure-as-code.md
+++ b/content/concepts/infrastructure-as-code.md
@@ -63,6 +63,12 @@ relations:
   - type: RELATED_TO
     target: ci-cd-pipelines
     note: El pipeline que valida y aplica el código de infraestructura.
+  - type: RELATED_TO
+    target: terraform-drift
+    note: Cambios hechos fuera de Terraform y cómo detectarlos.
+  - type: RELATED_TO
+    target: terraform-security
+    note: Secretos en el state, ephemeral y permisos de quien aplica.
 created_at: 2026-10-01
 updated_at: 2026-10-13
 last_verified: 2026-10-01
@@ -201,7 +207,8 @@ IaC da reproducibilidad, revisión y auditoría, a cambio de una curva de aprend
 - `terraform-plan-apply`: el flujo de revisar y aplicar.
 - `terraform-providers`: la conexión con cada nube.
 - `ci-cd-pipelines`: el pipeline que valida y aplica el código de infraestructura.
-- Del blueprint, pendientes de ficha: `terraform-drift` y `terraform-security`.
+- `terraform-drift`: cambios hechos fuera de Terraform y cómo detectarlos.
+- `terraform-security`: secretos en el state, ephemeral y permisos de quien aplica.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -232,3 +239,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-01: `verification_status: verified` (revisión B-F3.1 del lote 4 aplicada; sin VERIFY pendientes).
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
 - 2026-10-14: regla del §17 (lote F3b-11a): el §17 enlaza `ci-cd-pipelines`, que ya tiene ficha, y relations la incluye; antes figuraba como pendiente de ficha.
+- 2026-10-19: regla del §17 (lote F3b-12b): el §17 enlaza `terraform-drift` y `terraform-security`, que ya tienen ficha, y relations las incluye; antes figuraban como pendiente de ficha.
diff --git a/content/concepts/terraform-plan-apply.md b/content/concepts/terraform-plan-apply.md
index 5a88a41..f4d04dc 100644
--- a/content/concepts/terraform-plan-apply.md
+++ b/content/concepts/terraform-plan-apply.md
@@ -60,6 +60,9 @@ relations:
   - type: RELATED_TO
     target: ci-cd-pipelines
     note: El pipeline donde corren plan y apply.
+  - type: RELATED_TO
+    target: terraform-drift
+    note: El plan como detector de cambios hechos fuera de Terraform.
 created_at: 2026-10-01
 updated_at: 2026-10-13
 last_verified: 2026-10-01
@@ -183,7 +186,7 @@ El flujo de dos pasos con aprobación agrega fricción y tiempo a cada cambio, a
 - `terraform-state`: lo que el plan compara.
 - `infrastructure-as-code`: el marco.
 - `ci-cd-pipelines`: el pipeline donde corren plan y apply.
-- Del blueprint, pendiente de ficha: `terraform-drift`.
+- `terraform-drift`: el plan como detector de cambios hechos fuera de Terraform.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -214,3 +217,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-01: `verification_status: verified` (revisión B-F3.1 del lote 4 aplicada; sin VERIFY pendientes).
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
 - 2026-10-14: regla del §17 (lote F3b-11a): el §17 enlaza `ci-cd-pipelines`, que ya tiene ficha, y relations la incluye; antes figuraba como pendiente de ficha.
+- 2026-10-19: regla del §17 (lote F3b-12b): el §17 enlaza `terraform-drift`, que ya tiene ficha, y relations la incluye; antes figuraba como pendiente de ficha.
diff --git a/content/concepts/terraform-providers.md b/content/concepts/terraform-providers.md
index 7e90a90..7efd3f7 100644
--- a/content/concepts/terraform-providers.md
+++ b/content/concepts/terraform-providers.md
@@ -57,6 +57,12 @@ relations:
   - type: RELATED_TO
     target: terraform-plan-apply
     note: Un cambio de versión del provider puede cambiar el plan; se revisa como cualquier cambio.
+  - type: RELATED_TO
+    target: terraform-modules
+    note: Los módulos hijos declaran los providers que necesitan.
+  - type: RELATED_TO
+    target: terraform-security
+    note: El lock file y los checksums de cada provider.
 created_at: 2026-10-01
 updated_at: 2026-10-13
 last_verified: 2026-10-01
@@ -178,7 +184,8 @@ Restricciones estrictas y lock versionado dan reproducibilidad, a cambio de actu
 
 - `infrastructure-as-code`: el marco.
 - `terraform-plan-apply`: donde se ve el efecto de un cambio de versión.
-- Del blueprint, pendientes de ficha: `terraform-modules`, `terraform-security`.
+- `terraform-modules`: los módulos hijos declaran los providers que necesitan.
+- `terraform-security`: el lock file y los checksums de cada provider.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -208,3 +215,5 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-01: creación (lote 4 de F3).
 - 2026-10-01: `verification_status: verified` (revisión B-F3.1 del lote 4 aplicada; sin VERIFY pendientes).
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
+- 2026-10-14: regla del §17 (lote F3b-12a): el §17 enlaza `terraform-modules`, que ya tiene ficha, y relations la incluye; antes figuraba como pendiente de ficha.
+- 2026-10-19: regla del §17 (lote F3b-12b): el §17 enlaza `terraform-security`, que ya tiene ficha, y relations la incluye; antes figuraba como pendiente de ficha.
diff --git a/content/concepts/terraform-state.md b/content/concepts/terraform-state.md
index 437afb1..daffeb6 100644
--- a/content/concepts/terraform-state.md
+++ b/content/concepts/terraform-state.md
@@ -60,6 +60,15 @@ relations:
   - type: RELATED_TO
     target: gcs-buckets-and-objects
     note: En Google Cloud, el backend remoto habitual es un bucket con versionado.
+  - type: RELATED_TO
+    target: terraform-remote-state
+    note: El state en un backend compartido y los datos entre configuraciones.
+  - type: RELATED_TO
+    target: terraform-drift
+    note: La diferencia entre el state y lo real.
+  - type: RELATED_TO
+    target: terraform-security
+    note: Los secretos que quedan en el state y cómo evitarlo.
 created_at: 2026-10-01
 updated_at: 2026-10-13
 last_verified: 2026-10-01
@@ -179,7 +188,9 @@ Un state por entorno o por componente limita el impacto de un error y acelera lo
 - `infrastructure-as-code`: el marco.
 - `terraform-plan-apply`: el plan lee el state.
 - `gcs-buckets-and-objects`: el bucket que guarda el state en Google Cloud.
-- Del blueprint, pendientes de ficha: `terraform-drift`, `terraform-security`, `terraform-remote-state`.
+- `terraform-remote-state`: el state en un backend compartido y los datos entre configuraciones.
+- `terraform-drift`: la diferencia entre el state y lo real.
+- `terraform-security`: los secretos que quedan en el state y cómo evitarlo.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -207,3 +218,5 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-01: creación (lote 4 de F3).
 - 2026-10-01: `verification_status: verified` (revisión B-F3.1 del lote 4 aplicada; sin VERIFY pendientes).
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
+- 2026-10-14: regla del §17 (lote F3b-12a): el §17 enlaza `terraform-remote-state`, que ya tiene ficha, y relations la incluye; antes figuraba como pendiente de ficha.
+- 2026-10-19: regla del §17 (lote F3b-12b): el §17 enlaza `terraform-drift` y `terraform-security`, que ya tienen ficha, y relations las incluye; antes figuraban como pendiente de ficha.
```
