# ADR-013 — Código de Azure en las fichas: provider azurerm y Azurite para Blob

- **Estado:** Aceptado
- **Fecha:** 2026-10-13
- **Fase:** F3b — Contenido por dominio, dominio 10-azure (decisiones de Felipe al aprobar el plan de 10)
- **Referencias:** ADR-008 (`validate-terraform`), ADR-011 (código de AWS), ADR-009.

## Contexto

10-azure trae Terraform con el provider de Azure y snippets de Python con los SDK de Azure. A diferencia de AWS (moto, ADR-011), no hay un simulador en memoria para los SDK de Azure. Microsoft publica Azurite, un emulador de Azure Storage. Según *Use the Azurite emulator for local Azure Storage development* (Microsoft Learn, consultada el 2026-10-13), «Azurite supports only the Blob, Queue, and Table storage services. It doesn't support Azure Files or Azure Data Lake Storage Gen2».

## Decisión

1. **Terraform.** Los bloques de Azure fijan `hashicorp/azurerm` con `version = "~> 5.0"`. Versión mayor según el Terraform Registry al 2026-10-13: la última publicada es la 5.9.0, del 2026-10-08. `make validate-terraform` no cambia (init sin backend y validate, sin credenciales). Los bloques se validan, no se aplican.
2. **Azurite solo para Blob.** La CI levanta Azurite (imagen `mcr.microsoft.com/azure-storage/azurite`, solo el servicio Blob en el puerto 10000) en un paso `docker run`, porque los contenedores de `services:` de GitHub Actions no aceptan argumentos. Se arranca con `--skipApiVersionCheck`, opción documentada en *Install and run the Azurite emulator*: la última imagen publicada (2026-08-25) no acepta la versión de API por defecto de `azure-storage-blob` 12.31.0. Los tests de Blob se ejecutan contra Azurite con la cadena de conexión de desarrollo que publica *Connect to Azurite emulator with Azure SDKs and tools*; en la CI no se saltan (`REQUIRE_AZURITE=1`).
3. **Dependencia.** `azure-storage-blob` en `requirements-snippets.txt` (desarrollo, no plataforma). Justificación: es el SDK que usan los snippets de Blob y el que se ejecuta contra Azurite; trae sus propios tipos para `mypy --strict`.
4. **Lo que no se ejecuta.** ADLS Gen2 (namespace jerárquico, endpoint `dfs`), OneLake, Event Hubs y el resto de los SDK de Azure: el bloque se marca «no ejecutado» y la ficha lo dice. Python, PySpark y SQL que no llaman a Azure se ejecutan como siempre.

## Consecuencias

- Una dependencia de desarrollo más y un contenedor en la CI. La plataforma no cambia.
- Azurite emula la API de Blob, no el servicio completo: rendimiento, límites, redundancia y permisos reales no se prueban.
- Para una versión mayor nueva de `azurerm`, se revisa el Registry y se actualiza este ADR.
