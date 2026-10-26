export const LEGAL_NOTICE = "Esta ficha no es asesoría legal";

export type ClaimKind = "obligation" | "practice" | "architecture";

const LAW_DIGITS = /^ley-(\d{2})(\d+)$/;

export function legislationBadge(codes: readonly string[]): string | null {
  if (codes.length === 0) {
    return null;
  }
  return `Legislación · ${codes.join(" · ")}`;
}

export function lawLabel(law: string): string {
  const match = LAW_DIGITS.exec(law);
  if (!match) {
    return law;
  }
  return `Ley ${match[1]}.${match[2]}`;
}

export function bcnLinkText(url: string): string {
  try {
    const host = new URL(url).hostname;
    if (host === "bcn.cl" || host.endsWith(".bcn.cl")) {
      return "BCN";
    }
  } catch {
    // La URL inválida se muestra tal cual.
  }
  return url;
}

export function claimKind(value: string): ClaimKind | null {
  if (value.startsWith("[Obligación legal · ") && value.endsWith("]")) {
    return "obligation";
  }
  if (value === "[Buena práctica]") {
    return "practice";
  }
  if (value === "[Decisión de arquitectura]") {
    return "architecture";
  }
  return null;
}

export function claimLabel(value: string): string {
  return value.slice(1, -1);
}

/** Ley que se cita como «art. N» sin repetir el número. */
export const DEFAULT_LAW = "ley-19628";

export type ObligationCite = {
  law: string;
  article: string;
  text: string;
};

const OBLIGATION_BODY = /^\[Obligación legal · (.+)\]$/;
const LAW_CITE = /^Ley (\d{2})\.(\d+), art\. (.+)$/;
const ART_CITE = /^art\. (.+)$/;

/** Texto visible de una obligación: «art. N», o «Ley 21.663, art. 9» si no es la 19.628. */
export function obligationCite(value: string): ObligationCite | null {
  const body = OBLIGATION_BODY.exec(value);
  if (!body) {
    return null;
  }
  const cited = body[1];
  const named = LAW_CITE.exec(cited);
  if (named) {
    const law = `ley-${named[1]}${named[2]}`;
    const article = named[3];
    const text = law === DEFAULT_LAW ? `art. ${article}` : `Ley ${named[1]}.${named[2]}, art. ${article}`;
    return { law, article, text };
  }
  const plain = ART_CITE.exec(cited);
  if (!plain) {
    return null;
  }
  return { law: DEFAULT_LAW, article: plain[1], text: `art. ${plain[1]}` };
}

export type ObligationBasis = {
  law: string;
  article: string;
  note: string | null;
};

export function legalRowId(law: string, article: string): string {
  const slug = article
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `lb-${law}-${slug}`;
}

export function matchingObligation(
  items: readonly ObligationBasis[],
  law: string,
  article: string,
): ObligationBasis | null {
  return items.find((item) => item.law === law && item.article === article) ?? null;
}

/** Resumen del artículo: `note` de legal_basis. */
export function obligationNote(
  items: readonly ObligationBasis[],
  law: string,
  article: string,
): string | null {
  const note = matchingObligation(items, law, article)?.note?.trim() ?? "";
  return note.length > 0 ? note : null;
}

const ARCHITECTURE_MARK = "[Decisión de arquitectura]";

export function usesArchitectureMark(markdown: string): boolean {
  return markdown.includes(ARCHITECTURE_MARK);
}

type MarkCell = readonly { type: string; value: string }[];

export function plainInline(parts: MarkCell): string {
  return parts.map((part) => part.value).join("").trim();
}

/** Qué queda visible en una celda de la columna «Etiqueta». */
export type EtiquetaVisual = "empty" | "dot" | "keep";

export function etiquetaVisual(parts: MarkCell): EtiquetaVisual {
  let dot = false;
  let keep = false;
  for (const part of parts) {
    if (part.type === "strong") {
      const kind = claimKind(part.value);
      if (kind === "practice") {
        continue;
      }
      if (kind === "architecture") {
        dot = true;
        continue;
      }
      if (kind === "obligation") {
        keep = true;
        continue;
      }
    }
    if (part.value.trim().length > 0) {
      keep = true;
    }
  }
  if (keep) {
    return "keep";
  }
  if (dot) {
    return "dot";
  }
  return "empty";
}

/** Índice de «Etiqueta» cuando ninguna fila muestra punto ni obligación. */
export function droppedEtiquetaIndex(
  headers: readonly MarkCell[],
  rows: readonly (readonly MarkCell[])[],
): number | null {
  const index = headers.findIndex((cell) => plainInline(cell) === "Etiqueta");
  if (index < 0) {
    return null;
  }
  const allEmpty = rows.every((row) => etiquetaVisual(row[index] ?? []) === "empty");
  return allEmpty ? index : null;
}

export type LegalNoticeCopy = {
  lead: string;
  detail: string | null;
};

/** Saca del Markdown el párrafo que contiene el aviso, para mostrarlo aparte. */
export function extractLegalNotice(markdown: string): { notice: string | null; markdown: string } {
  const parts = markdown.split(/\n{2,}/);
  let notice: string | null = null;
  const kept: string[] = [];
  for (const part of parts) {
    if (notice === null && part.includes(LEGAL_NOTICE)) {
      notice = part.trim();
      continue;
    }
    if (part.trim().length > 0) {
      kept.push(part);
    }
  }
  return { notice, markdown: kept.join("\n\n") };
}

export type LegalBasisInput = {
  law: string;
  article: string;
  url: string;
  note: string | null;
  implication: string;
};

export type LegalBasisRow = {
  law: string;
  article: string;
  url: string;
  says: string | null;
  implication: string | null;
};

export function legalBasisRows(items: readonly LegalBasisInput[]): LegalBasisRow[] {
  return items.map((item) => ({
    law: item.law,
    article: item.article,
    url: item.url,
    says: item.note?.trim() || null,
    implication: item.implication.trim() || null,
  }));
}

export function legalNoticeCopy(paragraph: string | null): LegalNoticeCopy {
  const lead = `${LEGAL_NOTICE}.`;
  if (!paragraph) {
    return { lead, detail: null };
  }
  const rest = paragraph.replace(/^Esta ficha no es asesoría legal[:.]?\s*/, "").trim();
  return { lead, detail: rest.length > 0 ? rest : null };
}
