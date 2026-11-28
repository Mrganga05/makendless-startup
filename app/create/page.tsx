import type { Metadata } from "next";
import StudioPage from "../../components/StudioPage";
import { STUDIOS, servicesOf, studioFrom } from "../../data/pricing";
import { inr } from "../../lib/pricing";
import { pageMeta } from "../../lib/site";
import { loadContent } from "../../lib/content";

/* Title and description are written from data/pricing.ts, so they always match the service list. */
const s = STUDIOS.create;
export async function generateMetadata(): Promise<Metadata> {
  await loadContent();
  return pageMeta(`${s.verb} — ${s.name}`, `Video editing for creators and businesses: ${servicesOf("create").map((x) => x.name).join(", ")}. Fixed prices from ${inr(studioFrom("create")!)}.`, "/create", { keywords: ["video editing", "Reels and Shorts editing", "YouTube video editing", "motion graphics", "thumbnail design", "video editing prices"] });
}
export default async function Page() { await loadContent(); return <StudioPage id="create" />; }
