import type { Metadata } from "next";
import { loadContent } from "../../lib/content";
import StudioPage from "../../components/StudioPage";
import { pageMeta } from "../../lib/site";
export const metadata: Metadata = pageMeta("GROW — Digital Marketing (Beta)", "GROW is MAKENDLESS's digital marketing studio, in beta and taking its first clients: Meta & Google Ads from ₹12,999/month, social media management from ₹14,999/month and local business marketing from ₹7,999/month. Ad spend paid separately.", "/grow");
export default async function Page() { await loadContent(); return <StudioPage id="grow" />; }
