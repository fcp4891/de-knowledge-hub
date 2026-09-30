import type { components } from "./schema";

export type DomainList = components["schemas"]["DomainList"];
export type DomainSummary = components["schemas"]["DomainSummary"];
export type DomainDetail = components["schemas"]["DomainDetail"];
export type ConceptList = components["schemas"]["ConceptList"];
export type ConceptSummary = components["schemas"]["ConceptSummary"];
export type ConceptDetail = components["schemas"]["ConceptDetail"];
export type StudyStateList = components["schemas"]["StudyStateList"];
export type StudyState = components["schemas"]["StudyState"];
export type StudyStatus = components["schemas"]["StudyStatus"];
export type Classification = components["schemas"]["Classification"];
export type Level = components["schemas"]["Level"];
export type SearchResults = components["schemas"]["SearchResults"];

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "mock_missing" | "not_found" };
