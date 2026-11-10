import { ArchitectureDot } from "@/components/markdown/InlineText";
import type { PracticeLanesProps } from "@/lib/views";

import { Pills } from "./Pills";
import { RichText } from "./RichText";
import "./ficha-blocks.css";

type Item = PracticeLanesProps["lanes"][number]["items"][number];

function PracticeItem({ item }: { item: Item }) {
  return (
    <li id={item.id}>
      <article>
        {item.arq ? <ArchitectureDot /> : null}
        <h4>{item.title}</h4>
        {item.text ? (
          <p>
            <RichText text={item.text} />
          </p>
        ) : null}
        {item.tags ? <Pills tags={item.tags} /> : null}
      </article>
    </li>
  );
}

export function PracticeLanes({ start, lanes, cross }: PracticeLanesProps) {
  return (
    <section className="ficha-block practice">
      {start ? (
        <p className="practice-notice">
          <strong>{start.title}.</strong> <RichText text={start.text} />
        </p>
      ) : null}
      <ol className="practice-lanes">
        {lanes.map((lane, index) => (
          <li key={lane.title} className="practice-lane">
            <header>
              <span className="practice-num">{String(index + 1).padStart(2, "0")}</span>
              <h3>{lane.title}</h3>
            </header>
            <ul>
              {lane.items.map((item) => (
                <PracticeItem key={item.title} item={item} />
              ))}
            </ul>
          </li>
        ))}
      </ol>
      {cross ? (
        <section className="practice-lane is-across" aria-label={cross.title}>
          <header>
            <h3>
              {cross.title}
              {cross.label ? <small>{cross.label}</small> : null}
            </h3>
          </header>
          <ul>
            {cross.items.map((item) => (
              <PracticeItem key={item.title} item={item} />
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
