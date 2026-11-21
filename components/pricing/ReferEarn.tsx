"use client";
/* "Refer and earn": a unique code per referrer (same WhatsApp number = same code), share on WhatsApp or copy.
   Sits inside the Services and prices section on /create and /build, and is its own small section on the homepage. */
import { useState } from "react";
import { COPY } from "../../data/pricing";
import { SETTINGS, whatsappShare } from "../../data/settings";
import { normalizePhone } from "../../lib/referral";

/** Homepage: "Refer and earn" as its own small section, in the same violet band. */
export function ReferSection() {
  return (
    <section data-tone="dark" className="pac-band bg-violet px-4 py-14 text-light sm:px-6 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl"><ReferEarn standalone /></div>
    </section>
  );
}

export default function ReferEarn({ standalone = false }: { standalone?: boolean }) {
  const Title = standalone ? "h2" : "h3";
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
    <div id="refer" role="region" aria-labelledby="refer-title" className={`svc-refer scroll-mt-24 ${standalone ? "" : "mt-10 md:mt-14"}`}>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white">Referrals</p>
          <Title id="refer-title" className="mt-3 text-[clamp(1.9rem,5.5vw,3rem)] font-extrabold leading-tight text-white">Refer and earn</Title>
          <p className="mt-3 text-[clamp(1.25rem,3.4vw,1.75rem)] font-extrabold leading-snug"><span className="pac-accent">You get ₹500. Your friend gets ₹500.</span></p>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/90">Share your link with a business or creator. When they start a project, they get ₹500 off their first order and you get ₹500 off your next one. No limit on referrals.</p>
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
    </div>
  );
}
