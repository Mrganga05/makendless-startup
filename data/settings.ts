/**
 * CENTRAL SETTINGS — the one place for the site URL, WhatsApp number and email.
 * The values themselves live in `data/owner.ts` (change them there). Never hard-code them anywhere else.
 * The site URL can also be overridden per deploy with NEXT_PUBLIC_SITE_URL (Vercel → Environment Variables).
 */
import { LIVE_URL, OWNER, SOCIALS, WHATSAPP_MESSAGE } from "./owner";

const isPlaceholder = (v: string) => !v || /^\[.*\]$/.test(v.trim());

export const SETTINGS = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || LIVE_URL).replace(/\/$/, ""),
  whatsapp: isPlaceholder(OWNER.whatsapp) ? "" : OWNER.whatsapp,
  email: isPlaceholder(OWNER.email) ? "" : OWNER.email,
  whatsappMessage: WHATSAPP_MESSAGE,
  socials: SOCIALS,
  location: "India",
};

/** Digits for wa.me links (adds India's 91 to a 10-digit number). Empty until a real number is set in data/owner.ts. */
export const whatsappDigits = () => {
  const d = SETTINGS.whatsapp.replace(/\D/g, "");
  if (d.length === 10) return `91${d}`;
  return d.length >= 11 ? d : "";
};

/** wa.me link to the team with an optional pre-filled message, or "" when no number is set yet. */
export function whatsappTo(text?: string) {
  const digits = whatsappDigits();
  if (!digits) return "";
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** wa.me share link with no recipient (the visitor picks a chat). */
export const whatsappShare = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;
