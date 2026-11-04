"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

import { GOALS, LAYERS, SHORT_NAMES, type Goal, type Layer } from "@/lib/learning-paths";
import { contentStatus, paintStation, type GoalPath } from "@/lib/platformMap";
import { goalPathIds, PRIVACY_SPACE_HREF } from "@/lib/privacySpace";
import {
  BAND_LABEL,
  CONSTRUCTION_BADGE,
  CONSTRUCTION_LAYER,
  SHOW_UNPUBLISHED,
  isDomainPublished,
  isGoalPublished,
  layerIsClosed,
  requirementPlainText,
  stepHref,
  visibleGoals,
  visibleLayers,
} from "@/lib/publishedScope";
import { listStoredStudy, subscribePersonal } from "@/lib/personalStore";
import { CARD_SECTION_COUNT, readReadingProgress, type ReadingProgress } from "@/lib/readingProgress";
import type { StudyState } from "@/lib/api/types";

import "./home.css";

const GOAL_KEY = "dekh:goal";

export type HomeStage = {
  slug: string;
  title: string;
  verified: number;
  total: number;
  withPage: number;
};

export type HomeDomain = {
  id: string;
  slug: string;
  title: string;
  band: "especializacion" | null;
  conceptCount: number;
  withPage: number | null;
  stages: HomeStage[];
};

export type HomeConcept = {
  slug: string;
  title: string;
  domainId: string;
  subdomainTitle: string | null;
};

function latestReviewing(items: StudyState[]): StudyState | null {
  const reviewing = items.filter((item) => item.state === "reviewing");
  reviewing.sort((left, right) => (right.last_studied_at ?? "").localeCompare(left.last_studied_at ?? ""));
  return reviewing[0] ?? null;
}

