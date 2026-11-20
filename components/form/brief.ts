/* Project brief: field model, query-string preselection, validation and plain-text formatting. No React here. */
import { packages, solutions, studios, type StudioId } from "../../data/site";
import { normalizePhone } from "../../lib/referral";

export type StudioChoice = StudioId | "unsure";

export interface BriefValues {
  name: string;
  whatsapp: string;
  email: string;
  business: string;
  who: string; // solutions id | "other" | ""
  studio: StudioChoice;
  services: string[]; // service codes of the chosen studio (V1, T2, ...)
  pkg: string; // package slug of the chosen studio, or ""
  links: string;
  timing: string;
  budget: string;
  message: string;
}

export type FieldKey = "name" | "whatsapp" | "email" | "message";

export const LIMITS = { name: 80, whatsapp: 16, email: 254, business: 100, links: 500, timing: 120, budget: 120, message: 2000 } as const;
export const MESSAGE_MIN = 10;

export const WHO_OPTIONS: { id: string; label: string }[] = [...solutions.map((s) => ({ id: s.id, label: s.label })), { id: "other", label: "Other" }];

export const STUDIO_OPTIONS: { id: StudioChoice; verb: string; name: string; note: string; beta?: boolean }[] = [
  ...studios.map((s) => ({ id: s.id as StudioChoice, verb: s.verb, name: s.name, note: s.beta ? "Beta interest only" : "", beta: s.beta })),
  { id: "unsure", verb: "NOT SURE", name: "Help me choose", note: "" },
];

export const slugOf = (name: string) => name.toLowerCase().trim().replace(/\s+/g, "-");
const isStudio = (v: string): v is StudioId => studios.some((s) => s.id === v);

/** GROW has no real packages yet (beta), so only CREATE and BUILD offer a package choice. */
export function packagesFor(studio: StudioChoice) {
  if (studio !== "create" && studio !== "build") return [];
  return packages[studio].map((p) => ({ slug: p.slug || slugOf(p.name), name: p.name, suits: p.for }));
}
export function servicesFor(studio: StudioChoice) {
  return studio === "unsure" ? [] : studios.find((s) => s.id === studio)?.services ?? [];
}

export function studioLabel(studio: StudioChoice) {
  if (studio === "unsure") return "Not sure yet";
  const s = studios.find((x) => x.id === studio)!;
  return `${s.verb} — ${s.name}${s.beta ? " (Beta interest)" : ""}`;
}
export const whoLabel = (id: string) => WHO_OPTIONS.find((w) => w.id === id)?.label ?? "";
export const packageLabel = (studio: StudioChoice, slug: string) => packagesFor(studio).find((p) => p.slug === slug)?.name ?? "";
export const serviceLabels = (studio: StudioChoice, codes: string[]) => servicesFor(studio).filter((s) => codes.includes(s.code)).map((s) => s.title);

type Params = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/**
 * Link contract: /contact?service=create|build|grow&need=<service code(s), e.g. V1 or V1,V4>&package=<slug>&for=creator|local|startup|store
 * Also accepts the older combined form ?service=create-starter. Unknown values are ignored.
 */
export function initialFromParams(params: Params): BriefValues {
  const rawService = first(params.service).toLowerCase();
  const [head, ...rest] = rawService.split("-");
  const studio: StudioChoice = isStudio(head) ? head : "unsure";
  const rawPkg = (first(params.package) || rest.join("-")).toLowerCase();
  const pkg = packagesFor(studio).some((p) => p.slug === rawPkg) ? rawPkg : "";
  const rawWho = first(params.for).toLowerCase();
  const who = WHO_OPTIONS.some((w) => w.id === rawWho) ? rawWho : "";
  const valid = new Set(servicesFor(studio).map((x) => x.code.toUpperCase()));
  const rawNeed = ([] as string[]).concat(params.need ?? []).flatMap((x) => String(x).split(","));
  const services = [...new Set(rawNeed.map((x) => x.trim().toUpperCase()).filter((x) => valid.has(x)))];
  return { name: "", whatsapp: "", email: "", business: "", who, studio, services, pkg, links: "", timing: "", budget: "", message: "" };
}

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

