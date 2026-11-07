import "./ficha-blocks.css";

export function CentralIdea({
  checksTitle,
  checks,
  status,
  risksTitle,
  risks,
  closing,
}: {
  checksTitle: string;
  checks: string[];
  status: string;
  risksTitle: string;
  risks: { text: string; tag: string }[];
  closing: string;
}) {
  return (
    <section className="ficha-block central-idea">
      <div className="central-idea-grid">
        <div className="central-idea-checks">
          <h3>{checksTitle}</h3>
          <ul>
            {checks.map((check) => (
              <li key={check}>
                <span className="central-idea-mark" aria-hidden="true">
                  ✓
                </span>
                <span>{check}</span>
              </li>
            ))}
          </ul>
          <p className="central-idea-status">{status}</p>
        </div>
        <div className="central-idea-risks">
          <h3>{risksTitle}</h3>
          <ul>
            {risks.map((risk) => (
              <li key={risk.text}>
                <span>{risk.text}</span>
                <span className="ficha-tag">{risk.tag}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="central-idea-closing">{closing}</p>
    </section>
  );
}
