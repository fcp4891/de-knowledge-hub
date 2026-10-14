# ADR-014 — Workflows de GitHub Actions en las fichas: actionlint con versión fija

- **Estado:** Aceptado
- **Fecha:** 2026-10-14
- **Fase:** F3b — Contenido por dominio, dominio 11-devops (decisiones de Felipe al aprobar el plan de 11)
- **Referencias:** ADR-008 (`validate-terraform`, extracción de bloques), ADR-013 (lo que no se ejecuta).

## Contexto

11-devops trae workflows de GitHub Actions, configuraciones de GitLab CI, Azure Pipelines, Cloud Build y CodeBuild, y comandos de Git. Ninguna de esas plataformas corre en la CI del proyecto salvo GitHub Actions, que es la propia CI: un workflow de una ficha no se puede ejecutar sin un repositorio y un evento reales. Sí se puede revisar de forma estática. actionlint (`rhysd/actionlint`, licencia MIT) revisa la sintaxis de los workflows, las expresiones `${{ }}`, los eventos, los inputs de las acciones conocidas y los tipos de `matrix`.

## Decisión

1. **actionlint 1.7.12, fijado.** Versión publicada el 2026-03-30, la última del repositorio al 2026-10-14 (API de releases de GitHub). La CI descarga `actionlint_1.7.12_linux_amd64.tar.gz` de la release y verifica su SHA-256 (`8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8`, del archivo `actionlint_1.7.12_checksums.txt` de la misma release) antes de usarlo. No se usa el script `download-actionlint.bash` de la rama `main`, porque cambia sin versión.
2. **Qué bloques.** `python -m scripts.snippets.extract --language github-actions` extrae cada bloque ```` ```yaml ```` de las fichas cuya primera línea empieza con `# GitHub Actions` a `build/github-actions/concepts/<slug>[-N]/workflow.yml`. El resto de los bloques YAML (GitLab CI, Azure Pipelines, Cloud Build, buildspec de CodeBuild) no se extrae: la ficha los marca «no ejecutado». El mismo marcador de exclusión de ADR-008 aplica a fragmentos intencionales.
3. **`make validate-actions`.** Corre actionlint sobre los archivos extraídos con `-shellcheck= -pyflakes=`: sin integraciones con herramientas que dependen de lo que tenga instalado el runner, para que el resultado sea el mismo en cada corrida. La CI lo corre después de `make validate-terraform`.
4. **Lo que dice la ficha.** Un workflow validado dice «validado con actionlint en la CI, no ejecutado»: actionlint no corre el workflow ni las acciones.
5. **Git.** Los comandos de Git de las fichas (bloques `bash`) se ejecutan en pytest sobre un repositorio temporal, con identidad y configuración propias del test, sin red ni remotos reales.

## Consecuencias

- Dependencia nueva solo en la CI (un binario, sin cambios en `requirements*.txt`). En local, `make validate-actions ACTIONLINT=<ruta>` con el binario descargado a mano; no se instala nada en el Python global.
- Actualizar actionlint es cambiar versión y checksum en `.github/workflows/ci.yml` y en este ADR.
