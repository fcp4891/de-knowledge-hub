import type { Inline } from "@/lib/markdown";

export function InlineText({ inlines }: { inlines: Inline[] }) {
  return inlines.map((part, index) => {
    const key = `${part.type}-${index}`;
    if (part.type === "code") {
      return <code key={key}>{part.value}</code>;
    }
    if (part.type === "strong") {
      return <strong key={key}>{part.value}</strong>;
    }
    if (part.type === "em") {
      return <em key={key}>{part.value}</em>;
    }
    if (part.type === "link") {
      return (
        <a key={key} href={part.href}>
          {part.value}
        </a>
      );
    }
    return <span key={key}>{part.value}</span>;
  });
}
