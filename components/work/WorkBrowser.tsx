"use client";
/* /work: filter tabs (All, CREATE, BUILD) over every item in data/work.ts.
   The filter is kept in the address (?type=create or ?type=build) so links can open a filtered view. */
import { useEffect, useState } from "react";
import { WORK } from "../../data/work";
import ReelCard from "./ReelCard";
import SiteCard from "./SiteCard";

type F = "all" | "create" | "build";
const TABS: { id: F; label: string; count: number }[] = [
  { id: "all", label: "All", count: WORK.reels.length + WORK.sites.length },
  { id: "create", label: "CREATE", count: WORK.reels.length },
  { id: "build", label: "BUILD", count: WORK.sites.length },
];

export default function WorkBrowser() {
  const [f, setF] = useState<F>("all");
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("type");
    if (t === "create" || t === "build") setF(t);
  }, []);
  const pick = (next: F) => {
    setF(next);
    const url = new URL(window.location.href);
    if (next === "all") url.searchParams.delete("type"); else url.searchParams.set("type", next);
    window.history.replaceState(null, "", url);
  };
  const showCreate = f !== "build" && WORK.reels.length > 0;
  const showBuild = f !== "create" && WORK.sites.length > 0;

  return (
    <>
      <div className="work-filter" role="group" aria-label="Filter work">
        {TABS.map((t) => (
          <button key={t.id} type="button" aria-pressed={f === t.id} onClick={() => pick(t.id)} className={`work-filter-btn work-filter-btn--${t.id}`}>
            {t.label}<span className="work-filter-n">{t.count}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{f === "all" ? "Showing all work" : `Showing ${f.toUpperCase()} work`}</p>

      {showCreate && (
        <section id="create" aria-labelledby="work-create" className="mt-10 scroll-mt-24 md:mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="work-create" className="work-kicker work-kicker--create">CREATE · Video editing</h2>
            <p className="text-sm text-muted">Tap or hover to play · sound and fullscreen on each reel</p>
          </div>
          <ul className="work-grid-tight mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
            {WORK.reels.map((r) => <li key={r.id}><ReelCard reel={r} sizes="(min-width: 1280px) 400px, (min-width: 768px) 31vw, 48vw" /></li>)}
          </ul>
        </section>
      )}

      {showBuild && (
        <section id="build" aria-labelledby="work-build" className="mt-14 scroll-mt-24 md:mt-20">
          <h2 id="work-build" className="work-kicker work-kicker--build">BUILD · Websites</h2>
          <ul className="mt-6 grid gap-12 md:gap-16">
            {WORK.sites.map((s, i) => <li key={s.id}><SiteCard site={s} layout="row" priority={i === 0 && f === "build"} /></li>)}
          </ul>
        </section>
      )}
    </>
  );
}
