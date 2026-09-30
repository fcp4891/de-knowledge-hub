"""Compila content/ en PostgreSQL (A-F2.2). Valida primero; solo recompila archivos cambiados.

Uso: python -m scripts.compile [--full] [--database-url URL]
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from backend.db.compiler import CompileError, compile_content
from backend.db.config import make_engine

ROOT = Path(__file__).resolve().parent.parent


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--full", action="store_true", help="recompilar todos los archivos")
    parser.add_argument("--database-url", default=None)
    parser.add_argument("--content", type=Path, default=ROOT / "content")
    parser.add_argument("--schemas", type=Path, default=ROOT / "schemas")
    args = parser.parse_args(argv)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    try:
        stats = compile_content(make_engine(args.database_url), args.content, args.schemas, full=args.full)
    except CompileError as exc:
        print(f"FALLÓ: content/ no valida; la base no se modificó.\n{exc}")
        return 1
    print(f"OK: {len(stats.added)} agregados, {len(stats.updated)} actualizados, "
          f"{len(stats.deleted)} eliminados, {stats.unchanged} sin cambios")
    for label, files in (("+", stats.added), ("~", stats.updated), ("-", stats.deleted)):
        for rel in files:
            print(f"  {label} {rel}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
