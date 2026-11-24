import Hero from "../components/Hero";
import Studios from "../components/Studios";
import SelectedWork from "../components/work/SelectedWork";
import Solutions from "../components/Solutions";
import { ReferSection } from "../components/pricing/ReferEarn";
import ProcessFaq from "../components/ProcessFaq";
import FinalCta from "../components/FinalCta";
import Testimonials from "../components/Testimonials";
import { loadContent } from "../lib/content";

export default async function Home() {
  await loadContent();
  return (
    <>
      <Hero />
      <Studios />
      <SelectedWork />
      <Solutions />
      {/* Services and prices live on /create and /build only. */}
      <ReferSection />
      {/* Hidden until the first testimonial is added (data/work.ts REVIEWS or /admin). */}
      <Testimonials />
      <ProcessFaq />
      <FinalCta />
    </>
  );
}
