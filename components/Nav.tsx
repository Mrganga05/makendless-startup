"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const links = [
  { href: "/studios", label: "Services" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/#refer", label: "Refer & Earn" },
];

export { Wordmark } from "./brand";
import { Wordmark } from "./brand";
import { studios } from "../data/pricing";

/**
 * Fixed navigation. It reads `data-tone="light" | "dark"` from whatever section is under it and switches
 * its own colours, so it stays legible over light editorial sections as well as dark cinematic ones.
 */
export default function Nav() {
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<"dark" | "light">("dark");
  const pathname = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const els = document.elementsFromPoint(window.innerWidth / 2, 66);
      const el = els.find((e) => !(e as HTMLElement).closest("header[data-nav]"))?.closest("[data-tone]");
      setTone(el?.getAttribute("data-tone") === "light" ? "light" : "dark");
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, [pathname]);

  /* mobile menu: lock scroll, make the page behind inert, close on Escape */
  useEffect(() => {
    const rest = [document.getElementById("main"), document.querySelector("footer")];
    rest.forEach((el) => { if (el) (el as HTMLElement).inert = open; });
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open]);

  const light = tone === "light" && !open;
  const current = (href: string) => pathname === href;
  return (
    <>
    <header data-nav data-tone={light ? "light" : "dark"} className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${light ? "border-ink/10 bg-paper/[.97] text-dark" : "border-white/10 bg-ink/[.94] text-light"}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/" aria-label="MAKENDLESS — home" className="flex min-h-11 items-center text-lg"><Wordmark /></Link>
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={current(l.href) ? "page" : undefined}
              className={`relative flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors ${current(l.href) ? (light ? "text-violet" : "text-white") : light ? "text-muted-dark hover:text-dark" : "text-[#c3c8de] hover:text-white"}`}>
              {l.label}
              {current(l.href) && <span className="absolute inset-x-4 bottom-1.5 h-0.5 rounded-full" style={{ background: "var(--prism)" }} />}
            </Link>
          ))}
          <Link href="/start-project" aria-current={current("/start-project") ? "page" : undefined} className={`ml-3 flex min-h-11 items-center rounded-full px-5 text-sm font-bold transition active:scale-[.96] ${light ? "bg-ink text-white hover:bg-violet" : "bg-white text-dark hover:bg-violet-soft"}`}>Start a Project</Link>
        </nav>
        <button ref={toggle} className="grid h-11 w-11 place-items-center rounded-full border border-current/20 md:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}>
          <span className="relative block h-3 w-5" aria-hidden="true">
            <span className={`absolute left-0 h-0.5 w-5 bg-current transition duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-1.5 h-0.5 w-5 bg-current transition duration-300 ${open ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 h-0.5 w-5 bg-current transition duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>
    </header>
    {/* The sheet is a sibling of the header: a blurred (backdrop-filter) header would otherwise trap position:fixed children. */}
      <div id="mobile-menu" data-tone="dark" hidden={!open} className="nav-sheet fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto overscroll-contain bg-ink px-5 pb-8 pt-2 text-light md:hidden">
        <nav aria-label="Mobile">
          {[...links, ...studios.map((s) => ({ href: s.href, label: `${s.verb} — ${s.name}${s.beta ? " (Beta)" : ""}` }))].map((l, i) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} aria-current={current(l.href) ? "page" : undefined}
              className={`nav-sheet-item flex min-h-14 items-center border-b border-white/10 ${i < links.length ? "text-2xl font-extrabold" : "text-base font-semibold text-[#c3c8de]"} ${current(l.href) ? "text-aqua-bright" : ""}`} style={{ animationDelay: `${i * 0.04}s` }}>{l.label}</Link>
          ))}
          <Link href="/start-project" onClick={() => setOpen(false)} className="nav-sheet-item mt-6 flex min-h-14 items-center justify-center rounded-full bg-white text-lg font-extrabold text-dark active:scale-[.97]" style={{ animationDelay: ".28s" }}>Start a Project</Link>
        </nav>
      </div>
    </>
  );
}
