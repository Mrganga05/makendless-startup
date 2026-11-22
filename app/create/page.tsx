import type { Metadata } from "next";
import StudioPage from "../../components/StudioPage";
import { STUDIOS, servicesOf, studioFrom } from "../../data/pricing";
import { inr } from "../../lib/pricing";
import { pageMeta } from "../../lib/site";

/* Title and description are written from data/pricing.ts, so they always match the service list. */
const s = STUDIOS.create;
export const metadata: Metadata = pageMeta(`${s.verb} — ${s.name}`, `Video editing for creators and businesses: ${servicesOf("create").map((x) => x.name).join(", ")}. Fixed prices from ${inr(studioFrom("create")!)}.`, "/create");
export default function Page() { return <StudioPage id="create" />; }
