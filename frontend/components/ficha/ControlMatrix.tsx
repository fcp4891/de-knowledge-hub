import { ArchitectureDot } from "@/components/markdown/InlineText";
import { stepNumber } from "@/lib/controlMatrix";
import type { ControlMatrixProps } from "@/lib/views";

import { RichText } from "./RichText";
import "@/components/markdown/pipeline.css";
import "./ficha-blocks.css";

export function ControlMatrix({ title, legend, headers, rows, closing }: ControlMatrixProps) {
  return (
    <div className="markdown">
      <h3>
        <ArchitectureDot /> {title}
      </h3>
      <p className="matrix-legend">
        <RichText text={legend} />
      </p>
      <div className="markdown-table-wrap markdown-table-steps">
        <table>
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={header}>
                  <span className="step-number">{stepNumber(index)}</span>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>
                  {row.name}
                  {row.bases.map((basis) => (
                    <span key={basis} className="matrix-meta">
                      {basis}
                    </span>
                  ))}
                  {row.code ? <code className="matrix-code">{row.code}</code> : null}
                </td>
                <td>{row.risk}</td>
                <td>{row.control}</td>
                <td>{row.check}</td>
                <td>{row.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>{closing}</p>
    </div>
  );
}
