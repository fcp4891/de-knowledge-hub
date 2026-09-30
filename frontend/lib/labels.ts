import type { Level, StudyStatus } from "./api/types";

export const LEVEL_LABEL: Record<Level, string> = {
  basic: "básico",
  intermediate: "intermedio",
  advanced: "avanzado",
};

export const STUDY_LABEL: Record<StudyStatus, string> = {
  not_reviewed: "No revisado",
  reviewing: "Revisando",
  understood: "Comprendido",
  applied: "Aplicado",
  needs_review: "Necesita repaso",
};
