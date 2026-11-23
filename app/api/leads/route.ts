import { NextResponse } from "next/server";
import { SERVICES } from "../../../data/pricing";
import { SETTINGS } from "../../../data/settings";
import { sendLeadAlert } from "../../../lib/alert";
import { Conflict, insert } from "../../../lib/db";
import { ipHash, tooMany } from "../../../lib/guard";
import { clean, estimate, inr } from "../../../lib/pricing";
import { normalizePhone } from "../../../lib/referral";
import { checkReferral } from "../../../lib/referral-server";
import { loadContent } from "../../../lib/content";

export const dynamic = "force-dynamic";

type Body = {
  source?: "services" | "contact" | "chatbot"; selection?: unknown; name?: string; whatsapp?: string; email?: string; business?: string; clientType?: string;
  studio?: string; services?: string[]; referralCode?: string; footageLink?: string; notes?: string; budget?: string; timing?: string; page?: string; hp?: string;
};
const s = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n) || null;

/* POST /api/leads — every "Start a Project" form (services final page + contact page), and a future chatbot
   ({source: "chatbot", name, whatsapp, services?, notes?}). Totals and the referral are re-checked here, never trusted from the browser. */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Body;
  await loadContent();
  if (b.hp) return NextResponse.json({ ok: false }, { status: 400 });
  const name = String(b.name || "").trim().slice(0, 80);
  const whatsapp = normalizePhone(b.whatsapp || "");
  if (name.length < 2 || !whatsapp) return NextResponse.json({ ok: false, error: "Please enter your name and a 10-digit WhatsApp number." }, { status: 400 });

  try {
    const ip = ipHash(req);
    if (await tooMany("leads", ip)) return NextResponse.json({ ok: false, error: "too-many" }, { status: 429 });
    const sel = clean(b.selection as never);
    const ref = b.referralCode ? await checkReferral(b.referralCode, whatsapp) : null;
    const refOk = ref?.valid ? ref : null;
    const est = estimate(sel, !!refOk);
    const chatbot = b.source === "chatbot";
    const contact = b.source === "contact" || chatbot;
    const contactServices = (Array.isArray(b.services) ? b.services : []).map((x) => String(x).slice(0, 80)).slice(0, 20);
    const items = contact
      ? contactServices.map((option) => ({ service: s(b.studio, 80), option, qty: 1, price: null }))
      : est.lines.map((l) => ({ service: l.service, option: l.name, qty: l.qty, price: l.price, unit: l.unit, total: l.total }));
    const main = [...new Set(contact ? (contactServices.length ? contactServices : [s(b.studio, 80) || "Project"]) : est.lines.map((l) => l.service))].slice(0, 3).join(" + ") || "Project";
    const totalText = contact ? "To be quoted" : est.totalText;

    /* Until the control-room SQL upgrade is run, the form/lead_source columns don't exist: save without them. */
    const save = (row: Record<string, unknown>) => insert("leads", row).catch((e) => { const { form: _f, lead_source: _s, ...old } = row; void _f; void _s; if (String(e).includes("column")) return insert("leads", old); throw e; });
    const lead = await save({
      name, whatsapp, email: s(b.email, 254), business_name: s(b.business, 100), client_type: s(b.clientType, 60), source_page: chatbot ? "chatbot" : contact ? "/contact" : "/start-project", form: chatbot ? "Chatbot" : contact ? "Contact brief" : "Start a Project", lead_source: "Website",
      selections: { items, extras: contact ? [] : est.extras },
      combo_applied: est.combo?.name ?? null, video_discount: est.videoDiscount,
      referral_code: refOk?.code ?? null, referral_discount: est.referralDiscount,
      estimated_total: contact ? 0 : est.oneTime, estimated_monthly: contact ? 0 : est.monthly, total_text: totalText, has_custom: est.hasCustom,
      est_delivery: contact ? null : est.delivery || null,
      requirements: Object.fromEntries(Object.entries(sel.reqs).map(([id, t]) => [SERVICES[id].name, t])),
      checklist: est.checklist, footage_link: s(b.footageLink, 500), extra_notes: s(b.notes, 2000), budget: s(b.budget, 120), timing: s(b.timing, 120),
      status: "New", ip_hash: ip,
    });

    let referralApplied = false;
    if (refOk) {
      try {
        await insert("referral_uses", { code: refOk.code, lead_id: lead.id, new_client_name: name, new_client_whatsapp: whatsapp, status: "Pending" });
        referralApplied = est.referralDiscount > 0;
      } catch (e) { if (!(e instanceof Conflict)) throw e; }
    }

    const est$ = contact ? "to be quoted" : est.totalText;
    const text = [
      `New lead from ${chatbot ? "the chatbot" : contact ? "the contact page" : "the services page"}`, ``,
      `Name: ${name}`, `WhatsApp: https://wa.me/91${whatsapp}`, b.email ? `Email: ${b.email}` : "", b.business ? `Business: ${b.business}` : "", ``,
      ...items.map((i) => `• ${i.service ? i.service + ": " : ""}${i.option}${i.qty > 1 ? ` × ${i.qty}` : ""}${i.price === null ? "" : ` — ${inr(Number((i as { total?: number }).total ?? i.price))}${(i as { unit?: string }).unit === "month" ? "/month" : ""}`}`),
      ...est.extras.map((x) => `  + ${x.name} (${x.service}) ${inr(x.price)}${x.monthly ? "/month" : ""}`),
      ``, `Estimated total: ${totalText}`, est.delivery && !contact ? `Est. delivery: ${est.delivery}` : "",
      est.combo ? `Combo: ${est.combo.name}` : "", est.videoDiscount ? `Video discount: −${inr(est.videoDiscount)}` : "",
      referralApplied ? `Referral code: ${refOk?.code} (−${inr(est.referralDiscount)})` : "",
      ...Object.entries(sel.reqs).map(([id, t]) => `Requirements (${SERVICES[id].name}): ${t}`),
      b.footageLink ? `Link: ${b.footageLink}` : "", b.notes ? `Notes: ${b.notes}` : "", b.budget ? `Budget: ${b.budget}` : "", b.timing ? `Timing: ${b.timing}` : "",
      ``, `Open in admin: ${SETTINGS.siteUrl}/admin?lead=${lead.id}`,
    ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");
    await sendLeadAlert(`New lead: ${name}, ${main}, est. ${est$}`, text);

    return NextResponse.json({ ok: true, referralApplied, code: referralApplied ? refOk?.code : null });
  } catch {
    return NextResponse.json({ ok: false, error: "save-failed" }, { status: 503 });
  }
}
