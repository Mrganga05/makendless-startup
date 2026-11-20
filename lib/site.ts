/** Site-wide constants. Real values the owner has not supplied are left empty and listed in TODO-FOR-OWNER.md. */
export const SITE_NAME = "MAKENDLESS";
export const SITE_TAGLINE = "Creative & Technology Studio";
export const SITE_DESCRIPTION = "We make ideas impossible to ignore. Video editing and website development for creators and businesses. Digital marketing in beta.";
import { SETTINGS } from "../data/settings";
/** Public URL of the live site: set once in data/owner.ts (LIVE_URL) or NEXT_PUBLIC_SITE_URL. Never localhost. */
export const SITE_URL = SETTINGS.siteUrl;
/** Verified inquiry email. Empty until the owner confirms one (TODO-FOR-OWNER). Never invent it. */
export const CONTACT_EMAIL = SETTINGS.email;
export const ROUTES = ["", "/studios", "/create", "/build", "/grow", "/about", "/faq", "/contact", "/privacy", "/terms"] as const;
export const HOME_TITLE = "MAKENDLESS | Video Editing, Websites & Automation Studio";
export const HOME_DESCRIPTION = "Startup creative and technology studio in India. Video editing, websites, WhatsApp automation and AI, with clear fixed prices.";
