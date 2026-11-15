"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Scroll progress for the four-step journey.
 * - Reads the real positions of the step nodes on every scroll / resize frame, so it cannot get stuck at 0:
 *   it is recomputed on mount, on load, on scroll, on resize and whenever the block enters or leaves the viewport.
 * - Works for both layouts: when the nodes are stacked (phones / tablets) the fill tip follows a line at 62% of
 *   the viewport height; when they sit in a row (desktop) progress runs while the row travels from 82% to 38%.
 * - Writes `--p` (0..1) straight to the element (no re-render per frame) and returns how many steps are reached.
 * With `enabled = false` (reduced motion) nothing runs and the caller shows every step complete.
 */
export function useJourneyProgress(enabled: boolean, steps: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [reached, setReached] = useState(steps);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) { setLive(false); setReached(steps); el?.style.removeProperty("--p"); return; }
    let raf = 0;
    let listening = false;
    let last = -1;

    const measure = () => {
      raf = 0;
      const nodes = el.querySelectorAll<HTMLElement>("[data-node]");
      if (nodes.length < 2) return;
      const vh = window.innerHeight;
      const rects = Array.from(nodes, (n) => n.getBoundingClientRect());
      const first = rects[0];
      const lastR = rects[rects.length - 1];
      const vertical = lastR.top - first.top > 40;
      let p = 0;
      let count = 0;
      if (vertical) {
        const tip = vh * 0.62;
        const c = rects.map((r) => r.top + r.height / 2);
        if (tip >= c[c.length - 1]) { p = 1; count = c.length; }
        else if (tip >= c[0]) {
          let i = 0;
          while (i < c.length - 2 && tip >= c[i + 1]) i++;
          p = (i + (tip - c[i]) / Math.max(1, c[i + 1] - c[i])) / (c.length - 1);
          count = i + 1;
        }
      } else {
        const y = first.top + first.height / 2;
        const raw = (vh * 0.82 - y) / (vh * 0.44);
        p = Math.min(1, Math.max(0, raw));
        count = raw <= 0 ? 0 : Math.min(rects.length, Math.floor(p * (rects.length - 1) + 1e-6) + 1);
      }
      if (Math.abs(p - last) > 0.0005) { el.style.setProperty("--p", p.toFixed(4)); last = p; }
      setReached(count);
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(measure); };
    const listen = (on: boolean) => {
      if (on === listening) return;
      listening = on;
      if (on) { window.addEventListener("scroll", queue, { passive: true }); }
      else { window.removeEventListener("scroll", queue); }
    };

    setLive(true);
    measure();
    // Only listen to scroll while the block is near the viewport; always re-measure when that changes.
    const io = new IntersectionObserver(([e]) => { listen(e.isIntersecting); measure(); }, { rootMargin: "60% 0px 60% 0px" });
    io.observe(el);
    window.addEventListener("resize", queue);
    window.addEventListener("load", queue);
    window.addEventListener("pageshow", queue);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(queue) : null;
    ro?.observe(el);
    return () => {
      io.disconnect(); ro?.disconnect(); listen(false);
      window.removeEventListener("resize", queue);
      window.removeEventListener("load", queue);
      window.removeEventListener("pageshow", queue);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled, steps]);

  return { ref, reached, live };
}
