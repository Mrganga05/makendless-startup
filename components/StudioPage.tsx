import Link from "next/link";
import { studios, type StudioId } from "../data/studios";
import { process } from "../data/process";
import { BuildWorld, CreateWorld, GrowWorld } from "./studios/Worlds";
import { Arrow, BetaBadge, ButtonLink, DemoCaption, Eyebrow, KineticHeading, Reveal } from "./ui";

/* Division page (/create, /build, /grow). One template, three identities: accent colour, hero world and
   surface tint all come from the studio id. Styling is Tailwind tokens only; the hero worlds reuse the
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
              <ButtonLink href={`/contact?service=${id}`}>{beta ? "Tell us you're interested" : "Start a Project"} <Arrow /></ButtonLink>
              <ButtonLink href="#services" variant="secondary">See the {s.services.length} services</ButtonLink>
            </div>
          </div>
          <Reveal kind="clip-down" className="min-w-0">
            <div className="relative">
              <StudioWorld id={id} className="h-[300px] sm:h-[380px] lg:h-[460px]" />
              <DemoCaption kind={beta ? "illustrative" : "concept"} className="absolute bottom-4 left-4" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* SERVICES — light editorial catalogue */}
      <section id="services" data-tone="light" className="scroll-mt-16 bg-paper px-5 py-20 text-dark md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-end">
            <div>
              <Eyebrow tone="light">{beta ? "What we're building" : "The catalogue"}</Eyebrow>
              <KineticHeading text={beta ? "In development." : id === "create" ? "What we edit." : "What we build."} className="mt-4 text-[clamp(2rem,6vw,3.6rem)] font-extrabold leading-tight tracking-tight" />
            </div>
            <p className="max-w-xl text-[17px] leading-relaxed text-muted-dark lg:justify-self-end">
              {beta
                ? "These are the services GROW is being built around. They are not offered yet; tell us if you'd like to hear when they are."
                : `${s.services.length} services, ${s.services[0].code} to ${s.services[s.services.length - 1].code}. Ask for one, or describe the whole project in your brief and the scope is worked out from there.`}
            </p>
          </div>

          <ol className="mt-12 divide-y divide-line border-y border-line">
            {s.services.map((sv, i) => (
              <li key={sv.code}>
                <Reveal kind={i % 2 ? "fade" : "wipe-right"}>
                  <article className="grid gap-6 py-9 md:grid-cols-[110px_1fr] lg:grid-cols-[110px_1.1fr_1fr] lg:gap-10">
                    <p className={`text-sm font-extrabold tracking-[0.25em] ${L.text === "text-grow" ? "text-violet" : id === "create" ? "text-[#0891b2]" : "text-violet"}`}>{sv.code}</p>
                    <div>
                      <h3 className="text-2xl font-extrabold leading-tight sm:text-3xl">{sv.title}</h3>
                      {sv.summary && <p className="mt-3 max-w-lg text-[16px] leading-relaxed text-muted-dark">{sv.summary}</p>}
                      {sv.forWho && <p className="mt-4 text-[15px]"><span className="font-bold">For: </span><span className="text-muted-dark">{sv.forWho}</span></p>}
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 md:col-start-2 lg:col-start-auto">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-dark">{beta ? "Planned scope" : "Includes"}</p>
                        <ul className="mt-3 space-y-2 text-[15px]">
                          {sv.items.map((it) => (<li key={it} className="flex gap-2.5"><span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${L.dot}`} />{it}</li>))}
                        </ul>
                      </div>
                      {sv.extras && sv.extras.length > 0 && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-dark">Can be added</p>
                          <ul className="mt-3 flex flex-wrap gap-2">
                            {sv.extras.map((x) => (<li key={x} className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${L.chip}`}>{x}</li>))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>

          {s.supporting && s.supporting.length > 0 && (
            <div className="mt-12 rounded-[1.75rem] bg-white p-6 shadow-[0_20px_60px_-40px_rgba(19,23,43,.45)] ring-1 ring-line md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-dark">Alongside any service</p>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {s.supporting.map((x) => (<li key={x} className="rounded-full bg-paper px-4 py-2 text-sm font-semibold ring-1 ring-line">{x}</li>))}
              </ul>
            </div>
          )}
        </div>
      </section>

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
              {beta ? "Tell us what you'd want from it. We'll use it to shape the beta." : "Tell us what you're building. Packages show how work is organised; every project is quoted to its scope."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={`/contact?service=${id}`} tone="light">{beta ? "Tell us you're interested" : "Start a Project"} <Arrow /></ButtonLink>
              {!beta && <ButtonLink href="/#packages" variant="secondary" tone="light">See packages</ButtonLink>}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-dark">Other studios</p>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {others.map((o) => (
                <li key={o.id}>
                  <Link href={o.href} className="group flex min-h-16 items-center justify-between gap-4 py-3">
                    <span>
                      <span className={`text-xs font-extrabold tracking-[0.3em] ${o.id === "create" ? "text-[#0891b2]" : "text-violet"}`}>{o.verb}</span>
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
