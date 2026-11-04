import { PRIVACY_DOMAIN_ID, PRIVACY_SPACE_HREF } from "./privacySpace.ts";

/** Alcance publicado. Para encender otra capa, agrégala aquí. */
export type PublishedDomain = { id: string; slug: string };

export const PUBLISHED_DOMAINS: readonly PublishedDomain[] = [
  { id: "24", slug: "privacy-engineering" },
];

export const PUBLISHED_GOALS: readonly string[] = ["ley21719"];

/** false oculta lo no publicado. true vuelve al modo atenuado. */
export const SHOW_UNPUBLISHED = false;

export const BAND_LABEL = "Protección de datos personales";

export const CONSTRUCTION_LAYER = "En construcción · la estamos escribiendo ficha a ficha";
export const CONSTRUCTION_MARK = "en construcción";
export const CONSTRUCTION_BADGE = "En construcción";
export const CONSTRUCTION_BANNER = "Esta sección está en construcción";
export const SNIPPETS_EMPTY = "Los snippets de esta etapa están en construcción";

export function isDomainPublished(
  domain: { id?: string | null; slug?: string | null },
  published: readonly PublishedDomain[] = PUBLISHED_DOMAINS,
): boolean {
  return published.some(
    (item) =>
      (domain.id != null && domain.id === item.id) || (domain.slug != null && domain.slug === item.slug),
  );
}

export function isGoalPublished(key: string, goals: readonly string[] = PUBLISHED_GOALS): boolean {
  return goals.includes(key);
}

export function visibleGoals<T extends { key: string }>(
  goals: readonly T[],
  showUnpublished: boolean = SHOW_UNPUBLISHED,
): T[] {
  return showUnpublished ? [...goals] : goals.filter((goal) => isGoalPublished(goal.key));
}

export function visibleLayers<T extends { domains: readonly string[] }>(
  layers: readonly T[],
  showUnpublished: boolean = SHOW_UNPUBLISHED,
  published: readonly PublishedDomain[] = PUBLISHED_DOMAINS,
): T[] {
  return showUnpublished ? [...layers] : layers.filter((layer) => !layerIsClosed(layer.domains, published));
}

/** La banda visual está apagada cuando ninguno de sus dominios está publicado. */
export function layerIsClosed(
  domainIds: readonly string[],
  published: readonly PublishedDomain[] = PUBLISHED_DOMAINS,
): boolean {
  return domainIds.every((id) => !isDomainPublished({ id }, published));
}

export function explorerHref(
  domain: { id: string; slug: string } | null,
  published: readonly PublishedDomain[] = PUBLISHED_DOMAINS,
): string | null {
  if (!domain || !isDomainPublished(domain, published)) {
    return null;
  }
  return `/explorer/${domain.slug}`;
}

/** El círculo y el título del paso usan el mismo destino. */
export function stepHref(
  step: { domain: string; stage?: string },
  domainSlug: string | null,
  published: readonly PublishedDomain[] = PUBLISHED_DOMAINS,
): string | null {
  if (!isDomainPublished({ id: step.domain, slug: domainSlug }, published)) {
    return null;
  }
  if (step.stage) {
    return step.domain === PRIVACY_DOMAIN_ID ? `${PRIVACY_SPACE_HREF}#${step.stage}` : null;
  }
  return domainSlug ? `/explorer/${domainSlug}` : null;
}

/** «Requiere» se muestra como texto: puede nombrar capas que están apagadas. */
export function requirementPlainText(requires: string): string {
  return requires;
}

export function inPublishedSearch(
  domain: string | null,
  published: readonly PublishedDomain[] = PUBLISHED_DOMAINS,
): boolean {
  return domain != null && isDomainPublished({ slug: domain }, published);
}

export function scopeFromConcepts(
  concepts: readonly { slug: string; domain: string }[],
  published: readonly PublishedDomain[] = PUBLISHED_DOMAINS,
): Set<string> {
  return new Set(
    concepts.filter((concept) => isDomainPublished({ slug: concept.domain }, published)).map((concept) => concept.slug),
  );
}

export function snippetListed(implemented: readonly string[], scope: ReadonlySet<string>): boolean {
  return implemented.some((slug) => scope.has(slug));
}

export function relationVisible(
  item: { slug: string; entity_type: string },
  scope: ReadonlySet<string>,
): boolean {
  if (item.entity_type === "code_snippet" || item.entity_type === "source") {
    return true;
  }
  if (item.entity_type === "concept" || item.entity_type === "pattern" || item.entity_type === "architecture") {
    return scope.has(item.slug);
  }
  return false;
}
