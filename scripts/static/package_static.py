"""Construye la demo estática del frontend y la empaqueta en dist/dekh-static-<fecha>-<hora>.zip.

Ejecuta `npm run build:static` en frontend/ con BASE_PATH (lo usa el build de Carril B, que también
escribe out/.htaccess) y comprime el contenido de frontend/out/ en la raíz del zip: al usar
«Extract» en public_html/<carpeta>/ de cPanel, index.html y .htaccess quedan en esa carpeta.
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

ROOT = Path(__file__).resolve().parents[2]
FRONTEND = ROOT / "frontend"
OUT = FRONTEND / "out"
DIST = ROOT / "dist"
REQUIRED = ["index.html", "404.html", ".htaccess", "data/index.json", "data/search-index.json"]
# ADR-027, Enmienda 1: el dominio 19 se integró al 24; su página de dominio redirige al espacio de privacidad.
REDIRECTS = {"explorer/compliance/index.html": "/privacidad/"}


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


def redirect_html(base_path: str, target: str) -> str:
    """Página sin JavaScript con canonical y meta refresh hacia la ruta nueva."""
    url = f"{base_path}{target}"
    return (f'<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<title>Redirigiendo…</title>\n'
            f'<link rel="canonical" href="{url}">\n<meta http-equiv="refresh" content="0; url={url}">\n'
            f'<meta name="robots" content="noindex">\n</head>\n<body>\n<p>Esta página se movió: <a href="{url}">{url}</a>.</p>\n'
            '</body>\n</html>\n')


def package(moment: dt.datetime, base_path: str = "/aprendizaje-continuo") -> Path:
    DIST.mkdir(exist_ok=True)
    target = DIST / zip_name(moment)
    if target.exists():
        raise SystemExit(f"Ya existe {target}: no se sobrescribe")
    files = sorted(path for path in OUT.rglob("*") if path.is_file())
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path in files:
            if path.relative_to(OUT).as_posix() not in REDIRECTS:
                zf.write(path, path.relative_to(OUT).as_posix())
        for name, route in sorted(REDIRECTS.items()):
            zf.writestr(name, redirect_html(base_path, route))
    with zipfile.ZipFile(target) as zf:
        names = set(zf.namelist())
    assert all(name in names for name in REQUIRED), "el zip no contiene los archivos obligatorios"
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
