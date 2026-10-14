# Revisión B-F3.1 · Lote F3b-11b

Fichas en `content/concepts/`, commit `9a9fcc6`. Carril B no las edita. Las seis siguen en `review_required`. No hay comentarios `VERIFY`.

Las 6: `deployment-strategies`, `environment-promotion`, `ci-cd-secrets`, `rollback`, `ci-cd-for-data` y `gitops`.

`.\.venv\Scripts\python.exe scripts\validate.py` terminó así:

```text
OK: 451 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

## Comprobación por comando

```text
§14 Seguridad, Observabilidad y Costo: True en las 6.
page_title vacío: ninguno.
related_topics fuera de relations: ninguno.
relations no nombradas en el §17: ninguno.
Montos: ninguno.
§11 y §12 con tabla: las 6.
```

`opengitops-principles` está en el registro con `authority_level: 4`. La nota dice que no respalda afirmaciones de producto. En `gitops` respalda los cuatro principios. Argo CD, Flux y las nubes salen de sus páginas.

URLs versionadas:

```text
https://argo-cd.readthedocs.io/en/release-3.5/
https://argo-cd.readthedocs.io/en/release-3.5/user-guide/auto_sync/
https://argo-cd.readthedocs.io/en/release-3.5/operator-manual/declarative-setup/
https://v2-9.docs.fluxcd.io/flux/concepts/
```

El H1 de Overview y el de Core Concepts coinciden con el `page_title`.

Código. `tests/test_snippet_code.py`:

```text
test_canary_snippet_waits_promotes_or_rolls_back
test_model_ci_snippet_reports_failing_data_tests          # sqlite3
test_reconcile_snippet_converges_and_prunes_only_when_asked
test_devops_stdlib_snippets_pass_mypy_strict
test_revert_snippet_undoes_merge_with_new_commit_and_keeps_tag   # git revert -m 1, repo temporal
```

Los workflows de GitHub dicen «validado con actionlint en la CI, no ejecutado». Cloud Deploy, GitLab CI y el `Application` de Argo CD dicen «no ejecutado».

`page_title` de la primera cita, contra el H1 o el `<title>`:

```text
Use a deployment strategy
Deployments and environments
Secrets
Git - git-revert Documentation
Continuous integration in dbt
What is OpenGitOps ?
```

## `deployment-strategies`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Siete fuentes, con `page_title`. §14 completo, sin montos. `decide` corre en la CI con `mypy --strict`. El workflow dice validado con actionlint y no ejecutado. `relations` coincide con el §17. El §11 y el §12 comparan estrategias, destinos y la vuelta atrás, con páginas de Cloud Run y de CodeDeploy en la ficha. | ninguna | — |
| La ficha dice que el canary de Cloud Deploy no aplica a los jobs de Cloud Run. La página dice «Cloud Run (services and worker pools—not jobs)». La ficha lo parafrasea y no cita esa frase. | media | Citar «services and worker pools—not jobs». |

## `environment-promotion`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Ocho fuentes, con `page_title`. §14 completo, sin montos. El workflow dice validado con actionlint y no ejecutado. Cloud Deploy dice no ejecutado. `relations` coincide con el §17. El §11 y el §12 están en tabla, con fuente de cada lado. | ninguna | — |

## `ci-cd-secrets`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Trece fuentes, con `page_title`. §14 completo, sin montos. GitHub: «this redaction is not guaranteed». GitLab: «is not a guaranteed way». Las dos frases están en el HTML del 2026-10-14 y en las notas de la ficha. La página de Workload Identity Federation muestra `google-github-actions/auth@v1`. La ficha lo fija al SHA `7c6bc770dae815cd3e89ee6cdf493a5fab2cc093` (el commit «Release: v3.0.0») y explica que *Secure use reference* pide un SHA de commit completo para reducir el riesgo de una puerta trasera. El workflow dice validado con actionlint y no ejecutado. El de GitLab dice no ejecutado. `relations` coincide con el §17. El §11 y el §12 comparan qué se guarda, la vida de la credencial y los logs, con páginas de los dos lados. | ninguna | — |

## `rollback`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Ocho fuentes, con `page_title`. §14 completo, sin montos. `git revert -m 1` corre en la CI sobre un repo temporal y la tag no se mueve. `relations` coincide con el §17. El §11 y el §12 están en tabla, con fuente de cada lado. | ninguna | — |

## `ci-cd-for-data`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Ocho fuentes, con `page_title`. §14 completo, sin montos. `model_ci.py` corre en la CI con sqlite3 y `mypy --strict`. El workflow de dbt dice validado con actionlint y no ejecutado, y la ficha dice que dbt no corre en la CI del proyecto. `relations` coincide con el §17. El §11 y el §12 están en tabla, con fuente de cada lado. | ninguna | — |

## `gitops`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Ocho fuentes, con `page_title`. §14 completo, sin montos. OpenGitOps (Nivel 4) respalda los cuatro principios. El `Application`, `prune` y `selfHeal` salen de Argo CD 3.5 (`release-3.5`). La reconciliación y los artifacts OCI salen de Flux 2.9 (`v2-9.docs.fluxcd.io`). `reconcile.py` corre en la CI con `mypy --strict`. El manifiesto dice no ejecutado. `relations` coincide con el §17. El §11 y el §12 comparan el agente de cada nube, con esas páginas en la ficha. | ninguna | — |
