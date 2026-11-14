import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "../../components/PageShell";
import { studios } from "../../data/site";
export const metadata: Metadata = { title: "Studios" };
export default function Page() {
  return (
    <PageShell eyebrow="Our three studios" title={<>Three worlds. <span className="prism-text">Endless possibilities.</span></>} intro="Create the content. Build the experience. Grow the audience.">
      <div className="grid gap-5 md:grid-cols-3">
        {studios.map((s) => (
          <Link key={s.id} href={s.href} className="rounded-3xl border border-white/10 bg-[#202342] p-6 transition hover:-translate-y-1 hover:border-white/40">
            <p className="text-sm font-bold tracking-[0.3em]" style={{ color: s.accent }}>{s.verb}{s.beta && " · BETA"}</p>
            <h2 className="mt-2 text-2xl font-extrabold">{s.name}</h2>
            <p className="mt-3 text-[#a4aac7]">{s.tagline}</p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
