"use client";
import Link from "next/link";
import { useState } from "react";
import { packages, studios, type StudioId } from "../data/site";

export default function Packages() {
  const [id, setId] = useState<StudioId>("create");
  const studio = studios.find((s) => s.id === id)!;
  return (
    <section data-tone="light" className="bg-[#f6f7fc] px-5 py-24 text-[#13172b] md:px-8 md:py-32" aria-labelledby="pkg-title">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#6f45f6]">Packages &amp; pricing</p>
        <h2 id="pkg-title" className="mt-4 text-4xl font-extrabold md:text-6xl">Find your <span className="text-[#6f45f6]">starting point.</span></h2>
        <p className="mt-4 max-w-2xl text-[#5a6082]">Every project is quoted from its real scope, effort and timeline. Package structures below show how we organise work. Prices are confirmed in a written proposal.</p>
        <div role="tablist" aria-label="Service category" className="mt-9 flex flex-wrap gap-2">
          {studios.map((s) => (
            <button key={s.id} role="tab" aria-selected={id === s.id} onClick={() => setId(s.id)} className={`min-h-11 rounded-full border px-5 text-sm font-bold transition ${id === s.id ? "border-[#13172b] bg-[#13172b] text-white" : "border-[#13172b]/20 hover:border-[#13172b]"}`}>
              {s.name}{s.beta && <span className="ml-2 rounded bg-[#6f45f6] px-1.5 py-0.5 text-[10px] tracking-widest text-white">BETA</span>}
            </button>
          ))}
        </div>
        <ul role="tabpanel" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {packages[id].map((p) => (
            <li key={p.name} className="flex flex-col rounded-3xl border border-[#13172b]/10 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(19,23,43,.4)]">
              <h3 className="text-xl font-extrabold">{p.name}</h3>
              <p className="mt-1 text-sm text-[#5a6082]">{p.for}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {p.deliverables.map((d) => (<li key={d} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#08bbd4]" />{d}</li>))}
              </ul>
              {p.addons.length > 0 && <p className="mt-4 text-xs text-[#5a6082]"><b className="text-[#13172b]">Optional:</b> {p.addons.join(" · ")}</p>}
              <Link href={`/contact?service=${id}-${p.name.toLowerCase().replace(/\s+/g, "-")}`} className="mt-auto pt-6 text-sm font-extrabold text-[#6f45f6] hover:underline">
                {id === "grow" ? "Join the beta list →" : "Request Quote →"}
              </Link>
            </li>
          ))}
        </ul>
        {studio.beta && <p className="mt-6 rounded-2xl bg-[#6f45f6]/10 p-4 text-sm text-[#13172b]">Digital marketing is in beta. We&apos;re building and validating our delivery before launching paid services. No campaigns are offered yet.</p>}
      </div>
    </section>
  );
}
