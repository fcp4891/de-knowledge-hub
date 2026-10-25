"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { CloudTabs } from "@/components/card/CloudTabs";
import type {
  Classification,
  EntityType,
  Level,
  RelationGroups,
  StudyStatus,
  VerificationStatus,
} from "@/lib/api/types";
import { CARD_SECTION_GROUPS } from "@/lib/learning-paths";
import type { LegalBasis } from "@/lib/api/types";
import { ArchitectureDot } from "@/components/markdown/InlineText";
import { entityHref } from "@/lib/entityHref";
import { bcnLinkText, lawLabel, legalBasisRows, type LegalNoticeCopy } from "@/lib/legal";
import { partOfParent, routeChildren, withoutPartOf, type PartLink } from "@/lib/partOf";
import { alsoKnownLabel, CLOUD_LABEL, LEVEL_LABEL, STUDY_LABEL, VERIFICATION_LABEL } from "@/lib/labels";
import { saveStudyState } from "@/lib/personalActions";
import {
  addStoredNote,
  editStoredNote,
  loadNotes,
  loadStudy,
  removeStoredNote,
  saveStudy,
} from "@/lib/personalStore";
import { CARD_SECTION_COUNT, readReadingProgress, writeReadingProgress } from "@/lib/readingProgress";

import "./reading.css";

const STUDY_STATES: StudyStatus[] = [
  "not_reviewed",
  "reviewing",
  "understood",
  "applied",
  "needs_review",
];

const CLOUD_ORDER = ["gcp", "aws", "azure"];
const TOC_KEY = "dekh:toc";
const STUDY_KEY = "dekh:study";

export type ReadingSectionModel = {
  number: number;
  key: string;
  title: string;
  presentation: "summary" | "open" | "details" | "cloud";
  listed: boolean;
  body: React.ReactNode;
};

export type ReadingCrumb = {
  domainHref: string;
  domainLabel: string;
  subdomain: string | null;
};

export type ReadingNext = {
  slug: string;
  title: string;
};

export type ReadingRelated = {
  href: string;
  title: string;
  kind: string;
};

type StudySeed = {
  state: StudyStatus;
  pendingDeepDive: boolean;
};

