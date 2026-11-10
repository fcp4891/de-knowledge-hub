import type { CSSProperties } from "react";

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
        <h4>{item.title}</h4>
        {item.text ? (
          <p>
            <RichText text={item.text} />
          </p>
        ) : null}
        {item.tags ? <Pills tags={item.tags} /> : null}
        {item.arq ? <ArchitectureDot /> : null}
      </article>
    </li>
  );
}

export function PracticeLanes({ start, lanes, cross }: PracticeLanesProps) {
  return (
    <section className="ficha-block practice">
      {start ? (
        <div className="practice-start">
          <h3>{start.title}</h3>
          <p>
            <RichText text={start.text} />
          </p>
        </div>
      ) : null}
      <ol
        className="practice-lanes"
        data-count={lanes.length}
        style={{ "--practice-span": 1 + Math.max(0, ...lanes.map((lane) => lane.items.length)) } as CSSProperties}
      >
        {lanes.map((lane, index) => (
          <li key={lane.title} className="practice-lane">
            <header>
              <span className="practice-num">{index + 1}</span>
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
