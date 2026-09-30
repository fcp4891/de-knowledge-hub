import type { Metadata } from "next";

import { SiteHeader } from "@/components/SiteHeader";
import { listDomains } from "@/lib/api/client";

import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Data Engineering Knowledge Hub",
  description: "Estudio de Data Engineering por dominios y conceptos.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const domains = await listDomains();
  const warning = domains.ok
    ? null
    : domains.reason === "mock_missing"
      ? "Sin datos en modo mock."
      : domains.reason === "not_found"
        ? "No existe."
        : (domains.detail ?? "No se pudo contactar la API.");

  return (
    <html lang="es">
      <body>
        <SiteHeader domains={domains.ok ? domains.data.items : []} warning={warning} />
        {children}
      </body>
    </html>
  );
}
