import { GOALS } from "@/lib/learning-paths";
import { nextDistinctDomain } from "@/lib/privacySpace";
import type { Level, StudyStatus } from "@/lib/api/types";

const LEVEL_RANK: Record<Level, number> = {
  basic: 0,
  intermediate: 1,
  advanced: 2,
};

export function isMastered(state: StudyStatus): boolean {
  return state === "understood" || state === "applied";
}

/** De básico a avanzado. Dentro del mismo nivel, se conserva el orden del blueprint. */
export function orderByLevel<T extends { level: Level; blueprintIndex: number }>(concepts: T[]): T[] {
  return [...concepts].sort((left, right) => {
    const byLevel = LEVEL_RANK[left.level] - LEVEL_RANK[right.level];
    if (byLevel !== 0) {
      return byLevel;
    }
    return left.blueprintIndex - right.blueprintIndex;
  });
}

export type RouteCandidate = {
  slug: string;
  hasPage: boolean;
  level: Level;
  blueprintIndex: number;
};

/** Primer concepto con ficha que no está comprendido ni aplicado. `null` si no hay ninguno. */
export function nextRecommended<T extends RouteCandidate>(stages: { concepts: T[] }[], study: (slug: string) => StudyStatus): T | null {
  for (const stage of stages) {
    for (const concept of orderByLevel(stage.concepts)) {
      if (!concept.hasPage) {
        continue;
      }
      if (!isMastered(study(concept.slug))) {
        return concept;
      }
    }
  }
  return null;
}

/** Concepto con ficha que sigue al actual en el orden de la ruta (etapas del blueprint, de básico a avanzado). */
export function nextInRoute<T extends RouteCandidate & { title: string }>(
  stages: { concepts: T[] }[],
  currentSlug: string,
): T | null {
  const ordered = stages.flatMap((stage) => orderByLevel(stage.concepts));
  const index = ordered.findIndex((concept) => concept.slug === currentSlug);
  if (index < 0) {
    return null;
  }
  for (const concept of ordered.slice(index + 1)) {
    if (concept.hasPage) {
      return concept;
    }
  }
  return null;
}

export function domainIsComplete<T extends RouteCandidate>(stages: { concepts: T[] }[], study: (slug: string) => StudyStatus): boolean {
  const withPage = stages.flatMap((stage) => stage.concepts).filter((concept) => concept.hasPage);
  return withPage.length > 0 && withPage.every((concept) => isMastered(study(concept.slug)));
}

/** Siguiente código de dominio del objetivo activo, después del dominio actual. */
export function nextGoalDomain(goalKey: string | null, currentDomainId: string): string | null {
  if (!goalKey) {
    return null;
  }
  const goal = GOALS.find((item) => item.key === goalKey);
  if (!goal) {
    return null;
  }
  return nextDistinctDomain(goal.steps, currentDomainId);
}
