export const ARCHITECTURE_TITLE: Readonly<Record<string, string>> = {
  summary: "Resumen",
  scenario: "Escenario",
  context_view: "Contexto",
  components: "Componentes",
  data_view: "Datos",
  deployment_view: "Despliegue",
  security: "Seguridad",
  operations: "Operación",
  costs: "Costos",
  code: "Código",
  gcp: "GCP / AWS / Azure",
  risks: "Riesgos",
  common_mistakes: "Errores",
  trade_offs: "Trade-offs",
  related_concepts: "Relacionados",
  evolution: "Evolución",
  related_lab: "Laboratorio",
  sources: "Fuentes",
  last_verified: "Verificación",
  change_history: "Historial",
};

export const ARCHITECTURE_GROUPS: { group: string; sections: number[] }[] = [
  { group: "Inicio", sections: [1, 2] },
  { group: "Vistas", sections: [3, 4, 5, 6] },
  { group: "Operación", sections: [7, 8, 9] },
  { group: "Código", sections: [10] },
  { group: "Nubes", sections: [11] },
  { group: "Profundizar", sections: [14, 15, 16, 17] },
  { group: "Evolución", sections: [18, 19] },
  { group: "Referencias", sections: [20, 21, 22] },
];

export const VIEW_LABEL: Readonly<Record<string, string>> = {
  context_view: "Vista de contexto",
  data_view: "Vista de datos",
  deployment_view: "Vista de despliegue",
};

export function isArchitectureView(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(VIEW_LABEL, key);
}

export function architectureTitle(key: string, fallback: string): string {
  return ARCHITECTURE_TITLE[key] ?? fallback;
}

export type CodeStatusTone = "ci" | "config" | "skipped";

export type CodeStatusPiece =
  | { type: "text"; value: string }
  | { type: "status"; label: string; tone: CodeStatusTone };

const STATUS_RULES: { source: string; label: string; tone: CodeStatusTone }[] = [
  { source: "no ejecutado", label: "no ejecutado", tone: "skipped" },
  { source: "configuración validada", label: "configuración validada", tone: "config" },
  { source: "ejecuta(?:do|da)? en la CI", label: "ejecutado en CI", tone: "ci" },
];

export function splitCodeStatus(value: string): CodeStatusPiece[] {
  const hits: { start: number; end: number; label: string; tone: CodeStatusTone }[] = [];
  for (const rule of STATUS_RULES) {
    const pattern = new RegExp(rule.source, "gi");
    for (const match of value.matchAll(pattern)) {
      const start = match.index ?? 0;
      hits.push({ start, end: start + match[0].length, label: rule.label, tone: rule.tone });
    }
  }
  hits.sort((left, right) => left.start - right.start);
  const pieces: CodeStatusPiece[] = [];
  let cursor = 0;
  for (const hit of hits) {
    if (hit.start < cursor) {
      continue;
    }
    if (hit.start > cursor) {
      pieces.push({ type: "text", value: value.slice(cursor, hit.start) });
    }
    pieces.push({ type: "status", label: hit.label, tone: hit.tone });
    cursor = hit.end;
  }
  if (cursor < value.length) {
    pieces.push({ type: "text", value: value.slice(cursor) });
  }
  if (pieces.length === 0) {
    pieces.push({ type: "text", value });
  }
  return pieces;
}

export function normalizeLabel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function componentAnchor(name: string): string {
  const slug = normalizeLabel(name).replace(/ /g, "-");
  return slug.length > 0 ? `component-${slug}` : "component";
}

export function sameComponent(left: string, right: string): boolean {
  const a = normalizeLabel(left);
  const b = normalizeLabel(right);
  return a.length > 0 && a === b;
}
