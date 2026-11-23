/* Website content that the Owner edits in /admin → Website content (stored in the database, table site_content).
   The code values in data/pricing.ts and data/process.ts are the defaults until something is saved. Work items come only from data/work.ts.
   applyContent() swaps the live values in place, on the server (lib/content.ts) and in the browser (ContentBoot). */
import { combos, rebuildIndexes, REFERRAL, services, type Combo, type Service } from "./pricing";
import { faqGroups, faqs, type Faq } from "./process";
import { OWNER } from "./owner";
import { SETTINGS } from "./settings";
import { REVIEWS } from "./work";

export type WorkItem = { id: string; kind: "reel" | "site"; title: string; url: string; image?: string; hidden?: boolean };
export type Review = { id: string; name: string; role?: string; text: string; hidden?: boolean };
export interface SiteContent { services: Service[]; combos: Combo[]; faq: { title: string; items: Faq[] }[]; work: WorkItem[]; reviews: Review[]; updatedAt?: string }
export type SiteSettings = Partial<Record<"whatsapp" | "email" | "referral_reward" | "referral_min", string>>;

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
/** The code defaults (what the site shows before anything is saved in /admin). */
export const DEFAULT_CONTENT: SiteContent = clone({
  services, combos, faq: faqGroups,
  /* Work is no longer edited here: data/work.ts is the one place (it carries videos, posters and screenshots). */
  work: [],
  reviews: [],
});
const DEFAULT_SETTINGS = { whatsapp: SETTINGS.whatsapp, email: SETTINGS.email, discount: REFERRAL.discount, credit: REFERRAL.credit, min: REFERRAL.minTotal };

let last = "";
const swap = <T,>(arr: T[], next: T[]) => { arr.splice(0, arr.length, ...next); };

export function applyContent(c: Partial<SiteContent> | null, s: SiteSettings | null) {
  const key = JSON.stringify([c?.updatedAt ?? "", s ?? {}]);
  if (key === last) return;
  last = key;
  const src = { ...DEFAULT_CONTENT, ...(c || {}) };
  swap(services, clone(src.services?.length ? src.services : DEFAULT_CONTENT.services));
  rebuildIndexes();
  swap(combos, clone(src.combos ?? DEFAULT_CONTENT.combos));
  const faq = clone(src.faq?.length ? src.faq : DEFAULT_CONTENT.faq);
  swap(faqGroups, faq);
  swap(faqs, faq.flatMap((g) => g.items));
  swap(REVIEWS, (src.reviews || []).filter((r) => !r.hidden && r.text).map((r) => ({ name: r.name, role: r.role, text: r.text })));
  const num = (v: string | undefined, d: number) => { const n = Number(v); return Number.isFinite(n) && n > 0 ? Math.round(n) : d; };
  SETTINGS.whatsapp = OWNER.whatsapp = s?.whatsapp?.trim() || DEFAULT_SETTINGS.whatsapp;
  SETTINGS.email = OWNER.email = s?.email?.trim() || DEFAULT_SETTINGS.email;
  REFERRAL.discount = REFERRAL.credit = num(s?.referral_reward, DEFAULT_SETTINGS.discount);
  REFERRAL.minTotal = num(s?.referral_min, DEFAULT_SETTINGS.min);
}
