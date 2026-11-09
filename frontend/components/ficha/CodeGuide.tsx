import type { CodeGuideProps } from "@/lib/views";

import "./ficha-blocks.css";

export function CodeGuide({ lead, rules, notCovered, scenarios, simplifies, limit }: CodeGuideProps) {
  return (
    <section className="ficha-block code-guide" aria-label="Qué hace el ejemplo">
      <p className="code-guide-lead">
        <strong>{lead.title}</strong> {lead.text}
      </p>

      <table>
        <thead>
          <tr>
            {rules.headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rules.items.map((row) => (
            <tr key={row.fn}>
              <td>{row.rule}</td>
              <td>
                <code>{row.fn}</code>
              </td>
              <td>{row.requirement}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{notCovered.title}</h3>
      <p>{notCovered.intro}</p>
      <ul>
        {notCovered.items.map((item) => (
          <li key={item.title}>
            <strong>{item.title}</strong> {item.text}
          </li>
        ))}
      </ul>

      <h3>{scenarios.title}</h3>
      <table className="code-guide-scenarios">
        <tbody>
          {scenarios.items.map((row) => (
            <tr key={row.name}>
              <th scope="row">
                <code>{row.name}</code>
              </th>
              <td>{row.text}</td>
              <td>
                <span className={row.exitCode === 0 ? "code-guide-exit is-ok" : "code-guide-exit is-bad"}>{row.exitCode}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{simplifies.title}</h3>
      <ul>
        {simplifies.items.map((item) => (
          <li key={item.title}>
            <strong>{item.title}</strong> {item.text}
          </li>
        ))}
      </ul>

      <p className="code-guide-limit">
        <strong>{limit.title}</strong> {limit.text}
      </p>
    </section>
  );
}
