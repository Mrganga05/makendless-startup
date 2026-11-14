import { Footer } from "./FinalCta";
export default function PageShell({ eyebrow, title, intro, children, light }: { eyebrow: string; title: React.ReactNode; intro?: string; children?: React.ReactNode; light?: boolean }) {
  return (
    <>
      <section className="bg-[#0c1024] px-5 pb-16 pt-36 md:px-8" style={{ background: "radial-gradient(50% 60% at 80% 0%, rgba(111,69,246,.35), transparent 70%), #0c1024" }}>
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#08bbd4]">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">{title}</h1>
          {intro && <p className="mt-5 max-w-2xl text-lg text-[#a4aac7]">{intro}</p>}
        </div>
      </section>
      <section className={`px-5 py-16 md:px-8 md:py-24 ${light ? "bg-[#f6f7fc] text-[#13172b]" : "bg-[#0c1024]"}`}><div className="mx-auto max-w-5xl">{children}</div></section>
      <Footer />
    </>
  );
}
