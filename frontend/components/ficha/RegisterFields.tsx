"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import type { Views } from "@/lib/views";

import { DocIcon } from "./DocIcon";
import { RichText } from "./RichText";
import "./inventory-views.css";

type View = NonNullable<Views["register_fields"]>;
type Field = View["fields"][number];
type Filter = "all" | "norm" | "proposal";
type Modal = { kind: "field"; id: string; tab: "law" | "decree" | "proposal" } | { kind: "sheet" } | null;

const ROWS_VISIBLE = 8;

export function hasNorm(field: Field): boolean {
  return Boolean(field.law_letter || field.decree);
}

/** Campos que muestra la tabla con un filtro: todos, los de la norma (ojo) o los propuestos (bombilla). */
export function visibleFields(fields: Field[], filter: Filter): Field[] {
  if (filter === "norm") return fields.filter(hasNorm);
  if (filter === "proposal") return fields.filter((field) => Boolean(field.proposal));
  return fields;
}

function Icon({ name }: { name: "eye" | "bulb" | "close" | "print" }) {
  const paths: Record<string, ReactNode> = {
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    bulb: (
      <>
        <path d="M9 18h6M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" />
      </>
    ),
    close: <path d="M6 6l12 12M18 6 6 18" />,
    print: (
      <>
        <path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
        <path d="M7 14h10v7H7Z" />
      </>
    ),
  };
  return (
    <svg className="inv-icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function fill(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** ADR-030 enmienda 9 · §2: campos del registro, de dónde viene cada uno y la hoja del documento propuesto. */
export function RegisterFields({ view }: { view: View }) {
  const [caseKey, setCaseKey] = useState(view.cases[0]?.key ?? "");
  const states = Object.keys(view.cases[0]?.states ?? {});
  const [state, setState] = useState(states[0] ?? "");
  const [filter, setFilter] = useState<Filter>("all");
  const [live, setLive] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [date, setDate] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const scroll = useRef<HTMLDivElement>(null);

  const current = view.cases.find((item) => item.key === caseKey) ?? view.cases[0];
  const data = current?.states[state];
  const shown = visibleFields(view.fields, filter);
  const combo = `${current?.name ?? ""} · ${state}`;

  useEffect(() => setDate(today()), []);

  // Altura del contenedor: encabezado más las primeras 8 filas, en escritorio (las filas no miden lo mismo).
  useEffect(() => {
    const box = scroll.current;
    if (!box) return;
    const fit = () => {
      box.style.maxHeight = "";
      if (!window.matchMedia("(min-width: 621px)").matches) return;
      const rows = box.querySelectorAll<HTMLElement>(".inv-rg-row");
      if (rows.length <= ROWS_VISIBLE) return;
      const head = box.querySelector<HTMLElement>(".inv-rg-head")?.offsetHeight ?? 0;
      const height = [...rows].slice(0, ROWS_VISIBLE).reduce((sum, row) => sum + row.offsetHeight, head);
      box.style.maxHeight = `${height + 2}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [caseKey, state, filter]);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (modal && !node.open) node.showModal();
    if (!modal && node.open) node.close();
    document.body.classList.toggle("inv-printing", modal?.kind === "sheet");
  }, [modal]);

  if (!current || !data) return null;

  const counts = view.fields.reduce(
    (acc, field) => {
      const status = data.status[field.key] ?? "pending";
      acc[status === "ok" ? "ok" : status === "review" ? "review" : "pending"] += 1;
      return acc;
    },
    { ok: 0, pending: 0, review: 0 },
  );

  const toggleFilter = (next: Filter) => {
    const value = filter === next ? "all" : next;
    setFilter(value);
    setLive(fill(view.labels.live, { n: String(visibleFields(view.fields, value).length), total: String(view.fields.length) }));
  };

  const open = (next: Modal, button: HTMLElement) => {
    opener.current = button;
    setModal(next);
  };

  const closeModal = () => {
    setModal(null);
    opener.current?.focus();
  };

  const value = (key: string) => data.values[key] ?? null;

  return (
    <section className="inv-view inv-rg" aria-label={view.title}>
      {/* El título visible es la subsección ### del cuerpo (ADR-030, enmienda 10); aquí solo nombra la región. */}
      <p className="inv-rg-intro">
        <RichText text={view.intro} />
      </p>

      <div className="inv-rg-legend">
        <button type="button" className="inv-rg-card" aria-pressed={filter === "norm"} onClick={() => toggleFilter("norm")}>
          <span className="inv-rg-card-head">
            <span className="inv-rg-icon is-norm">
              <Icon name="eye" />
            </span>
            <b>{view.legend.norm.title}</b>
          </span>
          <span className="inv-rg-card-text">{view.legend.norm.text}</span>
        </button>
        <button type="button" className="inv-rg-card" aria-pressed={filter === "proposal"} onClick={() => toggleFilter("proposal")}>
          <span className="inv-rg-card-head">
            <span className="inv-rg-icon is-proposal">
              <Icon name="bulb" />
            </span>
            <b>{view.legend.proposal.title}</b>
          </span>
          <span className="inv-rg-card-text">{view.legend.proposal.text}</span>
        </button>
        <button
          type="button"
          className="inv-rg-card"
          aria-pressed={modal?.kind === "sheet"}
          onClick={(event) => open({ kind: "sheet" }, event.currentTarget)}
        >
          <span className="inv-rg-card-head">
            <span className="inv-rg-icon is-doc">
              <DocIcon />
            </span>
            <b>{view.legend.document.title}</b>
          </span>
          <span className="inv-rg-card-text">
            {view.legend.document.action} · {combo}
          </span>
        </button>
      </div>
      <p className="inv-sr" aria-live="polite">
        {live}
      </p>

      <div className="inv-rg-pickers">
        <div className="inv-rg-picker">
          <span>{view.case_label}</span>
          <div role="group" aria-label={view.case_label}>
            {view.cases.map((item) => (
              <button key={item.key} type="button" className="inv-rg-seg" aria-pressed={item.key === current.key} onClick={() => setCaseKey(item.key)}>
                {item.name}
              </button>
            ))}
          </div>
        </div>
        <div className="inv-rg-picker">
          <span>{view.state_label}</span>
          <div role="group" aria-label={view.state_label}>
            {states.map((item) => (
              <button key={item} type="button" className="inv-rg-seg" aria-pressed={item === state} onClick={() => setState(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="inv-rg-counters">
        <div>
          <p>{view.counters.complete}</p>
          <b>
            {counts.ok} de {view.fields.length}
          </b>
        </div>
        <div className={counts.pending > 0 ? "is-pending" : undefined}>
          <p>{view.counters.pending}</p>
          <b>{counts.pending}</b>
        </div>
        <div className={counts.review > 0 ? "is-review" : undefined}>
          <p>{view.counters.review}</p>
          <b>{counts.review}</b>
        </div>
      </div>

      <div
        ref={scroll}
        className="inv-rg-scroll"
        role="region"
        tabIndex={0}
        aria-label={`${view.title}, ${view.fields.length} filas`}
      >
        <div className="inv-rg-cols inv-rg-head" aria-hidden="true">
          {view.headers.map((header) => (
            <span key={header}>{header}</span>
          ))}
        </div>
        {shown.length === 0 ? <p className="inv-rg-empty">{view.labels.empty}</p> : null}
        {shown.map((field, index) => {
          const status = data.status[field.key] ?? "pending";
          const shownValue = value(field.key);
          return (
            <div key={field.id} id={`campo-${field.id}`} className={index % 2 === 1 ? "inv-rg-cols inv-rg-row is-alt" : "inv-rg-cols inv-rg-row"}>
              <div>
                <p className="inv-rg-name">{field.name}</p>
                <p className="inv-rg-why">{field.why}</p>
              </div>
              <div className="inv-rg-value">
                <span className={status === "ok" ? "inv-rg-val" : `inv-rg-val is-${status}`}>{shownValue ?? view.labels.unevaluated}</span>
              </div>
              <div className="inv-rg-source">
                {hasNorm(field) ? (
                  <button
                    type="button"
                    className="inv-rg-icon is-norm"
                    aria-label={fill(view.labels.norm_button, { name: field.name })}
                    title={fill(view.labels.norm_button, { name: field.name })}
                    onClick={(event) => open({ kind: "field", id: field.id, tab: field.law_letter ? "law" : "decree" }, event.currentTarget)}
                  >
                    <Icon name="eye" />
                  </button>
                ) : null}
                {field.proposal ? (
                  <button
                    type="button"
                    className="inv-rg-icon is-proposal"
                    aria-label={fill(view.labels.proposal_button, { name: field.name })}
                    title={fill(view.labels.proposal_button, { name: field.name })}
                    onClick={(event) => open({ kind: "field", id: field.id, tab: "proposal" }, event.currentTarget)}
                  >
                    <Icon name="bulb" />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <dialog
        ref={dialog}
        className={modal?.kind === "sheet" ? "inv-modal is-wide" : "inv-modal"}
        aria-labelledby="inv-modal-title"
        onClose={() => {
          if (modal) closeModal();
        }}
        onClick={(event) => {
          if (event.target === dialog.current) closeModal();
        }}
      >
        {modal?.kind === "field" ? (
          <FieldModal view={view} field={view.fields.find((f) => f.id === modal.id)!} tab={modal.tab} example={value(view.fields.find((f) => f.id === modal.id)!.key)} caseName={current.name} state={state} onTab={(tab) => setModal({ ...modal, tab })} onClose={closeModal} />
        ) : null}
        {modal?.kind === "sheet" ? <Sheet view={view} sheet={data.sheet} combo={combo} date={date} onClose={closeModal} /> : null}
      </dialog>
    </section>
  );
}

function ModalHead({ title, sub, onClose, label, children }: { title: string; sub?: string; onClose: () => void; label: string; children?: ReactNode }) {
  return (
    <div className="inv-modal-head">
      <h5 id="inv-modal-title">
        {title}
        {sub ? <span className="inv-modal-sub">{sub}</span> : null}
      </h5>
      <span className="inv-modal-actions">
        {children}
        <button type="button" className="inv-modal-x" aria-label={label} onClick={onClose}>
          <Icon name="close" />
        </button>
      </span>
    </div>
  );
}

function FieldModal({
  view,
  field,
  tab,
  example,
  caseName,
  state,
  onTab,
  onClose,
}: {
  view: View;
  field: Field;
  tab: "law" | "decree" | "proposal";
  example: string | null;
  caseName: string;
  state: string;
  onTab: (tab: "law" | "decree") => void;
  onClose: () => void;
}) {
  const lit = view.literal;
  const tabs: ("law" | "decree")[] = tab === "proposal" ? [] : [...(field.law_letter ? ["law" as const] : []), ...(field.decree ? ["decree" as const] : [])];
  const [quote, after] = lit.art_49c_link.split("{quote}");
  const fragment = field.art_49c;
  const marked = fragment && lit.art_49c.includes(fragment) ? lit.art_49c.split(fragment) : null;
  return (
    <>
      <ModalHead title={field.name} onClose={onClose} label={view.labels.close} />
      {tabs.length > 1 ? (
        <div className="inv-modal-tabs" role="tablist" aria-label={view.headers[2]}>
          {tabs.map((item) => (
            <button key={item} type="button" role="tab" className={`inv-modal-tab is-${item}`} aria-selected={item === tab} onClick={() => onTab(item)}>
              {item === "law" ? fill(view.labels.law_tab, { letter: field.law_letter ?? "" }) : fill(view.labels.decree_tab, { roman: field.decree ?? "" })}
            </button>
          ))}
        </div>
      ) : (
        <div className="inv-modal-gap" />
      )}
      <div role={tabs.length > 1 ? "tabpanel" : "group"}>
        {tab === "law" && field.law_letter ? (
          <>
            <p className="inv-modal-src">{fill(lit.law_source, { letter: field.law_letter })}</p>
            <p className="inv-modal-sm">{lit.law_intro}</p>
            <p className="inv-modal-quote">{lit.law[field.law_letter]}</p>
          </>
        ) : null}
        {tab === "decree" && field.decree ? (
          <>
            <p className="inv-modal-src">{fill(lit.decree_source, { roman: field.decree })}</p>
            <p className="inv-modal-sm">{lit.decree_intro}</p>
            <p className="inv-modal-quote is-decree">{lit.decree[field.decree]}</p>
            <p className="inv-modal-sm">
              {lit.decree_note}
              {marked ? (
                <>
                  {" "}
                  <RichText text={quote} />
                  {marked[0]}
                  <mark>{fragment}</mark>
                  {marked.slice(1).join(fragment)}
                  <RichText text={after} />
                </>
              ) : null}
            </p>
          </>
        ) : null}
        {tab === "proposal" && field.proposal ? (
          <>
            <p className="inv-modal-src">
              {field.proposal_label} · {view.labels.proposal_suffix}
            </p>
            <p className="inv-modal-quote is-proposal">{field.proposal}</p>
          </>
        ) : null}
      </div>
      <div className="inv-modal-platform">
        <h6>{view.platform.title}</h6>
        <p>
          <span>{view.platform.code}</span> <code>{field.code}</code>
        </p>
        <p>
          <span>{view.platform.check}</span> <RichText text={field.check} />.
        </p>
        <p>
          <span>{view.platform.limit}</span> {field.limit}.
        </p>
        <p>
          <span>{fill(view.platform.example, { case: caseName, state })}</span> {example ?? view.labels.unevaluated}
        </p>
      </div>
    </>
  );
}

function Sheet({
  view,
  sheet,
  combo,
  date,
  onClose,
}: {
  view: View;
  sheet: View["cases"][number]["states"][string]["sheet"];
  combo: string;
  date: string;
  onClose: () => void;
}) {
  const header = view.fields.find((field) => !view.sheet.sections.includes(field.sheet_section));
  const pill = sheet.state === "Vigente" ? "is-ok" : sheet.state === "En revisión" ? "is-review" : "is-draft";
  const pending = (value: string | null | undefined) =>
    value === null || value === undefined ? <span className="inv-sheet-pending">{view.labels.sheet_pending}</span> : value;
  return (
    <>
      <ModalHead title={view.sheet.preview} sub={combo} onClose={onClose} label={view.labels.close}>
        <button type="button" className="inv-rg-seg" onClick={() => window.print()}>
          <Icon name="print" />
          {view.sheet.print}
        </button>
      </ModalHead>
      <div className="inv-sheet">
        <div className="inv-sheet-top">
          <div>
            <p className="inv-sheet-kicker">{view.sheet.kicker}</p>
            <p className="inv-sheet-title">{sheet.title}</p>
          </div>
          <div className="inv-sheet-meta">
            <span className={`inv-sheet-pill ${pill}`}>{sheet.state}</span>
            <br />
            {sheet.code} · {sheet.version}
          </div>
        </div>
        <div className="inv-sheet-params">
          <span>
            <span>{view.sheet.responsible.label}:</span> {view.sheet.responsible.value}
          </span>
          <span>
            <span>{view.sheet.delegate.label}:</span> {view.sheet.delegate.value}
          </span>
          {header ? (
            <span data-campo={header.id}>
              <span>{header.name}:</span> {pending(sheet.territory)}
            </span>
          ) : null}
        </div>
        {sheet.note ? <p className="inv-sheet-note">{sheet.note}</p> : null}
        {sheet.sections.map((section) => (
          <div key={section.title}>
            <p className="inv-sheet-section">{section.title}</p>
            {section.rows.map((row) => (
              <div key={`${row.field}-${row.label}`} className={row.blank ? "inv-sheet-row is-blank" : "inv-sheet-row"} data-campo={row.field}>
                <span>{row.label}</span>
                <span>{row.blank ? null : pending(row.value)}</span>
              </div>
            ))}
          </div>
        ))}
        <p className="inv-sheet-foot">
          {fill(view.sheet.footer, { code: sheet.code, version: sheet.version, date, case: combo })}
        </p>
      </div>
    </>
  );
}
