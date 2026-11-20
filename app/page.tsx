import Hero from "../components/Hero";
import Studios from "../components/Studios";
import OurWork from "../components/OurWork";
import Solutions from "../components/Solutions";
import Packages from "../components/Packages";
import ComboPacks from "../components/pricing/ComboPacks";
import { COMBOS_ENABLED } from "../data/pricing";
import { PricingRegion } from "../components/pricing/state";
import ProcessFaq from "../components/ProcessFaq";
import FinalCta from "../components/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <Studios />
      <OurWork />
      <Solutions />
      <PricingRegion>
        <Packages />
        {COMBOS_ENABLED && <ComboPacks />}
      </PricingRegion>
      <ProcessFaq />
      <FinalCta />
    </>
  );
}
