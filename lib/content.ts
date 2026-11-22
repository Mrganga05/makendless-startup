/* SERVER ONLY. Loads the Owner's website content + public settings from the database (cached for 60 s,
   refreshed at once when /admin saves) and applies them to the shared data modules. */
import { cache } from "react";
import { applyContent, type SiteContent, type SiteSettings } from "../data/content";
import { devStore, list, useSupabase } from "./db";

const URL_ = process.env.SUPABASE_URL?.replace(/\/$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const CONTENT_TAG = "site-content";
const PUBLIC_SETTINGS = ["whatsapp", "email", "referral_reward", "referral_min"];

async function read(): Promise<{ c: SiteContent | null; s: SiteSettings | null }> {
  try {
    if (useSupabase) {
      const opts = { headers: { apikey: KEY!, Authorization: `Bearer ${KEY}` }, next: { revalidate: 60, tags: [CONTENT_TAG] }, signal: AbortSignal.timeout(5000) };
      const [cr, sr] = await Promise.all([
        fetch(`${URL_}/rest/v1/site_content?key=eq.site&select=value,updated_at`, opts),
        fetch(`${URL_}/rest/v1/app_settings?select=key,value`, opts),
      ]);
      const crow = cr.ok ? ((await cr.json()) as { value: SiteContent; updated_at: string }[])[0] : undefined;
      const srows = sr.ok ? ((await sr.json()) as { key: string; value: string }[]) : [];
      return { c: crow ? { ...crow.value, updatedAt: crow.updated_at } : null, s: Object.fromEntries(srows.filter((r) => PUBLIC_SETTINGS.includes(r.key)).map((r) => [r.key, r.value])) };
    }
    if (devStore) {
      const [cr, sr] = await Promise.all([list("site_content"), list("app_settings")]);
      const crow = cr.find((r) => r.key === "site");
      return { c: crow ? { ...(crow.value as SiteContent), updatedAt: String(crow.updated_at || "") } : null, s: Object.fromEntries(sr.filter((r) => PUBLIC_SETTINGS.includes(String(r.key))).map((r) => [r.key, String(r.value)])) };
    }
  } catch { /* database down: the site keeps the code defaults */ }
  return { c: null, s: null };
}

/** Once per request: read and apply. Every page and the root layout call it before rendering. */
export const loadContent = cache(async () => { const r = await read(); applyContent(r.c, r.s); return r; });
