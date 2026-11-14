"use client";
import Link from "next/link";
import { useState } from "react";
import { solutions, studios } from "../data/site";

const color = (id: string) => studios.find((s) => s.id === id)!.accent;

function Scene({ id }: { id: string }) {
  const common = "h-full w-full";
  if (id === "creator")
    return (<svg viewBox="0 0 300 200" className={common} aria-hidden="true"><rect x="20" y="40" width="160" height="90" rx="8" fill="#6f45f6" opacity=".35" /><rect x="190" y="20" width="60" height="110" rx="8" fill="#22d3ee" opacity=".6" /><rect x="258" y="20" width="30" height="110" rx="6" fill="#22d3ee" opacity=".3" /><polygon points="85,70 85,100 112,85" fill="#fff" /><path d="M20 160h260" stroke="#fff" strokeOpacity=".3" /><rect x="20" y="150" width="90" height="12" rx="6" fill="#8b5cf6" /></svg>);
  if (id === "local")
    return (<svg viewBox="0 0 300 200" className={common} aria-hidden="true"><rect x="30" y="50" width="240" height="120" rx="10" fill="#202342" stroke="#8b5cf6" /><path d="M30 80h240" stroke="#8b5cf6" /><circle cx="48" cy="65" r="4" fill="#22d3ee" /><rect x="50" y="100" width="90" height="12" rx="6" fill="#fff" opacity=".7" /><rect x="50" y="122" width="140" height="8" rx="4" fill="#fff" opacity=".3" /><rect x="190" y="130" width="62" height="26" rx="13" fill="#22d3ee" /><path d="M50 30l24 12h152l24-12" stroke="#c7a6ff" fill="none" strokeWidth="3" /></svg>);
  if (id === "startup")
    return (<svg viewBox="0 0 300 200" className={common} aria-hidden="true"><path d="M150 25c35 30 40 80 20 120h-40c-20-40-15-90 20-120z" fill="#c7a6ff" opacity=".8" /><circle cx="150" cy="80" r="14" fill="#0c1024" /><path d="M130 145l-22 28 30-8zM170 145l22 28-30-8z" fill="#22d3ee" /><path d="M150 150v35" stroke="#22d3ee" strokeWidth="6" strokeLinecap="round"><animate attributeName="y2" values="170;190;170" dur="1.6s" repeatCount="indefinite" /></path></svg>);
  return (<svg viewBox="0 0 300 200" className={common} aria-hidden="true">{[0, 1, 2].map((k) => (<g key={k}><rect x={30 + k * 85} y="40" width="75" height="75" rx="10" fill="#8b5cf6" opacity={0.35 + k * 0.2} /><rect x={30 + k * 85} y="125" width="50" height="8" rx="4" fill="#fff" opacity=".7" /><rect x={30 + k * 85} y="141" width="30" height="8" rx="4" fill="#22d3ee" /></g>))}</svg>);
}

export default function Solutions() {
  const [id, setId] = useState(solutions[0].id);
  const s = solutions.find((x) => x.id === id)!;
  return (
    <section className="bg-[#0c1024] px-5 py-24 md:px-8 md:py-32" aria-labelledby="sol-title">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#08bbd4]">Solutions for you</p>
        <h2 id="sol-title" className="mt-4 text-4xl font-extrabold md:text-6xl">Made for what <span className="prism-text">you&apos;re building.</span></h2>
        <div className="mt-12 grid gap-8 lg:grid-cols-[320px_1fr]">
          <div role="tablist" aria-label="Customer type" className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {solutions.map((x) => (
              <button key={x.id} role="tab" aria-selected={id === x.id} onClick={() => setId(x.id)} className="min-h-14 rounded-2xl border px-5 py-3 text-left text-base font-bold transition md:text-lg"
                style={{ borderColor: id === x.id ? "#8b5cf6" : "rgba(255,255,255,.12)", background: id === x.id ? "rgba(139,92,246,.2)" : "transparent" }}>{x.label}</button>
            ))}
          </div>
          <div role="tabpanel" className="grid gap-6 rounded-[2rem] border border-white/10 bg-[#202342] p-6 md:grid-cols-2 md:p-8">
            <div className="aspect-[3/2] overflow-hidden rounded-2xl bg-[#0c1024]/70 p-4"><Scene key={s.id} id={s.id} /></div>
            <div className="flex flex-col">
              <h3 className="text-2xl font-extrabold md:text-3xl">{s.headline}</h3>
              <p className="mt-3 text-[#a4aac7]">{s.blurb}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {s.services.map((sv) => (<li key={sv.title} className="rounded-full border px-3 py-1.5 text-sm font-bold" style={{ borderColor: color(sv.studio) }}>{sv.title}</li>))}
              </ul>
              <div className="mt-auto flex flex-wrap gap-3 pt-7">
                <Link href="/studios" className="rounded-full border border-white/25 px-6 py-3 text-sm font-bold hover:bg-white/10">Explore Services</Link>
                <Link href={`/contact?for=${s.id}`} className="rounded-full bg-white px-6 py-3 text-sm font-bold text-[#13172b] hover:bg-[#c7a6ff]">Start a Project</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
