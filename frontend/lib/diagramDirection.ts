/** La sección Arquitectura se lee de izquierda a derecha en todas las fichas. */
export function horizontalFlowchart(source: string): string {
  const lines = source.split("\n");
  const index = lines.findIndex((line) => /^(flowchart|graph)\b/i.test(line.trim()));
  if (index < 0) {
    return source;
  }
  lines[index] = lines[index].replace(/^(flowchart|graph)(\s+)(TB|TD|BT)\b/i, "$1$2LR");
  return lines.join("\n");
}
