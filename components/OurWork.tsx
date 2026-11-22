/* Homepage "Our work": real projects from data/work.ts. Hidden until links exist. */
import { hasWork, WORK } from "../data/work";
import { Eyebrow, KineticHeading } from "./ui";

export default function OurWork() {
  if (!hasWork()) return null;
  return (
    <section id="work" data-tone="light" aria-labelledby="work-title" className="bg-white px-4 py-16 text-dark sm:px-6 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <Eyebrow tone="light">Portfolio</Eyebrow>
        <KineticHeading id="work-title" text="Our work" className="mt-4 text-[clamp(2rem,6vw,3.6rem)] font-extrabold leading-tight tracking-tight" />
        <p className="mt-3 max-w-xl text-[17px] text-muted-dark">Real projects from the MAKENDLESS team.</p>
        {WORK.reels.length > 0 && (
          <>
            <h3 className="mt-10 text-sm font-extrabold tracking-[0.3em] text-[#0891b2]">CREATE</h3>
            <ul className="mt-4 flex snap-x gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible">
              {WORK.reels.map((r) => (
                <li key={r.url} className="w-[62vw] shrink-0 snap-start sm:w-auto">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="group relative block aspect-[9/16] overflow-hidden rounded-[1.5rem] bg-ink text-white ring-1 ring-line">
                    {r.cover && <img src={r.cover} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-[15px] font-bold">{r.title || "Watch on Instagram"} ↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
        {WORK.sites.length > 0 && (
          <>
            <h3 className="mt-10 text-sm font-extrabold tracking-[0.3em] text-violet">BUILD</h3>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {WORK.sites.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-[1.5rem] bg-paper ring-1 ring-line">
                    {s.image && <img src={s.image} alt={`${s.name} website`} loading="lazy" className="aspect-[16/10] w-full object-cover" />}
                    <span className="flex items-center justify-between p-5 font-extrabold"><span>{s.name}</span><span className="text-violet">Visit site ↗</span></span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
