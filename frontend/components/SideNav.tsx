"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { SearchDialog } from "@/components/SearchDialog";
import { listStoredStudy, subscribePersonal } from "@/lib/personalStore";

const IS_STATIC = process.env.NEXT_PUBLIC_API_MODE === "static";

type NavItem = { href: string; label: string; exact?: boolean };

const NAV_KEY = "dekh:nav";

const ITEMS: NavItem[] = [
  { href: "/", label: "Inicio", exact: true },
  { href: "/explorer", label: "Rutas" },
  { href: "/repaso", label: "Repaso" },
  { href: "/snippets", label: "Snippets" },
];

function isTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

function Icon({ name }: { name: "home" | "routes" | "review" | "snippets" | "search" | "mark" | "collapse" | "expand" }) {
  const props = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  if (name === "home") {
    return (
      <svg {...props}>
        <path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
      </svg>
    );
  }
  if (name === "routes") {
    return (
      <svg {...props}>
        <circle cx="6" cy="6" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M8 6h6a4 4 0 0 1 4 4v6" />
      </svg>
    );
  }
  if (name === "review") {
    return (
      <svg {...props}>
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
      </svg>
    );
  }
  if (name === "snippets") {
    return (
      <svg {...props}>
        <path d="m8 8-4 4 4 4" />
        <path d="m16 8 4 4-4 4" />
      </svg>
    );
  }
  if (name === "search") {
    return (
      <svg {...props}>
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    );
  }
  if (name === "mark") {
    return (
      <svg {...props}>
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M8 15V9h2.2a2 2 0 0 1 0 4H8" />
      </svg>
    );
  }
  if (name === "collapse") {
    return (
      <svg {...props}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16" />
        <path d="m14 9-3 3 3 3" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="m13 9 3 3-3 3" />
    </svg>
  );
}

function itemIcon(href: string): "home" | "routes" | "review" | "snippets" {
  if (href === "/") {
    return "home";
  }
  if (href === "/explorer") {
    return "routes";
  }
  if (href === "/repaso") {
    return "review";
  }
  return "snippets";
}

function isCurrent(pathname: string, item: NavItem): boolean {
  if (item.exact) {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** En static el estado de estudio vive en localStorage; en hybrid llega del servidor. */
function useReviewCount(serverCount: number | null): number | null {
  const [storedCount, setStoredCount] = useState<number | null>(null);

  useEffect(() => {
    if (!IS_STATIC) {
      return;
    }
    const refresh = () =>
      setStoredCount(listStoredStudy().filter((item) => item.state === "needs_review").length);
    refresh();
    return subscribePersonal(refresh);
  }, []);

  return IS_STATIC ? storedCount : serverCount;
}

export function SideNav({ reviewCount, warning }: { reviewCount: number | null; warning?: string | null }) {
  const pathname = usePathname();
  const menuId = useId();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const searchOpener = useRef<HTMLElement | null>(null);
  const count = useReviewCount(reviewCount);

  useLayoutEffect(() => {
    const stored = localStorage.getItem(NAV_KEY) === "collapsed";
    setCollapsed(stored);
    document.documentElement.dataset.nav = stored ? "collapsed" : "expanded";
  }, []);

  function setNavCollapsed(next: boolean) {
    setCollapsed(next);
    document.documentElement.dataset.nav = next ? "collapsed" : "expanded";
    localStorage.setItem(NAV_KEY, next ? "collapsed" : "expanded");
  }

  useEffect(() => {
    setSearchOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setSearchOpen(true);
        return;
      }
      const altGr = event.altKey && event.ctrlKey;
      if (event.key !== "[" || event.metaKey || isTextField(event.target) || (event.ctrlKey && !altGr)) {
        return;
      }
      event.preventDefault();
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setNavCollapsed(document.documentElement.dataset.nav !== "collapsed");
        return;
      }
      setMenuOpen((open) => !open);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || searchOpen) {
        return;
      }
      setMenuOpen(false);
      document.querySelector<HTMLButtonElement>(".side-menu-toggle")?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, searchOpen]);

  return (
    <header className="side-nav">
      <div className="side-nav-top">
        <Link
          href="/"
          className="side-brand"
          aria-label={collapsed ? "Knowledge Hub" : undefined}
          title={collapsed ? "Knowledge Hub" : undefined}
        >
          <Icon name="mark" />
          <span className="side-brand-name" aria-hidden={collapsed || undefined}>
            Knowledge Hub
          </span>
          <span className="side-brand-sub" aria-hidden={collapsed || undefined}>
            Data Engineering
          </span>
        </Link>
        <button
          type="button"
          className="side-menu-toggle"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Cerrar" : "Menú"}
        </button>
      </div>
      <div id={menuId} className="side-nav-body" data-open={menuOpen ? "true" : "false"}>
        <button
          type="button"
          className="side-search"
          aria-label={collapsed ? "Buscar" : undefined}
          title={collapsed ? "Buscar" : undefined}
          onClick={(event) => {
            searchOpener.current = event.currentTarget;
            setSearchOpen(true);
          }}
        >
          <Icon name="search" />
          <span className="side-link-label" aria-hidden={collapsed || undefined}>
            Buscar
          </span>
          <kbd>Ctrl K</kbd>
        </button>
        <nav aria-label="Principal">
          <ul className="side-links">
            {ITEMS.map((item) => {
              const current = isCurrent(pathname, item);
              const showCount = item.href === "/repaso" && count !== null && count > 0;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    aria-label={collapsed ? item.label : undefined}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon name={itemIcon(item.href)} />
                    <span className="side-link-label" aria-hidden={collapsed || undefined}>
                      {item.label}
                    </span>
                    {showCount ? (
                      <span className="side-count" aria-label={`${count} para repasar`}>
                        {count}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <button
          type="button"
          className="side-collapse"
          aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
          title={collapsed ? "Expandir menú" : "Contraer menú"}
          onClick={() => setNavCollapsed(!collapsed)}
        >
          <Icon name={collapsed ? "expand" : "collapse"} />
        </button>
      </div>
      {warning ? (
        <p className="api-banner" role="status">
          {warning}
        </p>
      ) : null}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} returnFocusRef={searchOpener} />
    </header>
  );
}