export function validateField(key: FieldKey, v: BriefValues): string {
  if (key === "name") {
    const n = v.name.trim();
    if (!n) return "Please tell us your name.";
    if (n.length < 2) return "Please enter at least two characters.";
  }
  if (key === "whatsapp") {
    if (!v.whatsapp.trim()) return "Please enter your WhatsApp number.";
    if (!normalizePhone(v.whatsapp)) return "Enter a 10-digit WhatsApp number.";
  }
  if (key === "email") {
    const e = v.email.trim();
    if (!e) return "";
    if (!EMAIL_RE.test(e)) return "Enter a valid email address, like name@example.com.";
  }
  if (key === "message") {
    const m = v.message.trim();
    if (m && m.length < MESSAGE_MIN) return `Tell us a little more (at least ${MESSAGE_MIN} characters).`;
  }
  return "";
}

export function validate(v: BriefValues): Partial<Record<FieldKey, string>> {
  const out: Partial<Record<FieldKey, string>> = {};
  (["name", "whatsapp", "email", "message"] as FieldKey[]).forEach((k) => {
    const e = validateField(k, v);
    if (e) out[k] = e;
  });
  return out;
}

export interface BriefRow { label: string; value: string; list?: string[]; long?: boolean }
export interface BriefGroup { title: string; rows: BriefRow[] }

/** The brief as groups of filled rows (empty optional fields are left out). */
export function briefGroups(v: BriefValues): BriefGroup[] {
  const t = (s: string) => s.trim();
  const from: BriefRow[] = [
    { label: "Name", value: t(v.name) },
    { label: "WhatsApp", value: t(v.whatsapp) },
    { label: "Email", value: t(v.email) },
    { label: "Business / channel", value: t(v.business) },
    { label: "I am", value: whoLabel(v.who) },
  ];
  const svc = serviceLabels(v.studio, v.services);
  const project: BriefRow[] = [
    { label: "Studio", value: studioLabel(v.studio) },
    { label: "Services", value: svc.join(", "), list: svc },
    { label: "Package of interest", value: packageLabel(v.studio, v.pkg) },
  ];
  const details: BriefRow[] = [
    { label: "Links", value: t(v.links), long: true },
    { label: "Timing", value: t(v.timing) },
    { label: "Budget in mind", value: t(v.budget) },
    { label: "What I need", value: t(v.message), long: true },
  ];
  return [
    { title: "From", rows: from.filter((r) => r.value) },
    { title: "Project", rows: project.filter((r) => r.value) },
    { title: "Details", rows: details.filter((r) => r.value) },
  ].filter((g) => g.rows.length);
}

export function formatBrief(v: BriefValues, dateLabel: string): string {
  const lines: string[] = ["MAKENDLESS — PROJECT BRIEF", dateLabel ? `Prepared ${dateLabel}` : "", ""];
  for (const g of briefGroups(v)) {
    lines.push(g.title.toUpperCase());
    for (const r of g.rows) {
      if (r.list && r.list.length > 1) { lines.push(`${r.label}:`); r.list.forEach((x) => lines.push(`  - ${x}`)); }
      else if (r.long) { lines.push(`${r.label}:`); lines.push(r.value); }
      else lines.push(`${r.label}: ${r.value}`);
    }
    lines.push("");
  }
  return lines.filter((l, i) => !(l === "" && lines[i - 1] === "")).join("\n").trim() + "\n";
}

export function payloadFields(v: BriefValues): Record<string, string | string[]> {
  const pkg = packageLabel(v.studio, v.pkg);
  return {
    name: v.name.trim(), whatsapp: v.whatsapp.trim(), email: v.email.trim(), business: v.business.trim(), clientType: whoLabel(v.who),
    studio: studioLabel(v.studio), services: [...serviceLabels(v.studio, v.services), ...(pkg ? [`Package: ${pkg}`] : [])],
    footageLink: v.links.trim(), timing: v.timing.trim(), budget: v.budget.trim(), notes: v.message.trim(),
  };
}
