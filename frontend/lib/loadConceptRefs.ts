import { listAllConcepts } from "@/lib/api/client";

import { conceptRefs, type ConceptRefs } from "@/lib/conceptNames";

export async function loadConceptRefs(): Promise<ConceptRefs> {
  const page = await listAllConcepts();
  if (!page.ok) {
    return {};
  }
  return conceptRefs(page.data);
}
