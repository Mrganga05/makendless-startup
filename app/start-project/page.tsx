import type { Metadata } from "next";
import { loadContent } from "../../lib/content";
import StartProject from "../../components/pricing/StartProject";
import { Eyebrow } from "../../components/ui";
import { pageMeta } from "../../lib/site";

export const metadata: Metadata = pageMeta("Start a Project", "Your selected services, estimated total and delivery time. Send it and we'll message you on WhatsApp within 24 hours.", "/start-project", { robots: { index: false, follow: true } });

export default async function Page() {
  await loadContent();
  return (
    <>
      <section data-tone="dark" className="for-hero relative overflow-hidden bg-ink px-5 pb-12 pt-28 md:px-8 md:pb-16 md:pt-36">
        <div className="for-hero-beam" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <Eyebrow>Final step</Eyebrow>
          <h1 className="for-h1 mt-5 font-extrabold text-light">Start a <span className="prism-text">Project</span></h1>
        </div>
      </section>
      <section data-tone="light" className="bg-paper px-5 py-12 text-dark md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl"><StartProject /></div>
      </section>
    </>
  );
}
