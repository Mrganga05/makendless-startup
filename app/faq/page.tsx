import type { Metadata } from "next";
import PageShell from "../../components/PageShell";
import { Arrow, ButtonLink } from "../../components/ui";
import { Bullets } from "../../components/Prose";
import { faqGroups } from "../../data/process";
import { LIVE_URL, OWNER as O, WHATSAPP_HREF } from "../../data/owner";

export const metadata: Metadata = { alternates: { canonical: `${LIVE_URL}/faq` }, title: "FAQ", description: "Prices, payment, delivery times, free changes and referrals, answered plainly." };

export default function Page() {
  return (
    <PageShell eyebrow="FAQ" title="Questions," accent="answered plainly." intro="Your final price and delivery time are confirmed with you on WhatsApp before any work starts." light>
      <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-14">
          {faqGroups.map((g) => (
            <div key={g.title}>
              <h2 className="mb-2 text-2xl font-extrabold text-dark">{g.title}</h2>
              <div className="divide-y divide-line border-y border-line">
                {g.items.map((f) => (
                  <details key={f.q} className="group">
                    <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-bold md:text-xl [&::-webkit-details-marker]:hidden">
                      <h3>{f.q}</h3>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full ring-1 ring-line transition group-open:rotate-45 group-open:bg-violet group-open:text-white group-open:ring-violet" aria-hidden="true">+</span>
                    </summary>
                    <div className="max-w-2xl space-y-3 pb-6 text-[17px] leading-relaxed text-muted-dark">
                      <p>{f.a}</p>
                      {f.list && <Bullets items={f.list} />}
                      {f.after && <p>{f.after}</p>}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
        <aside className="h-fit rounded-[1.75rem] bg-ink p-7 text-light lg:sticky lg:top-24">
          <h2 className="text-2xl font-extrabold">Still have a question?</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">Message us on WhatsApp at {O.whatsapp} or press &ldquo;Start a Project&rdquo; and ask in the requirements box.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/contact">Start a Project <Arrow /></ButtonLink>
            <ButtonLink href={WHATSAPP_HREF} variant="secondary">Chat on WhatsApp</ButtonLink>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
