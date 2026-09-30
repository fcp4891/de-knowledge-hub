import type { Metadata } from "next";

import { SiteHeader } from "@/components/SiteHeader";
import { listDomains } from "@/lib/api/client";

import "./globals.css";

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

  return (
    <html lang="es">
      <body>
        <SiteHeader domains={domains.ok ? domains.data.items : []} />
        {children}
      </body>
    </html>
  );
}
