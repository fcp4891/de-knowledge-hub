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
export type SearchResult = components["schemas"]["SearchResult"];
export type ResultType = components["schemas"]["ResultType"];
export type TechnologyDetail = components["schemas"]["TechnologyDetail"];
export type RelationGroups = components["schemas"]["RelationGroups"];
export type CapabilityCell = components["schemas"]["CapabilityCell"];
export type SourceRef = components["schemas"]["SourceRef"];
export type EntityType = components["schemas"]["EntityType"];
export type VerificationStatus = components["schemas"]["VerificationStatus"];
export type Section = components["schemas"]["Section"];
export type Note = components["schemas"]["Note"];
export type NoteList = components["schemas"]["NoteList"];
export type Favorite = components["schemas"]["Favorite"];
export type StudyStateUpdate = components["schemas"]["StudyStateUpdate"];

export type ApiResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      reason: "mock_missing" | "not_found" | "validation" | "unavailable";
      detail?: string;
    };
