import "./ficha-blocks.css";

const STAGES: { title: string; detail: string; gap: string; gapMark: string; control: string }[] = [
  {
    title: "Ingesta",
    detail: "fuente → bronze",
    gap: "Copias sin registro: no se sabe dónde está",
    gapMark: "?",
    control: "Linaje e índice de titulares",
  },
  {
    title: "Consumo",
    detail: "silver · gold",
    gap: "Accesos amplios: no se sabe quién la vio",
    gapMark: "?",
    control: "Acceso por finalidad, revisado y fechado",
  },
  {
    title: "Almacenamiento",
    detail: "tablas · respaldos",
    gap: "Tablas que no se pueden borrar",
    gapMark: "×",
    control: "Supresión consistente entre capas y respaldos",
  },
  {
    title: "Reproceso",
    detail: "backfill · replay",
    gap: "El backfill reintroduce lo suprimido",
    gapMark: "×",
    control: "El replay respeta las supresiones",
  },
  {
    title: "Auditoría",
    detail: "revisión · incidente",
    gap: "Ninguna evidencia de qué se hizo",
    gapMark: "?",
    control: "Evidencia fechada en la CI",
  },
];

export function ProblemJourney() {
  return (
    <section className="ficha-block problem-journey" aria-label="Problema que resuelve">
      <div className="problem-question">
        <p className="problem-kicker">La pregunta central</p>
        <p>¿Podemos reconstruir qué ocurrió con los datos de una persona y demostrar qué medidas se aplicaron?</p>
      </div>
      <p className="problem-lead">
        Sin traducción técnica, la ley queda en un documento. Así se ve el recorrido de los datos de una persona por la
        plataforma:
      </p>
      <div className="problem-scroll">
        <div className="problem-grid">
          <p className="problem-label">Recorrido</p>
          {STAGES.map((stage) => (
            <p key={stage.title} className="problem-stage">
              <span>{stage.title}</span>
              <small>{stage.detail}</small>
            </p>
          ))}
          <p className="problem-label problem-label-gap">Sin controles</p>
          {STAGES.map((stage) => (
            <p key={`${stage.title}-gap`} className="problem-gap">
              <span className="problem-mark" aria-hidden="true">
                {stage.gapMark}
              </span>
              <span>{stage.gap}</span>
            </p>
          ))}
          <p className="problem-label problem-label-ok">Con controles</p>
          {STAGES.map((stage) => (
            <p key={`${stage.title}-ok`} className="problem-ok">
              <span className="problem-mark" aria-hidden="true">
                ✓
              </span>
              <span>{stage.control}</span>
            </p>
          ))}
        </div>
      </div>
      <p className="problem-note">
        Cada control de la fila inferior está en la matriz de control y, los de acceso, retención, minimización y
        supresión, en el código.
      </p>
    </section>
  );
}
