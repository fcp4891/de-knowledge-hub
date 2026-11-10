import type { CloudCell, CloudCompareProps } from "@/lib/views";

import "@/components/markdown/pipeline.css";

import "./ficha-blocks.css";

function Service({ cell }: { cell: CloudCell }) {
  return (
    <td>
      <strong>{cell.name}</strong>
      {cell.text}
      {cell.warn ? <span className="cloud-compare-warn">{cell.warn}</span> : null}
    </td>
  );
}

export function CloudCompare({ intro, alert, headers, rows, closing }: CloudCompareProps) {
  return (
    <div className="markdown cloud-compare">
      <p>{intro}</p>
      <p className="cloud-compare-note">
        <strong>{alert.title}</strong>
        <span>{alert.text}</span>
      </p>
      <div className="markdown-table-wrap markdown-table-steps">
        <table>
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.need} id={row.id}>
                <td>
                  {row.need}
                  <span className="cloud-compare-meta">{row.meta}</span>
                </td>
                <Service cell={row.gcp} />
                <Service cell={row.aws} />
                <Service cell={row.azure} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="cloud-compare-closing">{closing}</p>
    </div>
  );
}
