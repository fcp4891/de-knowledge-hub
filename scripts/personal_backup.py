"""Respaldo y restauración del estado personal (tablas me_*, ADR-006) con pg_dump.

El estado personal es el único dato que no se regenera desde Git. Este script lo exporta como
SQL (solo datos) a un directorio **fuera del repo** y lo restaura dentro de una transacción.

- Directorio: BACKUP_DIR (entorno o .env); por defecto ../dekh-backups junto al repo.
- Base: DATABASE_URL (entorno o .env); por defecto la de docker-compose.yml.
- Ejecución de pg_dump/psql (BACKUP_RUNNER):
  - compose (por defecto): dentro del servicio `db` de docker-compose.yml (no requiere cliente local);
  - docker-host: contenedor postgres:17 efímero con --network host (Linux, CI);
  - local: pg_dump y psql del PATH.
- restore respalda antes el estado actual (sufijo -pre-restore) y luego reemplaza las tablas me_*.

Uso:
  python -m scripts.personal_backup backup
  python -m scripts.personal_backup restore [ARCHIVO]   # sin archivo: el respaldo más reciente
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from datetime import UTC, datetime
from pathlib import Path

from sqlalchemy import make_url

ROOT = Path(__file__).resolve().parent.parent
TABLES = ("me_study_states", "me_notes", "me_favorites")
DEFAULT_URL = "postgresql+psycopg://dekh:dekh@localhost:54329/dekh"
POSTGRES_IMAGE = "postgres:17"


def dotenv(path: Path = ROOT / ".env") -> dict[str, str]:
    """Pares KEY=VALUE de .env (sin dependencias); ignora comentarios y líneas vacías."""
    if not path.is_file():
        return {}
    pairs = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            pairs[key.strip()] = value.strip().strip('"').strip("'")
    return pairs


def setting(name: str, default: str) -> str:
    return os.environ.get(name) or dotenv().get(name) or default


def backup_dir() -> Path:
    return Path(setting("BACKUP_DIR", str(ROOT.parent / "dekh-backups"))).expanduser().resolve()


def libpq_url() -> str:
    """DATABASE_URL sin el driver de SQLAlchemy (postgresql+psycopg -> postgresql)."""
    url = make_url(setting("DATABASE_URL", DEFAULT_URL)).set(drivername="postgresql")
    return url.render_as_string(hide_password=False)


def command(tool: str, args: list[str]) -> list[str]:
    """Línea de comandos para pg_dump o psql según BACKUP_RUNNER."""
    runner = setting("BACKUP_RUNNER", "compose")
    url = make_url(libpq_url())
    if runner == "compose":
        # Dentro del contenedor la conexión es por socket local; solo hacen falta usuario y base.
        return ["docker", "compose", "exec", "-T", "db", tool, "-U", str(url.username), "-d", str(url.database), *args]
    if runner == "docker-host":
        return ["docker", "run", "--rm", "-i", "--network", "host", POSTGRES_IMAGE, tool, "--dbname", libpq_url(), *args]
    if runner == "local":
        return [tool, "--dbname", libpq_url(), *args]
    raise SystemExit(f"BACKUP_RUNNER desconocido: {runner!r} (compose | docker-host | local)")


def run(cmd: list[str], stdin: str | None = None) -> str:
    done = subprocess.run(cmd, cwd=ROOT, input=stdin, capture_output=True, text=True, encoding="utf-8")
    if done.returncode != 0:
        raise SystemExit(f"falló {cmd[0]} ({done.returncode}):\n{done.stderr.strip()}")
    return done.stdout


def dump() -> str:
    tables = [f"--table={t}" for t in TABLES]
    return run(command("pg_dump", ["--data-only", "--column-inserts", "--no-owner", *tables]))


def backup(suffix: str = "") -> Path:
    folder = backup_dir()
    folder.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(UTC).strftime("%Y%m%d-%H%M%S-%f")
    path = folder / f"me-{stamp}{suffix}.sql"
    header = f"-- Respaldo del estado personal (tablas {', '.join(TABLES)}), {datetime.now(UTC).isoformat()}\n"
    path.write_text(header + dump(), encoding="utf-8", newline="\n")
    return path


def latest() -> Path:
    candidates = sorted(p for p in backup_dir().glob("me-*.sql") if not p.stem.endswith("-pre-restore"))
    if not candidates:
        raise SystemExit(f"no hay respaldos en {backup_dir()}")
    return candidates[-1]


def restore(path: Path | None = None) -> tuple[Path, Path]:
    """Restaura `path` (o el último respaldo); antes guarda el estado actual. Devuelve (restaurado, previo)."""
    source = (path or latest()).resolve()
    if not source.is_file():
        raise SystemExit(f"no existe el respaldo {source}")
    previous = backup(suffix="-pre-restore")
    script = (
        "BEGIN;\n"
        f"TRUNCATE {', '.join(TABLES)};\n"
        f"{source.read_text(encoding='utf-8')}\n"
        "COMMIT;\n"
    )
    run(command("psql", ["-v", "ON_ERROR_STOP=1", "--quiet"]), stdin=script)
    return source, previous


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Respaldo y restauración del estado personal (me_*).")
    sub = parser.add_subparsers(dest="action", required=True)
    sub.add_parser("backup")
    restore_parser = sub.add_parser("restore")
    restore_parser.add_argument("file", nargs="?", type=Path)
    args = parser.parse_args(argv)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if args.action == "backup":
        print(f"respaldo: {backup()}")
    else:
        source, previous = restore(args.file)
        print(f"restaurado: {source}\nestado anterior guardado en: {previous}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
