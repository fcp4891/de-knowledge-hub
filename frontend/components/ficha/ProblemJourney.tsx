import type { ProblemJourneyProps } from "@/lib/views";

import "./ficha-blocks.css";

export function ProblemJourney({ question, lead, labels, stages, note }: ProblemJourneyProps) {
  return (
    <section className="ficha-block problem-journey" aria-label="Problema que resuelve">
      <div className="problem-question">
        <p className="problem-kicker">{question.kicker}</p>
        <p>{question.text}</p>
      </div>
      <p className="problem-lead">{lead}</p>
      <div className="problem-scroll">
        <div className="problem-grid">
          <p className="problem-label">{labels.route}</p>
          {stages.map((stage) => (
            <p key={stage.title} className="problem-stage">
              <span>{stage.title}</span>
              <small>{stage.detail}</small>
            </p>
          ))}
          <p className="problem-label problem-label-gap">{labels.without}</p>
          {stages.map((stage) => (
            <p key={`${stage.title}-gap`} className="problem-gap">
              <span className="problem-mark" aria-hidden="true">
                {stage.gapMark}
              </span>
              <span>{stage.gap}</span>
            </p>
          ))}
          <p className="problem-label problem-label-ok">{labels.with}</p>
          {stages.map((stage) => (
            <p key={`${stage.title}-ok`} className="problem-ok">
              <span className="problem-mark" aria-hidden="true">
                ✓
              </span>
              <span>{stage.control}</span>
            </p>
          ))}
        </div>
      </div>
      <p className="problem-note">{note}</p>
    </section>
  );
}
