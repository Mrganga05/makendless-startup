/* Pure price maths, shared by the browser (live estimate) and the server (re-checks every lead). No React here. */
import { combos, COMBOS_ENABLED, EXTRAS, OPTIONS, REFERRAL, SERVICES, VIDEO_TIERS, type Combo } from "../data/pricing";

export interface Selection {
  /** option id -> quantity (1 for single items) */
  items: Record<string, number>;
  /** extra id -> true */
  extras: Record<string, boolean>;
  /** service id -> "Your requirements" text */
  reqs: Record<string, string>;
}
export const EMPTY: Selection = { items: {}, extras: {}, reqs: {} };

export const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
export const unitLabel = (u: string) => (u === "each" ? " each" : u === "month" ? "/month" : u === "issue" ? " per issue" : "");

export interface Line { id: string; name: string; service: string; qty: number; price: number | null; unit: string; total: number; monthly: boolean; delivery: string }
export interface Estimate {
  lines: Line[];
  extras: { id: string; name: string; service: string; price: number; monthly: boolean }[];
  count: number;
  oneTime: number;
  monthly: number;
  hasCustom: boolean;
  combo: Combo | null;
  videoCount: number;
  videoPct: number;
  videoDiscount: number;
  /** Next video tier tip, e.g. "Add 1 more video to get 5% off" */
  videoTip: string;
  referralDiscount: number;
  /** Combo nudge, e.g. "Add Logo & Intro Animation to unlock the Launch Pack and save ₹1,795" */
  hint: string;
  delivery: string;
  /** Total line, e.g. "₹10,999 + ₹1,499/month" */
  totalText: string;
  checklist: string[];
}

/** Clean a selection from the browser: only known ids, sane quantities, extras only for services in use. */
export function clean(sel: Partial<Selection> | null | undefined): Selection {
  const items: Record<string, number> = {};
  for (const [id, q] of Object.entries(sel?.items ?? {})) {
    const o = OPTIONS[id];
    if (!o) continue;
    const n = Math.floor(Number(q));
    if (n >= 1) items[id] = o.qty ? Math.min(n, 99) : 1;
  }
  const used = new Set(Object.keys(items).map((id) => OPTIONS[id].service.id));
  const extras: Record<string, boolean> = {};
  for (const [id, on] of Object.entries(sel?.extras ?? {})) if (on && EXTRAS[id] && used.has(EXTRAS[id].service.id)) extras[id] = true;
  const reqs: Record<string, string> = {};
  for (const [id, t] of Object.entries(sel?.reqs ?? {})) if (SERVICES[id] && typeof t === "string" && t.trim()) reqs[id] = t.slice(0, 500);
  return { items, extras, reqs };
}

const comboMissing = (c: Combo, items: Record<string, number>) => c.items.filter((i) => (items[i.id] ?? 0) < i.qty);

