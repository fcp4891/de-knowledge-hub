import type { ControlEvidenceProps, RequirementToDataProps } from "@/lib/views";

import { RichText } from "./RichText";
import "./ficha-blocks.css";

function Arrow() {
  return (
    <span className="control-evidence-arrow" aria-hidden="true">
      →
    </span>
  );
}

function Kicker({ title, detail }: { title: string; detail?: string }) {
  return (
    <p className="control-evidence-kicker">
      {title}
      {detail ? (
        <>
          <br />
          {detail}
        </>
      ) : null}
    </p>
  );
}

function DataCirculation({ data }: { data: RequirementToDataProps["data"] }) {
  return (
    <div className="control-evidence-flow">
      <Kicker title={data.kicker.title} detail={data.kicker.detail} />
      <div>
        <ol>
          {data.stages.map((stage, index) => (
            <li key={stage.title}>
              <article className={stage.tone === "end" ? "is-end" : "is-layer"}>
                <strong>{stage.title}</strong>
                {stage.detail ? <span>{stage.detail}</span> : null}
                {stage.pill ? <em>{stage.pill}</em> : null}
              </article>
              {index < data.stages.length - 1 ? <Arrow /> : null}
            </li>
          ))}
        </ol>
        <p className="control-evidence-banner">{data.banner}</p>
      </div>
    </div>
  );
}

export function RequirementToData({ title, lead, governance, data }: RequirementToDataProps) {
  return (
    <section className="ficha-block control-evidence" aria-label={title}>
      <h3>{title}</h3>
      <p className="control-evidence-lead">{lead}</p>
      <div className="control-evidence-scroll">
        <div className="control-evidence-flow">
          <Kicker title={governance.kicker.title} detail={governance.kicker.detail} />
          <div className="requirement-gov-wrap">
            <ol className="requirement-gov">
              {governance.items.flatMap((item, index) => [
                ...(index > 0
                  ? [
                      <li key={`${item.title}-arrow`} className="requirement-gov-arrow">
                        <Arrow />
                      </li>,
                    ]
                  : []),
                <li key={item.title}>
                  <article>
                    <strong>{item.title}</strong>
                    {item.detail ? <span>{item.detail}</span> : null}
                  </article>
                </li>,
              ])}
            </ol>
            <p className="requirement-legend">
              {governance.legend.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </p>
          </div>
        </div>
        <DataCirculation data={data} />
      </div>
    </section>
  );
}

export function ControlEvidence({ title, lead, steps, decide, note, example }: ControlEvidenceProps) {
  return (
    <section className="ficha-block control-evidence" aria-label={title}>
      <h3>{title}</h3>
      <p className="control-evidence-lead">
        <RichText text={lead} />
      </p>

      <div className="control-evidence-scroll">
        <ol className="control-evidence-steps">
          {steps.map((step) => (
            <li key={step.number}>
              <article>
                <span>{step.number}</span>
                <h4>{step.title}</h4>
                <ul>
                  {step.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <Arrow />
            </li>
          ))}
          <li>
            <article>
              <span>{decide.number}</span>
              <h4>{decide.title}</h4>
              <ul className="control-evidence-outcomes">
                {decide.outcomes.map((outcome) => (
                  <li key={outcome.text} className={`is-${outcome.tone}`}>
                    {outcome.text}
                  </li>
                ))}
              </ul>
            </article>
          </li>
        </ol>
      </div>

      <p className="control-evidence-note">{note}</p>

      <details className="control-evidence-example" open>
        <summary>{example.summary}</summary>
        <div className="control-evidence-scroll">
          <ol className="control-evidence-code">
            {example.steps.map((step, index) => (
              <li key={step.title}>
                <article>
                  <h4>{step.title}</h4>
                  <ul>
                    {step.items.map((item) => (
                      <li key={item.text}>
                        {item.text}
                        {item.code ? <code>{item.code}</code> : null}
                      </li>
                    ))}
                  </ul>
                </article>
                {index < example.steps.length - 1 ? <Arrow /> : null}
              </li>
            ))}
          </ol>
        </div>
        <p>{example.note}</p>
        {example.codeLink ? (
          <p>
            <a href={example.codeLink.href}>{example.codeLink.label}</a>
          </p>
        ) : null}
      </details>
    </section>
  );
}
