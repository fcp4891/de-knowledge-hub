/** La sección Arquitectura se lee de izquierda a derecha, salvo que la cadena más larga no quepa en horizontal. */

// Estándar de diagramas (CLAUDE.md): LR solo si la cadena más larga tiene 5 nodos o menos.
export const MAX_HORIZONTAL_CHAIN = 5;

const SKIP = /^(flowchart|graph|subgraph|end|classDef|class|style|linkStyle|click|direction|%%)\b/i;
const ARROW = /\s*<?(?:-{2,}|={2,}|-\.+-?)[>xo]?\s*/;

/** Nodos del camino más largo del flowchart, siguiendo las aristas (A --> B --> C cuenta 3). */
export function longestChain(source: string): number {
  const edges = new Map<string, Set<string>>();
  const nodes = new Set<string>();
  for (const raw of source.split("\n")) {
    const line = raw.trim();
    if (!line || SKIP.test(line)) {
      continue;
    }
    const bare = line
      .replace(/"[^"]*"/g, "")                 // etiquetas entre comillas
      .replace(/\|[^|]*\|/g, "")               // etiquetas de arista |texto|
      .replace(/(\w)\s*(\[\[|\[|\(\(|\(|\{\{|\{|>)[^\]\)\}]*[\]\)\}]+/g, "$1");   // formas del nodo
    const groups = bare
      .split(ARROW)
      .map((part) => part.split("&").map((id) => id.trim()).filter((id) => /^\w+$/.test(id)))
      .filter((group) => group.length > 0);   // A -- "texto" --> B deja un tramo vacío entre las dos flechas
    groups.flat().forEach((id) => nodes.add(id));
    for (let i = 0; i + 1 < groups.length; i += 1) {
      for (const from of groups[i]) {
        for (const to of groups[i + 1]) {
          if (!edges.has(from)) edges.set(from, new Set());
          edges.get(from)!.add(to);
        }
      }
    }
  }
  const memo = new Map<string, number>();
  const visiting = new Set<string>();
  const depth = (node: string): number => {
    if (memo.has(node)) return memo.get(node)!;
    if (visiting.has(node)) return 0;   // un ciclo no alarga la cadena
    visiting.add(node);
    let best = 0;
    for (const next of edges.get(node) ?? []) {
      best = Math.max(best, depth(next));
    }
    visiting.delete(node);
    memo.set(node, best + 1);
    return best + 1;
  };
  return Math.max(0, ...[...nodes].map(depth));
}

export function horizontalFlowchart(source: string): string {
  const lines = source.split("\n");
  const index = lines.findIndex((line) => /^(flowchart|graph)\b/i.test(line.trim()));
  if (index < 0 || longestChain(source) > MAX_HORIZONTAL_CHAIN) {
    return source;
  }
  lines[index] = lines[index].replace(/^(flowchart|graph)(\s+)(TB|TD|BT)\b/i, "$1$2LR");
  return lines.join("\n");
}
