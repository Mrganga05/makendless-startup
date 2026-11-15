import type { Metadata } from "next";
import BriefForm from "../../components/form/BriefForm";
import { initialFromParams } from "../../components/form/brief";
import { Eyebrow } from "../../components/ui";
import { CONTACT_EMAIL } from "../../lib/site";
import { readSimulate } from "../../lib/submit-brief";

export const metadata: Metadata = { alternates: { canonical: "/contact" },
  title: "Start a Project",
  description: "Tell MAKENDLESS what you're building. Write a short project brief for video editing or website development, or register interest in the marketing beta.",
};

type Params = Record<string, string | string[] | undefined>;
const H1 = ["Let's", "make", "something"];
const H1_ACCENT = ["worth", "remembering."];
const STEPS = [
  { n: "01", title: "Write it", text: "Who you are, which studio, what you need." },
  { n: "02", title: "Review it", text: "See the finished brief before anything else happens." },
  { n: "03", title: "Take it with you", text: CONTACT_EMAIL ? "Copy it, download it, or open it as an email draft." : "Copy it or download it as a text file." },
];

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const initial = initialFromParams(params);
  // Dev-only test switch (?simulate=error | delivered). Ignored in production. See lib/submit-brief.ts.
  const simulate = readSimulate(Array.isArray(params.simulate) ? params.simulate[0] : params.simulate);
  return (
    <>
      <section id="brief-intro" data-tone="dark" className="for-hero relative overflow-hidden bg-ink px-5 pb-14 pt-28 md:px-8 md:pb-20 md:pt-36">
        <div className="for-hero-beam" aria-hidden="true" />
        <div className="for-hero-frame" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <Eyebrow>Start a project</Eyebrow>
          {/* Server-rendered kinetic headline (CSS only, so it reads before hydration). */}
          <h1 aria-label={`${H1.join(" ")} ${H1_ACCENT.join(" ")}`} className="for-h1 mt-5 font-extrabold text-light">
            {[...H1.map((w) => ({ w, a: false })), ...H1_ACCENT.map((w) => ({ w, a: true }))].map((x, i) => (
              <span key={i} aria-hidden="true" className="for-h1-word" style={{ ["--i" as string]: i }}><span className={x.a ? "prism-text" : undefined}>{x.w}</span></span>
            ))}
          </h1>
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:items-end lg:gap-16">
            <div>
              <p className="max-w-md text-lg leading-relaxed text-muted">Tell us what you&apos;re building. We&apos;ll help you take the next step.</p>
              <p className="for-hero-notice mt-6">
                <span className="for-hero-notice-dot" aria-hidden="true" />
                <span>Online sending is still being set up. Nothing on this page is sent to us yet, so you write your brief here and take it with you.</span>
              </p>
            </div>
            <ol className="for-hero-steps grid grid-cols-3 gap-3 sm:gap-6">
              {STEPS.map((s, i) => (
                <li key={s.n} className="for-hero-step" style={{ ["--i" as string]: i }}>
                  <span className="for-hero-step-line" aria-hidden="true" />
                  <span className="text-xs font-bold tabular-nums tracking-[0.2em] text-aqua-bright">{s.n}</span>
                  <span className="mt-1 block text-sm font-extrabold leading-snug text-light sm:text-base">{s.title}</span>
                  <span className="mt-1 hidden text-sm leading-relaxed text-muted sm:block">{s.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
      <section id="brief" data-tone="light" className="for-work bg-paper px-5 py-14 text-dark md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <BriefForm initial={initial} simulate={simulate} />
        </div>
      </section>
    </>
  );
}
