import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { DEFAULT_CONTENT, type SiteContent } from "../../../data/content";
import { services as liveServices } from "../../../data/pricing";
import { findOne, insert, list, remove, update, upsert, type Row } from "../../../lib/db";
import { devStore } from "../../../lib/db";
import { attemptKey, authReady, checkPassword, COOKIE, cookieOpts, currentMember, emailFromToken, passwordProblem, recordAttempt, sendPasswordReset, sessionValue, setPassword, setPasswordWithToken, teamMember, tooManyAttempts } from "../../../lib/admin-auth";
import { ENTITIES, log, makeBackup, OWNER_EMAIL, purgeOldTrash, SETTING_DEFAULTS, settingsMap } from "../../../lib/admin-ops";
import { CONTENT_TAG, loadContent } from "../../../lib/content";

export const dynamic = "force-dynamic";
const NOINDEX = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
const json = (body: object, status = 200) => NextResponse.json(body, { status, headers: NOINDEX });
const deny = (msg = "Please log in.", status = 401) => json({ ok: false, error: msg }, status);
const ok = (extra: object = {}) => json({ ok: true, ...extra });
/* A save the database refuses because the 2026-11-23 update (notes column, Proposal status) hasn't been run yet. */
const needsDbUpdate = (e: unknown) => {
  const t = String(e);
  if (/column|check constraint|leads_status_check/i.test(t)) return deny("The database needs a one-time update: Supabase → SQL Editor → run supabase/schema.sql (SETUP-GUIDE.md step 3).", 409);
  throw e;
};

const LEAD_STATUS = ["New", "Contacted", "Proposal", "Won", "Lost"];
/* Old name, kept readable until the database update renames it. */
const statusOf = (v: unknown) => (v === "Quote sent" ? "Proposal" : String(v || "New"));
const PROJECT_STATUS = ["Not started", "In progress", "In review", "Delivered", "Paid"];
const EXPENSE_CAT = ["Software & tools", "Ads & marketing", "Domain & hosting", "Equipment", "Registration & legal", "Other"];
const METHODS = ["UPI", "Payment link", "Cash", "Bank transfer"];
const SOURCES = ["Website", "WhatsApp", "Instagram", "Outreach", "Referral", "Other"];

