/** Orden de las hijas de la ficha padre. No es un paso del dominio 19. */
export const LEY21719_STUDY_ORDER = [
  "chile-data-protection",
  "pii-identification",
  "processing-activities-inventory",
  "data-minimization-by-layer",
  "chilean-identifier-pseudonymization",
  "purpose-based-authorization",
  "data-subject-rights-pipeline",
  "distributed-erasure-propagation",
  "retention-and-erasure",
  "privacy-backup-and-recovery",
  "data-breach-response",
  "dpia-and-automated-decisions",
  "processors-and-international-transfers",
  "privacy-controls-as-code",
  "privacy-in-ai-rag-llm",
] as const;

export type PartLink = {
  slug: string;
  title: string;
  entityType: string;
};

type PartItem = {
  slug: string;
  title: string;
  entity_type: string;
};

type PartGroup = {
  type: string;
  direction: string;
  items: readonly PartItem[];
};

function toLink(item: PartItem): PartLink {
  return { slug: item.slug, title: item.title, entityType: item.entity_type };
}

/** La ficha padre: PART_OF saliente, a lo sumo una. */
export function partOfParent(groups: readonly PartGroup[]): PartLink | null {
  const group = groups.find((item) => item.type === "PART_OF" && item.direction === "outgoing");
  const parent = group?.items[0];
  return parent ? toLink(parent) : null;
}

/** Las hijas (PART_OF entrante) en el orden de estudio, no por título. */
export function routeChildren(groups: readonly PartGroup[]): PartLink[] {
  const group = groups.find((item) => item.type === "PART_OF" && item.direction === "incoming");
  if (!group) {
    return [];
  }
  const rank = new Map<string, number>(LEY21719_STUDY_ORDER.map((slug, index) => [slug, index]));
  return group.items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const leftRank = rank.get(left.item.slug);
      const rightRank = rank.get(right.item.slug);
      if (leftRank !== undefined && rightRank !== undefined && leftRank !== rightRank) {
        return leftRank - rightRank;
      }
      if (leftRank !== undefined) {
        return -1;
      }
      if (rightRank !== undefined) {
        return 1;
      }
      return left.index - right.index;
    })
    .map((entry) => toLink(entry.item));
}

/** La jerarquía se muestra aparte; no vuelve a salir en la lista de relaciones. */
export function withoutPartOf<T extends { type: string }>(groups: readonly T[]): T[] {
  return groups.filter((group) => group.type !== "PART_OF");
}
