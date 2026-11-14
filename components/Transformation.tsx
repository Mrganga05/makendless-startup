"use client";
import { useEffect, useState } from "react";

type Tab = "video" | "web" | "marketing";
const tabs: { id: Tab; label: string; color: string; beta?: boolean }[] = [
  { id: "video", label: "Video Editing", color: "#22d3ee" },
  { id: "web", label: "Website Development", color: "#8b5cf6" },
  { id: "marketing", label: "Digital Marketing", color: "#c7a6ff", beta: true },
];

function Slider({ value, onChange, left, right }: { value: number; onChange: (n: number) => void; left: string; right: string }) {
  return (
    <div className="mt-4 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#a4aac7]">
      <span>{left}</span>
      <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(+e.target.value)} aria-label={`${left} to ${right}`} className="h-11 flex-1 accent-[#8b5cf6]" />
      <span>{right}</span>
    </div>
  );
}

/* ---------- VIDEO ---------- */
const captionStyles = ["Pop", "Karaoke", "Minimal"] as const;
const lines = ["IDEAS", "THAT", "STOP", "THE", "SCROLL"];
function VideoDemo() {
  const [v, setV] = useState(55);
  const [style, setStyle] = useState<(typeof captionStyles)[number]>("Pop");
  const [vertical, setVertical] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setI((x) => (x + 1) % lines.length), 700);
    return () => clearInterval(t);
  }, [playing]);
  return (
    <div>
      <div className="relative mx-auto grid h-[340px] place-items-center overflow-hidden rounded-3xl bg-black md:h-[420px]">
        {/* RAW */}
        <div className="absolute inset-0 grid place-items-center" style={{ background: "linear-gradient(135deg,#3b3f4d,#272a33)", filter: "grayscale(1) contrast(.8)" }}>
          <div className="aspect-video w-[86%] rounded-lg bg-[#555a68]/60 ring-1 ring-white/10" />
          <span className="absolute left-4 top-4 rounded bg-black/60 px-2 py-1 text-[11px] font-bold tracking-widest">RAW · 16:9 · NO CAPTIONS</span>
        </div>
        {/* EDITED (revealed from right edge by slider) */}
        <div className="absolute inset-0 grid place-items-center" style={{ clipPath: `inset(0 0 0 ${v}%)`, background: "linear-gradient(135deg,#1d1b3a,#6f45f6 55%,#08bbd4)" }}>
          <div className={`relative grid place-items-center overflow-hidden rounded-2xl bg-[#13172b]/60 ring-1 ring-white/30 transition-all duration-500 ${vertical ? "h-[88%] aspect-[9/16]" : "aspect-video w-[86%]"}`}>
            <div className="absolute inset-0 opacity-70" style={{ background: "radial-gradient(circle at 30% 30%,#c7a6ff,transparent 55%),radial-gradient(circle at 70% 75%,#22d3ee,transparent 55%)" }} />
            <span key={`${i}-${style}`} className={`relative z-10 px-3 text-center text-3xl font-extrabold md:text-4xl ${style === "Minimal" ? "text-white/90 text-xl md:text-2xl font-semibold" : ""} ${style === "Karaoke" ? "rounded bg-[#08bbd4] px-3 py-1 text-[#0c1024]" : ""}`} style={{ animation: style === "Pop" ? "pop .35s ease-out" : undefined }}>{lines[i]}</span>
            {style === "Karaoke" && <span className="absolute bottom-6 text-[11px] tracking-widest text-white/70">{lines.join(" ")}</span>}
          </div>
          <span className="absolute right-4 top-4 rounded bg-[#08bbd4] px-2 py-1 text-[11px] font-bold tracking-widest text-[#0c1024]">EDITED · {vertical ? "9:16" : "16:9"} · {style.toUpperCase()}</span>
        </div>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white" style={{ left: `${v}%` }} />
      </div>
      <Slider value={v} onChange={setV} left="Edited" right="Raw" />
      {/* timeline */}
      <div className="mt-2 h-10 overflow-hidden rounded-lg bg-white/5 p-1" aria-hidden="true">
        <div className="relative flex h-full gap-1">
          {lines.map((l, k) => (<div key={l} className="grid flex-1 place-items-center rounded text-[10px] font-bold" style={{ background: k === i ? "#8b5cf6" : "#202342" }}>{l}</div>))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setPlaying((p) => !p)} className="min-h-11 rounded-full bg-white px-5 text-sm font-bold text-[#13172b]">{playing ? "Pause" : "Play"} preview</button>
        <button onClick={() => setVertical((x) => !x)} className="min-h-11 rounded-full border border-white/25 px-5 text-sm font-bold" aria-pressed={vertical}>Reframe: {vertical ? "9:16 vertical" : "16:9 wide"}</button>
        {captionStyles.map((c) => (<button key={c} onClick={() => setStyle(c)} aria-pressed={style === c} className={`min-h-11 rounded-full border px-4 text-sm font-bold ${style === c ? "border-[#22d3ee] bg-[#22d3ee]/20" : "border-white/15 text-[#a4aac7]"}`}>{c}</button>))}
      </div>
    </div>
  );
}

