import type { Metadata } from "next";
import { ButtonLink } from "../components/ui";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section data-tone="dark" className="relative isolate grid min-h-[100svh] place-items-center overflow-hidden bg-ink px-5 pb-20 pt-28 text-center text-light">
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(50% 50% at 50% 60%, rgba(111,69,246,.35), transparent 70%)" }} />
      <div>
        <p className="text-sm font-bold tabular-nums tracking-[0.3em] text-aqua-bright">00:00:04:04 · CLIP MISSING</p>
        <h1 className="mt-5 text-[22vw] font-extrabold leading-none sm:text-[10rem]"><span className="prism-text">404</span></h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted">This frame isn&apos;t in the timeline. The page you were looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/studios" variant="secondary">Explore Studios</ButtonLink>
        </div>
      </div>
    </section>
  );
}
