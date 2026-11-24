"use client";
/* Shared UI primitives. Every section should use these instead of re-implementing tabs, reveals, buttons and labels. */
import Link from "next/link";
import { Fragment, useCallback, useEffect, useId, useRef, useState } from "react";
import { servicesOf } from "../data/pricing";
import { SAMPLES } from "../data/samples";
import { WORK } from "../data/work";

export const EASE = "cubic-bezier(.2,.8,.2,1)";

/* ---------- hooks ---------- */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** True while the element is on screen (or once it has been, with `once`). Use it to pause timers / 3D off-screen. */
export function useInView<T extends Element>(opts: { once?: boolean; margin?: string; threshold?: number } = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const { once = false, margin = "0px", threshold = 0.1 } = opts;
  const watched = useRef<{ el: Element | null; io: IntersectionObserver | null; done: boolean }>({ el: null, io: null, done: false });
  /* Runs after every render: (re)attaches when the element first appears or is swapped, so conditionally
     rendered targets are observed too (a one-shot effect missed them and they stayed "off-screen" forever). */
  useEffect(() => {
    const w = watched.current, el = ref.current;
    if (w.done || el === w.el) return;
    w.io?.disconnect();
    w.el = el;
    if (!el) return;
    w.io = new IntersectionObserver(([e]) => {
      /* Already scrolled past (fast scroll / anchor jump) also counts, so a reveal never stays blank. */
      if (e.isIntersecting || (once && e.boundingClientRect.bottom < 0)) { setInView(true); if (once) { w.done = true; w.io?.disconnect(); } }
      else if (!once) setInView(false);
    }, { rootMargin: margin, threshold });
    w.io.observe(el);
  });
  useEffect(() => () => watched.current.io?.disconnect(), []);
  return [ref, inView] as const;
}

export function hasWebGL() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}

/**
 * Accessible tabs (WAI-ARIA): roving tabindex, Arrow keys, Home/End, tab <-> panel wiring.
 *   const tabs = useTabs(items.length, index, setIndex);
 *   <div {...tabs.list("Customer type")}>{items.map((it, i) => <button key={i} {...tabs.tab(i)}>…</button>)}</div>
 *   <div {...tabs.panel(index)}>…</div>
 */
export function useTabs(count: number, index: number, setIndex: (i: number) => void, orientation: "horizontal" | "vertical" | "both" = "both") {
  const id = useId();
  const refs = useRef<(HTMLElement | null)[]>([]);
  const go = useCallback((i: number) => {
    const n = ((i % count) + count) % count;
    setIndex(n);
    refs.current[n]?.focus();
  }, [count, setIndex]);
  return {
    list: (label: string) => ({ role: "tablist" as const, "aria-label": label, "aria-orientation": orientation === "vertical" ? ("vertical" as const) : ("horizontal" as const) }),
    tab: (i: number) => ({
      role: "tab" as const,
      id: `${id}-tab-${i}`,
      "aria-selected": index === i,
      "aria-controls": `${id}-panel`,
      tabIndex: index === i ? 0 : -1,
      ref: (el: HTMLElement | null) => { refs.current[i] = el; },
      onClick: () => setIndex(i),
      onKeyDown: (e: React.KeyboardEvent) => {
        const next = (orientation !== "vertical" && e.key === "ArrowRight") || (orientation !== "horizontal" && e.key === "ArrowDown");
        const prev = (orientation !== "vertical" && e.key === "ArrowLeft") || (orientation !== "horizontal" && e.key === "ArrowUp");
        if (next) { e.preventDefault(); go(i + 1); }
        else if (prev) { e.preventDefault(); go(i - 1); }
        else if (e.key === "Home") { e.preventDefault(); go(0); }
        else if (e.key === "End") { e.preventDefault(); go(count - 1); }
      },
    }),
    panel: (i: number) => ({ role: "tabpanel" as const, id: `${id}-panel`, "aria-labelledby": `${id}-tab-${i}`, tabIndex: 0 }),
  };
}

/* ---------- motion ---------- */
type RevealKind = "mask-up" | "wipe-right" | "clip-down" | "scale-in" | "fade";
/** Scroll-triggered reveal. Vary `kind` between elements; do not use the same one everywhere. CSS lives in globals.css (.rv-*). */
export function Reveal({ children, kind = "mask-up", delay = 0, className = "", as: Tag = "div" }: { children: React.ReactNode; kind?: RevealKind; delay?: number; className?: string; as?: "div" | "span" | "li" | "p" }) {
  const [ref, inView] = useInView<HTMLElement>({ once: true });
  const T = Tag as "div";
  return (
    /* The observed host is never clipped; the clip/mask lives on the inner span (an element clipped to nothing
       never reports as intersecting, so it could never reveal itself). */
    <T ref={ref as React.Ref<HTMLDivElement>} className={className}>
      <span className={`block rv rv-${kind} ${inView ? "rv-in" : ""}`} style={{ ["--rv-delay" as string]: `${delay}s` }}>
        {kind === "mask-up" ? <span className="rv-inner block">{children}</span> : children}
      </span>
    </T>
  );
}

/** Shrinks an element's font just enough that its longest word fits its column (long words like
    "Development" cannot wrap). Re-measures on resize; never grows above the CSS size. */
