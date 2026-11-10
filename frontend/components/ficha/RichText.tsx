import { richParts } from "@/lib/views";

/** Texto de una vista con Markdown en línea (ADR-030): enlaces externos, negrita, cursiva y código. */
export function RichText({ text }: { text: string }) {
  return richParts(text).map((part, index) => {
    if (part.type === "link") {
      return (
        <a key={index} href={part.href} target="_blank" rel="noopener noreferrer">
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

/** Línea de cita de una vista: título enlazado y detalle. */
export function CiteList({ className, sources }: { className: string; sources: { title: string; href: string; detail: string }[] }) {
  if (sources.length === 0) {
    return null;
  }
  return (
    <ul className={className}>
      {sources.map((source) => (
        <li key={source.href + source.title}>
          <a href={source.href} target="_blank" rel="noopener noreferrer">
            {source.title}
          </a>
          <span> · {source.detail}</span>
        </li>
      ))}
    </ul>
  );
}
