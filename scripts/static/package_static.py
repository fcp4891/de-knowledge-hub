"""Construye la demo estática del frontend y la empaqueta en dist/dekh-static-<fecha>-<hora>.zip.

Ejecuta `npm run build:static` en frontend/ con BASE_PATH (lo usa el build de Carril B, que también
escribe out/.htaccess) y comprime el contenido de frontend/out/ en la raíz del zip: al usar
«Extract» en public_html/<carpeta>/ de cPanel, index.html y .htaccess quedan en esa carpeta.
Agrega al zip las páginas de redirección de scripts.static.redirects (ADR-027).
El nombre lleva la fecha y la hora locales del sistema (AAAA-MM-DD-HHMMSS): re-ejecutar no sobrescribe
ningún zip anterior, y si el nombre ya existe el empaquetado se detiene.

Requiere frontend/public/data/ (scripts.static.build_static_data) y las dependencias de npm.
Uso: python -m scripts.static.package_static [--base-path /aprendizaje-continuo] [--skip-build]
"""

from __future__ import annotations

import argparse
import datetime as dt
import os
import re
import subprocess
import sys
import zipfile
from pathlib import Path

from scripts.static.redirects import redirect_pages

ROOT = Path(__file__).resolve().parents[2]
FRONTEND = ROOT / "frontend"
OUT = FRONTEND / "out"
DIST = ROOT / "dist"
REQUIRED = ["index.html", "404.html", ".htaccess", "data/index.json", "data/search-index.json"]


def check_base_path(base_path: str) -> str:
    # Git Bash convierte "/x" en "C:/Program Files/Git/x" si no se desactiva (el Makefile lo hace).
    if not re.fullmatch(r"/[A-Za-z0-9_\-/]*[A-Za-z0-9_\-]", base_path):
        raise SystemExit(f"BASE_PATH inválido: {base_path!r} (debe ser como /aprendizaje-continuo)")
    return base_path


def build_frontend(base_path: str) -> None:
    if not (FRONTEND / "public" / "data" / "index.json").exists():
        raise SystemExit("Falta frontend/public/data/: ejecuta python -m scripts.static.build_static_data")
    npm = "npm.cmd" if sys.platform == "win32" else "npm"
    subprocess.run([npm, "run", "build:static"], cwd=FRONTEND, env={**os.environ, "BASE_PATH": base_path}, check=True)


def check_output(base_path: str) -> None:
    missing = [name for name in REQUIRED if not (OUT / name).is_file()]
    if missing:
        raise SystemExit(f"Faltan en frontend/out/: {', '.join(missing)}")
    if f'"{base_path}/_next/' not in (OUT / "index.html").read_text(encoding="utf-8"):
        raise SystemExit(f"index.html no usa BASE_PATH={base_path}")


def zip_name(moment: dt.datetime) -> str:
    return f"dekh-static-{moment:%Y-%m-%d-%H%M%S}.zip"


def package(moment: dt.datetime, base_path: str, out: Path | None = None, dist: Path | None = None) -> Path:
    out, dist = out or OUT, dist or DIST
    dist.mkdir(exist_ok=True)
    target = dist / zip_name(moment)
    if target.exists():
        raise SystemExit(f"Ya existe {target}: no se sobrescribe")
    files = sorted(path for path in out.rglob("*") if path.is_file())
    redirects = redirect_pages(base_path)   # ADR-027: /explorer/compliance/<slug>/ → /concepts/<slug>/
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path in files:
            name = path.relative_to(out).as_posix()
            if name not in redirects:
                zf.write(path, name)
        for name, html in sorted(redirects.items()):
            zf.writestr(name, html)
    with zipfile.ZipFile(target) as zf:
        names = set(zf.namelist())
    assert all(name in names for name in [*REQUIRED, *redirects]), "el zip no contiene los archivos obligatorios"
    return target


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Construye y empaqueta la demo estática.")
    parser.add_argument("--base-path", default=os.environ.get("BASE_PATH", "/aprendizaje-continuo"))
    parser.add_argument("--skip-build", action="store_true", help="solo empaqueta frontend/out/ existente")
    args = parser.parse_args(argv)
    base_path = check_base_path(args.base_path)
    if not args.skip_build:
        build_frontend(base_path)
    check_output(base_path)
    target = package(dt.datetime.now(), base_path)   # hora local del sistema
    print(f"zip: {target} ({target.stat().st_size:,} bytes, BASE_PATH={base_path})")


if __name__ == "__main__":
    main()
