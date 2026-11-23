/* SERVER ONLY — never import this from a client component.
 * Data layer for the tables in supabase/schema.sql.
 * Production: Supabase REST with the service role key (Vercel env SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY, never sent to the browser).
 * Local testing without Supabase: a JSON file in .data/ (only outside production, or with MK_DEV_STORE=1).
 */
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type Table = "leads" | "referral_codes" | "referral_uses" | "waitlist" | "team_members" | "app_settings"
  | "projects" | "payments" | "expenses" | "trash" | "activity_log" | "backups" | "site_content";
export const KEYED: Partial<Record<Table, string>> = { referral_codes: "code", team_members: "email", app_settings: "key", site_content: "key" };
export type Row = Record<string, unknown>;
export class NotConfigured extends Error {}
export class Conflict extends Error {}

const URL_ = process.env.SUPABASE_URL?.replace(/\/$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const useSupabase = !!(URL_ && KEY);
const useFile = !useSupabase && (process.env.NODE_ENV !== "production" || process.env.MK_DEV_STORE === "1");
export const dbReady = useSupabase || useFile;
export const devStore = useFile;

/* ---------- Supabase REST ---------- */
async function sb(pathq: string, init: RequestInit = {}) {
  const res = await fetch(`${URL_}/rest/v1/${pathq}`, {
    ...init,
    cache: "no-store",
    headers: { apikey: KEY!, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=representation", ...(init.headers || {}) },
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 409) throw new Conflict(await res.text());
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.status === 204 ? [] : ((await res.json()) as Row[]);
}
const q = (v: unknown) => encodeURIComponent(String(v));

/* ---------- local JSON file (dev only) ---------- */
const FILE = path.join(process.cwd(), ".data", "dev-db.json");
const UNIQUE: Record<Table, string[][]> = {
  leads: [], referral_codes: [["code"], ["referrer_whatsapp"]], referral_uses: [["new_client_whatsapp"]],
  waitlist: [["email", "interest"]], team_members: [["email"]], app_settings: [["key"]],
  projects: [], payments: [], expenses: [], trash: [], activity_log: [], backups: [], site_content: [["key"]],
};
type Db = Record<Table, Row[]>;
async function load(): Promise<Db> {
  try { const d = JSON.parse(await fs.readFile(FILE, "utf8")) as Db; for (const t of Object.keys(UNIQUE) as Table[]) d[t] ??= []; return d; } catch {
    return { projects: [], payments: [], expenses: [], trash: [], activity_log: [], backups: [], site_content: [], leads: [], referral_codes: [], referral_uses: [], waitlist: [], team_members: [{ email: "makendlessofficial@gmail.com", name: "MAKENDLESS", role: "Admin", active: true }], app_settings: [{ key: "alert_email", value: "makendlessofficial@gmail.com" }] };
  }
}
async function save(db: Db) { await fs.mkdir(path.dirname(FILE), { recursive: true }); await fs.writeFile(FILE, JSON.stringify(db, null, 2)); }
const DEFAULTS: Partial<Record<Table, Row>> = {
  leads: { status: "New", notes: "", team_notes: [], activity: [], advance_paid: false, balance_paid: false, form: "Start a Project", lead_source: "Website", whatsapp: "" },
  projects: { status: "Not started", price: 0, team_payout: 0, payout_done: false, notes: "", services: "", studio: "", client_whatsapp: "" },
  payments: { kind: "Advance", method: "UPI" }, expenses: { category: "Other", amount: 0, paid_by: "", notes: "" },
  referral_codes: { credits_earned: 0, credits_used: 0 }, referral_uses: { status: "Pending" }, waitlist: { interest: "GROW" },
};

/* ---------- API ---------- */
function need() { if (!dbReady) throw new NotConfigured("Database is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)."); }

export async function findOne(table: Table, col: string, value: string): Promise<Row | null> {
  need();
  if (useSupabase) return (await sb(`${table}?${col}=eq.${q(value)}&select=*&limit=1`))[0] ?? null;
  return (await load())[table].find((r) => String(r[col]) === value) ?? null;
}

export async function insert(table: Table, row: Row): Promise<Row> {
  need();
  if (useSupabase) return (await sb(table, { method: "POST", body: JSON.stringify(row) }))[0];
  const db = await load();
  for (const cols of UNIQUE[table]) if (db[table].some((r) => cols.every((c) => r[c] === row[c]))) throw new Conflict(`${table}.${cols.join("+")}`);
  const now = new Date().toISOString();
  const full = { ...(KEYED[table] ? {} : { id: randomUUID() }), created_at: now, ...(table === "leads" || table === "projects" ? { updated_at: now } : {}), ...(table === "trash" ? { deleted_at: now } : {}), ...DEFAULTS[table], ...row };
  db[table].unshift(full);
  await save(db);
  return full;
}

export async function update(table: Table, col: string, value: string, patch: Row): Promise<void> {
  need();
  if (useSupabase) { await sb(`${table}?${col}=eq.${q(value)}`, { method: "PATCH", body: JSON.stringify(patch) }); return; }
  const db = await load();
  for (const r of db[table]) if (String(r[col]) === value) Object.assign(r, patch);
  await save(db);
}

export async function upsert(table: Table, row: Row, onConflict: string): Promise<void> {
  need();
  if (useSupabase) { await sb(`${table}?on_conflict=${onConflict}`, { method: "POST", body: JSON.stringify(row), headers: { Prefer: "resolution=merge-duplicates,return=minimal" } }); return; }
  const db = await load();
  const r = db[table].find((x) => x[onConflict] === row[onConflict]);
  if (r) Object.assign(r, row); else db[table].unshift({ created_at: new Date().toISOString(), ...row });
  await save(db);
}

export async function remove(table: Table, col: string, values: string[]): Promise<void> {
  need();
  if (!values.length) return;
  if (useSupabase) { await sb(`${table}?${col}=in.(${values.map(q).join(",")})`, { method: "DELETE" }); return; }
  const db = await load();
  db[table] = db[table].filter((r) => !values.includes(String(r[col])));
  await save(db);
}

export async function list(table: Table, limit = 5000): Promise<Row[]> {
  need();
  const order = table === "team_members" || table === "app_settings" || table === "site_content" ? "" : table === "trash" ? "&order=deleted_at.desc" : "&order=created_at.desc";
  if (useSupabase) return sb(`${table}?select=*${order}&limit=${limit}`);
  return (await load())[table].slice(0, limit);
}

/** Rows in `table` with col = value created after `sinceISO` (rate limiting). */
export async function countSince(table: Table, col: string, value: string, sinceISO: string): Promise<number> {
  need();
  if (useSupabase) return (await sb(`${table}?${col}=eq.${q(value)}&created_at=gt.${q(sinceISO)}&select=created_at`)).length;
  return (await load())[table].filter((r) => r[col] === value && String(r.created_at) > sinceISO).length;
}
