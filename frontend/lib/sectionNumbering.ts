/**
 * ADR-029 y ADR-030 (enmienda 5): numeración y títulos de sección por contrato.
 * Una ficha con `views.section_titles` numera sus secciones visibles de 1 a M (sin anexos) y muestra esos títulos;
 * «[§](#sN)» y las píldoras con `section` usan el número visible, no el de la plantilla.
 */
export type SectionTitle = { section: number; title: string; ref?: string };
export type NumberedSectionTitle = SectionTitle & { visible?: number };

type Numbered = { number: number; title: string; annex?: boolean };

export function usesCompactNumbering(titles: readonly SectionTitle[] | null | undefined): boolean {
  return (titles?.length ?? 0) > 0;
}

/** Reemplaza el título de cada sección que tiene entrada en section_titles; las demás quedan igual. */
export function withSectionTitles<T extends Numbered>(models: T[], titles: readonly SectionTitle[] | null | undefined): T[] {
  const byNumber = new Map((titles ?? []).map((item) => [item.section, item.title]));
  return models.map((model) => {
    const title = model.annex ? undefined : byNumber.get(model.number);
    return title ? { ...model, title } : model;
  });
}

/** Número visible (1 a M) de cada sección presente, en orden, igual que ConceptReading. */
export function visibleNumbers(models: readonly Numbered[]): Map<number, number> {
  const present = models
    .filter((model) => !model.annex)
    .map((model) => model.number)
    .sort((left, right) => left - right);
  return new Map(present.map((number, index) => [number, index + 1]));
}

export function numberedTitles(
  titles: readonly SectionTitle[] | null | undefined,
  visible: ReadonlyMap<number, number>,
): NumberedSectionTitle[] {
  return (titles ?? []).map((item) => ({ ...item, visible: visible.get(item.section) }));
}

/** «§<número visible> · <ref o título>» para «[§](#sN)»; null si no es una referencia a sección. */
export function sectionRefLabel(href: string, label: string, sections: readonly NumberedSectionTitle[]): string | null {
  if (label !== "§") {
    return null;
  }
  const match = /^#s(\d+)$/.exec(href);
  const section = match ? sections.find((item) => item.section === Number(match[1])) : undefined;
  if (!section) {
    return null;
  }
  return `§${section.visible ?? section.section} · ${section.ref ?? section.title}`;
}

/** «§<número visible>» para una píldora con `section`. */
export function sectionKind(section: number | undefined, sections: readonly NumberedSectionTitle[]): string | undefined {
  if (section === undefined) {
    return undefined;
  }
  const found = sections.find((item) => item.section === section);
  return `§${found?.visible ?? section}`;
}
