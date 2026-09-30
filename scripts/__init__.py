"""Scripts del Carril A. Se ejecutan con el Python del entorno del proyecto (.venv), nunca con el global."""

from __future__ import annotations

import sys
from pathlib import Path

VENV = Path(__file__).resolve().parent.parent / ".venv"


def require_project_venv() -> None:
    """Corta con instrucciones si el intérprete no es el de .venv (ver README, «Entorno de Python»)."""
    if Path(sys.prefix).resolve() != VENV.resolve():
        raise SystemExit(
            f"Este script usa el entorno del proyecto ({VENV}), pero corre con {sys.executable}.\n"
            "Crea el entorno con `make venv` y ejecuta los scripts con `make <objetivo>`."
        )


require_project_venv()
