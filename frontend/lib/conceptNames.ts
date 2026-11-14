import { isDomainPublished, type PublishedDomain } from "./publishedScope.ts";

export type ConceptAvailability = "available" | "in_review" | "in_development";

export type ConceptRef = {
  title: string;
  hasPage: boolean;
  domain: string | null;
  availability: ConceptAvailability;
};

export type ConceptRefs = Readonly<Record<string, ConceptRef>>;

export const PENDING_MARK = "pendiente";

export function conceptRefs(
  items: readonly { slug: string; title: string; has_page: boolean; domain?: string | null; availability?: string | null }[],
): ConceptRefs {
  const refs: Record<string, ConceptRef> = {};
  for (const item of items) {
    const title = item.title.trim();
    if (title.length === 0) {
      continue;
    }
    const availability = item.availability === "in_review" || item.availability === "in_development" ? item.availability : "available";
    refs[item.slug] = { title, hasPage: item.has_page, domain: item.domain ?? null, availability };
  }
  return refs;
}

export type ConceptInline =
  | { kind: "link"; label: string; href: string; slug: string }
  | { kind: "unavailable"; label: string; slug: string; status: "in_review" | "in_development" }
  | { kind: "pending"; label: string }
  | { kind: "construction"; label: string }
  | { kind: "code" };

/** El token entero de un `código` inline: nombre de ficha, nombre pendiente, ficha fuera de alcance, o código real. */
export function conceptInline(
  token: string,
  refs: ConceptRefs | undefined,
  published: readonly PublishedDomain[] | undefined = undefined,
): ConceptInline {
  const ref = refs?.[token];
  if (!ref) {
    return { kind: "code" };
  }
  if (ref.availability === "in_review" || ref.availability === "in_development") {
    return { kind: "unavailable", label: ref.title, slug: token, status: ref.availability };
  }
  if (ref.hasPage) {
    if (ref.domain && !isDomainPublished({ slug: ref.domain }, published)) {
      return { kind: "construction", label: ref.title };
    }
    return { kind: "link", label: ref.title, href: `/concepts/${token}/`, slug: token };
  }
  return { kind: "pending", label: ref.title };
}
