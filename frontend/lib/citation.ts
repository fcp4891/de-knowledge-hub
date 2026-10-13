export type CitationLabel = {
  title: string;
  url: string;
  authority_level: number;
  page_title?: string | null;
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

/** Línea secundaria: título del registro y nivel de autoridad. */
export function citationDetail(citation: Pick<CitationLabel, "title" | "authority_level">): string {
  return `${citation.title} · Nivel ${citation.authority_level}`;
}
