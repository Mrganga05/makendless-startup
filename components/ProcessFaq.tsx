"use client";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { faqs, process } from "../data/site";

export default function ProcessFaq() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const w = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section data-tone="light" className="bg-[#f6f7fc] px-5 pb-24 text-[#13172b] md:px-8 md:pb-32" aria-labelledby="proc-title">
      <div className="mx-auto max-w-6xl border-t border-[#13172b]/10 pt-24">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#6f45f6]">How we work</p>
        <h2 id="proc-title" className="mt-4 text-4xl font-extrabold md:text-6xl">From idea to <span className="text-[#6f45f6]">delivery.</span></h2>
        <div ref={ref} className="relative mt-14">
          <div className="absolute left-0 right-0 top-[22px] hidden h-0.5 bg-[#13172b]/10 md:block"><motion.div className="h-full" style={{ width: w, background: "var(--prism)" }} /></div>
          <ol className="grid gap-8 md:grid-cols-4">
            {process.map((p) => (
              <li key={p.n} className="relative">
                <span className="relative grid h-11 w-11 place-items-center rounded-full bg-[#13172b] text-sm font-extrabold text-white">{p.n}</span>
                <h3 className="mt-5 text-2xl font-extrabold">{p.title}</h3>
                <p className="mt-2 text-[#5a6082]">{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-20 grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div><h3 className="text-3xl font-extrabold">Questions, answered plainly.</h3><p className="mt-3 text-[#5a6082]">Specifics are confirmed in your proposal before work starts.</p></div>
          <div className="divide-y divide-[#13172b]/10 border-y border-[#13172b]/10">
            {faqs.map((f, i) => (
              <div key={f.q}>
                <h4><button className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left text-lg font-bold" aria-expanded={open === i} aria-controls={`faq-${i}`} onClick={() => setOpen(open === i ? null : i)}>{f.q}<span className="text-2xl text-[#6f45f6]" aria-hidden="true">{open === i ? "−" : "+"}</span></button></h4>
                <div id={`faq-${i}`} hidden={open !== i} className="pb-5 text-[#5a6082]">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
