import { loadSearchFile, type SearchDocument } from "@/lib/browserSearch";

export type SearchAvailability = {
  status: "in_review" | "in_development";
  label: string;
  help: string;
};

type AvailabilityCopy = Partial<Record<SearchAvailability["status"], { label: string; help: string }>>;

/** Fichas que la búsqueda no abre: el estado viene del listado y la etiqueta, del contenido. */
export function unavailableSearchMarks(
  concepts: readonly { slug: string; availability?: string | null }[],
  copy: AvailabilityCopy,
): Map<string, SearchAvailability> {
  const marks = new Map<string, SearchAvailability>();
  for (const concept of concepts) {
    if (concept.availability !== "in_review" && concept.availability !== "in_development") {
      continue;
    }
    const text = copy[concept.availability];
    if (!text) {
      continue;
    }
    marks.set(concept.slug, { status: concept.availability, label: text.label, help: text.help });
  }
  return marks;
}

type ConceptPage = {
  items: { slug: string; availability?: string | null }[];
  total: number;
};

let searchMarks: Promise<Map<string, SearchAvailability>> | null = null;

/** Lee el listado y una ficha de cada estado. No usa el cliente de servidor (fs). */
export function loadUnavailableSearchMarks(): Promise<Map<string, SearchAvailability>> {
  searchMarks ??= fetchMarks().catch(() => {
    searchMarks = null;
    return new Map<string, SearchAvailability>();
  });
  return searchMarks;
}

/** Sitio estático: el estado y la etiqueta vienen en search-index.json (ADR-031). */
export function marksFromDocuments(documents: readonly SearchDocument[]): Map<string, SearchAvailability> {
  const marks = new Map<string, SearchAvailability>();
  for (const document of documents) {
    if (document.availability) {
      marks.set(document.slug, document.availability);
    }
  }
  return marks;
}

async function fetchMarks(): Promise<Map<string, SearchAvailability>> {
  if (process.env.NEXT_PUBLIC_API_MODE === "static") {
    return marksFromDocuments((await loadSearchFile()).documents);
  }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    return new Map();
  }
  const concepts: { slug: string; availability?: string | null }[] = [];
  let offset = 0;
  let total = 0;
  do {
    const response = await fetch(`${base}/concepts?limit=500&offset=${offset}`);
    if (!response.ok) {
      searchMarks = null;
      return new Map();
    }
    const page = (await response.json()) as ConceptPage;
    concepts.push(...page.items);
    total = page.total;
    if (page.items.length === 0) {
      break;
    }
    offset += page.items.length;
  } while (offset < total);

  const copy: AvailabilityCopy = {};
  await Promise.all(
    (["in_review", "in_development"] as const).map(async (status) => {
      const slug = concepts.find((concept) => concept.availability === status)?.slug;
      if (!slug) {
        return;
      }
      const response = await fetch(`${base}/concepts/${slug}`);
      if (!response.ok) {
        return;
      }
      const detail = (await response.json()) as { availability_text?: { label: string; help: string } | null };
      if (detail.availability_text) {
        copy[status] = detail.availability_text;
      }
    }),
  );
  return unavailableSearchMarks(concepts, copy);
}
