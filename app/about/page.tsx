import type { Metadata } from "next";
import PageShell from "../../components/PageShell";
export const metadata: Metadata = { title: "About" };
export default function Page() {
  return (
    <PageShell eyebrow="About" title={<>Create. Build. <span className="prism-text">Grow.</span></>} intro="MAKENDLESS is a small creative and technology studio focused on high-quality video, premium websites and, as we learn, digital marketing.">
      <div className="grid gap-5 md:grid-cols-3">
        {[["Create", "Powerful visual content for creators, businesses and brands."], ["Build", "Attractive, functional digital experiences that are fast, accessible and maintainable."], ["Grow", "Helping businesses improve their digital presence. Currently in beta while we build our skills responsibly."]].map(([t, d]) => (
          <div key={t} className="rounded-3xl border border-white/10 bg-[#202342] p-6"><h2 className="text-2xl font-extrabold">{t}</h2><p className="mt-3 text-[#a4aac7]">{d}</p></div>
        ))}
      </div>
      <p className="mt-10 max-w-2xl text-[#a4aac7]">We are a small team of video editors, web developers and client managers. We promise only what we can deliver, and we use AI tools to move faster while people review every final result.</p>
    </PageShell>
  );
}
