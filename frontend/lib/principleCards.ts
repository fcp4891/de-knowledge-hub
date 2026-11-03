export type PrincipleAction = "reveal" | "navigate";

export function principleAriaLabel(label: string, child: string): string {
  const name = label.replace(/[.\s]+$/, "");
  return `${name}. Abrir ficha: ${child}`;
}

export function principleActivation(input: {
  hoverNone: boolean;
  alreadyOpen: boolean;
  keyboard: boolean;
}): PrincipleAction {
  if (input.keyboard || !input.hoverNone || input.alreadyOpen) {
    return "navigate";
  }
  return "reveal";
}

export function tooltipAlign(index: number, columns: number): "start" | "end" {
  const column = index % columns;
  return column >= columns / 2 ? "end" : "start";
}
