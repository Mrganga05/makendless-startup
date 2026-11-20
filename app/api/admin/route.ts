import { NextResponse } from "next/server";
import { REFERRAL } from "../../../data/pricing";
import { findOne, list, remove, update, upsert, type Row } from "../../../lib/db";
import { authReady, COOKIE, cookieOpts, currentMember, emailFromToken, sendMagicLink, sessionValue, teamMember, type Member } from "../../../lib/admin-auth";
import { devStore } from "../../../lib/db";

export const dynamic = "force-dynamic";
const NOT_TEAM = "This area is for the MAKENDLESS team only.";
const STATUSES = ["New", "Contacted", "Price confirmed", "Advance paid", "In progress", "Delivered", "Fully paid", "Lost"];
const deny = (msg = "Please log in.", status = 401) => NextResponse.json({ ok: false, error: msg }, { status });

/* GET /api/admin -> everything the dashboard shows (team members only). */
export async function GET() {
  const me = await currentMember();
  if (!me) return deny();
  const [leads, codes, uses, waitlist, team, settings] = await Promise.all([list("leads"), list("referral_codes"), list("referral_uses"), list("waitlist"), list("team_members"), list("app_settings")]);
  return NextResponse.json({
    ok: true, me, leads, codes, uses, waitlist,
    team: team.map((t) => ({ email: t.email, name: t.name, role: t.role, active: t.active })),
    settings: me.role === "Admin" ? Object.fromEntries(settings.map((s) => [s.key, s.value])) : {},
  });
}

type Body = { action?: string; email?: string; token?: string; id?: string; ids?: string[]; patch?: Row; body?: string; code?: string; member?: Row; alert_email?: string };

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Body;

  /* ---- login (public) ---- */
  if (b.action === "login") {
    const email = String(b.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return deny("Please enter your email.", 400);
    const m = await teamMember(email).catch(() => null);
    if (!m) return deny(NOT_TEAM, 403);
    if (authReady()) {
      try { await sendMagicLink(email, `${new URL(req.url).origin}/admin`); return NextResponse.json({ ok: true, sent: true }); }
      catch { return deny("Couldn't send the login email. Please try again in a minute.", 503); }
    }
    if (devStore) { const res = NextResponse.json({ ok: true, dev: true }); res.cookies.set(COOKIE, sessionValue(email), cookieOpts); return res; }
    return deny("Email login is not set up yet (SUPABASE_ANON_KEY).", 503);
  }
  if (b.action === "session") {
    const email = b.token ? await emailFromToken(b.token) : "";
    const m = email ? await teamMember(email) : null;
    if (!m) return deny(NOT_TEAM, 403);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, sessionValue(email), cookieOpts);
    return res;
  }
  if (b.action === "logout") { const res = NextResponse.json({ ok: true }); res.cookies.delete(COOKIE); return res; }

  /* ---- team only ---- */
  const me = await currentMember();
  if (!me) return deny();
  const admin = me.role === "Admin";
  const at = new Date().toISOString();
  const who = me.name || me.email;

  if (b.action === "lead.update" && b.id && b.patch) {
    const lead = await findOne("leads", "id", b.id);
    if (!lead) return deny("Lead not found.", 404);
    if (!admin && lead.assigned_to !== me.email) return deny("You can only update leads assigned to you.", 403);
    const allowed = ["status", "assigned_to", "advance_paid", "advance_amount", "advance_date", "balance_paid", "balance_amount", "balance_date"];
    const patch: Row = Object.fromEntries(Object.entries(b.patch).filter(([k]) => allowed.includes(k)));
    if (patch.status && !STATUSES.includes(String(patch.status))) delete patch.status;
    if (patch.balance_paid === true) patch.status = "Fully paid";
    if (patch.assigned_to !== undefined && !admin && patch.assigned_to !== me.email) delete patch.assigned_to;
    const log: string[] = [];
    if (patch.status && patch.status !== lead.status) log.push(`Status: ${lead.status} → ${patch.status}`);
    if (patch.assigned_to !== undefined && patch.assigned_to !== lead.assigned_to) log.push(patch.assigned_to ? `Assigned to ${patch.assigned_to}` : "Unassigned");
    if (patch.advance_paid === true && !lead.advance_paid) log.push(`Advance received${patch.advance_amount ? ` ₹${patch.advance_amount}` : ""}`);
    if (patch.balance_paid === true && !lead.balance_paid) log.push(`Balance received${patch.balance_amount ? ` ₹${patch.balance_amount}` : ""}`);
    const activity = [...((lead.activity as Row[]) || []), ...log.map((action) => ({ actor: who, action, at }))];
    await update("leads", "id", b.id, { ...patch, activity, updated_at: at });
    /* Referral: when the referred client's lead is fully paid, the use becomes Paid and the referrer earns ₹500. */
    if (patch.status === "Fully paid" && lead.status !== "Fully paid") {
      const use = await findOne("referral_uses", "lead_id", b.id);
      if (use && use.status === "Pending") {
        await update("referral_uses", "id", String(use.id), { status: "Paid" });
        const code = await findOne("referral_codes", "code", String(use.code));
        if (code) await update("referral_codes", "code", String(code.code), { credits_earned: Number(code.credits_earned || 0) + REFERRAL.credit });
      }
    }
    return NextResponse.json({ ok: true });
  }
  if (b.action === "lead.note" && b.id && b.body?.trim()) {
    const lead = await findOne("leads", "id", b.id);
    if (!lead) return deny("Lead not found.", 404);
    const notes = [...((lead.team_notes as Row[]) || []), { author: who, body: b.body.trim().slice(0, 2000), at }];
    await update("leads", "id", b.id, { team_notes: notes, activity: [...((lead.activity as Row[]) || []), { actor: who, action: "Added a note", at }], updated_at: at });
    return NextResponse.json({ ok: true });
  }
  if (b.action === "credit.use" && b.code) {
    const c = await findOne("referral_codes", "code", b.code);
    if (!c) return deny("Code not found.", 404);
    if (Number(c.credits_earned || 0) - Number(c.credits_used || 0) < REFERRAL.credit) return deny("No unused credit on this code.", 400);
    await update("referral_codes", "code", b.code, { credits_used: Number(c.credits_used || 0) + REFERRAL.credit });
    return NextResponse.json({ ok: true });
  }

  /* ---- admin only ---- */
  if (!admin) return deny("Admins only.", 403);
  if (b.action === "team.save" && b.member?.email) {
    const email = String(b.member.email).trim().toLowerCase();
    if (email === me.email && (b.member.active === false || b.member.role === "Member")) return deny("You can't remove your own admin access.", 400);
    await upsert("team_members", { email, name: String(b.member.name || "").slice(0, 80), role: b.member.role === "Admin" ? "Admin" : "Member", active: b.member.active !== false }, "email");
    return NextResponse.json({ ok: true });
  }
  if (b.action === "settings.save" && b.alert_email) {
    await upsert("app_settings", { key: "alert_email", value: String(b.alert_email).trim().slice(0, 254) }, "key");
    return NextResponse.json({ ok: true });
  }
  if (b.action === "leads.delete" && Array.isArray(b.ids)) {
    await remove("leads", "id", b.ids.map(String));
    return NextResponse.json({ ok: true });
  }
  return deny("Unknown action.", 400);
}
export type { Member };
