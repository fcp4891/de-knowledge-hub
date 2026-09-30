import { readMock } from "./mock";
import type {
  ApiResult,
  ConceptDetail,
  ConceptList,
  DomainDetail,
  DomainList,
  SearchResults,
  StudyStateList,
  StudyStatus,
} from "./types";

export function isMockMode(): boolean {
  return (process.env.API_MODE ?? "mock") === "mock";
}

async function apiGet<T>(key: string, livePath: string): Promise<ApiResult<T>> {
  if (isMockMode()) {
    return readMock<T>(key);
  }

  const base = process.env.API_BASE_URL ?? "http://localhost:8000/api/v1";
  const response = await fetch(`${base}${livePath}`, { cache: "no-store" });
  if (response.status === 404) {
    return { ok: false, reason: "not_found" };
  }
  if (!response.ok) {
    throw new Error(`La API respondió ${response.status} en ${livePath}`);
  }
  return { ok: true, data: (await response.json()) as T };
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

export function listStudyStates(state?: StudyStatus): Promise<ApiResult<StudyStateList>> {
  const resource = state ? `/me/study-state?state=${state}` : "/me/study-state";
  return apiGet(`GET ${resource}`, resource);
}

/**
 * Coincidencia ya resuelta en el mock (o, en vivo, por la API).
 * No reordena ni recalcula `score`.
 */
export function search(query: string): Promise<ApiResult<SearchResults>> {
  const resource = `/search?q=${query}`;
  return apiGet(`GET ${resource}`, resource);
}
