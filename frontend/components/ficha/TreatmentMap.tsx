import "./ficha-blocks.css";

const LAW_URL = "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01";
const LAW_21719_URL = "https://www.bcn.cl/leychile/navegar?idNorma=1209272";
const GDPR_URL = "https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807";

const VERBS: { verb: string; practice: string; examples: string }[] = [
  { verb: "Recolectar", practice: "Recolección e ingesta", examples: "APIs · CDC · archivos" },
  { verb: "Procesar", practice: "Transformación, integración y consulta", examples: "bronze → gold" },
  { verb: "Almacenar", practice: "Tablas, respaldos y retención", examples: "lakehouse · backups" },
  { verb: "Comunicar", practice: "Exportaciones y entrega a terceros", examples: "archivos · APIs externas" },
  { verb: "Transmitir", practice: "Envíos entre sistemas y réplicas", examples: "fuera de Chile: revisar art. 27" },
  { verb: "Utilizar", practice: "Dashboards, modelos e IA", examples: "reportes · entrenamiento" },
];

export function TreatmentMap() {
  return (
    <section className="ficha-block treatment-map" aria-label="Qué implica para Ingeniería de Datos">
      <p className="treatment-map-lead">
        Para la ley, <strong>tratamiento</strong> es cualquier operación que permita recolectar, procesar, almacenar,
        comunicar, transmitir o utilizar datos personales (
        <a href={LAW_URL} target="_blank" rel="noopener noreferrer">
          art. 2 letra o
        </a>
        ). En una plataforma de datos, esos verbos se ven así:
      </p>
      <div className="treatment-map-scroll">
        <div className="treatment-map-grid">
          <p className="treatment-map-label">
            <span>Ley</span>
            <small>art. 2 letra o</small>
          </p>
          {VERBS.map((item) => (
            <p key={item.verb} className="treatment-map-verb">
              {item.verb}
            </p>
          ))}
          <p className="treatment-map-label">
            <span>Ingeniería de datos</span>
            <small>interpretación técnica</small>
          </p>
          {VERBS.map((item) => (
            <p key={`${item.verb}-practice`} className="treatment-map-practice">
              <span>{item.practice}</span>
              <small>{item.examples}</small>
            </p>
          ))}
        </div>
      </div>
      <p className="treatment-map-callout">
        Por eso, cualquier actividad de un pipeline que toque datos personales es tratamiento.
      </p>
      <p className="treatment-map-note">
        La fila de ingeniería es una interpretación técnica, no texto legal: una misma actividad puede caer en más de un
        verbo. Borrar también es una operación sobre los datos; el RGPD lo incluye expresamente en su definición de
        tratamiento (
        <a href={GDPR_URL} target="_blank" rel="noopener noreferrer">
          RGPD art. 4.2, referencia comparada
        </a>
        ).
      </p>
      <ul className="treatment-map-sources">
        <li>
          <a href={LAW_21719_URL} target="_blank" rel="noopener noreferrer">
            Ley 21.719
          </a>
          <span> · Diario Oficial, 2024-12-13 · Legislación · Nivel 1 · art. 2 letra o), definición de tratamiento</span>
        </li>
        <li>
          <a href={GDPR_URL} target="_blank" rel="noopener noreferrer">
            Reglamento (UE) 2016/679 (RGPD)
          </a>
          <span> · BOE · Legislación comparada · Nivel 1 · art. 4.2</span>
        </li>
      </ul>
    </section>
  );
}
