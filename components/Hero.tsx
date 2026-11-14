"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import PrismFallback from "./PrismFallback";

const PrismScene = dynamic(() => import("./PrismScene"), { ssr: false, loading: () => null });

const modes = [
  { label: "Video Editing", color: "#22d3ee", text: "Reels, long-form, ads and motion graphics." },
  { label: "Website Development", color: "#8b5cf6", text: "Responsive, accessible sites that do a job." },
  { label: "Digital Marketing", color: "#c7a6ff", text: "Learning in public. Join the beta list.", beta: true },
];

function hasWebGL() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}

export default function Hero() {
  const [mode, setMode] = useState(0);
  const [gl, setGl] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => { setGl(hasWebGL() && !window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setMode((m) => (m + 1) % 3), 5200);
    return () => clearInterval(t);
  }, [reduce]);

  const words = ["We make", "ideas", "impossible", "to ignore."];
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#0c1024] pt-24 pb-16" aria-labelledby="hero-title">
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(60% 50% at 78% 45%, rgba(111,69,246,.35), transparent 70%), radial-gradient(40% 40% at 15% 90%, rgba(8,187,212,.18), transparent 70%)" }} />
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-6 px-5 md:px-8 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] sm:tracking-[0.35em] text-[#08bbd4]">Creative &amp; Technology Studio</p>
          <h1 id="hero-title" className="text-[2.7rem] font-extrabold leading-[0.98] tracking-tight sm:text-6xl lg:text-[5.4rem]">
            {words.map((w, i) => (
              <span key={w} className="block overflow-hidden pb-1">
                <motion.span className={`block ${i === 3 ? "prism-text" : ""}`} initial={reduce ? false : { y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.15 + i * 0.11, ease: [0.2, 0.8, 0.2, 1] }}>{w}</motion.span>
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#a4aac7]">
            Premium video editing, website development and digital marketing solutions for creators and businesses.
          </p>
          <div className="mt-7 flex flex-wrap gap-3" role="tablist" aria-label="What we offer">
            {modes.map((m, i) => (
              <button key={m.label} role="tab" aria-selected={mode === i} onClick={() => setMode(i)}
                className="group flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition"
                style={{ borderColor: mode === i ? m.color : "rgba(255,255,255,.15)", background: mode === i ? `${m.color}22` : "transparent", color: mode === i ? "#fff" : "#a4aac7" }}>
                <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
                {m.label}{m.beta && <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] tracking-widest">BETA</span>}
              </button>
            ))}
          </div>
          <p className="mt-3 min-h-6 text-sm text-[#a4aac7]" aria-live="polite">{modes[mode].text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#studios" className="rounded-full bg-white px-7 py-3.5 font-bold text-[#13172b] transition hover:bg-[#c7a6ff]">Explore Studios</Link>
            <Link href="/contact" className="rounded-full border border-white/25 px-7 py-3.5 font-bold transition hover:border-white hover:bg-white/10">Start a Project</Link>
          </div>
        </div>
        <div className="relative h-[300px] sm:h-[420px] lg:h-[560px]">
          {gl ? <PrismScene mode={mode} /> : <PrismFallback mode={mode} />}
        </div>
      </div>
    </section>
  );
}
