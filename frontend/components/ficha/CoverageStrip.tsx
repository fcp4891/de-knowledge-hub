import type { Views } from "@/lib/views";

import { RichText } from "./RichText";
import "./pii-views.css";

type Strip = NonNullable<Views["coverage_strip"]>;

export function CoverageStrip({ view }: { view: Strip }) {
  return (
    <section className="pii-view" aria-label={view.label}>
      <p className="pii-kicker">{view.label}</p>
      <p>
        <RichText text={view.lead} />
      </p>
      <div className="pii-coverage">
        {view.rows.map((row) => (
          <div key={row.title} className="pii-coverage-row">
            <div>
              <strong>{row.title}</strong>
              <span>
                <RichText text={row.text} />
              </span>
              <em>{row.count}</em>
            </div>
            <div className="pii-cells">
              {view.columns.map((column) => {
                const hit = row.hits.includes(column);
                const tone = hit ? (row.tone === "law" ? "is-law" : "is-hit") : undefined;
                return (
                  <i key={column} className={tone}>
                    {column}
                  </i>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="pii-note">
        <RichText text={view.note} />
      </p>
    </section>
  );
}
