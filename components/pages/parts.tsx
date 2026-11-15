/* Shared building blocks for the internal pages (server components). Styles: app/styles/pages.css (.pag-*). */
import Link from "next/link";
import { process as steps } from "../../data/process";
import { studios, type StudioId } from "../../data/studios";
import { Arrow, BetaBadge, ButtonLink, KineticHeading, Reveal } from "../ui";
import { ScrollVar } from "./Live";

export type Tone = "dark" | "light";

/** Small uppercase label in the current band's accent colour. */
export function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`pag-label ${className}`}>{children}</p>;
}

/** Breadcrumb trail. The last item is the current page. */
export function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="pag-crumbs">
      <ol>
        {items.map((it, i) => (
          <li key={it.label}>
            {it.href ? <Link href={it.href}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
            {i < items.length - 1 && <span aria-hidden="true" className="pag-crumbs-sep">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** The four steps from data/process.ts with a progress line that fills as the block scrolls through the viewport. */
export function ProcessSteps({ className = "" }: { className?: string }) {
  return (
    <ScrollVar className={`pag-steps ${className}`} start={0.85} end={0.45}>
      <span className="pag-steps-line" aria-hidden="true" />
      <ol>
        {steps.map((st, i) => (
          <li key={st.n} className="pag-step" style={{ ["--i" as string]: i }}>
            <span className="pag-step-n" aria-hidden="true">{st.n}</span>
            <h3 className="pag-step-t">{st.title}</h3>
            <p className="pag-step-x">{st.text}</p>
          </li>
        ))}
      </ol>
    </ScrollVar>
  );
}

/** Closing call to action. `tone` is the surface; `id` picks the accent. */
export function CtaBand({ id, tone, title, accent, text, primary, secondary, note, studio }: {
  id: string; tone: Tone; title: string; accent?: string; text: string;
  primary: { label: string; href: string }; secondary?: { label: string; href: string }; note?: string; studio?: StudioId;
}) {
  return (
    <section id={id} data-tone={tone} aria-labelledby={`${id}-title`} className={`pag-band pag-cta ${studio ? `pag-${studio}` : ""} ${tone === "dark" ? "bg-ink text-light" : "bg-paper text-dark"} px-5 py-20 md:px-8 md:py-28`}>
      <span className="pag-cta-art" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl">
        <KineticHeading id={`${id}-title`} text={title} accent={accent} accentClass="pag-acc" className="pag-h2 pag-h2--xl max-w-4xl font-extrabold" />
        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <Reveal kind="fade" delay={0.15}>
            <p className={`max-w-xl text-lg leading-relaxed ${tone === "dark" ? "text-muted" : "text-muted-dark"}`}>{text}</p>
            {note && <p className={`mt-3 max-w-xl text-sm leading-relaxed ${tone === "dark" ? "text-muted" : "text-muted-dark"}`}>{note}</p>}
          </Reveal>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={primary.href} tone={tone} size="lg">{primary.label}<Arrow /></ButtonLink>
            {secondary && <ButtonLink href={secondary.href} tone={tone} variant="secondary" size="lg">{secondary.label}</ButtonLink>}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Links to the other two studios (and the overview) from a division page. */
export function StudioSwitch({ current }: { current: StudioId }) {
  const others = studios.filter((s) => s.id !== current);
  return (
    <nav aria-label="Other studios" className="pag-switch">
      {others.map((s) => (
        <Link key={s.id} href={s.href} className={`pag-switch-link pag-${s.id}`}>
          <span className="pag-switch-verb">{s.verb}{s.beta && <BetaBadge className="ml-2 align-middle" />}</span>
          <span className="pag-switch-name">{s.name}</span>
          <Arrow className="pag-switch-arrow" />
        </Link>
      ))}
      <Link href="/studios" className="pag-switch-link pag-switch-all">
        <span className="pag-switch-verb">Overview</span>
        <span className="pag-switch-name">All three studios</span>
        <Arrow className="pag-switch-arrow" />
      </Link>
    </nav>
  );
}

/* ---------- service glyphs: tiny line drawings of the deliverable (decorative) ---------- */
const G: Record<string, React.ReactNode> = {
  V1: <><rect x="34" y="4" width="28" height="48" rx="4" /><path d="M41 38h14M44 44h8" /><path d="M45 18l8 5-8 5z" /></>,
  V2: <><rect x="10" y="8" width="76" height="40" rx="4" /><path d="M20 28h4M28 22v12M34 18v20M40 24v8M46 16v24M52 22v12M58 26v4M64 20v16M70 24v8M76 27v2" /></>,
  V3: <><rect x="18" y="8" width="48" height="40" rx="4" /><path d="M38 20l12 8-12 8z" /><path d="M74 14l6-4M76 28h8M74 42l6 4" /></>,
  V4: <><rect x="4" y="16" width="38" height="24" rx="3" /><path d="M46 28h8M51 24l4 4-4 4" /><rect x="60" y="8" width="10" height="18" rx="2" /><rect x="74" y="8" width="18" height="18" rx="2" /><rect x="60" y="32" width="32" height="18" rx="2" /></>,
  V5: <><path d="M22 44L34 12l12 32M26 34h16" /><path d="M56 44V24c0-6 14-6 14 0v20M56 34h14" /><path d="M78 16h12M80 28h10M78 40h12" /></>,
  T1: <><rect x="12" y="6" width="72" height="44" rx="4" /><path d="M12 16h72" /><path d="M20 24h26M20 30h18" /><rect x="54" y="22" width="22" height="20" rx="2" /><rect x="20" y="36" width="14" height="6" rx="3" /></>,
  T2: <><rect x="12" y="6" width="72" height="44" rx="4" /><path d="M12 16h72" /><rect x="20" y="22" width="16" height="12" rx="2" /><rect x="40" y="22" width="16" height="12" rx="2" /><rect x="60" y="22" width="16" height="12" rx="2" /><path d="M20 40h10M40 40h10M60 40h10" /></>,
  T3: <><rect x="20" y="8" width="56" height="42" rx="4" /><path d="M20 20h56M34 4v8M62 4v8" /><path d="M30 28h6M45 28h6M60 28h6M30 38h6M60 38h6" /><rect x="42" y="34" width="12" height="9" rx="2" /></>,
  T4: <><rect x="6" y="12" width="34" height="32" rx="3" strokeDasharray="4 3" /><path d="M44 28h8M49 24l4 4-4 4" /><rect x="56" y="12" width="34" height="32" rx="3" /><path d="M62 22h14M62 28h22M62 34h10" /></>,
  T5: <><rect x="12" y="6" width="72" height="44" rx="4" /><path d="M12 16h72" /><path d="M38 34l7 7 14-15" /></>,
  M1: <><rect x="28" y="4" width="40" height="48" rx="5" /><rect x="34" y="14" width="28" height="20" rx="2" /><path d="M34 40h18" /><circle cx="36" cy="9" r="1.5" /></>,
  M2: <><rect x="16" y="8" width="64" height="42" rx="4" /><path d="M16 20h64M32 20v30M48 20v30M64 20v30M16 35h64" /><rect x="35" y="24" width="10" height="7" rx="1.5" /><rect x="51" y="39" width="10" height="7" rx="1.5" /></>,
  M3: <><path d="M48 50s16-15 16-27a16 16 0 10-32 0c0 12 16 27 16 27z" /><circle cx="48" cy="23" r="6" /></>,
};
export function ServiceGlyph({ code, className = "" }: { code: string; className?: string }) {
  return (
    <svg viewBox="0 0 96 56" className={`pag-glyph ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {G[code]}
    </svg>
  );
}
