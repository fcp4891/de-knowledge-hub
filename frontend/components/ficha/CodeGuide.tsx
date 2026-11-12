import type { CodeGuideProps } from "@/lib/views";

import { RichText } from "./RichText";
import "./ficha-blocks.css";
import "./pii-views.css";

export function CodeGuide({ lead, rules, notCovered, scenarios, simplifies, limit }: CodeGuideProps) {
  return (
    <section className="ficha-block code-guide" aria-label="Qué hace el ejemplo">
      <h3>{lead.title.replace(/\.$/, "")}</h3>
      <p className="code-guide-lead">
        <RichText text={lead.text} />
      </p>

      <div className="pii-table-wrap">
        <table className="pii-table">
          <thead>
            <tr>
              {rules.headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rules.items.map((row) => (
              <tr key={row.fn} id={row.id}>
                <td data-c={rules.headers[0]}>{row.rule}</td>
                <td data-c={rules.headers[1]}>
                  <code>{row.fn}</code>
                </td>
                <td data-c={rules.headers[2]}>
                  <RichText text={row.requirement} />
                </td>
                {rules.headers.length > 3 ? (
                  <td data-c={rules.headers[3]}>{row.finds ? <RichText text={row.finds} /> : null}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>{notCovered.title}</h3>
      <p>
        <RichText text={notCovered.intro} />
      </p>
      <ul>
        {notCovered.items.map((item) => (
          <li key={item.title}>
            <strong>{item.title}</strong> <RichText text={item.text} />
          </li>
        ))}
      </ul>
      {notCovered.note ? (
        <p className="pii-note">
          <RichText text={notCovered.note} />
        </p>
      ) : null}

      <h3>{scenarios.title}</h3>
      <table className="code-guide-scenarios">
        <tbody>
          {scenarios.items.map((row) => (
            <tr key={row.name}>
              <th scope="row">
                <code>{row.name}</code>
              </th>
              <td>
                <RichText text={row.text} />
              </td>
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
            <strong>{item.title}</strong> <RichText text={item.text} />
          </li>
        ))}
      </ul>

      <p className="code-guide-limit">
        <strong>{limit.title}</strong> <RichText text={limit.text} />
      </p>
    </section>
  );
}
