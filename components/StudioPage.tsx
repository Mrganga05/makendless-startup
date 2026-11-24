import Link from "next/link";
import { studios, type StudioId, type StudioKey } from "../data/pricing";
import { process } from "../data/process";
import { BuildWorld, CreateWorld, GrowWorld } from "./studios/Worlds";
import Packages from "./Packages";
import { PricingRegion } from "./pricing/state";
import Waitlist from "./Waitlist";
import RecentWork from "./work/RecentWork";
import { Arrow, BetaBadge, ButtonLink, DemoCaption, Eyebrow, KineticHeading, Reveal } from "./ui";

/* Division page (/create, /build, /grow). One template, three identities: accent colour, hero world and
   surface tint all come from the studio id. /create and /build have ONE services section: the price selector. Styling is Tailwind tokens only; the hero worlds reuse the
   homepage gateway visuals (styled in app/styles/studios.css). */

const LOOK: Record<StudioId, { text: string; dot: string; ring: string; heroBg: string; stage: string; chip: string }> = {
  create: { text: "text-create", dot: "bg-create", ring: "ring-create/40", heroBg: "radial-gradient(55% 60% at 80% 40%, rgba(34,211,238,.28), transparent 70%)", stage: "bg-[#06121c]", chip: "bg-create/15 text-create" },
  build: { text: "text-build", dot: "bg-build", ring: "ring-build/40", heroBg: "radial-gradient(55% 60% at 80% 40%, rgba(139,92,246,.34), transparent 70%)", stage: "bg-[#2a1a7a]", chip: "bg-build/15 text-violet" },
  grow: { text: "text-grow", dot: "bg-grow", ring: "ring-grow/40", heroBg: "radial-gradient(55% 60% at 80% 40%, rgba(199,166,255,.30), transparent 70%)", stage: "bg-[#ece4ff]", chip: "bg-grow/25 text-violet" },
};

export function StudioWorld({ id, className = "" }: { id: StudioId; className?: string }) {
  const world = id === "create" ? <CreateWorld /> : id === "build" ? <BuildWorld /> : <GrowWorld />;
  return (
    <div className={`stu-${id} ${className}`} aria-hidden="true">
      <div className={`stu-stage !m-0 !h-full !rounded-[1.75rem] ${LOOK[id].stage}`} style={{ overflow: "hidden" }}>{world}</div>
    </div>
  );
}

