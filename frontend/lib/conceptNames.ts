export type ConceptRef = {
  title: string;
  hasPage: boolean;
};

export type ConceptRefs = Readonly<Record<string, ConceptRef>>;

export const PENDING_MARK = "pendiente";

export function conceptRefs(
  items: readonly { slug: string; title: string; has_page: boolean }[],
): ConceptRefs {
  const refs: Record<string, ConceptRef> = {};
  for (const item of items) {
    const title = item.title.trim();
    if (title.length === 0) {
      continue;
    }
    refs[item.slug] = { title, hasPage: item.has_page };
  }
  return refs;
}

export type ConceptInline =
  | { kind: "link"; label: string; href: string; slug: string }
  | { kind: "pending"; label: string }
  | { kind: "code" };

/** El token entero de un `código` inline: nombre de ficha, nombre pendiente, o código real. */
export function conceptInline(token: string, refs: ConceptRefs | undefined): ConceptInline {
  const ref = refs?.[token];
  if (!ref) {
    return { kind: "code" };
  }
  if (ref.hasPage) {
    return { kind: "link", label: ref.title, href: `/concepts/${token}/`, slug: token };
  }
  return { kind: "pending", label: ref.title };
}
