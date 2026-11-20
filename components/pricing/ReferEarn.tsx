"use client";
/* Homepage "Refer and earn": a unique code per referrer (same WhatsApp number = same code), share on WhatsApp or copy. */
import { useState } from "react";
import { COPY } from "../../data/pricing";
import { SETTINGS, whatsappShare } from "../../data/settings";
import { normalizePhone } from "../../lib/referral";
import { Eyebrow, KineticHeading } from "../ui";

export default function ReferEarn() {
  const [step, setStep] = useState<"start" | "form" | "done">("start");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hp, setHp] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const link = `${SETTINGS.siteUrl}/?ref=${code}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setErr("Please enter your name.");
    if (!normalizePhone(phone)) return setErr("Please enter a 10-digit WhatsApp number.");
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/referral", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, whatsapp: phone, hp }) });
      const d = (await r.json()) as { code?: string; error?: string };
      if (!r.ok || !d.code) throw new Error(d.error || "");
      setCode(d.code); setStep("done");
    } catch (x) {
      setErr((x as Error).message || "We couldn't create your link right now. Please try again in a minute.");
    } finally { setBusy(false); }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked: the link is visible to copy by hand */ }
  };

  return (
    <section id="refer" data-tone="dark" aria-labelledby="refer-title" className="relative isolate overflow-hidden bg-ink px-4 py-20 text-light sm:px-6 md:px-8 md:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(45% 70% at 90% 0%, rgba(111,69,246,.35), transparent 70%), radial-gradient(35% 55% at 0% 100%, rgba(8,187,212,.18), transparent 70%)" }} />
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
        <div>
          <Eyebrow>Referrals</Eyebrow>
          <KineticHeading id="refer-title" text="Refer and earn" className="mt-4 text-[clamp(2rem,6vw,3.6rem)] font-extrabold leading-tight tracking-tight" />
          <p className="mt-5 text-[clamp(1.35rem,3.6vw,2rem)] font-extrabold leading-snug"><span className="prism-text">You get ₹500. Your friend gets ₹500.</span></p>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-[#c3c8de]">Share your link with a business or creator. When they start a project, they get ₹500 off their first order and you get ₹500 off your next one. No limit on referrals.</p>
        </div>
        <div className="svc-refer-card" data-tone="light">
          {step === "start" && (
            <button type="button" className="for-btn for-btn-primary for-btn-lg w-full" onClick={() => setStep("form")}>Get my referral link</button>
          )}
          {step === "form" && (
            <form onSubmit={submit} noValidate className="grid gap-4">
              <div>
                <label htmlFor="ref-name" className="svc-h4">Your name</label>
                <input id="ref-name" className="for-field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} />
              </div>
              <div>
                <label htmlFor="ref-phone" className="svc-h4">WhatsApp number</label>
                <input id="ref-phone" className="for-field" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="10-digit number" maxLength={16} />
              </div>
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={hp} onChange={(e) => setHp(e.target.value)} />
              {err && <p className="for-error text-sm font-semibold" role="alert">{err}</p>}
              <button type="submit" className="for-btn for-btn-primary for-btn-lg" disabled={busy} data-loading={busy}>{busy ? "Creating…" : "Get my referral link"}</button>
            </form>
          )}
          {step === "done" && (
            <div className="grid gap-4">
              <p className="svc-h4 !mb-0">Your code</p>
              <p className="text-[clamp(1.2rem,4.6vw,1.75rem)] font-extrabold tracking-wide [overflow-wrap:anywhere]">{code}</p>
              <p className="break-all rounded-xl bg-paper px-4 py-3 text-[15px] font-semibold">{link}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <a className="for-btn for-btn-primary" href={whatsappShare(COPY.referShare(link))} target="_blank" rel="noopener noreferrer">Share on WhatsApp</a>
                <button type="button" className="for-btn for-btn-secondary" onClick={copy}>{copied ? "✓ Copied" : "Copy link"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