export function estimate(input: Selection, referral = false): Estimate {
  const sel = clean(input);
  const lines: Line[] = Object.entries(sel.items).map(([id, qty]) => {
    const o = OPTIONS[id];
    return { id, name: o.name, service: o.service.name, qty, price: o.price, unit: o.unit, total: (o.price ?? 0) * qty, monthly: o.unit === "month", delivery: o.delivery };
  });
  const extras = Object.keys(sel.extras).map((id) => ({ id, name: EXTRAS[id].name, service: EXTRAS[id].service.name, price: EXTRAS[id].price, monthly: !!EXTRAS[id].monthly }));

  let oneTime = 0, monthly = 0;
  for (const l of lines) l.monthly ? (monthly += l.total) : (oneTime += l.total);
  for (const x of extras) x.monthly ? (monthly += x.price) : (oneTime += x.price);

  /* Combo: the matching pack with the biggest saving. */
  const combo = !COMBOS_ENABLED ? null : combos.filter((c) => comboMissing(c, sel.items).length === 0).sort((a, b) => b.save - a.save)[0] ?? null;
  const covered: Record<string, number> = {};
  if (combo) {
    for (const i of combo.items) {
      covered[i.id] = i.qty;
      const o = OPTIONS[i.id];
      o.unit === "month" ? (monthly -= o.price! * i.qty) : (oneTime -= o.price! * i.qty);
    }
    combo.monthly ? (monthly += combo.price) : (oneTime += combo.price);
  }

  /* Video quantity discount: CREATE videos outside the combo (Monthly 12 Reels is not a "video" item). */
  let videoCount = 0, videoValue = 0;
  for (const [id, qty] of Object.entries(sel.items)) {
    const o = OPTIONS[id];
    if (!o.video || o.price === null) continue;
    const n = qty - (covered[id] ?? 0);
    if (n > 0) { videoCount += n; videoValue += n * o.price; }
  }
  const videoPct = VIDEO_TIERS.find((t) => videoCount >= t.min)?.pct ?? 0;
  const videoDiscount = Math.round((videoValue * videoPct) / 100);
  oneTime -= videoDiscount;
  const next = [...VIDEO_TIERS].reverse().find((t) => videoCount < t.min);
  const gap = next ? next.min - videoCount : 0;
  const videoTip = next ? `Add ${gap}${videoCount ? " more" : ""} video${gap > 1 ? "s" : ""} to get ${next.pct}% off` : `${videoPct}% off applied`;

  /* Referral: ₹500 off when the estimate is ₹2,000 or more. */
  const referralDiscount = referral && oneTime + monthly >= REFERRAL.minTotal ? REFERRAL.discount : 0;
  if (referralDiscount) oneTime >= referralDiscount ? (oneTime -= referralDiscount) : (monthly -= referralDiscount);

  /* Combo hint: one item away from a pack that saves more than the current one. */
  let hint = "";
  const close = (COMBOS_ENABLED ? combos : [])
    .filter((c) => c.save > (combo?.save ?? 0))
    .map((c) => ({ c, miss: comboMissing(c, sel.items) }))
    .filter((x) => x.miss.length === 1 && x.miss.length < x.c.items.length)
    .sort((a, b) => b.c.save - a.c.save)[0];
  if (close) {
    const m = close.miss[0], have = sel.items[m.id] ?? 0, name = OPTIONS[m.id].name;
    const what = m.qty === 1 ? name : `${m.qty - have}${have ? " more" : ""} ${name}`;
    hint = `Add ${what} to unlock the ${close.c.name} and save ${inr(close.c.save)}`;
  }

  /* Est. delivery: the longest delivery among selected items. */
  const timed = lines.map((l) => ({ l, d: OPTIONS[l.id].days })).filter((x) => x.d !== null) as { l: Line; d: number }[];
  const longest = timed.sort((a, b) => b.d - a.d)[0];
  const delivery = longest ? longest.l.delivery : lines.length ? "Custom quote" : "";

  const hasCustom = lines.some((l) => l.price === null);
  const parts = [oneTime > 0 ? inr(oneTime) : "", monthly > 0 ? `${inr(monthly)}/month` : ""].filter(Boolean);
  const totalText = parts.length ? parts.join(" + ") + (hasCustom ? " + custom quote" : "") : hasCustom ? "Custom quote" : inr(0);

  /* "What we need from you": every selected service's list, option extras, duplicates removed. */
  const seen = new Set<string>(), checklist: string[] = [];
  const add = (t: string) => { const k = t.toLowerCase(); if (!seen.has(k)) { seen.add(k); checklist.push(t); } };
  for (const l of lines) { OPTIONS[l.id].service.need.forEach(add); OPTIONS[l.id].need?.forEach(add); }

  return { lines, extras, count: lines.length, oneTime, monthly, hasCustom, combo, videoCount, videoPct, videoDiscount, videoTip, referralDiscount, hint, delivery, totalText, checklist };
}
