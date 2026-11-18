"use client";

import { useId, useState } from "react";

import type { Views } from "@/lib/views";

import { RichText } from "./RichText";
import "./inventory-views.css";

type View = NonNullable<Views["activity_explorer"]>;

const READ_CLASS = { needed: "is-needed", extra: "is-extra", unevaluated: "is-unevaluated" } as const;

/** ADR-030 enmienda 9 · Qué es: las cuatro piezas de una actividad y la conciliación, con los datos del código (actual). */
export function ActivityExplorer({ view }: { view: View }) {
  const [active, setActive] = useState(view.activities[0]?.key ?? "");
  const id = useId();
  const activity = view.activities.find((item) => item.key === active) ?? view.activities[0];
  if (!activity) return null;
  const { rows, labels } = view;
  const gapLabel = (activity.gaps.length === 1 ? labels.gaps_one : labels.gaps_many).replace("{n}", String(activity.gaps.length));
  return (
    <div className="inv-view inv-explorer">
      {view.lead ? (
        <p className="inv-lead">
          <RichText text={view.lead} />
        </p>
      ) : null}
      <div className="inv-kinds">
        {view.kinds.map((kind) => (
          <div key={kind.kicker} className={kind.highlight ? "is-highlight" : undefined}>
            <i>{kind.kicker}</i>
            <b>{kind.question}</b>
            <span>{kind.text}</span>
          </div>
        ))}
      </div>
      <p className="inv-sub">
        <RichText text={view.intro} />
      </p>
      <div className="inv-acts" role="tablist" aria-label={rows.activity.title}>
        {view.activities.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            id={`${id}-${item.key}`}
            aria-selected={item.key === activity.key}
            aria-controls={`${id}-panel`}
            onClick={() => setActive(item.key)}
          >
            <code>{item.key}</code>
            <span>{item.name}</span>
          </button>
        ))}
      </div>
      <div className="inv-entity" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${activity.key}`}>
        <div className="inv-entity-row">
          <div className="inv-entity-head">
            <b>{rows.activity.title}</b>
            <span>{rows.activity.detail}</span>
          </div>
          <div className="inv-entity-value">
            <p>
              <b>{activity.purpose}</b>
            </p>
            <dl className="inv-kv">
              {activity.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value ?? <em className="inv-pending">{labels.pending}</em>}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="inv-entity-row">
          <div className="inv-entity-head">
            <b>{rows.asset.title}</b>
            <span>{rows.asset.detail}</span>
          </div>
          <div className="inv-entity-value">
            <p>
              <code>{view.asset}</code> · {labels.needs}
            </p>
            <div className="inv-cols">
              {activity.fields.length > 0 ? (
                activity.fields.map((field) => (
                  <i key={field} className="is-on">
                    {field}
                  </i>
                ))
              ) : (
                <em className="inv-pending">{labels.no_fields}</em>
              )}
            </div>
          </div>
        </div>
        <div className="inv-entity-row">
          <div className="inv-entity-head">
            <b>{rows.consumer.title}</b>
            <span>{rows.consumer.detail}</span>
          </div>
          <div className="inv-entity-value">
            <p>
              <code>{activity.consumer}</code>{" "}
              <span className="inv-muted">
                ({labels.account} {activity.account})
              </span>{" "}
              · {labels.read}
            </p>
            <div className="inv-cols">
              {activity.read.map((item) => (
                <i key={item.column} className={READ_CLASS[item.state as keyof typeof READ_CLASS]}>
                  {item.column}
                </i>
              ))}
            </div>
          </div>
        </div>
        <div className="inv-entity-row">
          <div className="inv-entity-head">
            <b>{rows.evidence.title}</b>
            <span>{rows.evidence.detail}</span>
          </div>
          <div className="inv-entity-value">
            <p className={activity.evidence_ok ? "is-good" : "is-bad"}>{activity.evidence}</p>
          </div>
        </div>
        <div className={activity.gaps.length > 0 ? "inv-entity-row is-result" : "inv-entity-row is-result is-clean"}>
          <div className="inv-entity-head">
            <b>{rows.result.title}</b>
            <span>{rows.result.detail}</span>
          </div>
          <div className="inv-entity-value" aria-live="polite">
            {activity.gaps.length > 0 ? (
              <>
                <p className="is-bad">
                  <b>{gapLabel}</b>
                </p>
                <ul className="inv-gaps">
                  {activity.gaps.map((gap) => (
                    <li key={gap}>
                      <code>BRECHA {gap}</code>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="is-good">{activity.ok}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
