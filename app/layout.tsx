import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dialekta - Handwerk",
  description: "Originalgetreu ueberfuehrte HTML-Vorlage in Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
