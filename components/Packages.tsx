"use client";
/* "Services and prices": BUILD / CREATE tabs → service cards → options (chips) with prices, delivery, extras,
   what we need, free items and a requirements box. Used on the homepage (opens on BUILD), /build and /create.
   All prices and words come from data/pricing.ts; sample links from data/samples.ts. */
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { COPY, orderedOptions, mostPicked, REQUIREMENTS_MAX, services, startingFrom, type Service, type StudioKey } from "../data/pricing";
import { SAMPLES } from "../data/samples";
import { studios } from "../data/studios";
import { estimate, inr, unitLabel } from "../lib/pricing";
import { useSelection } from "./pricing/state";
import ReferEarn from "./pricing/ReferEarn";
import { Reveal, useInView, useTabs } from "./ui";

const TABS: StudioKey[] = ["create", "build"];
const HEADLINE = [["Services", "and"], ["prices"]];

function Samples({ id }: { id: string }) {
  const links = SAMPLES[id] ?? [];
  if (!links.length) return null;
  if (links.length === 1) return <a className="svc-samples" href={links[0]} target="_blank" rel="noopener noreferrer">See samples ↗</a>;
  return (
    <details className="svc-samples-menu">
      <summary className="svc-samples">See samples ↗</summary>
      <ul>{links.map((l, i) => <li key={l}><a href={l} target="_blank" rel="noopener noreferrer">Sample {i + 1} ↗</a></li>)}</ul>
    </details>
  );
}

