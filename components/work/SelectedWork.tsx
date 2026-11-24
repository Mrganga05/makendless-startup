/* Homepage "Selected work" (right after "Our three studios"): the reels slider, the websites slider, then "See all work". */
import { WORK } from "../../data/work";
import { ButtonLink, Arrow, Eyebrow, KineticHeading } from "../ui";
import ReelCard from "./ReelCard";
import SiteCard from "./SiteCard";
import Slider from "./Slider";

export default function SelectedWork() {
  if (!WORK.reels.length && !WORK.sites.length) return null;
  return (
    <section id="work" data-tone="dark" aria-labelledby="work-title" className="work-band relative overflow-hidden bg-ink px-4 py-16 text-light sm:px-6 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Selected work</Eyebrow>
            <KineticHeading id="work-title" text="Real projects." accent="Made to be seen." className="mt-4 text-[clamp(2rem,6vw,3.6rem)] font-extrabold leading-[1.05] tracking-tight" />
          </div>
          <p className="max-w-sm text-[17px] leading-relaxed text-muted">Reels we edited and websites we built for real clients. Hover or tap a reel to play it.</p>
        </div>

        {WORK.reels.length > 0 && (
          <div className="mt-10 md:mt-14">
            <h3 className="work-kicker work-kicker--create">CREATE · Video editing</h3>
            <Slider kind="reel" label="Reels we edited">{WORK.reels.map((r) => <ReelCard key={r.id} reel={r} />)}</Slider>
          </div>
        )}

        {WORK.sites.length > 0 && (
          <div className="mt-12 md:mt-16">
            <h3 className="work-kicker work-kicker--build">BUILD · Websites</h3>
            <Slider kind="site" label="Websites we built">{WORK.sites.map((s) => <SiteCard key={s.id} site={s} />)}</Slider>
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <ButtonLink href="/work" size="lg">See all work <Arrow /></ButtonLink>
        </div>
      </div>
    </section>
  );
}
