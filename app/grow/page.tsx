import type { Metadata } from "next";
import StudioPage from "../../components/StudioPage";
import { pageMeta } from "../../lib/site";
export const metadata: Metadata = pageMeta("GROW — Digital Marketing (Beta)", "GROW is MAKENDLESS's digital marketing studio, currently in beta: Meta and Google Ads, social media management and local presence. Not offered yet; register your interest.", "/grow");
export default function Page() { return <StudioPage id="grow" />; }
