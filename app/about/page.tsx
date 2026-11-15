import type { Metadata } from "next";
import PageShell from "../../components/PageShell";
import { ButtonLink, Arrow, Eyebrow, KineticHeading, Reveal } from "../../components/ui";
import { process } from "../../data/process";

export const metadata: Metadata = { alternates: { canonical: "/about" }, title: "About", description: "MAKENDLESS is a small creative and technology studio: video editing, website development and, in beta, digital marketing." };

const pillars = [
  { verb: "CREATE", color: "text-create", text: "Visual content that holds attention: short-form, long-form, promotional video and motion graphics." },
  { verb: "BUILD", color: "text-build", text: "Websites that are attractive and genuinely functional: fast, responsive, accessible and easy to maintain." },
  { verb: "GROW", color: "text-grow", text: "Helping businesses improve their digital presence. In beta while we build these skills properly." },
];

export default function Page() {
  return (
    <>
      <PageShell eyebrow="About" title="Create. Build." accent="Grow." intro="MAKENDLESS is a small creative and technology studio. We edit video, build websites and are developing digital marketing as a beta." />
      <section data-tone="light" className="bg-paper px-5 py-20 text-dark md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <Eyebrow tone="light">The studio</Eyebrow>
            <KineticHeading text="Small team," accent="serious craft." accentClass="text-violet" className="mt-4 text-[clamp(2rem,6vw,3.6rem)] font-extrabold leading-tight tracking-tight" />
          </div>
          <div className="space-y-5 text-[18px] leading-relaxed text-muted-dark">
            <p>We are a small team of video editors, web developers and client leads. Every project has one person responsible for it from the first brief to the final delivery.</p>
            <p>We would rather promise less and deliver well. Services are offered only where we can do them properly, which is why digital marketing is still in beta.</p>
          </div>
        </div>
        <ul className="mx-auto mt-16 grid max-w-7xl gap-px overflow-hidden rounded-[2rem] bg-line md:grid-cols-3">
          {pillars.map((p, i) => (
            <li key={p.verb} className="bg-white p-7 md:p-9">
              <Reveal kind="mask-up" delay={i * 0.08}>
                <p className={`text-3xl font-extrabold tracking-[0.12em] ${p.color === "text-create" ? "text-[#0891b2]" : "text-violet"}`}>{p.verb}</p>
                <p className="mt-4 text-[16px] leading-relaxed text-muted-dark">{p.text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
      <section data-tone="dark" className="bg-surface-2 px-5 py-20 text-light md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <Eyebrow>How we work</Eyebrow>
          <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p) => (
              <li key={p.n} className="border-t border-white/15 pt-6">
                <p className="text-sm font-extrabold tabular-nums tracking-[0.2em] text-aqua-bright">{p.n}</p>
                <h2 className="mt-3 text-2xl font-extrabold">{p.title}</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{p.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14 flex flex-wrap gap-3">
            <ButtonLink href="/contact">Start a Project <Arrow /></ButtonLink>
            <ButtonLink href="/studios" variant="secondary">Explore Studios</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
