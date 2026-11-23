/* SERVER ONLY. Everything the MAKENDLESS Assistant knows, written from the same live data the pages use
   (data/pricing.ts, data/process.ts, data/work.ts, data/owner.ts, after /admin edits are applied by loadContent()).
   So the bot can only quote prices that are on the website, and a price change in /admin reaches it at once. */
import { COMBOS_ENABLED, combos, COPY, REFERRAL, servicesOf, studios, VIDEO_TIERS, fillTokens, type Option } from "../data/pricing";
import { faqGroups, process } from "../data/process";
import { REVIEWS, WORK } from "../data/work";
import { NUMBERS } from "../data/owner";
import { SETTINGS } from "../data/settings";
import { SAMPLES } from "../data/samples";
import { inr } from "./pricing";

const UNIT: Record<Option["unit"], string> = { one: "", each: " per video/design", month: "/month", issue: " per issue" };
const price = (o: Option) => (o.price === null ? "custom quote after a quick call" : `${inr(o.price)}${UNIT[o.unit]}`);
const strip = (t: string) => t.replace(/\*\*/g, "");

export function siteKnowledge(): string {
  const out: string[] = [];
  out.push("# MAKENDLESS — CREATE • BUILD • GROW", "A small expert studio in India that works online with clients in India and abroad. Website: " + SETTINGS.siteUrl);

  for (const st of studios) {
    out.push("", `## ${st.verb} — ${st.name}${st.beta ? " (BETA: not on sale, no prices, no results promised)" : ""}`, st.lead, `Page: ${st.href}`);
    if (st.planned?.length) for (const p of st.planned) out.push(`- ${p.title} (in development): ${p.summary} Planned scope: ${p.items.join(", ")}.`);
    for (const s of servicesOf(st.id)) {
      out.push("", `### ${s.name}${s.tag ? ` [${s.tag}]` : ""} — ${s.line} (link: ${st.href}#${s.id})`);
      for (const o of s.options) out.push(`- ${o.name}: ${price(o)}; delivery ${o.delivery}${o.popular ? "; popular" : ""}`);
      if (s.extras.length) out.push(`Extras: ${s.extras.map((x) => `${x.name} ${inr(x.price)}${x.monthly ? "/month" : ""}`).join("; ")}`);
      if (s.free.length) out.push(`Included free: ${s.free.join(", ")}`);
      if (s.need.length) out.push(`What we need from the client: ${s.need.join("; ")}`);
      const samples = SAMPLES[s.id] ?? [];
      if (samples.length) out.push(`Real samples: ${samples.join(" , ")}`);
    }
  }

  if (COMBOS_ENABLED && combos.length) {
    out.push("", "## Combo packs (applied automatically on /start-project when the selection matches; listed on /studios)");
    for (const k of combos) out.push(`- ${k.name}${k.tag ? ` [${k.tag}]` : ""}: ${k.inside}. ${inr(k.price)}${k.monthly ? "/month" : ""} instead of ${inr(k.normal)} (save ${inr(k.save)})`);
  }
  out.push("", "## Discounts and referral",
    `Video quantity discount (CREATE only, not for Monthly 12 Reels or videos inside a combo): ${[...VIDEO_TIERS].reverse().map((t) => `${t.pct}% off from ${t.min} videos`).join(", ")}. Applied automatically.`,
    `Referral offer: get a referral link on the homepage (Refer and earn). When a friend starts a project of ${inr(REFERRAL.minTotal)} or more with the link, the friend gets ${inr(REFERRAL.discount)} off and the referrer gets ${inr(REFERRAL.credit)} off their next order. One referral discount per client. Credits stay valid ${NUMBERS.creditMonths} months.`);

  out.push("", "## Payment, delivery, revisions, refunds", ...COPY.payment.map((p) => `- ${p}`), `- ${COPY.delivery}`, `- ${COPY.smallChanges}`,
    `- The balance is paid before final files are handed over or the project goes live. If it isn't paid within ${NUMBERS.balanceDays} days of delivery, support may pause and final files are kept until payment.`,
    `- Project files are kept ${NUMBERS.fileDays} days after delivery.`, "- Prices shown don't include GST; once MAKENDLESS is GST-registered, 18% GST is added to invoices.");

  out.push("", "## How a project runs", ...process.map((p) => `${p.n}. ${p.title}: ${p.text}`));

  out.push("", "## FAQ");
  for (const g of faqGroups) for (const f of g.items) out.push(`Q: ${f.q}`, `A: ${strip(fillTokens([f.a, ...(f.list ?? []).map((l) => `- ${l}`), f.after ?? ""].filter(Boolean).join("\n")))}`);

  out.push("", "## Our work (real projects, all on /work; reels also on /create, websites also on /build)");
  const work = [
    ...WORK.reels.map((r) => `- Reel (CREATE, ${r.service}): ${r.title} — ${r.text}. Watch it on /work?type=create`),
    ...WORK.sites.map((x) => `- Website (BUILD): ${x.name} (${x.category}) — ${x.text} Built: ${x.tags.join(", ")}. Live at ${x.url}`),
  ];
  out.push(...(work.length ? [...work, "The animated scenes elsewhere on the site are concept demos, marked as demos. Don't name any person or other brand beyond what is written here."] : ["No public portfolio items are on the website yet. The animations on the site are concept demos, not client work. Offer to share samples on WhatsApp."]));
  if (REVIEWS.length) out.push("", "## Client reviews", ...REVIEWS.map((r) => `- ${r.name}${r.role ? ` (${r.role})` : ""}: "${r.text}"`));

  out.push("", "## Contact and pages",
    `WhatsApp: ${SETTINGS.whatsapp || "via the WhatsApp button on the site"}. Email: ${SETTINGS.email || "via /contact"}.${SETTINGS.socials.instagram ? ` Instagram: ${SETTINGS.socials.instagram}` : ""}`,
    "Pick services and see prices: /create (video editing) and /build (websites & technology). All studios and combo packs: /studios. Real work: /work. Start a Project: /start-project. Not sure what you need: /contact (write a brief). All questions: /faq. Privacy: /privacy. Terms: /terms. Digital marketing beta: /grow.",
    "The team replies on WhatsApp within 24 hours with the final price and timeline.");
  return out.join("\n");
}
