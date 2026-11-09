import type { ReactNode } from "react";

import "./ficha-blocks.css";

const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    return iso;
  }
  const month = MONTHS[Number(match[2]) - 1];
  return month ? `${match[3]} ${month} ${match[1]}` : iso;
}

function CalendarIcon() {
  return (
    <svg className="vigencia-icon" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 6.5h12M5 2v2.5M11 2v2.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function InstitutionIcon() {
  return (
    <svg className="vigencia-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 6.5 8 3l6 3.5M3.5 7v5.5M6.5 7v5.5M9.5 7v5.5M12.5 7v5.5M2 12.5h12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function markedIntro(intro: string, mark?: string): ReactNode {
  if (!mark || !intro.includes(mark)) {
    return intro;
  }
  const [before, after] = intro.split(mark);
  return (
    <>
      {before}
      <strong>{mark}</strong>
      {after}
    </>
  );
}

export function VigenciaTimeline({
  intro,
  introMark,
  items,
  asOf,
}: {
  intro?: string;
  introMark?: string;
  items: {
    date: string;
    title: string;
    detail: string;
    links?: { label: string; href: string }[];
    note?: string;
    icon?: "calendar" | "institution";
    state: "past" | "current" | "proposed";
  }[];
  asOf: string;
}) {
  return (
    <section className="ficha-block vigencia" aria-label="Vigencia">
      {asOf ? <p className="vigencia-asof">{asOf}</p> : null}
      {intro ? <p className="vigencia-intro">{markedIntro(intro, introMark)}</p> : null}
      <ol className="vigencia-list">
        {items.map((item) => (
          <li key={item.date + item.title} className="vigencia-item" data-state={item.state}>
            <time className="vigencia-date" dateTime={item.date}>
              {item.icon === "institution" ? <InstitutionIcon /> : <CalendarIcon />}
              {formatDate(item.date)}
            </time>
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
            {item.links && item.links.length > 0 ? (
              <ul className="vigencia-links">
                {item.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            ) : item.note ? (
              <p className="vigencia-note">{item.note}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
