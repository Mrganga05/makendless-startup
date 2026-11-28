import type { Metadata } from "next";
import { loadContent } from "../../lib/content";
import Link from "next/link";
import PageShell from "../../components/PageShell";
import { StudioWorld } from "../../components/StudioPage";
import { Arrow, BetaBadge, Reveal } from "../../components/ui";
import { studios } from "../../data/studios";
import { GrowInterested, studioFromText, studioServices } from "../../components/Studios";
import ComboPacks from "../../components/pricing/ComboPacks";
import { PricingRegion } from "../../components/pricing/state";
import { pageMeta } from "../../lib/site";
import { GROW_STATUS } from "../../data/pricing";

export const metadata: Metadata = pageMeta("Services", "All MAKENDLESS services with fixed prices: CREATE video editing, BUILD websites, automation and AI, and combo packs. GROW digital marketing: Beta - taking first clients.", "/studios", { keywords: ["MAKENDLESS services", "video editing prices", "website development prices", "WhatsApp automation", "AI Assistant", "combo packs", "digital marketing beta"] });

export default async function Page() {
  await loadContent();
  return (
    <>
    <PageShell eyebrow="Our three studios" title="Three worlds." accent="Endless possibilities." intro={`Create the content. Build the experience. Grow (${GROW_STATUS}). Each studio has its own team, tools and way of working.`} light>
      <ul className="grid gap-6 lg:grid-cols-3">
        {studios.map((s, i) => (
          <li key={s.id}>
            <Reveal kind="clip-down" delay={i * 0.1} className="h-full">
              <Link href={s.href} className="group flex h-full flex-col overflow-hidden rounded-[2rem] bg-white ring-1 ring-line transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_40px_80px_-40px_rgba(19,23,43,.5)]">
                <StudioWorld id={s.id} className="h-64 p-3 sm:h-72" />
                <div className="flex flex-1 flex-col p-6 md:p-7">
                  <div className="flex items-center gap-3">
                    <p className={`text-sm font-extrabold tracking-[0.3em] ${s.id === "create" ? "text-[#0e7490]" : "text-violet"}`}>{s.verb}</p>
                    {s.beta && <BetaBadge tone="light" />}
                    {studioFromText(s.id) && <p className="ml-auto text-sm font-extrabold text-dark">{studioFromText(s.id)}</p>}
                  </div>
                  <h2 className="mt-2 text-[1.55rem] font-extrabold leading-tight sm:text-3xl lg:text-[1.65rem] xl:text-3xl">{s.name}</h2>
                  <p className="mt-3 text-[16px] leading-relaxed text-muted-dark">{s.tagline}</p>
                  <ul className="mt-5 space-y-2 border-t border-line pt-5 text-[15px]">
                    {studioServices(s.id, (s.planned ?? []).map((sv) => sv.title)).map((sv) => (<li key={sv.name} className="flex justify-between gap-3"><span>{sv.name}</span>{sv.from && <span className="shrink-0 font-bold text-muted-dark">{sv.from}</span>}</li>))}
                  </ul>
                  <span className="mt-auto flex items-center justify-between pt-7 text-[15px] font-extrabold">
                    {`Enter the ${s.verb} studio`}
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-white transition group-hover:translate-x-1"><Arrow /></span>
                  </span>
                </div>
              </Link>
            </Reveal>
            {s.id === "grow" && <div className="stu-more"><GrowInterested /></div>}
          </li>
        ))}
      </ul>
    </PageShell>
    <PricingRegion><ComboPacks /></PricingRegion>
    </>
  );
}
