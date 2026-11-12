/**
 * ADR-031 (enmienda 1): disponibilidad por tramo del itinerario, calculada con los datos.
 * Un tramo está deshabilitado si ninguna de sus fichas tiene availability = available.
 * Los textos («{n} disponibles», «{n} en revisión», «{n} de {total} fichas disponibles») vienen de
 * content/ui/availability.yaml a través de DomainDetail.availability_texts.
 */
import type { UnavailableStatus } from "@/components/availability/AvailabilityMark";

export type StageAvailability = { available: number; inReview: number; inDevelopment: number; total: number };

export type AvailabilityTexts = {
  in_review: { label: string; help: string; count: string };
  in_development: { label: string; help: string; count: string };
  available: { count: string };
  route_count: string;
  back_label: string;
};

export function stageAvailability(concepts: readonly { availability?: string | null }[]): StageAvailability {
  const count = (status: string) => concepts.filter((concept) => (concept.availability ?? "available") === status).length;
  return {
    available: count("available"),
    inReview: count("in_review"),
    inDevelopment: count("in_development"),
    total: concepts.length,
  };
}

export function stageDisabled(stage: StageAvailability | undefined): boolean {
  return stage !== undefined && stage.available === 0;
}

/** Estado que muestra un tramo deshabilitado: «En revisión» si todas sus fichas lo están; si no, «En desarrollo». */
export function disabledStatus(stage: StageAvailability): UnavailableStatus {
  return stage.inReview > 0 && stage.inDevelopment === 0 ? "in_review" : "in_development";
}

export function fillCount(template: string, values: { n: number; total?: number }): string {
  return template.replace("{n}", String(values.n)).replace("{total}", String(values.total ?? ""));
}

export function routeTotals(stages: readonly (StageAvailability | undefined)[]): { available: number; total: number } {
  return stages.reduce(
    (sum, stage) => ({ available: sum.available + (stage?.available ?? 0), total: sum.total + (stage?.total ?? 0) }),
    { available: 0, total: 0 },
  );
}
