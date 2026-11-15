"use client";
/* Homepage section 7 - the final frame of the film.
   Text and the call to action render first; the 3D closing shot (components/cta/CtaScene.tsx) is mounted only when the
   section is near the viewport, runs only while it is on screen, and is replaced by a still (CtaStill) when WebGL is
   missing or the visitor prefers reduced motion. */
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { hasWebGL, useInView } from "./ui";
import MagneticLink from "./cta/MagneticLink";
import CtaStill from "./cta/CtaStill";

const CtaScene = dynamic(() => import("./cta/CtaScene"), { ssr: false, loading: () => null });

/* Headline words. `m` = line break after the word on phones, `d` = line break after the word from 640px up. */
const WORDS: { w: string; accent?: boolean; m?: boolean; d?: boolean }[] = [
  { w: "Let’s" }, { w: "make", m: true }, { w: "something", m: true, d: true },
  { w: "worth", accent: true, m: true }, { w: "remembering.", accent: true },
];

const ENABLE_CTA_3D = true;

export default function FinalCta() {
  const [nearRef, near] = useInView<HTMLElement>({ once: true, margin: "700px 0px", threshold: 0 });
  const [stageRef, onScreen] = useInView<HTMLDivElement>({ threshold: 0.02 });
  const [headRef, shown] = useInView<HTMLHeadingElement>({ once: true, margin: "0px 0px -12% 0px", threshold: 0.2 });
  const [mode, setMode] = useState<"pending" | "3d" | "still">("pending");
  const [compact, setCompact] = useState(false);
  const [ready, setReady] = useState(false);
  /* Build the 3D scene only when the browser is idle, so creating it never stalls an active scroll. */
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if (!near || idle) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) { const id = w.requestIdleCallback(() => setIdle(true), { timeout: 2500 }); return () => w.cancelIdleCallback?.(id); }
    const t = setTimeout(() => setIdle(true), 600); return () => clearTimeout(t);
  }, [near, idle]);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mq = window.matchMedia("(max-width: 767px)");
    /* Performance decision: the hero already runs the page's 3D scene. A second live WebGL scene here cost
       ~1.3s of main-thread work and dropped to ~27fps on slower machines, so the closing shot uses its
       designed still. Set ENABLE_CTA_3D to true to bring the live scene back. */
    const decide = () => { setMode(ENABLE_CTA_3D && !rm.matches && hasWebGL() ? "3d" : "still"); setCompact(mq.matches); };
    decide();
    rm.addEventListener("change", decide); mq.addEventListener("change", decide);
    return () => { rm.removeEventListener("change", decide); mq.removeEventListener("change", decide); };
  }, []);

  return (
    <section ref={nearRef} id="start" data-tone="dark" aria-labelledby="cta-title" className={`cta relative isolate overflow-hidden bg-ink text-center text-light ${shown ? "cta-in" : ""} ${onScreen ? "cta-live" : ""}`}>
      <noscript><style>{`.cta-word-in,.cta-line,.cta-action{transform:none!important;opacity:1!important;clip-path:none!important}.cta-eyebrow{opacity:1!important}`}</style></noscript>
      {/* the closing shot */}
      <div ref={stageRef} className="cta-stage absolute inset-0 -z-10" aria-hidden="true">
        <div className="cta-backdrop absolute inset-0" />
        {mode === "3d" && near && idle && (
          <div className="absolute inset-0 transition-opacity duration-[1400ms]" style={{ opacity: ready ? 1 : 0 }}>
            <CtaScene compact={compact} active={onScreen} onReady={() => setReady(true)} />
          </div>
        )}
        {mode === "still" && <CtaStill />}
        <div className="cta-scrim absolute inset-0" />
      </div>

      <div className="cta-copy relative mx-auto flex max-w-7xl flex-col items-center px-5 md:px-8">
        <p className="cta-eyebrow">
          <span className="cta-eyebrow-mark" aria-hidden="true" />
          Final frame
        </p>
        <h2 ref={headRef} id="cta-title" aria-label="Let&rsquo;s make something worth remembering." className="cta-title mt-5 font-extrabold">
          {WORDS.map((x, i) => (
            <span key={x.w} aria-hidden="true" className="contents">
              <span className="cta-word">
                <span className={`cta-word-in ${x.accent ? "cta-accent" : ""}`} style={{ transitionDelay: `${0.08 + i * 0.09}s` }}>{x.w}</span>
              </span>
              {i < WORDS.length - 1 && " "}
              {x.m && <br className="sm:hidden" />}
              {x.d && <br className="hidden sm:block" />}
            </span>
          ))}
        </h2>
        <p className="cta-line mx-auto mt-5 max-w-[34rem] text-pretty text-[17px] leading-relaxed text-light/85 sm:mt-6 sm:text-xl">
          Tell us what you&rsquo;re building. We&rsquo;ll help you take the next step.
        </p>
        <div className="cta-action mt-8 sm:mt-10">
          <MagneticLink href="/contact">Start a Project</MagneticLink>
        </div>
      </div>
    </section>
  );
}
