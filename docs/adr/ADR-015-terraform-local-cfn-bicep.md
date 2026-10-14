# ADR-015 — Terraform ejecutado en la CI sin nube, versión fija, cfn-lint y Bicep

- **Estado:** Aceptado
- **Fecha:** 2026-10-14
- **Fase:** F3b — Contenido por dominio, dominio 12-infrastructure-as-code (decisiones de Felipe al aprobar el plan de 12)
- **Referencias:** ADR-008 (`validate-terraform`), ADR-013 y ADR-011 (código de nube que no se ejecuta), ADR-014 (binarios fijados en la CI).

## Contexto

Hasta 11, el Terraform de las fichas solo se validaba (`terraform init -backend=false` y `terraform validate`): no hay credenciales de nube en la CI. 12-iac trata de módulos, variables, outputs, workspaces, remote state y drift, conceptos que se entienden mejor viéndolos ocurrir. Terraform tiene providers que no tocan ninguna nube: `hashicorp/local` (archivos), `hashicorp/random` y el recurso integrado `terraform_data`. Con ellos, `init`, `plan` y `apply` corren en un directorio temporal, con state local, sin credenciales ni costo. Además, 12 trae CloudFormation y Bicep, que se pueden revisar sin desplegar.

## Decisión

1. **Terraform real en la CI, sin nube.** Los bloques de Terraform de las fichas que usan solo `hashicorp/local`, `hashicorp/random` o `terraform_data` se ejecutan en los tests (`tests/test_terraform_local.py`) con `init`, `plan` y `apply` en un directorio temporal, con state local. Cubren:
   - módulos, variables y outputs;
   - workspaces;
   - remote state con backend `local` y el data source `terraform_remote_state`;
   - drift (12b): modificar un archivo fuera de Terraform y comprobar que `plan` lo detecta.

   La caché de providers se comparte entre tests. En la CI no se saltan (`REQUIRE_TERRAFORM=1`). En local se usa el binario indicado en `TERRAFORM` o el del `PATH`; si no hay, se saltan. Estos bloques y las raíces que dependen de un módulo se excluyen de `validate-terraform` con su marcador, porque los tests los ejecutan completos. Lo que toque GCP, AWS o Azure sigue solo con `validate` y la ficha lo marca «no aplicado».
2. **Versión de Terraform fija.** `hashicorp/setup-terraform` con `terraform_version: "1.16.6"`. Es la última versión estable según la API de releases de HashiCorp (publicada el 2026-10-14, consultada el 2026-10-14; las 1.17.0-rc no se usan). El paso pasa a correr antes de `make test`. Providers sin nube: `hashicorp/local ~> 2.9` (2.9.1 del 2026-09-10) y `hashicorp/random ~> 3.9` (3.9.1 del 2026-09-11), según el Terraform Registry al 2026-10-14.
3. **cfn-lint, versión fija.** `cfn-lint==1.57.2` (PyPI, 2026-10-06) en `requirements-snippets.txt`. `make validate-cfn` extrae los bloques ```` ```yaml ```` que empiezan con `# CloudFormation` a `build/cloudformation/…/template.yaml` y los revisa. Las plantillas no se despliegan.
4. **Bicep, binario fijado.** La CI descarga `bicep-linux-x64` de la release v0.48.1 (2026-10-05) y verifica su SHA-256 (`b09ec25a9d376c1f8e33ede6ed22b587f915ad68488d5db77a6f9541748c7f6e`, el digest que publica la release de GitHub). `make validate-bicep BICEP=./bicep` extrae los bloques ```` ```bicep ```` a `build/bicep/…/main.bicep` y corre `bicep build` (compila a ARM JSON, sin Azure). Los archivos no se despliegan.
5. **Lo que dice la ficha.** Ejecutado: «ejecutado en la CI con init, plan y apply sobre providers sin nube». Validado: «validado con `terraform validate`, cfn-lint o `bicep build`, no aplicado / no desplegado».

## Consecuencias

- Nuevas dependencias solo de desarrollo y de la CI: cfn-lint en el `.venv` y el binario de Bicep en la CI. Terraform ya estaba, ahora con versión fija.
- Actualizar Terraform, cfn-lint o Bicep es cambiar la versión (y el checksum de Bicep) en la CI, en `requirements-snippets.txt` y en este ADR.
- En local, sin instalar nada global: `TERRAFORM=<ruta>` para los tests y `BICEP=<ruta>` para `make validate-bicep`.
