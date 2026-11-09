import { ArchitectureDot } from "@/components/markdown/InlineText";
import type { PracticeLanesProps } from "@/lib/views";

import { Pills } from "./Pills";
import { RichText } from "./RichText";
import "./ficha-blocks.css";

type Item = PracticeLanesProps["lanes"][number]["items"][number];

function PracticeItem({ item }: { item: Item }) {
  return (
    <li id={item.id}>
      <h4>
        {item.arq ? <ArchitectureDot /> : null}
        {item.title}
      </h4>
      {item.text ? <p>{item.text}</p> : null}
      {item.tags ? <Pills tags={item.tags} /> : null}
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
      <ol className="practice-lanes" data-count={lanes.length}>
        {lanes.map((lane, index) => (
          <li key={lane.title} className="practice-lane">
            <span className="practice-num">{String(index + 1).padStart(2, "0")}</span>
            <h3>{lane.title}</h3>
            <ul>
              {lane.items.map((item) => (
                <PracticeItem key={item.title} item={item} />
              ))}
            </ul>
          </li>
        ))}
      </ol>
      {cross ? (
        <section className="practice-lane practice-cross" aria-label={cross.title}>
          <span className="practice-num">{cross.label}</span>
          <h3>{cross.title}</h3>
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
