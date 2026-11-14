import Link from "next/link";
import { studios, type Studio } from "../data/site";

function Art({ id }: { id: Studio["id"] }) {
  if (id === "create")
    return (
      <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={20 + i * 74} y="30" width="64" height="88" rx="8" fill="#22d3ee" opacity={0.12 + i * 0.1} />
        ))}
        <path d="M20 160 Q 50 130 80 160 T 140 160 T 200 160 T 260 160 T 300 160" fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
        <g style={{ animation: "marquee 0s" }}>
          <line x1="130" y1="14" x2="130" y2="178" stroke="#fff" strokeWidth="2">
            <animate attributeName="x1" values="30;290;30" dur="6s" repeatCount="indefinite" />
            <animate attributeName="x2" values="30;290;30" dur="6s" repeatCount="indefinite" />
          </line>
        </g>
      </svg>
    );
  if (id === "build")
    return (
      <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden="true">
        <rect x="30" y="20" width="260" height="160" rx="12" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="6 6" />
        {[{ x: 46, y: 36, w: 228, h: 28 }, { x: 46, y: 76, w: 110, h: 84 }, { x: 168, y: 76, w: 106, h: 38 }, { x: 168, y: 122, w: 106, h: 38 }].map((b, i) => (
          <rect key={i} {...b} rx="6" fill="#8b5cf6" opacity="0.5">
            <animate attributeName="opacity" values="0.1;0.75;0.1" dur="4.5s" begin={`${i * 0.45}s`} repeatCount="indefinite" />
          </rect>
        ))}
      </svg>
    );
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden="true">
      {[40, 70, 55, 100, 85, 130].map((h, i) => (
        <rect key={i} x={36 + i * 44} y={170 - h} width="26" height={h} rx="5" fill="#c7a6ff" opacity="0.65">
          <animate attributeName="height" values={`${h * 0.5};${h};${h * 0.5}`} dur="5s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
          <animate attributeName="y" values={`${170 - h * 0.5};${170 - h};${170 - h * 0.5}`} dur="5s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
        </rect>
      ))}
      <text x="160" y="26" textAnchor="middle" fontSize="11" fill="#c7a6ff" letterSpacing="3">ILLUSTRATIVE</text>
    </svg>
  );
}

export default function Studios() {
  return (
    <section id="studios" className="relative bg-[#0c1024] px-5 py-24 md:px-8 md:py-32" aria-labelledby="studios-title">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#08bbd4]">Our three studios</p>
        <h2 id="studios-title" className="mt-4 max-w-3xl text-[2rem] font-extrabold leading-tight sm:text-4xl md:text-6xl">Three worlds. <span className="prism-text">Endless possibilities.</span></h2>
        <ul className="mt-14 grid gap-5 md:grid-cols-3 md:items-end">
          {studios.map((s, i) => (
            <li key={s.id} className={i === 1 ? "md:-translate-y-8" : ""}>
              <Link href={s.href} className="group relative block overflow-hidden rounded-[2rem] border border-white/10 bg-[#202342] p-6 transition duration-500 hover:-translate-y-2 hover:border-white/40 focus-visible:-translate-y-2"
                style={{ boxShadow: `0 30px 80px -40px ${s.accent}` }} aria-label={`${s.verb}: ${s.name}${s.beta ? " (Beta)" : ""}`}>
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60" style={{ background: s.accent }} />
                <div className="relative aspect-[8/5] overflow-hidden rounded-2xl bg-[#0c1024]/70"><Art id={s.id} /></div>
                <div className="relative mt-6 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold tracking-[0.3em]" style={{ color: s.accent }}>{s.verb}</p>
                    <h3 className="mt-1 text-2xl font-extrabold">{s.name}</h3>
                  </div>
                  {s.beta && <span className="rounded-full border border-white/30 px-2.5 py-1 text-[10px] font-bold tracking-widest">BETA</span>}
                </div>
                <p className="relative mt-3 text-[#a4aac7]">{s.tagline}</p>
                <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-bold">Enter studio <span className="transition group-hover:translate-x-1.5" aria-hidden="true">→</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
