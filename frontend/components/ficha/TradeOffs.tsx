import { ArchitectureDot } from "@/components/markdown/InlineText";
import type { TradeOffsProps } from "@/lib/views";

import { RichText } from "./RichText";
import "./ficha-blocks.css";

export function TradeOffs({ arq, resolutionLabel, items, note }: TradeOffsProps) {
  return (
    <section className="ficha-block trade-offs" aria-label="Trade-offs">
      {arq ? (
        <p className="trade-mark">
          <ArchitectureDot />
        </p>
      ) : null}
      <ol className="trade-list">
        {items.map((item) => (
          <li key={`${item.a}-${item.b}`} className="trade-pair">
            <div className="trade-side">
              <h3>{item.a}</h3>
            </div>
            <span className="trade-vs" aria-hidden="true">
              →
            </span>
            <div className="trade-side">
              <h3>{item.b}</h3>
            </div>
            <p className="trade-text">
              <RichText text={item.text} />
            </p>
            <p className="trade-resolution">
              <strong>{resolutionLabel}</strong> {item.resolution}
            </p>
          </li>
        ))}
      </ol>
      {note ? <p className="trade-closing">{note}</p> : null}
    </section>
  );
}
