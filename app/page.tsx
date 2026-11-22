import Hero from "../components/Hero";
import Studios from "../components/Studios";
import OurWork from "../components/OurWork";
import Solutions from "../components/Solutions";
import { ReferSection } from "../components/pricing/ReferEarn";
import ProcessFaq from "../components/ProcessFaq";
import FinalCta from "../components/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <Studios />
      <OurWork />
      <Solutions />
      {/* Services and prices live on /create and /build only. */}
      <ReferSection />
      <ProcessFaq />
      <FinalCta />
    </>
  );
}
