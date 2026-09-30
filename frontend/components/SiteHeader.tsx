"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type DomainLink = {
  id: string;
  slug: string;
  title: string;
};

export function SiteHeader({ domains }: { domains: DomainLink[] }) {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="brand">
        <Link href="/">Knowledge Hub</Link>
        <Link href="/explorer">Explorer</Link>
      </div>
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
    </header>
  );
}
