import type { Metadata } from "next";
import PageShell from "../../components/PageShell";
import { faqs } from "../../data/site";
export const metadata: Metadata = { title: "FAQ" };
export default function Page() {
  return (
    <PageShell eyebrow="FAQ" title="Questions, answered plainly." light>
      <dl className="divide-y divide-[#13172b]/10 border-y border-[#13172b]/10">
        {faqs.map((f) => (<div key={f.q} className="py-6"><dt className="text-xl font-bold">{f.q}</dt><dd className="mt-2 text-[#5a6082]">{f.a}</dd></div>))}
      </dl>
    </PageShell>
  );
}
