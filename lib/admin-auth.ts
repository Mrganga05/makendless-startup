/* SERVER ONLY. /admin access.
   Login = one-time magic link from Supabase Auth, sent only to emails listed (active) in team_members.
   After the link is opened, the site sets a signed, httpOnly session cookie. Every request re-checks team_members,
   so deactivating a member removes access immediately. */
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { devStore, findOne } from "./db";

export const COOKIE = "mk_admin";
const SB = process.env.SUPABASE_URL?.replace(/\/$/, "");
const ANON = process.env.SUPABASE_ANON_KEY || "";
const SECRET = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || (devStore ? "dev-only-session-secret" : "");
const sign = (v: string) => createHmac("sha256", SECRET).update(v).digest("hex");

export type Member = { email: string; name: string; role: "Admin" | "Member" };

export function sessionValue(email: string) {
  const v = `${email.toLowerCase()}|${Date.now() + 7 * 864e5}`;
  return `${Buffer.from(v).toString("base64url")}.${sign(v)}`;
}
export const cookieOpts = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 7 * 86400 };

export async function teamMember(email: string): Promise<Member | null> {
  const m = await findOne("team_members", "email", email.trim().toLowerCase());
  if (!m || !m.active) return null;
  return { email: String(m.email), name: String(m.name || ""), role: m.role === "Admin" ? "Admin" : "Member" };
}

export async function currentMember(): Promise<Member | null> {
  if (!SECRET) return null;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw || !raw.includes(".")) return null;
  const [b, sig] = raw.split(".");
  const v = Buffer.from(b, "base64url").toString();
  const good = sign(v);
  if (sig.length !== good.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  const [email, exp] = v.split("|");
  if (Number(exp) < Date.now()) return null;
  return teamMember(email);
}

export const authReady = () => !!(SB && ANON);

export async function sendMagicLink(email: string, redirectTo: string) {
  const r = await fetch(`${SB}/auth/v1/otp?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: "POST", headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email, create_user: true }), signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`auth ${r.status}`);
}

export async function emailFromToken(token: string) {
  const r = await fetch(`${SB}/auth/v1/user`, { headers: { apikey: ANON, Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000) });
  if (!r.ok) return "";
  return String(((await r.json()) as { email?: string }).email || "").toLowerCase();
}
