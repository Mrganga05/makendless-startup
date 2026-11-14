import Link from "next/link";
import PageShell from "./PageShell";
import { studios, type StudioId } from "../data/site";

export default function StudioPage({ id }: { id: StudioId }) {
  const s = studios.find((x) => x.id === id)!;
  return (
    <PageShell eyebrow={`${s.verb}${s.beta ? " · Beta" : ""}`} title={<>{s.name}</>} intro={s.tagline}>
      {s.beta && <p className="mb-8 rounded-2xl border border-[#c7a6ff]/40 bg-[#c7a6ff]/10 p-5 text-[#eaf2ff]">GROW is in beta. We are building and validating our delivery before launching paid marketing services. Nothing here is a guarantee of leads, sales or return on ad spend.</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {s.services.map((sv) => (
          <article key={sv.code} className="rounded-3xl border border-white/10 bg-[#202342] p-6">
            <p className="text-xs font-bold tracking-[0.3em]" style={{ color: s.accent }}>{sv.code}</p>
            <h2 className="mt-2 text-2xl font-extrabold">{sv.title}</h2>
            <ul className="mt-4 space-y-2 text-[#a4aac7]">{sv.items.map((i) => (<li key={i} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: s.accent }} />{i}</li>))}</ul>
          </article>
        ))}
      </div>
      <Link href={`/contact?service=${id}`} className="mt-10 inline-block rounded-full bg-white px-8 py-4 font-extrabold text-[#13172b] hover:bg-[#c7a6ff]">{s.beta ? "Join the beta list" : "Start a Project"}</Link>
    </PageShell>
  );
}
