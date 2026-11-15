"use client";
/* The closing call to action: a large pill that leans towards a mouse pointer (never on touch, never under reduced motion),
   presses in on tap/click and keeps the global focus ring. Styles: app/styles/cta.css (.cta-btn). */
import Link from "next/link";
import { useRef } from "react";

export default function MagneticLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2), y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    el.style.setProperty("--mx", `${(x * 10).toFixed(1)}px`);
    el.style.setProperty("--my", `${(y * 7).toFixed(1)}px`);
  };
  const leave = () => { ref.current?.style.setProperty("--mx", "0px"); ref.current?.style.setProperty("--my", "0px"); };
  return (
    <Link ref={ref} href={href} onPointerMove={move} onPointerLeave={leave} className={`cta-btn ${className}`}>
      <span className="cta-btn-glow" aria-hidden="true" />
      <span className="cta-btn-face">
        <span className="cta-btn-label">{children}</span>
        <span className="cta-btn-arrow" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12M11 5l5 5-5 5" /></svg>
        </span>
      </span>
    </Link>
  );
}
