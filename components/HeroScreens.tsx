"use client";
import { useState } from "react";

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const EASE = "cubic-bezier(.2,.8,.2,1)";
const CAPS = [["YOUR", "STORY", "CUT", "SHARP"], ["GRADED", "TO", "FEEL", "ALIVE"], ["CAPTIONS", "THAT", "KEEP", "PACE"]];

/* ---------- Original designed demo reel (three shots, hard cuts) ---------- */
function Shot({ i, paused }: { i: number; paused: boolean }) {
  const play = { animationPlayState: paused ? "paused" : "running" } as const;
  if (i === 0)
    return (
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#1b1464 0%,#6f45f6 42%,#ff9e7a 76%,#ffd9a0 100%)" }}>
        <div className="absolute left-1/2 top-[50%] h-24 w-24 rounded-full" style={{ background: "radial-gradient(circle,#fff6d8,#ffb36b 70%)", animation: "hero-drift 6s ease-in-out infinite alternate", ...play }} />
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-[#231a5c]" style={{ clipPath: "polygon(0 60%,18% 30%,34% 55%,52% 12%,70% 48%,86% 26%,100% 50%,100% 100%,0 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-[25%] bg-[#0c0a26]" style={{ clipPath: "polygon(0 40%,22% 62%,45% 30%,66% 66%,84% 38%,100% 60%,100% 100%,0 100%)" }} />
      </div>
    );
  if (i === 1)
    return (
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 38%,#22d3ee 0%,#0e7490 45%,#0b2540 100%)" }}>
        <div className="absolute left-1/2 top-[30%] h-[46%] w-[34%] -translate-x-1/2 overflow-hidden rounded-[18px_18px_26px_26px] bg-gradient-to-b from-[#fef3c7] to-[#f59e0b] shadow-[0_30px_40px_-10px_rgba(0,0,0,.5)]">
          <div className="absolute inset-y-0 w-1/3 bg-white/50 blur-sm" style={{ animation: "hero-shine 2.4s ease-in-out infinite", ...play }} />
          <div className="absolute inset-x-[18%] top-[34%] h-[30%] rounded-md bg-[#0c1024]/85" />
        </div>
        <div className="absolute left-1/2 top-[22%] h-[9%] w-[16%] -translate-x-1/2 rounded-t-md bg-[#13172b]" />
        <div className="absolute inset-x-0 bottom-0 h-[22%] bg-[#081a2e]" />
      </div>
    );
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#0c1024] via-[#2b1d6e] to-[#0c1024]">
      {[12, 30, 46, 64, 80].map((x, k) => (
        <div key={x} className="absolute bottom-0 bg-[#090b1c]" style={{ left: `${x - 8}%`, width: "17%", height: `${38 + ((k * 37) % 34)}%` }}>
          <div className="absolute inset-2 opacity-70" style={{ backgroundImage: "radial-gradient(#ffd98a 1.2px,transparent 1.4px)", backgroundSize: "9px 12px" }} />
        </div>
      ))}
      {[18, 42, 70, 86].map((x, k) => (
        <div key={x} className="absolute h-10 w-10 rounded-full blur-[3px]" style={{ left: `${x}%`, top: `${30 + k * 12}%`, background: k % 2 ? "#22d3ee99" : "#c7a6ff99", animation: `hero-bokeh ${3 + k}s ease-in-out infinite alternate`, ...play }} />
      ))}
    </div>
  );
}
function Reel({ shot, paused }: { shot: number; paused: boolean }) {
  return (
    <div key={shot} className="absolute inset-0" style={{ animation: "hero-kenburns 2.2s linear both", animationPlayState: paused ? "paused" : "running" }}>
      <Shot i={shot} paused={paused} />
    </div>
  );
}

function BetaLabel() {
  return <span className="rounded-full bg-[#13172b] px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#c7a6ff] ring-1 ring-[#c7a6ff]/50">Beta — illustrative demo</span>;
}

