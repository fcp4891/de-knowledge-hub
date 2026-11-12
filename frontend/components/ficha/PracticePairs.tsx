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
      <div className="pii-pair">
        <section className="pii-col is-do">
          <h3>{view.labels.do}</h3>
          <ul>
            {view.items.map((item) => (
              <li key={item.do}>
                <RichText text={item.do} />
              </li>
            ))}
          </ul>
        </section>
        <section className="pii-col is-avoid">
          <h3>{view.labels.avoid}</h3>
          <ul>
            {view.items.map((item) => (
              <li key={item.avoid}>
                <RichText text={item.avoid} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
