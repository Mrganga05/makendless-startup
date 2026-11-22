"use client";
/* Homepage section 6 — How we work + FAQ. Light paper, calm. Styles: app/styles/process.css (.pro-*). */
import Link from "next/link";
import { useId, useState, type CSSProperties } from "react";
import { homeFaqs as faqs, process, processCopy } from "../data/process";
import { Bullets } from "./Prose";
import { Arrow, ButtonLink, Eyebrow, KineticHeading, Reveal, useReducedMotion } from "./ui";
import { StepVignette } from "./process/Vignettes";
import { useJourneyProgress } from "./process/useJourneyProgress";

function Journey() {
  const reduced = useReducedMotion();
  const { ref, reached, live } = useJourneyProgress(!reduced, process.length);
  return (
    <div ref={ref} className={`pro-journey ${live ? "pro-live" : ""}`}>
      <ol className="pro-steps">
        {process.map((p, i) => {
          const on = !live || i < reached;
          const now = live && i === reached - 1;
          return (
            <li key={p.n} className={`pro-step ${on ? "is-on" : ""} ${now ? "is-now" : ""}`} style={{ ["--i" as string]: i } as CSSProperties} aria-current={now ? "step" : undefined}>
              <div className="pro-vig"><StepVignette index={i} /></div>
              <div className="pro-rail" aria-hidden="true">
                {i < process.length - 1 && (
                  <span className="pro-seg">
                    <span className="pro-fill" />
                    <span className="pro-head"><i /></span>
                  </span>
                )}
                <span className="pro-node tabular-nums" data-node>{p.n}</span>
              </div>
              <div className="pro-body">
                <h3 className="pro-title">{p.title}</h3>
                <p className="pro-text">{p.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Faq() {
  const uid = useId();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="pro-faq">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className={`pro-item ${isOpen ? "is-open" : ""}`}>
            <h4>
              <button type="button" id={`${uid}-q${i}`} className="pro-q" aria-expanded={isOpen} aria-controls={`${uid}-a${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                <span>{f.q}</span>
                <span className="pro-plus" aria-hidden="true" />
              </button>
            </h4>
            <div id={`${uid}-a${i}`} role="region" aria-labelledby={`${uid}-q${i}`} className="pro-panel" inert={!isOpen}>
              <div className="pro-panel-in"><div className="pro-a space-y-3"><p>{f.a}</p>{f.list && <Bullets items={f.list} />}{f.after && <p>{f.after}</p>}</div></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ProcessFaq() {
  return (
    <section id="process" data-tone="light" className="pro-section bg-paper px-5 py-20 text-dark md:px-8 md:py-28" aria-labelledby="proc-title">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div>
            <Eyebrow tone="light">{processCopy.eyebrow}</Eyebrow>
            <KineticHeading id="proc-title" text={processCopy.title} accent={processCopy.titleAccent} accentClass="text-violet" className="pro-h2 mt-4 font-extrabold" />
          </div>
          <Reveal kind="fade" delay={0.25} as="p" className="max-w-sm text-base text-muted-dark lg:pb-2 lg:text-right">{processCopy.intro}</Reveal>
        </div>

        <Journey />

        <div id="faq" className="pro-faq-block" role="group" aria-labelledby="faq-title">
          <div className="pro-faq-aside">
            <h3 id="faq-title" className="text-[1.7rem] leading-[1.1] font-extrabold sm:text-3xl lg:text-4xl">{processCopy.faqTitle}</h3>
            <p className="mt-4 max-w-md text-muted-dark">{processCopy.faqIntro}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2">
              <ButtonLink href="/start-project" tone="light">{processCopy.cta} <Arrow /></ButtonLink>
              <Link href="/faq" className="pro-link inline-flex min-h-11 items-center gap-2 font-bold text-dark">{processCopy.allQuestions}</Link>
            </div>
          </div>
          <Faq />
        </div>
      </div>
    </section>
  );
}
