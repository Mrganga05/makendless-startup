import type { Metadata } from "next";
import PageShell from "../../components/PageShell";
import { Arrow, ButtonLink } from "../../components/ui";
import { faqs } from "../../data/process";

export const metadata: Metadata = { alternates: { canonical: "/faq" }, title: "FAQ", description: "How to start a project with MAKENDLESS, what we need, how quotes and revisions work, timelines and support." };

export default function Page() {
  return (
    <PageShell eyebrow="FAQ" title="Questions," accent="answered plainly." intro="Anything specific to your project is agreed with you in a written proposal before work starts." light>
      <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div className="divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-bold md:text-xl [&::-webkit-details-marker]:hidden">
                <h2>{f.q}</h2>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full ring-1 ring-line transition group-open:rotate-45 group-open:bg-violet group-open:text-white group-open:ring-violet" aria-hidden="true">+</span>
              </summary>
              <p className="max-w-2xl pb-6 text-[17px] leading-relaxed text-muted-dark">{f.a}</p>
            </details>
          ))}
        </div>
        <aside className="h-fit rounded-[1.75rem] bg-ink p-7 text-light lg:sticky lg:top-24">
          <h2 className="text-2xl font-extrabold">Still have a question?</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">Put it in your project brief. It's the quickest way for us to understand what you need.</p>
          <ButtonLink href="/contact" className="mt-6">Start a Project <Arrow /></ButtonLink>
        </aside>
      </div>
    </PageShell>
  );
}
