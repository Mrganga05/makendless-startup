import type { Metadata } from "next";
import PageShell from "../../components/PageShell";
export const metadata: Metadata = { title: "Privacy" };
export default function Page() {
  return (
    <PageShell eyebrow="Legal" title="Privacy" intro="Draft placeholder. Requires owner and legal review before launch." light>
      <p className="max-w-2xl text-[#5a6082]">This page is a placeholder. MAKENDLESS has not yet approved formal Privacy policy text. Do not rely on this page as a legal document until it has been reviewed and approved.</p>
    </PageShell>
  );
}
