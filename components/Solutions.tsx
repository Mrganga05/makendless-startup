"use client";
/* Homepage section 4 — "Solutions For You". A light, editorial service-discovery section:
   pick a customer type, the stage wipes to that customer's scene and the recommended services change. */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { solutions, type SolutionService } from "../data/solutions";
import { studios } from "../data/studios";
import { Arrow, BetaBadge, ButtonLink, DemoCaption, Eyebrow, Reveal, useInView, useReducedMotion, useTabs } from "./ui";
import { combos, COMBOS_ENABLED, serviceTitle } from "../data/pricing";
import { inr } from "../lib/pricing";
/* Audience -> combo pack line (Part 5): shown only while combo packs are switched on. */
const PACK: Record<string, (typeof combos)[number] | undefined> = { creator: combos.find((c) => c.id === "creator"), local: combos.find((c) => c.id === "local-business"), startup: combos.find((c) => c.id === "launch"), store: combos.find((c) => c.id === "growth") };
import Scene from "./solutions/Scenes";

const studioOf = (id: string) => studios.find((s) => s.id === id)!;
const DOT: Record<string, string> = { create: "bg-create", build: "bg-build", grow: "bg-grow" };
const SCENE_ALT: Record<string, string> = {
  creator: "Illustration: a long recording on a timeline being cut into three captioned vertical shorts.",
  local: "Illustration: a café website with a table booking widget and a promo video tile.",
  startup: "Illustration: a product launch landing page with a waitlist form and a pitch-style promo video.",
  store: "Illustration: an online shop product grid with a cart and a product video tile.",
};
const WIPE_MS = 820;

function ServiceLink({ sv, later, i }: { sv: SolutionService; later?: boolean; i: number }) {
  const st = studioOf(sv.studio);
  return (
    <li style={{ ["--i" as string]: i }} className="flex">
      <Link
        href={sv.studio === "grow" ? st.href : `${st.href}#${sv.id}`}
        className={`sol-svc group flex min-h-[7.25rem] w-full flex-col rounded-2xl p-4 xl:min-h-[11.5rem] ${later ? "border border-dashed border-violet/45 bg-white hover:border-violet" : "border border-line bg-paper hover:border-ink/40 hover:bg-white"}`}
      >
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-dark">
          <span className={`h-2 w-2 rounded-full ${DOT[sv.studio]}`} aria-hidden="true" />
          {st.verb}
          <span className="sr-only">: {st.name}.</span>
          {later ? <BetaBadge tone="light" className="ml-auto" /> : <Arrow className="sol-svc-arrow ml-auto text-dark" />}
        </span>
        <span className="mt-3 block text-[17px] font-extrabold leading-tight text-dark">{serviceTitle(sv.id)}</span>
        <span className="mt-1.5 block text-sm leading-snug text-muted-dark">{sv.note}</span>
      </Link>
    </li>
  );
}

