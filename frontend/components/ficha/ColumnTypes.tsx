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
                {/* Cinco encabezados y seis datos: los ejemplos de columna van dentro de la celda del tipo (maqueta). */}
                <td data-c={view.headers[0]}>
                  <div>
                    <strong>{row.type}</strong>
                    <span className="pii-type-examples">
                      <RichText text={row.examples} />
                    </span>
                  </div>
                </td>
                <td data-c={view.headers[1]}>
                  <Mark mark={row.patterns.mark} text={row.patterns.text} />
                </td>
                <td data-c={view.headers[2]}>
                  <Mark mark={row.detector.mark} text={row.detector.text} />
                </td>
                <td data-c={view.headers[3]}>
                  <span className="pii-cats">
                    {row.categories.map((category) => (
                      <span key={category.label} className={`pii-tone is-${category.tone}`}>
                        {category.label}
                      </span>
                    ))}
                  </span>
                </td>
                <td data-c={view.headers[4]}>
                  <RichText text={row.why} />
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
