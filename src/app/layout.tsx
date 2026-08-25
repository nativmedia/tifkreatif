import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SiteFooter, SiteHeader } from "@/components/site/chrome";
import { SITE } from "@/lib/constants";
import "./globals.css";

const jakarta = localFont({
  src: [
    { path: "../fonts/PlusJakartaSans[wght].ttf", weight: "200 800", style: "normal" },
    { path: "../fonts/PlusJakartaSans-Italic[wght].ttf", weight: "200 800", style: "italic" },
  ],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description:
    "Marketplace jasa kreatif Madura: temukan fotografer, desainer, videografer, dan talenta digital dari Bangkalan, Sampang, Pamekasan, dan Sumenep.",
  openGraph: {
    siteName: SITE.name,
    type: "website",
    locale: "id_ID",
  },
};

export const viewport: Viewport = {
  themeColor: "#fff8ed",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="flex min-h-svh flex-col">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-navy focus:px-4 focus:py-2 focus:text-bone"
        >
          Lompat ke konten
        </a>
        <SiteHeader />
        <main id="konten" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
