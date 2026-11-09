import "./ficha-blocks.css";

const BARS = [1, 2, 3] as const;

export function SeverityCards({
  levels,
}: {
  levels: { name: string; level: 1 | 2 | 3; amount: string; note?: string; examples: string[] }[];
}) {
  return (
    <section className="ficha-block severity" aria-label="Sanciones">
      <ul className="severity-list">
        {levels.map((item) => (
          <li key={item.name} className="severity-card" data-level={item.level}>
            <h3>{item.name}</h3>
            <div className="severity-meter" role="img" aria-label={`Gravedad ${item.level} de 3`}>
              {BARS.map((bar) => (
                <span key={bar} className="severity-bar" data-on={bar <= item.level ? "true" : "false"} />
              ))}
            </div>
            <p className="severity-amount">{item.amount}</p>
            {item.note ? <p className="severity-note">{item.note}</p> : null}
            <ul>
              {item.examples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