export default function Solutions() {
  const [idx, setIdx] = useState(0);
  const [out, setOut] = useState<{ i: number; dir: 1 | -1; key: number } | null>(null);
  const reduced = useReducedMotion();
  const idxRef = useRef(0);
  const [headRef, headIn] = useInView<HTMLHeadingElement>({ once: true, margin: "0px 0px -10% 0px" });
  const [stageRef, stageIn] = useInView<HTMLDivElement>({ threshold: 0.05 });

  const select = useCallback((i: number) => {
    const from = idxRef.current;
    if (i === from) return;
    idxRef.current = i;
    setOut(reduced ? null : { i: from, dir: i > from ? 1 : -1, key: Date.now() });
    setIdx(i);
  }, [reduced]);

  useEffect(() => {
    if (!out) return;
    const t = setTimeout(() => setOut(null), WIPE_MS);
    return () => clearTimeout(t);
  }, [out]);

  const tabs = useTabs(solutions.length, idx, select);
  const s = solutions[idx];
  const primary = studioOf(s.primary);

  return (
    <section id="solutions" data-tone="light" data-sol={s.id} aria-labelledby="sol-title" className="sol-root relative overflow-hidden bg-white px-4 py-20 text-dark sm:px-6 md:py-28 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div>
            <Eyebrow tone="light">Solutions for you</Eyebrow>
            <h2 ref={headRef} id="sol-title" aria-label="Made for what you're building." className={`sol-h2 mt-4 font-extrabold ${headIn ? "sol-in" : ""}`}>
              <span aria-hidden="true"><span>Made for what</span></span>
              <span aria-hidden="true"><span className="sol-accent">you&apos;re building.</span></span>
            </h2>
          </div>
          <Reveal kind="fade" delay={0.2} className="max-w-sm lg:pb-2">
            <p className="text-base leading-relaxed text-muted-dark md:text-lg">Pick the one closest to you. See what we would make for it, and which of our services fit.</p>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-5 md:mt-14 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[19.5rem_minmax(0,1fr)] xl:gap-14">
          {/* selector: segmented control on phones/tablets, editorial rail on desktop */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div {...tabs.list("Customer type")} className="grid grid-cols-2 gap-1 rounded-2xl bg-paper-2 p-1 md:grid-cols-4 lg:block lg:rounded-none lg:bg-transparent lg:p-0">
              {solutions.map((x, i) => (
                <button key={x.id} type="button" {...tabs.tab(i)} className="sol-tab flex w-full items-center justify-center px-2 text-center lg:justify-start lg:gap-4 lg:px-5 lg:py-5 lg:text-left">
                  <span className="sol-tab-bar" aria-hidden="true" />
                  <span className="hidden text-xs font-bold tabular-nums tracking-[0.14em] opacity-70 lg:block" aria-hidden="true">0{i + 1}</span>
                  <span className="min-w-0 lg:flex-1">
                    <span className="block whitespace-nowrap text-sm font-bold lg:text-[21px] lg:font-extrabold lg:leading-tight">{x.label}</span>
                    <span className="mt-1 hidden text-[13px] font-semibold leading-snug text-muted-dark lg:block">{x.hint}</span>
                  </span>
                  <Arrow className="sol-tab-arrow hidden lg:block" />
                </button>
              ))}
            </div>
            <p className="mt-6 hidden text-sm leading-relaxed text-muted-dark lg:block">
              Building something else?{" "}
              <Link href="/contact" className="inline-flex min-h-11 items-center gap-1.5 font-bold text-dark underline decoration-violet decoration-2 underline-offset-4 hover:text-violet">Tell us about it <Arrow /></Link>
            </p>
          </div>

          <div {...tabs.panel(idx)} className="min-w-0">
            {/* stage */}
            {/* visibility is measured on this unclipped wrapper: the Reveal below starts fully clipped, which hid the stage from the observer */}
            <div ref={stageRef} className={stageIn ? "" : "sol-paused"}>
            <Reveal kind="clip-down">
              <div className="sol-stage aspect-square rounded-[1.5rem] sm:aspect-[4/3] md:rounded-[2rem] xl:aspect-[16/10]">
                <div role="img" aria-label={SCENE_ALT[s.id]} className="absolute inset-0">
                  <div aria-hidden="true">
                    {out ? <div key={`o${out.key}`} className="sol-layer sol-layer-out" data-dir={out.dir}><Scene id={solutions[out.i].id} /></div> : null}
                    <div key={`i${s.id}`} className={`sol-layer ${out ? "sol-layer-in" : ""}`} data-dir={out?.dir}><Scene id={s.id} /></div>
                    {out ? <div key={`e${out.key}`} className="sol-edge" data-dir={out.dir} /> : null}
                  </div>
                </div>
                <DemoCaption tone="light" className="absolute bottom-3 left-3 z-10 bg-white/85 md:bottom-4 md:left-4" />
              </div>
            </Reveal>
            </div>

            {/* copy */}
            <div key={`c${s.id}`} className="sol-swap mt-7 grid gap-x-12 gap-y-4 md:mt-9 md:grid-cols-2 md:items-start">
              <h3 style={{ ["--i" as string]: 0 }} className="min-h-[2.2em] text-balance text-[26px] font-extrabold leading-[1.1] tracking-[-0.01em] sm:text-3xl xl:text-[34px]">{s.headline}</h3>
              <div style={{ ["--i" as string]: 1 }}>
                <p className="min-h-[6.5em] text-base leading-relaxed text-muted-dark sm:min-h-[4.9em] md:min-h-[6.5em] xl:min-h-[4.9em]">{s.blurb}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <ButtonLink href={`/contact?for=${s.id}`} tone="light" className="max-[400px]:flex-1 max-[400px]:px-4">Start a Project</ButtonLink>
                  <ButtonLink href={primary.href} variant="secondary" tone="light" className="max-[400px]:flex-1 max-[400px]:px-4">Explore Services<span className="sr-only">: {primary.verb}, {primary.name}</span> <Arrow /></ButtonLink>
                </div>
              </div>
            </div>

            {COMBOS_ENABLED && PACK[s.id] && (
              <p className="mt-5 text-[15px] font-bold"><a href={`#combo-${PACK[s.id]!.id}`} className="for-link">{PACK[s.id]!.name}: {inr(PACK[s.id]!.price)}{PACK[s.id]!.monthly ? "/month" : ""}</a></p>
            )}
            {/* recommended services: every card opens that service on its studio page (/create#short-videos). Hidden for content creator and online store. */}
            {s.id !== "store" && s.id !== "creator" && <div className="mt-10 border-t border-line pt-6 md:mt-12">
              <p id="sol-svc-label" className="text-xs font-bold uppercase tracking-[0.3em] text-muted-dark">Recommended for a {s.label.toLowerCase()}</p>
              <ul key={`s${s.id}`} aria-labelledby="sol-svc-label" className="sol-swap mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {s.services.map((sv, i) => <ServiceLink key={sv.id} sv={sv} i={i} />)}
                {s.later ? <ServiceLink sv={s.later} later i={s.services.length} /> : null}
              </ul>
            </div>}
          </div>
        </div>
      </div>
    </section>
  );
}
