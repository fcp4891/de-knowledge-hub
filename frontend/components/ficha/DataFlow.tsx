import "./ficha-blocks.css";

export function DataFlow({ steps }: { steps: string[] }) {
  return (
    <ol className="ficha-block data-flow" aria-label="Flujo de las actividades de tratamiento">
      {steps.map((step, index) => (
        <li key={step}>
          <span className="data-flow-step">{step}</span>
          {index < steps.length - 1 ? (
            <span className="data-flow-arrow" aria-hidden="true">
              ›
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
