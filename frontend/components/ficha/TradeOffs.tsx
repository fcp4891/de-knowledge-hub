import { ArchitectureDot } from "@/components/markdown/InlineText";
import type { TradeOffsProps } from "@/lib/views";

import { RichText } from "./RichText";
import "./ficha-blocks.css";

/** Trade-offs como balanzas «A ⇄ B» con su franja «Se resuelve con…» (ADR-030, enmienda 3). */
export function TradeOffs({ arq, resolutionLabel, items, note }: TradeOffsProps) {
  return (
    <section className="ficha-block tradeoffs" aria-label="Trade-offs">
      <ul className="tradeoff-list">
        {items.map((item) => (
          <li key={`${item.a}-${item.b}`} className="tradeoff">
            <h3 className="tradeoff-scale">
              {arq ? <ArchitectureDot /> : null}
              <span>{item.a}</span>
              <span className="tradeoff-arrow" aria-label="frente a">
                ⇄
              </span>
              <span>{item.b}</span>
            </h3>
            <p>
              <RichText text={item.text} />
            </p>
            <p className="tradeoff-resolution">
              <strong>{resolutionLabel}</strong> {item.resolution}
            </p>
          </li>
        ))}
      </ul>
      <p className="tradeoff-note">{note}</p>
    </section>
  );
}
