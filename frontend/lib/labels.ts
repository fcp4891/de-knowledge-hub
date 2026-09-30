import type { Level, ResultType, StudyStatus, VerificationStatus } from "./api/types";

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

export const RESULT_LABEL: Record<ResultType, string> = {
  concept: "Conceptos",
  pattern: "Patrones",
  architecture: "Arquitecturas",
  technology: "Tecnologías",
  cloud_service: "Servicios cloud",
  source: "Fuentes",
};

export const STUDY_LABEL: Record<StudyStatus, string> = {
  not_reviewed: "No revisado",
  reviewing: "Revisando",
  understood: "Comprendido",
  applied: "Aplicado",
  needs_review: "Necesita repaso",
};
