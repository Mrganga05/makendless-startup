/*
 * Four small line drawings, one per step: brief note -> layout sketch -> edit timeline -> delivered file.
 * Every stroke has pathLength=1 and class "pro-d" so CSS can draw it in (stroke-dashoffset) when the step is reached;
 * "pro-f" marks filled shapes that fade / grow in. `--d` is the stagger index. Styles: app/styles/process.css.
 * Each drawing is rendered twice by <StepVignette>: a pale ghost underneath (so an unreached step is never an
 * empty box) and the live drawing on top.
 */
import type { CSSProperties, ReactNode } from "react";

const d = (i: number) => ({ ["--d" as string]: i }) as CSSProperties;
const S = { pathLength: 1, className: "pro-d" } as const;

function Brief() {
  return (
    <>
      {/* conversation bubble */}
      <path {...S} style={d(0)} d="M22 40h26a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H36l-8 7v-7h-6a6 6 0 0 1-6-6V46a6 6 0 0 1 6-6z" className="pro-d pro-aqua" />
      <path {...S} style={d(1)} d="M27 52h16" className="pro-d pro-aqua" />
      {/* the brief sheet */}
      <rect {...S} style={d(1)} x="70" y="12" width="88" height="96" rx="8" />
      <path {...S} style={d(2)} d="M84 30h38" className="pro-d pro-violet pro-thick" />
      <path {...S} style={d(3)} d="M84 46h60" className="pro-d pro-soft" />
      <path {...S} style={d(4)} d="M84 57h52" className="pro-d pro-soft" />
      <rect {...S} style={d(5)} x="84" y="70" width="11" height="11" rx="3" />
      <path {...S} style={d(6)} d="M86.5 75.5l2.5 2.5 4-5" className="pro-d pro-violet" />
      <path {...S} style={d(6)} d="M102 75.5h36" className="pro-d pro-soft" />
      <rect {...S} style={d(7)} x="84" y="87" width="11" height="11" rx="3" />
      <path {...S} style={d(8)} d="M86.5 92.5l2.5 2.5 4-5" className="pro-d pro-violet" />
      <path {...S} style={d(8)} d="M102 92.5h28" className="pro-d pro-soft" />
    </>
  );
}

function Layout() {
  return (
    <>
      <rect {...S} style={d(0)} x="22" y="14" width="156" height="92" rx="8" />
      <path {...S} style={d(1)} d="M22 31h156" />
      <circle className="pro-f pro-fill-dark" style={d(1)} cx="33" cy="22.5" r="2.2" />
      <circle className="pro-f pro-fill-dark" style={d(1)} cx="41" cy="22.5" r="2.2" />
      <circle className="pro-f pro-fill-dark" style={d(1)} cx="49" cy="22.5" r="2.2" />
      {/* hero block */}
      <rect className="pro-f pro-fill-violet-soft" style={d(2)} x="34" y="42" width="84" height="28" rx="4" />
      <rect {...S} style={d(2)} x="34" y="42" width="84" height="28" rx="4" className="pro-d pro-violet" />
      <path {...S} style={d(3)} d="M44 52h40" className="pro-d pro-violet pro-thick" />
      <path {...S} style={d(4)} d="M44 61h26" className="pro-d pro-violet" />
      {/* image placeholder */}
      <rect {...S} style={d(4)} x="126" y="42" width="40" height="52" rx="4" />
      <path {...S} style={d(5)} d="M126 42l40 52M166 42l-40 52" className="pro-d pro-soft" />
      {/* two cards */}
      <rect {...S} style={d(6)} x="34" y="78" width="38" height="16" rx="4" />
      <rect {...S} style={d(7)} x="80" y="78" width="38" height="16" rx="4" />
      {/* cursor */}
      <path className="pro-f pro-fill-dark pro-pop" style={d(9)} d="M104 84l14 6.2-6 1.9-2 6z" />
    </>
  );
}

function Timeline() {
  return (
    <>
      {/* ruler */}
      <path {...S} style={d(0)} d="M22 22h156" className="pro-d pro-soft" />
      <path {...S} style={d(0)} d="M22 18v8M48 20v4M74 18v8M100 20v4M126 18v8M152 20v4M178 18v8" className="pro-d pro-soft" />
      {/* video track */}
      <rect className="pro-f pro-grow pro-fill-aqua" style={d(1)} x="22" y="36" width="44" height="18" rx="4" />
      <rect className="pro-f pro-grow pro-fill-violet" style={d(2)} x="70" y="36" width="62" height="18" rx="4" />
      <rect className="pro-f pro-grow pro-fill-dark" style={d(3)} x="136" y="36" width="42" height="18" rx="4" />
      {/* caption track */}
      <rect {...S} style={d(3)} x="40" y="60" width="52" height="14" rx="4" />
      <rect {...S} style={d(4)} x="98" y="60" width="62" height="14" rx="4" />
      <path {...S} style={d(5)} d="M48 67h20M106 67h28" className="pro-d pro-soft" />
      {/* audio waveform */}
      <path {...S} style={d(5)} d="M22 90h8l3-7 4 14 4-11 3 7 4-10 4 13 4-9 3 5 4-11 4 14 4-8 3 4 4-9 4 12 4-7 3 5 4-11 4 13 4-8 3 4 4-7 4 9 4-5 3 3h9" className="pro-d pro-aqua" />
      {/* playhead */}
      <path {...S} style={d(7)} d="M114 12v94" className="pro-d pro-violet" />
      <path className="pro-f pro-fill-violet pro-pop" style={d(8)} d="M108 8h12v6l-6 6-6-6z" />
    </>
  );
}

function Delivered() {
  return (
    <>
      {/* arrow into a tray */}
      <path {...S} style={d(0)} d="M38 40v34" className="pro-d pro-aqua" />
      <path {...S} style={d(1)} d="M28 64l10 10 10-10" className="pro-d pro-aqua" />
      <path {...S} style={d(2)} d="M22 84v6a4 4 0 0 0 4 4h24a4 4 0 0 0 4-4v-6" className="pro-d pro-aqua" />
      {/* the file */}
      <path {...S} style={d(2)} d="M82 12h40l24 24v64a8 8 0 0 1-8 8H82a8 8 0 0 1-8-8V20a8 8 0 0 1 8-8z" />
      <path {...S} style={d(3)} d="M122 12v16a8 8 0 0 0 8 8h16" />
      <path {...S} style={d(4)} d="M88 52h30" className="pro-d pro-violet pro-thick" />
      <path {...S} style={d(5)} d="M88 66h40" className="pro-d pro-soft" />
      <path {...S} style={d(6)} d="M88 77h24" className="pro-d pro-soft" />
      {/* approved */}
      <circle className="pro-f pro-fill-violet pro-pop" style={d(7)} cx="150" cy="92" r="17" />
      <path {...S} style={d(9)} d="M141.5 92.5l6 6 11.5-13" className="pro-d pro-white pro-thick" />
    </>
  );
}

const DRAWINGS: (() => ReactNode)[] = [Brief, Layout, Timeline, Delivered];

/** Decorative only (the step title and text carry the meaning). */
export function StepVignette({ index }: { index: number }) {
  const Drawing = DRAWINGS[index % DRAWINGS.length];
  return (
    <svg viewBox="0 0 200 120" className="pro-svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <g className="pro-ghost"><Drawing /></g>
      <g className="pro-ink"><Drawing /></g>
    </svg>
  );
}