/* ---------- WEB ---------- */
const themes = { Midnight: ["#0c1024", "#6f45f6", "#f6f8ff"], Porcelain: ["#f6f7fc", "#08bbd4", "#13172b"], Signal: ["#13172b", "#22d3ee", "#ffffff"] } as const;
function SiteMock({ finished, theme, slot, setSlot }: { finished: boolean; theme: keyof typeof themes; slot: number; setSlot: (n: number) => void }) {
  const [bg, ac, fg] = themes[theme];
  if (!finished)
    return (
      <div className="h-full w-full bg-[#2a2d3a] p-4 text-[#7a8099]">
        <div className="h-5 w-24 rounded border border-dashed border-[#7a8099]" />
        <div className="mt-6 h-24 rounded border border-dashed border-[#7a8099]" />
        <div className="mt-4 grid grid-cols-3 gap-3">{[0, 1, 2].map((k) => (<div key={k} className="h-16 rounded border border-dashed border-[#7a8099]" />))}</div>
        <div className="mt-4 h-8 w-28 rounded border border-dashed border-[#7a8099]" />
      </div>
    );
  return (
    <div className="h-full w-full p-4 transition-colors duration-500" style={{ background: bg, color: fg }}>
      <div className="flex items-center justify-between text-xs font-extrabold tracking-widest"><span>BREW &amp; CO.</span><span className="opacity-60">Menu · Book</span></div>
      <div className="mt-5 rounded-xl p-5" style={{ background: `${ac}33` }}>
        <p className="text-xl font-extrabold leading-tight">Coffee worth<br />the detour.</p>
        <div className="mt-3 flex flex-wrap gap-1.5">{["10:00", "12:30", "16:00"].map((t, k) => (
          <button key={t} onClick={() => setSlot(k)} aria-pressed={slot === k} className="rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: slot === k ? ac : "transparent", border: `1px solid ${ac}`, color: slot === k ? bg : fg }}>{t}</button>))}</div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">{[0, 1, 2].map((k) => (<div key={k} className="h-14 rounded-lg" style={{ background: `${ac}${["55", "33", "77"][k]}` }} />))}</div>
      <p className="mt-3 text-xs opacity-70">Table reserved: {["10:00", "12:30", "16:00"][slot]} (sample UI)</p>
    </div>
  );
}
function WebDemo() {
  const [v, setV] = useState(50);
  const [mobile, setMobile] = useState(false);
  const [theme, setTheme] = useState<keyof typeof themes>("Midnight");
  const [slot, setSlot] = useState(0);
  return (
    <div>
      <div className="grid h-[340px] place-items-center overflow-hidden rounded-3xl bg-[#13172b] md:h-[420px]" style={{ backgroundImage: "radial-gradient(#ffffff14 1px,transparent 1px)", backgroundSize: "18px 18px" }}>
        <div className={`relative h-[86%] overflow-hidden rounded-xl ring-1 ring-white/20 transition-all duration-500 ${mobile ? "w-[190px]" : "w-[88%]"}`}>
          <div className="absolute inset-0"><SiteMock finished={false} theme={theme} slot={slot} setSlot={setSlot} /></div>
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - v}% 0 0)` }}><SiteMock finished theme={theme} slot={slot} setSlot={setSlot} /></div>
          <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-[#22d3ee]" style={{ left: `${v}%` }} />
        </div>
      </div>
      <Slider value={v} onChange={setV} left="Wireframe" right="Finished" />
      <div className="mt-2 flex flex-wrap gap-2">
        <button onClick={() => setMobile(false)} aria-pressed={!mobile} className={`min-h-11 rounded-full border px-5 text-sm font-bold ${!mobile ? "border-[#8b5cf6] bg-[#8b5cf6]/25" : "border-white/15 text-[#a4aac7]"}`}>Desktop</button>
        <button onClick={() => setMobile(true)} aria-pressed={mobile} className={`min-h-11 rounded-full border px-5 text-sm font-bold ${mobile ? "border-[#8b5cf6] bg-[#8b5cf6]/25" : "border-white/15 text-[#a4aac7]"}`}>Mobile</button>
        {(Object.keys(themes) as (keyof typeof themes)[]).map((t) => (<button key={t} onClick={() => setTheme(t)} aria-pressed={theme === t} className={`min-h-11 rounded-full border px-4 text-sm font-bold ${theme === t ? "border-[#22d3ee] bg-[#22d3ee]/20" : "border-white/15 text-[#a4aac7]"}`}>{t}</button>))}
      </div>
    </div>
  );
}

/* ---------- MARKETING (simulated) ---------- */
const objectives = {
  Awareness: { copy: "Meet the studio behind the scroll-stoppers.", cta: "Learn more" },
  Traffic: { copy: "See how a better website changes first impressions.", cta: "Visit site" },
  Leads: { copy: "Tell us what you're building. We'll reply with next steps.", cta: "Get in touch" },
} as const;
function MarketingDemo() {
  const [obj, setObj] = useState<keyof typeof objectives>("Awareness");
  const [story, setStory] = useState(false);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const kinds = ["Reel", "Post", "—", "Story", "Reel", "Post", "—"];
  return (
    <div>
      <div className="relative grid h-[340px] place-items-center overflow-hidden rounded-3xl bg-[#13172b] md:h-[420px]">
        <span className="absolute left-4 top-4 rounded bg-[#c7a6ff] px-2 py-1 text-[11px] font-bold tracking-widest text-[#0c1024]">SIMULATED · ILLUSTRATIVE ONLY</span>
        <div className={`overflow-hidden rounded-2xl bg-white text-[#13172b] shadow-2xl transition-all duration-500 ${story ? "h-[82%] aspect-[9/16]" : "w-[250px] md:w-[290px]"}`}>
          <div className="flex items-center gap-2 p-3 text-xs font-bold"><span className="h-7 w-7 rounded-full" style={{ background: "var(--prism)" }} />makendless <span className="ml-auto font-normal text-[#5a6082]">Sponsored</span></div>
          <div className={`grid place-items-center ${story ? "h-[55%]" : "aspect-square"}`} style={{ background: "linear-gradient(135deg,#6f45f6,#08bbd4)" }}><span className="px-4 text-center text-2xl font-extrabold text-white">Ideas impossible to ignore</span></div>
          <div className="p-3"><p className="text-xs">{objectives[obj].copy}</p><span className="mt-2 inline-block rounded bg-[#13172b] px-3 py-1.5 text-xs font-bold text-white">{objectives[obj].cta}</span></div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1.5" aria-label="Sample weekly content calendar">
        {days.map((d, k) => (<div key={d} className="rounded-lg bg-white/5 p-2 text-center text-[11px]"><div className="text-[#a4aac7]">{d}</div><div className="mt-1 font-bold">{kinds[k]}</div></div>))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(objectives) as (keyof typeof objectives)[]).map((o) => (<button key={o} onClick={() => setObj(o)} aria-pressed={obj === o} className={`min-h-11 rounded-full border px-4 text-sm font-bold ${obj === o ? "border-[#c7a6ff] bg-[#c7a6ff]/20" : "border-white/15 text-[#a4aac7]"}`}>{o}</button>))}
        <button onClick={() => setStory((s) => !s)} aria-pressed={story} className="min-h-11 rounded-full border border-white/25 px-5 text-sm font-bold">Placement: {story ? "Story" : "Feed"}</button>
      </div>
      <p className="mt-3 text-xs text-[#a4aac7]">A demonstration of the format only. These are not live campaigns and show no performance results.</p>
    </div>
  );
}

export default function Transformation() {
  const [tab, setTab] = useState<Tab>("video");
  return (
    <section className="bg-gradient-to-b from-[#0c1024] to-[#202342] px-5 py-24 md:px-8 md:py-32" aria-labelledby="live-title">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#08bbd4]">Live transformation</p>
        <h2 id="live-title" className="mt-4 text-4xl font-extrabold md:text-6xl">See the <span className="prism-text">difference.</span></h2>
        <div role="tablist" aria-label="Demonstration mode" className="mt-10 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className="min-h-11 rounded-full border px-5 text-sm font-bold transition"
              style={{ borderColor: tab === t.id ? t.color : "rgba(255,255,255,.15)", background: tab === t.id ? `${t.color}26` : "transparent" }}>
              {t.label}{t.beta && <span className="ml-2 rounded bg-white/15 px-1.5 py-0.5 text-[10px] tracking-widest">BETA</span>}
            </button>
          ))}
        </div>
        <div className="mt-6" role="tabpanel">
          {tab === "video" && <VideoDemo />}
          {tab === "web" && <WebDemo />}
          {tab === "marketing" && <MarketingDemo />}
        </div>
        <p className="mt-6 text-xs text-[#a4aac7]">Original concept demonstrations built for this site. Not client work.</p>
      </div>
    </section>
  );
}
