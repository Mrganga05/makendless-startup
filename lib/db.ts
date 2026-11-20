/* SERVER ONLY — never import this from a client component.
 * Tiny data layer for the three tables in supabase/schema.sql: leads, referral_codes, referral_uses.
 * Production: Supabase REST with the service role key (server only, never sent to the browser).
 *   Vercel env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Local testing without Supabase: a JSON file in .data/ (only outside production, or with MK_DEV_STORE=1).
 */
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type Table = "leads" | "referral_codes" | "referral_uses";
export type Row = Record<string, unknown>;
export class NotConfigured extends Error {}
export class Conflict extends Error {}

const URL_ = process.env.SUPABASE_URL?.replace(/\/$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const useSupabase = !!(URL_ && KEY);
const useFile = !useSupabase && (process.env.NODE_ENV !== "production" || process.env.MK_DEV_STORE === "1");
export const dbReady = useSupabase || useFile;

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

/* ---------- local JSON file (dev only) ---------- */
const FILE = path.join(process.cwd(), ".data", "dev-db.json");
const UNIQUE: Record<Table, string[]> = { leads: [], referral_codes: ["code", "whatsapp"], referral_uses: ["referred_whatsapp"] };
type Db = Record<Table, Row[]>;
async function load(): Promise<Db> {
  try { return JSON.parse(await fs.readFile(FILE, "utf8")) as Db; } catch { return { leads: [], referral_codes: [], referral_uses: [] }; }
}
async function save(db: Db) { await fs.mkdir(path.dirname(FILE), { recursive: true }); await fs.writeFile(FILE, JSON.stringify(db, null, 2)); }

/* ---------- API ---------- */
function need() { if (!dbReady) throw new NotConfigured("Database is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)."); }

export async function findOne(table: Table, col: string, value: string): Promise<Row | null> {
  need();
  if (useSupabase) return (await sb(`${table}?${col}=eq.${encodeURIComponent(value)}&select=*&limit=1`))[0] ?? null;
  return (await load())[table].find((r) => r[col] === value) ?? null;
}

export async function insert(table: Table, row: Row): Promise<Row> {
  need();
  if (useSupabase) return (await sb(table, { method: "POST", body: JSON.stringify(row) }))[0];
  const db = await load();
  for (const col of UNIQUE[table]) if (db[table].some((r) => r[col] === row[col])) throw new Conflict(`${table}.${col}`);
  const full = { id: randomUUID(), created_at: new Date().toISOString(), ...row };
  db[table].unshift(full);
  await save(db);
  return full;
}

export async function update(table: Table, id: string, patch: Row): Promise<void> {
  need();
  if (useSupabase) { await sb(`${table}?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) }); return; }
  const db = await load();
  const r = db[table].find((x) => x.id === id);
  if (r) Object.assign(r, patch);
  await save(db);
}

export async function list(table: Table, limit = 300): Promise<Row[]> {
  need();
  if (useSupabase) return sb(`${table}?select=*&order=created_at.desc&limit=${limit}`);
  return (await load())[table].slice(0, limit);
}
