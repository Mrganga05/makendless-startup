"use client";
/* Shared UI primitives. Every section should use these instead of re-implementing tabs, reveals, buttons and labels. */
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

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
  const { once = false, margin = "0px", threshold = 0.15 } = opts;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); if (once) io.disconnect(); }
      else if (!once) setInView(false);
    }, { rootMargin: margin, threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [once, margin, threshold]);
  return [ref, inView] as const;
}

export function useIsMobile(query = "(max-width: 767px)") {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return m;
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
  const [ref, inView] = useInView<HTMLElement>({ once: true, margin: "0px 0px -8% 0px" });
  const T = Tag as "div";
  return (
    <T ref={ref as React.Ref<HTMLDivElement>} className={`rv rv-${kind} ${inView ? "rv-in" : ""} ${className}`} style={{ ["--rv-delay" as string]: `${delay}s` }}>
      {kind === "mask-up" ? <span className="rv-inner block">{children}</span> : children}
    </T>
  );
}

/** Headline that rises word by word out of a mask when scrolled into view. The full text stays readable to screen readers. */
export function KineticHeading({ text, accent, as: Tag = "h2", className = "", id, accentClass = "prism-text" }: { text: string; accent?: string; as?: "h1" | "h2" | "h3"; className?: string; id?: string; accentClass?: string }) {
  const [ref, inView] = useInView<HTMLHeadingElement>({ once: true, margin: "0px 0px -10% 0px" });
  const words = text.split(" ");
  const accentWords = accent ? accent.split(" ") : [];
  const all = [...words.map((w) => ({ w, a: false })), ...accentWords.map((w) => ({ w, a: true }))];
  return (
    <Tag ref={ref} id={id} aria-label={accent ? `${text} ${accent}` : text} className={`kh ${inView ? "kh-in" : ""} ${className}`}>
      {all.map((x, i) => (
        <span key={i} aria-hidden="true" className="kh-word">
          <span className={`kh-inner ${x.a ? accentClass : ""}`} style={{ transitionDelay: `${i * 0.07}s` }}>{x.w}</span>
          {i < all.length - 1 ? " " : ""}
        </span>
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
export function DemoCaption({ kind = "concept", tone = "dark", className = "" }: { kind?: "concept" | "illustrative"; tone?: "dark" | "light"; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone === "dark" ? "bg-white/10 text-light ring-1 ring-white/20" : "bg-ink/5 text-dark ring-1 ring-ink/15"} ${className}`}>
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
