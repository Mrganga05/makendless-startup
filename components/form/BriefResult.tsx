"use client";
/* Review step of the contact-page Start a Project form: check the brief, press "Start a Project" to send it. */
import { useEffect, useRef, useState } from "react";
import { SETTINGS, whatsappTo } from "../../data/settings";
import { BriefDocument } from "./BriefSheet";
import type { BriefValues } from "./brief";

async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* fall through to the legacy path */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch { return false; }
}

export function useCopy() {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const copy = async (text: string) => {
    const ok = await copyText(text);
    setState(ok ? "copied" : "failed");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 4000);
  };
  return [state, copy] as const;
}

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 20 20" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
export const ICON = {
  copy: "M7 7V4.5A1.5 1.5 0 0 1 8.5 3h7A1.5 1.5 0 0 1 17 4.5v7a1.5 1.5 0 0 1-1.5 1.5H13M4.5 7h7A1.5 1.5 0 0 1 13 8.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 15.5v-7A1.5 1.5 0 0 1 4.5 7Z",
  check: "M4 10.5 8.2 14.5 16 6",
  download: "M10 3v10m0 0 4-4m-4 4-4-4M4 16.5h12",
  mail: "M3 5.5h14v9H3zM3.5 6l6.5 5 6.5-5",
  edit: "M4 16l.8-3.6L13.6 3.6a1.4 1.4 0 0 1 2 0l.8.8a1.4 1.4 0 0 1 0 2L7.6 15.2 4 16Z",
};

export default function BriefResult({ values, text, dateLabel, onEdit, onSend }: { values: BriefValues; text: string; dateLabel: string; onEdit: () => void; onSend: () => Promise<void> }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [state, setState] = useState<"review" | "sending" | "sent" | "failed">("review");
  useEffect(() => { heading.current?.focus(); }, [state === "sent"]); // eslint-disable-line react-hooks/exhaustive-deps
  const send = async () => {
    setState("sending");
    try { await onSend(); setState("sent"); window.scrollTo({ top: 0 }); } catch { setState("failed"); }
  };
  const first = values.name.trim().split(/\s+/)[0];
  const wa = whatsappTo(`Hi MAKENDLESS, I want to start a project.\n\n${text}`);
  if (state === "sent") {
    return (
      <div className="for-result max-w-3xl" data-kind="delivered">
        <p className="for-state-tag for-state-ok"><span className="for-state-dot" aria-hidden="true" />Sent</p>
        <h2 ref={heading} tabIndex={-1} className="for-anchor mt-5 text-[clamp(1.7rem,6vw,2.75rem)] font-extrabold leading-[1.08] text-dark outline-none">Thanks, {first}! Our team will message you on WhatsApp within 24 hours.</h2>
      </div>
    );
  }
  return (
    <div className="for-result grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14" data-kind="ready">
      <div className="min-w-0">
        <h2 ref={heading} tabIndex={-1} className="for-anchor text-[clamp(1.7rem,6vw,2.75rem)] font-extrabold leading-[1.08] text-dark outline-none">Review your brief</h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-dark">Check the details, then press Start a Project to send it to our team.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={send} disabled={state === "sending"} data-loading={state === "sending"} className="for-btn for-btn-primary for-btn-lg">
            {state === "sending" ? <><span className="for-spinner" aria-hidden="true" />Sending…</> : "Start a Project"}
          </button>
          <button type="button" onClick={onEdit} className="for-btn for-btn-ghost"><Icon d={ICON.edit} />Edit brief</button>
        </div>
        {state === "failed" && (
          <div role="alert" className="for-fail mt-6">
            <p className="text-lg font-extrabold">Something went wrong. Please WhatsApp us{SETTINGS.whatsapp ? ` at ${SETTINGS.whatsapp}` : ""}.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="for-btn for-btn-primary">Send my brief on WhatsApp</a>}
              <button type="button" onClick={send} className="for-btn for-btn-ghost">Try again</button>
            </div>
          </div>
        )}
      </div>
      <BriefDocument values={values} dateLabel={dateLabel} stamp="Preview" />
    </div>
  );
}
