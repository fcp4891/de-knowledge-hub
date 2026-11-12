import type { Views } from "@/lib/views";

import { RichText } from "./RichText";
import "./pii-views.css";

type Pair = NonNullable<Views["use_avoid"]>;

export function UseAvoid({ view }: { view: Pair }) {
  return (
    <div className="pii-use">
      <Column title={view.use.title} items={view.use.items} tone="do" />
      <Column title={view.avoid.title} items={view.avoid.items} tone="avoid" />
    </div>
  );
}

function Column({ title, items, tone }: { title: string; items: string[]; tone: "do" | "avoid" }) {
  return (
    <section className={`pii-col is-${tone}`}>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <RichText text={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
