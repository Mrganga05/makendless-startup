"use client";
/* GROW (beta) "Join the waitlist" email box. Saves to the waitlist table. */
import Link from "next/link";
import { useState } from "react";
import { trackPixel } from "./MetaPixel";

export default function Waitlist({ compact = false, tone = "light" }: { compact?: boolean; tone?: "light" | "dark" }) {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [state, setState] = useState<"" | "busy" | "done" | "error" | "invalid">("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setState("invalid");
    setState("busy");
    try {
      const r = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, hp }) });
      setState(r.ok ? "done" : "error");
      if (r.ok) trackPixel("Lead");
    } catch { setState("error"); }
  };
  const dark = tone === "dark";
  if (state === "done") return <p role="status" className={`text-[15px] font-bold ${dark ? "text-grow" : "text-[#0f6b4b]"}`}>✓ You&apos;re on the GROW waitlist. We&apos;ll email you when it opens.</p>;
  return (
    <form onSubmit={submit} noValidate className={`@container flex w-full flex-col gap-2 ${compact ? "" : "max-w-md"}`} aria-label="Join the GROW waitlist">
      {/* Narrow boxes (phones, the GROW card): email full width, button below it, so "Your email" is never cut. */}
      <div className="flex flex-col gap-2 @md:flex-row">
        <label htmlFor={compact ? "wl-email-c" : "wl-email"} className="sr-only">Your email</label>
        <input id={compact ? "wl-email-c" : "wl-email"} type="email" inputMode="email" autoComplete="email" placeholder="Your email" value={email} onChange={(e) => { setEmail(e.target.value); setState(""); }}
          className="for-field !min-h-11 w-full min-w-0 flex-1 !py-2" aria-invalid={state === "invalid" || undefined} />
        <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={hp} onChange={(e) => setHp(e.target.value)} />
        <button type="submit" disabled={state === "busy"} className={`for-btn ${dark ? "bg-white text-dark hover:bg-violet-soft" : "for-btn-primary"} !min-h-11 w-full shrink-0 !px-4 @md:w-auto`}>Join the waitlist</button>
      </div>
      <p className={`text-xs ${dark ? "text-white/70" : "text-muted-dark"}`}>We use these details only to reply to you. <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link></p>
      {(state === "invalid" || state === "error") && <p role="alert" className={`text-sm font-semibold ${dark ? "text-[#ffb4c0]" : "for-error"}`}>{state === "invalid" ? "Please enter a valid email." : "Something went wrong. Please try again."}</p>}
    </form>
  );
}
