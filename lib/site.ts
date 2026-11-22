/** Site-wide constants. Real values the owner has not supplied are left empty and listed in TODO-FOR-OWNER.md. */
export const SITE_NAME = "MAKENDLESS";
export const SITE_TAGLINE = "Creative & Technology Studio";
export const SITE_DESCRIPTION = "We make ideas impossible to ignore. Video editing, websites, automation and AI for creators and businesses. Digital marketing in beta.";
import type { Metadata } from "next";
import { SETTINGS } from "../data/settings";
/** Page metadata where og:title always equals the page's own <title> ("<title> | MAKENDLESS"). */
export function pageMeta(title: string, description: string, path: string, extra: Metadata = {}): Metadata {
  const full = `${title} | ${SITE_NAME}`;
  return {
    title, description, alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE_NAME, title: full, description, url: path, images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: SITE_NAME }] },
    twitter: { card: "summary_large_image", title: full, description, images: ["/twitter-image.png"] },
    ...extra,
  };
}
/** Public URL of the live site: set once in data/owner.ts (LIVE_URL) or NEXT_PUBLIC_SITE_URL. Never localhost. */
export const SITE_URL = SETTINGS.siteUrl;
/** Verified inquiry email. Empty until the owner confirms one (TODO-FOR-OWNER). Never invent it. */
export const CONTACT_EMAIL = SETTINGS.email;
export const ROUTES = ["", "/studios", "/create", "/build", "/grow", "/about", "/faq", "/contact", "/privacy", "/terms"] as const;
export const HOME_TITLE = "MAKENDLESS | Video Editing, Websites, Automation & AI Studio";
export const HOME_DESCRIPTION = "Startup creative and technology studio in India. Video editing, websites, WhatsApp automation and AI, with clear fixed prices.";
