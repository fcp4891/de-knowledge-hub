export type CitationLabel = {
  title: string;
  url: string;
  authority_level: number;
  page_title?: string | null;
  source_type?: string | null;
};

/** Texto del enlace: el título de la página, o la ruta de la URL si no hay. */
export function citationLinkText(citation: Pick<CitationLabel, "url" | "page_title">): string {
  const pageTitle = citation.page_title?.trim();
  if (pageTitle) {
    return pageTitle;
  }
  try {
    return new URL(citation.url).pathname;
  } catch {
    return citation.url;
  }
}

/** Línea secundaria: título del registro y nivel, o «Legislación» si la fuente es legislative. */
export function citationDetail(
  citation: Pick<CitationLabel, "title" | "authority_level" | "source_type">,
): string {
  if (citation.source_type === "legislative") {
    return `Legislación · Nivel ${citation.authority_level}`;
  }
  return `${citation.title} · Nivel ${citation.authority_level}`;
}
