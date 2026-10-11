import type { Metadata } from "next";
import localFont from "next/font/local";

import { SideNav } from "@/components/SideNav";
import { listDomains, listStudyStates } from "@/lib/api/client";

import "../styles/tokens.css";
import "./globals.css";

const plexSans = localFont({
  src: "../fonts/ibm-plex-sans/ibm-plex-sans-latin.woff2",
  weight: "400 700",
  display: "swap",
  variable: "--font-plex-sans",
});

const sourceSerif = localFont({
  src: "../fonts/source-serif-4/source-serif-4-latin.woff2",
  weight: "400 600",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  variable: "--font-source-serif",
});

const jetbrainsMono = localFont({
  src: "../fonts/jetbrains-mono/jetbrains-mono-latin.woff2",
  weight: "400 500",
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Data Engineering Knowledge Hub",
  description: "Estudio de Data Engineering por dominios y conceptos.",
};

/** En static el contador se calcula en el navegador (SideNav), desde localStorage. */
async function reviewCount(): Promise<number | null> {
  if (process.env.API_MODE === "static") {
    return null;
  }
  const result = await listStudyStates("needs_review");
  return result.ok ? result.data.total : null;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [domains, count] = await Promise.all([listDomains(), reviewCount()]);
  const warning = domains.ok
    ? null
    : domains.reason === "mock_missing"
      ? "Sin datos en modo mock."
      : domains.reason === "not_found"
        ? "No existe."
        : (domains.detail ?? "No se pudo contactar la API.");

  return (
    <html lang="es" className={`${plexSans.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{if(localStorage.getItem("dekh:nav")==="collapsed")document.documentElement.dataset.nav="collapsed";}catch(e){}})();',
          }}
        />
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <div className="app-shell">
          <SideNav reviewCount={count} warning={warning} />
          <main id="contenido" className="app-main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
