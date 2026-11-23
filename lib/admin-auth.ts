/* SERVER ONLY. /admin access.
   Login = email + password, checked by Supabase Auth (passwords are stored hashed by Supabase, never by this site).
   Only emails listed (active) in team_members can log in. After login the site sets a signed, httpOnly session cookie.
   Every request re-checks team_members, so deactivating a member removes access immediately.
   Local testing without Supabase (dev store): the password is "makendless-dev" until one is set in /admin. */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { countSince, devStore, findOne, insert, update } from "./db";

export const COOKIE = "mk_admin";
const SB = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
/* The anon / publishable key is enough for login; the service key also works, so one missing key never blocks login. */
const PUB = process.env.SUPABASE_ANON_KEY || SERVICE;
const SECRET = process.env.ADMIN_SESSION_SECRET || SERVICE || (devStore ? "dev-only-session-secret" : "");
const DEV_PASSWORD = "makendless-dev";
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

export const authReady = () => !!(SB && PUB);
export const PASSWORD_MIN = 8;
export const passwordProblem = (p: unknown) => {
  const s = String(p ?? "");
  if (s.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters.`;
  if (s.length > 72) return "Use at most 72 characters.";
  return "";
};

/* ---------- brute-force guard: at most 8 failed logins / reset requests per visitor per 15 minutes ---------- */
export const attemptKey = (req: Request) => {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  return "login:" + createHash("sha256").update(`mk-login:${ip}:${SECRET}`).digest("hex").slice(0, 24);
};
export async function tooManyAttempts(key: string) {
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  return (await countSince("activity_log", "entity_id", key, since).catch(() => 0)) >= 8;
}
export async function recordAttempt(key: string, email: string, what: "failed login" | "password reset request") {
  await insert("activity_log", { actor: email.slice(0, 254) || "unknown", action: what, entity: "login", entity_id: key }).catch(() => null);
}

/* ---------- Supabase Auth ---------- */
async function gotrue(path: string, init: RequestInit & { asUser?: string; admin?: boolean } = {}) {
  const { asUser, admin, ...rest } = init;
  const key = admin ? SERVICE : PUB;
  return fetch(`${SB}/auth/v1/${path}`, {
    ...rest,
    cache: "no-store",
    headers: { apikey: key, ...(asUser ? { Authorization: `Bearer ${asUser}` } : admin ? { Authorization: `Bearer ${SERVICE}` } : {}), "Content-Type": "application/json" },
    signal: AbortSignal.timeout(8000),
  });
}

/** True when this email + password is a valid login. */
export async function checkPassword(email: string, password: string): Promise<boolean> {
  if (!authReady()) {
    if (!devStore) return false;
    const m = await findOne("team_members", "email", email);
    const want = String(m?.dev_password || DEV_PASSWORD);
    return password.length === want.length && timingSafeEqual(Buffer.from(password), Buffer.from(want));
  }
  const r = await gotrue("token?grant_type=password", { method: "POST", body: JSON.stringify({ email, password }) });
  if (!r.ok) return false;
  const j = (await r.json().catch(() => ({}))) as { user?: { email?: string } };
  return String(j.user?.email || "").toLowerCase() === email;
}

/** Owner sets (or first creates) a team member's login password. Uses the secret service key, server side only. */
export async function setPassword(email: string, password: string) {
  if (!authReady()) {
    if (!devStore) throw new Error("Login is not set up yet (SUPABASE_URL).");
    await update("team_members", "email", email, { dev_password: password });
    return;
  }
  if (!SERVICE) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
  let id = "";
  for (let page = 1; page <= 10 && !id; page++) {
    const r = await gotrue(`admin/users?page=${page}&per_page=200`, { admin: true });
    if (!r.ok) throw new Error(`auth ${r.status}`);
    const users = (((await r.json()) as { users?: { id: string; email?: string }[] }).users) || [];
    id = users.find((u) => String(u.email || "").toLowerCase() === email)?.id || "";
    if (users.length < 200) break;
  }
  const r = id
    ? await gotrue(`admin/users/${id}`, { method: "PUT", admin: true, body: JSON.stringify({ password, email_confirm: true }) })
    : await gotrue("admin/users", { method: "POST", admin: true, body: JSON.stringify({ email, password, email_confirm: true }) });
  if (!r.ok) throw new Error(`auth ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

/** "Forgot password": Supabase emails a reset link that opens /admin. */
export async function sendPasswordReset(email: string, redirectTo: string) {
  const r = await gotrue(`recover?redirect_to=${encodeURIComponent(redirectTo)}`, { method: "POST", body: JSON.stringify({ email }) });
  if (!r.ok) throw new Error(`auth ${r.status}`);
}

/** From the reset link: the email it belongs to. */
export async function emailFromToken(token: string) {
  if (!authReady()) return "";
  const r = await gotrue("user", { asUser: token });
  if (!r.ok) return "";
  return String(((await r.json()) as { email?: string }).email || "").toLowerCase();
}

/** From the reset link: save the new password. */
export async function setPasswordWithToken(token: string, password: string) {
  const r = await gotrue("user", { method: "PUT", asUser: token, body: JSON.stringify({ password }) });
  if (!r.ok) throw new Error(`auth ${r.status}`);
}
