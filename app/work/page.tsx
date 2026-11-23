import type { Metadata } from "next";
import PageShell from "../../components/PageShell";
import WorkBrowser from "../../components/work/WorkBrowser";
import { ButtonLink, Arrow } from "../../components/ui";
import { WORK } from "../../data/work";
import { pageMeta } from "../../lib/site";

export const metadata: Metadata = pageMeta(
  "Our Work",
  `Real projects by MAKENDLESS: ${WORK.reels.length} edited reels (podcast, motion graphics, documentary, fast-paced) and ${WORK.sites.length} live websites built for real businesses.`,
  "/work",
);

export default function WorkPage() {
  return (
    <>
      <PageShell eyebrow="Our work" title="Real projects." accent="Made to be seen." intro="Reels we edited and websites we built. Everything here is real client work or our own live website. Concept visuals elsewhere on the site are marked as demos.">
        <WorkBrowser />
      </PageShell>
      <section data-tone="light" className="bg-paper px-5 py-16 text-dark md:px-8 md:py-24">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-[clamp(1.8rem,5vw,3rem)] font-extrabold leading-tight tracking-tight">Want work like this?</h2>
            <p className="mt-2 max-w-lg text-[17px] text-muted-dark">Pick your services, see the price straight away, and we confirm everything on WhatsApp within 24 hours.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/start-project" tone="light">Start a Project <Arrow /></ButtonLink>
            <ButtonLink href="/studios" variant="secondary" tone="light">See services and prices</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
