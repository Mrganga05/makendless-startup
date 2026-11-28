import type { Metadata } from "next";
import { loadContent } from "../../lib/content";
import StudioPage from "../../components/StudioPage";
import { pageMeta } from "../../lib/site";
export const metadata: Metadata = pageMeta("GROW — Digital Marketing (Beta)", "GROW digital marketing by MAKENDLESS, Beta - taking first clients. Fixed monthly prices, paid in advance: Meta Ads ₹12,999, social media ₹14,999, local marketing ₹7,999. Ad spend paid separately.", "/grow", { keywords: ["GROW digital marketing", "Meta ads management", "Google Ads management", "social media management", "local business marketing", "Google Business Profile"] });
export default async function Page() { await loadContent(); return <StudioPage id="grow" />; }
