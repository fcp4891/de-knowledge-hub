import type { Views } from "@/lib/views";

import { RichText } from "./RichText";
import "./pii-views.css";

type Pairs = NonNullable<Views["practice_pairs"]>;

export function PracticePairs({ view }: { view: Pairs }) {
  return (
    <section className="pii-view">
      <h3>{view.start.title}</h3>
      <p className="pii-start">
        <RichText text={view.start.text} />
      </p>
      <div className="pii-pairs" role="list">
        <div className="pii-pairs-head" aria-hidden="true">
          <span>{view.labels.do}</span>
          <span>{view.labels.avoid}</span>
        </div>
        {view.items.map((item) => (
          <div key={item.do} className="pii-pair-row" role="listitem">
            <p className="pii-do">
              <b aria-hidden="true">✓</b>
              <span>
                <span className="pii-pair-label">{view.labels.do}: </span>
                <RichText text={item.do} />
              </span>
            </p>
            <p className="pii-dont">
              <b aria-hidden="true">✕</b>
              <span>
                <span className="pii-pair-label">{view.labels.avoid}: </span>
                <RichText text={item.avoid} />
              </span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
