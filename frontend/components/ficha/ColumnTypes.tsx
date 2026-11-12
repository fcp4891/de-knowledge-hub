import type { Views } from "@/lib/views";

import { RichText } from "./RichText";
import "./pii-views.css";

type Columns = NonNullable<Views["column_types"]>;

export function ColumnTypes({ view }: { view: Columns }) {
  return (
    <section className="pii-view">
      <div className="pii-table-wrap pii-column-types">
        <table className="pii-table">
          <thead>
            <tr>
              {view.headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.rows.map((row) => (
              <tr key={row.type}>
                <td data-c={view.headers[0]}>
                  <strong>{row.type}</strong>
                </td>
                <td data-c={view.headers[1]}>
                  <RichText text={row.examples} />
                </td>
                <td data-c={view.headers[2]}>
                  <Mark mark={row.patterns.mark} text={row.patterns.text} />
                </td>
                <td data-c={view.headers[3]}>
                  <Mark mark={row.detector.mark} text={row.detector.text} />
                </td>
                <td data-c={view.headers[4]}>
                  <span className="pii-cats">
                    {row.categories.map((category) => (
                      <span key={category.label} className={`pii-tone is-${category.tone}`}>
                        {category.label}
                      </span>
                    ))}
                  </span>
                  <span className="pii-row-note">
                    <RichText text={row.why} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="pii-legend">
        {view.legend.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function Mark({ mark, text }: { mark: "ok" | "part" | "miss"; text: string }) {
  return (
    <span className={`pii-mark is-${mark}`}>
      <b>{text}</b>
    </span>
  );
}
