import {
  claimKind,
  claimLabel,
  legalRowId,
  matchingObligation,
  obligationCite,
  obligationNote,
  type ObligationBasis,
} from "@/lib/legal";
import type { Inline } from "@/lib/markdown";

export function ArchitectureDot({ labelled = true }: { labelled?: boolean }) {
  if (!labelled) {
    return (
      <span className="claim-dot" aria-hidden="true">
        ●
      </span>
    );
  }
  return (
    <span className="claim-dot" role="img" title="Decisión de arquitectura" aria-label="Decisión de arquitectura">
      ●
    </span>
  );
}

function ObligationCiteMark({ value, obligations }: { value: string; obligations: readonly ObligationBasis[] }) {
  const cite = obligationCite(value);
  if (!cite) {
    return (
      <span className="claim claim-obligation">
        <span className="claim-mark" aria-hidden="true">
          §
        </span>
        {claimLabel(value)}
      </span>
    );
  }
  const note = obligationNote(obligations, cite.law, cite.article);
  const text = cite.text;
  if (!matchingObligation(obligations, cite.law, cite.article)) {
    return (
      <sup className="claim-art">
        <span title={note ?? undefined}>{text}</span>
      </sup>
    );
  }
  return (
    <sup className="claim-art">
      <a href={`#${legalRowId(cite.law, cite.article)}`} title={note ?? undefined}>
        {text}
      </a>
    </sup>
  );
}

export function InlineText({
  inlines,
  obligations = [],
}: {
  inlines: Inline[];
  obligations?: readonly ObligationBasis[];
}) {
  let trimLeading = false;
  return inlines.map((part, index) => {
    const key = `${part.type}-${index}`;
    if (part.type === "strong") {
      const kind = claimKind(part.value);
      if (kind === "practice") {
        trimLeading = true;
        return null;
      }
      if (kind === "architecture") {
        trimLeading = true;
        return <ArchitectureDot key={key} />;
      }
      if (kind === "obligation") {
        trimLeading = false;
        return <ObligationCiteMark key={key} value={part.value} obligations={obligations} />;
      }
    }
    const value = trimLeading && part.type === "text" ? part.value.replace(/^\s+/, "") : part.value;
    trimLeading = false;
    if (value.length === 0 && part.type === "text") {
      return null;
    }
    if (part.type === "code") {
      return <code key={key}>{value}</code>;
    }
    if (part.type === "strong") {
      return <strong key={key}>{value}</strong>;
    }
    if (part.type === "em") {
      return <em key={key}>{value}</em>;
    }
    if (part.type === "del") {
      return <del key={key}>{value}</del>;
    }
    if (part.type === "link") {
      return (
        <a key={key} href={part.href}>
          {value}
        </a>
      );
    }
    return <span key={key}>{value}</span>;
  });
}
