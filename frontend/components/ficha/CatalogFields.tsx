import type { Views } from "@/lib/views";

import { RichText } from "./RichText";
import "./pii-views.css";

type Catalog = NonNullable<Views["catalog_fields"]>;

export function CatalogFields({ view }: { view: Catalog }) {
  return (
    <section className="pii-view" aria-label={view.title}>
      {view.label ? <p className="pii-kicker">{view.label}</p> : null}
      <h3>{view.title}</h3>
      <div className="pii-table-wrap">
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
              <tr key={row.field}>
                <td data-c={view.headers[0]}>
                  <code>{row.field}</code>
                </td>
                <td data-c={view.headers[1]}>
                  <RichText text={row.text} />
                  {row.categories && row.categories.length > 0 ? (
                    <span className="pii-cats">
                      {row.categories.map((category) => (
                        <span key={category.label} className={`pii-tone is-${category.tone}`}>
                          {category.label}
                        </span>
                      ))}
                    </span>
                  ) : null}
                  {row.note ? (
                    <span className="pii-row-note">
                      <RichText text={row.note} />
                    </span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
