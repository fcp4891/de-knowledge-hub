import { ArchitectureDot } from "@/components/markdown/InlineText";
import type { TradeOffsProps } from "@/lib/views";

import { RichText } from "./RichText";
import "./ficha-blocks.css";

function tradeSides(text: string): [string, string | null] {
  const clauses = text.split(/;\s+/);
  if (clauses.length >= 2) {
    return [clauses[0], clauses.slice(1).join("; ")];
  }
  const sentences = text.split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚÜÑ])/);
  if (sentences.length >= 2) {
    return [sentences[0], sentences.slice(1).join(" ")];
  }
  const parts = text.split(/\s+y\s+/);
  for (let index = 0; index < parts.length - 1; index += 1) {
    const left = parts.slice(0, index + 1).join(" y ");
    const right = parts.slice(index + 1).join(" y ");
    if (left.split(/\s+/).length >= 3 && right.split(/\s+/).length >= 3) {
      return [left, right];
    }
  }
  return [text, null];
}

export function TradeOffs({ arq, resolutionLabel, items, note }: TradeOffsProps) {
  return (
    <section className="ficha-block trade-offs" aria-label="Trade-offs">
      {arq ? (
        <p className="trade-mark">
          <ArchitectureDot />
        </p>
      ) : null}
      <ol className="trade-list">
        {items.map((item) => {
          const [left, right] = tradeSides(item.text);
          return (
            <li key={`${item.a}-${item.b}`} className="trade-pair">
              <div className="trade-side">
                <h3>{item.a}</h3>
                <p>
                  <RichText text={left} />
                </p>
              </div>
              <span className="trade-vs" aria-hidden="true">
                ⇄
              </span>
              <div className="trade-side">
                <h3>{item.b}</h3>
                <p>
                  <RichText text={right ?? left} />
                </p>
              </div>
              <p className="trade-resolution">
                <strong>{resolutionLabel}</strong> {item.resolution}
              </p>
            </li>
          );
        })}
      </ol>
      {note ? <p className="trade-closing">{note}</p> : null}
    </section>
  );
}
