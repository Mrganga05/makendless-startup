import type { Metadata } from "next";
import { Suspense } from "react";
import PageShell from "../../components/PageShell";
import ContactForm from "../../components/ContactForm";
export const metadata: Metadata = { title: "Start a Project" };
export default function Page() {
  return (
    <PageShell eyebrow="Contact" title={<>Let&apos;s make something <span className="prism-text">worth remembering.</span></>} intro="Tell us what you're building. We'll help you take the next step.">
      <div className="max-w-2xl"><Suspense fallback={null}><ContactForm /></Suspense></div>
    </PageShell>
  );
}