/* ---------- PHONE ---------- */
export function PhoneScreen({ p, t, paused, ad, back }: { p: number; t: number; paused: boolean; ad: boolean; back?: boolean }) {
  const cuts = p > 0.18;
  const reframe = seg(p, 0.22, 0.48);
  const grade = seg(p, 0.4, 0.78) * 100;
  const caps = p > 0.72;
  const shot = cuts ? Math.floor(t / 2) % 3 : 0;
  const words = CAPS[Math.floor(t / 2) % 3];
  const wi = Math.min(3, Math.floor((t % 2) / 0.45));
  return (
    <div className="relative h-full w-full select-none overflow-hidden rounded-[30px] bg-black text-white" style={{ filter: back ? "blur(1.6px) brightness(.72)" : "none", transition: "filter .6s" }}>
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden" style={{ height: `${31 + 69 * reframe}%` }}>
        <Reel shot={shot} paused={paused} />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${grade}%)`, filter: "grayscale(1) contrast(.62) brightness(.9)" }}>
          <Reel shot={shot} paused={paused} />
        </div>
        {grade > 0 && grade < 100 && <div className="absolute inset-y-0 w-[2px] bg-white shadow-[0_0_14px_3px_rgba(255,255,255,.7)]" style={{ left: `${grade}%` }} />}
      </div>
      <div className="absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
      <div className="absolute inset-x-3 top-10 flex items-center justify-between text-[9px] font-bold tracking-widest">
        <span className="flex items-center gap-1.5 rounded bg-black/55 px-1.5 py-1">
          <span className={`h-1.5 w-1.5 rounded-full ${p < 0.5 ? "bg-[#ff5c7a]" : "bg-[#22d3ee]"}`} />
          {p < 0.5 ? "RAW · 16:9" : "EDITED · 9:16"}
        </span>
        <span className="rounded bg-black/55 px-1.5 py-1 tabular-nums">0:0{Math.floor(t)}</span>
      </div>
      {caps && (
        <div className="absolute inset-x-3 bottom-[21%] flex flex-wrap justify-center gap-1.5">
          {words.slice(0, wi + 1).map((w, k) => (
            <span key={`${shot}-${w}`} className={`rounded-md px-2 py-0.5 text-[22px] font-extrabold leading-tight ${k === wi ? "bg-[#22d3ee] text-[#0c1024]" : "text-white [text-shadow:0_2px_10px_rgba(0,0,0,.8)]"}`} style={{ animation: "hero-pop .22s ease-out both" }}>{w}</span>
          ))}
        </div>
      )}
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/50 px-2 py-0.5 text-[9px] tracking-widest text-white/80">CONCEPT DEMO</span>
      {/* sample ad frame — wipes in for the marketing mode */}
      <div className="absolute inset-0 flex flex-col bg-[#f6f7fc] text-[#13172b]" style={{ clipPath: `inset(0 0 ${ad ? 0 : 100}% 0)`, transition: `clip-path .75s ${EASE}` }} aria-hidden={!ad}>
        <div className="flex items-center gap-2 px-4 pb-2 pt-11 text-[11px] font-bold"><span className="h-7 w-7 rounded-full" style={{ background: "var(--prism)" }} />yourbrand<span className="ml-auto font-normal text-[#5a6082]">Sponsored</span></div>
        <div className="relative mx-3 flex-1 overflow-hidden rounded-2xl" style={{ background: "linear-gradient(150deg,#6f45f6,#c7a6ff 55%,#22d3ee)" }}>
          <p className="absolute inset-x-4 top-7 text-[23px] font-extrabold leading-[1.05] text-white">Your offer, made impossible to ignore.</p>
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/25" />
        </div>
        <div className="flex flex-col items-center gap-2 px-4 py-4"><span className="w-full rounded-full bg-[#13172b] py-2.5 text-center text-xs font-bold text-white">Learn more</span><BetaLabel /></div>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-[30px]" style={{ background: "radial-gradient(circle at var(--gx,30%) var(--gy,10%), rgba(255,255,255,.22), transparent 42%)" }} />
    </div>
  );
}

/* ---------- BROWSER ---------- */
function Block({ on, className = "", children }: { on: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 rounded-lg border border-dashed border-[#8b91ad] bg-[repeating-linear-gradient(135deg,transparent_0_8px,#8b91ad22_8px_9px)]" style={{ opacity: on ? 0 : 1, transition: "opacity .35s" }} />
      <div className="h-full" style={{ clipPath: `inset(0 ${on ? 0 : 100}% 0 0)`, transition: `clip-path .55s ${EASE}` }}>{children}</div>
    </div>
  );
}
export function BrowserScreen({ p, resize, ad, back }: { p: number; resize: boolean; ad: boolean; back?: boolean }) {
  const [slot, setSlot] = useState(1);
  const slots = ["9:30", "11:00", "14:30"];
  return (
    <div className="relative flex h-full w-full select-none flex-col overflow-hidden rounded-[10px] bg-[#0f1226]" style={{ filter: back ? "blur(1.6px) brightness(.72)" : "none", transition: "filter .6s" }}>
      <div className="flex h-8 shrink-0 items-center gap-1.5 bg-[#1a1d36] px-3">
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (<span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />))}
        <span className="ml-3 flex-1 truncate rounded-md bg-[#0f1226] px-3 py-1 text-[10px] text-[#a4aac7]">northlight-studio.example · Concept demo</span>
        <span className="rounded bg-[#0f1226] px-2 py-1 text-[9px] font-bold tracking-widest text-[#a4aac7]">{p < 0.5 ? "WIREFRAME" : "LIVE"}</span>
      </div>
      <div className="relative flex min-h-0 flex-1 justify-center" style={{ background: p < 0.12 ? "#2a2d3a" : "#d9dceb", transition: "background .5s" }}>
        <div className="hero-scroll @container h-full overflow-y-auto overscroll-contain" style={{ width: "100%", background: p < 0.12 ? "#2a2d3a" : "#f6f7fc", transition: "background .5s", animation: resize ? "hero-resize 7s ease-in-out infinite" : undefined }}>
          <div className="space-y-2.5 p-3 text-[#13172b]">
            <Block on={p > 0.14} className="h-8">
              <div className="flex h-full items-center justify-between rounded-lg bg-white px-3 text-[11px] font-extrabold tracking-wider shadow-sm">NORTHLIGHT<span className="hidden gap-3 font-semibold text-[#5a6082] @[380px]:flex"><span className="cursor-pointer hover:text-[#6f45f6]">Menu</span><span className="cursor-pointer hover:text-[#6f45f6]">Visit</span><span className="cursor-pointer hover:text-[#6f45f6]">Book</span></span></div>
            </Block>
            <Block on={p > 0.34} className="h-[128px]">
              <div className="flex h-full flex-col justify-center rounded-lg p-4 text-white" style={{ background: "linear-gradient(120deg,#13172b,#6f45f6 70%,#08bbd4)" }}>
                <p className="text-[19px] font-extrabold leading-tight @[380px]:text-[26px]">Slow mornings,<br />served daily.</p>
                <button className="mt-3 w-fit rounded-full bg-white px-4 py-1.5 text-[11px] font-bold text-[#13172b] transition hover:scale-105 hover:bg-[#22d3ee] active:scale-95">Book a table</button>
              </div>
            </Block>
            <div className="grid grid-cols-1 gap-2.5 @[380px]:grid-cols-3">
              {[["Espresso bar", "#6f45f6", 0.54], ["Bakery", "#08bbd4", 0.64], ["Workshops", "#c7a6ff", 0.74]].map(([t, c, th]) => (
                <Block key={t as string} on={p > (th as number)} className="h-[84px]">
                  <div className="h-full cursor-pointer rounded-lg bg-white p-2.5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="h-9 rounded-md" style={{ background: `linear-gradient(135deg,${c},${c}88)` }} />
                    <p className="mt-2 text-[11px] font-bold">{t as string}</p>
                  </div>
                </Block>
              ))}
            </div>
            <Block on={p > 0.84} className="h-[72px]">
              <div className="flex h-full flex-wrap items-center gap-2 rounded-lg bg-[#13172b] px-3 text-white">
                <span className="text-[11px] font-bold">Pick a time</span>
                {slots.map((s, k) => (<button key={s} onClick={() => setSlot(k)} aria-pressed={slot === k} className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${slot === k ? "bg-[#22d3ee] text-[#0c1024]" : "ring-1 ring-white/30 hover:bg-white/15"}`}>{s}</button>))}
                <span className="text-[10px] text-white/60">Selected {slots[slot]}</span>
              </div>
            </Block>
            <Block on={p > 0.9} className="h-[90px]"><div className="grid h-full place-items-center rounded-lg bg-white text-[10px] text-[#5a6082]">Footer · sample layout for demonstration</div></Block>
          </div>
        </div>
        {/* sample feed ad — wipes in for the marketing mode */}
        <div className="absolute inset-0 flex gap-3 bg-[#eceef7] p-3" style={{ clipPath: `inset(0 ${ad ? 0 : 100}% 0 0)`, transition: `clip-path .75s ${EASE}` }} aria-hidden={!ad}>
          <div className="w-20 shrink-0 space-y-2">{[0, 1, 2, 3].map((k) => (<div key={k} className="h-5 rounded bg-[#d5d9ea]" />))}</div>
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow">
            <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-[#13172b]"><span className="h-6 w-6 rounded-full" style={{ background: "var(--prism)" }} />yourbrand <span className="font-normal text-[#5a6082]">· Sponsored</span><span className="ml-auto"><BetaLabel /></span></div>
            <div className="relative flex-1" style={{ background: "linear-gradient(120deg,#6f45f6,#c7a6ff 55%,#22d3ee)" }}><p className="absolute left-4 top-1/2 max-w-[70%] -translate-y-1/2 text-[24px] font-extrabold leading-[1.05] text-white">Your offer, made impossible to ignore.</p></div>
            <div className="flex items-center justify-between px-3 py-2 text-[11px] text-[#13172b]"><span>Sample ad creative</span><span className="rounded-full bg-[#13172b] px-3 py-1 font-bold text-white">Learn more</span></div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at var(--gx,70%) var(--gy,0%), rgba(255,255,255,.14), transparent 45%)" }} />
    </div>
  );
}
