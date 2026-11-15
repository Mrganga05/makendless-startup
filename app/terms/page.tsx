import type { Metadata } from "next";
import PageShell from "../../components/PageShell";
import { ButtonLink } from "../../components/ui";

export const metadata: Metadata = { alternates: { canonical: "/terms" }, title: "Terms", description: "The Terms page for MAKENDLESS is being prepared." };

export default function Page() {
  return (
    <PageShell eyebrow="Legal" title="Terms" intro="Our formal terms text is being prepared and will be published before launch." light>
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5 text-[17px] leading-relaxed text-muted-dark">
          <h2 className="text-2xl font-extrabold text-dark">What is true today</h2>
          <ul className="space-y-3">
            <li className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />The project brief form prepares your brief in your browser. It does not send or store it on a server yet.</li>
            <li className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />This site does not use analytics, advertising or tracking scripts.</li>
            <li className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />Project-specific terms are set out in a written proposal agreed with you before any work begins.</li>
          </ul>
        </div>
        <aside className="h-fit rounded-[1.75rem] bg-white p-7 ring-1 ring-line">
          <p className="text-[15px] leading-relaxed text-muted-dark">Questions about how your information would be handled? Include them in your brief.</p>
          <ButtonLink href="/contact" tone="light" className="mt-5">Start a Project</ButtonLink>
        </aside>
      </div>
    </PageShell>
  );
}
