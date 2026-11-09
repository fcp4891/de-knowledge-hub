import "./ficha-blocks.css";

const BARS = [1, 2, 3] as const;

const DETAIL: Record<string, { article: string; examples: string[] }> = {
  Leve: {
    article: "art. 34 bis",
    examples: [
      "Omitir la respuesta o responder en forma incompleta o fuera de plazo las solicitudes de titulares",
      "Omitir comunicaciones obligatorias a la Agencia",
    ],
  },
  Grave: {
    article: "art. 34 ter",
    examples: [
      "Tratar datos innecesarios para los fines",
      "Tratar datos inexactos, incompletos o desactualizados",
      "Impedir u obstaculizar el ejercicio de los derechos",
      "Infringir las obligaciones de seguridad",
      "Omitir las comunicaciones o registros de vulneraciones",
      "Transferencias internacionales contra la ley",
    ],
  },
  Gravísima: {
    article: "art. 34 quáter",
    examples: [
      "Omitir en forma deliberada la comunicación de vulneraciones",
      "Transferencias internacionales contra la ley, a sabiendas",
      "Tratar a sabiendas datos sensibles o de niños, niñas y adolescentes contra la ley",
      "No hacer la evaluación de impacto cuando corresponde (art. 15 ter)",
    ],
  },
};

const ADJUSTMENTS: { tone: "up" | "down"; title: string; text: string; article: string }[] = [
  {
    tone: "up",
    title: "Sin corregir en 60 días",
    text: "Si no se adoptan las medidas que fija la Agencia, recargo de 50 % a la multa.",
    article: "art. 35",
  },
  {
    tone: "up",
    title: "Reincidencia",
    text: "Dos o más sanciones en los últimos 30 meses: hasta tres veces el monto de la infracción.",
    article: "arts. 35 y 36",
  },
  {
    tone: "up",
    title: "Empresa que no es de menor tamaño",
    text: "Si reincide en graves o gravísimas: la más gravosa entre el triple y el 2 % o 4 % de sus ingresos anuales.",
    article: "art. 35",
  },
  {
    tone: "down",
    title: "Modelo de prevención certificado",
    text: "Haber cumplido diligentemente los deberes de dirección y supervisión, verificado con el certificado del modelo.",
    article: "art. 36 n.º 5 · art. 51",
  },
];

export function SeverityCards({
  levels,
}: {
  levels: { name: string; level: 1 | 2 | 3; amount: string; note?: string; examples: string[] }[];
}) {
  return (
    <section className="ficha-block severity" aria-label="Sanciones">
      <ul className="severity-list">
        {levels.map((item) => {
          const detail = DETAIL[item.name];
          const examples = detail?.examples ?? item.examples;
          return (
            <li key={item.name} className="severity-card" data-level={item.level}>
              <header>
                <h3>
                  {item.name}
                  {detail ? <small>{detail.article}</small> : null}
                </h3>
                <div className="severity-meter" role="img" aria-label={`Gravedad ${item.level} de 3`}>
                  {BARS.map((bar) => (
                    <span key={bar} className="severity-bar" data-on={bar <= item.level ? "true" : "false"} />
                  ))}
                </div>
              </header>
              <p className="severity-amount">{item.amount}</p>
              {item.note ? <p className="severity-note">{item.note}</p> : null}
              <p className="severity-kicker">Ejemplos con origen técnico</p>
              <ul>
                {examples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
      <ul className="severity-adjustments">
        {ADJUSTMENTS.map((item) => (
          <li key={item.title}>
            <article data-tone={item.tone}>
              <p className="severity-adjust-kicker">{item.tone === "up" ? "Aumenta" : "Atenúa"}</p>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <span>{item.article}</span>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
