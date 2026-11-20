import type { Metadata } from "next";
import Link from "next/link";
import { dbReady, list, type Row } from "../../lib/db";
import { adminConfigured, isAdmin } from "../../lib/admin-auth";
import { inr } from "../../lib/pricing";
import { AdminLogin, Logout, UseActions } from "./AdminClient";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const d = (v: unknown) => (v ? new Date(String(v)).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—");
const th = "border-b border-line px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.12em] text-muted-dark";
const td = "border-b border-line px-3 py-2.5 align-top text-sm";

export default async function Admin({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const tab = (await searchParams).tab === "leads" ? "leads" : "referrals";
  let body: React.ReactNode;
  if (!adminConfigured()) body = <p className="mt-6 max-w-xl text-muted-dark">Admin is locked. Add <b>ADMIN_PASSWORD</b> in Vercel → Settings → Environment Variables, then redeploy.</p>;
  else if (!(await isAdmin())) body = <AdminLogin />;
  else if (!dbReady) body = <p className="mt-6 max-w-xl text-muted-dark">The database is not connected yet. Add <b>SUPABASE_URL</b> and <b>SUPABASE_SERVICE_ROLE_KEY</b> in Vercel (see supabase/schema.sql).</p>;
  else {
    const [codes, uses, leads] = await Promise.all([list("referral_codes"), list("referral_uses"), tab === "leads" ? list("leads") : Promise.resolve([] as Row[])]);
    const byCode = (c: unknown) => uses.filter((u) => u.code === c);
    body = (
      <>
        <nav className="mt-6 flex gap-2" aria-label="Admin sections">
          {(["referrals", "leads"] as const).map((t) => (
            <Link key={t} href={`/admin?tab=${t}`} aria-current={tab === t ? "page" : undefined} className={`for-btn ${tab === t ? "for-btn-primary" : "for-btn-ghost"}`}>{t === "referrals" ? "Referrals" : "Leads"}</Link>
          ))}
          <span className="ml-auto"><Logout /></span>
        </nav>
        {tab === "referrals" ? (
          <>
            <h2 className="mt-10 text-2xl font-extrabold">Referral uses</h2>
            <p className="mt-1 text-sm text-muted-dark">Mark a use as paid once the referred client&apos;s project is paid. That records the referrer&apos;s ₹500 credit.</p>
            <div className="mt-4 overflow-x-auto rounded-2xl bg-white ring-1 ring-line"><table className="w-full min-w-[760px]">
              <thead><tr><th className={th}>Date</th><th className={th}>Code</th><th className={th}>New client</th><th className={th}>Discount</th><th className={th}>Status</th><th className={th}>Referrer credit</th><th className={th}></th></tr></thead>
              <tbody>{uses.length ? uses.map((u) => (
                <tr key={String(u.id)}><td className={td}>{d(u.created_at)}</td><td className={`${td} font-bold`}>{String(u.code)}</td><td className={td}>{String(u.referred_name)}<br /><span className="text-muted-dark">{String(u.referred_whatsapp)}</span></td><td className={td}>{inr(Number(u.discount || 0))}</td><td className={`${td} font-bold capitalize`}>{String(u.status)}</td><td className={td}>{inr(Number(u.referrer_credit || 0))}{u.paid_at ? <><br /><span className="text-muted-dark">{d(u.paid_at)}</span></> : null}</td><td className={td}><UseActions id={String(u.id)} status={String(u.status)} /></td></tr>
              )) : <tr><td className={td} colSpan={7}>No referral uses yet.</td></tr>}</tbody>
            </table></div>
            <h2 className="mt-10 text-2xl font-extrabold">Referral codes</h2>
            <div className="mt-4 overflow-x-auto rounded-2xl bg-white ring-1 ring-line"><table className="w-full min-w-[640px]">
              <thead><tr><th className={th}>Code</th><th className={th}>Name</th><th className={th}>WhatsApp</th><th className={th}>Created</th><th className={th}>Uses</th><th className={th}>Credit earned</th></tr></thead>
              <tbody>{codes.length ? codes.map((c) => { const us = byCode(c.code); return (
                <tr key={String(c.code)}><td className={`${td} font-bold`}>{String(c.code)}</td><td className={td}>{String(c.name)}</td><td className={td}>{String(c.whatsapp)}</td><td className={td}>{d(c.created_at)}</td><td className={td}>{us.length} ({us.filter((u) => u.status === "paid").length} paid)</td><td className={td}>{inr(us.reduce((s, u) => s + Number(u.referrer_credit || 0), 0))}</td></tr>
              ); }) : <tr><td className={td} colSpan={6}>No codes yet.</td></tr>}</tbody>
            </table></div>
          </>
        ) : (
          <>
            <h2 className="mt-10 text-2xl font-extrabold">Leads</h2>
            <div className="mt-4 overflow-x-auto rounded-2xl bg-white ring-1 ring-line"><table className="w-full min-w-[860px]">
              <thead><tr><th className={th}>Date</th><th className={th}>Client</th><th className={th}>Selection</th><th className={th}>Total</th><th className={th}>Savings</th><th className={th}>Delivery</th><th className={th}>Notes</th></tr></thead>
              <tbody>{leads.length ? leads.map((l) => (
                <tr key={String(l.id)}>
                  <td className={td}>{d(l.created_at)}</td>
                  <td className={td}><b>{String(l.name)}</b><br /><a className="for-link" href={`https://wa.me/91${l.whatsapp}`} target="_blank" rel="noreferrer">{String(l.whatsapp)}</a></td>
                  <td className={td}>{((l.selections as Row[]) || []).map((s, i) => <div key={i}>{String(s.name)}{Number(s.qty) > 1 ? ` × ${s.qty}` : ""}</div>)}{((l.extras as Row[]) || []).map((x, i) => <div key={`x${i}`} className="text-muted-dark">+ {String(x.name)}</div>)}</td>
                  <td className={`${td} font-bold`}>{String(l.total_text)}</td>
                  <td className={td}>{l.combo ? <div>{String(l.combo)}</div> : null}{Number(l.video_discount) ? <div>Video −{inr(Number(l.video_discount))}</div> : null}{l.referral_code ? <div>{String(l.referral_code)} −{inr(Number(l.referral_discount))}</div> : null}</td>
                  <td className={td}>{String(l.est_delivery || "—")}</td>
                  <td className={`${td} max-w-xs`}>{Object.entries((l.requirements as Record<string, string>) || {}).map(([k, v]) => <div key={k}><b>{k}:</b> {v}</div>)}{l.footage_link ? <div><b>Link:</b> {String(l.footage_link)}</div> : null}{l.notes ? <div><b>Notes:</b> {String(l.notes)}</div> : null}</td>
                </tr>
              )) : <tr><td className={td} colSpan={7}>No leads yet.</td></tr>}</tbody>
            </table></div>
          </>
        )}
      </>
    );
  }
  return (
    <section data-tone="light" className="min-h-screen bg-paper px-5 pb-20 pt-28 text-dark md:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-extrabold">Admin</h1>
        {body}
      </div>
    </section>
  );
}