function Panel({ s, onBack }: { s: Service; onBack: () => void }) {
  const { sel, toggle, setQty, toggleExtra, setReq } = useSelection();
  const est = useMemo(() => estimate(sel), [sel]);
  const picked = s.options.filter((o) => sel.items[o.id]);
  const hasVideo = s.options.some((o) => o.video);
  const optNeeds = picked.flatMap((o) => o.need ?? []);
  const req = sel.reqs[s.id] ?? "";
  return (
    <div className="svc-panel">
      <div className="svc-panel-top">
        <button type="button" className="svc-back" onClick={onBack}>← Back to all services</button>
        <Samples id={s.id} />
      </div>
      <h3 className="svc-panel-title">{s.name}</h3>
      <p className="svc-panel-line">{s.line}</p>

      <ul className="svc-chips" aria-label={`${s.name} options`}>
        {orderedOptions(s).map((o) => {
          const n = sel.items[o.id] ?? 0;
          return (
            <li key={o.id} className="svc-chip" data-on={n > 0}>
              <button type="button" aria-pressed={n > 0} className="svc-chip-btn" onClick={() => toggle(o.id)}>
                <span className="svc-tick" aria-hidden="true" />
                <span className="svc-chip-name">{o.name}{o.popular && <span className="svc-pop">Popular</span>}</span>
                <span className="svc-chip-price">{o.price === null ? "Custom quote" : `${inr(o.price)}${unitLabel(o.unit)}`}</span>
              </button>
              {n > 0 && (
                <div className="svc-chip-more">
                  <span className="svc-chip-time">⏱ Delivery: {o.delivery}</span>
                  {o.qty && (
                    <span className="svc-qty" role="group" aria-label={`How many ${o.name}`}>
                      <button type="button" aria-label="One less" onClick={() => setQty(o.id, n - 1)}>−</button>
                      <output aria-live="polite">{n}</output>
                      <button type="button" aria-label="One more" onClick={() => setQty(o.id, n + 1)}>+</button>
                    </span>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {hasVideo && <p className="svc-tip">💡 {est.videoTip}</p>}

      {picked.length > 0 && (
        <div className="svc-after">
          <p className="svc-note">{COPY.delivery}</p>
          {s.extras.length > 0 && (
            <div>
              <h4 className="svc-h4">Extras (optional)</h4>
              <ul className="svc-extras">
                {s.extras.map((x) => (
                  <li key={x.id}>
                    <button type="button" aria-pressed={!!sel.extras[x.id]} className="svc-extra" onClick={() => toggleExtra(x.id)}>
                      {x.name} <b>+{inr(x.price)}{x.monthly ? "/month" : ""}</b>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h4 className="svc-h4">What we need from you</h4>
            <ul className="svc-need">{[...s.need, ...optNeeds].map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        </div>
      )}

      <p className="svc-free"><b>Free with every order:</b> {s.free.join(" · ")}</p>

      <div className="svc-req">
        <label htmlFor={`req-${s.id}`} className="svc-h4">{COPY.requirementsLabel}</label>
        <textarea id={`req-${s.id}`} className="for-field for-area-sm" maxLength={REQUIREMENTS_MAX} placeholder={s.placeholder} value={req}
          onChange={(e) => setReq(s.id, e.target.value)} aria-describedby={`req-${s.id}-help`} />
        <p id={`req-${s.id}-help`} className="svc-help"><span>{COPY.requirementsHelp}</span><span className="tabular-nums">{req.length}/{REQUIREMENTS_MAX}</span></p>
      </div>
    </div>
  );
}

export default function Packages({ initial = "create" }: { initial?: StudioKey }) {
  const { sel } = useSelection();
  const [index, setIndex] = useState(TABS.indexOf(initial));
  const [open, setOpen] = useState<string | null>(null);
  const [headRef, headIn] = useInView<HTMLHeadingElement>({ once: true, margin: "0px 0px -10% 0px" });
  const sheet = useRef<HTMLDivElement>(null);
  const tabs = useTabs(TABS.length, index, (i) => { setIndex(i); setOpen(null); }, "horizontal");
  const studio = TABS[index];
  const list = services.filter((s) => s.studio === studio);
  const current = open ? services.find((s) => s.id === open) : null;

  /* /#packages-build and /#packages-create open that tab. */
  useEffect(() => {
    const fromHash = (hash?: string) => {
      const h = hash ?? window.location.hash;
      const m = /^#packages-(build|create)$/.exec(h);
      if (m) { setIndex(TABS.indexOf(m[1] as StudioKey)); setOpen(null); return; }
      const sv = services.find((s) => h === `#svc-${s.id}`);
      if (sv) { setIndex(TABS.indexOf(sv.studio)); setOpen(sv.id); requestAnimationFrame(() => sheet.current?.scrollIntoView({ block: "start" })); }
    };
    fromHash();
    const onHash = () => fromHash();
    /* In-page links made with next/link change the address without a "hashchange" event, so also read the clicked link itself. */
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href*='#packages-'], a[href*='#svc-']") as HTMLAnchorElement | null;
      if (a && a.pathname === window.location.pathname) fromHash(a.hash);
    };
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onClick);
    return () => { window.removeEventListener("hashchange", onHash); document.removeEventListener("click", onClick); };
  }, []);

  const go = (id: string | null) => {
    setOpen(id);
    requestAnimationFrame(() => { const el = sheet.current; if (el && el.getBoundingClientRect().top < 110) el.scrollIntoView({ block: "start" }); });
  };

  return (
    <section id="packages" data-tone="dark" aria-labelledby="pkg-title" className="pac-band bg-violet px-4 py-20 text-light sm:px-6 md:px-8 md:py-28 lg:py-32">
      <span id="packages-create" className="pac-anchor" aria-hidden="true" />
      <span id="packages-build" className="pac-anchor" aria-hidden="true" />
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-x-12 gap-y-5 xl:grid-cols-[auto_minmax(0,26rem)] xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white">BUILD <span aria-hidden="true" className="mx-1 opacity-60">/</span> CREATE</p>
            <h2 ref={headRef} id="pkg-title" aria-label={COPY.heading} className={`pac-title mt-4 font-extrabold text-white ${headIn ? "pac-title-in" : ""}`}>
              {HEADLINE.map((line, l) => (
                <span key={l} aria-hidden="true" className="pac-title-line">
                  {line.map((w, i) => (
                    <Fragment key={w}>{i > 0 ? " " : ""}<span className="pac-title-word"><span className={l === 1 ? "pac-accent" : undefined} style={{ ["--w" as string]: l * 2 + i }}>{w}</span></span></Fragment>
                  ))}{" "}
                </span>
              ))}
            </h2>
          </div>
          <Reveal kind="fade" delay={0.15}>
            <p className="max-w-xl text-base leading-relaxed text-white md:text-lg">Pick the services you need. You&apos;ll see the price and delivery time straight away.</p>
          </Reveal>
        </div>

        <div {...tabs.list("Service category")} className="pac-tabs svc-tabs mt-9 md:mt-12">
          {TABS.map((id, i) => {
            const s = studios.find((x) => x.id === id)!;
            return (
              <button key={id} type="button" {...tabs.tab(i)} data-studio={id} className="pac-tab">
                <span className="pac-tab-verb"><span className="pac-dot" aria-hidden="true" />{s.verb}</span>
                <span className="pac-tab-name">{s.name}</span>
              </button>
            );
          })}
        </div>

        <div {...tabs.panel(index)} className="pac-panel mt-4 md:mt-5">
          <div ref={sheet} key={studio} data-studio={studio} className="pac-sheet svc-sheet">
            {current ? (
              <Panel s={current} onBack={() => go(null)} />
            ) : (
              <ul className="svc-cards">
                {list.map((s) => {
                  const n = s.options.filter((o) => sel.items[o.id]).length;
                  return (
                    <li key={s.id}>
                      <button type="button" className="svc-card" onClick={() => go(s.id)}>
                        <span className="svc-card-top">
                          {s.tag && <span className="svc-tag">{s.tag}</span>}
                          {n > 0 && <span className="svc-badge">{n} selected</span>}
                        </span>
                        <span className="svc-card-name">{s.name}</span>
                        <span className="svc-card-line">{s.line}</span>
                        <span className="svc-card-from">Starting from <b>{inr(startingFrom(s))}</b></span>
                        <span className="svc-card-most">Most picked: {mostPicked(s)}</span>
                        <span className="svc-card-go" aria-hidden="true">→</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        <ReferEarn />
      </div>
    </section>
  );
}
