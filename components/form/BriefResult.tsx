"use client";
/* Result states of the Start a Project form: "ready, not sent" (today), "delivered" (only when a real service confirms) . */
import { useEffect, useRef, useState } from "react";
import { CONTACT_EMAIL } from "../../lib/site";
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

export default function BriefResult({ kind, values, text, dateLabel, onEdit }: { kind: "ready" | "delivered"; values: BriefValues; text: string; dateLabel: string; onEdit: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [copyState, copy] = useCopy();
  const [addrState, copyAddr] = useCopy();
  const [downloaded, setDownloaded] = useState(false);
  useEffect(() => { heading.current?.focus(); }, []);

  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = "makendless-project-brief.txt";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
  };
  const mailto = CONTACT_EMAIL ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Project brief" + (values.name.trim() ? ` — ${values.name.trim()}` : ""))}&body=${encodeURIComponent(text)}` : "";
  const delivered = kind === "delivered";
  const status = copyState === "copied" ? "Brief copied to your clipboard." : copyState === "failed" ? "Copying was blocked by your browser. Select the brief text and copy it, or download it instead." : addrState === "copied" ? "Email address copied." : downloaded ? "Download started: makendless-project-brief.txt" : "";

  return (
    <div className="for-result grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14" data-kind={kind}>
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className={`for-state-tag ${delivered ? "for-state-ok" : "for-state-hold"}`}>
          <span className="for-state-dot" aria-hidden="true" />
          {delivered ? "Delivered" : "Not sent"}
        </p>
        <h2 ref={heading} tabIndex={-1} className="for-anchor mt-5 text-[clamp(1.7rem,6vw,2.75rem)] font-extrabold leading-[1.08] text-dark outline-none">
          {delivered ? "Your brief is with us." : <>Your brief is ready — <span className="for-underline">it has not been sent yet.</span></>}
        </h2>
        {delivered ? (
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-dark">Our delivery service confirmed it accepted your brief. Keep a copy for yourself below.</p>
        ) : CONTACT_EMAIL ? (
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-dark">Nothing has left this page. To send it, open a draft in your email app and press send there, or copy the brief and email it yourself.</p>
        ) : (
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-dark">Online sending is still being set up, so nothing has left this page. Copy or download your brief so it is ready to go when sending opens.</p>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button type="button" onClick={() => copy(text)} className="for-btn for-btn-primary" data-done={copyState === "copied"}>
            <Icon d={copyState === "copied" ? ICON.check : ICON.copy} />{copyState === "copied" ? "Copied" : "Copy brief"}
          </button>
          <button type="button" onClick={download} className="for-btn for-btn-secondary"><Icon d={ICON.download} />Download as a text file</button>
          {!delivered && mailto && <a href={mailto} className="for-btn for-btn-secondary"><Icon d={ICON.mail} />Open a draft in your email app</a>}
        </div>
        <p role="status" aria-live="polite" className="for-status mt-3 min-h-6 text-sm font-semibold text-dark">{status}</p>

        {!delivered && CONTACT_EMAIL && (
          <div className="mt-4 rounded-2xl border border-line bg-white p-4 text-sm leading-relaxed text-muted-dark">
            <p>The button only opens a draft. If no email app opens, copy the brief and email it to:</p>
            <p className="mt-2 flex flex-wrap items-center gap-3">
              <span className="for-wrap select-all text-base font-bold text-dark">{CONTACT_EMAIL}</span>
              <button type="button" onClick={() => copyAddr(CONTACT_EMAIL)} className="for-btn for-btn-ghost">{addrState === "copied" ? "Address copied" : "Copy address"}</button>
            </p>
          </div>
        )}

        <div className="mt-6 border-t border-line pt-6">
          <button type="button" onClick={onEdit} className="for-btn for-btn-ghost"><Icon d={ICON.edit} />Edit brief</button>
          <p className="mt-2 text-sm text-muted-dark">Everything you typed is kept while this page stays open.</p>
        </div>
      </div>
      <BriefDocument values={values} dateLabel={dateLabel} stamp={delivered ? "Delivered" : "Not sent"} />
    </div>
  );
}
