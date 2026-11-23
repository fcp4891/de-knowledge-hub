import type { ReactNode } from "react";

import type { CodeGuideProps } from "@/lib/views";

import { Disclosure } from "./Disclosure";
import { RichText } from "./RichText";
import "./ficha-blocks.css";
import "./inventory-views.css";
import "./pii-views.css";
import { breakAtUnderscores } from "@/lib/breakUnderscores";

/** Resumen visible de la tabla de controles: {rows} y {total} salen de las filas (ADR-030, enmienda 9). */
export function rulesSummary(template: string, items: { count?: number }[]): string {
  const total = items.reduce((sum, item) => sum + (item.count ?? 0), 0);
  return template.replace("{rows}", String(items.length)).replace("{total}", String(total));
}

function ExitCodes({ items }: { items: { name: string; exitCode: 0 | 1 }[] }) {
  return (
    <>
      {items.map((item, index) => (
        <span key={item.name}>
          {index > 0 ? " · " : null}
          <code>{item.name}</code>{" "}
          <b className={item.exitCode === 0 ? "code-guide-exit is-ok" : "code-guide-exit is-bad"}>{item.exitCode}</b>
        </span>
      ))}
    </>
  );
}

function Block({
  title,
  summary,
  disclosure,
  children,
}: {
  title?: string;
  summary?: ReactNode;
  disclosure?: "open" | "closed";
  children: ReactNode;
}) {
  if (disclosure && title) {
    return (
      <Disclosure title={title} summary={summary} open={disclosure === "open"}>
        {children}
      </Disclosure>
    );
  }
  return (
    <>
      {title ? <h3>{title}</h3> : null}
      {children}
    </>
  );
}

export function CodeGuide({
  exitCodesLabel,
  lead,
  leadMore,
  rules,
  notCovered,
  scenarios,
  simplifies,
  limit,
  breakCodes = false,
}: CodeGuideProps & { breakCodes?: boolean }) {
  const counted = rules?.items.some((row) => row.count !== undefined) ?? false;
  const table = notCovered.table;
  return (
    <section className="ficha-block code-guide" aria-label="Qué hace el ejemplo">
      {/* ADR-030 enmienda 10: rules y scenarios son opcionales; la línea de códigos de salida necesita scenarios. */}
      {exitCodesLabel && scenarios ? (
        <p className="code-guide-exits">
          <span>{exitCodesLabel}</span>{" "}
          {scenarios.items.map((item, index) => (
            <span key={item.name}>
              {index > 0 ? " · " : null}
              <code>{item.name}</code> → {item.exitCode}
            </span>
          ))}
        </p>
      ) : null}
      <h3>{lead.title.replace(/\.$/, "")}</h3>
      <p className="code-guide-lead">
        <RichText text={lead.text} />
      </p>
      {(leadMore ?? []).map((text) => (
        <p key={text} className="code-guide-lead">
          <RichText text={text} />
        </p>
      ))}

      {rules ? (
      <Block
        title={rules.title}
        summary={rules.summary ? rulesSummary(rules.summary, rules.items) : undefined}
        disclosure={rules.disclosure}
      >
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
              {rules.items.map((row, index) => (
                <tr key={`${row.fn}-${index}`} id={row.id}>
                  <td data-c={rules.headers[0]}>
                    <RichText text={row.rule} />
                  </td>
                  <td data-c={rules.headers[1]}>
                    <code>{breakCodes ? breakAtUnderscores(row.fn) : row.fn}</code>
                  </td>
                  <td data-c={rules.headers[2]}>
                    <RichText text={row.requirement} />
                  </td>
                  {rules.headers.length > 3 ? (
                    <td data-c={rules.headers[3]} className={counted ? "code-guide-count" : undefined}>
                      {/* Un solo hijo: en la tabla apilada, cada hijo de la celda ocupa una fila de la rejilla. */}
                      {counted ? (
                        <span>×{row.count ?? 0}</span>
                      ) : row.finds ? (
                        <span>
                          <RichText text={row.finds} />
                        </span>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>
      ) : null}

      <h3>{notCovered.title}</h3>
      {notCovered.intro ? (
        <p>
          <RichText text={notCovered.intro} />
        </p>
      ) : null}
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
      {table ? (
        <Block title={table.lead.title.replace(/\.$/, "")} disclosure={table.disclosure}>
          <p className="code-guide-lead">
            <RichText text={table.lead.text} />
          </p>
          <div className="pii-table-wrap">
            <table className="pii-table">
              <thead>
                <tr>
                  {table.headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={row.item}>
                    <td data-c={table.headers[0]}>
                      <RichText text={row.item} />
                    </td>
                    <td data-c={table.headers[1]}>
                      <RichText text={row.form} />
                    </td>
                    <td data-c={table.headers[2]}>
                      <RichText text={row.code} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>
      ) : null}

      {scenarios ? (
      <Block
        title={scenarios.title}
        summary={scenarios.disclosure ? <ExitCodes items={scenarios.items} /> : undefined}
        disclosure={scenarios.disclosure}
      >
        <table className="code-guide-scenarios">
          <tbody>
            {scenarios.items.map((row) => (
              <tr key={row.name}>
                <th scope="row">
                  <code>{row.name}</code>
                </th>
                <td>
                  <RichText text={row.text} />
                  {row.fixes ? (
                    <ul className="code-guide-fixes">
                      {row.fixes.map((fix) => (
                        <li key={fix.finding}>
                          <code>{fix.finding}</code> → <RichText text={fix.fix} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </td>
                <td>
                  <span className={row.exitCode === 0 ? "code-guide-exit is-ok" : "code-guide-exit is-bad"}>{row.exitCode}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Block>
      ) : null}

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
