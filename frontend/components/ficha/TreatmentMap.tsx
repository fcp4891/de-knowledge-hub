import type { TreatmentMapProps } from "@/lib/views";

import { CiteList, RichText } from "./RichText";
import "./ficha-blocks.css";

export function TreatmentMap({ lead, lawLabel, techLabel, verbs, conclusion, note, sources }: TreatmentMapProps) {
  return (
    <section className="ficha-block treatment-map" aria-label="Qué implica para Ingeniería de Datos">
      <p className="treatment-map-lead">
        <RichText text={lead} />
      </p>
      <div className="treatment-map-scroll">
        <div className="treatment-map-grid">
          <p className="treatment-map-label">
            <span>{lawLabel.title}</span>
            {lawLabel.detail ? <small>{lawLabel.detail}</small> : null}
          </p>
          {verbs.map((item) => (
            <p key={item.verb} className="treatment-map-verb">
              {item.verb}
            </p>
          ))}
          <p className="treatment-map-label">
            <span>{techLabel.title}</span>
            {techLabel.detail ? <small>{techLabel.detail}</small> : null}
          </p>
          {verbs.map((item) => (
            <p key={`${item.verb}-practice`} className="treatment-map-practice">
              <span>{item.practice}</span>
              <small>{item.examples}</small>
            </p>
          ))}
        </div>
      </div>
      <p className="treatment-map-callout">{conclusion}</p>
      <p className="treatment-map-note">
        <RichText text={note} />
      </p>
      <CiteList className="treatment-map-sources" sources={sources} />
    </section>
  );
}
