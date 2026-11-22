import type { Metadata } from "next";
import StudioPage from "../../components/StudioPage";
import { STUDIOS, servicesOf, studioFrom } from "../../data/pricing";
import { inr } from "../../lib/pricing";
import { pageMeta } from "../../lib/site";

/* Title and description are written from data/pricing.ts, so they always match the service list. */
const s = STUDIOS.build;
export const metadata: Metadata = pageMeta(`${s.verb} — ${s.name}`, `Websites and technology for businesses: ${servicesOf("build").map((x) => x.name).join(", ")}. Fixed prices from ${inr(studioFrom("build")!)}.`, "/build");
export default function Page() { return <StudioPage id="build" />; }
