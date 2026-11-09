import { ArchitectureDot } from "@/components/markdown/InlineText";

import "./ficha-blocks.css";

const ACROSS: Record<string, string> = {
  Demostrar: "en todas las etapas",
};

function articlePill(text: string): { body: string; pill: string | null } {
  const found: string[] = [];
  const body = text
    .replace(/\(\s*(art\.[^)]*?)\)/gi, (_, article: string) => {
      found.push(article.trim().replace(/\s+/g, " "));
      return "";
    })
    .replace(/\s+([,.;])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!body) return { body: text, pill: null };
  return { body, pill: found.length > 0 ? found.join(" · ") : null };
}

export function PracticeLanes({
  start,
  lanes,
}: {
  start?: { title: string; text: string };
  lanes: { title: string; items: { title: string; text: string; arq?: boolean }[] }[];
}) {
  const across = lanes.filter((lane) => lane.title in ACROSS);
  const ordered = [...lanes.filter((lane) => !(lane.title in ACROSS)), ...across];
  return (
    <section className="ficha-block practice">
      {start ? (
        <header className="practice-start">
          <h3>{start.title}</h3>
          <p>{start.text}</p>
        </header>
      ) : null}
      <ol className="practice-lanes">
        {ordered.map((lane, index) => {
          const note = ACROSS[lane.title];
          return (
            <li key={lane.title} className={note ? "practice-lane is-across" : "practice-lane"}>
              <header>
                {note ? null : <span className="practice-num">{String(index + 1).padStart(2, "0")}</span>}
                <h3>
                  {lane.title}
                  {note ? <small>{note}</small> : null}
                </h3>
              </header>
              <ul>
                {lane.items.map((item) => {
                  const { body, pill } = articlePill(item.text ?? "");
                  return (
                    <li key={item.title}>
                      <article>
                        {item.arq ? <ArchitectureDot /> : null}
                        <h4>{item.title}</h4>
                        {body ? <p>{body}</p> : null}
                        {pill ? (
                          <ul className="practice-refs">
                            <li>{pill}</li>
                          </ul>
                        ) : null}
                      </article>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
