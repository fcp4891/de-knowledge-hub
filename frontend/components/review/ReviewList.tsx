import Link from "next/link";

export type ReviewEntry = {
  slug: string;
  title: string;
  domainLabel: string | null;
  lastStudiedAt: string | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysAgo(iso: string | null, now: Date): string {
  if (!iso) {
    return "Sin fecha de estudio";
  }
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / DAY_MS);
  if (days <= 0) {
    return "Hoy";
  }
  return days === 1 ? "Hace 1 día" : `Hace ${days} días`;
}

/** Lista de conceptos en «Necesita repaso», del más antiguo al más reciente. */
export function ReviewList({ entries, now }: { entries: ReviewEntry[]; now: Date }) {
  if (entries.length === 0) {
    return (
      <div className="review-empty">
        <p className="review-empty-title">Nada para repasar.</p>
        <p className="muted">
          Cuando marques un concepto como «Necesita repaso» desde su ficha, aparecerá aquí.
        </p>
      </div>
    );
  }

  const ordered = [...entries].sort((a, b) => (a.lastStudiedAt ?? "").localeCompare(b.lastStudiedAt ?? ""));

  return (
    <ul className="review-list">
      {ordered.map((entry) => (
        <li key={entry.slug} className="review-item">
          <span className="review-mark" aria-hidden="true">
            ↺
          </span>
          <div className="review-body">
            <Link href={`/concepts/${entry.slug}`} className="review-title">
              {entry.title}
            </Link>
            <p className="review-meta">
              {entry.domainLabel ? <span>{entry.domainLabel}</span> : null}
              <span>{daysAgo(entry.lastStudiedAt, now)}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
