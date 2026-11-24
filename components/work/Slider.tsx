"use client";
/* One horizontal swipe slider for reels AND websites, so both always look and behave the same:
   snap scrolling, swipe on touch, ← → arrow buttons on larger screens (disabled at either end).
   kind "reel" = narrow 9:16 cards; kind "site" = website cards (about 2.5 visible on desktop, 1.1 on phones). */
import { Children, useCallback, useEffect, useRef, useState } from "react";

export default function Slider({ kind, label, children }: { kind: "reel" | "site"; label: string; children: React.ReactNode }) {
  const list = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const read = useCallback(() => {
    const el = list.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  }, []);
  useEffect(() => {
    read();
    const el = list.current;
    el?.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => { el?.removeEventListener("scroll", read); window.removeEventListener("resize", read); };
  }, [read]);

  const go = (dir: 1 | -1) => {
    const el = list.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };
  const noun = kind === "reel" ? "reels" : "websites";

  return (
    <div className={`slider slider--${kind}`}>
      <ul ref={list} className="slider-list" aria-label={label}>
        {Children.map(children, (c) => <li className="slider-item">{c}</li>)}
      </ul>
      <div className="slider-nav">
        <button type="button" onClick={() => go(-1)} disabled={edge.start} aria-label={`Previous ${noun}`}><span aria-hidden="true">←</span></button>
        <button type="button" onClick={() => go(1)} disabled={edge.end} aria-label={`More ${noun}`}><span aria-hidden="true">→</span></button>
      </div>
    </div>
  );
}

