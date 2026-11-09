import { ArchitectureDot } from "@/components/markdown/InlineText";

import "./ficha-blocks.css";

const PAIRS: { left: string; leftText: string; right: string; rightText: string; resolution: string }[] = [
  {
    left: "Minimización",
    leftText: "Capturar menos reduce el riesgo.",
    right: "Flexibilidad analítica",
    rightText: "Puede limitar análisis futuros.",
    resolution: "Finalidades explícitas, aprobaciones y productos de datos definidos, no recolectando por si acaso.",
  },
  {
    left: "Linaje completo",
    leftText: "Rastrear todas las copias.",
    right: "Costo",
    rightText: "Rastrear todo cuesta.",
    resolution: "Priorizar los datos y flujos de mayor riesgo y automatizar el descubrimiento de a poco.",
  },
  {
    left: "Retención",
    leftText: "Conservar indefinidamente aumenta la exposición.",
    right: "Auditoría y recuperación",
    rightText: "Borrar demasiado pronto puede afectar obligaciones legítimas de conservación.",
    resolution: "La política se aprueba y debe poder ejecutarse.",
  },
  {
    left: "Seguridad",
    leftText: "Tokenización, máscaras y controles finos.",
    right: "Rendimiento",
    rightText: "Agregan latencia y complejidad.",
    resolution: "Se diseñan con pruebas de carga y análisis de riesgo.",
  },
  {
    left: "Matriz detallada",
    leftText: "Una fila por requisito, con el detalle en las fichas hijas.",
    right: "Mantenible",
    rightText: "Exigir evidencia reciente cuesta.",
    resolution: "Es lo que demuestra que el control funciona.",
  },
];

export function TradeOffs({ closing }: { closing?: string }) {
  return (
    <section className="ficha-block trade-offs" aria-label="Trade-offs">
      <p className="trade-mark">
        <ArchitectureDot />
      </p>
      <ol className="trade-list">
        {PAIRS.map((pair) => (
          <li key={pair.left} className="trade-pair">
            <div className="trade-side">
              <h3>{pair.left}</h3>
              <p>{pair.leftText}</p>
            </div>
            <span className="trade-vs" aria-hidden="true">
              →
            </span>
            <div className="trade-side">
              <h3>{pair.right}</h3>
              <p>{pair.rightText}</p>
            </div>
            <p className="trade-resolution">
              <strong>Se resuelve con</strong> {pair.resolution}
            </p>
          </li>
        ))}
      </ol>
      {closing ? <p className="trade-closing">{closing}</p> : null}
    </section>
  );
}
