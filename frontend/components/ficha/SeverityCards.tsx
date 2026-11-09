import type { SeverityCardsProps } from "@/lib/views";

import "./ficha-blocks.css";

const BARS = [1, 2, 3] as const;

export function SeverityCards({ levels, modifiers = [] }: SeverityCardsProps) {
  return (
    <section className="ficha-block severity" aria-label="Sanciones">
      <ul className="severity-list">
        {levels.map((item) => (
          <li key={item.name} className="severity-card" data-level={item.level}>
            <h3>
              {item.name}
              {item.article ? <span className="severity-article">{item.article}</span> : null}
            </h3>
            <div className="severity-meter" role="img" aria-label={`Gravedad ${item.level} de 3`}>
              {BARS.map((bar) => (
                <span key={bar} className="severity-bar" data-on={bar <= item.level ? "true" : "false"} />
              ))}
            </div>
            <p className="severity-amount">{item.amount}</p>
            {item.note ? <p className="severity-note">{item.note}</p> : null}
            {item.examplesLabel ? <p className="severity-label">{item.examplesLabel}</p> : null}
            <ul>
              {item.examples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {modifiers.length > 0 ? (
        <ul className="severity-modifiers">
          {modifiers.map((item) => (
            <li key={item.title} className="severity-modifier" data-effect={item.effect}>
              <span className="severity-effect">{item.effectLabel}</span>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
              <p className="severity-basis">{item.basis}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
