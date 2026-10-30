"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";

import {
  CHILE_GROUPS,
  CHILE_PRINCIPLES,
  CHILE_ROLES,
  type ChileArticle,
  type ChileFicha,
  type ChileGroup,
  type ChilePrinciple,
} from "@/lib/chileLegalCatalog";
import { bcnLinkText, legalRowId } from "@/lib/legal";

function fold(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function fichaText(ficha: ChileFicha): string {
  return ficha.kind === "page" ? `${ficha.title} ${ficha.slug}` : ficha.label;
}

function matches(article: ChileArticle, query: string): boolean {
  if (!query) {
    return true;
  }
  const haystack = fold(
    [article.article, article.title, article.basis, article.implication, article.precision ?? "", ...article.fichas.map(fichaText)].join(
      " ",
    ),
  );
  return haystack.includes(query);
}

function groupFromSearch(search: string): string | null {
  const value = new URLSearchParams(search).get("grupo");
  if (!value) {
    return null;
  }
  return CHILE_GROUPS.some((group) => group.id === value) ? value : null;
}

function writeLocation(search: string, hash: string) {
  history.replaceState(null, "", `${window.location.pathname}${search}${hash}`);
}

function chooseGroup(next: string | null) {
  const url = new URL(window.location.href);
  if (next) {
    url.searchParams.set("grupo", next);
  } else {
    url.searchParams.delete("grupo");
  }
  writeLocation(url.search, url.hash);
}

function pushHash(id: string) {
  const url = new URL(window.location.href);
  history.pushState(null, "", `${url.pathname}${url.search}#${id}`);
}

function findArticle(id: string): ChileArticle | null {
  for (const group of CHILE_GROUPS) {
    for (const item of group.articles) {
      if (legalRowId("ley-19628", item.article) === id) {
        return item;
      }
    }
  }
  return null;
}

function ViewIcon() {
  return (
    <svg className="lf-view-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function Fichas({ fichas }: { fichas: ChileFicha[] }) {
  return (
    <div className="lf-links">
      {fichas.map((ficha) =>
        ficha.kind === "page" ? (
          <a key={ficha.slug} href={`/concepts/${ficha.slug}/`}>
            {ficha.title}
          </a>
        ) : ficha.href ? (
          <a key={ficha.label} href={ficha.href}>
            {ficha.label}
          </a>
        ) : (
          <span key={ficha.label}>{ficha.label}</span>
        ),
      )}
    </div>
  );
}

export function LegalFoundations() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<string | null>(null);
  const [open, setOpen] = useState<ChileArticle | null>(null);
  const [hitId, setHitId] = useState<string | null>(null);
  const folded = fold(query.trim());

  const visible = useMemo(() => {
    return CHILE_GROUPS.filter((group) => theme === null || group.id === theme)
      .map((group) => ({
        ...group,
        articles: group.articles.filter((item) => matches(item, folded)),
      }))
      .filter((group) => group.articles.length > 0);
  }, [folded, theme]);

  function showArticle(item: ChileArticle, fromHash: boolean) {
    setOpen(item);
    if (!fromHash) {
      return;
    }
    const id = legalRowId("ley-19628", item.article);
    setHitId(id);
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 40);
    window.setTimeout(() => setHitId((current) => (current === id ? null : current)), 2400);
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    function openFromHash() {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      const item = id.startsWith("lb-") ? findArticle(id) : null;
      if (item) {
        showArticle(item, true);
      }
    }
    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest("a[href^='#lb-']");
      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }
      const id = decodeURIComponent(link.getAttribute("href")?.slice(1) ?? "");
      const item = findArticle(id);
      if (!item) {
        return;
      }
      event.preventDefault();
      pushHash(id);
      showArticle(item, true);
    }
    function syncGroup() {
      setTheme(groupFromSearch(window.location.search));
    }
    syncGroup();
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    window.addEventListener("popstate", syncGroup);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      window.removeEventListener("popstate", syncGroup);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="legal-foundations">
      <h3>Ocho principios del artículo 3</h3>
      <ul className="lf-principles">
        {CHILE_PRINCIPLES.map((item) => (
          <PrincipleTip key={item.label} principle={item} />
        ))}
      </ul>
      <h3>Catálogo legal agrupado por temática</h3>
      <div className="lf-tools">
        <input
          type="search"
          value={query}
          placeholder="Buscar artículo, concepto, implicancia o ficha"
          aria-label="Buscar en el catálogo legal"
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="lf-filters" role="group" aria-label="Filtrar por temática">
        <button
          type="button"
          aria-pressed={theme === null}
          onClick={() => {
            setTheme(null);
            chooseGroup(null);
          }}
        >
          Todas
        </button>
        {CHILE_GROUPS.map((group) => (
          <button
            key={group.id}
            type="button"
            aria-pressed={theme === group.id}
            onClick={() => {
              setTheme(group.id);
              chooseGroup(group.id);
            }}
          >
            {group.title}
          </button>
        ))}
      </div>
      {visible.length === 0 ? <p className="lf-quiet">Ningún artículo coincide con la búsqueda.</p> : null}
      {visible.map((group) => (
        <GroupBlock key={group.id} group={group} hitId={hitId} onOpen={(item) => showArticle(item, false)} />
      ))}
      <ArticleModal dialogRef={dialogRef} article={open} onClose={() => setOpen(null)} />
      <h3>Responsabilidades: quién decide y quién implementa</h3>
      <ul>
        {CHILE_ROLES.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function PrincipleTip({ principle }: { principle: ChilePrinciple }) {
  const rootRef = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const skipClick = useRef(false);
  const closing = useRef(false);
  const [shown, setShown] = useState(false);
  const tipId = `lf-tip-${principle.slug}`;

  return (
    <li
      className="lf-principle"
      ref={rootRef}
      onMouseEnter={() => setShown(true)}
      onMouseLeave={() => {
        window.setTimeout(() => {
          if (rootRef.current?.contains(document.activeElement)) {
            return;
          }
          setShown(false);
        }, 0);
      }}
      onBlur={(event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && rootRef.current?.contains(next)) {
          return;
        }
        window.setTimeout(() => {
          if (rootRef.current?.contains(document.activeElement)) {
            return;
          }
          setShown(false);
        }, 0);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !shown) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        closing.current = true;
        setShown(false);
        buttonRef.current?.focus();
        window.setTimeout(() => {
          closing.current = false;
        }, 0);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="lf-principle-trigger"
        aria-describedby={shown ? tipId : undefined}
        aria-expanded={shown}
        onFocus={() => {
          if (closing.current) {
            return;
          }
          skipClick.current = true;
          setShown(true);
        }}
        onClick={() => {
          if (skipClick.current) {
            skipClick.current = false;
            setShown(true);
            return;
          }
          setShown(true);
        }}
      >
        {principle.label}
      </button>
      {shown ? (
        <span className="lf-tip" id={tipId} role="tooltip">
          <span>{principle.description}</span>
          <a href={`/concepts/${principle.slug}/`}>Ver en detalle →</a>
        </span>
      ) : null}
    </li>
  );
}

function GroupBlock({
  group,
  hitId,
  onOpen,
}: {
  group: ChileGroup;
  hitId: string | null;
  onOpen: (item: ChileArticle) => void;
}) {
  return (
    <section id={group.id} aria-labelledby={`${group.id}-title`}>
      <h3 className="lf-group-title" id={`${group.id}-title`}>
        <span>{group.title}</span>
        <span className="lf-count">
          {group.articles.length} {group.articles.length === 1 ? "artículo" : "artículos"}
        </span>
      </h3>
      <ul className="lf-list">
        {group.articles.map((item) => {
          const id = legalRowId("ley-19628", item.article);
          return (
            <li key={item.article} id={id} className={hitId === id ? "is-hit" : undefined}>
              <button type="button" onClick={() => onOpen(item)}>
                <span className="lf-art">art. {item.article}</span>
                <span className="lf-name">{item.title}</span>
                <span className="lf-view">
                  <ViewIcon />
                  <span>Ver</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ArticleBody({ article }: { article: ChileArticle }) {
  return (
    <dl className="lf-body">
      <div>
        <dt>Fundamento legal</dt>
        <dd>{article.basis}</dd>
      </div>
      <div>
        <dt>Implicancia técnica</dt>
        <dd>{article.implication}</dd>
      </div>
      {article.precision ? (
        <div>
          <dt>Alcance y precisión</dt>
          <dd>{article.precision}</dd>
        </div>
      ) : null}
      <div>
        <dt>Ficha relacionada</dt>
        <dd>
          <Fichas fichas={article.fichas} />
        </dd>
      </div>
      <div>
        <dt>Referencia</dt>
        <dd>
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            Ley 19.628 modificada, art. {article.article}
            <span> · {bcnLinkText(article.url)}</span>
          </a>
        </dd>
      </div>
    </dl>
  );
}

function ArticleModal({
  dialogRef,
  article,
  onClose,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  article: ChileArticle | null;
  onClose: () => void;
}) {
  return (
    <dialog
      ref={dialogRef}
      className="lf-modal"
      aria-labelledby="lf-modal-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {article ? (
        <>
          <header className="lf-modal-head">
            <h3 id="lf-modal-title">
              <span className="lf-art">art. {article.article}</span> {article.title}
            </h3>
            <button type="button" onClick={onClose}>
              Cerrar
            </button>
          </header>
          <ArticleBody article={article} />
        </>
      ) : null}
    </dialog>
  );
}