export function useFitText<T extends HTMLElement>(ref: React.RefObject<T | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const fit = () => {
      raf = 0;
      el.style.fontSize = "";
      const avail = el.clientWidth;
      let need = 0;
      el.querySelectorAll<HTMLElement>(".kh-word").forEach((w) => { need = Math.max(need, w.scrollWidth); });
      if (!need) need = el.scrollWidth;
      if (need > avail + 1) {
        const base = parseFloat(getComputedStyle(el).fontSize);
        el.style.fontSize = `${Math.floor(base * (avail / need) * 0.98 * 10) / 10}px`;
      }
    };
    const ro = new ResizeObserver(() => { if (!raf) raf = requestAnimationFrame(fit); });
    ro.observe(el);
    document.fonts?.ready.then(fit);
    fit();
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, [ref]);
}

/** Headline that rises word by word out of a mask when scrolled into view. The full text stays readable to screen readers. */
export function KineticHeading({ text, accent, as: Tag = "h2", className = "", id, accentClass = "prism-text" }: { text: string; accent?: string; as?: "h1" | "h2" | "h3"; className?: string; id?: string; accentClass?: string }) {
  const [ref, inView] = useInView<HTMLHeadingElement>({ once: true });
  useFitText(ref);
  const words = text.split(" ");
  const accentWords = accent ? accent.split(" ") : [];
  const all = [...words.map((w) => ({ w, a: false })), ...accentWords.map((w) => ({ w, a: true }))];
  return (
    <Tag ref={ref} id={id} aria-label={accent ? `${text} ${accent}` : text} className={`kh ${inView ? "kh-in" : ""} ${className}`}>
      {all.map((x, i) => (
        <Fragment key={i}>
          <span aria-hidden="true" className="kh-word">
            <span className={`kh-inner ${x.a ? accentClass : ""}`} style={{ transitionDelay: `${Math.min(i * 0.015, 0.06)}s` }}>{x.w}</span>
          </span>
          {i < all.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </Tag>
  );
}

/* ---------- small parts ---------- */
export function Eyebrow({ children, tone = "dark", className = "" }: { children: React.ReactNode; tone?: "dark" | "light"; className?: string }) {
  return <p className={`text-xs font-bold uppercase tracking-[0.3em] ${tone === "dark" ? "text-aqua-bright" : "text-violet"} ${className}`}>{children}</p>;
}

export function BetaBadge({ tone = "dark", label = "Beta", className = "" }: { tone?: "dark" | "light"; label?: string; className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${tone === "dark" ? "bg-grow/20 text-grow ring-1 ring-grow/50" : "bg-violet text-white"} ${className}`}>{label}</span>;
}

/** Required caption on every original demo. `kind="illustrative"` for all marketing (GROW) demos. */
/** Where the real work for a studio lives: /work filtered to that studio (data/work.ts), else the first sample link (data/samples.ts). */
export function realWorkHref(studio?: string): string | null {
  if (studio === "create" && WORK.reels.length) return "/work?type=create";
  if (studio === "build" && WORK.sites.length) return "/work?type=build";
  if (studio !== "create" && studio !== "build") return null;
  for (const s of servicesOf(studio)) { const url = SAMPLES[s.id]?.find(Boolean); if (url) return url; }
  return null;
}

/** Label on the animated scenes. Shows "Concept demo" until the studio has real work; then it becomes a link to that work.
 *  `inLink`: the caption sits inside another link (studio cards), so it can't be a link itself. */
export function DemoCaption({ kind = "concept", tone = "dark", className = "", studio, inLink = false }: { kind?: "concept" | "illustrative"; tone?: "dark" | "light"; className?: string; studio?: string; inLink?: boolean }) {
  const pill = `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone === "dark" ? "bg-white/10 text-light ring-1 ring-white/20" : "bg-ink/5 text-dark ring-1 ring-ink/15"} ${className}`;
  const real = kind === "concept" ? realWorkHref(studio) : null;
  if (real) {
    const body = <><span className="h-1.5 w-1.5 rounded-full bg-[#25d366]" aria-hidden="true" />{inLink ? "Real work inside" : "See our real work"}{!inLink && <span aria-hidden="true">{real.startsWith("/") ? " →" : " ↗"}</span>}</>;
    if (inLink) return <span className={pill}>{body}</span>;
    const cls = `${pill} min-h-8 underline-offset-2 hover:underline`;
    return real.startsWith("/")
      ? <Link href={real} className={cls}>{body}</Link>
      : <a href={real} target="_blank" rel="noopener noreferrer" className={cls}>{body}<span className="sr-only"> (opens in a new tab)</span></a>;
  }
  return (
    <span className={pill}>
      <span className={`h-1.5 w-1.5 rounded-full ${kind === "concept" ? "bg-aqua-bright" : "bg-grow"}`} aria-hidden="true" />
      {kind === "concept" ? "Concept demo" : "Illustrative demo"}
    </span>
  );
}

type BtnProps = { href: string; children: React.ReactNode; variant?: "primary" | "secondary"; tone?: "dark" | "light"; className?: string; size?: "md" | "lg" };
/** The site's call-to-action link. `tone` is the background it sits on. Always >= 48px tall, visible focus, clear press state. */
export function ButtonLink({ href, children, variant = "primary", tone = "dark", className = "", size = "md" }: BtnProps) {
  const base = `inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold transition duration-200 active:scale-[.96] ${size === "lg" ? "px-9 py-4 text-lg" : "px-6 py-3 text-[15px]"}`;
  const look =
    variant === "primary"
      ? tone === "dark" ? "bg-white text-dark hover:bg-violet-soft" : "bg-ink text-white hover:bg-violet"
      : tone === "dark" ? "border border-white/30 text-light hover:border-white hover:bg-white/10" : "border border-ink/25 text-dark hover:border-ink hover:bg-ink/5";
  return <Link href={href} className={`${base} ${look} ${className}`}>{children}</Link>;
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}
