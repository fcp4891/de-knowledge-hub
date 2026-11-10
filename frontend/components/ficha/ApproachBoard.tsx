import type { ApproachProps } from "@/lib/views";

import { CiteList } from "./RichText";
import "./ficha-blocks.css";

export function ApproachBoard({ title, intro, stepLabel, exampleLabel, referenceLabel, steps, notes, sources }: ApproachProps) {
  return (
    <section className="approach-board" aria-label={title}>
      <div className="markdown">
        <h3>{title}</h3>
        <p>{intro}</p>
      </div>
      <div className="approach-scroll">
        <div className="approach-grid">
          <p className="approach-label">{stepLabel}</p>
          {steps.map((step, index) => (
            <p key={step.name} className="approach-step">
              <span className="approach-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="approach-step-title">{step.name}</span>
              <small>{step.description}</small>
            </p>
          ))}
          {exampleLabel ? (
            <>
              <p className="approach-label">
                {exampleLabel.title}
                {exampleLabel.detail ? <small>{exampleLabel.detail}</small> : null}
              </p>
              {steps.map((step) => (
                <p key={`${step.name}-example`} className="approach-example">
                  {step.example}
                </p>
              ))}
            </>
          ) : null}
          {referenceLabel ? (
            <>
              <p className="approach-label">
                {referenceLabel.title}
                {referenceLabel.detail ? <small>{referenceLabel.detail}</small> : null}
              </p>
              {steps.map((step) => (
                <p key={`${step.name}-ref`} className="approach-ref">
                  {step.reference}
                </p>
              ))}
            </>
          ) : null}
        </div>
      </div>
      {notes.length > 0 ? (
        <div className="approach-points">
          {notes.map((note) => (
            <p key={note.title}>
              <strong>{note.title}</strong>
              <span>{note.text}</span>
            </p>
          ))}
        </div>
      ) : null}
      <CiteList className="approach-sources" sources={sources} />
    </section>
  );
}
