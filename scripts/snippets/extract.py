"""Extrae el código de un lenguaje de los snippets y de las fichas, para validarlo con su herramienta (ADR-008).

Para Terraform, un directorio con main.tf por cada bloque, que la CI valida con
`terraform init -backend=false` y `terraform validate` (sin credenciales):

- snippets de `language: terraform`: <out>/snippets/<slug>/main.tf (un único bloque ```hcl por snippet);
- fichas de content/concepts/: <out>/concepts/<slug>[-N]/main.tf, un directorio por bloque ```hcl.

Un bloque de ficha que es un fragmento intencional (no se puede validar solo) se excluye poniendo, en la
línea inmediatamente anterior a la apertura del bloque, el marcador:

    <!-- validate-terraform: excluido — motivo -->

Los excluidos se reportan con su motivo. Idempotente: borra y reescribe el directorio de salida.

Para GitHub Actions (ADR-014), solo los bloques ```yaml cuya primera línea empieza con `# GitHub Actions`, a
<out>/concepts/<slug>[-N]/workflow.yml, que la CI revisa con actionlint. El resto del YAML no se extrae.

Para CloudFormation y Bicep (ADR-015): bloques ```yaml cuya primera línea empieza con `# CloudFormation`, a
template.yaml, y bloques ```bicep a main.bicep. cfn-lint y `bicep build` los revisan; no se despliegan.

Para contenedores (ADR-016), los bloques ```dockerfile a Dockerfile (hadolint) y los ```yaml que empiezan con
`# Kubernetes` a manifest.yaml (kubeconform).

Uso: python -m scripts.snippets.extract --language terraform --out build/terraform
     python -m scripts.snippets.extract --language github-actions --out build/github-actions
     python -m scripts.snippets.extract --language cloudformation --out build/cloudformation
     python -m scripts.snippets.extract --language bicep --out build/bicep
     python -m scripts.snippets.extract --language dockerfile --out build/dockerfile
     python -m scripts.snippets.extract --language kubernetes --out build/kubernetes
"""

from __future__ import annotations

import argparse
import re
import shutil
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SNIPPETS = ROOT / "content" / "snippets"
CONCEPTS = ROOT / "content" / "concepts"
FENCES = {  # lenguaje -> (etiqueta del bloque, archivo)
    "terraform": ("hcl", "main.tf"),
    "github-actions": ("yaml", "workflow.yml"),
    "cloudformation": ("yaml", "template.yaml"),
    "bicep": ("bicep", "main.bicep"),
    "dockerfile": ("dockerfile", "Dockerfile"),
    "kubernetes": ("yaml", "manifest.yaml"),
}
FIRST_LINE = {  # lenguajes que comparten etiqueta con otros: se reconocen por la primera línea del bloque
    "github-actions": re.compile(r"^# GitHub Actions"),
    "cloudformation": re.compile(r"^# CloudFormation"),
    "kubernetes": re.compile(r"^# Kubernetes"),
}
FENCE = re.compile(r"^```(\w+)\n(.*?)^```", re.S | re.M)
LANGUAGE = re.compile(r"^language: (\w+)$", re.M)
EXCLUDED = re.compile(r"<!--\s*validate-(?:terraform|actions|cfn|bicep|dockerfile|k8s):\s*excluido\s*[—-]\s*(.+?)\s*-->\s*$")


@dataclass(frozen=True)
class Excluded:
    path: Path
    reason: str


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
        blocks = [code for tag, code in FENCE.findall(text) if tag == fence and belongs(language, code)]
        if len(blocks) != 1:
            raise SystemExit(f"{path.name}: se esperaba un bloque ```{fence}, hay {len(blocks)}")
        target = out / path.stem / filename
        target.parent.mkdir(parents=True)
        target.write_text(blocks[0], encoding="utf-8", newline="\n")
        written.append(target)
    return written


def belongs(language: str, code: str) -> bool:
    """Si el bloque es del lenguaje: para los que comparten etiqueta (yaml), por su primera línea."""
    marker = FIRST_LINE.get(language)
    return marker is None or bool(marker.match(code))


def preceding_line(text: str, position: int) -> str:
    before = text[:position].rstrip("\n")
    return before.rsplit("\n", 1)[-1]


def extract_concepts(language: str, out: Path, concepts_dir: Path = CONCEPTS) -> tuple[list[Path], list[Excluded]]:
    """Escribe <out>/<slug>[-N]/<archivo> por cada bloque del lenguaje en las fichas; devuelve escritos y excluidos."""
    fence, filename = FENCES[language]
    if out.exists():
        shutil.rmtree(out)
    written: list[Path] = []
    excluded: list[Excluded] = []
    for path in sorted(concepts_dir.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        blocks = [m for m in FENCE.finditer(text) if m.group(1) == fence and belongs(language, m.group(2))]
        for number, match in enumerate(blocks, start=1):
            name = path.stem if len(blocks) == 1 else f"{path.stem}-{number}"
            marker = EXCLUDED.search(preceding_line(text, match.start()))
            if marker:
                excluded.append(Excluded(path, marker.group(1)))
                continue
            target = out / name / filename
            target.parent.mkdir(parents=True)
            target.write_text(match.group(2), encoding="utf-8", newline="\n")
            written.append(target)
    return written, excluded


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Extrae el código de un lenguaje de los snippets y las fichas.")
    parser.add_argument("--language", choices=sorted(FENCES), required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args(argv)
    for path in extract(args.language, args.out / "snippets"):
        print(f"snippet: {path.parent}")
    written, excluded = extract_concepts(args.language, args.out / "concepts")
    for path in written:
        print(f"ficha: {path.parent}")
    for item in excluded:
        print(f"excluido (fragmento intencional): {item.path.name} — {item.reason}")
    print(f"{len(excluded)} fragmento(s) excluido(s)")


if __name__ == "__main__":
    main()
