import {
  claimKind,
  claimLabel,
  legalRowId,
  matchingObligation,
  obligationCite,
  obligationNote,
  type ObligationBasis,
} from "@/lib/legal";
import { conceptInline, PENDING_MARK, type ConceptRefs } from "@/lib/conceptNames";
import type { Inline } from "@/lib/markdown";

export function ArchitectureDot({ labelled = true }: { labelled?: boolean }) {
  if (!labelled) {
    return (
      <span className="claim-arq" aria-hidden="true">
        [arq]
      </span>
    );
  }
  return (
    <span className="claim-arq" title="Decisión de arquitectura">
      [arq]
    </span>
  );
}

function ObligationCiteMark({
  value,
  obligations,
  variant,
}: {
  value: string;
  obligations: readonly ObligationBasis[];
  variant: "sup" | "chip";
}) {
  const cite = obligationCite(value);
  const label = claimLabel(value);
  if (!cite) {
    return (
      <span className="claim claim-obligation">
        <span className="claim-mark" aria-hidden="true">
          §
        </span>
        {label}
      </span>
    );
  }
  const note = obligationNote(obligations, cite.law, cite.article);
  const href = matchingObligation(obligations, cite.law, cite.article)
    ? `#${legalRowId(cite.law, cite.article)}`
    : null;
  if (variant === "chip") {
    return (
      <span className="claim claim-obligation claim-in-cell">
        {href ? (
          <a href={href} title={note ?? undefined}>
            {label}
          </a>
        ) : (
          <span title={note ?? undefined}>{label}</span>
        )}
      </span>
    );
  }
  const text = cite.text;
  if (!href) {
    return (
      <sup className="claim-art">
        <span title={note ?? undefined}>{text}</span>
      </sup>
    );
  }
  return (
    <sup className="claim-art">
      <a href={href} title={note ?? undefined}>
        {text}
      </a>
    </sup>
  );
}

export function InlineText({
  inlines,
  obligations = [],
  conceptRefs,
  citeVariant = "sup",
}: {
  inlines: Inline[];
  obligations?: readonly ObligationBasis[];
  conceptRefs?: ConceptRefs;
  citeVariant?: "sup" | "chip";
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
        return <ObligationCiteMark key={key} value={part.value} obligations={obligations} variant={citeVariant} />;
      }
    }
    const value = trimLeading && part.type === "text" ? part.value.replace(/^\s+/, "") : part.value;
    trimLeading = false;
    if (value.length === 0 && part.type === "text") {
      return null;
    }
    if (part.type === "code") {
      const named = conceptInline(value, conceptRefs);
      if (named.kind === "link") {
        return (
          <a key={key} className="ficha-name" href={named.href} title={named.slug}>
            {named.label}
          </a>
        );
      }
      if (named.kind === "pending") {
        return (
          <span key={key} className="ficha-pending">
            {named.label}
            <span className="ficha-pending-mark">{PENDING_MARK}</span>
          </span>
        );
      }
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
