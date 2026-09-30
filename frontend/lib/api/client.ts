import { readMock } from "./mock";
import type {
  ApiResult,
  ConceptDetail,
  ConceptList,
  DomainDetail,
  DomainList,
  Favorite,
  Note,
  NoteList,
  RelationGroups,
  SearchResults,
  StudyState,
  StudyStateList,
  StudyStateUpdate,
  StudyStatus,
  TechnologyDetail,
} from "./types";

function usesMock(livePath: string): boolean {
  if (livePath.startsWith("/me")) {
    return false;
  }
  return (process.env.API_MODE ?? "hybrid") === "mock";
}

async function problemDetail(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { title?: string; detail?: string };
    if (typeof body.detail === "string" && body.detail.length > 0) {
      return body.detail;
    }
    if (typeof body.title === "string" && body.title.length > 0) {
      return body.title;
    }
  } catch {
    return "Datos no válidos.";
  }
  return "Datos no válidos.";
}

async function liveRequest<T>(method: string, livePath: string, body?: unknown): Promise<ApiResult<T>> {
  const base = process.env.API_BASE_URL ?? "http://localhost:8000/api/v1";
  try {
    const response = await fetch(`${base}${livePath}`, {
      method,
      cache: "no-store",
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.status === 404) {
      return { ok: false, reason: "not_found" };
    }
    if (response.status === 422) {
      return { ok: false, reason: "validation", detail: await problemDetail(response) };
    }
    if (!response.ok) {
      return { ok: false, reason: "unavailable", detail: `La API respondió ${response.status}.` };
    }
    if (response.status === 204) {
      return { ok: true, data: null as T };
    }
    return { ok: true, data: (await response.json()) as T };
  } catch {
    return { ok: false, reason: "unavailable", detail: "No se pudo contactar la API." };
  }
}

async function apiGet<T>(mockKey: string, livePath: string): Promise<ApiResult<T>> {
  if (usesMock(livePath)) {
    return readMock<T>(mockKey);
  }
  return liveRequest<T>("GET", livePath);
}

export function listDomains(): Promise<ApiResult<DomainList>> {
  return apiGet("GET /domains", "/domains");
}

export function getDomain(slug: string): Promise<ApiResult<DomainDetail>> {
  const resource = `/domains/${slug}`;
  return apiGet(`GET ${resource}`, resource);
}

export function listConcepts(): Promise<ApiResult<ConceptList>> {
  const resource = "/concepts?limit=500";
  return apiGet(`GET ${resource}`, resource);
}

export function getConcept(slug: string): Promise<ApiResult<ConceptDetail>> {
  const resource = `/concepts/${slug}`;
  return apiGet(`GET ${resource}`, resource);
}

export function getTechnology(slug: string): Promise<ApiResult<TechnologyDetail>> {
  const resource = `/technologies/${slug}`;
  return apiGet(`GET ${resource}`, resource);
}

export function getRelations(slug: string): Promise<ApiResult<RelationGroups>> {
  const resource = `/entities/${slug}/relations`;
  return apiGet(`GET ${resource}`, resource);
}

export function listStudyStates(state?: StudyStatus): Promise<ApiResult<StudyStateList>> {
  const resource = state ? `/me/study-state?state=${state}` : "/me/study-state";
  return liveRequest("GET", resource);
}

export function getStudyState(slug: string): Promise<ApiResult<StudyState>> {
  return liveRequest("GET", `/me/study-state/${slug}`);
}

export function putStudyState(slug: string, update: StudyStateUpdate): Promise<ApiResult<StudyState>> {
  return liveRequest("PUT", `/me/study-state/${slug}`, update);
}

export function getFavorite(slug: string): Promise<ApiResult<Favorite>> {
  return liveRequest("GET", `/me/favorites/${slug}`);
}

export function putFavorite(slug: string, favorite: boolean): Promise<ApiResult<Favorite>> {
  return liveRequest("PUT", `/me/favorites/${slug}`, { favorite });
}

export function listNotes(slug: string): Promise<ApiResult<NoteList>> {
  return liveRequest("GET", `/me/notes/${slug}`);
}

export function createNote(slug: string, bodyMarkdown: string): Promise<ApiResult<Note>> {
  return liveRequest("POST", `/me/notes/${slug}`, { body_markdown: bodyMarkdown });
}

export function updateNote(slug: string, noteId: string, bodyMarkdown: string): Promise<ApiResult<Note>> {
  return liveRequest("PUT", `/me/notes/${slug}/${noteId}`, { body_markdown: bodyMarkdown });
}

export function deleteNote(slug: string, noteId: string): Promise<ApiResult<null>> {
  return liveRequest("DELETE", `/me/notes/${slug}/${noteId}`);
}

/**
 * En vivo, la API ya agrupó y ordenó los resultados.
 * No reordena ni recalcula `score`.
 */
export function search(query: string): Promise<ApiResult<SearchResults>> {
  return apiGet(`GET /search?q=${query}`, `/search?q=${encodeURIComponent(query)}`);
}
