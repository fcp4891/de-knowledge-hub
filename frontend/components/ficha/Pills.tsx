"use client";

import { useFichaLinks } from "@/components/availability/FichaLink";
import { anchorAttrs } from "@/lib/anchorAttrs";
import { sectionKind } from "@/lib/sectionNumbering";
import type { Tag } from "@/lib/views";

import "./ficha-blocks.css";
import { withBasePath } from "@/lib/basePath";

/** Píldoras con el estilo de Cómo funciona (ADR-030): tipo en versalitas, rótulo y, si hay ancla, enlace. */
export function Pills({ tags }: { tags: Tag[] }) {
  const { sections } = useFichaLinks();
  if (tags.length === 0) {
    return null;
  }
  return (
    <ul className="ficha-pills">
      {tags.map((tag) => {
        const label = tag.kind === "Código" ? <code>{tag.label}</code> : tag.label;
        const kind = tag.kind ?? sectionKind(tag.section, sections);   // ADR-030 enmienda 5: «§N» visible
        const inner = (
          <>
            {kind ? <b>{kind}</b> : null}
            {label}
          </>
        );
        return (
          <li key={`${tag.kind ?? ""}-${tag.label}`} className={tag.legal ? "is-legal" : undefined}>
            {tag.href ? (
              <a href={withBasePath(tag.href)} {...anchorAttrs(tag.href)}>
                {inner}
              </a>
            ) : (
              inner
            )}
          </li>
        );
      })}
    </ul>
  );
}