/* ---------- small cleaners ---------- */
const str = (v: unknown, n = 200) => String(v ?? "").trim().slice(0, n);
const int = (v: unknown) => { const n = Math.round(Number(String(v ?? "").replace(/[₹,\s]/g, ""))); return Number.isFinite(n) && n >= 0 ? n : 0; };
const pick = (v: unknown, list: string[], d: string) => (list.includes(String(v)) ? String(v) : d);
const phone = (v: unknown) => String(v ?? "").replace(/\D/g, "").slice(-10);
function day(v: unknown): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/); // DD/MM/YYYY (India)
  if (m) return `${m[3].length === 2 ? "20" + m[3] : m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}
const leadServices = (l: Row) => { const pickedOnly = l.form === "Contact brief" || l.form === "Chatbot"; return [...new Set((((l.selections as Row)?.items as Row[]) || []).map((i) => String((pickedOnly ? i.option || i.service : i.service || i.option) || "")).filter(Boolean))]; };
const studioOf = (names: string[]) => {
  const st = new Set(liveServices.filter((s) => names.includes(s.name)).map((s) => s.studio.toUpperCase()));
  return [...st].join(" + ");
};

/* Money fields a Team member never receives. */
const HIDE_LEAD = ["estimated_total", "estimated_monthly", "total_text", "video_discount", "referral_discount", "combo_applied", "advance_amount", "balance_amount"];
const stripLead = (l: Row) => { const c: Row = { ...l }; HIDE_LEAD.forEach((k) => delete c[k]); const sel = c.selections as Row | undefined; if (sel) c.selections = { items: ((sel.items as Row[]) || []).map((i) => ({ service: i.service, option: i.option, qty: i.qty })), extras: [] }; return c; };
const stripProject = (p: Row) => { const c: Row = { ...p }; delete c.price; delete c.payments; return c; };

async function projectsWithPayments() {
  const [projects, payments] = await Promise.all([list("projects"), list("payments")]);
  return projects.map((p): Row => ({ ...p, payments: payments.filter((x) => x.project_id === p.id).sort((a, b) => String(a.date).localeCompare(String(b.date))) }));
}
async function siteContent(): Promise<SiteContent> {
  const row = await findOne("site_content", "key", "site").catch(() => null);
  return (row?.value as SiteContent) || DEFAULT_CONTENT;
}
function refreshSite() { try { revalidateTag(CONTENT_TAG); revalidatePath("/", "layout"); } catch { /* outside a request */ } }

/** After a payment: Paid when nothing is pending; a referred client's paid project (≥ minimum) earns the referrer the reward once. */
async function settleProject(id: string, actor: string) {
  const p = await findOne("projects", "id", id);
  if (!p) return;
  const paid = (await list("payments")).filter((x) => x.project_id === id).reduce((s, x) => s + Number(x.amount || 0), 0);
  const price = Number(p.price || 0);
  if (price > 0 && paid >= price && p.status !== "Paid") {
    await update("projects", "id", id, { status: "Paid", updated_at: new Date().toISOString() });
    await log(actor, "edit", "project", id, { status: p.status }, { status: "Paid" });
  }
  if (price > 0 && paid >= price && p.lead_id) {
    const s = await settingsMap();
    if (price < int(s.referral_min)) return;
    const use = await findOne("referral_uses", "lead_id", String(p.lead_id));
    if (use && use.status === "Pending") {
      await update("referral_uses", "id", String(use.id), { status: "Paid" });
      const code = await findOne("referral_codes", "code", String(use.code));
      if (code) await update("referral_codes", "code", String(code.code), { credits_earned: Number(code.credits_earned || 0) + int(s.referral_reward) });
      await log(actor, "edit", "referral", String(use.code), null, { reward: int(s.referral_reward), client: use.new_client_name });
    }
  }
}

/* ============ GET: everything the dashboard shows, filtered by role ============ */
export async function GET() {
  const me = await currentMember();
  /* Logged out is a normal state for this page: answer 200 with no data so the browser console stays clean. */
  if (!me) return json({ ok: false, login: true });
  const owner = me.role === "Admin";
  const [rawLeads, projects, team] = await Promise.all([list("leads"), projectsWithPayments(), list("team_members")]);
  const leads = rawLeads.map((l): Row => ({ ...l, status: statusOf(l.status), notes: l.notes ?? "" }));
  const teamOut = team.map((t) => ({ email: t.email, name: t.name, role: t.role === "Admin" ? "Owner" : "Team member", active: t.active, whatsapp: owner ? t.whatsapp : "" }));
  const meOut = { email: me.email, name: me.name, role: owner ? "Owner" : "Team member" };
  if (!owner) {
    return json({
      ok: true, me: meOut, team: teamOut,
      leads: leads.filter((l) => l.assigned_to === me.email).map(stripLead),
      projects: projects.filter((p) => p.assigned_to === me.email).map(stripProject),
    });
  }
  await purgeOldTrash().catch(() => 0);
  const [expenses, codes, uses, trash, activity, backups, settings, content] = await Promise.all([
    list("expenses"), list("referral_codes"), list("referral_uses"), list("trash"), list("activity_log", 500), list("backups"), settingsMap(), siteContent(),
  ]);
  return json({
    ok: true, me: meOut, team: teamOut, leads, projects, expenses, codes, uses, settings, content,
    trash: trash.map((t) => ({ id: t.id, entity: t.entity, entity_id: t.entity_id, label: t.label, deleted_at: t.deleted_at, deleted_by: t.deleted_by })),
    activity, backups: backups.map((b) => ({ id: b.id, created_at: b.created_at })),
  });
}

type Body = { action?: string; email?: string; password?: string; token?: string; id?: string; patch?: Row; body?: string; code?: string; row?: Row; rows?: Row[]; entity?: string; settings?: Row; content?: SiteContent };

/* ============ POST: every change ============ */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Body;

  /* ---- login (public): email + password ---- */
  if (b.action === "login") {
    const email = str(b.email, 254).toLowerCase(), password = String(b.password ?? "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !password) return deny("Please enter your email and password.", 400);
    if (!authReady() && !devStore) return deny("Login is not set up yet: add the Supabase keys in Vercel (SETUP-GUIDE.md).", 503);
    const key = attemptKey(req);
    if (await tooManyAttempts(key)) return deny("Too many tries. Please wait 15 minutes and try again.", 429);
    const m = await teamMember(email).catch(() => null);
    const good = m ? await checkPassword(email, password).catch(() => false) : false;
    if (!m || !good) { await recordAttempt(key, email, "failed login"); return deny("Wrong email or password.", 401); }
    const res = ok();
    res.cookies.set(COOKIE, sessionValue(email), cookieOpts);
    return res;
  }
  /* Forgot password: same answer whether or not the email is on the team (no hints for strangers). */
  if (b.action === "forgot") {
    const email = str(b.email, 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return deny("Please enter your email.", 400);
    const key = attemptKey(req);
    if (await tooManyAttempts(key)) return deny("Too many tries. Please wait 15 minutes and try again.", 429);
    await recordAttempt(key, email, "password reset request");
    if (!authReady()) return ok({ dev: devStore });
    if (await teamMember(email).catch(() => null)) await sendPasswordReset(email, `${new URL(req.url).origin}/admin`).catch(() => null);
    return ok();
  }
  /* The reset link from the email opens /admin with a one-time token: save the new password and log in. */
  if (b.action === "password.reset") {
    const problem = passwordProblem(b.password);
    if (problem) return deny(problem, 400);
    const email = b.token ? await emailFromToken(b.token) : "";
    const m = email ? await teamMember(email).catch(() => null) : null;
    if (!m) return deny("This reset link has expired or is not for a MAKENDLESS team account. Ask for a new one.", 403);
    try { await setPasswordWithToken(String(b.token), String(b.password)); } catch { return deny("Couldn't save the new password. Ask for a new reset link.", 400); }
    await log(m.name || m.email, "edit", "password", m.email, null, "reset by email link");
    const res = ok();
    res.cookies.set(COOKIE, sessionValue(email), cookieOpts);
    return res;
  }
  if (b.action === "logout") { const res = ok(); res.cookies.delete(COOKIE); return res; }

  /* ---- team (Owner + Team member) ---- */
  const me = await currentMember();
  if (!me) return deny();
  const owner = me.role === "Admin";
  const who = me.name || me.email;
  const now = new Date().toISOString();

  /* Anyone logged in can change their own password. */
  if (b.action === "password.change") {
    const problem = passwordProblem(b.password);
    if (problem) return deny(problem, 400);
    try { await setPassword(me.email, String(b.password)); } catch { return deny("Couldn't change the password. Please try again in a minute.", 503); }
    await log(who, "edit", "password", me.email, null, "changed own password");
    return ok();
  }

  if (b.action === "lead.update" && b.id && b.patch) {
    const lead = await findOne("leads", "id", b.id);
    if (!lead) return deny("Lead not found.", 404);
    if (!owner && lead.assigned_to !== me.email) return deny("You can only update leads assigned to you.", 403);
    const p = b.patch, patch: Row = {};
    if (p.status !== undefined) patch.status = pick(p.status, LEAD_STATUS, statusOf(lead.status));
    if (p.lost_reason !== undefined) patch.lost_reason = str(p.lost_reason, 300);
    if (p.notes !== undefined) patch.notes = str(p.notes, 4000);
    if (owner) {
      if (p.assigned_to !== undefined) patch.assigned_to = str(p.assigned_to, 254) || null;
      if (p.name !== undefined) patch.name = str(p.name, 80);
      if (p.whatsapp !== undefined) patch.whatsapp = phone(p.whatsapp);
      if (p.email !== undefined) patch.email = str(p.email, 254) || null;
      if (p.lead_source !== undefined) patch.lead_source = pick(p.lead_source, SOURCES, "Other");
      if (p.estimated_total !== undefined) patch.estimated_total = int(p.estimated_total);
      if (p.services !== undefined) patch.selections = { items: String(p.services).split(/[,+]/).map((x) => x.trim()).filter(Boolean).map((service) => ({ service })), extras: [] };
    }
    const old = Object.fromEntries(Object.keys(patch).map((k) => [k, lead[k]]));
    try { await update("leads", "id", b.id, { ...patch, updated_at: now }); } catch (e) { return needsDbUpdate(e); }
    await log(who, "edit", "lead", b.id, old, patch);
    return ok();
  }
  if (b.action === "lead.note" && b.id && b.body?.trim()) {
    const lead = await findOne("leads", "id", b.id);
    if (!lead) return deny("Lead not found.", 404);
    if (!owner && lead.assigned_to !== me.email) return deny("You can only update leads assigned to you.", 403);
    const note = { author: who, body: b.body.trim().slice(0, 2000), at: now };
    await update("leads", "id", b.id, { team_notes: [...((lead.team_notes as Row[]) || []), note], updated_at: now });
    await log(who, "add", "lead note", b.id, null, note.body);
    return ok();
  }
  if (b.action === "project.update" && b.id && b.patch) {
    const pr = await findOne("projects", "id", b.id);
    if (!pr) return deny("Project not found.", 404);
    if (!owner && pr.assigned_to !== me.email) return deny("You can only update projects assigned to you.", 403);
    const p = b.patch, patch: Row = {};
    if (p.status !== undefined) patch.status = pick(p.status, PROJECT_STATUS, String(pr.status));
    if (p.notes !== undefined) patch.notes = str(p.notes, 4000);
    if (owner) {
      if (p.client !== undefined) patch.client = str(p.client, 120);
      if (p.client_whatsapp !== undefined) patch.client_whatsapp = phone(p.client_whatsapp);
      if (p.studio !== undefined) patch.studio = str(p.studio, 40);
      if (p.services !== undefined) patch.services = str(p.services, 400);
      if (p.price !== undefined) patch.price = int(p.price);
      if (p.delivery_date !== undefined) patch.delivery_date = day(p.delivery_date);
      if (p.assigned_to !== undefined) patch.assigned_to = str(p.assigned_to, 254) || null;
      if (p.team_payout !== undefined) patch.team_payout = int(p.team_payout);
      if (p.payout_done !== undefined) { patch.payout_done = !!p.payout_done; patch.payout_date = p.payout_done ? (day(p.payout_date) || now.slice(0, 10)) : null; }
    }
    const old = Object.fromEntries(Object.keys(patch).map((k) => [k, pr[k]]));
    await update("projects", "id", b.id, { ...patch, updated_at: now });
    await log(who, "edit", "project", b.id, old, patch);
    if (owner && patch.price !== undefined) await settleProject(b.id, who);
    return ok();
  }

  /* ---- Owner only ---- */
  if (!owner) return deny("Only the Owner can do this.", 403);

  if (b.action === "lead.add" && b.row) {
    const r = b.row;
    const name = str(r.name, 80);
    if (name.length < 2) return deny("Please enter the client's name.", 400);
    const row = await insert("leads", {
      name, whatsapp: phone(r.whatsapp), email: str(r.email, 254) || null, form: "Added by hand", lead_source: pick(r.lead_source, SOURCES, "WhatsApp"),
      status: "New", estimated_total: int(r.estimated_total), assigned_to: str(r.assigned_to, 254) || null, extra_notes: str(r.notes, 2000) || null,
      selections: { items: String(r.services || "").split(/[,+]/).map((x) => x.trim()).filter(Boolean).map((service) => ({ service })), extras: [] },
    });
    await log(who, "add", "lead", String(row.id), null, { name, source: row.lead_source });
    return ok({ id: row.id });
  }
  if (b.action === "lead.won" && b.id) {
    const lead = await findOne("leads", "id", b.id);
    if (!lead) return deny("Lead not found.", 404);
    if (lead.project_id) return deny("This lead is already a project.", 400);
    const svc = leadServices(lead);
    const project = await insert("projects", {
      lead_id: lead.id, client: lead.business_name ? `${lead.name} (${lead.business_name})` : lead.name, client_whatsapp: lead.whatsapp || "",
      studio: studioOf(svc), services: svc.join(" + ") || String(lead.form || "Project"), price: int(lead.estimated_total),
      assigned_to: lead.assigned_to || null, referral_code: lead.referral_code || null, status: "Not started",
      notes: [lead.total_text ? `Website estimate: ${lead.total_text}` : "", lead.est_delivery ? `Est. delivery: ${lead.est_delivery}` : "", lead.extra_notes || ""].filter(Boolean).join("\n"),
    });
    await update("leads", "id", b.id, { status: "Won", project_id: project.id, updated_at: now });
    await log(who, "add", "project", String(project.id), null, { from_lead: lead.name, price: project.price });
    return ok({ id: project.id });
  }
  if (b.action === "project.add" && b.row) {
    const r = b.row;
    if (!str(r.client)) return deny("Please enter the client.", 400);
    const row = await insert("projects", {
      client: str(r.client, 120), client_whatsapp: phone(r.client_whatsapp), studio: str(r.studio, 40), services: str(r.services, 400), price: int(r.price),
      delivery_date: day(r.delivery_date), assigned_to: str(r.assigned_to, 254) || null, team_payout: int(r.team_payout), status: pick(r.status, PROJECT_STATUS, "Not started"), notes: str(r.notes, 4000),
    });
    await log(who, "add", "project", String(row.id), null, { client: row.client, price: row.price });
    return ok({ id: row.id });
  }
  if (b.action === "payment.add" && b.row?.project_id) {
    const r = b.row, amount = int(r.amount);
    if (!amount) return deny("Please enter the amount.", 400);
    const pr = await findOne("projects", "id", String(r.project_id));
    if (!pr) return deny("Project not found.", 404);
    const row = await insert("payments", { project_id: pr.id, date: day(r.date) || now.slice(0, 10), amount, kind: pick(r.kind, ["Advance", "Balance", "Other"], "Advance"), method: pick(r.method, METHODS, "UPI") });
    await log(who, "add", "payment", String(row.id), null, { project: pr.client, amount, method: row.method });
    await settleProject(String(pr.id), who);
    return ok();
  }
  if (b.action === "expense.save" && b.row) {
    const r = b.row;
    const row = { date: day(r.date) || now.slice(0, 10), item: str(r.item, 200), category: pick(r.category, EXPENSE_CAT, "Other"), amount: int(r.amount), paid_by: str(r.paid_by, 80), notes: str(r.notes, 1000) };
    if (!row.item) return deny("Please enter the item.", 400);
    if (r.id) {
      const old = await findOne("expenses", "id", String(r.id));
      if (!old) return deny("Expense not found.", 404);
      await update("expenses", "id", String(r.id), row);
      await log(who, "edit", "expense", String(r.id), old, row);
    } else {
      const added = await insert("expenses", row);
      await log(who, "add", "expense", String(added.id), null, row);
    }
    return ok();
  }
  if (b.action === "credit.use" && b.code) {
    const c = await findOne("referral_codes", "code", b.code);
    const reward = int((await settingsMap()).referral_reward);
    if (!c) return deny("Code not found.", 404);
    if (Number(c.credits_earned || 0) - Number(c.credits_used || 0) < reward) return deny("No unused reward on this code.", 400);
    await update("referral_codes", "code", b.code, { credits_used: Number(c.credits_used || 0) + reward });
    await log(who, "edit", "referral", b.code, { credits_used: c.credits_used }, { credits_used: Number(c.credits_used || 0) + reward });
    return ok();
  }

  /* ---- delete → Trash (30 days), restore, delete forever ---- */
  if (b.action === "delete" && b.entity && b.id) {
    const e = ENTITIES[b.entity];
    if (!e) return deny("Unknown item.", 400);
    const row = await findOne(e.table, e.key, b.id);
    if (!row) return deny("Already deleted.", 404);
    if (b.entity === "member" && (b.id === OWNER_EMAIL || b.id === me.email)) return deny("You can't remove the Owner account.", 400);
    const data: Row = { ...row };
    if (b.entity === "project") data._payments = (await list("payments")).filter((x) => x.project_id === b.id);
    await insert("trash", { entity: b.entity, entity_id: b.id, label: e.label(row), data, deleted_by: who });
    if (b.entity === "project") await remove("payments", "project_id", [b.id]);
    await remove(e.table, e.key, [b.id]);
    await log(who, "delete", b.entity, b.id, row, null);
    return ok();
  }
  if (b.action === "trash.restore" && b.id) {
    const t = await findOne("trash", "id", b.id);
    if (!t) return deny("Not in Trash.", 404);
    const data = { ...(t.data as Row) };
    if (t.entity === "work" || t.entity === "review") {
      const c = await siteContent();
      const key = t.entity === "work" ? "work" : "reviews";
      const next = { ...c, [key]: [...((c[key] as unknown as Row[]) || []), data] } as SiteContent;
      await upsert("site_content", { key: "site", value: next, updated_at: now }, "key");
      refreshSite();
    } else {
      const e = ENTITIES[String(t.entity)];
      if (!e) return deny("Unknown item.", 400);
      const pays = (data._payments as Row[]) || [];
      delete data._payments;
      try { await insert(e.table, data); } catch { return deny("Couldn't restore: an item with the same id or email already exists.", 409); }
      for (const p of pays) await insert("payments", p).catch(() => null);
    }
    await remove("trash", "id", [b.id]);
    await log(who, "restore", String(t.entity), String(t.entity_id), null, t.label);
    return ok();
  }
  if (b.action === "trash.purge" && b.id) {
    const t = await findOne("trash", "id", b.id);
    if (!t) return deny("Not in Trash.", 404);
    await remove("trash", "id", [b.id]);
    await log(who, "delete forever", String(t.entity), String(t.entity_id), t.label, null);
    return ok();
  }

  /* ---- team members and settings ---- */
  if (b.action === "team.save" && b.row?.email) {
    const r = b.row, email = str(r.email, 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return deny("Please enter a valid email.", 400);
    const role = r.role === "Owner" ? "Admin" : "Member";
    if ((email === OWNER_EMAIL || email === me.email) && (role !== "Admin" || r.active === false)) return deny("The Owner account always stays Owner and active.", 400);
    const old = await findOne("team_members", "email", email);
    const row = { email, name: str(r.name, 80), whatsapp: phone(r.whatsapp), role, active: r.active !== false };
    await upsert("team_members", row, "email");
    await log(who, old ? "edit" : "add", "member", email, old, row);
    return ok();
  }
  if (b.action === "member.password" && b.email) {
    const email = str(b.email, 254).toLowerCase();
    const problem = passwordProblem(b.password);
    if (problem) return deny(problem, 400);
    if (!(await findOne("team_members", "email", email))) return deny("Add this person as a team member first.", 404);
    try { await setPassword(email, String(b.password)); } catch { return deny("Couldn't set the password. Check SUPABASE_SERVICE_ROLE_KEY in Vercel and try again.", 503); }
    await log(who, "edit", "password", email, null, "password set by Owner");
    return ok();
  }
  if (b.action === "settings.save" && b.settings) {
    const before = await settingsMap();
    const changed: Row = {};
    for (const k of Object.keys(SETTING_DEFAULTS)) {
      if (b.settings[k] === undefined) continue;
      const v = ["monthly_target", "referral_reward", "referral_min"].includes(k) ? String(int(b.settings[k])) : k === "whatsapp" ? phone(b.settings[k]) : str(b.settings[k], 254);
      if (v !== before[k]) { await upsert("app_settings", { key: k, value: v }, "key"); changed[k] = v; }
    }
    if (Object.keys(changed).length) { await log(who, "edit", "settings", "", Object.fromEntries(Object.keys(changed).map((k) => [k, before[k]])), changed); refreshSite(); }
    return ok();
  }

  /* ---- website content ---- */
  if (b.action === "content.save" && b.content) {
    const c = b.content;
    if (!Array.isArray(c.services) || !Array.isArray(c.combos) || !Array.isArray(c.faq) || !Array.isArray(c.work) || !Array.isArray(c.reviews)) return deny("Content is incomplete.", 400);
    for (const s of c.services) for (const o of s.options || []) if (o.price !== null && !(Number(o.price) >= 0)) return deny(`Check the price of ${o.name}.`, 400);
    const before = await siteContent();
    /* Work samples and reviews removed in the editor go to Trash, so they can be restored for 30 days. */
    for (const [key, entity] of [["work", "work"], ["reviews", "review"]] as const) {
      const keep = new Set((c[key] as { id: string }[]).map((x) => x.id));
      for (const x of (before[key] as unknown as Row[]) || []) if (!keep.has(String(x.id))) await insert("trash", { entity, entity_id: String(x.id), label: `${entity === "work" ? "Work sample" : "Review"}: ${x.title || x.name || x.url}`, data: x, deleted_by: who });
    }
    const priceChanges: string[] = [];
    for (const s of c.services) for (const o of s.options || []) {
      const prev = before.services.flatMap((x) => x.options).find((x) => x.id === o.id);
      if (prev && prev.price !== o.price) priceChanges.push(`${o.name}: ${prev.price ?? "custom"} → ${o.price ?? "custom"}`);
    }
    await upsert("site_content", { key: "site", value: { services: c.services, combos: c.combos, faq: c.faq, work: c.work, reviews: c.reviews }, updated_at: now }, "key");
    await log(who, "edit", "website content", "site", priceChanges.length ? { prices: priceChanges } : null, { saved: true });
    refreshSite();
    await loadContent();
    return ok();
  }
  if (b.action === "content.reset") {
    const before = await siteContent();
    await upsert("site_content", { key: "site", value: DEFAULT_CONTENT, updated_at: now }, "key");
    await log(who, "edit", "website content", "site", { reset_from: "saved content" }, { reset_to: "code defaults" });
    refreshSite();
    return ok({ before: !!before });
  }

  /* ---- import from CSV (Leads, Projects, Expenses) ---- */
  if (b.action === "import" && b.entity && Array.isArray(b.rows)) {
    const rows = b.rows.slice(0, 2000);
    const get = (r: Row, ...names: string[]) => { for (const n of names) { const k = Object.keys(r).find((x) => x.toLowerCase().replace(/[^a-z]/g, "") === n); if (k && String(r[k]).trim()) return String(r[k]).trim(); } return ""; };
    let added = 0;
    for (const r of rows) {
      if (b.entity === "leads") {
        const name = get(r, "name", "client", "clientname");
        if (!name) continue;
        await insert("leads", { created_at: day(get(r, "date", "created", "createdat")) ? `${day(get(r, "date", "created", "createdat"))}T09:00:00Z` : now, name: name.slice(0, 80), whatsapp: phone(get(r, "whatsapp", "phone", "number", "mobile")), email: get(r, "email") || null,
          form: "Imported", lead_source: pick(get(r, "leadsource", "source"), SOURCES, "Other"), status: pick(statusOf(get(r, "status") || "New"), LEAD_STATUS, "New"), estimated_total: int(get(r, "estimatedprice", "estimate", "price", "amount")),
          selections: { items: get(r, "services", "service", "servicespicked").split(/[,+]/).map((x) => x.trim()).filter(Boolean).map((service) => ({ service })), extras: [] } });
      } else if (b.entity === "projects") {
        const client = get(r, "client", "name", "clientname");
        if (!client) continue;
        const d = day(get(r, "date", "created", "month"));
        const pr = await insert("projects", { ...(d ? { created_at: `${d}T09:00:00Z` } : {}), client: client.slice(0, 120), client_whatsapp: phone(get(r, "whatsapp", "phone")), studio: get(r, "studio").slice(0, 40), services: get(r, "services", "service", "project", "work").slice(0, 400),
          price: int(get(r, "price", "sales", "amount", "projectvalue", "total")), delivery_date: day(get(r, "deliverydate", "delivery", "due")), assigned_to: get(r, "assignedto", "assigned", "member") || null,
          team_payout: int(get(r, "teampayout", "payout")), payout_done: /^(y|yes|true|done|paid)$/i.test(get(r, "payoutdone", "payoutpaid")), status: pick(get(r, "status"), PROJECT_STATUS, "Not started") });
        const adv = int(get(r, "advance", "advancereceived")), bal = int(get(r, "balance", "balancereceived", "received", "collected"));
        if (adv) await insert("payments", { project_id: pr.id, date: d || now.slice(0, 10), amount: adv, kind: "Advance", method: "UPI" });
        if (bal) await insert("payments", { project_id: pr.id, date: d || now.slice(0, 10), amount: bal, kind: "Balance", method: "UPI" });
      } else if (b.entity === "expenses") {
        const item = get(r, "item", "description", "expense", "name");
        if (!item) continue;
        await insert("expenses", { date: day(get(r, "date")) || now.slice(0, 10), item: item.slice(0, 200), category: pick(get(r, "category"), EXPENSE_CAT, "Other"), amount: int(get(r, "amount", "cost", "price")), paid_by: get(r, "paidby", "by").slice(0, 80), notes: get(r, "notes", "note").slice(0, 1000) });
      } else return deny("Import works for Leads, Projects and Expenses.", 400);
      added++;
    }
    await log(who, "add", `import ${b.entity}`, "", null, { rows: added });
    return ok({ added });
  }

  /* ---- backups ---- */
  if (b.action === "backup.now") { const row = await makeBackup(who); await log(who, "add", "backup", String(row.id)); return ok(); }
  if (b.action === "backup.get" && b.id) { const row = await findOne("backups", "id", b.id); return row ? ok({ data: row.data, created_at: row.created_at }) : deny("Backup not found.", 404); }

  return deny("Unknown action.", 400);
}
