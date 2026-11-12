"use client";

import { anchorAttrs, conceptSlugFromHref } from "@/lib/anchorAttrs";
import { richParts } from "@/lib/views";

import { AvailabilityMark } from "@/components/availability/AvailabilityMark";
import { useFichaLinks } from "@/components/availability/FichaLink";

/** Texto de una vista con Markdown en línea (ADR-030): enlaces, negrita, cursiva y código. */
export function RichText({ text }: { text: string }) {
  const { links, sections } = useFichaLinks();
  return richParts(text).map((part, index) => {
    if (part.type === "link") {
      const slug = conceptSlugFromHref(part.href);
      const unavailable = slug ? links.get(slug) : undefined;
      if (unavailable) {
        return (
          <span key={index} className="ficha-unavailable-link">
            {part.value}
            <AvailabilityMark compact status={unavailable.status} label={unavailable.label} />
          </span>
        );
      }
      const pill = sectionPill(part.href, part.value, sections);
      if (pill) {
        return (
          <a key={index} className="section-pill" href={part.href}>
            {pill}
          </a>
        );
      }
      const attrs = anchorAttrs(part.href);
      return (
        <a key={index} href={part.href} {...attrs}>
          {part.value}
        </a>
      );
    }
    if (part.type === "strong") return <strong key={index}>{part.value}</strong>;
    if (part.type === "em") return <em key={index}>{part.value}</em>;
    if (part.type === "code") return <code key={index}>{part.value}</code>;
    return <span key={index}>{part.value}</span>;
  });
}

function sectionPill(href: string, label: string, sections: readonly { section: number; title: string; ref?: string }[]): string | null {
  if (label !== "§") {
    return null;
  }
  const match = /^#s(\d+)$/.exec(href);
  if (!match) {
    return null;
  }
  const section = sections.find((item) => item.section === Number(match[1]));
  if (!section) {
    return null;
  }
  return `§${section.section} · ${section.ref ?? section.title}`;
}

/** Línea de cita de una vista: el título enlaza y el detalle queda en la línea de abajo. */
export function CiteList({ className, sources }: { className: string; sources: { title: string; href: string; detail: string }[] }) {
  if (sources.length === 0) {
    return null;
  }
  return (
    <ul className={`cite-list ${className}`}>
      {sources.map((source) => (
        <li key={source.href + source.title}>
          <a href={source.href} {...anchorAttrs(source.href)}>
            {source.title}
          </a>
          <p>{source.detail}</p>
        </li>
      ))}
    </ul>
  );
}
