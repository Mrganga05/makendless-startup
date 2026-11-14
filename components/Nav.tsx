"use client";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/studios", label: "Studios" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-extrabold tracking-[0.18em] ${className}`} aria-label="MAKENDLESS">
      MAKEND<span className="prism-text">LESS</span>
    </span>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0c1024]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="text-lg" onClick={() => setOpen(false)}><Wordmark /></Link>
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-[#a4aac7] transition hover:text-white">{l.label}</Link>
          ))}
          <Link href="/contact" className="rounded-full bg-white px-5 py-2 text-sm font-bold text-[#13172b] transition hover:bg-[#c7a6ff]">Start a Project</Link>
        </nav>
        <button className="grid h-11 w-11 place-items-center rounded-full border border-white/15 md:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}>
          <span className="relative block h-3 w-5">
            <span className={`absolute left-0 h-0.5 w-5 bg-white transition ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-1.5 h-0.5 w-5 bg-white transition ${open ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 h-0.5 w-5 bg-white transition ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>
      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-white/10 bg-[#0c1024] px-5 pb-6 pt-3 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block border-b border-white/10 py-4 text-xl font-bold">{l.label}</Link>
          ))}
          <Link href="/contact" onClick={() => setOpen(false)} className="mt-5 block rounded-full bg-white py-3.5 text-center font-bold text-[#13172b]">Start a Project</Link>
        </nav>
      )}
    </header>
  );
}
