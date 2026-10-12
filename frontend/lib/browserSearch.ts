import MiniSearch from "minisearch";

import type { ApiResult, Classification, ResultType, SearchResults } from "@/lib/api/types";

export type SearchDocument = {
  id: string;
  slug: string;
  title: string;
  type: ResultType;
  domain: string | null;
  classification: Classification | null;
  has_page: boolean;
  snippet: string;
  tags?: string[] | string;
  aliases?: string[] | string;
};

/** Mismo peso para el título y los alias (ADR-010). */
const SEARCH_OPTIONS = {
  prefix: true,
  fuzzy: 0.2,
  boost: { title: 1, aliases: 1 },
} as const;

type SearchIndexFile = { documents: SearchDocument[] };

const GROUP_ORDER: ResultType[] = [
  "concept",
  "pattern",
  "architecture",
  "technology",
  "cloud_service",
  "code_snippet",
  "source",
];

let indexPromise: Promise<MiniSearch<SearchDocument>> | undefined;

function fieldText(value: string[] | string | undefined): string {
  if (Array.isArray(value)) {
    return value.join(" ");
  }
  return value ?? "";
}

export function indexDocuments(documents: SearchDocument[]): MiniSearch<SearchDocument> {
  const mini = new MiniSearch<SearchDocument>({
    fields: ["title", "snippet", "tags", "aliases"],
    storeFields: ["slug", "title", "type", "domain", "classification", "has_page", "snippet"],
    idField: "id",
    extractField: (document, fieldName) => {
      if (fieldName === "tags") {
        return fieldText(document.tags);
      }
      if (fieldName === "aliases") {
        return fieldText(document.aliases);
      }
      if (fieldName === "title") {
        return document.title;
      }
      if (fieldName === "snippet") {
        return document.snippet;
      }
      return document[fieldName as keyof SearchDocument];
    },
  });
  mini.addAll(documents);
  return mini;
}

export function searchDocuments(documents: SearchDocument[], query: string): string[] {
  return indexDocuments(documents)
    .search(query, SEARCH_OPTIONS)
    .map((hit) => hit.title);
}

function loadIndex(): Promise<MiniSearch<SearchDocument>> {
  indexPromise ??= fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/data/search-index.json`)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(String(response.status));
      }
      return (await response.json()) as SearchIndexFile;
    })
    .then((file) => indexDocuments(file.documents));
  return indexPromise;
}

export async function searchLocal(query: string): Promise<ApiResult<SearchResults>> {
  try {
    const mini = await loadIndex();
    const hits = mini.search(query, SEARCH_OPTIONS);
    const groups = GROUP_ORDER.map((type) => ({
      type,
      items: hits
        .filter((hit) => hit.type === type)
        .map((hit) => ({
          slug: hit.slug,
          title: hit.title,
          type: hit.type,
          domain: hit.domain,
          classification: hit.classification,
          has_page: hit.has_page,
          snippet: hit.snippet,
          score: hit.score,
        })),
    })).filter((group) => group.items.length > 0);
    const total = groups.reduce((count, group) => count + group.items.length, 0);
    return { ok: true, data: { query, total, groups } };
  } catch {
    return { ok: false, reason: "unavailable", detail: "No se pudo cargar el índice de búsqueda." };
  }
}
