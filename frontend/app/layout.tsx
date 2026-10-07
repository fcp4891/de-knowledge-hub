import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono, Source_Serif_4 } from "next/font/google";

import { SideNav } from "@/components/SideNav";
import { listDomains, listStudyStates } from "@/lib/api/client";

import "../styles/tokens.css";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-source-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
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
