import Link from "next/link";
import { Wordmark } from "./Nav";

export function Footer() {
  const cols: [string, [string, string][]][] = [
    ["Studios", [["CREATE", "/create"], ["BUILD", "/build"], ["GROW — Beta", "/grow"], ["All studios", "/studios"]]],
    ["Company", [["About", "/about"], ["FAQ", "/faq"], ["Contact", "/contact"]]],
    ["Legal", [["Privacy", "/privacy"], ["Terms", "/terms"]]],
  ];
  return (
    <footer className="border-t border-white/10 bg-[#0c1024] px-5 py-14 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div><Link href="/" className="text-xl"><Wordmark /></Link><p className="mt-3 text-sm tracking-[0.3em] text-[#a4aac7]">CREATE • BUILD • GROW</p></div>
        {cols.map(([h, ls]) => (
          <nav key={h} aria-label={h}><h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#a4aac7]">{h}</h2>
            <ul className="mt-4 space-y-3">{ls.map(([l, href]) => (<li key={l}><Link href={href} className="hover:text-[#22d3ee]">{l}</Link></li>))}</ul></nav>
        ))}
      </div>
      <p className="mx-auto mt-12 max-w-7xl text-xs text-[#a4aac7]">© {new Date().getFullYear()} MAKENDLESS. Creative &amp; Technology Studio.</p>
    </footer>
  );
}

export default function FinalCta() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#0c1024] px-5 py-32 text-center md:px-8 md:py-44" aria-labelledby="cta-title">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-80" style={{ background: "radial-gradient(50% 60% at 50% 100%, rgba(111,69,246,.55), transparent 70%), radial-gradient(30% 40% at 20% 20%, rgba(8,187,212,.2), transparent 70%)" }} />
        <svg className="pointer-events-none absolute left-1/2 top-0 -z-10 w-[900px] max-w-none -translate-x-1/2 opacity-30" viewBox="0 0 900 300" aria-hidden="true">
          {[0, 1, 2].map((i) => (<line key={i} x1="450" y1="0" x2={150 + i * 300} y2="300" stroke={["#22d3ee", "#8b5cf6", "#c7a6ff"][i]} strokeWidth="2"><animate attributeName="opacity" values=".3;1;.3" dur="5s" begin={`${i * 0.8}s`} repeatCount="indefinite" /></line>))}
        </svg>
        <h2 id="cta-title" className="mx-auto max-w-4xl text-[2rem] font-extrabold leading-[1.05] sm:text-6xl md:text-7xl">Let&apos;s make something <span className="prism-text">worth remembering.</span></h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-[#a4aac7]">Tell us what you&apos;re building. We&apos;ll help you take the next step.</p>
        <Link href="/contact" className="mt-10 inline-block rounded-full bg-white px-10 py-4 text-lg font-extrabold text-[#13172b] transition hover:scale-105 hover:bg-[#c7a6ff]">Start a Project</Link>
      </section>
      <Footer />
    </>
  );
}
