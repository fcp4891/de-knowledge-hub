import { ArchitectureDot } from "@/components/markdown/InlineText";
import type { Views } from "@/lib/views";

import { RichText } from "./RichText";
import "./pii-views.css";

type Steps = NonNullable<Views["evidence_steps"]>;

export function EvidenceSteps({ view }: { view: Steps }) {
  return (
    <section className="pii-view">
      <div className="pii-steps">
        {view.steps.map((step) => (
          <article key={step.number} className="pii-step" id={step.id}>
            <header>
              <small>{step.number}</small>
              <strong>
                {step.title}
                {step.arq ? <ArchitectureDot labelled={false} /> : null}
              </strong>
              <span>
                <RichText text={step.text} />
              </span>
            </header>
            <p className="pii-evidence">
              <i>{view.evidence_label}</i>
              <RichText text={step.evidence} />
            </p>
          </article>
        ))}
      </div>
      {view.flow.length === 2 ? (
        <div className="pii-flow">
          <div className="pii-flow-box">
            <strong>{view.flow[0].title}</strong>
            <span>
              <RichText text={view.flow[0].text} />
            </span>
          </div>
          <span className="pii-flow-arrow" aria-hidden="true">
            →
          </span>
          <div className="pii-flow-box">
            <strong>{view.flow[1].title}</strong>
            <span>
              <RichText text={view.flow[1].text} />
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
