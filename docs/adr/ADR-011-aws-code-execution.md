# ADR-011 — Código de AWS en las fichas: provider de Terraform, boto3 y moto

- **Estado:** Aceptado
- **Fecha:** 2026-10-12
- **Fase:** F3b — Contenido por dominio, dominio 09-aws (decisiones de Felipe al aprobar el plan de 09)
- **Referencias:** ADR-008 (Code Library y `validate-terraform`), ADR-009.

## Contexto

Hasta 08-gcp, el Terraform de las fichas usaba solo `hashicorp/google` y `hashicorp/google-beta`, y el código de nube en Python quedaba «no ejecutado» o se ejecutaba sin llamar a la API. 09-aws trae Terraform con el provider de AWS y snippets de Python con boto3. Ejecutarlos contra una cuenta real exigiría credenciales en la CI y crearía recursos con costo.

## Decisión

1. **Terraform.** Los bloques de AWS fijan `hashicorp/aws` con `version = "~> 6.0"`. La versión mayor es la del Terraform Registry al 2026-10-12: la última publicada es la 6.68.0, del 2026-10-07. `make validate-terraform` no cambia: cada bloque declara su provider y la CI hace `terraform init -backend=false` y `terraform validate`, sin credenciales. Los bloques se validan, no se aplican.
2. **boto3 y moto.** Se agregan a `requirements-snippets.txt` (dependencias de desarrollo, no de la plataforma): `boto3`, `moto` con los extras de los servicios usados y `boto3-stubs` con los mismos extras, más `mypy`. Justificación: moto simula los servicios de AWS en memoria, así que los snippets con boto3 se ejecutan en la CI sin cuenta ni costo, y los stubs permiten revisarlos con `mypy --strict`.
3. **Ejecución.** Los tests (`tests/test_snippet_code.py`) importan el código de la §10 de la ficha tal como está en `content/` y lo ejecutan dentro de `moto.mock_aws`. En la CI no se saltan (`REQUIRE_AWS_SNIPPETS=1`). La ficha dice «ejecutado en la CI contra moto; no se corrió contra AWS».
4. **Servicios sin soporte en moto.** Si moto no simula un servicio u operación, el bloque se marca «no ejecutado» y la ficha lo dice. Lo mismo para el SQL de Redshift y de Athena, que moto no ejecuta.

## Consecuencias

- La CI instala cuatro dependencias de desarrollo más. La plataforma (`requirements.txt`) no cambia.
- moto simula la API, no el comportamiento completo del servicio: límites, latencias, cuotas y permisos reales no se prueban. Las fichas no presentan un resultado de moto como medición de AWS.
- Para una versión mayor nueva del provider, se revisa el Registry y se actualiza este ADR.
