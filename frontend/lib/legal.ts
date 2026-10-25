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
