/** Site-wide constants. Real values the owner has not supplied are left empty and listed in TODO-FOR-OWNER.md. */
export const SITE_NAME = "MAKENDLESS";
export const SITE_TAGLINE = "Creative & Technology Studio";
export const SITE_DESCRIPTION = "We make ideas into reality. Video editing and website development for creators and businesses. Digital marketing in beta.";
/** Public URL of the live site. Set NEXT_PUBLIC_SITE_URL once a domain is chosen (TODO-FOR-OWNER). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
/** Verified inquiry email. Empty until the owner confirms one (TODO-FOR-OWNER). Never invent it. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
export const ROUTES = ["", "/studios", "/create", "/build", "/grow", "/about", "/faq", "/contact", "/privacy", "/terms"] as const;