function LegalBasisTable({ items }: { items: readonly LegalBasis[] }) {
  const rows = legalBasisRows(items);
  return (
    <section className="legal-basis" aria-labelledby="legal-basis-title">
      <h2 id="legal-basis-title">Base legal</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">Artículo</th>
            <th scope="col">Qué dice</th>
            <th scope="col">Implicancia técnica</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.law}-${row.article}`}>
              <th scope="row">
                <span className="legal-basis-law">{lawLabel(row.law)}</span>
                <a href={row.url}>
                  art. {row.article}
                  <span className="legal-basis-bcn">{bcnLinkText(row.url)}</span>
                </a>
              </th>
              <td>{row.says ?? "—"}</td>
              <td>{row.implication ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function partHref(link: PartLink): string {
  return entityHref(link.entityType as EntityType, link.slug);
}

function sentence(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatVerified(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return value;
  }
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function cloudLabel(key: string, title: string): string {
  if (key === "gcp" || key === "aws" || key === "azure") {
    return CLOUD_LABEL[key];
  }
  return title;
}

function verificationBadge(
  status: VerificationStatus | null,
  date: string | null,
): { text: string; tone: "ok" | "warn" | "neutral" } | null {
  if (!status) {
    return null;
  }
  if (status === "verified") {
    const formatted = date ? formatVerified(date) : null;
    return { text: formatted ? `Verificada · ${formatted}` : "Verificada", tone: "ok" };
  }
  if (status === "review_required") {
    return { text: "En revisión", tone: "warn" };
  }
  return {
    text: sentence(VERIFICATION_LABEL[status]),
    tone: status === "potentially_outdated" ? "warn" : "neutral",
  };
}

function readingMeta(minutes: number | null, sources: number): string | null {
  const parts: string[] = [];
  if (minutes) {
    parts.push(`~${minutes} min de lectura`);
  }
  if (sources === 1) {
    parts.push("1 fuente oficial");
  } else if (sources > 1) {
    parts.push(`${sources} fuentes oficiales`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function ConceptReading({
  slug,
  title,
  aliases,
  classification,
  level,
  mvp,
  lastVerified,
  verificationStatus,
  jurisdiction,
  legalNotice,
  legalBasis,
  minutes,
  sourceCount,
  crumb,
  next,
  sections,
  staticMode,
  initialStudy,
  studyError,
  related,
  relationGroups,
  relationsError,
  entityType,
  architectureLegend,
  children,
}: {
  slug: string;
  title: string;
  aliases: readonly string[];
  classification: Classification | null;
  level: Level | null;
  mvp: boolean;
  lastVerified: string | null;
  verificationStatus: VerificationStatus | null;
  jurisdiction: readonly string[];
  legalNotice: LegalNoticeCopy | null;
  legalBasis: readonly LegalBasis[];
  minutes: number | null;
  sourceCount: number;
  crumb: ReadingCrumb | null;
  next: ReadingNext | null;
  sections: ReadingSectionModel[];
  staticMode: boolean;
  initialStudy: StudySeed | null;
  studyError: string | null;
  related: ReadingRelated[];
  relationGroups: RelationGroups["groups"];
  relationsError: string | null;
  entityType: EntityType;
  architectureLegend: boolean;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const articleRef = useRef<HTMLElement>(null);
  const cloudRef = useRef<HTMLElement>(null);
  const pendingScroll = useRef<number | null>(null);
  const readMaxRef = useRef(0);
  const pendingRef = useRef(initialStudy?.pendingDeepDive ?? false);
  const saveSeq = useRef(0);
  const radioRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const clouds = [...sections.filter((section) => section.presentation === "cloud")].sort(
    (left, right) => CLOUD_ORDER.indexOf(left.key) - CLOUD_ORDER.indexOf(right.key),
  );
  const [cloudId, setCloudId] = useState(clouds[0]?.key ?? "");
  const [current, setCurrent] = useState<number | null>(null);
  const [readMax, setReadMax] = useState(0);
  const [progressReady, setProgressReady] = useState(false);
  const [allOpen, setAllOpen] = useState(false);
  const [scrollToken, setScrollToken] = useState(0);
  const [study, setStudy] = useState<StudyStatus>(initialStudy?.state ?? "not_reviewed");
  const [pending, setPending] = useState(initialStudy?.pendingDeepDive ?? false);
  const [ready, setReady] = useState(!staticMode);
  const [saveError, setSaveError] = useState<string | null>(studyError);
  const [graphOpen, setGraphOpen] = useState(false);
  const [tocMode, setTocMode] = useState<"auto" | "open" | "closed">("auto");
  const [studyOpen, setStudyOpen] = useState(true);
  const [wideReading, setWideReading] = useState(true);

  useEffect(() => {
    const toc = localStorage.getItem(TOC_KEY);
    const study = localStorage.getItem(STUDY_KEY);
    if (toc === "open" || toc === "closed") {
      setTocMode(toc);
    }
    if (study === "closed") {
      setStudyOpen(false);
    }
    const media = window.matchMedia("(min-width: 1180px)");
    const sync = () => setWideReading(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const tocOpen = tocMode === "open" || (tocMode === "auto" && wideReading);

  function toggleToc() {
    const next = !tocOpen;
    setTocMode(next ? "open" : "closed");
    localStorage.setItem(TOC_KEY, next ? "open" : "closed");
  }

  function toggleStudy() {
    const next = !studyOpen;
    setStudyOpen(next);
    localStorage.setItem(STUDY_KEY, next ? "open" : "closed");
  }

  const activeCloud = clouds.find((section) => section.key === cloudId) ?? clouds[0] ?? null;
  const firstCloud = clouds[0]?.key ?? "";
  const hasDetails = sections.some((section) => section.presentation === "details");
  const badge = verificationBadge(verificationStatus, lastVerified);
  const meta = readingMeta(minutes, sourceCount);
  const shown = Math.min(CARD_SECTION_COUNT, readMax);
  const listed = sections.filter((section) => section.listed);
  const parentPart = partOfParent(relationGroups);
  const routeCards = routeChildren(relationGroups);
  const listedGroups = withoutPartOf(relationGroups);
  const hasRelations = listedGroups.some((group) => group.items.length > 0);

  const note = useCallback(
    (number: number, sectionTitle: string, highlight: boolean) => {
      if (highlight) {
        setCurrent(number);
      }
      if (number > readMaxRef.current && number <= CARD_SECTION_COUNT) {
        readMaxRef.current = number;
        setReadMax(number);
        writeReadingProgress(slug, number, sectionTitle);
      }
    },
    [slug],
  );

  useEffect(() => {
    const stored = readReadingProgress(slug);
    readMaxRef.current = stored?.section ?? 0;
    setReadMax(readMaxRef.current);
    setCurrent(null);
    setProgressReady(true);
  }, [slug]);

  useEffect(() => {
    setCloudId(firstCloud);
  }, [slug, firstCloud]);

  useEffect(() => {
    if (staticMode) {
      const stored = loadStudy(slug);
      pendingRef.current = stored.pending_deep_dive;
      setStudy(stored.state);
      setPending(stored.pending_deep_dive);
      setReady(true);
      return;
    }
    pendingRef.current = initialStudy?.pendingDeepDive ?? false;
    setStudy(initialStudy?.state ?? "not_reviewed");
    setPending(initialStudy?.pendingDeepDive ?? false);
    setReady(true);
  }, [slug, staticMode, initialStudy?.state, initialStudy?.pendingDeepDive]);

  useEffect(() => {
    if (!progressReady) {
      return;
    }
    const root = articleRef.current;
    if (!root) {
      return;
    }
    const seen = new Map<number, { top: number; title: string }>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          const number = Number(element.dataset.readingSection);
          const sectionTitle = element.dataset.readingTitle ?? "";
          if (!Number.isInteger(number)) {
            continue;
          }
          if (entry.isIntersecting) {
            seen.set(number, { top: entry.boundingClientRect.top, title: sectionTitle });
          } else {
            seen.delete(number);
          }
        }
        const top = [...seen.entries()].sort((left, right) => left[1].top - right[1].top)[0];
        if (!top) {
          return;
        }
        note(top[0], top[1].title, true);
      },
      { root: null, rootMargin: "-12% 0px -55% 0px", threshold: [0, 0.2, 0.5] },
    );
    root.querySelectorAll<HTMLElement>("[data-reading-section]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [note, progressReady, cloudId]);

  useEffect(() => {
    const number = pendingScroll.current;
    if (number == null) {
      return;
    }
    const node = document.getElementById(`s${number}`);
    if (!node) {
      return;
    }
    if (node instanceof HTMLDetailsElement) {
      node.open = true;
    }
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    node.scrollIntoView({ behavior: motion, block: "start" });
    pendingScroll.current = null;
  }, [scrollToken, cloudId]);

  function persist(nextState: StudyStatus, nextPending: boolean) {
    pendingRef.current = nextPending;
    setStudy(nextState);
    setPending(nextPending);
    if (staticMode) {
      saveStudy(slug, nextState, nextPending);
      setSaveError(null);
      return;
    }
    const seq = ++saveSeq.current;
    void saveStudyState(slug, nextState, nextPending).then((result) => {
      if (seq !== saveSeq.current) {
        return;
      }
      if (!result.ok) {
        setSaveError(result.detail ?? "No se pudo guardar.");
        return;
      }
      setSaveError(null);
      router.refresh();
    });
  }

  function onRadioKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (index + 1) % STUDY_STATES.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index - 1 + STUDY_STATES.length) % STUDY_STATES.length;
    } else {
      return;
    }
    event.preventDefault();
    persist(STUDY_STATES[next], pendingRef.current);
    radioRefs.current[next]?.focus();
  }

  function goTo(section: ReadingSectionModel) {
    note(section.number, section.title, true);
    if (section.presentation === "cloud") {
      setCloudId(section.key);
    }
    pendingScroll.current = section.number;
    setScrollToken((value) => value + 1);
  }

  function toggleAll() {
    const nextOpen = !allOpen;
    articleRef.current?.querySelectorAll("details").forEach((node) => {
      node.open = nextOpen;
    });
    setAllOpen(nextOpen);
  }

  function onCloudChange(id: string) {
    setCloudId(id);
    const section = clouds.find((item) => item.key === id);
    const node = cloudRef.current;
    if (!section || !node) {
      return;
    }
    const rect = node.getBoundingClientRect();
    if (rect.bottom > 80 && rect.top < window.innerHeight * 0.7) {
      note(section.number, section.title, true);
    }
  }

  let expandPlaced = false;
  const blocks: React.ReactNode[] = [];
  let index = 0;
  while (index < sections.length) {
    const section = sections[index];
    if (!expandPlaced && hasDetails && section.presentation !== "summary") {
      blocks.push(
        <button key="expand" type="button" className="reading-expand" aria-expanded={allOpen} onClick={toggleAll}>
          {allOpen ? "Contraer todo" : "Expandir todo"}
        </button>,
      );
      expandPlaced = true;
    }
    if (section.presentation === "cloud") {
      blocks.push(
        <section
          key="clouds"
          ref={cloudRef}
          id={activeCloud ? `s${activeCloud.number}` : undefined}
          className="reading-section"
          aria-label="Implementación por nube"
          data-reading-section={activeCloud?.number}
          data-reading-title={activeCloud?.title}
        >
          <CloudTabs
            activeId={cloudId}
            onActiveChange={onCloudChange}
            tabs={clouds.map((tab) => ({
              id: tab.key,
              title: cloudLabel(tab.key, tab.title),
              content: tab.body,
            }))}
          />
        </section>,
      );
      while (index < sections.length && sections[index].presentation === "cloud") {
        index += 1;
      }
      continue;
    }
    if (section.presentation === "summary") {
      blocks.push(
        <section
          key={section.number}
          id={`s${section.number}`}
          className="reading-summary"
          aria-labelledby={`h-${section.number}`}
          data-reading-section={section.number}
          data-reading-title={section.title}
        >
          <h2 id={`h-${section.number}`}>
            {section.number} · {section.title}
          </h2>
          {section.body}
        </section>,
      );
    } else if (section.presentation === "open") {
      blocks.push(
        <section
          key={section.number}
          id={`s${section.number}`}
          className="reading-section"
          aria-labelledby={`h-${section.number}`}
          data-reading-section={section.number}
          data-reading-title={section.title}
        >
          <h2 id={`h-${section.number}`}>
            {section.number} · {section.title}
          </h2>
          {section.body}
        </section>,
      );
    } else {
      blocks.push(
        <details
          key={section.number}
          id={`s${section.number}`}
          className="reading-details"
          data-reading-section={section.number}
          data-reading-title={section.title}
        >
          <summary>
            <span className="reading-num">{section.number}</span>
            {section.title}
          </summary>
          <div className="reading-details-body">{section.body}</div>
        </details>,
      );
    }
    index += 1;
  }

  const known = alsoKnownLabel(aliases);

  return (
    <div className="page reading-page reading">
      <div className="reading-top">
        <nav aria-label="Ruta de navegación">
          <ol className="reading-crumbs">
            <li>
              <Link href="/">Inicio</Link>
            </li>
            {crumb ? (
              <li>
                <span aria-hidden="true">/</span> <Link href={crumb.domainHref}>{crumb.domainLabel}</Link>
              </li>
            ) : null}
            {crumb?.subdomain ? (
              <li>
                <span aria-hidden="true">/</span> <span>{crumb.subdomain}</span>
              </li>
            ) : null}
            <li>
              <span aria-hidden="true">/</span> <span aria-current="page">{title}</span>
            </li>
          </ol>
          {parentPart ? (
            <p className="part-of">
              Parte de: <Link href={partHref(parentPart)}>{parentPart.title}</Link>
            </p>
          ) : null}
        </nav>
        <div className="reading-toggles">
          <button type="button" className="reading-toggle" aria-expanded={tocOpen} onClick={toggleToc}>
            {tocOpen ? "Ocultar índice" : "Mostrar índice"}
          </button>
          <button type="button" className="reading-toggle" aria-expanded={studyOpen} onClick={toggleStudy}>
            {studyOpen ? "Ocultar estudio" : "Mostrar estudio"}
          </button>
        </div>
        <div
          className="reading-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={CARD_SECTION_COUNT}
          aria-valuenow={shown}
          aria-label={`Leído ${shown} de ${CARD_SECTION_COUNT}`}
        >
          <span>{progressReady ? `Leído ${shown} de ${CARD_SECTION_COUNT}` : "Lectura"}</span>
          <span className="reading-progress-track">
            <span style={{ width: progressReady ? `${(shown / CARD_SECTION_COUNT) * 100}%` : "0%" }} />
          </span>
        </div>
      </div>

      <div
        className="reading-layout"
        data-toc={tocMode === "auto" ? undefined : tocMode}
        data-study={studyOpen ? undefined : "closed"}
      >
        <nav className="reading-toc" aria-label="Índice de la ficha">
          <div className="reading-toc-nav">
            {listed.length === 0 ? <p className="reading-quiet">Sin secciones con contenido.</p> : null}
            {CARD_SECTION_GROUPS.map((group) => {
              const items = group.sections
                .map((number) => listed.find((section) => section.number === number))
                .filter((section): section is ReadingSectionModel => section !== undefined);
              if (items.length === 0) {
                return null;
              }
              return (
                <div key={group.group}>
                  <p className="reading-toc-group">{group.group}</p>
                  {items.map((section) => {
                    const linkClass = [
                      "reading-toc-link",
                      current === section.number ? "is-current" : section.number <= shown ? "is-read" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");
                    return (
                      <a
                        key={section.number}
                        href={`#s${section.number}`}
                        className={linkClass}
                        aria-current={current === section.number ? "location" : undefined}
                        onClick={(event) => {
                          event.preventDefault();
                          goTo(section);
                        }}
                      >
                        <span className="reading-num">{section.number}</span>
                        <span>{section.title}</span>
                      </a>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </nav>

        <article ref={articleRef} className="reading-article">
          <div className="reading-measure">
            <header>
              <div className="reading-badges">
                {classification ? <span className="reading-badge">{classification}</span> : null}
                {level ? <span className="reading-badge">{sentence(LEVEL_LABEL[level])}</span> : null}
                {mvp ? <span className="reading-badge">MVP</span> : null}
                {badge ? (
                  <span className={badge.tone === "neutral" ? "reading-badge" : `reading-badge is-${badge.tone}`}>
                    {badge.text}
                  </span>
                ) : null}
                {jurisdiction.length > 0 ? (
                  <span className="reading-badge is-legal">Legislación · {jurisdiction.join(" · ")}</span>
                ) : null}
              </div>
              {legalNotice ? (
                <aside className="legal-notice" role="note">
                  <p className="legal-notice-lead">{legalNotice.lead}</p>
                  {legalNotice.detail ? <p className="legal-notice-detail">{legalNotice.detail}</p> : null}
                </aside>
              ) : null}
              <h1 className="reading-title">{title}</h1>
              {known ? <p className="reading-meta">{known}</p> : null}
              {meta ? <p className="reading-meta">{meta}</p> : null}
            </header>
            {routeCards.length > 0 ? (
              <section className="route-cards" aria-labelledby="route-cards-title">
                <h2 id="route-cards-title">Fichas de esta ruta</h2>
                <ol>
                  {routeCards.map((card) => (
                    <li key={card.slug}>
                      <Link href={partHref(card)}>{card.title}</Link>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
            {legalBasis.length > 0 ? <LegalBasisTable items={legalBasis} /> : null}
            {blocks}
            {sections.length === 0 ? <p className="reading-quiet">Esta ficha todavía no tiene secciones.</p> : null}
            {architectureLegend ? (
              <p className="claim-legend">
                <ArchitectureDot labelled={false} /> Decisión de arquitectura: elección de diseño, no exigida por la ley
              </p>
            ) : null}
            <div className="reading-footer">
              <div className="reading-footer-actions">
                <button
                  type="button"
                  className="reading-primary"
                  disabled={!ready}
                  onClick={() => persist("understood", pendingRef.current)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                  Marcar como comprendido
                </button>
                <button
                  type="button"
                  className="reading-secondary"
                  disabled={!ready}
                  onClick={() => persist("needs_review", pendingRef.current)}
                >
                  Necesita repaso
                </button>
              </div>
              {next ? (
                <Link className="reading-next" href={`/concepts/${next.slug}`}>
                  <span>Siguiente en la ruta</span>
                  <strong>{next.title} →</strong>
                </Link>
              ) : null}
            </div>
          </div>
        </article>

        <aside className="reading-study" aria-label="Tu estudio">
          <section className="reading-panel">
            <h2>Tu estado</h2>
            {ready ? (
              <div role="radiogroup" aria-label="Estado de estudio" className="reading-radios">
                {STUDY_STATES.map((value, radioIndex) => (
                  <button
                    key={value}
                    ref={(node) => {
                      radioRefs.current[radioIndex] = node;
                    }}
                    type="button"
                    role="radio"
                    className="reading-radio"
                    aria-checked={study === value}
                    tabIndex={study === value ? 0 : -1}
                    onClick={() => persist(value, pendingRef.current)}
                    onKeyDown={(event) => onRadioKey(event, radioIndex)}
                  >
                    {STUDY_LABEL[value]}
                  </button>
                ))}
              </div>
            ) : (
              <p className="reading-quiet">Cargando estudio…</p>
            )}
            <label className="reading-check">
              <input
                type="checkbox"
                checked={pending}
                disabled={!ready}
                onChange={(event) => persist(study, event.target.checked)}
              />
              Pendiente de profundizar
            </label>
            <span className="reading-quiet">Se guarda al cambiar.</span>
            {saveError ? <p className="reading-error">{saveError}</p> : null}
          </section>

          <section className="reading-panel">
            <h2>Tus notas</h2>
            {staticMode ? <StaticNotes slug={slug} /> : children}
          </section>

          <section className="reading-panel">
            <h2>Relacionados</h2>
            {relationsError ? <p className="reading-error">{relationsError}</p> : null}
            {related.length === 0 && !hasRelations && !relationsError ? (
              <p className="reading-quiet">Sin relaciones.</p>
            ) : null}
            {related.map((item) => (
              <Link key={item.href} className="reading-related" href={item.href}>
                {item.title}
                <span>{item.kind}</span>
              </Link>
            ))}
            {hasRelations ? (
              <button
                type="button"
                className="reading-text-button"
                aria-expanded={graphOpen}
                onClick={() => setGraphOpen((open) => !open)}
              >
                {graphOpen ? "Ocultar grafo" : "Ver todas"}
              </button>
            ) : null}
            {graphOpen ? <RelationGraph center={{ slug, title, entityType }} groups={listedGroups} /> : null}
          </section>
        </aside>
      </div>
    </div>
  );
}

function StaticNotes({ slug }: { slug: string }) {
  const [notes, setNotes] = useState<ReturnType<typeof loadNotes>>([]);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setNotes(loadNotes(slug));
  }, [slug]);

  function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.trim().length < 1) {
      setMessage("La nota debe tener entre 1 y 20000 caracteres.");
      return;
    }
    addStoredNote(slug, draft.trim());
    setNotes(loadNotes(slug));
    setDraft("");
    setMessage(null);
  }

  function save(event: React.FormEvent<HTMLFormElement>, noteId: string) {
    event.preventDefault();
    if (editingBody.trim().length < 1) {
      setMessage("La nota debe tener entre 1 y 20000 caracteres.");
      return;
    }
    editStoredNote(slug, noteId, editingBody.trim());
    setNotes(loadNotes(slug));
    setEditingId(null);
    setMessage(null);
  }

  function remove(noteId: string) {
    removeStoredNote(slug, noteId);
    setNotes(loadNotes(slug));
    setMessage(null);
  }

  return (
    <>
      {notes.length === 0 ? <p className="reading-quiet">Sin notas.</p> : null}
      {notes.map((item) =>
        editingId === item.id ? (
          <form key={item.id} className="personal-form" onSubmit={(event) => save(event, item.id)}>
            <label>
              Editar nota
              <textarea value={editingBody} onChange={(event) => setEditingBody(event.target.value)} rows={3} maxLength={20000} />
            </label>
            <div className="note-actions">
              <button type="submit">Guardar nota</button>
              <button type="button" onClick={() => setEditingId(null)}>
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div key={item.id}>
            <p className="reading-note">{item.body_markdown}</p>
            <div className="note-actions">
              <button
                type="button"
                onClick={() => {
                  setEditingId(item.id);
                  setEditingBody(item.body_markdown);
                }}
              >
                Editar
              </button>
              <button type="button" onClick={() => remove(item.id)}>
                Borrar
              </button>
            </div>
          </div>
        ),
      )}
      <form className="personal-form" onSubmit={add}>
        <label>
          Nueva nota
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            maxLength={20000}
            placeholder="Escribe en Markdown…"
          />
        </label>
        <button type="submit">Agregar nota</button>
      </form>
      <p className="reading-quiet">En la demo, tus notas se guardan solo en este navegador.</p>
      {message ? <p className="reading-error">{message}</p> : null}
    </>
  );
}

function RelationGraph({
  center,
  groups,
}: {
  center: { slug: string; title: string; entityType: EntityType };
  groups: RelationGroups["groups"];
}) {
  const [Graph, setGraph] = useState<typeof import("./NeighborhoodGraph").NeighborhoodGraph | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("./NeighborhoodGraph").then((module) => {
      if (!cancelled) {
        setGraph(() => module.NeighborhoodGraph);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Graph) {
    return <p className="reading-quiet">Cargando grafo…</p>;
  }
  return <Graph center={center} groups={groups} />;
}
