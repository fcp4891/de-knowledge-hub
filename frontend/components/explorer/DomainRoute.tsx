"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { SearchDialog } from "@/components/SearchDialog";
import type { Level, StudyStatus } from "@/lib/api/types";
import { domainIsComplete, isMastered, nextGoalDomain, nextRecommended, orderByLevel } from "@/lib/domainRoute";
import { GOALS, SHORT_NAMES } from "@/lib/learning-paths";
import { listStoredStudy, subscribePersonal } from "@/lib/personalStore";
import { CARD_SECTION_COUNT, readReadingProgress } from "@/lib/readingProgress";

import "./domain-route.css";

const GOAL_KEY = "dekh:goal";

const LEVEL_NAME: Record<Level, string> = {
  basic: "Básico",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

export type RouteConcept = {
  slug: string;
  title: string;
  level: Level;
  hasPage: boolean;
  verified: boolean;
  blueprintIndex: number;
};

export type RouteStage = {
  slug: string;
  title: string;
  concepts: RouteConcept[];
};

export type RouteStudy = {
  state: StudyStatus;
  lastStudiedAt: string | null;
};

export type GoalDomain = {
  id: string;
  slug: string;
};

function studyOf(study: Record<string, RouteStudy>, slug: string): StudyStatus {
  return study[slug]?.state ?? "not_reviewed";
}

function daysAgo(iso: string | null, now: number): string | null {
  if (!iso) {
    return null;
  }
  const days = Math.floor((now - new Date(iso).getTime()) / 86_400_000);
  if (Number.isNaN(days)) {
    return null;
  }
  if (days <= 0) {
    return "hoy";
  }
  return days === 1 ? "hace 1 día" : `hace ${days} días`;
}

export function DomainRoute({
  id,
  slug,
  title,
  description,
  conceptCount,
  stages,
  minutes,
  study,
  staticMode,
  goalDomains,
}: {
  id: string;
  slug: string;
  title: string;
  description: string;
  conceptCount: number;
  stages: RouteStage[];
  minutes: Record<string, number>;
  study: Record<string, RouteStudy> | null;
  staticMode: boolean;
  goalDomains: GoalDomain[];
}) {
  const [localStudy, setLocalStudy] = useState<Record<string, RouteStudy> | null>(staticMode ? null : study);
  const [goalKey, setGoalKey] = useState<string | null>(null);
  const [sections, setSections] = useState<Record<string, number>>({});
  const [now, setNow] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchOpener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  useEffect(() => {
    if (!staticMode) {
      return;
    }
    const refresh = () => {
      const next: Record<string, RouteStudy> = {};
      for (const item of listStoredStudy()) {
        next[item.slug] = { state: item.state, lastStudiedAt: item.last_studied_at };
      }
      setLocalStudy(next);
    };
    refresh();
    return subscribePersonal(refresh);
  }, [staticMode]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(GOAL_KEY);
      setGoalKey(stored && GOALS.some((goal) => goal.key === stored) ? stored : null);
    } catch {
      setGoalKey(null);
    }
    const read: Record<string, number> = {};
    for (const stage of stages) {
      for (const concept of stage.concepts) {
        const progress = readReadingProgress(concept.slug);
        if (progress) {
          read[concept.slug] = progress.section;
        }
      }
    }
    setSections(read);
  }, [stages]);

  const current = localStudy ?? {};
  const lookup = (conceptSlug: string) => studyOf(current, conceptSlug);
  const orderedStages = stages.map((stage) => ({
    ...stage,
    concepts: orderByLevel(stage.concepts),
  }));
  const recommended = nextRecommended(orderedStages, lookup);
  const complete = domainIsComplete(orderedStages, lookup);
  const concepts = orderedStages.flatMap((stage) => stage.concepts);
  const fichas = concepts.filter((concept) => concept.hasPage);
  const verified = fichas.filter((concept) => concept.verified).length;
  const mastered = concepts.filter((concept) => isMastered(lookup(concept.slug))).length;
  const reviewItems = concepts.filter((concept) => lookup(concept.slug) === "needs_review");
  const crumb = `${id} ${SHORT_NAMES[id] ?? title}`;
  const nextDomainId = complete ? nextGoalDomain(goalKey, id) : null;
  const nextDomain = nextDomainId ? goalDomains.find((domain) => domain.id === nextDomainId) : undefined;

  return (
    <div className="route">
      <div className="route-top">
        <nav aria-label="Ruta de navegación">
          <ol className="route-crumbs">
            <li>
              <Link href="/">Inicio</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/explorer">Rutas</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span aria-current="page">{crumb}</span>
            </li>
          </ol>
        </nav>
        <button
          type="button"
          className="route-search"
          onClick={(event) => {
            searchOpener.current = event.currentTarget;
            setSearchOpen(true);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          Buscar en este dominio
        </button>
      </div>

      <header className="route-header">
        <span className="route-kicker">
          Dominio {id} · {stages.length} etapas · {conceptCount} conceptos
        </span>
        <h1>{title}</h1>
        {description ? <p className="lead">{description}</p> : null}
        <div className="route-pills">
          <span className="route-pill route-pill-ok">
            {fichas.length === 0 ? "0 fichas verificadas" : `${verified} de ${fichas.length} fichas verificadas`}
          </span>
          <span className="route-pill route-pill-you">
            {mastered} comprendidos por ti
          </span>
          {reviewItems.length > 0 ? (
            <span className="route-pill route-pill-review">{reviewItems.length} para repasar</span>
          ) : null}
        </div>
      </header>

      <div className="route-split">
        <ol className="route-stages" aria-label="Etapas de la ruta">
          {orderedStages.map((stage, index) => {
            const done = stage.concepts.filter((concept) => isMastered(lookup(concept.slug))).length;
            const started = stage.concepts.some((concept) => lookup(concept.slug) !== "not_reviewed");
            const marker = stage.concepts.length > 0 && done === stage.concepts.length ? "complete" : started ? "started" : "pending";
            const line = index === orderedStages.length - 1 ? "none" : marker === "complete" ? "accent" : "muted";
            return (
              <li key={stage.slug} className="route-stage">
                <div className="route-rail">
                  <div className="route-marker" data-state={marker}>
                    {index + 1}
                  </div>
                  <div className="route-line" data-tone={line} />
                </div>
                <div className="route-stage-body">
                  <div className="route-stage-head">
                    <h2>{stage.title}</h2>
                    <span className="route-stage-count">
                      {done} de {stage.concepts.length} comprendidos
                    </span>
                  </div>
                  <div className="route-cards">
                    {stage.concepts.map((concept) => (
                      <ConceptCard
                        key={concept.slug}
                        concept={concept}
                        state={lookup(concept.slug)}
                        recommended={recommended?.slug === concept.slug}
                        section={sections[concept.slug]}
                      />
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <aside className="route-aside" aria-label="Tu siguiente paso">
          <NextStep
            recommended={recommended}
            complete={complete}
            minutes={recommended ? minutes[recommended.slug] : undefined}
            nextDomain={nextDomain}
          />
          {reviewItems.length > 0 ? (
            <section className="route-side">
              <h2>Para repasar</h2>
              {reviewItems.map((concept) => {
                const when = now === null ? null : daysAgo(current[concept.slug]?.lastStudiedAt ?? null, now);
                const label = (
                  <>
                    <span>{concept.title}</span>
                    {when ? <span className="route-review-when">{when}</span> : null}
                  </>
                );
                return concept.hasPage ? (
                  <Link key={concept.slug} className="route-review-link" href={`/concepts/${concept.slug}`}>
                    {label}
                  </Link>
                ) : (
                  <span key={concept.slug} className="route-review-link">
                    {label}
                    <span className="route-card-meta">Ficha pendiente</span>
                  </span>
                );
              })}
            </section>
          ) : null}
          <section className="route-side">
            <h2>Cómo leer la ruta</h2>
            <div className="route-legend">
              <span>
                <i className="route-icon" data-look="done" aria-hidden="true">✓</i>
                Comprendido
              </span>
              <span>
                <i className="route-icon" data-look="doing" aria-hidden="true" />
                Estudiando
              </span>
              <span>
                <i className="route-icon" data-look="review" aria-hidden="true">↺</i>
                Necesita repaso
              </span>
              <span>
                <i className="route-icon" aria-hidden="true" />
                Sin estudiar
              </span>
            </div>
          </section>
        </aside>
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} domain={slug} returnFocusRef={searchOpener} />
    </div>
  );
}

function ConceptCard({
  concept,
  state,
  recommended,
  section,
}: {
  concept: RouteConcept;
  state: StudyStatus;
  recommended: boolean;
  section: number | undefined;
}) {
  const level = LEVEL_NAME[concept.level];
  if (!concept.hasPage) {
    return (
      <div className="route-card" data-pending="true">
        <span className="route-icon" aria-hidden="true" />
        <span className="route-card-text">
          <span className="route-card-title">{concept.title}</span>
          <span className="route-card-meta">
            {level} · Ficha pendiente
          </span>
        </span>
      </div>
    );
  }

  const look = recommended
    ? "next"
    : state === "understood" || state === "applied"
      ? "done"
      : state === "reviewing"
        ? "doing"
        : state === "needs_review"
          ? "review"
          : "todo";
  const status = recommended
    ? "Siguiente recomendado"
    : state === "understood"
      ? "Comprendido"
      : state === "applied"
        ? "Aplicado"
        : state === "reviewing"
          ? section
            ? `Estudiando · sección ${section} de ${CARD_SECTION_COUNT}`
            : "Estudiando"
          : state === "needs_review"
            ? "Necesita repaso"
            : "Sin estudiar";
  const glyph = look === "done" ? "✓" : look === "review" ? "↺" : look === "next" ? "→" : "";

  return (
    <Link className="route-card" data-look={look} href={`/concepts/${concept.slug}`}>
      <span className="route-icon" data-look={look} aria-hidden="true">
        {glyph}
      </span>
      <span className="route-card-text">
        <span className="route-card-title">{concept.title}</span>
        <span className="route-card-meta">
          {level} · {status}
        </span>
      </span>
    </Link>
  );
}

function NextStep({
  recommended,
  complete,
  minutes,
  nextDomain,
}: {
  recommended: RouteConcept | null;
  complete: boolean;
  minutes: number | undefined;
  nextDomain: GoalDomain | undefined;
}) {
  if (recommended) {
    const minutesLabel = minutes ? ` · ~${minutes} min de lectura` : "";
    return (
      <article className="route-next">
        <span className="route-next-kicker">Siguiente paso recomendado</span>
        <h2>{recommended.title}</h2>
        <p>Es el primer concepto con ficha, de básico a avanzado, que aún no está comprendido ni aplicado.</p>
        <p>
          {LEVEL_NAME[recommended.level]}
          {minutesLabel}
        </p>
        <Link className="route-next-action" href={`/concepts/${recommended.slug}`}>
          Empezar
        </Link>
      </article>
    );
  }

  if (complete) {
    const name = nextDomain ? (SHORT_NAMES[nextDomain.id] ?? nextDomain.slug) : null;
    return (
      <article className="route-next">
        <span className="route-next-kicker">Siguiente paso recomendado</span>
        <h2>Dominio completo</h2>
        <p>Cada concepto con ficha está comprendido o aplicado.</p>
        {name ? <p>Siguiente paso de tu objetivo: {name}.</p> : null}
        {nextDomain ? (
          <Link className="route-next-action" href={`/explorer/${nextDomain.slug}`}>
            {`Empezar por ${name}`}
          </Link>
        ) : null}
      </article>
    );
  }

  return (
    <article className="route-next">
      <span className="route-next-kicker">Siguiente paso recomendado</span>
      <h2>Sin ficha para empezar</h2>
      <p>Este dominio todavía no tiene un concepto con ficha.</p>
    </article>
  );
}
