import { InlineText } from "@/components/markdown/InlineText";
import type { ConceptRefs } from "@/lib/conceptNames";
import type { ObligationBasis } from "@/lib/legal";
import type { PipelineChain } from "@/lib/pipeline";

import "./pipeline.css";

function Chip({ value }: { value: string }) {
  return <InlineText inlines={[{ type: "strong", value }]} />;
}

export function PipelineSteps({
  chain,
  obligations = [],
  conceptRefs,
  markCodeStatus = false,
}: {
  chain: PipelineChain;
  obligations?: readonly ObligationBasis[];
  conceptRefs?: ConceptRefs;
  markCodeStatus?: boolean;
}) {
  const many = chain.steps.length >= 6;
  return (
    <div className="pipeline-container">
      {chain.chips.length > 0 ? (
        <p className="pipeline-chips">
          {chain.chips.map((chip) => (
            <Chip key={chip.value} value={chip.value} />
          ))}
        </p>
      ) : null}
      {chain.label ? (
        <p className="pipeline-label">
          <InlineText inlines={chain.label} obligations={obligations} conceptRefs={conceptRefs} markCodeStatus={markCodeStatus} />
        </p>
      ) : null}
      <ol className="pipeline" data-steps={many ? "many" : "few"}>
        {chain.steps.map((step, index) => (
          <li key={index} className="pipeline-item">
            <div className="pipeline-step">
              <span className="step-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="step-name">
                <InlineText inlines={step.name} obligations={obligations} conceptRefs={conceptRefs} markCodeStatus={markCodeStatus} />
              </span>
              {step.note ? <span className="step-note">{step.note}</span> : null}
            </div>
            {index < chain.steps.length - 1 ? (
              <span className="pipeline-arrow" aria-hidden="true">
                <span className="pipeline-arrow-row">›</span>
                <span className="pipeline-arrow-stack">↓</span>
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
