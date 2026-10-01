"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SearchDialog } from "@/components/SearchDialog";

type DomainLink = {
  id: string;
  slug: string;
  title: string;
};

export function SiteHeader({ domains, warning }: { domains: DomainLink[]; warning?: string | null }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="site-header">
      <div className="brand">
        <Link href="/">Knowledge Hub</Link>
        <Link href="/explorer">Explorer</Link>
        <Link href="/snippets">Snippets</Link>
        <button type="button" onClick={() => setSearchOpen(true)}>
          Buscar <kbd>Ctrl+K</kbd>
        </button>
      </div>
      {warning ? (
        <p className="api-banner" role="status">
          {warning}
        </p>
      ) : null}
      <nav className="domain-nav" aria-label="Dominios">
        {domains.map((domain) => {
          const href = `/explorer/${domain.slug}`;
          const current = pathname === href;
          return (
            <Link key={domain.slug} href={href} aria-current={current ? "page" : undefined}>
              <span className="domain-id">{domain.id}</span>
              {domain.title}
            </Link>
          );
        })}
      </nav>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
