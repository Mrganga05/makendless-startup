import Link from "next/link";
import { Wordmark } from "./Nav";

const cols: { title: string; links: { label: string; href: string; beta?: boolean }[] }[] = [
  { title: "Studios", links: [{ label: "CREATE", href: "/create" }, { label: "BUILD", href: "/build" }, { label: "GROW", href: "/grow", beta: true }, { label: "Studios", href: "/studios" }] },
  { title: "Studio", links: [{ label: "About", href: "/about" }, { label: "FAQ", href: "/faq" }, { label: "Contact", href: "/contact" }] },
  { title: "Legal", links: [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }] },
];

export default function Footer() {
  return (
    <footer data-tone="dark" className="relative overflow-hidden bg-[#080b1a] px-5 pb-10 pt-14 text-light md:px-8 md:pt-20">
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: "var(--prism)" }} aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <Link href="/" aria-label="MAKENDLESS — home" className="inline-flex min-h-11 items-center text-xl"><Wordmark /></Link>
          <p className="mt-2 text-sm font-semibold tracking-[0.3em] text-muted">CREATE • BUILD • GROW</p>
          <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-muted">Creative &amp; Technology Studio. Video editing and website development, with digital marketing in beta.</p>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={`Footer — ${c.title}`}>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted">{c.title}</p>
            <ul className="mt-2">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="group flex min-h-11 items-center gap-2 text-base font-semibold transition-colors hover:text-aqua-bright">
                    <span className="underline-offset-4 group-hover:underline">{l.label}</span>
                    {l.beta && <span className="rounded-full bg-grow/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-grow">Beta</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-muted">
        <p>© {new Date().getFullYear()} MAKENDLESS</p>
        <p>Demo visuals on this site are original concept pieces.</p>
      </div>
      <p aria-hidden="true" className="pointer-events-none mx-auto mt-8 max-w-7xl select-none whitespace-nowrap text-center text-[13.5vw] font-extrabold leading-[0.8] tracking-tight text-white/[0.035] xl:text-[11.5rem]">MAKENDLESS</p>
    </footer>
  );
}
