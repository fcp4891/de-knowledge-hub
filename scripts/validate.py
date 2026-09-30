"""Punto de entrada de `make validate`: la validación vive en backend/content/validate.py.

Uso: python scripts/validate.py [--content DIR] [--schemas DIR] [--report]
"""

from __future__ import annotations

import sys
from pathlib import Path

if __package__ in (None, ""):  # ejecutado como `python scripts/validate.py`
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts import require_project_venv  # noqa: E402

require_project_venv()

from backend.content.validate import main  # noqa: E402

if __name__ == "__main__":
    sys.exit(main())
