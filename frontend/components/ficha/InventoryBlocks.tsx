import type { Views } from "@/lib/views";

import { RichText } from "./RichText";
import "./inventory-views.css";

type V = Required<Views>;

/** ADR-030 enmienda 9 · §1: lo que construyes con la ficha, en tarjetas numeradas. */
export function BuildCards({ view }: { view: V["build_cards"] }) {
  return (
    <section className="inv-view" aria-label={view.title}>
      <h3 className="inv-kicker-title">{view.title}</h3>
      <ol className="inv-build">
        {view.items.map((item, index) => (
          <li key={item.title}>
            <span className="inv-build-n" aria-hidden="true">
              {index + 1}
            </span>
            <b>{item.title}</b>
            <p>
              <RichText text={item.text} />
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** ADR-030 enmienda 9 · §2: pregunta, lo que se espera y dónde se anota. Encabezado único en escritorio; rótulos por bloque en móvil. */
export function LawLadder({ view }: { view: V["law_ladder"] }) {
  const [question, expected, record] = view.headers;
  return (
    <ol className="inv-view inv-ladder">
      <li className="inv-ladder-head" aria-hidden="true">
        {view.headers.map((header) => (
          <span key={header}>{header}</span>
        ))}
      </li>
      {view.rows.map((row) => (
        <li key={row.question} className={row.risk ? "inv-ladder-row is-risk" : "inv-ladder-row"}>
          <div className="inv-ladder-q">
            <i className="inv-ladder-label">{question}</i>
            <span className="inv-ladder-question">{row.question}</span>
            <b>{row.principle}</b>
            {row.cites && row.cites.length > 0 ? (
              <span className="inv-ladder-cites">
                {row.cites.map((cite) => (
                  <RichText key={cite} text={cite} />
                ))}
              </span>
            ) : null}
          </div>
          <div className="inv-ladder-text">
            <i className="inv-ladder-label">{expected}</i>
            <p>
              <RichText text={row.expected} />
            </p>
            {row.interpretation ? (
              <p className="inv-ladder-interp">
                <RichText text={row.interpretation} />
              </p>
            ) : null}
          </div>
          <div className="inv-ladder-record">
            <i className="inv-ladder-label">{record}</i>
            <p>
              <RichText text={row.record} />
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** ADR-030 enmienda 9 · Problema: el mismo pedido sin y con inventario. */
export function CaseCompare({ view }: { view: V["case_compare"] }) {
  const [without, withInventory] = view.headers;
  return (
    <div className="inv-view">
      {view.lead ? (
        <p className="inv-lead">
          <RichText text={view.lead} />
        </p>
      ) : null}
      <div className="inv-case" role="table" aria-label={view.request.kicker}>
        <div className="inv-case-request">
          <span>{view.request.kicker}</span>
          <b>
            <RichText text={view.request.text} />
          </b>
        </div>
        <div className="inv-case-row is-head" role="row">
          <span role="columnheader" />
          <span role="columnheader" className="is-bad">
            {without}
          </span>
          <span role="columnheader" className="is-ok">
            {withInventory}
          </span>
        </div>
        {view.rows.map((row) => (
          <div key={row.label} className="inv-case-row" role="row">
            <span role="rowheader" className="inv-case-label">
              {row.label}
            </span>
            <span role="cell" className="inv-case-cell is-bad" data-c={without}>
              <b aria-hidden="true">✕</b>
              <span>
                <RichText text={row.without} />
              </span>
            </span>
            <span role="cell" className="inv-case-cell is-ok" data-c={withInventory}>
              <b aria-hidden="true">✓</b>
              <span>
                <RichText text={row.with} />
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** ADR-030 enmienda 9 · Cómo funciona: dos carriles de pasos con caso, evidencia y lo que no demuestra. */
export function CycleLanes({ view }: { view: V["cycle_lanes"] }) {
  return (
    <div className="inv-view inv-cycle">
      {view.intro ? (
        <p className="inv-lead">
          <RichText text={view.intro} />
        </p>
      ) : null}
      {view.lanes.map((lane) => (
        <section key={lane.title} className="inv-lane" aria-label={lane.title}>
          <header>
            <b>{lane.title}</b>
            <span>{lane.lead}</span>
          </header>
          <ol>
            {lane.steps.map((step) => (
              <li key={step.number} id={step.id}>
                <span className="inv-lane-n">{step.number}</span>
                <b>{step.title}</b>
                <p>
                  <RichText text={step.text} />
                </p>
                <p className="inv-lane-case">
                  <i>{view.labels.case}</i>
                  <RichText text={step.case} />
                </p>
                <p className="inv-lane-evidence">
                  <i>{view.labels.evidence}</i>
                  <RichText text={step.evidence} />
                </p>
                <p className="inv-lane-limit">
                  <i>{view.labels.limit}</i>
                  <RichText text={step.limit} />
                </p>
              </li>
            ))}
          </ol>
        </section>
      ))}
      <p className="inv-loop">
        <span aria-hidden="true">↺</span>
        {view.loop}
      </p>
    </div>
  );
}
