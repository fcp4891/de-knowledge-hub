import { ArchitectureDot } from "@/components/markdown/InlineText";

import "./ficha-blocks.css";

export function PracticeLanes({
  start,
  lanes,
}: {
  start?: { title: string; text: string };
  lanes: { title: string; items: { title: string; text: string; arq?: boolean }[] }[];
}) {
  return (
    <section className="ficha-block practice">
      {start ? (
        <header className="practice-start">
          <h3>{start.title}</h3>
          <p>{start.text}</p>
        </header>
      ) : null}
      <ol className="practice-lanes">
        {lanes.map((lane, index) => (
          <li key={lane.title} className="practice-lane">
            <span className="practice-num">{String(index + 1).padStart(2, "0")}</span>
            <h3>{lane.title}</h3>
            <ul>
              {lane.items.map((item) => (
                <li key={item.title}>
                  <h4>
                    {item.arq ? <ArchitectureDot /> : null}
                    {item.title}
                  </h4>
                  {item.text ? <p>{item.text}</p> : null}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
