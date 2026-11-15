"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { conceptSlugFromHref } from "@/lib/anchorAttrs";

import { AvailabilityMark, type UnavailableStatus } from "./AvailabilityMark";

export type FichaLinkState = { slug: string; status: UnavailableStatus; label: string };

import type { NumberedSectionTitle } from "@/lib/sectionNumbering";
import { withBasePath } from "@/lib/basePath";

export type SectionTitle = NumberedSectionTitle;

type FichaLinksValue = {
  links: ReadonlyMap<string, FichaLinkState>;
  sections: readonly SectionTitle[];
};

const FichaLinksContext = createContext<FichaLinksValue>({ links: new Map(), sections: [] });

export function FichaLinksProvider({
  links,
  sections,
  children,
}: {
  links: readonly FichaLinkState[];
  sections: readonly SectionTitle[];
  children: ReactNode;
}) {
  const value = useMemo<FichaLinksValue>(
    () => ({
      links: new Map(links.map((link) => [link.slug, link])),
      sections,
    }),
    [links, sections],
  );
  return <FichaLinksContext.Provider value={value}>{children}</FichaLinksContext.Provider>;
}

export function useFichaLinks(): FichaLinksValue {
  return useContext(FichaLinksContext);
}

export function useFichaLink(href: string): FichaLinkState | null {
  const slug = conceptSlugFromHref(href);
  const { links } = useFichaLinks();
  if (!slug) {
    return null;
  }
  return links.get(slug) ?? null;
}

/** Enlace a una ficha. Si no está disponible, queda el texto y la etiqueta, sin navegar. */
export function FichaAnchor({
  href,
  className,
  children,
  blocked = false,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  blocked?: boolean;
}) {
  const unavailable = useFichaLink(href);
  if (unavailable) {
    return (
      <span className={className ? `ficha-unavailable ${className}` : "ficha-unavailable"}>
        {children}
        <AvailabilityMark compact status={unavailable.status} label={unavailable.label} />
      </span>
    );
  }
  if (blocked) {
    return <span className={className}>{children}</span>;
  }
  return (
    <a className={className} href={withBasePath(href)}>
      {children}
    </a>
  );
}
