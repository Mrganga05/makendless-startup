/** Site-wide constants. Real values the owner has not supplied are left empty and listed in TODO-FOR-OWNER.md. */
export const SITE_NAME = "MAKENDLESS";
export const SITE_TAGLINE = "Creative & Technology Studio";
export const SITE_DESCRIPTION = "We make ideas impossible to ignore. Video editing, websites, automation and AI for creators and businesses. Digital marketing in beta.";
import type { Metadata } from "next";
import { SETTINGS } from "../data/settings";
/** Page metadata where og:title always equals the page's own <title> ("<title> | MAKENDLESS").
 *  Share images come from each page folder (app/<page>/opengraph-image.jpg, made by scripts/og-pages.mjs). */
export function pageMeta(title: string, description: string, path: string, extra: Metadata = {}): Metadata {
  const full = `${title} | ${SITE_NAME}`;
  return {
    title, description, alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE_NAME, title: full, description, url: path, locale: "en_IN" },
    twitter: { card: "summary_large_image", title: full, description },
    ...extra,
  };
}
/** Public URL of the live site: set once in data/owner.ts (LIVE_URL) or NEXT_PUBLIC_SITE_URL. Never localhost. */
export const SITE_URL = SETTINGS.siteUrl;
/** Verified inquiry email. Empty until the owner confirms one (TODO-FOR-OWNER). Never invent it. */
export const CONTACT_EMAIL = SETTINGS.email;
export const ROUTES = ["", "/studios", "/work", "/create", "/build", "/grow", "/about", "/faq", "/contact", "/privacy", "/terms"] as const;
export const HOME_TITLE = "MAKENDLESS | Video Editing, Websites, Automation & AI Studio";
export const HOME_DESCRIPTION = "Startup creative and technology studio in India. Video editing, websites, WhatsApp automation and AI, with clear fixed prices.";
