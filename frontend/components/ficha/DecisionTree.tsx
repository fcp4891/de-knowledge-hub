"use client";

import { useEffect, useState } from "react";

import type { Views } from "@/lib/views";

import { FichaAnchor } from "@/components/availability/FichaLink";
import { useExamplePick } from "./ExamplePick";
import { RichText } from "./RichText";
import "./pii-views.css";

type Tree = NonNullable<Views["decision_tree"]>;
type Example = Tree["examples"][number];
type Answer = "yes" | "no";

export function DecisionTree({ view }: { view: Tree }) {
  const external = useExamplePick();
  // M5: sin elección, la columna inicial es la del contrato (view.default: tramo_ingreso).
  const selected =
    view.examples.find((item) => item.column === external?.column) ??
    view.examples.find((item) => item.column === view.default) ??
    view.examples[0] ??
    null;
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!external?.column) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    setFlash(true);
    const timer = window.setTimeout(() => setFlash(false), 600);
    return () => window.clearTimeout(timer);
  }, [external?.column]);

  return (
    <section className="pii-view" aria-label={view.intro.title}>
      <h3>{view.intro.title}</h3>
      <p className="pii-note">
        <RichText text={view.intro.text} />
      </p>
      <div className="pii-examples">
        <h4>{view.examples_title}</h4>
        {view.examples.map((example) => (
          <button
            key={example.column}
            type="button"
            className="pii-example"
            aria-pressed={selected?.column === example.column}
            onClick={() => external?.pick(example.column)}
          >
            <code>{example.column}</code>
            <span>{example.description}</span>
          </button>
        ))}
      </div>
      {/* Maqueta: tres zonas, recorrido · desenlace · «Resultado para <columna>»; la ley, debajo. */}
      {selected ? (
        <>
          <div className="pii-route">
            <div className="pii-route-path">
              <Path view={view} example={selected} />
            </div>
            <Result view={view} example={selected} flash={flash} />
          </div>
          <Law view={view} example={selected} />
        </>
      ) : null}
    </section>
  );
}

/** Salida de la última pregunta respondida; si ninguna salida corresponde, el desenlace por defecto (fallback). */
function outcomeOf(view: Tree, example: Example): Tree["fallback"] {
  const lastIndex = example.answers.length - 1;
  const question = view.questions[lastIndex];
  const answer = example.answers[lastIndex];
  return question?.exits.find((exit) => exit.answer === answer) ?? view.fallback;
}

function Result({ view, example, flash }: { view: Tree; example: Example; flash: boolean }) {
  const lastIndex = example.answers.length - 1;
  const question = view.questions[lastIndex];
  const answer = example.answers[lastIndex];
  const line =
    question && answer
      ? `${view.step_labels.question} ${question.number} · ${view.answer_labels[answer]}, ${question.gloss[answer]}`
      : null;
  const outcome = outcomeOf(view, example);
  return (
    <>
      <div className="pii-outcome" data-outcome={outcome.outcome}>
        {line ? <p className="pii-path">{line}</p> : null}
        <strong>{outcome.title}</strong>
        <p>
          <RichText text={outcome.text} />
        </p>
      </div>
      <aside className={flash ? "pii-live is-flash" : "pii-live"} aria-live="polite">
        <p className="pii-label">
          {view.result_label} <code>{example.column}</code>
        </p>
        <p className="pii-desc">{example.description}</p>
        <strong data-outcome={example.outcome}>{example.title}</strong>
        <p>
          <RichText text={example.explanation} />
        </p>
        <h4>{view.catalog_label}</h4>
        <dl className="pii-catalog">
          <dt>{view.catalog_fields.category}</dt>
          <dd>{example.catalog.category}</dd>
          <dt>{view.catalog_fields.basis}</dt>
          <dd>{example.catalog.basis}</dd>
          <dt>{view.catalog_fields.risk}</dt>
          <dd>{example.catalog.risk}</dd>
          <dt>{view.catalog_fields.method}</dt>
          <dd>{example.catalog.method}</dd>
          <dt>{view.catalog_fields.review}</dt>
          <dd>{view.review}</dd>
        </dl>
      </aside>
    </>
  );
}

function Law({ view, example }: { view: Tree; example: Example }) {
  return (
    <>
      {example.law ? (
        <details className="pii-law">
          <summary>{view.law.summary}</summary>
          <ul>
            {view.law.items.map((item) => (
              <li key={item}>
                <RichText text={item} />
              </li>
            ))}
          </ul>
          <FichaAnchor href={view.law.link.href}>{view.law.link.label}</FichaAnchor>
        </details>
      ) : null}
    </>
  );
}

function Path({ view, example }: { view: Tree; example: Example }) {
  const steps = example.answers.flatMap((answer, index) => {
    const question = view.questions[index];
    if (!question) {
      return [];
    }
    return [{ question, answer: answer as Answer, last: index === example.answers.length - 1 }];
  });
  return (
    <>
      <p className="pii-label">{view.path_label}</p>
      <ol className="pii-questions">
      {steps.map((step) => (
        <li key={step.question.number} className="pii-question">
          <small>
            {view.step_labels.question} {step.question.number}
          </small>
          <strong>{step.question.question}</strong>
          <span>{step.question.help}</span>
          <em className="pii-answer">
            {view.answer_labels[step.answer]}, {step.question.gloss[step.answer]}
            {step.last ? ` · ${view.step_labels.end}` : ` · ${view.step_labels.next}`}
          </em>
        </li>
      ))}
      </ol>
    </>
  );
}
