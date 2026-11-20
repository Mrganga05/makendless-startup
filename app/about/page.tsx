import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "../../components/PageShell";
import { ButtonLink, Arrow, BetaBadge, Eyebrow, KineticHeading, Reveal } from "../../components/ui";
import { Bullets } from "../../components/Prose";
import { LIVE_URL, NUMBERS as N, OWNER as O, WHATSAPP_HREF } from "../../data/owner";

export const metadata: Metadata = { alternates: { canonical: `${LIVE_URL}/about` }, title: "About", description: "A startup studio of creators, editors and developers making studio-quality work affordable." };

const pillars = [
  { verb: "CREATE", label: "Video Editing", href: "/create", text: "Reels and Shorts, YouTube videos, ads, podcasts, and motion graphics like logo animations, intros and thumbnails." },
  { verb: "BUILD", label: "Websites and Technology", href: "/build", text: "Business websites, online stores, booking websites, WhatsApp automation, AI chatbots and assistants, AI software and mobile apps." },
  { verb: "GROW", label: "Digital Marketing", href: "", text: "Coming soon. Not open for orders yet." },
];

const fair = [
  { title: "Fixed prices on our website", text: "No hidden quotes, and the same quality for every client." },
  { title: "Small expert team", text: "No big office or agency overheads, so you pay for the work, not the office." },
  { title: "Small changes are always free", text: "Text, images, colors and small fixes." },
  { title: "One studio for everything", text: "Videos, websites and automation work together, and combo packs save you more." },
];

const steps = [
  { n: "01", title: "Discover", text: "Pick your services on our website and tell us your requirements." },
  { n: "02", title: "Confirm", text: "We confirm the final price and delivery time on WhatsApp. You pay a 50% advance to start." },
  { n: "03", title: "Create", text: "Our team edits, builds, or both, and keeps you updated." },
  { n: "04", title: "Deliver", text: "You review the work, we make your revisions, and you pay the balance to get the final files or go live." },
];

