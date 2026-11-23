"use client";
/* Horizontal, swipeable strip of reels (snap scrolling). Arrow buttons on larger screens. */
import { useCallback, useEffect, useRef, useState } from "react";
import type { Reel } from "../../data/work";
import ReelCard from "./ReelCard";

export default function ReelStrip({ reels, label = "Reels", tone = "dark" }: { reels: Reel[]; label?: string; tone?: "dark" | "light" }) {
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

  return (
    <div className={`reel-strip reel-strip--${tone}`}>
      <ul ref={list} className="reel-strip-list" aria-label={label}>
        {reels.map((r) => (
          <li key={r.id} className="reel-strip-item"><ReelCard reel={r} /></li>
        ))}
      </ul>
      <div className="reel-strip-nav">
        <button type="button" onClick={() => go(-1)} disabled={edge.start} aria-label="Previous reels"><span aria-hidden="true">←</span></button>
        <button type="button" onClick={() => go(1)} disabled={edge.end} aria-label="More reels"><span aria-hidden="true">→</span></button>
      </div>
    </div>
  );
}
