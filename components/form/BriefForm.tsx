"use client";
/* Start a Project: the project-brief form. States: idle -> loading -> ready (not sent) | delivered | error. */
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { accentOf, color } from "../../data/tokens";
import { submitBrief, type Simulate } from "../../lib/submit-brief";
import { Arrow, BetaBadge } from "../ui";
import { COPY } from "../../data/pricing";
import BriefResult, { ICON, useCopy } from "./BriefResult";
import { Essentials, LiveBrief, StudioMotif } from "./BriefSheet";
import {
  LIMITS, STUDIO_OPTIONS, WHO_OPTIONS, formatBrief, payloadFields, servicesFor, validate, validateField,
  type BriefValues, type FieldKey, type StudioChoice,
} from "./brief";

type Status = "idle" | "loading" | "ready" | "delivered" | "error";
type Errors = Partial<Record<FieldKey, string>>;
const FIELD_LABEL: Record<FieldKey, string> = { name: "Name", whatsapp: "WhatsApp", email: "Email", message: "What you need" };
const MIN_PENDING_MS = 700; // keeps the progress state readable; the adapter itself is instant today

function ErrorText({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="for-error mt-2 flex items-start gap-1.5 text-sm font-semibold">
      <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6.2" /><path d="M8 4.8v3.6M8 11v.2" /></svg>
      <span><span className="sr-only">Error: </span>{children}</span>
    </p>
  );
}

function Label({ htmlFor, children, required, optional }: { htmlFor: string; children: React.ReactNode; required?: boolean; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="flex flex-wrap items-baseline gap-x-2 text-[15px] font-bold text-dark">
      {children}
      {required && <span className="text-xs font-semibold text-muted-dark">Required</span>}
      {optional && <span className="text-xs font-semibold text-muted-dark">Optional</span>}
    </label>
  );
}

function Step({ n, title, note, children }: { n: string; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="for-step" aria-labelledby={`bf-step-${n}`}>
      <div className="flex items-baseline gap-4">
        <span className="for-step-n tabular-nums" aria-hidden="true">{n}</span>
        <div>
          <h3 id={`bf-step-${n}`} className="text-2xl font-extrabold leading-tight text-dark">{title}</h3>
          {note && <p className="mt-1 text-sm text-muted-dark">{note}</p>}
        </div>
      </div>
      <div className="mt-6 grid gap-6">{children}</div>
    </section>
  );
}

