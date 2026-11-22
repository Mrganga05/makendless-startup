import Link from "next/link";
import { studios } from "../data/site";
import { Arrow, Eyebrow, KineticHeading } from "./ui";
import Gateway from "./studios/Gateway";
import { cardPriceText, servicesOf, studioFrom, type StudioId } from "../data/pricing";
import { inr } from "../lib/pricing";
import Waitlist from "./Waitlist";

/* CREATE and BUILD cards list the current priced services; GROW (beta) keeps its plan. */
export const studioServices = (id: StudioId, fallback: string[]): { name: string; from?: string }[] => {
  const list = servicesOf(id);
  return list.length ? list.map((s) => ({ name: s.name, from: cardPriceText(s) })) : fallback.map((name) => ({ name }));
};
/** "From ₹399" for a studio (lowest price in data/pricing.ts), or undefined for GROW. */
export const studioFromText = (id: StudioId) => { const n = studioFrom(id); return n === null ? undefined : `From ${inr(n)}`; };

/* Homepage section 2 — Our Three Studios. Light editorial surface; the three gateways carry the colour. */
export default function Studios() {
  return (
    <section id="studios" data-tone="light" aria-labelledby="studios-title" className="stu relative bg-paper px-4 py-16 text-dark sm:px-5 md:px-8 md:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <header className="stu-head">
          <div>
            <Eyebrow tone="light">Our three studios</Eyebrow>
            <KineticHeading id="studios-title" text="Three worlds." accent="Endless possibilities." accentClass="stu-accent" className="stu-title mt-4 font-extrabold" />
          </div>
          <div className="stu-intro">
            <p className="text-[15px] leading-relaxed text-muted-dark md:text-base">
              Create the content. Build the experience. Grow, in beta. Each studio is its own world, so step into the one you need.
            </p>
            <Link href="/studios" className="stu-all group mt-2 inline-flex min-h-11 items-center gap-2 text-[15px] font-bold text-dark">
              <span className="stu-all-label">Compare all three studios</span>
              <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </header>

        <ul className="stu-list">
          {studios.map((s, i) => (
            <Gateway key={s.id} id={s.id} verb={s.verb} name={s.name} href={s.href} beta={!!s.beta} index={i} from={studioFromText(s.id)} services={studioServices(s.id, (s.planned ?? []).map((x) => x.title))}
              after={s.id === "grow" ? <div className="stu-more"><Waitlist compact /></div> : undefined} />
          ))}
        </ul>
      </div>
    </section>
  );
}
