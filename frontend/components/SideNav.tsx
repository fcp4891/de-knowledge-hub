"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { SearchDialog } from "@/components/SearchDialog";
import { listStoredStudy, subscribePersonal } from "@/lib/personalStore";

const IS_STATIC = process.env.NEXT_PUBLIC_API_MODE === "static";

type NavItem = { href: string; label: string; exact?: boolean };

const ITEMS: NavItem[] = [
  { href: "/", label: "Inicio", exact: true },
  { href: "/explorer", label: "Rutas" },
  { href: "/repaso", label: "Repaso" },
  { href: "/snippets", label: "Snippets" },
];

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
  const searchOpener = useRef<HTMLElement | null>(null);
  const count = useReviewCount(reviewCount);

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
      }
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
        <Link href="/" className="side-brand">
          <span className="side-brand-name">Knowledge Hub</span>
          <span className="side-brand-sub">Data Engineering</span>
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
          onClick={(event) => {
            searchOpener.current = event.currentTarget;
            setSearchOpen(true);
          }}
        >
          <span>Buscar</span>
          <kbd>Ctrl K</kbd>
        </button>
        <nav aria-label="Principal">
          <ul className="side-links">
            {ITEMS.map((item) => {
              const current = isCurrent(pathname, item);
              const showCount = item.href === "/repaso" && count !== null && count > 0;
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={current ? "page" : undefined}>
                    <span>{item.label}</span>
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
