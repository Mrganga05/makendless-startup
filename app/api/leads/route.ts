import { NextResponse } from "next/server";
import { SERVICES } from "../../../data/pricing";
import { sendLeadAlert } from "../../../lib/alert";
import { Conflict, insert } from "../../../lib/db";
import { clean, estimate, inr } from "../../../lib/pricing";
import { normalizePhone } from "../../../lib/referral";
import { checkReferral } from "../../../lib/referral-server";

export const dynamic = "force-dynamic";

type Body = { selection?: unknown; name?: string; whatsapp?: string; referralCode?: string; footageLink?: string; notes?: string; page?: string; hp?: string };

/* POST /api/leads — saves a Start a Project request. Totals and the referral are re-checked here, never trusted from the browser. */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Body;
  if (b.hp) return NextResponse.json({ ok: false }, { status: 400 });
  const name = String(b.name || "").trim().slice(0, 80);
  const whatsapp = normalizePhone(b.whatsapp || "");
  if (name.length < 2 || !whatsapp) return NextResponse.json({ ok: false, error: "Please enter your name and a 10-digit WhatsApp number." }, { status: 400 });

  try {
    const sel = clean(b.selection as never);
    const ref = b.referralCode ? await checkReferral(b.referralCode, whatsapp) : null;
    const refOk = !!ref?.valid;
    const est = estimate(sel, refOk);
    const lead = await insert("leads", {
      name, whatsapp,
      referral_code: refOk && ref?.valid ? ref.code : null,
      footage_link: String(b.footageLink || "").trim().slice(0, 500) || null,
      notes: String(b.notes || "").trim().slice(0, 1000) || null,
      selections: est.lines.map((l) => ({ id: l.id, name: l.name, service: l.service, qty: l.qty, price: l.price, unit: l.unit })),
      extras: est.extras,
      combo: est.combo?.name ?? null,
      combo_saving: est.combo?.save ?? 0,
      video_discount: est.videoDiscount,
      referral_discount: est.referralDiscount,
      one_time_total: est.oneTime,
      monthly_total: est.monthly,
      has_custom: est.hasCustom,
      total_text: est.totalText,
      est_delivery: est.delivery || null,
      requirements: Object.fromEntries(Object.entries(sel.reqs).map(([id, t]) => [SERVICES[id].name, t])),
      checklist: est.checklist,
      page: String(b.page || "").slice(0, 200) || null,
      status: "new",
    });

    let referralApplied = false;
    if (refOk && ref?.valid) {
      try {
        await insert("referral_uses", { code: ref.code, lead_id: lead.id, referred_name: name, referred_whatsapp: whatsapp, discount: est.referralDiscount, status: "pending", referrer_credit: 0 });
        referralApplied = est.referralDiscount > 0;
      } catch (e) {
        if (!(e instanceof Conflict)) throw e; // already used by this number: lead is saved, no second discount
      }
    }

    const text = [
      `New lead from the website`,
      `Name: ${name}`, `WhatsApp: ${whatsapp}`, ``,
      ...est.lines.map((l) => `• ${l.service}: ${l.name}${l.qty > 1 ? ` × ${l.qty}` : ""} — ${l.price === null ? "Custom quote" : inr(l.total) + (l.unit === "month" ? "/month" : "")}`),
      ...est.extras.map((x) => `  + ${x.name} (${x.service}) ${inr(x.price)}${x.monthly ? "/month" : ""}`),
      ``,
      est.combo ? `Combo: ${est.combo.name} (save ${inr(est.combo.save)})` : "",
      est.videoDiscount ? `Video discount: −${inr(est.videoDiscount)} (${est.videoPct}%)` : "",
      referralApplied ? `Referral ${ref?.valid ? ref.code : ""}: −${inr(est.referralDiscount)}` : "",
      `Estimated total: ${est.totalText}`, `Est. delivery: ${est.delivery || "—"}`,
      ...Object.entries(sel.reqs).map(([id, t]) => `Requirements (${SERVICES[id].name}): ${t}`),
      b.footageLink ? `Footage/reference: ${b.footageLink}` : "",
      b.notes ? `Notes: ${b.notes}` : "",
    ].filter((l) => l !== "").join("\n");
    await sendLeadAlert(`New lead: ${name} — ${est.totalText}`, text);

    return NextResponse.json({ ok: true, referralApplied, code: referralApplied && ref?.valid ? ref.code : null });
  } catch {
    return NextResponse.json({ ok: false, error: "save-failed" }, { status: 503 });
  }
}
