"use client";
/* Homepage section 5 — Packages & Pricing ("Find your starting point.").
   A studio menu on the violet brand band: three categories (tabs) → numbered package rows that expand into a scope sheet.
   No prices, revision counts or delivery times: every row ends in "Request Quote". */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { growPreview, packages, studios, type StudioId } from "../data/site";
import { BetaBadge, ButtonLink, Arrow, Reveal, useInView, useTabs } from "./ui";
import PackageRow from "./packages/PackageRow";
import GrowSheet from "./packages/GrowSheet";

const STORE_KEY = "mk:packages";
const HASH = /^#packages-(create|build|grow)$/;
/* Tab labels: the second word is visually dropped on phones but stays in the accessible name. */
/* Local kinetic headline (the shared KineticHeading collapses the spaces between words in this wide typeface). */
const HEADLINE = [["Find", "your"], ["starting", "point."]];
const LABEL: Record<StudioId, [string, string]> = { create: ["Video", " Editing"], build: ["Website", " Development"], grow: ["Marketing", ""] };

/* Phones start with every row closed (a compact index); wider screens open the first row as an example. */
const isPhone = () => typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;
const firstOpen = (i: number) => (isPhone() ? null : packages[studios[i].id][0]?.slug ?? null);

export default function Packages() {
  const uid = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const [sheetRef, inView] = useInView<HTMLDivElement>({ once: true, margin: "0px 0px -12% 0px", threshold: 0.05 });
  const [headRef, headIn] = useInView<HTMLHeadingElement>({ once: true, margin: "0px 0px -10% 0px" });
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState<string | null>(packages.create[0].slug);
  const [dir, setDir] = useState<1 | -1>(1);
  const [changes, setChanges] = useState(0); // > 0 once the visitor has switched category (enables the wipe)
  const [ready, setReady] = useState(false);

  const studio = studios[index];
  const id = studio.id;
  const list = packages[id];

  const indexRef = useRef(0);
  indexRef.current = index;
  const select = useCallback((i: number) => {
    const cur = indexRef.current;
    if (cur === i) return;
    setDir(i > cur ? 1 : -1);
    setOpen(firstOpen(i));
    setChanges((c) => c + 1);
    setIndex(i);
  }, []);
  const tabs = useTabs(studios.length, index, select, "horizontal");

  /* Restore the category + open row after Back / reload, and honour /#packages-build style deep links. */
  useEffect(() => {
    type Saved = { tab?: string; open?: string | null } | null;
    let saved: Saved = null;
    try { saved = JSON.parse(window.sessionStorage.getItem(STORE_KEY) || "null") as Saved; } catch { /* storage unavailable: keep defaults */ }
    /* The row this visitor last had open in category i (null = all closed), or the default for a first visit. */
    const rowFor = (i: number, remembered: Saved) => {
      const rows = packages[studios[i].id];
      if (!remembered || remembered.tab !== studios[i].id) return firstOpen(i);
      return remembered.open === null ? null : rows.find((p) => p.slug === remembered.open)?.slug ?? firstOpen(i);
    };
    const fromHash = (initial: boolean) => {
      const m = HASH.exec(window.location.hash);
      const i = m ? studios.findIndex((s) => s.id === m[1]) : -1;
      if (i < 0) return false;
      const returning = initial && saved?.tab === studios[i].id; // Back / reload: keep the browser's own scroll position
      setIndex(i);
      setOpen(rowFor(i, initial ? saved : null));
      if (!returning) sectionRef.current?.scrollIntoView();
      return true;
    };
    if (!fromHash(true)) {
      const i = saved ? studios.findIndex((s) => s.id === saved?.tab) : -1;
      if (i >= 0) { setIndex(i); setOpen(rowFor(i, saved)); }
      else if (isPhone()) setOpen(null);
    }
    setReady(true);
    const onHash = () => { fromHash(false); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { window.sessionStorage.setItem(STORE_KEY, JSON.stringify({ tab: id, open })); } catch { /* ignore */ }
  }, [ready, id, open]);

  return (
    <section ref={sectionRef} id="packages" data-tone="dark" aria-labelledby="pkg-title" className="pac-band bg-violet px-4 py-20 text-light sm:px-6 md:px-8 md:py-28 lg:py-32">
      <span id="packages-create" className="pac-anchor" aria-hidden="true" />
      <span id="packages-build" className="pac-anchor" aria-hidden="true" />
      <span id="packages-grow" className="pac-anchor" aria-hidden="true" />
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-x-12 gap-y-5 xl:grid-cols-[auto_minmax(0,26rem)] xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white">Packages <span aria-hidden="true" className="mx-1 opacity-60">/</span> quoted to scope</p>
            <h2 ref={headRef} id="pkg-title" aria-label="Find your starting point." className={`pac-title mt-4 font-extrabold text-white ${headIn ? "pac-title-in" : ""}`}>
              {HEADLINE.map((line, l) => (
                <span key={l} aria-hidden="true" className="pac-title-line">
                  {line.map((w, i) => (
                    <span key={w} className="pac-title-word">
                      <span className={l === 1 ? "pac-accent" : undefined} style={{ ["--w" as string]: l * 2 + i }}>{w}</span>
                    </span>
                  ))}
                </span>
              ))}
            </h2>
          </div>
          <Reveal kind="fade" delay={0.15}>
            <p className="max-w-xl text-base leading-relaxed text-white md:text-lg">
              There is no price list here, because every project is quoted on what it actually involves. These starting points show how we organise the work: open one to see what a quote depends on, then request yours.
            </p>
          </Reveal>
        </div>

        <div {...tabs.list("Service category")} className="pac-tabs mt-9 md:mt-12">
          {studios.map((s, i) => (
            <button key={s.id} type="button" {...tabs.tab(i)} data-studio={s.id} className="pac-tab">
              <span className="pac-tab-verb">
                <span className="pac-dot" aria-hidden="true" />
                {s.verb}
                {s.beta && <span className="pac-tab-beta">Beta</span>}
              </span>
              <span className="pac-tab-name">
                {s.id === "grow" && <span className="sr-only sm:not-sr-only">Digital </span>}
                {LABEL[s.id][0]}
                {LABEL[s.id][1] && <span className="sr-only sm:not-sr-only">{LABEL[s.id][1]}</span>}
              </span>
            </button>
          ))}
        </div>

        <div {...tabs.panel(index)} className="pac-panel mt-4 md:mt-5">
          <div key={id} ref={sheetRef} data-studio={id} className={`pac-sheet ${inView ? "pac-play" : ""}`} style={{ ["--pac-dir" as string]: dir }}>
            {changes > 0 && <span key={changes} className="pac-wipe" aria-hidden="true" />}
            <div className="pac-head">
              <p className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] font-bold uppercase tracking-[0.16em] text-dark">
                <span className="pac-dot" aria-hidden="true" />
                {studio.verb}
                <span className="font-semibold normal-case tracking-normal text-muted-dark">{studio.name}</span>
                {studio.beta && <BetaBadge tone="light" label="Beta" />}
              </p>
              <p className="text-[13px] font-semibold text-muted-dark">
                {studio.beta ? growPreview.status : `${list.length} starting points`}
              </p>
            </div>

            {studio.beta ? (
              <GrowSheet />
            ) : (
              <ol className="pac-list">
                {list.map((p, i) => (
                  <PackageRow
                    key={p.slug}
                    pkg={p}
                    n={i + 1}
                    studio={studio}
                    idBase={`${uid}-${id}-${p.slug}`}
                    open={open === p.slug}
                    onToggle={() => setOpen((cur) => (cur === p.slug ? null : p.slug))}
                  />
                ))}
              </ol>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mt-10">
          <p className="max-w-xl text-[15px] leading-relaxed text-white">
            Not sure which one fits? You can start a project without choosing a package.
          </p>
          <ButtonLink href="/contact" tone="dark" className="self-start sm:self-auto">Start a Project <Arrow /></ButtonLink>
        </div>
      </div>
    </section>
  );
}
