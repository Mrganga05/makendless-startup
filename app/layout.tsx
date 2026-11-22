import type { Metadata, Viewport } from "next";
import { Syne } from "next/font/google";
import "./globals.css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { SelectionProvider } from "../components/pricing/state";
import { HOME_DESCRIPTION, HOME_TITLE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../lib/site";
import WhatsAppFloat from "../components/WhatsAppFloat";
import PublicChrome from "../components/PublicChrome";
import MetaPixel from "../components/MetaPixel";
import { services } from "../data/pricing";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap", adjustFontFallback: false });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: HOME_TITLE, template: `%s | ${SITE_NAME}` },
  description: HOME_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["video editing", "website development", "web design", "Reels editing", "YouTube editing", "e-commerce websites", "booking websites", "motion graphics", "creative studio", "MAKENDLESS"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: { type: "website", siteName: SITE_NAME, title: HOME_TITLE, description: HOME_DESCRIPTION, url: "/" },
  twitter: { card: "summary_large_image", title: HOME_TITLE, description: HOME_DESCRIPTION },
};
export const viewport: Viewport = { themeColor: "#0c1024", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={syne.variable}>
      <body>
        <noscript><style>{`.rv-mask-up>.rv-inner,.kh-inner{transform:none!important}.rv-wipe-right,.rv-clip-down{clip-path:none!important}.rv-scale-in,.rv-fade{opacity:1!important;transform:none!important}`}</style></noscript>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-bold focus:text-black">Skip to content</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/icon.svg`,
          description: SITE_DESCRIPTION, slogan: "We make ideas impossible to ignore.",
          knowsAbout: services.map((s) => s.name),
        }) }} />
        <PublicChrome><Nav /></PublicChrome>
        <SelectionProvider><main id="main">{children}</main><WhatsAppFloat /></SelectionProvider>
        <PublicChrome><Footer /></PublicChrome>
        <MetaPixel />
      </body>
    </html>
  );
}
