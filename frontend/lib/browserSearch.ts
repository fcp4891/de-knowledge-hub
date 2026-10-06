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
};

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

function loadIndex(): Promise<MiniSearch<SearchDocument>> {
  indexPromise ??= fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/data/search-index.json`)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(String(response.status));
      }
      return (await response.json()) as SearchIndexFile;
    })
    .then((file) => {
      const mini = new MiniSearch<SearchDocument>({
        fields: ["title", "snippet"],
        storeFields: ["slug", "title", "type", "domain", "classification", "has_page", "snippet"],
        idField: "id",
      });
      mini.addAll(file.documents);
      return mini;
    });
  return indexPromise;
}

export async function searchLocal(query: string): Promise<ApiResult<SearchResults>> {
  try {
    const mini = await loadIndex();
    const hits = mini.search(query, { prefix: true, fuzzy: 0.2 });
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
