/* Division page (CREATE / BUILD / GROW). One shared structure, three identities:
   1 hero in the division's world with a living CSS visual · 2 the service catalogue · 3 how a project runs ·
   4 packages + call to action. GROW is in beta, so its page shows what is being built, not a service list.
   Styles: app/styles/pages.css. No 3D here (CSS / SVG only). */
import Link from "next/link";
import { growPreview, packages } from "../data/packages";
import { faqs } from "../data/process";
import { studios, type Studio, type StudioId, type StudioService } from "../data/studios";
import { Arrow, BetaBadge, ButtonLink, KineticHeading, Reveal } from "./ui";
import { ScrollVar } from "./pages/Live";
import { Crumbs, Label, ProcessSteps, ServiceGlyph, StudioSwitch, type Tone } from "./pages/parts";
import { StudioVisual } from "./pages/visuals";

type Copy = {
  h1: [string, string];
  heroTone: Tone; heroBg: string;
  catTone: Tone; catBg: string; catTitle: [string, string]; catIntro: string; rowReveal: "wipe-right" | "scale-in";
  runTone: Tone; runBg: string; runTitle: [string, string]; runIntro: string; needLabel: string; addLabel: string;
  formats: { label: string; cls: string }[]; formatsNote: string;
  endTone: Tone; endBg: string; pkgIntro: string; ctaTitle: [string, string]; ctaText: string;
};

const COPY: Record<"create" | "build", Copy> = {
  create: {
    h1: ["Video", "Editing"],
    heroTone: "dark", heroBg: "bg-ink-deep text-light",
    catTone: "light", catBg: "bg-paper text-dark", catTitle: ["What we", "edit."], rowReveal: "wipe-right",
    catIntro: "Five services, V1 to V5. Ask for one, or describe the whole project in your brief and the scope is worked out from there.",
    runTone: "dark", runBg: "bg-surface-2 text-light", runTitle: ["How a video project", "runs."],
    runIntro: "The same four steps as every MAKENDLESS project, applied to an edit.",
    needLabel: "What we usually need", addLabel: "Can be added to an edit",
    formats: [{ label: "9:16", cls: "pag-fmt--tall" }, { label: "1:1", cls: "pag-fmt--square" }, { label: "16:9", cls: "pag-fmt--wide" }],
    formatsNote: "One edit can be exported in more than one aspect ratio.",
    endTone: "light", endBg: "bg-paper-2 text-dark",
    pkgIntro: "Package structures show how video work is usually organised. None has a published price: every project is quoted.",
    ctaTitle: ["Have footage?", "Send the brief."], ctaText: "Tell us what you are making and where it will be published. The project form opens with Video Editing selected.",
  },
  build: {
    h1: ["Website", "Development"],
    heroTone: "light", heroBg: "bg-paper text-dark",
    catTone: "dark", catBg: "bg-ink text-light", catTitle: ["What we", "build."], rowReveal: "scale-in",
    catIntro: "Five services, T1 to T5. Ask for one, or describe the whole project in your brief and the scope is worked out from there.",
    runTone: "light", runBg: "bg-paper text-dark", runTitle: ["How a website project", "runs."],
    runIntro: "The same four steps as every MAKENDLESS project, applied to a build.",
    needLabel: "What we usually need", addLabel: "Can be added to a build",
    formats: [{ label: "Phone", cls: "pag-fmt--tall" }, { label: "Tablet", cls: "pag-fmt--tab" }, { label: "Desktop", cls: "pag-fmt--wide" }],
    formatsNote: "Layouts are designed for phone, tablet and desktop widths.",
    endTone: "dark", endBg: "bg-violet text-white",
    pkgIntro: "Package structures show how website work is usually organised. None has a published price: every project is quoted.",
    ctaTitle: ["Have a site in mind?", "Send the brief."], ctaText: "Tell us what the website has to do and who it is for. The project form opens with Website Development selected.",
  },
};

const needNote = "The exact list is decided per project.";

