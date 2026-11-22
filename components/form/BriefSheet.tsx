/* The "project brief" document: a live dark card beside the form, and the finished paper sheet in the result state. */
import { accentOf, color } from "../../data/tokens";
import { briefGroups, studioLabel, validateField, type BriefValues, type StudioChoice } from "./brief";

const accentFor = (s: StudioChoice) => (s === "unsure" ? color.muted : accentOf[s]);

/** Small strip in each division's own visual language (frames / wireframe grid / broadcast rings). */
export function StudioMotif({ studio, className = "" }: { studio: StudioChoice; className?: string }) {
  return <span aria-hidden="true" className={`for-motif for-motif-${studio} ${className}`} />;
}

export function Essentials({ values, tone }: { values: BriefValues; tone: "dark" | "light" }) {
  const items = (["name", "whatsapp"] as const).map((k) => ({ k, label: k === "name" ? "Name" : "WhatsApp number", ok: !!values[k].trim() && !validateField(k, values) }));
  const done = items.filter((i) => i.ok).length;
  return (
    <div className={`for-essentials for-essentials-${tone}`}>
      <p className="flex items-baseline justify-between gap-3 text-xs font-bold uppercase tracking-[0.18em]">
        <span>Essentials</span>
        <span className="tabular-nums">{done} of {items.length}</span>
      </p>
      <ul className="mt-2.5 grid grid-cols-2 gap-2">
        {items.map((i) => (
          <li key={i.k} data-ok={i.ok} className="for-ess-item">
            <span className="for-ess-bar" aria-hidden="true" />
            <span className="mt-1.5 flex items-center gap-1 text-xs font-semibold">
              <svg viewBox="0 0 12 12" className="for-ess-tick h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6.5 4.8 9 10 3.5" /></svg>
              {i.label}
              <span className="sr-only">{i.ok ? " — done" : " — still needed"}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Live card: fills in as the visitor types. Purely a reflection of the form (not a live region, so it stays quiet for screen readers). */
export function LiveBrief({ values }: { values: BriefValues }) {
  const groups = briefGroups(values);
  const typed = groups.some((g) => g.rows.some((r) => r.label !== "Studio"));
  return (
    <div className="for-live" style={{ ["--acc" as string]: accentFor(values.studio) }}>
      <StudioMotif studio={values.studio} />
      <div className="px-6 pb-6 pt-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-light">Project brief</p>
          <span className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-light ring-1 ring-white/30">Draft</span>
        </div>
        <p className="for-live-studio mt-4 text-xl font-extrabold leading-tight text-light">{studioLabel(values.studio)}</p>
        <div className="mt-4 border-t border-white/12 pt-4"><Essentials values={values} tone="dark" /></div>
        {!typed && <p className="mt-3 text-sm leading-relaxed text-muted">Your brief builds here as you fill in the form. Nothing is sent while you type.</p>}
        <dl className="mt-4 grid gap-4">
          {groups.map((g) => {
            const rows = g.rows.filter((r) => r.label !== "Studio");
            if (!rows.length) return null;
            return (
              <div key={g.title} className="border-t border-white/12 pt-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: "var(--acc)" }}>{g.title}</p>
                {rows.map((r) => (
                  <div key={r.label} className="for-row mt-2">
                    <dt className="text-xs font-semibold text-muted">{r.label}</dt>
                    <dd className={`for-wrap text-sm font-semibold leading-snug text-light ${r.long ? "for-clamp" : ""}`}>
                      {r.list && r.list.length > 1 ? <ul className="grid gap-0.5">{r.list.map((x) => <li key={x}>{x}</li>)}</ul> : r.value}
                    </dd>
                  </div>
                ))}
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}

/** Finished brief on a paper sheet (result state). */
export function BriefDocument({ values, dateLabel, stamp }: { values: BriefValues; dateLabel: string; stamp: string }) {
  const groups = briefGroups(values);
  return (
    <article aria-label="Your project brief" className="for-doc" style={{ ["--acc" as string]: accentFor(values.studio) }}>
      <StudioMotif studio={values.studio} className="for-motif-doc" />
      <div className="p-6 sm:p-8">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-dark">MAKENDLESS · Project brief</p>
            {dateLabel && <p className="mt-1 text-xs font-semibold text-muted-dark">Prepared {dateLabel}</p>}
          </div>
          <span className="for-stamp">{stamp}</span>
        </header>
        <dl className="mt-6 grid gap-6">
          {groups.map((g) => (
            <div key={g.title} className="border-t border-line pt-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet">{g.title}</p>
              <div className="mt-1 grid gap-x-8 sm:grid-cols-2">
                {g.rows.map((r) => (
                  <div key={r.label} className={`mt-3 ${r.long || (r.list && r.list.length > 1) ? "sm:col-span-2" : ""}`}>
                    <dt className="text-xs font-semibold text-muted-dark">{r.label}</dt>
                    <dd className="for-wrap mt-0.5 whitespace-pre-wrap text-[15px] font-semibold leading-relaxed text-dark">
                      {r.list && r.list.length > 1 ? <ul className="grid gap-0.5">{r.list.map((x) => <li key={x}>{x}</li>)}</ul> : r.value}
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}
