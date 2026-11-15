import { Eyebrow, KineticHeading } from "./ui";

/* Header band for simple internal pages: dark cinematic band, then a light or dark body. */
export default function PageShell({ eyebrow, title, accent, intro, children, light, aside }: { eyebrow: string; title: string; accent?: string; intro?: string; children?: React.ReactNode; light?: boolean; aside?: React.ReactNode }) {
  return (
    <>
      <section data-tone="dark" className="relative isolate overflow-hidden bg-ink px-5 pb-14 pt-32 text-light md:px-8 md:pb-20 md:pt-40">
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(45% 70% at 85% 10%, rgba(111,69,246,.32), transparent 70%), radial-gradient(35% 50% at 5% 100%, rgba(8,187,212,.16), transparent 70%)" }} />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div className="min-w-0">
            <Eyebrow>{eyebrow}</Eyebrow>
            <KineticHeading as="h1" text={title} accent={accent} className="mt-4 text-[clamp(2.3rem,8.5vw,5rem)] font-extrabold leading-[1] tracking-tight" />
          </div>
          {(intro || aside) && <div className="max-w-xl text-lg leading-relaxed text-[#c3c8de]">{intro && <p>{intro}</p>}{aside}</div>}
        </div>
      </section>
      {children && (
        <section data-tone={light ? "light" : "dark"} className={`px-5 py-16 md:px-8 md:py-24 ${light ? "bg-paper text-dark" : "bg-surface-2 text-light"}`}>
          <div className="mx-auto max-w-7xl">{children}</div>
        </section>
      )}
    </>
  );
}
