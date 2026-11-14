import { getConcept } from "@/lib/api/client";
import type { ConceptRefs } from "@/lib/conceptNames";

export type UnavailableStatus = "in_review" | "in_development";

export type AvailabilityCopy = { label: string; help: string };

export type AvailabilityCopyMap = Partial<Record<UnavailableStatus, AvailabilityCopy>>;

export type FichaLinkState = { slug: string; status: UnavailableStatus; label: string };

type UnavailableEntry = { slug: string; target_availability: UnavailableStatus; label: string };

/** La ficha entra en los contadores. Una página mínima (en revisión o en desarrollo) no. */
export function countsAsFicha(concept: { has_page?: boolean; availability?: string | null }): boolean {
  return concept.availability !== "in_review" && concept.availability !== "in_development";
}

export function availabilityCopyFrom(
  details: readonly { availability?: string | null; availability_text?: { label: string; help: string } | null }[],
): AvailabilityCopyMap {
  const copy: AvailabilityCopyMap = {};
  for (const detail of details) {
    const status = detail.availability;
    if ((status === "in_review" || status === "in_development") && detail.availability_text && !copy[status]) {
      copy[status] = { label: detail.availability_text.label, help: detail.availability_text.help };
    }
  }
  return copy;
}

/** Etiqueta y ayuda de cada estado, leídas de una ficha que ya las trae. */
export async function loadAvailabilityCopy(refs: ConceptRefs): Promise<AvailabilityCopyMap> {
  const copy: AvailabilityCopyMap = {};
  await Promise.all(
    (["in_review", "in_development"] as const).map(async (status) => {
      const slug = Object.entries(refs).find(([, ref]) => ref.availability === status)?.[0];
      if (!slug) {
        return;
      }
      const detail = await getConcept(slug);
      if (detail.ok && detail.data.availability_text) {
        copy[status] = { label: detail.data.availability_text.label, help: detail.data.availability_text.help };
      }
    }),
  );
  return copy;
}

/** Slug → etiqueta. Primero los enlaces de la ficha abierta; el resto, el mismo texto del estado. */
export function fichaLinkStates(refs: ConceptRefs, unavailable: readonly UnavailableEntry[], copy: AvailabilityCopyMap): FichaLinkState[] {
  const byStatus: AvailabilityCopyMap = { ...copy };
  for (const item of unavailable) {
    byStatus[item.target_availability] = { label: item.label, help: byStatus[item.target_availability]?.help ?? "" };
  }
  const states = new Map<string, FichaLinkState>();
  for (const item of unavailable) {
    states.set(item.slug, { slug: item.slug, status: item.target_availability, label: item.label });
  }
  for (const [slug, ref] of Object.entries(refs)) {
    if (states.has(slug) || ref.availability === "available") {
      continue;
    }
    const label = byStatus[ref.availability]?.label;
    if (label) {
      states.set(slug, { slug, status: ref.availability, label });
    }
  }
  return [...states.values()];
}
