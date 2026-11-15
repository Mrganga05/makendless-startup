"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { BrowserScreen, PhoneScreen, seg } from "./HeroScreens";
import { Wordmark } from "./brand";

const Hero3D = dynamic(() => import("./Hero3D"), { ssr: false, loading: () => null });
const useIsoLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

const MODES = [
  { label: "Video Editing", short: "Video", word: "EDIT", color: "#22d3ee", stages: ["Raw", "Cut", "Grade", "Captions", "Export"] },
  { label: "Website Development", short: "Websites", word: "BUILD", color: "#8b5cf6", stages: ["Wireframe", "Layout", "Style", "Responsive", "Launch"] },
  { label: "Digital Marketing — Beta", short: "Marketing", word: "GROW", color: "#c7a6ff", beta: true, stages: ["Brief", "Creative", "Format", "Preview", "Review"] },
];
const LINES = ["We make", "ideas", "impossible", "to ignore."];
const EASE = "cubic-bezier(.2,.8,.2,1)";

function hasWebGL() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}

/* Magnetic hover on desktop, clear press state on touch */
function Magnetic({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <span ref={ref} className={`inline-block ${className} transition-transform duration-300 ease-out will-change-transform active:scale-[.94] active:duration-75`}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        ref.current.style.transform = `translate(${((e.clientX - r.left) / r.width - 0.5) * 14}px, ${((e.clientY - r.top) / r.height - 0.5) * 10}px)`;
      }}
      onPointerLeave={() => { if (ref.current) ref.current.style.transform = ""; }}>
      {children}
    </span>
  );
}

/* One headline line: raw grey text with a "graded" copy wiped in over it by the playhead */
const Line = memo(function Line({ text, i, g, accent, intro }: { text: string; i: number; g: number; accent?: boolean; intro: boolean }) {
  const chars = (cls: string) => (
    <span className={`block whitespace-nowrap ${cls}`}>
      {accent ? text : text.split("").map((ch, k) => (
        <span key={k} className="inline-block whitespace-pre" style={intro ? { animation: `hero-rise .8s ${EASE} ${0.1 * i + k * 0.028}s both` } : undefined}>{ch}</span>
      ))}
    </span>
  );
  return (
    <span className="relative block w-fit overflow-hidden pb-[0.08em] pr-[0.06em]">
      <span className="relative block" style={intro && accent ? { animation: `hero-rise .9s ${EASE} ${0.1 * i}s both` } : undefined}>
        {chars("text-[#59607f]")}
        <span className="absolute inset-0 block" style={{ clipPath: `inset(0 ${100 - g * 100}% 0 0)` }}>{chars(accent ? "prism-text" : "text-[#f6f8ff]")}</span>
      </span>
      <span className="absolute inset-x-0 bottom-0 border-b border-dashed border-[#59607f]" style={{ opacity: 1 - g }} />
    </span>
  );
});

