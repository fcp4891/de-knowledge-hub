/**
 * Render de respaldo de las vistas del ADR-030, sin estilos propios: listas y párrafos dentro de `.markdown`.
 * Se reemplaza en la fase 2 por los componentes de diseño (CentralIdea, VigenciaTimeline, PracticeLanes,
 * SeverityCards, SourcesGrouped y los pasos size="lg"), que reciben las mismas props.
 */
import type {
  ApproachProps,
  CentralIdeaProps,
  PracticeLanesProps,
  SeverityCardsProps,
  SourcesGroupedProps,
  VigenciaTimelineProps,
} from "@/lib/views";

export function CentralIdeaFallback({ checksTitle, checks, status, risksTitle, risks, closing }: CentralIdeaProps) {
  return (
    <div className="markdown">
      <p>
        <strong>{checksTitle}</strong>
      </p>
      <ul>
        {checks.map((check) => (
          <li key={check}>{check}</li>
        ))}
      </ul>
      <p>
        <code>{status}</code>
      </p>
      <p>
        <strong>{risksTitle}</strong>
      </p>
      <ul>
        {risks.map((risk) => (
          <li key={risk.text}>
            {risk.text} <em>({risk.tag})</em>
          </li>
        ))}
      </ul>
      <p>{closing}</p>
    </div>
  );
}

export function VigenciaTimelineFallback({ items, asOf }: VigenciaTimelineProps) {
  return (
    <div className="markdown">
      <ol>
        {items.map((item) => (
          <li key={item.date}>
            <strong>
              {item.date} · {item.title}
            </strong>
            {item.state === "current" ? " (vigente)" : item.state === "proposed" ? " (propuesta)" : ""}: {item.detail}
            {item.links?.map((link) => (
              <span key={link.href}>
                {" · "}
                <a href={link.href}>{link.label}</a>
              </span>
            ))}
          </li>
        ))}
      </ol>
      <p>{asOf}</p>
    </div>
  );
}

export function ApproachFallback({ intro, steps, notes }: ApproachProps) {
  return (
    <div className="markdown">
      <p>{intro}</p>
      <ol>
        {steps.map((step) => (
          <li key={step.name}>
            <strong>{step.name}</strong>: {step.description}
          </li>
        ))}
      </ol>
      {notes.map((note) => (
        <p key={note.title}>
          <strong>{note.title}.</strong> {note.text}
        </p>
      ))}
    </div>
  );
}

export function PracticeLanesFallback({ start, lanes }: PracticeLanesProps) {
  return (
    <div className="markdown">
      {start ? (
        <p>
          <strong>{start.title}:</strong> {start.text}
        </p>
      ) : null}
      {lanes.map((lane, index) => (
        <div key={lane.title}>
          <p>
            <strong>
              {index + 1}. {lane.title}
            </strong>
          </p>
          <ul>
            {lane.items.map((item) => (
              <li key={item.title}>
                {item.arq ? "[arq] " : ""}
                <strong>{item.title}:</strong> {item.text}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function SeverityCardsFallback({ levels }: SeverityCardsProps) {
  return (
    <div className="markdown">
      {levels.map((level) => (
        <div key={level.name}>
          <p>
            <strong>{level.name}</strong> · {level.amount}
            {level.note ? ` (${level.note})` : ""}
          </p>
          <ul>
            {level.examples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function SourcesGroupedFallback({ groups }: SourcesGroupedProps) {
  return (
    <div className="markdown">
      {groups.map((group) => (
        <div key={group.title}>
          <p>
            <strong>{group.title}</strong>
          </p>
          <ul>
            {group.sources.map((source) => (
              <li key={source.title}>
                {source.provider ? `${source.provider} · ` : ""}
                {source.links.map((link, index) => (
                  <span key={link.href}>
                    {index > 0 ? " · " : ""}
                    <a href={link.href}>{index === 0 ? source.title : link.label}</a>
                    {index === 0 && link.label ? ` (${link.label})` : ""}
                  </span>
                ))}{" "}
                — {source.publisher} · {source.level}
                {source.why ? `. ${source.why}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
