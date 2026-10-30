import type { Cloud, Language, Level, ResultType, StudyStatus, VerificationStatus } from "./api/types";

export const LEVEL_LABEL: Record<Level, string> = {
  basic: "básico",
  intermediate: "intermedio",
  advanced: "avanzado",
};

export const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  verified: "verificado",
  review_required: "revisión pendiente",
  potentially_outdated: "posiblemente desactualizado",
  deprecated: "obsoleto",
  archived: "archivado",
};

export const RELATION_LABEL: Record<string, string> = {
  implemented_by: "Implementado por",
  related_to: "Relacionado con",
  hosts: "Aloja",
  alternative_to: "Alternativa a",
  runs_on: "Se ejecuta en",
};

/** Un slug de ficha: kebab-case, sin espacios ni mayúsculas. */
function isSlugAlias(alias: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(alias);
}

export function alsoKnownLabel(aliases: readonly string[]): string | null {
  const visible = aliases.filter((alias) => !isSlugAlias(alias));
  if (visible.length === 0) {
    return null;
  }
  return `También conocido como: ${visible.join(", ")}`;
}

export const RESULT_LABEL: Record<ResultType, string> = {
  concept: "Conceptos",
  pattern: "Patrones",
  architecture: "Arquitecturas",
  technology: "Tecnologías",
  cloud_service: "Servicios cloud",
  code_snippet: "Snippets",
  source: "Fuentes",
};

export const LANGUAGE_LABEL: Record<Language, string> = {
  sql: "SQL",
  python: "Python",
  terraform: "Terraform",
  yaml: "YAML",
  bash: "Bash",
  json: "JSON",
  other: "Otro",
};

export const CLOUD_LABEL: Record<Cloud, string> = {
  gcp: "GCP",
  aws: "AWS",
  azure: "Azure",
  agnostic: "agnóstico",
};

export const STUDY_LABEL: Record<StudyStatus, string> = {
  not_reviewed: "No revisado",
  reviewing: "Revisando",
  understood: "Comprendido",
  applied: "Aplicado",
  needs_review: "Necesita repaso",
};