export default function Hero() {
  const [p, setP] = useState(0);
  const [mode, setMode] = useState(0);
  const [paused, setPaused] = useState(false);
  const [gl, setGl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [compact, setCompact] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(true);
  const [hint, setHint] = useState(true);
  const [intro, setIntro] = useState(true);
  const [cycling, setCycling] = useState(true);
  const section = useRef<HTMLElement>(null), scene = useRef<HTMLDivElement>(null), raf = useRef(0);

  useIsoLayout(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mq = window.matchMedia("(max-width: 767px)");
    setReduced(rm); setCompact(mq.matches); setGl(hasWebGL() && !rm);
    if (rm) { setP(1); setIntro(false); setPaused(true); setCycling(false); }
    const on = () => setCompact(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  /* The intro waits until the 3D scene has been built and the browser is idle (or there is no 3D),
     so the 2.5s "edit" never competes with loading / shader compilation and plays smoothly. */
  const [go, setGo] = useState(false);
  useEffect(() => {
    if (go || gl === null) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const fire = () => setGo(true);
    const fallback = setTimeout(fire, 4000);
    let id: number | undefined;
    if (!gl || ready) id = w.requestIdleCallback ? w.requestIdleCallback(fire, { timeout: 700 }) : window.setTimeout(fire, 200);
    return () => { clearTimeout(fallback); if (id !== undefined) (w.cancelIdleCallback ?? clearTimeout)(id); };
  }, [gl, ready, go]);

  /* Intro: the hero edits itself once, raw -> finished in 2.5s */
  useEffect(() => {
    if (!go || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now + 250;
      const x = Math.min(1, Math.max(0, (now - start) / 2500));
      setP(x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
      if (x < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [go]);

  useEffect(() => {
    if (!section.current) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.02 });
    io.observe(section.current);
    return () => io.disconnect();
  }, []);

  /* auto-cycle modes every 6s until the visitor interacts */
  useEffect(() => {
    if (!cycling || !inView) return;
    const id = setInterval(() => setMode((m) => (m + 1) % 3), 6000);
    return () => clearInterval(id);
  }, [cycling, inView]);

  const pick = useCallback((m: number) => { setCycling(false); setMode(((m % 3) + 3) % 3); }, []);
  const onSceneReady = useCallback(() => setReady(true), []);
  const scrub = (v: number) => { cancelAnimationFrame(raf.current); setCycling(false); setHint(false); setP(v); };

  /* swipe the scene (touch) to change mode */
  useEffect(() => {
    const el = scene.current; if (!el) return;
    let x0 = 0, y0 = 0;
    const down = (e: TouchEvent) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; };
    const up = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.5) { setCycling(false); setMode((m) => (m + (dx < 0 ? 1 : 2)) % 3); }
    };
    el.addEventListener("touchstart", down, { passive: true }); el.addEventListener("touchend", up, { passive: true });
    return () => { el.removeEventListener("touchstart", down); el.removeEventListener("touchend", up); };
  }, []);

  const M = MODES[mode];
  const frames = Math.round(p * 144);
  const timecode = `00:00:0${Math.floor(frames / 24)}:${String(frames % 24).padStart(2, "0")}`;
  const edited = p >= 0.995;
  const ad = mode === 2;
  const swipe = useRef(0);

  return (
    <section ref={section} className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#0c1024] pt-16" aria-labelledby="hero-title" style={{ ["--accent" as string]: M.color }}>
      {/* background: mode-tinted glow + slow prismatic sweep */}
      <div className="pointer-events-none absolute inset-0 -z-10 transition-[background] duration-1000" style={{ background: `radial-gradient(55% 55% at 74% 42%, ${M.color}${edited ? "3d" : "1f"}, transparent 70%), radial-gradient(40% 40% at 10% 95%, rgba(8,187,212,.14), transparent 70%)` }} />
      <div className="pointer-events-none absolute inset-y-[-20%] left-0 -z-10 w-[38%]" style={{ background: "linear-gradient(90deg, transparent, rgba(34,211,238,.55) 35%, rgba(139,92,246,.55) 65%, transparent)", willChange: "transform", animation: "hero-sweep 22s linear infinite", opacity: 0.05 + p * 0.1 }} />

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 md:px-8 lg:flex-row lg:items-center">
        {/* TEXT */}
        <div className="pointer-events-none relative z-20 pt-4 sm:pt-8 lg:w-[52%] lg:py-10 [&_a]:pointer-events-auto">
          <p className="mb-5 hidden text-xs font-bold uppercase tracking-[0.35em] text-[#08bbd4] sm:block">Creative &amp; Technology Studio</p>
          <h1 id="hero-title" aria-label="We make ideas impossible to ignore." className="text-[2.25rem] font-extrabold leading-[0.98] tracking-tight min-[390px]:text-[2.45rem] sm:text-[3.4rem] lg:text-[3.6rem] xl:text-[4.7rem]">
            <span aria-hidden="true">
              <Line text={LINES[0]} i={0} g={seg(p, 0.24, 0.46)} intro={intro} />
              <Line text={LINES[1]} i={1} g={seg(p, 0.36, 0.6)} intro={intro} />
              <Line text={LINES[2]} i={2} g={seg(p, 0.5, 0.82)} accent intro={intro} />
              <Line text={LINES[3]} i={3} g={seg(p, 0.7, 0.96)} intro={intro} />
            </span>
          </h1>
          {/* kinetic mode word */}
          <div className="mt-2.5 flex items-center gap-3 sm:mt-5" aria-hidden="true">
            <span className="h-px w-10 transition-colors duration-700" style={{ background: M.color }} />
            <span key={mode} className="flex overflow-hidden text-sm font-extrabold tracking-[0.5em] sm:text-base" style={{ color: M.color }}>
              {M.word.split("").map((ch, k) => (<span key={k} className="inline-block" style={{ animation: `hero-rise .6s ${EASE} ${k * 0.06}s both` }}>{ch}</span>))}
            </span>
          </div>
          <p className="mt-2.5 max-w-md text-[14.5px] leading-snug text-[#b9bed6] sm:mt-5 sm:text-lg sm:leading-relaxed">
            Premium video editing and website development for creators and businesses. Digital marketing in beta.
          </p>
          <div className="mt-4 flex gap-2.5 sm:mt-8 sm:gap-3">
            <Magnetic className="flex-1 sm:flex-none"><Link href="/contact" className="block rounded-full bg-white whitespace-nowrap px-2 py-3.5 text-center text-[13px] min-[390px]:text-sm font-extrabold text-[#13172b] transition-colors hover:bg-[#c7a6ff] sm:px-8 sm:text-base">Start a Project</Link></Magnetic>
            <Magnetic className="flex-1 sm:flex-none"><Link href="#studios" className="block rounded-full border border-white/30 bg-[#0c1024]/40 whitespace-nowrap px-2 py-3.5 text-center text-[13px] min-[390px]:text-sm font-bold transition-colors hover:border-white hover:bg-white/10 sm:px-8 sm:text-base">Explore Studios</Link></Magnetic>
          </div>
        </div>

        {/* SCENE */}
        <div ref={scene} className="relative z-10 mt-2 h-[200px] min-h-0 flex-1 sm:h-[330px] sm:flex-none lg:absolute lg:inset-y-0 lg:right-[-3%] lg:mt-0 lg:h-auto lg:w-[60%]">
          {gl && <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: ready ? 1 : 0 }}><Hero3D p={p} mode={mode} paused={paused} compact={compact} active={inView} onReady={onSceneReady} /></div>}
          <button onClick={() => setPaused((x) => !x)} aria-pressed={paused} className="absolute bottom-1 right-0 z-50 flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-[#0c1024]/85 px-3.5 text-xs font-bold text-[#d5d9ea] hover:bg-white/10 lg:bottom-4 lg:right-[6%]">
                <span aria-hidden="true" className="text-[10px]">{paused ? "▶" : "❚❚"}</span>{paused ? "Play video" : "Pause video"}
              </button>
          {gl === false && (
            /* No-3D / reduced-motion fallback: the same live screens in a still composition; the slider still drives raw -> finished */
            <div className="absolute inset-0 flex items-center justify-center gap-[4%] lg:justify-end lg:pr-[5%]" style={{ perspective: 1400 }}>
              {(!compact || mode !== 1) && (
                <div className="shrink-0 rounded-[38px] bg-gradient-to-br from-[#c9cde0] via-[#6d7290] to-[#2a2d44] p-[6px] shadow-[0_40px_80px_-20px_rgba(0,0,0,.8),0_0_60px_-10px_var(--accent)]" style={{ transform: compact ? "none" : "rotateY(16deg) rotateX(3deg)", zoom: compact ? 0.34 : 0.72, opacity: !compact && mode === 1 ? 0.75 : 1, transition: "opacity .6s" }}>
                  <div style={{ width: 260, height: 540 }}><PhoneScreen p={p} paused={paused} ad={ad} /></div>
                </div>
              )}
              {(!compact || mode === 1) && (
                <div className="shrink-0 rounded-[16px] bg-gradient-to-br from-[#c9cde0] via-[#8a8fa8] to-[#3a3d55] p-[7px] shadow-[0_40px_80px_-20px_rgba(0,0,0,.8),0_0_60px_-10px_var(--accent)]" style={{ transform: compact ? "none" : "rotateY(-14deg) rotateX(3deg)", zoom: compact ? 0.46 : 0.62, opacity: !compact && mode === 0 ? 0.75 : 1, transition: "opacity .6s" }}>
                  <div style={{ width: 612, height: 392 }}><BrowserScreen p={p} resize={false} ad={ad} /></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* EDIT DOCK: mode switch + real timeline */}
      <div className="relative z-30 border-t border-white/10 bg-[#0c1024]/95 px-5 pb-3 pt-2.5 md:px-8 md:pb-4 md:pt-3">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div role="tablist" aria-label="Service mode" className="relative grid w-full grid-cols-3 rounded-full border border-white/12 bg-white/5 p-1 sm:w-auto" style={{ touchAction: "pan-y" }}
              onPointerDown={(e) => { swipe.current = e.clientX; }}
              onPointerUp={(e) => { const dx = e.clientX - swipe.current; if (e.pointerType === "touch" && Math.abs(dx) > 44) pick(mode + (dx < 0 ? 1 : 2)); }}
              onKeyDown={(e) => {
                const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? 2 : 0;
                if (!d) return;
                e.preventDefault(); const n = (mode + d) % 3; pick(n);
                (e.currentTarget.children[n + 1] as HTMLElement)?.focus();
              }}>
              <span className="absolute bottom-1 top-1 rounded-full transition-all duration-500" style={{ left: `calc(${mode} * (100% - 8px) / 3 + 4px)`, width: "calc((100% - 8px) / 3)", background: `${M.color}33`, boxShadow: `inset 0 0 0 1px ${M.color}`, transitionTimingFunction: EASE }} aria-hidden="true" />
              {MODES.map((m, i) => (
                <button key={m.label} role="tab" aria-selected={mode === i} aria-label={m.label} tabIndex={mode === i ? 0 : -1} onClick={() => pick(i)}
                  className={`relative flex min-h-11 items-center justify-center gap-1 whitespace-nowrap rounded-full px-1 text-[11px] font-bold min-[390px]:text-[12px] transition-colors sm:px-4 sm:text-[13px] ${mode === i ? "text-white" : "text-[#a4aac7] hover:text-white"}`}>
                  <span className="sm:hidden">{m.short}</span><span className="hidden sm:inline">{m.label.replace(" — Beta", "")}</span>
                  {m.beta && <span className="rounded bg-white/15 px-1 py-0.5 text-[9px] tracking-widest">BETA</span>}
                </button>
              ))}
            </div>
            <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
              <span className="flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] sm:text-[11px] sm:tracking-[0.2em]" role="status">
                <span className={`h-2 w-2 rounded-full ${edited ? "bg-[#22d3ee]" : "bg-[#ff5c7a]"}`} style={{ animation: edited ? undefined : "beam 1.2s infinite" }} />
                {edited ? "EDITED" : p < 0.02 ? "RAW" : "EDITING"}
              </span>
              {hint && <span className="whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#13172b] sm:px-2.5 sm:text-[11px] transition-opacity duration-500" style={{ opacity: p > 0.9 ? 1 : 0 }}>Drag to see the edit ↓</span>}
              <span className="font-mono text-xs tabular-nums text-[#a4aac7]" aria-hidden="true">{timecode}</span>
              <span className="hidden text-sm font-extrabold tracking-[0.18em] transition-all duration-700 xl:block" style={{ opacity: seg(p, 0.9, 1), letterSpacing: `${0.6 - seg(p, 0.9, 1) * 0.42}em` }} aria-hidden="true"><Wordmark /></span>
            </div>
          </div>

          {/* timeline */}
          <div className="relative mt-2.5 h-12">
            <input type="range" min={0} max={1000} value={Math.round(p * 1000)} onChange={(e) => scrub(+e.target.value / 1000)} aria-label="Edit timeline: drag from raw to finished" aria-valuetext={`${Math.round(p * 100)}% edited`} className="hero-range absolute inset-0 z-20 h-12 w-full" />
            <div className="hero-track-ring pointer-events-none absolute inset-0 overflow-hidden rounded-xl border border-white/12 bg-[#151936]">
              <div className="absolute inset-0 grid grid-cols-5 gap-[3px] p-1">
                {M.stages.map((s, i) => {
                  const done = p >= (i + 0.5) / 5 - 0.1;
                  return (
                    <div key={`${mode}-${s}`} className="flex items-center overflow-hidden rounded-md px-1.5 text-[9px] font-bold uppercase transition-colors duration-300 sm:px-2.5 sm:text-[11px] sm:tracking-wider" style={{ background: done ? `${M.color}${i % 2 ? "55" : "3d"}` : "#262a4a", color: done ? "#fff" : "#7d84a6", animation: `hero-rise .5s ${EASE} ${i * 0.05}s both` }}>
                      <span className="truncate">{s}</span>
                    </div>
                  );
                })}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 opacity-40" style={{ backgroundImage: "repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 12px)" }} />
            </div>
            <div className="pointer-events-none absolute inset-y-[-5px] z-10 w-0.5 rounded bg-white shadow-[0_0_12px_2px_rgba(255,255,255,.6)]" style={{ left: `calc(22px + (100% - 44px) * ${p})` }}>
              <span className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] bg-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
