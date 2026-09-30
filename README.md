# Data Engineering Knowledge Hub

Plataforma personal de estudio y actualización continua para Data Engineering. El activo central es el modelo de conocimiento en `content/` (Markdown y YAML validados contra `schemas/`); la base de datos PostgreSQL, la API y el frontend son derivados.

- Plan completo: `docs/plan-maestro.md`. Hoja de ruta: `docs/ROADMAP.md`. Estado: `docs/STATUS.md`.
- Carril A (contenido, backend, scripts) y Carril B (`frontend/`) trabajan en paralelo; ver `CLAUDE.md` y `docs/status/`.

## Entorno de Python

El proyecto usa su propio entorno virtual en `.venv/`, con **Python 3.12** y las dependencias de `requirements.txt`. El `Makefile`, los scripts de `scripts/` y la CI usan ese entorno. Nunca se instala nada en el Python global.

Requisitos: Python 3.12 (en Windows, el lanzador `py -3.12`), GNU Make y Docker Desktop (para PostgreSQL).

Crear el entorno (una vez, o después de cambiar `requirements.txt`):

```bash
make venv
```

`make venv` crea `.venv/` con `py -3.12` en Windows (`python3.12` en Linux y macOS) e instala `requirements.txt`. Para usar otro intérprete 3.12: `make venv BOOTSTRAP_PYTHON=/ruta/a/python3.12`.

Sin `make`, el equivalente en PowerShell es:

```powershell
py -3.12 -m venv .venv
.venv\Scripts\python.exe -m pip install --upgrade pip
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Si falta `.venv`, los objetivos de `make` se detienen con el aviso «Falta el entorno .venv». Los scripts de `scripts/` también cortan con instrucciones si se ejecutan con otro intérprete. Para reinstalar desde cero, borra `.venv/` y vuelve a ejecutar `make venv`.

Cada worktree de git tiene su propio `.venv/` (está en `.gitignore`).

## Comandos habituales

| Comando | Qué hace |
|---|---|
| `make venv` | Crea `.venv/` e instala `requirements.txt` |
| `make install` | Reinstala `requirements.txt` en `.venv/` |
| `make validate` | Valida `content/` contra `schemas/` |
| `make test` | Ejecuta los tests (los de base de datos requieren `make db-up`) |
| `make db-up` / `make db-down` | Levanta o detiene PostgreSQL en Docker |
| `make build` | Valida, migra y compila `content/` a PostgreSQL |
| `make mocks` | Regenera los mocks de `docs/contracts/mock-data/` |
| `make dev` | API en `http://localhost:8000/api/v1` |
| `make backup-me` / `make restore-me` | Respaldo y restauración del estado personal (`me_*`) |

Flujo típico: `make venv`, `make db-up`, `make build`, `make dev`.
