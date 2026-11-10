import type { SeverityCardsProps } from "@/lib/views";

import "./ficha-blocks.css";

const BARS = [1, 2, 3] as const;

export function SeverityCards({ levels, modifiers = [] }: SeverityCardsProps) {
  return (
    <section className="ficha-block severity" aria-label="Sanciones">
      <ul className="severity-list">
        {levels.map((item) => (
          <li key={item.name} className="severity-card" data-level={item.level}>
            <header>
              <h3>
                {item.name}
                {item.article ? <small className="severity-article">{item.article}</small> : null}
              </h3>
              <div className="severity-meter" role="img" aria-label={`Gravedad ${item.level} de 3`}>
                {BARS.map((bar) => (
                  <span key={bar} className="severity-bar" data-on={bar <= item.level ? "true" : "false"} />
                ))}
              </div>
            </header>
            <p className="severity-amount">{item.amount}</p>
            {item.note ? <p className="severity-note">{item.note}</p> : null}
            {item.examplesLabel ? <p className="severity-kicker">{item.examplesLabel}</p> : null}
            <ul>
              {item.examples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {modifiers.length > 0 ? (
        <ul className="severity-adjustments">
          {modifiers.map((item) => (
            <li key={item.title}>
              <article data-tone={item.effect} data-effect={item.effect}>
                <p className="severity-adjust-kicker">{item.effectLabel}</p>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span>{item.basis}</span>
              </article>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
