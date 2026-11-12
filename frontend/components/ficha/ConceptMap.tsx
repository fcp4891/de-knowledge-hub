"use client";

import type { Views } from "@/lib/views";

import { useExamplePick } from "./ExamplePick";
import { RichText } from "./RichText";
import "./pii-views.css";

type MapView = NonNullable<Views["concept_map"]>;

export function ConceptMap({ view }: { view: MapView }) {
  const pick = useExamplePick();
  return (
    <section className="pii-view pii-map" aria-label={view.label}>
      <div className="pii-outside">
        <small className="pii-kicker">
          <RichText text={view.outside.kicker} />
        </small>
        {view.outside.items.map((item) => (
          <div key={item.title}>
            <strong>{item.title}</strong>
            <span>
              <RichText text={item.text} />
            </span>
          </div>
        ))}
        <em>{view.outside.hint}</em>
      </div>
      <div className="pii-personal">
        <small className="pii-kicker">
          <RichText text={view.personal.kicker} />
        </small>
        <p className="pii-definition">{view.personal.definition}</p>
        <span className="pii-span">
          <RichText text={view.personal.text} />
        </span>
        <div className="pii-also">
          <small className="pii-kicker">{view.personal.also.kicker}</small>
          {view.personal.also.items.map((item) => (
            <article key={item.title} className="pii-card">
              <strong>
                <RichText text={item.title} />
              </strong>
              <span>
                <RichText text={item.text} />
              </span>
              {item.example ? (
                <button type="button" className="pii-card-pick" onClick={() => pick?.pick(item.example!.column)}>
                  {item.example.label} <code>{item.example.column}</code>
                  <span aria-hidden="true"> →</span>
                </button>
              ) : null}
            </article>
          ))}
        </div>
        <aside className="pii-sensitive">
          <small className="pii-kicker">
            <RichText text={view.sensitive.kicker} />
          </small>
          <span>
            <RichText text={view.sensitive.text} />
          </span>
          <em>{view.sensitive.hint}</em>
        </aside>
        <aside className="pii-minors">
          <small className="pii-kicker">
            <RichText text={view.minors.kicker} />
          </small>
          <span>
            <RichText text={view.minors.text} />
          </span>
          <em>{view.minors.hint}</em>
        </aside>
      </div>
    </section>
  );
}