function todayLabel(date: Date): string {
  const formatted = date.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });
  const cleaned = formatted.replace(",", "");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function HomeScreen({
  domains,
  concepts,
  continueSlug,
  staticMode,
}: {
  domains: HomeDomain[];
  concepts: HomeConcept[];
  continueSlug: string | null;
  staticMode: boolean;
}) {
  const [goalKey, setGoalKey] = useState<string | null>(null);
  const [storedSlug, setStoredSlug] = useState<string | null>(null);
  const [reading, setReading] = useState<ReadingProgress | null>(null);
  const [dateLabel, setDateLabel] = useState("");

  const conceptsBySlug = useMemo(() => new Map(concepts.map((concept) => [concept.slug, concept])), [concepts]);
  const domainsById = useMemo(() => new Map(domains.map((domain) => [domain.id, domain])), [domains]);

  useEffect(() => {
    setDateLabel(todayLabel(new Date()));
    try {
      const stored = window.localStorage.getItem(GOAL_KEY);
      if (stored && isGoalPublished(stored)) {
        setGoalKey(stored);
      }
    } catch {
      setGoalKey(null);
    }
  }, []);

  useEffect(() => {
    if (!staticMode) {
      return;
    }
    const refresh = () => {
      const current = latestReviewing(listStoredStudy());
      setStoredSlug(current && conceptsBySlug.has(current.slug) ? current.slug : null);
    };
    refresh();
    return subscribePersonal(refresh);
  }, [staticMode, conceptsBySlug]);

  const activeSlug = staticMode ? storedSlug : continueSlug;

  useEffect(() => {
    if (!activeSlug) {
      setReading(null);
      return;
    }
    const refresh = () => setReading(readReadingProgress(activeSlug));
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [activeSlug]);

  const goal = GOALS.find((item) => item.key === goalKey) ?? null;
  const path: GoalPath = goal ? goalPathIds(goal.steps) : null;
  const storedContinue = activeSlug ? conceptsBySlug.get(activeSlug) ?? null : null;
  const continueConcept =
    storedContinue && isDomainPublished({ id: storedContinue.domainId }) ? storedContinue : null;

  function pickGoal(key: string) {
    setGoalKey((current) => {
      const next = current === key ? null : key;
      try {
        if (next) {
          window.localStorage.setItem(GOAL_KEY, next);
        } else {
          window.localStorage.removeItem(GOAL_KEY);
        }
      } catch {
        /* el inicio sigue usable si el navegador bloquea el almacenamiento */
      }
      return next;
    });
  }

  return (
    <>
      <header className="home-header">
        <p className="home-date">{dateLabel}</p>
        <h1>¿Qué quieres hacer hoy?</h1>
        <p className="lead">Elige un camino. Todo lo demás espera.</p>
      </header>

      {continueConcept ? <ContinueCard concept={continueConcept} reading={reading} /> : null}

      <section className="home-block" aria-labelledby="obj-titulo">
        <div className="home-block-head">
          <h2 id="obj-titulo">Elige un objetivo</h2>
          <span className="home-note">Ordenados de inicial a avanzado</span>
        </div>
        <div className="home-goals">
          {visibleGoals(GOALS).map((item) => (
            <GoalCard key={item.key} goal={item} pressed={item.key === goalKey} onPick={pickGoal} />
          ))}
        </div>
      </section>

      <div className="home-split">
        <Itinerary goal={goal} domainsById={domainsById} />
        <PlatformMap path={path} domainsById={domainsById} />
      </div>
    </>
  );
}

function ContinueCard({ concept, reading }: { concept: HomeConcept; reading: ReadingProgress | null }) {
  const domainName = SHORT_NAMES[concept.domainId];
  const place = [concept.domainId && domainName ? `${concept.domainId} ${domainName}` : null, concept.subdomainTitle]
    .filter(Boolean)
    .join(" · ");
  const sectionLine = reading
    ? `Ibas en la sección ${reading.section} de ${CARD_SECTION_COUNT}${reading.title ? `: «${reading.title}»` : ""}`
    : null;
  const meta = [place, sectionLine].filter(Boolean).join(" · ");
  const percent = reading ? Math.min(100, Math.round((reading.section / CARD_SECTION_COUNT) * 100)) : 0;

  return (
    <article className="home-continue">
      <div className="home-continue-body">
        <span className="home-kicker">Continuar donde quedaste</span>
        <h2>{concept.title}</h2>
        {meta ? <p className="home-continue-meta">{meta}</p> : null}
        {reading ? (
          <div className="home-progress">
            <div
              className="home-progress-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={CARD_SECTION_COUNT}
              aria-valuenow={Math.min(reading.section, CARD_SECTION_COUNT)}
              aria-label="Progreso de lectura"
            >
              <div className="home-progress-fill" style={{ width: `${percent}%` }} />
            </div>
            <span>
              {reading.section} de {CARD_SECTION_COUNT} secciones
            </span>
          </div>
        ) : null}
      </div>
      <Link className="home-continue-action" href={`/concepts/${concept.slug}`}>
        Continuar →
      </Link>
    </article>
  );
}

function GoalCard({ goal, pressed, onPick }: { goal: Goal; pressed: boolean; onPick: (key: string) => void }) {
  const requires = requirementPlainText(goal.requires);
  const meta = (
    <>
      <span className="home-goal-top">
        <span className="home-goal-label">{goal.label}</span>
        <span className="home-level" data-level={goal.level}>
          {goal.level}
        </span>
      </span>
      <span className="home-goal-desc">{goal.description}</span>
      <span className="home-goal-meta">
        {requires} · {goal.steps.length} pasos
      </span>
    </>
  );
  if (!isGoalPublished(goal.key)) {
    return (
      <div className="home-goal" aria-disabled="true">
        {meta}
        <span className="construction-mark">{CONSTRUCTION_BADGE}</span>
      </div>
    );
  }
  return (
    <button type="button" className="home-goal" aria-pressed={pressed} onClick={() => onPick(goal.key)}>
      {meta}
    </button>
  );
}

function Itinerary({ goal, domainsById }: { goal: Goal | null; domainsById: Map<string, HomeDomain> }) {
  const first = goal?.steps[0];
  const firstDomain = first ? domainsById.get(first.domain) : undefined;
  const firstStage = first?.stage ? firstDomain?.stages.find((stage) => stage.slug === first.stage) : undefined;
  const firstName = firstStage?.title ?? (first ? SHORT_NAMES[first.domain] : undefined);
  const startHref = first ? stepHref(first, firstDomain?.slug ?? null) : null;

  return (
    <section className="home-itinerary" aria-labelledby="itin">
      <div className="home-itinerary-head">
        <h2 id="itin">Tu itinerario</h2>
        {goal ? <span className="home-note">{goal.steps.length} pasos</span> : null}
      </div>
      {goal ? (
        <>
          <p className="home-requires">
            {goal.requires} Los pasos esenciales van primero en importancia; los complementarios amplían.
          </p>
          <ol className="home-steps">
            {goal.steps.map((step, index) => {
              const domain = domainsById.get(step.domain);
              const stage = step.stage ? domain?.stages.find((item) => item.slug === step.stage) : undefined;
              const layer = step.stage ? undefined : LAYERS.find((item) => item.domains.includes(step.domain));
              const status = stage
                ? `${stage.verified}/${stage.total} verificadas`
                : domain
                  ? contentStatus(domain.withPage, domain.conceptCount)
                  : null;
              const place = step.stage ? BAND_LABEL : layer?.name;
              const name = stage?.title ?? SHORT_NAMES[step.domain] ?? domain?.slug ?? step.domain;
              const href = stepHref(step, domain?.slug ?? null);
              const body = (
                <>
                  <span className="home-step-name">
                    <span>{name}</span>
                    <span className="home-weight" data-weight={step.weight}>
                      {step.weight}
                    </span>
                  </span>
                  <span className="home-step-meta">{[place, status].filter(Boolean).join(" · ")}</span>
                </>
              );
              return (
                <li key={`${step.domain}-${step.stage ?? index}`} className="home-step">
                  <span className="home-step-rail">
                    {href ? (
                      <Link
                        href={href}
                        className="home-step-num"
                        style={{ background: step.stage ? "var(--band-especializacion-dark)" : (layer?.dark ?? "var(--ink)") }}
                      >
                        {index + 1}
                      </Link>
                    ) : (
                      <span
                        className="home-step-num"
                        style={{ background: step.stage ? "var(--band-especializacion-dark)" : (layer?.dark ?? "var(--ink)") }}
                      >
                        {index + 1}
                      </span>
                    )}
                    <span className="home-step-line" data-last={index === goal.steps.length - 1} />
                  </span>
                  {href ? <Link href={href}>{body}</Link> : <span className="home-step-text">{body}</span>}
                </li>
              );
            })}
          </ol>
          {startHref && firstName ? (
            <Link className="home-start" href={startHref}>
              {`Empezar por ${firstName}`}
            </Link>
          ) : null}
        </>
      ) : (
        <div className="home-empty-goal">
          <strong>Sin objetivo elegido</strong>
          <span>
            Elige un objetivo arriba y aquí verás tus pasos en orden. Si no sabes por dónde partir, «Empiezo desde
            cero» cubre la base de todo lo demás.
          </span>
        </div>
      )}
    </section>
  );
}

function PlatformMap({ path, domainsById }: { path: GoalPath; domainsById: Map<string, HomeDomain> }) {
  const special = [...domainsById.values()].find((domain) => domain.band === "especializacion") ?? null;
  return (
    <section className="home-map" aria-label="Mapa de la plataforma">
      {special && special.stages.length > 0 && (SHOW_UNPUBLISHED || isDomainPublished(special)) ? (
        <SpecializationBand domain={special} path={path} />
      ) : null}
      {visibleLayers(LAYERS).map((layer) => (
        <LayerRow key={layer.key} layer={layer} path={path} domainsById={domainsById} />
      ))}
    </section>
  );
}

function SpecializationBand({ domain, path }: { domain: HomeDomain; path: GoalPath }) {
  const open = isDomainPublished(domain);
  const visible = domain.stages.filter((stage) => stage.slug !== "regulatory-frameworks");
  const stations = visible.map((stage) => ({
    id: stage.slug,
    name: stage.title,
    withPage: stage.withPage,
    total: stage.total,
    href: `${PRIVACY_SPACE_HREF}#${stage.slug}`,
  }));
  const withPage = visible.reduce((sum, stage) => sum + stage.withPage, 0);
  const total = visible.reduce((sum, stage) => sum + stage.total, 0);
  const ids = stations.map((station) => station.id);
  const style = {
    "--layer-color": "var(--band-especializacion)",
    "--layer-dark": "var(--band-especializacion-dark)",
    "--layer-fill": "var(--band-especializacion-fill)",
    "--station-count": String(stations.length),
  } as CSSProperties;

  return (
    <div className="home-layer" data-layer="especializacion" data-published={open ? "true" : "false"} style={style}>
      <div className="home-layer-label">
        <span className="home-layer-name">
          <span className="home-swatch" />
          {BAND_LABEL}
        </span>
        <span className="home-layer-count">
          {withPage}/{total} fichas
        </span>
      </div>
      {open ? null : <p className="home-layer-note">{CONSTRUCTION_LAYER}</p>}
      <div className="home-stations-scroll">
        <div className="home-stations">
          {stations.map((station, index) => {
            const paint = paintStation({
              id: station.id,
              index,
              ids,
              path,
              withPage: station.total > 0 ? station.withPage : null,
              total: station.total,
            });
            const emphasis = !open ? "dimmed" : paint.emphasized ? "step" : paint.dimmed ? "dimmed" : "plain";
            const dotStyle =
              paint.fill === "partial"
                ? { background: `conic-gradient(var(--band-especializacion) ${paint.percent}%, var(--surface) 0)` }
                : undefined;
            const body = (
              <>
                <span className="home-station-track">
                  <span className="home-station-line" data-tone={paint.lineLeft} />
                  <span className="home-station-dot" data-fill={open ? paint.fill : "empty"} data-dimmed={!open || paint.dimmed} style={dotStyle}>
                    {open ? paint.stepNumber : ""}
                  </span>
                  <span className="home-station-line" data-tone={paint.lineRight} />
                </span>
                <span className="home-station-name" data-emphasis={emphasis}>
                  {station.name}
                </span>
              </>
            );
            return open ? (
              <Link key={station.id} className="home-station" href={station.href}>
                {body}
              </Link>
            ) : (
              <span key={station.id} className="home-station">
                {body}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LayerRow({
  layer,
  path,
  domainsById,
}: {
  layer: Layer;
  path: GoalPath;
  domainsById: Map<string, HomeDomain>;
}) {
  const stations = layer.domains.map((id) => domainsById.get(id) ?? null);
  const known = stations.every((domain) => domain != null && domain.withPage !== null);
  const withPage = known ? stations.reduce((sum, domain) => sum + (domain?.withPage ?? 0), 0) : null;
  const total = stations.reduce((sum, domain) => sum + (domain?.conceptCount ?? 0), 0);
  const closed = layerIsClosed(layer.domains);
  const style = {
    "--layer-color": layer.color,
    "--layer-dark": layer.dark,
    "--station-count": String(layer.domains.length),
  } as CSSProperties;

  return (
    <div className="home-layer" data-layer={layer.key} data-published={closed ? "false" : "true"} style={style}>
      <div className="home-layer-label">
        <span className="home-layer-name">
          <span className="home-swatch" />
          {layer.name}
        </span>
        {withPage !== null ? (
          <span className="home-layer-count">
            {withPage}/{total} fichas
          </span>
        ) : null}
      </div>
      {closed ? <p className="home-layer-note">{CONSTRUCTION_LAYER}</p> : null}
      <div className="home-stations-scroll">
        <div className="home-stations">
          {layer.domains.map((id, index) => {
            const domain = domainsById.get(id);
            const paint = paintStation({
              id,
              index,
              ids: layer.domains,
              path,
              withPage: domain?.withPage ?? null,
              total: domain?.conceptCount ?? 0,
            });
            const name = SHORT_NAMES[id] ?? domain?.slug ?? id;
            const open = domain ? isDomainPublished(domain) : false;
            const emphasis = !open ? "dimmed" : paint.emphasized ? "step" : paint.dimmed ? "dimmed" : "plain";
            const dotStyle =
              paint.fill === "partial"
                ? { background: `conic-gradient(${layer.color} ${paint.percent}%, var(--surface) 0)` }
                : undefined;
            const body = (
              <>
                <span className="home-station-track">
                  <span className="home-station-line" data-tone={paint.lineLeft} />
                  <span
                    className="home-station-dot"
                    data-fill={open ? paint.fill : "empty"}
                    data-dimmed={!open || paint.dimmed}
                    style={dotStyle}
                  >
                    {open ? paint.stepNumber : ""}
                  </span>
                  <span className="home-station-line" data-tone={paint.lineRight} />
                </span>
                <span className="home-station-name" data-emphasis={emphasis}>
                  {name}
                </span>
              </>
            );
            return open && domain ? (
              <Link key={id} className="home-station" href={`/explorer/${domain.slug}`}>
                {body}
              </Link>
            ) : (
              <span key={id} className="home-station">
                {body}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
