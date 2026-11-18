import type { CloudCell, CloudCompareProps } from "@/lib/views";

import "@/components/markdown/pipeline.css";

import { RichText } from "./RichText";
import "./ficha-blocks.css";
import "./inventory-views.css";
import "./pii-views.css";

function Service({ cell, label }: { cell: CloudCell; label?: string }) {
  return (
    <td data-c={label}>
      <strong>
        <RichText text={cell.name} />
      </strong>
      {cell.text ? <RichText text={cell.text} /> : null}
      {cell.warn ? (
        <span className="cloud-compare-warn">
          <RichText text={cell.warn} />
        </span>
      ) : null}
    </td>
  );
}

export function CloudCompare({ intro, alert, headers, rows, closing }: CloudCompareProps) {
  const ownHeader = headers.length > 4 ? headers[1] : undefined;
  const serviceHeaders = ownHeader ? headers.slice(2) : headers.slice(1);
  // ADR-030 enmienda 9: con una celda para las tres nubes, los encabezados llevan id y la celda los nombra en headers.
  const spans = rows.some((row) => row.span);
  const headerId = (index: number) => (spans ? `cloud-h-${index}` : undefined);
  const serviceIds = serviceHeaders.map((_, index) => `cloud-h-${index + (ownHeader ? 2 : 1)}`).join(" ");
  return (
    <div className="markdown cloud-compare">
      {intro ? (
        <p>
          <RichText text={intro} />
        </p>
      ) : null}
      {alert ? (
        <p className="cloud-compare-note">
          <strong>{alert.title}</strong>
          <span>
            <RichText text={alert.text} />
          </span>
        </p>
      ) : null}
      <div className="markdown-table-wrap markdown-table-steps pii-table-wrap">
        <table className="pii-table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={header} id={headerId(index)} scope={spans ? "col" : undefined}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.need} id={row.id} data-tone={row.tone}>
                <td data-c={headers[0]}>
                  {row.need}
                  {row.meta ? <span className="cloud-compare-meta">{row.meta}</span> : null}
                </td>
                {ownHeader ? (
                  <td className="cloud-own" data-c={ownHeader}>
                    {row.own ? <RichText text={row.own.text} /> : null}
                  </td>
                ) : null}
                {row.span ? (
                  <td className="cloud-span" colSpan={3} headers={`${headerId(0)} ${serviceIds}`} data-c={serviceHeaders.join(" · ")}>
                    <strong>{row.span.title}</strong>
                    <RichText text={row.span.text} />
                  </td>
                ) : (
                  <>
                    {row.gcp ? <Service cell={row.gcp} label={serviceHeaders[0]} /> : <td />}
                    {row.aws ? <Service cell={row.aws} label={serviceHeaders[1]} /> : <td />}
                    {row.azure ? <Service cell={row.azure} label={serviceHeaders[2]} /> : <td />}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {closing ? (
        <p className="cloud-compare-closing">
          <RichText text={closing} />
        </p>
      ) : null}
    </div>
  );
}
