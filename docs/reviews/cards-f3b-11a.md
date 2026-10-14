# Revisión B-F3.1 · Lote F3b-11a

Fichas en `content/concepts/`, commit `62c0333` (sin cambios de esas fichas hasta `9a9fcc6`). Carril B no las edita. Las siete siguen en `review_required`. No hay comentarios `VERIFY`.

Las 7: `git-branching-strategies`, `pull-requests`, `code-review`, `git-tags-and-releases`, `ci-cd-pipelines`, `automated-testing-in-ci` y `build-artifacts`.

`.\.venv\Scripts\python.exe scripts\validate.py` terminó así:

```text
OK: 451 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

## Comprobación por comando

```text
§14 Seguridad, Observabilidad y Costo: True en las 7.
page_title vacío: ninguno.
related_topics fuera de relations: ninguno.
relations no nombradas en el §17: ninguno.
Slugs con ficha en el cuerpo y fuera de relations: ninguno.
```

Los `$1` y `$2` de `pull-requests` y `code-review` son parámetros de Bash (`"$1"`, `"$cambiadas"`), no montos. No hay otros montos.

Código. `tests/test_snippet_code.py` corre el Bash en un directorio temporal (`run_git_snippet` → `tmp_path`, el script hace `git init`) y comprueba el repositorio:

```text
test_branching_snippet_merges_topic_branch_with_merge_commit_and_deletes_it
test_merge_methods_snippet_squashes_one_branch_and_rebases_the_other
test_change_size_snippet_measures_lines_against_main
test_tags_snippet_describes_only_annotated_tags_by_default
test_dedupe_snippet_tests_pass_with_pytest_and_mypy   # pytest «4 passed» y mypy --strict
test_package_snippet_builds_reproducible_zip_and_verifies_hash   # mypy --strict
```

`.github/workflows/ci.yml` baja actionlint 1.7.12, comprueba el SHA-256 y corre `make validate-actions`. No ejecuta los workflows. Las fichas lo dicen: «validado con actionlint en la CI, no ejecutado» en `git-tags-and-releases`, `ci-cd-pipelines`, `automated-testing-in-ci` y `build-artifacts`. El `.gitlab-ci.yml` y `CODEOWNERS` dicen «no ejecutado».

`google-eng-practices` está en el registro con `authority_level: 4`. Son cuatro URLs, y las notas dicen «Nivel 4, conceptual».

CodeCommit, HTML del 2026-10-14, *What is AWS CodeCommit?*:

```text
deprecat NO
retir NO
discontinu NO
sunset NO
```

Las tres fichas que lo nombran describen pull requests y repositorios. No registran un cambio de estado.

`page_title` de la primera cita, contra el H1:

```text
3.4 Git Branching - Branching Workflows
Pull requests
The Standard of Code Review          (el sitio también tiene un h1 «eng-practices»; el de la página coincide)
2.6 Git Basics - Tagging
Understanding GitHub Actions
Building and testing Python
Workflow artifacts
```

La guía de Google, en el HTML: «definitely improves the overall code health… even if the CL isn't perfect» y «One business day is the maximum time it should take to respond to a code review request».

## `git-branching-strategies`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Ocho fuentes, con `page_title`. §14 completo, sin montos. El Bash corre en la CI sobre un repo temporal. `relations` coincide con el §17. El §11 y el §12 comparan ramas, protección y pull requests con Secure Source Manager y CodeCommit, y esas páginas están en la ficha. CodeCommit no anuncia un cambio de estado, y la ficha no lo afirma. | ninguna | — |

## `pull-requests`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Ocho fuentes, con `page_title`. §14 completo. El Bash corre en la CI (squash de una rama y rebase de la otra). `relations` coincide con el §17. El §11 y el §12 comparan el pull request, las reglas de merge y los avisos, con páginas de los dos lados en la ficha. | ninguna | — |

## `code-review`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Once fuentes, con `page_title`. Las cuatro de `google-eng-practices` (Nivel 4) respaldan el criterio de aprobar, qué mirar, el tamaño del cambio y el plazo de un día hábil. Comment, Approve, Request changes y los code owners salen de GitHub Docs; las aprobaciones de Free, Premium y Ultimate, de GitLab Docs. El Bash corre en la CI. `CODEOWNERS` dice no ejecutado. §14 completo. `relations` coincide con el §17. El §11 y el §12 comparan la decisión y los avisos con Secure Source Manager y CodeCommit. | ninguna | — |

## `git-tags-and-releases`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Nueve fuentes, con `page_title`. §14 completo, sin montos. El Bash corre en la CI. El workflow dice validado con actionlint y no ejecutado. `relations` coincide con el §17. El §11 y el §12 comparan el release y el disparo por tag con Cloud Build y CodePipeline, con páginas de los dos lados en la ficha. | ninguna | — |

## `ci-cd-pipelines`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Trece fuentes, con `page_title`. §14 completo, sin montos. Los precios de GitHub Actions, Cloud Build, CodeBuild y Azure DevOps están citados con la página y la fecha 2026-10-14, y las notas dicen que los montos no se copian. El workflow de GitHub dice validado con actionlint y no ejecutado. El de GitLab dice no ejecutado. `relations` incluye `infrastructure-as-code` y el §17 la nombra. El §11 y el §12 comparan la unidad, la configuración y el cobro, con fuente de cada lado. | ninguna | — |

## `automated-testing-in-ci`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Nueve fuentes, con `page_title`. §14 completo, sin montos. `test_dedupe.py` corre en la CI con pytest y `mypy --strict`. El workflow dice validado con actionlint y no ejecutado. `relations` coincide con el §17. El §11 y el §12 comparan cómo corre pytest, el reporte y la matrix, con páginas de Cloud Build y CodeBuild en la ficha. | ninguna | — |

## `build-artifacts`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Ocho fuentes, con `page_title`. §14 completo, sin montos. `package.py` corre en la CI y pasa `mypy --strict`. El workflow dice validado con actionlint y no ejecutado. `relations` coincide con el §17. El §11 y el §12 comparan el paso entre jobs y el registro, y dicen qué páginas no tratan el registro o el paso entre builds. Esas páginas están en la ficha. | ninguna | — |
