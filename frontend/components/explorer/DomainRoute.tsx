"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { AvailabilityGlyph, AvailabilityMark } from "@/components/availability/AvailabilityMark";
import { ConstructionBanner } from "@/components/ConstructionBanner";
import { SearchDialog } from "@/components/SearchDialog";
import type { Level, StudyStatus } from "@/lib/api/types";
import type { AvailabilityCopyMap } from "@/lib/availability";
import { domainIsComplete, isAvailableFicha, isMastered, nextGoalDomain, nextRecommended, orderByLevel } from "@/lib/domainRoute";
import { SHORT_NAMES } from "@/lib/learning-paths";
import { isDomainPublished, isGoalPublished } from "@/lib/publishedScope";
import { listStoredStudy, subscribePersonal } from "@/lib/personalStore";
import { CARD_SECTION_COUNT, readReadingProgress } from "@/lib/readingProgress";

import "./domain-route.css";
import { isHiddenStudyRoute } from "@/lib/siteConfig";

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
  kind?: "concept" | "pattern" | "architecture";
  available?: boolean;
  availability?: "available" | "in_review" | "in_development";
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
  bandLabel,
  notice,
  readingPath,
  asideExtra,
  disabledStage,
  verifiedTotal,
  construction = false,
  availabilityCopy,
  routeCount,
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
  bandLabel?: string;
  notice?: string;
  readingPath?: readonly string[];
  asideExtra?: ReactNode;
  disabledStage?: { id: string; title: string };
  verifiedTotal?: number;
  construction?: boolean;
  availabilityCopy?: AvailabilityCopyMap;
  /** ADR-031: «N de M fichas disponibles», ya formateado con el texto del contenido. */
  routeCount?: string;
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
      setGoalKey(stored && isGoalPublished(stored) ? stored : null);
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
  const fichas = concepts.filter((concept) => isAvailableFicha(concept));
  const verified = fichas.filter((concept) => concept.verified).length;
  const verifiedBase = verifiedTotal ?? fichas.length;
  const shownStages = [
    ...orderedStages.map((stage) => ({ ...stage, disabled: false })),
    ...(disabledStage
      ? [{ slug: disabledStage.id, title: disabledStage.title, concepts: [] as RouteConcept[], disabled: true }]
      : []),
  ];
  const mastered = fichas.filter((concept) => isMastered(lookup(concept.slug))).length;
  const reviewItems = fichas.filter((concept) => lookup(concept.slug) === "needs_review");
  const crumb = `${id} ${SHORT_NAMES[id] ?? title}`;
  const nextDomainId = complete ? nextGoalDomain(goalKey, id) : null;
  const nextDomain =
    nextDomainId && isDomainPublished({ id: nextDomainId })
      ? goalDomains.find((domain) => domain.id === nextDomainId)
      : undefined;

  return (
    <div className="route">
      {construction ? <ConstructionBanner /> : null}
      <div className="route-top">
        <nav aria-label="Ruta de navegación">
          <ol className="route-crumbs">
            <li>
              <Link href="/">Inicio</Link>
            </li>
            <li aria-hidden="true">/</li>
            {isHiddenStudyRoute("/explorer") ? null : (
              <>
                <li>
                  <Link href="/explorer">Rutas</Link>
                </li>
                <li aria-hidden="true">/</li>
              </>
            )}
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
        {bandLabel ? (
          <span className="route-kicker route-kicker-band">{bandLabel}</span>
        ) : (
          <span className="route-kicker">
            Dominio {id} · {stages.length} etapas · {conceptCount} conceptos
          </span>
        )}
        <h1>{title}</h1>
        {description ? <p className="lead">{description}</p> : null}
        {notice ? <p className="legal-notice legal-notice-lead">{notice}</p> : null}
        {readingPath && readingPath.length > 0 ? (
          <p className="route-reading">
            Cómo estudiar cada ficha: {readingPath.join(" → ")}
          </p>
        ) : null}
        <div className="route-pills">
          {routeCount ? <span className="route-pill route-pill-count">{routeCount}</span> : null}
          <span className="route-pill route-pill-ok">
            {verifiedBase === 0 ? "0 fichas verificadas" : `${verified} de ${verifiedBase} fichas verificadas`}
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
          {shownStages.map((stage, index) => {
            const stageFichas = stage.concepts.filter((concept) => isAvailableFicha(concept));
            const done = stageFichas.filter((concept) => isMastered(lookup(concept.slug))).length;
            const started = stageFichas.some((concept) => lookup(concept.slug) !== "not_reviewed");
            const marker = stage.disabled
              ? "pending"
              : stageFichas.length > 0 && done === stageFichas.length
                ? "complete"
                : started
                  ? "started"
                  : "pending";
            const line = index === shownStages.length - 1 ? "none" : marker === "complete" ? "accent" : "muted";
            return (
              <li key={stage.slug} id={stage.slug} className="route-stage" data-disabled={stage.disabled || undefined}>
                <div className="route-rail">
                  <div className="route-marker" data-state={marker}>
                    {index + 1}
                  </div>
                  <div className="route-line" data-tone={line} />
                </div>
                <div className="route-stage-body">
                  <div className="route-stage-head">
                    <h2>{stage.title}</h2>
                    {stage.disabled || stageFichas.length === 0 ? null : (
                      <span className="route-stage-count">
                        {done} de {stageFichas.length} comprendidos
                      </span>
                    )}
                  </div>
                  {stage.disabled ? null : (
                    <div className="route-cards">
                      {stage.concepts.map((concept) => (
                        <ConceptCard
                          key={concept.slug}
                          concept={concept}
                          state={lookup(concept.slug)}
                          recommended={recommended?.slug === concept.slug}
                          availabilityCopy={availabilityCopy}
                          section={sections[concept.slug]}
                          markArchitecture={id === "07" && concept.kind === "architecture"}
                        />
                      ))}
                    </div>
                  )}
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
                    <span className="route-card-meta">Sin ficha</span>
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
          {asideExtra}
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
  markArchitecture = false,
  availabilityCopy,
}: {
  concept: RouteConcept;
  state: StudyStatus;
  recommended: boolean;
  section: number | undefined;
  markArchitecture?: boolean;
  availabilityCopy?: AvailabilityCopyMap;
}) {
  const level = LEVEL_NAME[concept.level];
  if (concept.hasPage && concept.available === false && (concept.availability === "in_review" || concept.availability === "in_development")) {
    const copy = availabilityCopy?.[concept.availability];
    return (
      <div className="route-card" data-unavailable={concept.availability} aria-disabled="true">
        <span className="route-icon" data-unavailable={concept.availability} aria-hidden="true">
          <AvailabilityGlyph status={concept.availability} />
        </span>
        <span className="route-card-text">
          {markArchitecture ? <span className="route-card-kind">Arquitectura</span> : null}
          <span className="route-card-title">{concept.title}</span>
          <span className="route-card-meta">
            {level}
            {copy ? (
              <>
                {" · "}
                <AvailabilityMark status={concept.availability} label={copy.label} help={copy.help} />
              </>
            ) : null}
          </span>
        </span>
      </div>
    );
  }
  if (!concept.hasPage) {
    return (
      <div className="route-card" data-pending="true">
        <span className="route-icon" aria-hidden="true" />
        <span className="route-card-text">
          {markArchitecture ? <span className="route-card-kind">Arquitectura</span> : null}
          <span className="route-card-title">{concept.title}</span>
          <span className="route-card-meta">
            {level} · Sin ficha
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
        {markArchitecture ? <span className="route-card-kind">Arquitectura</span> : null}
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
        {nextDomain && !isHiddenStudyRoute(`/explorer/${nextDomain.slug}`) ? (
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
