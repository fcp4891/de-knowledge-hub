import "./ficha-blocks.css";

const ISO_27001 = "https://www.iso.org/standard/27001";
const ISO_27701 = "https://www.iso.org/standard/27701";
const NIST = "https://www.nist.gov/privacy-framework";

const STEPS: { number: string; title: string; detail: string; example: string; reference: string }[] = [
  {
    number: "01",
    title: "Requisito normativo",
    detail: "Qué exige la ley",
    example: "Minimización: solo los datos necesarios",
    reference: "4.2 · A.5.31 requisitos legales",
  },
  {
    number: "02",
    title: "Riesgo identificado",
    detail: "Qué puede fallar en la plataforma",
    example: "Columnas no aprobadas llegan a capas analíticas",
    reference: "6.1.2 evaluación de riesgos",
  },
  {
    number: "03",
    title: "Control técnico",
    detail: "Qué lo previene o detecta",
    example: "Contrato de campos permitidos",
    reference: "6.1.3 · Anexo A tratamiento y controles",
  },
  {
    number: "04",
    title: "Verificación",
    detail: "Cómo se prueba que funciona",
    example: "Test de esquema en CI",
    reference: "9.1 · 9.2 medición y auditoría",
  },
  {
    number: "05",
    title: "Evidencia",
    detail: "Qué queda para demostrarlo",
    example: "Resultado del test y versión del contrato",
    reference: "7.5 información documentada",
  },
];

export function ApproachBoard({ title, intro }: { title: string; intro: string }) {
  return (
    <section className="approach-board" aria-label={title}>
      <div className="markdown">
        <h3>{title}</h3>
        <p>{intro}</p>
      </div>
      <div className="approach-scroll">
        <div className="approach-grid">
          <p className="approach-label">
            Paso
          </p>
          {STEPS.map((step) => (
            <p key={step.number} className="approach-step">
              <span className="approach-number">{step.number}</span>
              <span className="approach-step-title">{step.title}</span>
              <small>{step.detail}</small>
            </p>
          ))}
          <p className="approach-label">
            Ejemplo
            <small>fila de la matriz</small>
          </p>
          {STEPS.map((step) => (
            <p key={`${step.number}-example`} className="approach-example">
              {step.example}
            </p>
          ))}
          <p className="approach-label">
            Referencia
            <small>ISO/IEC 27001:2022</small>
          </p>
          {STEPS.map((step) => (
            <p key={`${step.number}-ref`} className="approach-ref">
              {step.reference}
            </p>
          ))}
        </div>
      </div>
      <div className="approach-points">
        <p>
          <strong>De dónde viene</strong>
          <span>
            Es una adaptación propia de la lógica de gestión de riesgos de ISO/IEC 27001, que ISO/IEC 27701 extiende a
            datos personales, y del NIST Privacy Framework.
          </span>
        </p>
        <p>
          <strong>Por qué se ajusta</strong>
          <span>
            La ley fija principios y deberes, pero en general no prescribe tecnologías ni arquitecturas; el enfoque
            convierte cada obligación en un control que un pipeline puede ejecutar y probar, y la ficha lo aplica igual
            en la matriz de control y en el código.
          </span>
        </p>
      </div>
      <ul className="approach-sources">
        <li>
          <a href={ISO_27001} target="_blank" rel="noopener noreferrer">
            ISO/IEC 27001:2022
          </a>
          <span> · Norma · Nivel 1 · cláusulas 4.2, 6.1.2, 6.1.3, 7.5, 9.1, 9.2; controles A.5.31 y A.5.34</span>
        </li>
        <li>
          <a href={ISO_27701} target="_blank" rel="noopener noreferrer">
            ISO/IEC 27701
          </a>
          <span> · Norma · Nivel 1 · extensión de privacidad</span>
        </li>
        <li>
          <a href={NIST} target="_blank" rel="noopener noreferrer">
            NIST Privacy Framework
          </a>
          <span> · Marco · Nivel 1</span>
        </li>
      </ul>
    </section>
  );
}