export default function BriefForm({ initial, simulate }: { initial: BriefValues; simulate?: Simulate }) {
  const uid = useId();
  const [v, setV] = useState<BriefValues>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [hydrated, setHydrated] = useState(false);
  const [brief, setBrief] = useState({ text: "", date: "" });
  const [copyState, copy] = useCopy();
  const summaryRef = useRef<HTMLDivElement>(null);
  const failRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLHeadingElement>(null);
  const focusTop = useRef(false);
  const mounted = useRef(true);

  useEffect(() => { setHydrated(true); mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (status === "idle" && focusTop.current) { focusTop.current = false; topRef.current?.focus(); } }, [status]);
  useEffect(() => { if (status === "error") failRef.current?.focus(); }, [status]);

  const set = <K extends keyof BriefValues>(key: K, value: BriefValues[K]) => {
    const next = { ...v, [key]: value };
    setV(next);
    if (key in errors) { // a flagged field clears as soon as it is fixed
      const k = key as FieldKey;
      const msg = validateField(k, next);
      setErrors((e) => { const out = { ...e }; if (msg) out[k] = msg; else delete out[k]; return out; });
    }
  };
  const setStudio = (studio: StudioChoice) => setV((p) => (p.studio === studio ? p : { ...p, studio, services: [], pkg: "" }));
  const toggleService = (code: string) => setV((p) => ({ ...p, services: p.services.includes(code) ? p.services.filter((c) => c !== code) : [...p.services, code] }));
  const blurCheck = (k: FieldKey) => { if (v[k].trim()) { const msg = validateField(k, v); if (msg) setErrors((e) => ({ ...e, [k]: msg })); } };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    const found = validate(v);
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus("idle");
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const text = formatBrief(v, date);
    setBrief({ text, date });
    setStatus("loading");
    await new Promise((r) => setTimeout(r, MIN_PENDING_MS));
    if (mounted.current) setStatus("ready"); // review step; the brief is sent from there with "Start a Project"
  }

  const goToField = (k: FieldKey) => (e: React.MouseEvent) => { e.preventDefault(); document.getElementById(`bf-${k}`)?.focus(); };

  if (status === "ready" || status === "delivered") {
    return <BriefResult values={v} text={brief.text} dateLabel={brief.date} onSend={() => submitBrief(payloadFields(v), simulate)} onEdit={() => { focusTop.current = true; setStatus("idle"); }} />;
  }

  const loading = status === "loading";
  const errorKeys = Object.keys(errors) as FieldKey[];
  const services = servicesFor(v.studio);
  const grow = v.studio === "grow";
  const describe = (...ids: (string | false | undefined)[]) => ids.filter(Boolean).join(" ") || undefined;
  const accent = v.studio === "unsure" ? color.violet : accentOf[v.studio];

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-16">
      <form onSubmit={onSubmit} noValidate aria-busy={loading} aria-labelledby={`${uid}-title`} className="min-w-0">
        <h2 id={`${uid}-title`} ref={topRef} tabIndex={-1} className="for-anchor text-[clamp(1.6rem,5.5vw,2.25rem)] font-extrabold leading-tight text-dark outline-none">Write your brief</h2>
        <p className="mt-2 max-w-xl text-base leading-relaxed text-muted-dark">Only your name and WhatsApp number are required. Everything else helps us understand the job.</p>

        {errorKeys.length > 0 && (
          <div ref={summaryRef} tabIndex={-1} role="alert" className="for-summary for-anchor mt-8">
            <p className="text-base font-extrabold">{errorKeys.length === 1 ? "1 field needs attention" : `${errorKeys.length} fields need attention`}</p>
            <ul className="mt-2 grid gap-1">
              {errorKeys.map((k) => (
                <li key={k}><a href={`#bf-${k}`} onClick={goToField(k)} className="for-summary-link">{FIELD_LABEL[k]}: {errors[k]}</a></li>
              ))}
            </ul>
          </div>
        )}

        <fieldset disabled={loading} className="for-steps mt-10 min-w-0">
          <legend className="sr-only">Project brief</legend>

          <Step n="01" title="You">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="bf-name" required>Name</Label>
                <input id="bf-name" name="name" type="text" autoComplete="name" required aria-required="true" maxLength={LIMITS.name} value={v.name}
                  onChange={(e) => set("name", e.target.value)} onBlur={() => blurCheck("name")}
                  aria-invalid={errors.name ? true : undefined} aria-describedby={describe(errors.name && "bf-name-error")} className="for-field mt-2" />
                {errors.name && <ErrorText id="bf-name-error">{errors.name}</ErrorText>}
              </div>
              <div>
                <Label htmlFor="bf-whatsapp" required>WhatsApp number</Label>
                <input id="bf-whatsapp" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" required aria-required="true" maxLength={LIMITS.whatsapp} value={v.whatsapp} placeholder="10-digit number"
                  onChange={(e) => set("whatsapp", e.target.value)} onBlur={() => blurCheck("whatsapp")}
                  aria-invalid={errors.whatsapp ? true : undefined} aria-describedby={describe(errors.whatsapp && "bf-whatsapp-error")} className="for-field mt-2" />
                {errors.whatsapp && <ErrorText id="bf-whatsapp-error">{errors.whatsapp}</ErrorText>}
              </div>
              <div>
                <Label htmlFor="bf-email" optional>Email</Label>
                <input id="bf-email" name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={LIMITS.email} value={v.email}
                  onChange={(e) => set("email", e.target.value)} onBlur={() => blurCheck("email")}
                  aria-invalid={errors.email ? true : undefined} aria-describedby={describe(errors.email && "bf-email-error")} className="for-field mt-2" />
                {errors.email && <ErrorText id="bf-email-error">{errors.email}</ErrorText>}
              </div>
            </div>
            <div>
              <Label htmlFor="bf-business" optional>Business or channel name</Label>
              <input id="bf-business" name="business" type="text" autoComplete="organization" maxLength={LIMITS.business} value={v.business} onChange={(e) => set("business", e.target.value)} className="for-field mt-2" />
            </div>
            <fieldset className="min-w-0">
              <legend className="flex flex-wrap items-baseline gap-x-2 text-[15px] font-bold text-dark">I am a… <span className="text-xs font-semibold text-muted-dark">Optional</span></legend>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {WHO_OPTIONS.map((w) => (
                  <label key={w.id} className="for-pill">
                    <input type="radio" name="who" value={w.id} checked={v.who === w.id} onChange={() => set("who", w.id)} className="sr-only" />
                    <span>{w.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </Step>

          <Step n="02" title="The project">
            <fieldset className="min-w-0">
              <legend className="text-[15px] font-bold text-dark">Which studio?</legend>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {STUDIO_OPTIONS.map((o) => (
                  <label key={o.id} className="for-studio" style={{ ["--acc" as string]: o.id === "unsure" ? color.muted : accentOf[o.id] }}>
                    <input type="radio" name="studio" value={o.id} checked={v.studio === o.id} onChange={() => setStudio(o.id)} className="sr-only" />
                    <StudioMotif studio={o.id} className="for-motif-card" />
                    <span className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="for-studio-verb font-extrabold">{o.verb}</span>
                      {o.beta && <BetaBadge tone="light" />}
                    </span>
                    <span className="for-studio-sub mt-1 block text-[13px] font-semibold leading-snug">{o.name}</span>
                  </label>
                ))}
              </div>
              {grow && <p className="for-note mt-4">GROW: Beta - taking first clients. Tell us about your business and we&apos;ll reply on WhatsApp with a plan and the monthly price. Plans are paid monthly in advance.</p>}
              {v.studio === "unsure" && <p className="mt-4 text-sm leading-relaxed text-muted-dark">Not sure is fine. Describe the job in your own words below and we will work out the right studio together.</p>}
            </fieldset>

            {services.length > 0 && (
              <fieldset className="min-w-0" style={{ ["--acc" as string]: accent }}>
                <legend className="flex flex-wrap items-baseline gap-x-2 text-[15px] font-bold text-dark">{grow ? "What would interest you?" : "What do you need?"} <span className="text-xs font-semibold text-muted-dark">Optional, pick any</span></legend>
                <div key={v.studio} className="for-services mt-3 grid gap-2.5 sm:grid-cols-2">
                  {services.map((s, i) => (
                    <label key={s.code} className="for-check" style={{ ["--i" as string]: i }}>
                      <input type="checkbox" name="services" value={s.code} checked={v.services.includes(s.code)} onChange={() => toggleService(s.code)} className="sr-only" />
                      <span className="for-check-box" aria-hidden="true"><svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6.5 4.8 9 10 3.5" /></svg></span>
                      <span className="text-sm font-semibold leading-snug">{s.title}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

          </Step>

          <Step n="03" title="The details">
            <div>
              <Label htmlFor="bf-message" optional>{grow ? "What would you want from marketing support?" : COPY.requirementsName}</Label>
              <p id="bf-message-hint" className="mt-1 text-sm text-muted-dark">What it is, who it is for and what a good result looks like. A few sentences is plenty.</p>
              <textarea id="bf-message" name="message" rows={6} maxLength={LIMITS.message} value={v.message}
                onChange={(e) => set("message", e.target.value)} onBlur={() => blurCheck("message")}
                aria-invalid={errors.message ? true : undefined} aria-describedby={describe("bf-message-hint", errors.message && "bf-message-error", "bf-message-count")} className="for-field for-area mt-2" />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">{errors.message && <ErrorText id="bf-message-error">{errors.message}</ErrorText>}</div>
                <p id="bf-message-count" className="mt-2 shrink-0 text-xs font-semibold tabular-nums text-muted-dark">{v.message.length} / {LIMITS.message}<span className="sr-only"> characters used</span></p>
              </div>
            </div>
            <div>
              <Label htmlFor="bf-links" optional>Links</Label>
              <p id="bf-links-hint" className="mt-1 text-sm text-muted-dark">Your current website, channel, sample footage or anything you like the look of.</p>
              <textarea id="bf-links" name="links" rows={2} maxLength={LIMITS.links} inputMode="url" autoCapitalize="none" spellCheck={false} value={v.links} onChange={(e) => set("links", e.target.value)} aria-describedby="bf-links-hint" className="for-field for-area-sm mt-2" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="bf-timing" optional>Rough timing</Label>
                <p id="bf-timing-hint" className="mt-1 text-sm text-muted-dark">A date, an event, or “flexible”.</p>
                <input id="bf-timing" name="timing" type="text" maxLength={LIMITS.timing} value={v.timing} onChange={(e) => set("timing", e.target.value)} aria-describedby="bf-timing-hint" className="for-field mt-2" />
              </div>
              <div>
                <Label htmlFor="bf-budget" optional>Budget in mind</Label>
                <p id="bf-budget-hint" className="mt-1 text-sm text-muted-dark">In your own words, if you have one.</p>
                <input id="bf-budget" name="budget" type="text" maxLength={LIMITS.budget} value={v.budget} onChange={(e) => set("budget", e.target.value)} aria-describedby="bf-budget-hint" className="for-field mt-2" />
              </div>
            </div>
          </Step>
        </fieldset>

        <div className="for-submit mt-10">
          <div className="lg:hidden"><Essentials values={v} tone="light" /></div>

          {status === "error" && (
            <div ref={failRef} tabIndex={-1} role="alert" className="for-fail for-anchor mt-6 lg:mt-0">
              <p className="text-lg font-extrabold">That did not go through. Your brief was not sent.</p>
              <p className="mt-1 text-sm leading-relaxed">Everything you typed is still here. Try again, or copy your brief now so you have it either way.</p>
              <button type="button" onClick={() => copy(brief.text)} className="for-btn for-btn-ghost mt-3">
                <svg viewBox="0 0 20 20" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={copyState === "copied" ? ICON.check : ICON.copy} /></svg>
                {copyState === "copied" ? "Copied" : "Copy brief"}
              </button>
              <span role="status" aria-live="polite" className="sr-only">{copyState === "copied" ? "Brief copied to your clipboard." : copyState === "failed" ? "Copying was blocked by your browser." : ""}</span>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button type="submit" disabled={!hydrated || loading} className="for-btn for-btn-primary for-btn-lg" data-loading={loading}>
              {loading ? (<><span className="for-spinner" aria-hidden="true" />Preparing your brief…</>) : status === "error" ? (<>Try again<Arrow /></>) : (<>Review my brief<Arrow /></>)}
            </button>
            <p role="status" aria-live="polite" className="text-sm font-semibold text-muted-dark">{loading ? "Checking and formatting your brief." : ""}</p>
          </div>
          <noscript><p className="for-note mt-4">This form needs JavaScript to prepare your brief. Nothing can be submitted without it.</p></noscript>

          <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-dark">
            We use these details only to reply to your request. See our <Link href="/privacy" className="for-link">privacy page</Link>.
          </p>
        </div>
      </form>

      <aside aria-label="Your brief so far" className="hidden lg:block">
        <div className="sticky top-28"><LiveBrief values={v} /></div>
      </aside>
    </div>
  );
}