function Buttons({ center = false }: { center?: boolean }) {
  return (
    <div className={`mt-7 flex flex-wrap gap-3 ${center ? "justify-center" : ""}`}>
      <ButtonLink href="/contact">Start a Project <Arrow /></ButtonLink>
      <ButtonLink href={WHATSAPP_HREF} variant="secondary">Chat on WhatsApp</ButtonLink>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <PageShell
        eyebrow="About"
        title="Create. Build."
        accent="Grow."
        intro={`MAKENDLESS is a creative and technology studio from ${O.city}, India. We edit videos, build websites, and set up automation and AI for creators and businesses at prices that make sense for small teams.`}
        aside={<Buttons />}
      />

      <section data-tone="light" className="bg-paper px-5 py-20 text-dark md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <Eyebrow tone="light">Our story</Eyebrow>
            <KineticHeading text="Started by a creator," accent="built for creators and businesses." accentClass="text-violet" className="mt-4 text-[clamp(2rem,5.5vw,3.4rem)] font-extrabold leading-tight tracking-tight" />
            {O.founderPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={O.founderPhoto} alt={O.founderName} className="mt-8 aspect-[4/5] w-full max-w-xs rounded-[1.75rem] object-cover ring-1 ring-line" />
            )}
          </div>
          <div className="space-y-5 text-[18px] leading-relaxed text-muted-dark">
            <p>MAKENDLESS was started by {O.founderName}, a video editor and YouTube creator. His channel, Move with Raghu, has grown to {N.subscribers} subscribers with fast, entertaining challenge videos, and through his editing studio RAQVINE he has edited videos for creators and brands.</p>
            <p>Working with creators and small businesses, he kept seeing the same problem: good agencies were too expensive, and cheap freelancers were hard to trust. MAKENDLESS is the answer: one studio for videos, websites and automation, with clear prices and the quality of a real team.</p>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-7xl gap-12 border-t border-line pt-20 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <Eyebrow tone="light">The studio</Eyebrow>
            <KineticHeading text="Small team," accent="serious craft." accentClass="text-violet" className="mt-4 text-[clamp(2rem,6vw,3.6rem)] font-extrabold leading-tight tracking-tight" />
          </div>
          <div className="space-y-5 text-[18px] leading-relaxed text-muted-dark">
            <p>We&rsquo;re a team of {N.teamSize}:</p>
            <Bullets items={[
              `**${N.editors} video editors**: reels, YouTube, ads and motion graphics`,
              `**${N.developers} web developers**: websites, automation, AI assistants and apps`,
              `**${N.clientLeads} client leads**: your single point of contact from first message to final delivery`,
            ]} />
            <p>Every project has one person responsible for it from start to finish, so you always know who to talk to.</p>
          </div>
        </div>
      </section>

      <section data-tone="dark" className="bg-surface-2 px-5 py-20 text-light md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <Eyebrow>Why our prices are fair</Eyebrow>
          <KineticHeading text="Studio quality," accent="without agency prices." className="mt-4 text-[clamp(2rem,6vw,3.6rem)] font-extrabold leading-tight tracking-tight" />
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {fair.map((f) => (
              <li key={f.title} className="border-t border-white/15 pt-6">
                <h3 className="text-xl font-extrabold">{f.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section data-tone="light" className="bg-paper px-5 py-20 text-dark md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <Eyebrow tone="light">What we do</Eyebrow>
        </div>
        <ul className="mx-auto mt-8 grid max-w-7xl gap-px overflow-hidden rounded-[2rem] bg-line md:grid-cols-3">
          {pillars.map((p, i) => (
            <li key={p.verb} className="bg-white p-7 md:p-9">
              <Reveal kind="mask-up" delay={i * 0.08}>
                <p className={`text-3xl font-extrabold tracking-[0.12em] ${p.verb === "CREATE" ? "text-[#0891b2]" : "text-violet"}`}>{p.verb}</p>
                <p className="mt-3 flex flex-wrap items-center gap-2 text-lg font-bold">{p.label}{!p.href && <BetaBadge tone="light" />}</p>
                <p className="mt-3 text-[16px] leading-relaxed text-muted-dark">{p.text}</p>
                {p.href && <Link href={p.href} className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-dark hover:text-violet">Explore {p.verb} <Arrow /></Link>}
              </Reveal>
            </li>
          ))}
        </ul>
        <figure className="mx-auto mt-20 max-w-4xl text-center">
          <Eyebrow tone="light">What we believe</Eyebrow>
          <blockquote className="mt-5 text-[clamp(1.4rem,3.2vw,2.2rem)] font-extrabold leading-snug">
            &ldquo;We&rsquo;d rather promise less and deliver well. We only offer what we can do properly, deliver on the dates we give, and tell you the price before we start.&rdquo;
          </blockquote>
        </figure>
      </section>

      <section data-tone="dark" className="bg-surface-2 px-5 py-20 text-light md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <Eyebrow>How we work</Eyebrow>
          <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((p) => (
              <li key={p.n} className="border-t border-white/15 pt-6">
                <p className="text-sm font-extrabold tabular-nums tracking-[0.2em] text-aqua-bright">{p.n}</p>
                <h2 className="mt-3 text-2xl font-extrabold">{p.title}</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{p.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-16 border-t border-white/15 pt-10">
            <Eyebrow>Where we work</Eyebrow>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#c3c8de]">Based in {O.city}, {O.state}. We work online with clients across India and abroad.</p>
          </div>
        </div>
      </section>

      <section data-tone="dark" className="relative isolate overflow-hidden bg-ink px-5 py-20 text-center text-light md:px-8 md:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(45% 70% at 85% 10%, rgba(111,69,246,.32), transparent 70%), radial-gradient(35% 50% at 5% 100%, rgba(8,187,212,.16), transparent 70%)" }} />
        <div className="mx-auto max-w-3xl">
          <KineticHeading text="Let's make something" accent="worth remembering." className="text-[clamp(2.2rem,7vw,4.2rem)] font-extrabold leading-[1.02] tracking-tight" />
          <p className="mt-5 text-lg leading-relaxed text-[#c3c8de]">Tell us what you&rsquo;re building. We&rsquo;ll reply on WhatsApp within 24 hours.</p>
          <Buttons center />
        </div>
      </section>
    </>
  );
}
