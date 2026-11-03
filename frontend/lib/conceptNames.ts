import { isDomainPublished, type PublishedDomain } from "./publishedScope.ts";

export type ConceptRef = {
  title: string;
  hasPage: boolean;
  domain: string | null;
};

export type ConceptRefs = Readonly<Record<string, ConceptRef>>;

export const PENDING_MARK = "pendiente";

export function conceptRefs(
  items: readonly { slug: string; title: string; has_page: boolean; domain?: string | null }[],
): ConceptRefs {
  const refs: Record<string, ConceptRef> = {};
  for (const item of items) {
    const title = item.title.trim();
    if (title.length === 0) {
      continue;
    }
    refs[item.slug] = { title, hasPage: item.has_page, domain: item.domain ?? null };
  }
  return refs;
}

export type ConceptInline =
  | { kind: "link"; label: string; href: string; slug: string }
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
  if (ref.hasPage) {
    if (ref.domain && !isDomainPublished({ slug: ref.domain }, published)) {
      return { kind: "construction", label: ref.title };
    }
    return { kind: "link", label: ref.title, href: `/concepts/${token}/`, slug: token };
  }
  return { kind: "pending", label: ref.title };
}