export default function StudioPage({ id }: { id: StudioId }) {
  const s = studios.find((x) => x.id === id)!;
  const L = LOOK[id];
  const others = studios.filter((x) => x.id !== id);
  const beta = !!s.beta;
  /* CREATE and BUILD have one services section: the price selector (services, options, free items, prices).
     GROW (beta) has no prices, so it lists its three planned items instead. */
  const planned = s.planned ?? [];
  return (
    <>
      {/* HERO — dark, division world on the right */}
      <section data-tone="dark" className="relative isolate overflow-hidden bg-ink px-5 pb-16 pt-28 text-light md:px-8 md:pb-24 md:pt-36">
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: L.heroBg }} />
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="text-sm text-muted">
              <Link href="/studios" className="inline-flex min-h-11 items-center hover:text-white">Studios</Link>
              <span className="mx-2" aria-hidden="true">/</span>
              <span className="text-light">{s.verb}</span>
            </nav>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className={`text-sm font-extrabold tracking-[0.35em] ${L.text}`}>{s.verb}</p>
              {beta && <BetaBadge />}
            </div>
            <KineticHeading as="h1" text={s.name} className="mt-3 text-[clamp(2.4rem,9vw,5.2rem)] font-extrabold leading-[0.98] tracking-tight" />
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#c3c8de]">{s.lead || s.tagline}</p>
            {beta && (
              <p className="mt-5 max-w-xl rounded-2xl border border-grow/40 bg-grow/10 p-4 text-[15px] leading-relaxed text-light">
                Digital marketing is in beta. We are building and testing these services before offering them. Nothing here is a paid service yet, and no results are promised.
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={beta ? `/contact?service=${id}` : "/start-project"}>{beta ? "Tell us you're interested" : "Start a Project"} <Arrow /></ButtonLink>
              <ButtonLink href="#services" variant="secondary">See services</ButtonLink>
            </div>
            {beta && <div className="mt-6"><p className="mb-2 text-sm font-bold text-light">Join the waitlist</p><Waitlist tone="dark" /></div>}
          </div>
          <Reveal kind="clip-down" className="min-w-0">
            <div className="relative">
              <StudioWorld id={id} className="h-[300px] sm:h-[380px] lg:h-[460px]" />
              <DemoCaption kind={beta ? "illustrative" : "concept"} studio={id} className="absolute bottom-4 left-4" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* SERVICES — CREATE / BUILD: "Services and prices", the selector for this studio only */}
      {!beta && <PricingRegion><Packages studio={id as StudioKey} /></PricingRegion>}

      {/* RECENT WORK — real reels (CREATE) or live websites (BUILD), from data/work.ts */}
      {(id === "create" || id === "build") && <RecentWork studio={id} />}

      {/* SERVICES — GROW (beta): what is planned, no prices */}
      {beta && (
        <section id="services" data-tone="light" className="scroll-mt-16 bg-paper px-5 py-20 text-dark md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-end">
              <div>
                <Eyebrow tone="light">What we&apos;re building</Eyebrow>
                <KineticHeading text="In development." className="mt-4 text-[clamp(2rem,6vw,3.6rem)] font-extrabold leading-tight tracking-tight" />
              </div>
              <p className="max-w-xl text-[17px] leading-relaxed text-muted-dark lg:justify-self-end">
                These are the services GROW is being built around. They are not offered yet; tell us if you&apos;d like to hear when they are.
              </p>
            </div>

            <ol className="mt-12 grid gap-5">
              {planned.map((c, i) => (
                <li key={c.id} id={c.id} className="scroll-mt-24">
                  <Reveal kind={i % 2 ? "fade" : "wipe-right"}>
                    <article className="group grid overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-line transition duration-300 hover:shadow-[0_30px_70px_-45px_rgba(19,23,43,.55)] lg:grid-cols-[1.15fr_1fr]">
                      {/* what it is */}
                      <div className="flex flex-col p-6 sm:p-8">
                        <div className="flex min-h-4 items-center gap-3">
                          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet">In development</span>
                        </div>
                        <h3 className="mt-5 text-2xl font-extrabold leading-tight sm:text-[1.9rem]">{c.title}</h3>
                        <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-muted-dark">{c.summary}</p>
                        <p className="mt-5 rounded-2xl bg-paper px-4 py-3 text-[15px] leading-relaxed">
                          <span className="font-bold">Made for: </span><span className="text-muted-dark">{c.forWho}</span>
                        </p>
                        <div className="mt-auto flex flex-wrap items-center gap-3 pt-7">
                          <ButtonLink href={`/contact?service=${id}&need=${c.id}`} tone="light">I&apos;m interested <Arrow /></ButtonLink>
                        </div>
                      </div>
                      {/* what is inside */}
                      <div className="grid content-start gap-7 border-t border-line bg-paper/60 p-6 sm:grid-cols-2 sm:p-8 lg:border-l lg:border-t-0 lg:grid-cols-1">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-dark">Planned scope</p>
                          <ul className="mt-3 space-y-2.5 text-[15px]">
                            {c.items.map((it) => (<li key={it} className="flex gap-3"><span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${L.dot}`} />{it}</li>))}
                          </ul>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* HOW IT RUNS — dark */}
      <section data-tone="dark" className="bg-surface-2 px-5 py-20 text-light md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <Eyebrow>How a project runs</Eyebrow>
          <KineticHeading text="From brief" accent="to delivery." className="mt-4 text-[clamp(2rem,6vw,3.6rem)] font-extrabold leading-tight tracking-tight" />
          <ol className="mt-12 grid gap-px overflow-hidden rounded-[1.75rem] bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p, i) => (
              <li key={p.n} className="bg-surface-2 p-6 md:p-8">
                <Reveal kind="mask-up" delay={i * 0.08}>
                  <p className={`text-sm font-extrabold tabular-nums tracking-[0.2em] ${L.text}`}>{p.n}</p>
                  <h3 className="mt-3 text-2xl font-extrabold">{p.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted">{p.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
          {s.inputs && s.inputs.length > 0 && !beta && (
            <p className="mt-8 text-[15px] text-muted">To get started it helps to have: <span className="font-semibold text-light">{s.inputs.join(" · ")}</span>.</p>
          )}
        </div>
      </section>

      {/* NEXT — light, CTA + other studios */}
      <section data-tone="light" className="bg-paper px-5 py-20 text-dark md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <KineticHeading text={beta ? "Interested in GROW?" : "Have something in mind?"} className="text-[clamp(2rem,6vw,3.6rem)] font-extrabold leading-tight tracking-tight" />
            <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-muted-dark">
              {beta ? "Tell us what you'd want from it. We'll use it to shape the beta." : "Tell us what you're building, or pick your services and see the price and delivery time straight away."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={beta ? `/contact?service=${id}` : "/start-project"} tone="light">{beta ? "Tell us you're interested" : "Start a Project"} <Arrow /></ButtonLink>
              {!beta && <a href="#services" className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-ink/25 px-6 py-3 text-[15px] font-bold text-dark transition duration-200 hover:border-ink hover:bg-ink/5 active:scale-[.96]">See prices</a>}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-dark">Other studios</p>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {others.map((o) => (
                <li key={o.id}>
                  <Link href={o.href} className="group flex min-h-16 items-center justify-between gap-4 py-3">
                    <span>
                      <span className={`text-xs font-extrabold tracking-[0.3em] ${o.id === "create" ? "text-[#0e7490]" : "text-violet"}`}>{o.verb}</span>
                      <span className="block text-xl font-extrabold">{o.name}{o.beta && <span className="ml-2 align-middle text-[11px] font-bold uppercase tracking-widest text-violet">Beta</span>}</span>
                    </span>
                    <Arrow className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
