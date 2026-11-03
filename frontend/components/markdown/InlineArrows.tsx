import { InlineText } from "@/components/markdown/InlineText";
import type { ConceptRefs } from "@/lib/conceptNames";
import { readInlineArrows, type ArrowRun } from "@/lib/inlineArrows";
import type { ObligationBasis } from "@/lib/legal";
import type { Inline } from "@/lib/markdown";

import "./pipeline.css";

const GLYPH = {
  "→": "›",
  "←": "‹",
  "↔": "‹›",
} as const;

function ArrowRuns({
  runs,
  obligations,
  conceptRefs,
  markCodeStatus,
}: {
  runs: ArrowRun[];
  obligations: readonly ObligationBasis[];
  conceptRefs?: ConceptRefs;
  markCodeStatus: boolean;
}) {
  return runs.map((run, index) => {
    if (run.kind === "space") {
      return (
        <span key={index} className="flow-space">
          {run.value}
        </span>
      );
    }
    if (run.kind === "arrow") {
      return (
        <span key={index} className="flow-arrow">
          <span className="flow-arrow-glyph" aria-hidden="true">
            {GLYPH[run.value]}
          </span>
          <span className="flow-arrow-source">{run.value}</span>
        </span>
      );
    }
    const body = (
      <InlineText inlines={run.inlines} obligations={obligations} conceptRefs={conceptRefs} markCodeStatus={markCodeStatus} />
    );
    if (run.kind === "pill") {
      return (
        <span key={index} className="flow-pill">
          {body}
        </span>
      );
    }
    return <span key={index}>{body}</span>;
  });
}

export function ArrowInlines({
  inlines,
  obligations = [],
  conceptRefs,
  markCodeStatus = false,
  styleArrows = true,
  paragraph = false,
}: {
  inlines: Inline[];
  obligations?: readonly ObligationBasis[];
  conceptRefs?: ConceptRefs;
  markCodeStatus?: boolean;
  styleArrows?: boolean;
  paragraph?: boolean;
}) {
  const runs = styleArrows ? readInlineArrows(inlines) : null;
  const body = runs ? (
    <ArrowRuns runs={runs} obligations={obligations} conceptRefs={conceptRefs} markCodeStatus={markCodeStatus} />
  ) : (
    <InlineText inlines={inlines} obligations={obligations} conceptRefs={conceptRefs} markCodeStatus={markCodeStatus} />
  );
  return paragraph ? <p>{body}</p> : body;
}
