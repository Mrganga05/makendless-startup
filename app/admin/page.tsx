import type { Metadata } from "next";
import AdminApp from "./AdminApp";
import AdminBar from "./AdminBar";

export const metadata: Metadata = { title: "Team dashboard", robots: { index: false, follow: false } };

export default function Admin() {
  return (
    <>
    <AdminBar />
    <section data-tone="light" className="min-h-screen bg-paper px-3 pb-16 pt-16 text-dark sm:px-5 md:px-8">
      <div className="mx-auto max-w-[96rem]"><AdminApp /></div>
    </section>
    </>
  );
}
