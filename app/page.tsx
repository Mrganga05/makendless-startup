import Hero from "../components/Hero";
import Studios from "../components/Studios";
import SelectedWork from "../components/work/SelectedWork";
import Solutions from "../components/Solutions";
import { ReferSection } from "../components/pricing/ReferEarn";
import ProcessFaq from "../components/ProcessFaq";
import FinalCta from "../components/FinalCta";
import Reviews from "../components/Reviews";
import { loadContent } from "../lib/content";

export default async function Home() {
  await loadContent();
  return (
    <>
      <Hero />
      <Studios />
      <SelectedWork />
      <Reviews />
      <Solutions />
      {/* Services and prices live on /create and /build only. */}
      <ReferSection />
      <ProcessFaq />
      <FinalCta />
    </>
  );
}
