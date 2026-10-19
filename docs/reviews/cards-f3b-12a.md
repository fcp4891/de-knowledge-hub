# Revisión B-F3.1 · Lote F3b-12a

Fichas en `content/concepts/`, commit `48e1c52` (esas cuatro no cambian hasta `afc402a`). Carril B no las edita. Las cuatro siguen en `review_required`. No hay comentarios `VERIFY`.

Las 4: `terraform-variables-and-outputs`, `terraform-modules`, `terraform-remote-state` y `terraform-environments`.

`.\.venv\Scripts\python.exe scripts\validate.py` terminó así:

```text
OK: 460 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

## Comprobación por comando

```text
terraform-variables-and-outputs  sources 10  page_title vacío: ninguno  §14 completo  relations en el §17  montos: ninguno  §11 y §12 con tabla
terraform-modules                sources 7   page_title vacío: ninguno  §14 completo  relations en el §17  montos: ninguno  §11 y §12 con tabla
terraform-remote-state           sources 11  page_title vacío: ninguno  §14 completo  relations en el §17  montos: ninguno  §11 y §12 con tabla
terraform-environments           sources 5   page_title vacío: ninguno  §14 completo  relations en el §17  montos: ninguno  §11 y §12 con tabla
Fichas nombradas y fuera de relations: ninguna.
```

Ninguna de las cuatro nombra `terraform-drift`, `terraform-security`, `cloudformation-basics` ni `bicep-basics`.

Los bloques de Terraform usan `hashicorp/local`, `hashicorp/random` o `terraform_data`. No hay recursos de nube. CloudFormation y Bicep están solo en `terraform-variables-and-outputs`: un `yaml` que empieza con `# CloudFormation` y un `bicep`. La CI corre `make validate-cfn` y `make validate-bicep` (Bicep 0.48.1 con SHA-256). No los despliega. Terraform de la CI es 1.16.6 (`REQUIRE_TERRAFORM=1`).

`tests/test_terraform_local.py` aplica lo que dice cada ficha:

```text
test_variables_and_outputs_validate_types_and_keep_sensitive_values_out_of_the_cli
  apply muestra «<sensitive>» y no el token; el token está en terraform.tfstate; environment=qa falla
test_module_called_with_for_each_creates_one_instance_per_dataset
  un archivo por dataset; plan -detailed-exitcode sale 0
test_remote_state_with_local_backend_shares_outputs_between_configurations
  dos states; la ingesta escribe el nombre que publicó el almacenamiento
test_workspaces_keep_separate_state_and_size_per_environment
  states en terraform.tfstate.d/dev y /prod; workers 1 y 4
```

El módulo hijo de `terraform-modules` no lleva el marcador de exclusión, así que `make validate-terraform` le corre `terraform validate`. La raíz, que lo llama, está excluida y se aplica en el test.

Páginas (HTML, 2026-10-19). El `page_title` coincide con el H1:

```text
Use input variables to add module arguments
  «Terraform still stores the values of sensitive variables in your state»
Use outputs to expose module data
  «terraform output» con -json o -raw «displays sensitive outputs in plain text»
Workspaces
  «Workspaces are not appropriate for system decomposition or deployments requiring separate credentials and access controls»
Terraform and Infrastructure Manager
  1.3.10, 1.4.7 y 1.5.7: YES. 1.16: NO. 1.2.3 figura con fecha de deprecación.
What is Bicep?
  «No state or state files to manage: Azure stores all states»
```

El test de variables comprueba el state y la CLI. No corre `terraform output -json`. Esa frase está en la página de outputs y en la ficha, no en la lista de lo que el test comprueba.

## Fichas verificadas de 12

`git diff 7de2294..afc402a` sobre `infrastructure-as-code`, `terraform-plan-apply`, `terraform-providers` y `terraform-state` solo agrega `relations`, la viñeta del §17 y una línea de historial. No cambia `verification_status`.

De este lote son dos enlaces: `terraform-providers` → `terraform-modules`, y `terraform-state` → `terraform-remote-state`. El resto del diff (drift y seguridad) es del lote 12b.

```text
terraform-providers.md
+    target: terraform-modules
+    note: Los módulos hijos declaran los providers que necesitan.
+    target: terraform-security
+- Del blueprint, pendientes de ficha: `terraform-modules`, `terraform-security`.
+- `terraform-modules`: los módulos hijos declaran los providers que necesitan.
+- `terraform-security`: el lock file y los checksums de cada provider.
+- 2026-10-14: regla del §17 (lote F3b-12a): el §17 enlaza `terraform-modules`...
+- 2026-10-19: regla del §17 (lote F3b-12b): el §17 enlaza `terraform-security`...

terraform-state.md
+    target: terraform-remote-state
+    target: terraform-drift
+    target: terraform-security
+- Del blueprint, pendientes de ficha: `terraform-drift`, `terraform-security`, `terraform-remote-state`.
+- `terraform-remote-state`: el state en un backend compartido...
+- 2026-10-14: regla del §17 (lote F3b-12a): el §17 enlaza `terraform-remote-state`...
+- 2026-10-19: regla del §17 (lote F3b-12b): el §17 enlaza `terraform-drift` y `terraform-security`...

infrastructure-as-code.md y terraform-plan-apply.md
  solo agregan terraform-drift y terraform-security (lote 12b), el §17 y el historial del 2026-10-19.
```

## `terraform-variables-and-outputs`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Diez fuentes, con `page_title`. §14 completo, sin montos. La frase del state y la de `terraform output -json` están en las páginas de Terraform 1.16. El test aplica los dos bloques, comprueba `<sensitive>`, el token en el state y el rechazo de `qa`. CloudFormation se revisa con cfn-lint y Bicep se compila con `bicep build`; la ficha dice que no se desplegaron. Infrastructure Manager lista 1.3.10, 1.4.7 y 1.5.7; la CI usa 1.16.6, y la tabla lo dice. `relations` coincide con el §17. El §11 y el §12 comparan variables, versión y secretos, con páginas de los dos lados. | ninguna | — |

## `terraform-modules`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Siete fuentes, con `page_title`. §14 completo, sin montos. Los dos bloques se aplican en la CI sobre `hashicorp/local`. El test comprueba una instancia por dataset y `plan -detailed-exitcode` en 0. El módulo hijo pasa `terraform validate` en `make validate-terraform`. `relations` coincide con el §17. El §11 y el §12 comparan dónde vive la configuración y el nested stack, con páginas de Infrastructure Manager y de CloudFormation en la ficha. | ninguna | — |

## `terraform-remote-state`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Once fuentes, con `page_title`. §14 completo, sin montos. Los dos bloques se aplican en la CI con backend `local`. El test comprueba los dos states y el nombre compartido. La ficha cita «No state or state files to manage: Azure stores all states». `relations` coincide con el §17. El §11 y el §12 comparan dónde queda el state y qué hay que poder leer, con páginas de GCS, Infrastructure Manager y CloudFormation en la ficha. | ninguna | — |

## `terraform-environments`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Cinco fuentes, con `page_title`. §14 completo, sin montos. La ficha cita la frase de HashiCorp sobre credenciales y permisos distintos. El bloque se aplica en la CI en los workspaces `dev` y `prod`. El test comprueba los dos states y los tamaños. `relations` coincide con el §17. El §11 y el §12 comparan el entorno y los permisos con Infrastructure Manager y StackSets, y esas páginas están en la ficha. | ninguna | — |
