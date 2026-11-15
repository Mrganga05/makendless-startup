"use client";
/* Small client helpers for the internal pages: pause CSS loops off-screen, and expose scroll progress as a CSS variable. */
import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "../ui";

/** Wraps a looping CSS/SVG visual. Its animations only run while it is on screen (`.is-on`). */
export function Live({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.05 });
  return <div ref={ref} className={`pag-live ${inView ? "is-on" : ""} ${className}`}>{children}</div>;
}

/**
 * Sets `--p` (0 → 1) on its element as it travels through the viewport, so CSS can draw scroll-driven details
 * (a playhead, a breakpoint bracket, a progress line). Only listens while on screen; reduced motion gets the end state.
 */
export function ScrollVar({ children, className = "", start = 0.9, end = 0.35 }: { children: React.ReactNode; className?: string; start?: number; end?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) { el.style.setProperty("--p", "1"); return; }
    let raf = 0;
    let active = false;
    const read = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const from = vh * start;
      const to = vh * end - r.height;
      const p = Math.min(1, Math.max(0, (from - r.top) / Math.max(1, from - to)));
      el.style.setProperty("--p", p.toFixed(4));
    };
    const on = () => { if (active && !raf) raf = requestAnimationFrame(read); };
    const io = new IntersectionObserver(([e]) => { active = e.isIntersecting; if (active) read(); }, { rootMargin: "10% 0px" });
    io.observe(el);
    read();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { io.disconnect(); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, [reduced, start, end]);
  return <div ref={ref} className={className}>{children}</div>;
}
