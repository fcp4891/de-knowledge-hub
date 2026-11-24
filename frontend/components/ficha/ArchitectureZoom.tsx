import type { ArchitectureZoomProps, ZoomCard, ZoomChip, ZoomDecision, ZoomRegister, ZoomTone } from "@/lib/views";
import { withBasePath } from "@/lib/basePath";
import { breakAtUnderscores } from "@/lib/breakUnderscores";

import { DataCirculation, GovernanceLane } from "./ControlEvidence";
import { BadgeIcon, Glyph, type GlyphName } from "./DocIcon";
import { RichText } from "./RichText";
import { ZoomWedge } from "./ZoomWedge";
import "./ficha-blocks.css";

/** ADR-030 enmienda 12: un componente base (recorte de la madre, cuña y panel) con dos variantes en el panel:
 * `register` (registro con usos, Inventario) y `decision` (decisión con rama, identificación de datos personales). */

const TONE_GLYPH: Record<ZoomTone, GlyphName> = {
  open: "lock-open",
  lock: "lock",
  block: "ban",
  alert: "alert",
  info: "help",
  pass: "check",
};

function Chip({ chip }: { chip: ZoomChip }) {
  return (
    <span className={`zoom-chip is-${chip.tone}`}>
      <Glyph name={TONE_GLYPH[chip.tone]} />
      <span className="zoom-chip-text">
        <RichText text={chip.text} />
      </span>
    </span>
  );
}

function Fragment({ lane, laneKicker, boxes }: Pick<ArchitectureZoomProps, "lane" | "laneKicker" | "boxes">) {
  if (boxes.length === 0 || !laneKicker) {
    return null;
  }
  return (
    <div className="zoom-map">
      <div className="requirement-to-data zoom-source">
        <div className="control-evidence-scroll">
          {lane === "governance" ? (
            <GovernanceLane kicker={laneKicker} items={boxes} />
          ) : (
            <DataCirculation data={{ kicker: laneKicker, stages: boxes, banners: [] }} />
          )}
        </div>
      </div>
      <ZoomWedge />
    </div>
  );
}

function Register({ register }: { register: ZoomRegister }) {
  return (
    <>
      <div className="zoom-register">
        <div className="zoom-card-head">
          <BadgeIcon glyph="doc" size="card" />
          <strong>{register.title}</strong>
          <span className="zoom-tag">{register.tag}</span>
        </div>
        <p className="zoom-line">
          <Glyph name="building" />
          <span>
            <strong>{register.writers.label}:</strong> {register.writers.text}
          </span>
        </p>
        <p className="zoom-line is-scope">
          <Glyph name="map-pin" />
          <span>
            {register.scope.name}: {register.scope.text}
          </span>
        </p>
        <div className="zoom-groups">
          {register.groups.map((group) => (
            <div key={group.title}>
              <h4>{group.title}</h4>
              <ul>
                {group.fields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <p className="zoom-bus">
        <span>{register.bus}</span>
      </p>
      <ul className="zoom-uses">
        {register.uses.map((use) => (
          <li key={use.title} className="zoom-card">
            <div className="zoom-card-head">
              <BadgeIcon glyph={use.icon} size="card" />
              <strong>{use.title}</strong>
            </div>
            <code>{breakAtUnderscores(use.code)}</code>
            <p>
              <RichText text={use.text} />
            </p>
            {use.result ? (
              <p className="zoom-result">
                <Chip chip={use.result} />
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  );
}

function Card({ card }: { card: ZoomCard }) {
  return (
    <article className={`zoom-card${card.gate ? " is-gate" : ""}${card.chip ? ` is-branch is-${card.chip.tone}` : ""}`}>
      {card.chip ? <Chip chip={card.chip} /> : null}
      <div className="zoom-card-head">
        <span className="zoom-number">{card.number}</span>
        <strong>{card.title}</strong>
      </div>
      {card.code ? <code>{breakAtUnderscores(card.code)}</code> : null}
      {card.items?.map((item) => (
        <p key={item}>{item}</p>
      ))}
      {card.evidence ? (
        <ul className="zoom-evidence">
          {card.evidence.map((item) => (
            <li key={item.text}>
              <Glyph name={item.icon} />
              {item.text}
            </li>
          ))}
        </ul>
      ) : null}
      {card.outputs ? (
        <p className="zoom-outputs">
          {card.outputs.map((output) => (
            <Chip key={output.text} chip={output} />
          ))}
        </p>
      ) : null}
    </article>
  );
}

function Decision({ decision }: { decision: ZoomDecision }) {
  return (
    <>
      {decision.phases.map((phase) => (
        <div key={phase.title} className="zoom-phase">
          <p className="zoom-phase-title">{phase.title}</p>
          <ol className={`zoom-row is-${phase.layout} has-${phase.cards.length}`}>
            {phase.cards.flatMap((card, index) => [
              ...(phase.layout === "flow" && index > 0
                ? [
                    <li key={`${card.number}-arrow`} className="zoom-arrow" aria-hidden="true">
                      →
                    </li>,
                  ]
                : []),
              <li key={card.number}>
                <Card card={card} />
              </li>,
            ])}
          </ol>
        </div>
      ))}
      <p className="zoom-note">{decision.note}</p>
    </>
  );
}

export function ArchitectureZoom(props: ArchitectureZoomProps) {
  const { kicker, back, title, lead, register, decision } = props;
  return (
    <section className="ficha-block architecture-zoom" aria-label={kicker}>
      <p className="zoom-kicker">
        <span>{kicker}</span>
        <a href={withBasePath(back.href)}>{back.label}</a>
      </p>
      <Fragment lane={props.lane} laneKicker={props.laneKicker} boxes={props.boxes} />
      <div className="zoom-panel">
        <h3>{title}</h3>
        <p className="zoom-lead">{lead}</p>
        {register ? <Register register={register} /> : null}
        {decision ? <Decision decision={decision} /> : null}
      </div>
    </section>
  );
}
