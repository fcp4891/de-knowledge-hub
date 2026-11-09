"use client";

import { useState } from "react";

import "./ficha-blocks.css";

type Stage = {
  title: string;
  detail?: string;
  pill?: string;
  tone: "end" | "layer";
};

const STAGES: Stage[] = [
  { title: "Ingesta con contrato", pill: "Minimización", tone: "end" },
  { title: "Bronze", detail: "crudo, solo campos permitidos", tone: "layer" },
  { title: "Silver", pill: "Seudonimización", tone: "layer" },
  { title: "Gold", detail: "agregado por producto", tone: "layer" },
  { title: "Consumo por finalidad", pill: "Finalidad", tone: "end" },
];

const STEPS: { number: string; title: string; items: string[] }[] = [
  {
    number: "1",
    title: "Recolectar el estado",
    items: ["Configuración y permisos", "Datos por capa y respaldos", "Solicitudes de titulares atendidas"],
  },
  {
    number: "2",
    title: "Evaluar controles",
    items: [
      "Cada control aplica una regla definida y responde PASS, FAIL o UNKNOWN",
      "UNKNOWN (falta el dato) no cuenta como PASS",
    ],
  },
  {
    number: "3",
    title: "Validar la evidencia",
    items: [
      "Completa: están todos los controles",
      "Reciente: dentro del plazo de la política",
      "Íntegra: no se alteró después de generarse",
    ],
  },
];

const EXAMPLE: { title: string; items: { text: string; code?: string }[] }[] = [
  {
    title: "@paso 1 · Datos",
    items: [
      { text: "Warehouse y source ficticios" },
      { text: "Usuarios activos e inactivos" },
      { text: "Tombstones de supresiones" },
    ],
  },
  {
    title: "@paso 2 · Controles",
    items: [
      { text: "Todo consumo declara una finalidad aprobada", code: "purpose_check" },
      { text: "Solo columnas aprobadas", code: "schema_minimization" },
      { text: "Sin datos vencidos, tampoco tras un replay", code: "retention_check" },
      { text: "Ningún usuario inactivo con acceso", code: "access_review" },
      { text: "Lo suprimido no reaparece al reprocesar", code: "erasure_replay_check" },
    ],
  },
  {
    title: "@paso 3 · Validación",
    items: [
      { text: "Cada control aparece una vez" },
      { text: "Evidencia de 30 días o menos (política de ejemplo)" },
      { text: "Huella SHA-256 igual a la guardada" },
    ],
  },
  {
    title: "@paso 4 · Resultado",
    items: [
      { text: "Salida 0: la CI aprueba" },
      { text: "Salida 1: la CI rechaza" },
      { text: "6 escenarios: 1 aprueba y 5 rechazan" },
    ],
  },
];

function Arrow() {
  return (
    <span className="control-evidence-arrow" aria-hidden="true">
      →
    </span>
  );
}

function DataCirculation() {
  return (
    <div className="control-evidence-flow">
      <p className="control-evidence-kicker">
        Datos
        <br />
        cómo circulan
      </p>
      <div>
        <ol>
          {STAGES.map((stage, index) => (
            <li key={stage.title}>
              <article className={stage.tone === "end" ? "is-end" : "is-layer"}>
                <strong>{stage.title}</strong>
                {stage.detail ? <span>{stage.detail}</span> : null}
                {stage.pill ? <em>{stage.pill}</em> : null}
              </article>
              {index < STAGES.length - 1 ? <Arrow /> : null}
            </li>
          ))}
        </ol>
        <p className="control-evidence-banner">Retención y supresión en todas las capas, respaldos y reprocesos</p>
      </div>
    </div>
  );
}

const LEGEND = ["el contrato fija los campos permitidos", "el plazo define la purga", "la finalidad autoriza el consumo"];

export function RequirementToData() {
  return (
    <section className="ficha-block control-evidence" aria-label="Del requisito al dato">
      <h3>Del requisito al dato</h3>
      <p className="control-evidence-lead">
        Arquitectura de referencia ilustrativa: dónde se ubica cada control en una plataforma por capas.
      </p>
      <div className="control-evidence-scroll">
        <div className="control-evidence-flow">
          <p className="control-evidence-kicker">
            Gobierno
            <br />
            qué se permite
          </p>
          <div className="requirement-gov-wrap">
            <ol className="requirement-gov">
              <li>
                <article>
                  <strong>Legal y negocio</strong>
                  <span>finalidad, base de licitud, plazo</span>
                </article>
              </li>
              <li className="requirement-gov-arrow">
                <Arrow />
              </li>
              <li>
                <article>
                  <strong>Catálogo de actividades</strong>
                  <span>metadatos por actividad</span>
                </article>
              </li>
            </ol>
            <p className="requirement-legend">
              {LEGEND.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </p>
          </div>
        </div>
        <DataCirculation />
      </div>
    </section>
  );
}

export function ControlEvidence() {
  const [exampleOpen, setExampleOpen] = useState(false);
  return (
    <section className="ficha-block control-evidence" aria-label="Control y evidencia">
      <h3>Control y evidencia</h3>
      <p className="control-evidence-lead">
        Patrón de cumplimiento continuo (<em>policy as code</em>): cómo una plataforma demuestra que sus controles funcionan.
      </p>

      <div className="control-evidence-scroll">
        <ol className="control-evidence-steps">
          {STEPS.map((step) => (
            <li key={step.number}>
              <article>
                <span>{step.number}</span>
                <h4>{step.title}</h4>
                <ul>
                  {step.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <Arrow />
            </li>
          ))}
          <li>
            <article>
              <span>4</span>
              <h4>Decidir y registrar</h4>
              <ul className="control-evidence-outcomes">
                <li className="is-pass">Sin brechas · se aprueba</li>
                <li className="is-fail">Con brechas · se rechaza</li>
                <li className="is-keep">En ambos casos se guarda la evidencia fechada</li>
              </ul>
            </article>
          </li>
        </ol>
      </div>

      <p className="control-evidence-note">
        Herramientas como Open Policy Agent, AWS Config o Azure Policy implementan este patrón; ninguna certifica cumplimiento por sí sola.
      </p>

      <div className="control-evidence-example">
        <button
          type="button"
          className="control-evidence-example-toggle"
          aria-expanded={exampleOpen}
          onClick={() => setExampleOpen((open) => !open)}
        >
          Ver ejemplo con el código de la ficha
        </button>
        {exampleOpen ? (
          <>
            <div className="control-evidence-scroll">
              <ol className="control-evidence-code">
                {EXAMPLE.map((step, index) => (
                  <li key={step.title}>
                    <article>
                      <h4>{step.title}</h4>
                      <ul>
                        {step.items.map((item) => (
                          <li key={item.text}>
                            {item.text}
                            {item.code ? <code>{item.code}</code> : null}
                          </li>
                        ))}
                      </ul>
                    </article>
                    {index < EXAMPLE.length - 1 ? <Arrow /> : null}
                  </li>
                ))}
              </ol>
            </div>
            <p>Cubre 5 de los 7 requisitos de la matriz; vulneraciones y transferencias se verifican fuera de este ejemplo.</p>
          </>
        ) : null}
      </div>
    </section>
  );
}