function ServiceRow({ sv, reveal }: { sv: StudioService; reveal: Copy["rowReveal"] }) {
  return (
    <article id={sv.code.toLowerCase()} className="pag-svc" aria-labelledby={`${sv.code}-t`}>
      <Reveal kind={reveal} className="pag-svc-in">
        <p className="pag-svc-code" aria-hidden="true">{sv.code}</p>
        <div className="pag-svc-main">
          <div className="pag-svc-top">
            <h3 id={`${sv.code}-t`} className="pag-svc-t"><span className="sr-only">{sv.code}: </span>{sv.title}</h3>
            <ServiceGlyph code={sv.code} />
          </div>
          {sv.summary && <p className="pag-svc-sum">{sv.summary}</p>}
          <dl className="pag-svc-cols">
            <div>
              <dt>Includes</dt>
              <dd><ul className="pag-ticks">{sv.items.map((it) => <li key={it}>{it}</li>)}</ul></dd>
            </div>
            <div>
              {sv.forWho && <><dt>Made for</dt><dd>{sv.forWho}</dd></>}
              {!!sv.extras?.length && (
                <>
                  <dt className="pag-svc-dt2">Can be added</dt>
                  <dd><ul className="pag-chips">{sv.extras.map((x) => <li key={x}>{x}</li>)}</ul></dd>
                </>
              )}
            </div>
          </dl>
        </div>
      </Reveal>
    </article>
  );
}

