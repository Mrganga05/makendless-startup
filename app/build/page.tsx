import type { Metadata } from "next";
import StudioPage from "../../components/StudioPage";
import { STUDIOS, servicesOf, studioFrom } from "../../data/pricing";
import { inr } from "../../lib/pricing";
import { pageMeta } from "../../lib/site";
import { loadContent } from "../../lib/content";

/* Title and description are written from data/pricing.ts, so they always match the service list. */
const s = STUDIOS.build;
export async function generateMetadata(): Promise<Metadata> {
  await loadContent();
  return pageMeta(`${s.verb} — ${s.name}`, `Websites and technology for businesses: ${servicesOf("build").map((x) => x.name).join(", ")}. Fixed prices from ${inr(studioFrom("build")!)}.`, "/build", { keywords: ["website development", "business website", "online store", "WhatsApp automation", "AI Assistant", "Website Care", "app development"] });
}
export default async function Page() { await loadContent(); return <StudioPage id="build" />; }
