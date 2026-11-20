import Hero from "../components/Hero";
import Studios from "../components/Studios";
import Solutions from "../components/Solutions";
import Packages from "../components/Packages";
import ComboPacks from "../components/pricing/ComboPacks";
import ReferEarn from "../components/pricing/ReferEarn";
import { PricingRegion } from "../components/pricing/state";
import ProcessFaq from "../components/ProcessFaq";
import FinalCta from "../components/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <Studios />
      <Solutions />
      <PricingRegion>
        <Packages />
        <ComboPacks />
      </PricingRegion>
      <ReferEarn />
      <ProcessFaq />
      <FinalCta />
    </>
  );
}
