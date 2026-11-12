import type { Views } from "@/lib/views";

import { RichText } from "./RichText";
import "./pii-views.css";

type Catalog = NonNullable<Views["catalog_fields"]>;

/** §1 de pii-identification: campos del catálogo por columna. `label` solo va como aria-label (no es un título visible). */
export function CatalogFields({ view }: { view: Catalog }) {
  return (
    <section className="pii-view">
      <h3>{view.title}</h3>
      <div className="pii-rec" role="table" aria-label={view.label ?? view.title}>
        <div className="pii-rec-head" role="row">
          {view.headers.map((header) => (
            <span key={header} role="columnheader">
              {header}
            </span>
          ))}
        </div>
        {view.rows.map((row) => (
          <div key={row.field} className="pii-rec-row" role="row">
            <b role="rowheader">{row.field}</b>
            <span role="cell">
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
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
