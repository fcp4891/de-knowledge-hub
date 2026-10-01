"""Extrae el código de los snippets de un lenguaje a archivos, para validarlo con su herramienta (ADR-008).

Para Terraform: un directorio por snippet con main.tf, que la CI valida con
`terraform init -backend=false` y `terraform validate` (sin credenciales).
Idempotente: borra y reescribe el directorio de salida.

Uso: python -m scripts.snippets.extract --language terraform --out build/snippets/terraform
"""

from __future__ import annotations

import argparse
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SNIPPETS = ROOT / "content" / "snippets"
FENCES = {"terraform": ("hcl", "main.tf")}  # lenguaje del snippet -> (etiqueta del bloque, archivo)
FENCE = re.compile(r"^```(\w+)\n(.*?)^```", re.S | re.M)
LANGUAGE = re.compile(r"^language: (\w+)$", re.M)


def extract(language: str, out: Path, snippets_dir: Path = SNIPPETS) -> list[Path]:
    """Escribe <out>/<slug>/<archivo> por cada snippet del lenguaje; devuelve los archivos escritos."""
    fence, filename = FENCES[language]
    if out.exists():
        shutil.rmtree(out)
    written = []
    for path in sorted(snippets_dir.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        match = LANGUAGE.search(text)
        if match is None or match.group(1) != language:
            continue
        blocks = [code for tag, code in FENCE.findall(text) if tag == fence]
        if len(blocks) != 1:
            raise SystemExit(f"{path.name}: se esperaba un bloque ```{fence}, hay {len(blocks)}")
        target = out / path.stem / filename
        target.parent.mkdir(parents=True)
        target.write_text(blocks[0], encoding="utf-8", newline="\n")
        written.append(target)
    return written


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Extrae el código de los snippets de un lenguaje.")
    parser.add_argument("--language", choices=sorted(FENCES), required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args(argv)
    for path in extract(args.language, args.out):
        print(path.parent)


if __name__ == "__main__":
    main()