function OpenStudio({ s }: { s: Studio }) {
  const id = s.id as "create" | "build";
  const c = COPY[id];
  const pk = packages[id];
  const contact = `/contact?service=${id}`;
  const mute = (t: Tone) => (t === "dark" ? "text-muted" : "text-muted-dark");
  return (
    <>
      {/* 1 — hero */}
      <section id="intro" data-tone={c.heroTone} aria-labelledby="page-title" className={`pag-band pag-hero pag-hero--${id} pag-${id} ${c.heroBg} px-5 pb-16 pt-24 md:px-8 md:pb-24 md:pt-32`}>
        <span className="pag-hero-art" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <Crumbs items={[{ label: "Studios", href: "/studios" }, { label: s.verb }]} />
          <div className="pag-hero-grid">
            <div className="min-w-0">
              <p className="pag-verb"><span className="pag-verb-mark" aria-hidden="true" />{s.verb} <span className="pag-verb-sub">studio</span></p>
              <KineticHeading as="h1" id="page-title" text={c.h1[0]} accent={c.h1[1]} accentClass="pag-acc" className="pag-h1 mt-4 font-extrabold" />
              <Reveal kind="fade" delay={0.25}>
                <p className={`mt-6 max-w-xl text-lg leading-relaxed ${mute(c.heroTone)}`}>{s.lead}</p>
              </Reveal>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={contact} tone={c.heroTone}>Start a Project<Arrow /></ButtonLink>
                <ButtonLink href="#services" tone={c.heroTone} variant="secondary">See the {s.services.length} services</ButtonLink>
              </div>
            </div>
            <Reveal kind={id === "create" ? "clip-down" : "scale-in"} delay={0.1} className="pag-hero-vis">
              <StudioVisual id={id} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 2 — catalogue */}
      <section id="services" data-tone={c.catTone} aria-labelledby="services-title" className={`pag-band pag-cat pag-cat--${id} pag-${id} ${c.catBg} px-5 py-16 md:px-8 md:py-24`}>
        <div className="pag-cat-grid mx-auto max-w-7xl">
          <header className="pag-cat-head">
            <Label>The catalogue</Label>
            <KineticHeading id="services-title" text={c.catTitle[0]} accent={c.catTitle[1]} accentClass="pag-acc" className="pag-h2 mt-4 font-extrabold" />
            <p className={`mt-5 max-w-md text-base leading-relaxed ${mute(c.catTone)}`}>{c.catIntro}</p>
            <nav aria-label="Services on this page" className="pag-cat-index">
              <ol>
                {s.services.map((sv) => (
                  <li key={sv.code}><a href={`#${sv.code.toLowerCase()}`}><span className="pag-cat-index-code">{sv.code}</span><span>{sv.title}</span></a></li>
                ))}
              </ol>
            </nav>
          </header>
          <ScrollVar className="pag-cat-list" start={0.6} end={0.6}>
            <span className="pag-cat-rail" aria-hidden="true"><span className="pag-cat-playhead" /></span>
            {s.services.map((sv) => <ServiceRow key={sv.code} sv={sv} reveal={c.rowReveal} />)}
          </ScrollVar>
        </div>
      </section>

      {/* 3 — how a project runs */}
      <section id="process" data-tone={c.runTone} aria-labelledby="process-title" className={`pag-band pag-run pag-run--${id} pag-${id} ${c.runBg} px-5 py-16 md:px-8 md:py-24`}>
        <div className="mx-auto max-w-7xl">
          <header className="grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-end md:gap-12">
            <div>
              <Label>How it runs</Label>
              <KineticHeading id="process-title" text={c.runTitle[0]} accent={c.runTitle[1]} accentClass="pag-acc" className="pag-h2 mt-4 font-extrabold" />
            </div>
            <p className={`max-w-md text-base leading-relaxed ${mute(c.runTone)}`}>
              {c.runIntro} <Link href="/#process" className="pag-link">See how we work</Link>
            </p>
          </header>
          <ProcessSteps className="mt-12 md:mt-16" />
          <div className="pag-run-extra">
            <Reveal kind="fade" className="pag-run-card">
              <Label>{c.needLabel}</Label>
              <ul className="pag-need">{s.inputs?.map((x, i) => <li key={x} style={{ ["--i" as string]: i }}>{x}</li>)}</ul>
              <p className={`mt-4 text-sm leading-relaxed ${mute(c.runTone)}`}>{needNote}</p>
            </Reveal>
            <Reveal kind="fade" delay={0.12} className="pag-run-card">
              <Label>{c.addLabel}</Label>
              <ul className="pag-chips mt-4">{s.supporting?.map((x) => <li key={x}>{x}</li>)}</ul>
              <div className="pag-fmts" aria-hidden="true">
                {c.formats.map((f) => <span key={f.label} className={`pag-fmt ${f.cls}`}><b>{f.label}</b></span>)}
              </div>
              <p className={`mt-3 text-sm leading-relaxed ${mute(c.runTone)}`}>{c.formatsNote}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4 — packages + call to action */}
      <section id="start" data-tone={c.endTone} aria-labelledby="start-title" className={`pag-band pag-end pag-end--${id} pag-${id} ${c.endBg} px-5 py-16 md:px-8 md:py-24`}>
        <span className="pag-end-art" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
            <div>
              <Label>Packages</Label>
              <h2 className="pag-h3 mt-4 font-extrabold">Find your starting point.</h2>
              <p className="pag-end-mute mt-4 max-w-md text-base leading-relaxed">{c.pkgIntro}</p>
              <Link href="/#packages" className="pag-arrowlink mt-3">Compare packages on the homepage<Arrow /></Link>
            </div>
            <ul className="pag-pk">
              {pk.map((p, i) => (
                <Reveal as="li" key={p.slug} kind="fade" delay={i * 0.06}>
                  <Link href={`${contact}&package=${p.slug}`} className="pag-pk-link">
                    <span className="pag-pk-name">{p.name}</span>
                    <span className="pag-pk-for">{p.for}</span>
                    <span className="pag-pk-go">Request quote<span className="sr-only"> for the {p.name} package</span><Arrow /></span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
          <div className="pag-end-cta">
            <KineticHeading id="start-title" text={c.ctaTitle[0]} accent={c.ctaTitle[1]} accentClass="pag-acc" className="pag-h2 pag-h2--xl font-extrabold" />
            <div className="mt-7 grid gap-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <p className="pag-end-mute max-w-xl text-lg leading-relaxed">{c.ctaText}</p>
              <ButtonLink href={contact} tone={c.endTone} size="lg">Start a Project<Arrow /></ButtonLink>
            </div>
          </div>
          <StudioSwitch current={id} />
        </div>
      </section>
    </>
  );
}

/* GROW — in development. Nothing on this page is offered for sale. */
function BetaStudio({ s }: { s: Studio }) {
  const contact = growPreview.cta.href;
  const support = faqs.find((f) => f.q.toLowerCase().includes("ongoing support"));
  const status: { t: string; x: string }[] = [
    { t: "Not on sale", x: "There are no marketing packages, campaigns or prices to request today." },
    { t: "No results shown", x: "This page shows no performance numbers and makes no promise about leads, sales or return on ad spend. Its visuals are illustrative demos." },
    { t: "What you can do", x: `Tell us you're interested. ${growPreview.cta.note}` },
  ];
  return (
    <>
      <section id="intro" data-tone="dark" aria-labelledby="page-title" className="pag-band pag-hero pag-hero--grow pag-grow bg-surface-2 px-5 pb-16 pt-24 text-light md:px-8 md:pb-24 md:pt-32">
        <span className="pag-hero-art" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <Crumbs items={[{ label: "Studios", href: "/studios" }, { label: `${s.verb} (Beta)` }]} />
          <div className="pag-hero-grid">
            <div className="min-w-0">
              <p className="pag-verb"><span className="pag-verb-mark" aria-hidden="true" />{s.verb} <span className="pag-verb-sub">studio</span><BetaBadge className="ml-1" label="Beta · in development" /></p>
              <KineticHeading as="h1" id="page-title" text={s.name} accent="Beta" accentClass="pag-h1-beta" className="pag-h1 mt-4 font-extrabold" />
              <Reveal kind="fade" delay={0.25}>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{s.lead}</p>
              </Reveal>
              <p className="pag-notice mt-6"><span className="pag-notice-dot" aria-hidden="true" /><span><strong>Paid marketing services are not offered yet.</strong> Video editing and website development are open today.</span></p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={contact}>{growPreview.cta.label}<Arrow /></ButtonLink>
                <ButtonLink href="#services" variant="secondary">See what is being built</ButtonLink>
              </div>
            </div>
            <Reveal kind="fade" delay={0.1} className="pag-hero-vis">
              <StudioVisual id="grow" />
            </Reveal>
          </div>
        </div>
      </section>

      <section id="services" data-tone="light" aria-labelledby="services-title" className="pag-band pag-dev pag-grow bg-paper px-5 py-16 text-dark md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <header className="grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-end md:gap-12">
            <div>
              <Label>In development</Label>
              <KineticHeading id="services-title" text="What is being" accent="built." accentClass="pag-acc" className="pag-h2 mt-4 font-extrabold" />
            </div>
            <p className="max-w-md text-base leading-relaxed text-muted-dark">{growPreview.summary} These three areas, M1 to M3, are what the studio is being built around.</p>
          </header>
          <ul className="pag-dev-list">
            {s.services.map((sv, i) => (
              <li key={sv.code} id={sv.code.toLowerCase()} className="pag-dev-item" style={{ ["--i" as string]: i }}>
                <Reveal kind="scale-in" delay={i * 0.12} className="pag-dev-card">
                  <div className="pag-dev-top">
                    <span className="pag-dev-code" aria-hidden="true">{sv.code}</span>
                    <span className="pag-dev-tag">In development</span>
                  </div>
                  <ServiceGlyph code={sv.code} />
                  <h3 className="pag-dev-t"><span className="sr-only">{sv.code}: </span>{sv.title}</h3>
                  <p className="pag-dev-sum">{sv.summary}</p>
                  <p className="pag-dev-k">Planned scope</p>
                  <ul className="pag-ticks">{sv.items.map((it) => <li key={it}>{it}</li>)}</ul>
                  <p className="pag-dev-for">{sv.forWho}</p>
                </Reveal>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted-dark">Planned scope describes what we are preparing. It is not a list of services you can order, and it may change before the studio opens.</p>
        </div>
      </section>

      <section id="status" data-tone="dark" aria-labelledby="status-title" className="pag-band pag-status pag-grow bg-ink px-5 py-16 text-light md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <Label>Where it stands</Label>
          <KineticHeading id="status-title" text="Said" accent="plainly." accentClass="pag-acc" className="pag-h2 mt-4 font-extrabold" />
          <ol className="pag-status-list">
            {status.map((st, i) => (
              <Reveal as="li" key={st.t} kind="clip-down" delay={i * 0.1}>
                <div className="pag-status-item">
                  <span className="pag-status-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="pag-status-t">{st.t}</h3>
                  <p className="pag-status-x">{st.x}</p>
                </div>
              </Reveal>
            ))}
          </ol>
          {support && <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted">Looking for something available now? {support.a.replace(" Digital marketing is still in beta.", "")}</p>}
        </div>
      </section>

      <section id="start" data-tone="light" aria-labelledby="start-title" className="pag-band pag-end pag-end--grow pag-grow bg-paper-2 px-5 py-16 text-dark md:px-8 md:py-24">
        <span className="pag-end-art" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <KineticHeading id="start-title" text="Would marketing support" accent="help you?" accentClass="pag-acc" className="pag-h2 pag-h2--xl font-extrabold" />
          <div className="mt-7 grid gap-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <p className="pag-end-mute max-w-xl text-lg leading-relaxed">If so, say what you would want from it in a short brief. {growPreview.cta.note}</p>
            <ButtonLink href={contact} tone="light" size="lg">{growPreview.cta.label}<Arrow /></ButtonLink>
          </div>
          <StudioSwitch current="grow" />
        </div>
      </section>
    </>
  );
}

export default function StudioPage({ id }: { id: StudioId }) {
  const s = studios.find((x) => x.id === id)!;
  return s.beta ? <BetaStudio s={s} /> : <OpenStudio s={s} />;
}
