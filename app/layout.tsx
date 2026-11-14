import type { Metadata, Viewport } from "next";
import { Syne } from "next/font/google";
import "./globals.css";
import Nav from "../components/Nav";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });

export const metadata: Metadata = {
  title: { default: "MAKENDLESS — Creative & Technology Studio", template: "%s — MAKENDLESS" },
  description: "We make ideas impossible to ignore. Premium video editing, website development and digital marketing (beta) for creators and businesses.",
};
export const viewport: Viewport = { themeColor: "#0c1024", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={syne.variable}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black">Skip to content</a>
        <Nav />
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
