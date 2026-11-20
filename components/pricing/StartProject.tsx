"use client";
/* Final "Start a Project" page: selection, savings, total, requirements, combined checklist, form, payment terms. */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { COPY, OPTIONS, SERVICES } from "../../data/pricing";
import { whatsappTo } from "../../data/settings";
import { estimate, inr, unitLabel } from "../../lib/pricing";
import { normalizeCode, normalizePhone } from "../../lib/referral";
import { useSelection } from "./state";

type CodeState = "" | "checking" | "valid" | "invalid" | "own" | "used";
const CODE_MSG: Record<string, string> = { valid: "✓ ₹500 off applied", invalid: "This code isn't valid.", own: "You can't use your own referral code.", used: "This WhatsApp number has already used a referral discount." };

export default function StartProject() {
  const { sel, ready, ref, setRef, clear } = useSelection();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeState, setCodeState] = useState<CodeState>("");
  const [footage, setFootage] = useState("");
  const [notes, setNotes] = useState("");
  const [hp, setHp] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "failed">("idle");
  const [done, setDone] = useState<{ name: string; code: string | null } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (ready && ref?.code && !code) setCode(ref.code); }, [ready, ref, code]);

  /* Check the referral code as it is typed (and again once the WhatsApp number is complete). */
  const phoneOk = normalizePhone(phone);
  useEffect(() => {
    const c = normalizeCode(code);
    if (!c) { setCodeState(""); return; }
    setCodeState("checking");
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/referral/check?code=${encodeURIComponent(c)}${phoneOk ? `&whatsapp=${phoneOk}` : ""}`);
        const d = (await r.json()) as { valid: boolean; reason?: string; code?: string; name?: string };
        if (d.valid && d.code) { setCodeState("valid"); if (ref?.code !== d.code) setRef({ code: d.code, name: d.name || "A friend" }); }
        else setCodeState(d.reason === "own" || d.reason === "used" ? d.reason : "invalid");
      } catch { setCodeState("invalid"); }
    }, 400);
    return () => clearTimeout(t);
  }, [code, phoneOk]); // eslint-disable-line react-hooks/exhaustive-deps

  const est = useMemo(() => estimate(sel, codeState === "valid"), [sel, codeState]);
  const hasCreate = est.lines.some((l) => OPTIONS[l.id].service.studio === "create");
  const reqs = Object.entries(sel.reqs).filter(([id, t]) => SERVICES[id] && t.trim());

  const summary = () => [
    `Hi MAKENDLESS, I'd like to start a project.`, `Name: ${name}`, `WhatsApp: ${phone}`,
    ...est.lines.map((l) => `• ${l.name}${l.qty > 1 ? ` × ${l.qty}` : ""}`), ...est.extras.map((x) => `+ ${x.name}`),
    `Estimated: ${est.totalText}`, codeState === "valid" ? `Referral code: ${normalizeCode(code)}` : "",
    ...reqs.map(([id, t]) => `${SERVICES[id].name}: ${t}`), footage ? `Link: ${footage}` : "", notes,
  ].filter(Boolean).join("\n");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (name.trim().length < 2) errs.name = "Please enter your name.";
    if (!phoneOk) errs.phone = "Please enter a 10-digit WhatsApp number.";
    setErrors(errs);
    if (errs.name || errs.phone) { document.getElementById(errs.name ? "sp-name" : "sp-phone")?.focus(); return; }
    setStatus("sending");
    try {
      const r = await fetch("/api/leads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selection: sel, name, whatsapp: phone, referralCode: codeState === "valid" ? normalizeCode(code) : "", footageLink: hasCreate ? footage : "", notes, page: document.referrer || "", hp }),
      });
      const d = (await r.json()) as { ok: boolean; referralApplied?: boolean; code?: string | null };
      if (!r.ok || !d.ok) throw new Error("save failed");
      setDone({ name: name.trim().split(/\s+/)[0], code: d.referralApplied ? d.code ?? null : null });
      setStatus("done");
      clear(); setRef(null);
      window.scrollTo({ top: 0 });
    } catch {
      setStatus("failed");
    }
  };

  if (status === "done" && done) {
    return (
      <div className="svc-thanks" role="status">
        <p className="text-[clamp(1.6rem,5vw,2.6rem)] font-extrabold leading-tight">Thanks, {done.name}! Our team will message you on WhatsApp within 24 hours with your final price and timeline.</p>
        {done.code && <p className="mt-4 text-lg font-bold text-[#0f6b4b]">Referral code {done.code} applied: ₹500 off.</p>}
        <Link href="/" className="for-btn for-btn-secondary mt-8">Back to home</Link>
      </div>
    );
  }

  const wa = whatsappTo(summary());
  return (
    <div className="svc-final">
      <div className="svc-final-main">
        {/* 1. selection */}
        <section aria-labelledby="sp-sel" className="svc-box">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="sp-sel" className="svc-h2">Your selection</h2>
            <Link href="/#packages" className="for-link text-sm">Edit selection</Link>
          </div>
          {!ready ? <p className="mt-3 text-muted-dark">Loading…</p> : est.count === 0 ? (
            <p className="mt-3 text-muted-dark">You haven&apos;t selected any services yet. <Link href="/#packages" className="for-link">See services and prices</Link></p>
          ) : (
            <ul className="svc-lines">
              {est.lines.map((l) => (
                <li key={l.id}>
                  <span><b>{l.name}</b>{l.qty > 1 && ` × ${l.qty}`}<small>{l.service} · ⏱ {l.delivery}</small></span>
                  <span className="tabular-nums">{l.price === null ? "Custom quote" : `${inr(l.total)}${l.unit === "month" ? "/month" : ""}`}{l.qty > 1 && l.price !== null && <small>{inr(l.price)}{unitLabel(l.unit)}</small>}</span>
                </li>
              ))}
              {est.extras.map((x) => (
                <li key={x.id} className="svc-line-extra"><span>+ {x.name}<small>{x.service}</small></span><span className="tabular-nums">+{inr(x.price)}{x.monthly ? "/month" : ""}</span></li>
              ))}
            </ul>
          )}
        </section>

        {/* 2. savings + 3. total */}
        {est.count > 0 && (
          <section aria-labelledby="sp-total" className="svc-box">
            {(est.combo || est.videoDiscount > 0 || est.referralDiscount > 0) && (
              <>
                <h2 className="svc-h2">Savings</h2>
                <ul className="svc-savings">
                  {est.combo && <li>{est.combo.name} applied: you save {inr(est.combo.save)}</li>}
                  {est.videoDiscount > 0 && <li>Video discount ({est.videoPct}% off): −{inr(est.videoDiscount)}</li>}
                  {est.referralDiscount > 0 && <li>Referral discount −{inr(est.referralDiscount)}</li>}
                </ul>
              </>
            )}
            <h2 id="sp-total" className="svc-h2 mt-5">Estimated total</h2>
            <p className="svc-total">{est.totalText}</p>
            <p className="mt-1 font-bold">Est. delivery: {est.delivery}</p>
            <p className="svc-note mt-2">{COPY.delivery}</p>
          </section>
        )}

        {/* 4. requirements */}
        {reqs.length > 0 && (
          <section aria-labelledby="sp-req" className="svc-box">
            <h2 id="sp-req" className="svc-h2">Your requirements</h2>
            <dl className="svc-reqs">{reqs.map(([id, t]) => <div key={id}><dt>{SERVICES[id].name}</dt><dd>{t}</dd></div>)}</dl>
          </section>
        )}

        {/* 5. checklist */}
        {est.checklist.length > 0 && (
          <section aria-labelledby="sp-need" className="svc-box">
            <h2 id="sp-need" className="svc-h2">What we need from you</h2>
            <ul className="svc-need">{est.checklist.map((t) => <li key={t}>{t}</li>)}</ul>
          </section>
        )}
      </div>

      {/* 6. form + 7. payment terms */}
      <form onSubmit={submit} noValidate className="svc-form" aria-labelledby="sp-form">
        <h2 id="sp-form" className="svc-h2">Your details</h2>
        <div>
          <label htmlFor="sp-name" className="svc-h4">Your name <span aria-hidden="true">*</span></label>
          <input id="sp-name" className="for-field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} required aria-invalid={!!errors.name} aria-describedby={errors.name ? "sp-name-err" : undefined} />
          {errors.name && <p id="sp-name-err" className="for-error mt-1 text-sm font-semibold">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="sp-phone" className="svc-h4">WhatsApp number <span aria-hidden="true">*</span></label>
          <input id="sp-phone" className="for-field" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="10-digit number" maxLength={16} required aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "sp-phone-err" : undefined} />
          {errors.phone && <p id="sp-phone-err" className="for-error mt-1 text-sm font-semibold">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="sp-code" className="svc-h4">Referral code (optional)</label>
          <input id="sp-code" className="for-field" value={code} onChange={(e) => setCode(e.target.value)} autoCapitalize="characters" maxLength={24} placeholder="MKE-NAME-1234" aria-describedby="sp-code-msg" />
          <p id="sp-code-msg" className={`mt-1 min-h-5 text-sm font-semibold ${codeState === "valid" ? "text-[#0f6b4b]" : "for-error"}`} aria-live="polite">{CODE_MSG[codeState] ?? ""}</p>
        </div>
        {hasCreate && (
          <div>
            <label htmlFor="sp-footage" className="svc-h4">Footage or reference link (optional)</label>
            <input id="sp-footage" className="for-field" value={footage} onChange={(e) => setFootage(e.target.value)} placeholder="Google Drive or YouTube link" maxLength={500} inputMode="url" />
          </div>
        )}
        <div>
          <label htmlFor="sp-notes" className="svc-h4">Anything else we should know? (optional)</label>
          <textarea id="sp-notes" className="for-field for-area-sm" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Deadline, budget, reference websites or videos you like" maxLength={1000} />
        </div>
        <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={hp} onChange={(e) => setHp(e.target.value)} />
        <button type="submit" className="for-btn for-btn-primary for-btn-lg" disabled={status === "sending"} data-loading={status === "sending"}>
          {status === "sending" ? <><span className="for-spinner" aria-hidden="true" />Sending…</> : "Start a Project"}
        </button>

        {status === "failed" && (
          <div className="for-fail" role="alert">
            <p className="font-bold">We couldn&apos;t send your request just now.</p>
            <p className="mt-1 text-sm">Send it to us on WhatsApp instead. Your selection is already written in the message.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {wa ? <a className="for-btn for-btn-primary" href={wa} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>
                : <button type="button" className="for-btn for-btn-primary" onClick={async () => { try { await navigator.clipboard.writeText(summary()); setCopied(true); } catch { /* ignore */ } }}>{copied ? "✓ Copied" : "Copy my request"}</button>}
              <button type="submit" className="for-btn for-btn-ghost">Try again</button>
            </div>
          </div>
        )}

        <ul className="svc-terms">{COPY.payment.map((t) => <li key={t}>{t}</li>)}</ul>
      </form>
    </div>
  );
}
