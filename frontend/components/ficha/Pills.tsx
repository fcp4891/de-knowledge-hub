import type { Tag } from "@/lib/views";

import "./ficha-blocks.css";

/** Píldoras con el estilo de Cómo funciona (ADR-030): tipo en versalitas, rótulo y, si hay ancla, enlace. */
export function Pills({ tags }: { tags: Tag[] }) {
  if (tags.length === 0) {
    return null;
  }
  return (
    <ul className="ficha-pills">
      {tags.map((tag) => {
        const label = tag.kind === "Código" ? <code>{tag.label}</code> : tag.label;
        const inner = (
          <>
            {tag.kind ? <b>{tag.kind}</b> : null}
            {label}
          </>
        );
        return (
          <li key={`${tag.kind ?? ""}-${tag.label}`} className={tag.legal ? "is-legal" : undefined}>
            {tag.href ? <a href={tag.href}>{inner}</a> : inner}
          </li>
        );
      })}
    </ul>
  );
}
