/* "Recent work" on /create (reels) and /build (websites). */
import Link from "next/link";
import { WORK } from "../../data/work";
import { Arrow, Eyebrow, KineticHeading } from "../ui";
import ReelStrip from "./ReelStrip";
import SiteCard from "./SiteCard";

export default function RecentWork({ studio }: { studio: "create" | "build" }) {
  const create = studio === "create";
  if (create ? !WORK.reels.length : !WORK.sites.length) return null;
  return (
    <section id="recent-work" data-tone="dark" aria-labelledby="recent-work-title" className="work-band relative overflow-hidden bg-ink-deep px-4 py-16 text-light sm:px-6 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>{create ? "CREATE · Real edits" : "BUILD · Live websites"}</Eyebrow>
            <KineticHeading id="recent-work-title" text="Recent work" className="mt-4 text-[clamp(2rem,6vw,3.6rem)] font-extrabold leading-tight tracking-tight" />
          </div>
          <Link href={`/work?type=${studio}`} className="inline-flex min-h-11 items-center gap-2 font-bold text-aqua-bright underline decoration-2 underline-offset-4 hover:text-white">
            See all work <Arrow />
          </Link>
        </div>
        {create ? (
          <div className="mt-8"><ReelStrip reels={WORK.reels} label="Reels we edited" /></div>
        ) : (
          <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {WORK.sites.map((s) => <li key={s.id}><SiteCard site={s} /></li>)}
          </ul>
        )}
      </div>
    </section>
  );
}
