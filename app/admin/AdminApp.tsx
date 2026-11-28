"use client";
/* MAKENDLESS control room. Owner: everything. Team member: only the leads and projects assigned to them, no money.
   The server (app/api/admin/route.ts) enforces the same rules: this UI only hides what the API never sends. */
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SiteContent } from "../../data/content";
import { WORK } from "../../data/work";
import { inr } from "../../lib/pricing";
import { downloadCsv, downloadXlsx, parseCsv, type Cell } from "../../lib/sheet";

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Data = {
  me: { email: string; name: string; role: "Owner" | "Team member" }; team: Row[]; leads: Row[]; projects: Row[];
  expenses?: Row[]; codes?: Row[]; uses?: Row[]; settings?: Record<string, string>; content?: SiteContent; trash?: Row[]; activity?: Row[]; backups?: Row[];
};
type Api = { ok: boolean; error?: string; [k: string]: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

const LEAD_STATUS = ["New", "Contacted", "Proposal", "Won", "Lost"];
const STATUS_TONE: Record<string, string> = { New: "bg-[#ece8ff] text-[#4a2fc9]", Contacted: "bg-[#e6f0ff] text-[#1f4fa8]", Proposal: "bg-[#fff3dc] text-[#8a5a00]", Won: "bg-[#e7f7ef] text-[#0f6b4b]", Lost: "bg-[#f1f1f4] text-[#5b6079]" };
const PROJECT_STATUS = ["Not started", "In progress", "In review", "Delivered", "Paid"];
/* Where a lead came from, in the four words the team uses (+ Manual for hand-added / imported). */
const SOURCE_KINDS = ["Form", "Referral", "Waitlist", "Chatbot", "Manual"];
const KIND_OF: Record<string, string> = { "Start a Project": "Form", "Contact brief": "Form", Referral: "Referral", "GROW waitlist": "Waitlist", Chatbot: "Chatbot" };
const sourceOf = (l: Row) => KIND_OF[String(l.form)] || "Manual";
const sourceDetail = (l: Row) => (sourceOf(l) === "Manual" ? `${l.form === "Imported" ? "Imported" : "Added by hand"} · ${l.lead_source || "Other"}` : sourceOf(l) === "Form" ? String(l.form) : "");
const SOURCES = ["Website", "WhatsApp", "Instagram", "Outreach", "Referral", "Other"];
const CATS = ["Software & tools", "Ads & marketing", "Domain & hosting", "Equipment", "Registration & legal", "Other"];
const OWNER_TABS = ["Home", "Leads", "Projects", "Expenses", "Team", "Referrals", "Website", "Reports", "Trash", "Activity", "Settings"] as const;
const TEAM_TABS = ["Home", "Leads", "Projects"] as const;
const DAY = 864e5;

const api = (body: object): Promise<Api> => fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => ({ ok: r.ok, ...(await r.json().catch(() => ({}))) }));
const ymd = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const TODAY = () => ymd(new Date());
const ym = (d?: string) => String(d || "").slice(0, 7);
const dateOf = (r: Row) => String(r.date || r.created_at || "").slice(0, 10);
const nice = (d?: string) => (d ? new Date(d.length === 10 ? d + "T00:00" : d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
const ago = (d: string) => { const m = Math.max(0, (Date.now() - new Date(d).getTime()) / 6e4); return m < 60 ? `${Math.round(m)}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`; };
const monthName = (k: string) => new Date(k + "-01T00:00").toLocaleDateString("en-IN", { month: "short", year: "numeric" });
/* Website orders list the service; contact-page and chatbot leads list what they picked (their "service" is only the studio). */
const services = (l: Row): string[] => { const pickedOnly = l.form === "Contact brief" || l.form === "Chatbot"; return [...new Set(((l.selections?.items as Row[]) || []).map((i) => String((pickedOnly ? i.option || i.service : i.service || i.option) || "")).filter(Boolean))]; };
const estimate = (l: Row) => Number(l.estimated_total || 0) + Number(l.estimated_monthly || 0);
/** The quote the client saw (or the Owner typed), e.g. "₹14,998 + ₹1,499/month". */
const quote = (l: Row) => {
  const t = Number(l.estimated_total || 0), m = Number(l.estimated_monthly || 0);
  const base = [t ? inr(t) : "", m ? `${inr(m)}/month` : ""].filter(Boolean).join(" + ");
  if (base) return base + (l.has_custom ? " + custom" : "");
  return l.has_custom || l.form === "Contact brief" || l.form === "Chatbot" ? "To be quoted" : "—";
};
/** The code a lead used; for a Referral sign-up, the code they were given. */
const refCode = (l: Row, codes: Row[] = []) => {
  if (l.referral_code) return { code: String(l.referral_code), own: false };
  if (l.form !== "Referral") return null;
  const code = String(l.total_text || "").match(/MKE-[A-Z]+-\d{4}/)?.[0] || codes.find((c) => c.referrer_whatsapp === l.whatsapp)?.code;
  return code ? { code: String(code), own: true } : null;
};
const stop = (e: React.SyntheticEvent) => e.stopPropagation();
const late = (l: Row) => l.status === "New" && Date.now() - new Date(l.created_at).getTime() > DAY;
const money = (p: Row) => {
  const pays = (p.payments as Row[]) || [];
  const paid = pays.reduce((s, x) => s + Number(x.amount || 0), 0);
  const adv = pays.filter((x) => x.kind === "Advance").reduce((s, x) => s + Number(x.amount || 0), 0);
  return { paid, adv, bal: paid - adv, pending: Math.max(0, Number(p.price || 0) - paid) };
};
const confirmDelete = () => confirm("Are you sure? It moves to Trash, where the Owner can restore it for 30 days.");

const card = "rounded-2xl bg-white p-4 ring-1 ring-line sm:p-5";
const lbl = "grid gap-1 text-sm font-bold";
const chip = (on: boolean) => `shrink-0 rounded-full px-3 py-1.5 text-sm font-bold ring-1 ${on ? "bg-ink text-white ring-ink" : "bg-white text-dark ring-line"}`;

/* ---------------- shared pieces ---------------- */
function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-3xl bg-paper p-4 pb-10 sm:p-6 md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[36rem] md:rounded-none">
        <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 flex items-center justify-between gap-3 bg-paper px-4 py-3 sm:-mx-6 sm:-mt-6 sm:px-6">
          <h2 className="text-xl font-extrabold">{title}</h2>
          <button type="button" className="for-btn for-btn-ghost !min-h-10 !px-4" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

type Col = { label: string; get: (r: Row) => React.ReactNode; raw?: (r: Row) => Cell };
function List({ name, cols, rows, onOpen, tools }: { name: string; cols: Col[]; rows: Row[]; onOpen?: (r: Row) => void; tools?: React.ReactNode }) {
  const exp = (kind: "csv" | "xlsx") => {
    const head = cols.map((c) => c.label);
    const body = rows.map((r) => cols.map((c) => { if (c.raw) return c.raw(r); const v = c.get(r); return typeof v === "string" || typeof v === "number" ? v : ""; }));
    (kind === "csv" ? downloadCsv : downloadXlsx)(`MAKENDLESS ${name} ${TODAY()}`, head, body);
  };
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {tools}
        <span className="ml-auto flex gap-2">
          <button type="button" className="for-btn for-btn-ghost !min-h-10 !px-3 text-sm" onClick={() => exp("xlsx")}>Download as Excel</button>
          <button type="button" className="for-btn for-btn-ghost !min-h-10 !px-3 text-sm" onClick={() => exp("csv")}>Download as CSV</button>
        </span>
      </div>
      {rows.length === 0 ? <p className={`${card} text-muted-dark`}>Nothing here yet.</p> : (
        <div className="md:overflow-x-auto md:rounded-2xl md:bg-white md:ring-1 md:ring-line">
          <table className="adm-t w-full">
            <thead><tr>{cols.map((c) => <th key={c.label}>{c.label}</th>)}</tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id ?? r.email ?? r.code ?? i} onClick={onOpen ? () => onOpen(r) : undefined} className={onOpen ? "cursor-pointer hover:bg-paper" : ""}>
                  {cols.map((c) => <td key={c.label} data-label={c.label}>{c.get(r) ?? "—"}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ImportCsv({ entity, done }: { entity: "leads" | "projects" | "expenses"; done: () => void }) {
  const [msg, setMsg] = useState("");
  return (
    <label className="for-btn for-btn-ghost !min-h-10 cursor-pointer !px-3 text-sm">
      Import from CSV
      <input type="file" accept=".csv,text/csv" className="sr-only" onChange={async (e) => {
        const f = e.target.files?.[0]; e.target.value = "";
        if (!f) return;
        const rows = parseCsv(await f.text());
        if (!rows.length) return setMsg("That file has no rows.");
        if (!confirm(`Import ${rows.length} rows into ${entity}?`)) return;
        const r = await api({ action: "import", entity, rows });
        setMsg(r.ok ? `Imported ${r.added} rows.` : r.error || "Import failed."); done();
      }} />
      {msg && <span className="ml-2 text-xs">{msg}</span>}
    </label>
  );
}

const Stat = ({ label, value, tone = "" }: { label: string; value: string; tone?: string }) => (
  <div className={card}><p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-dark">{label}</p><p className={`mt-1 text-2xl font-extrabold tabular-nums ${tone}`}>{value}</p></div>
);
const Err = ({ text }: { text: string }) => (text ? <p role="alert" className="for-error text-sm font-bold">{text}</p> : null);
const memberName = (email: string, team: Row[]) => (email ? String(team.find((t) => t.email === email)?.name || email) : "—");
function MemberSelect({ value, team, onChange }: { value: string; team: Row[]; onChange: (v: string) => void }) {
  return (
    <select className="for-field" value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">Not assigned</option>
      {team.filter((t) => t.active).map((t) => <option key={t.email} value={t.email}>{t.name || t.email}</option>)}
    </select>
  );
}

/* ---------------- money maths (Owner) ---------------- */
function monthStats(d: Data, key: string) {
  const projects = d.projects.filter((p) => ym(p.created_at) === key);
  const collected = d.projects.flatMap((p) => (p.payments as Row[]) || []).filter((x) => ym(x.date) === key).reduce((s, x) => s + Number(x.amount || 0), 0);
  const payouts = d.projects.filter((p) => p.payout_done && ym(p.payout_date || p.updated_at) === key).reduce((s, p) => s + Number(p.team_payout || 0), 0);
  const expenses = (d.expenses || []).filter((e) => ym(e.date) === key).reduce((s, e) => s + Number(e.amount || 0), 0);
  const sales = projects.reduce((s, p) => s + Number(p.price || 0), 0);
  return { projects: projects.length, sales, collected, payouts, expenses, profit: collected - payouts - expenses };
}
const lastMonths = (n: number) => Array.from({ length: n }, (_, i) => { const t = new Date(); t.setDate(1); t.setMonth(t.getMonth() - i); return ymd(t).slice(0, 7); });

/* ---------------- Home ---------------- */
function Home({ d, go }: { d: Data; go: (tab: string, id?: string) => void }) {
  const owner = d.me.role === "Owner";
  const today = TODAY(), weekAgo = Date.now() - 7 * DAY, in3 = ymd(new Date(Date.now() + 3 * DAY));
  const newToday = d.leads.filter((l) => String(l.created_at).slice(0, 10) === today).length;
  const newWeek = d.leads.filter((l) => new Date(l.created_at).getTime() >= weekAgo).length;
  const waiting = d.leads.filter(late);
  const due = d.projects.filter((p) => p.delivery_date && p.delivery_date >= today && p.delivery_date <= in3 && !["Delivered", "Paid"].includes(p.status));
  const m = owner ? monthStats(d, today.slice(0, 7)) : null;
  const target = Number(d.settings?.monthly_target || 100000);
  const pending = owner ? d.projects.reduce((s, p) => s + money(p).pending, 0) : 0;
  return (
    <div className="grid gap-4">
      {m && (
        <>
          <h2 className="text-lg font-extrabold">This month · {monthName(today.slice(0, 7))}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <Stat label="Sales" value={inr(m.sales)} />
            <Stat label="Collected" value={inr(m.collected)} />
            <Stat label="Pending from clients" value={inr(pending)} />
            <Stat label="Expenses" value={inr(m.expenses)} />
            <Stat label="Team payouts" value={inr(m.payouts)} />
            <Stat label="Profit" value={inr(m.profit)} tone={m.profit < 0 ? "text-[#c2183a]" : "text-[#0f6b4b]"} />
          </div>
          <div className={card}>
            <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="font-extrabold">Monthly target</p><p className="text-sm font-bold tabular-nums">{inr(m.sales)} of {inr(target)} · {target ? Math.round((m.sales / target) * 100) : 0}%</p></div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-paper-2" role="progressbar" aria-valuemin={0} aria-valuemax={target} aria-valuenow={m.sales}><div className="h-full rounded-full bg-violet" style={{ width: `${Math.min(100, target ? (m.sales / target) * 100 : 0)}%` }} /></div>
            <p className="mt-2 text-xs text-muted-dark">Profit = collected − team payouts − expenses, this month.</p>
          </div>
        </>
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label={owner ? "New leads today" : "My new leads today"} value={String(newToday)} />
        <Stat label="New this week" value={String(newWeek)} />
        <Stat label="Waiting over 24h" value={String(waiting.length)} tone={waiting.length ? "text-[#c2183a]" : ""} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className={card}>
          <p className="font-extrabold">Waiting for a reply (over 24 hours)</p>
          <ul className="mt-2 grid gap-1">
            {waiting.map((l) => <li key={l.id}><button type="button" className="min-h-10 text-left text-sm font-bold text-[#c2183a] underline" onClick={() => go("Leads", l.id)}>{l.name} · {l.form} · waiting {ago(l.created_at)}</button></li>)}
            {!waiting.length && <li className="text-sm text-muted-dark">Every new lead has been answered.</li>}
          </ul>
        </div>
        <div className={card}>
          <p className="font-extrabold">Projects due in the next 3 days</p>
          <ul className="mt-2 grid gap-1">
            {due.map((p) => <li key={p.id}><button type="button" className="min-h-10 text-left text-sm font-bold underline" onClick={() => go("Projects", p.id)}>{p.client} · {p.services} · {nice(p.delivery_date)}</button></li>)}
            {!due.length && <li className="text-sm text-muted-dark">Nothing due in the next 3 days.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Leads ---------------- */
function LeadSheet({ lead, d, close, reload }: { lead: Row; d: Data; close: () => void; reload: () => void }) {
  const owner = d.me.role === "Owner";
  const [f, setF] = useState({ name: lead.name || "", whatsapp: lead.whatsapp || "", email: lead.email || "", services: services(lead).join(", "), estimated_total: String(lead.estimated_total ?? ""), lead_source: lead.lead_source || "Website" });
  const [reason, setReason] = useState(lead.lost_reason || "");
  const [notes, setNotes] = useState(lead.notes || "");
  const [saved, setSaved] = useState("");
  const [err, setErr] = useState("");
  const rc = refCode(lead, d.codes);
  const run = async (body: object) => { const r = await api(body); if (!r.ok) setErr(r.error || "Something went wrong."); else { setErr(""); reload(); } return r; };
  const first = String(lead.name || "").split(/[\s@]/)[0];
  const svc = services(lead).join(", ");
  const wa = lead.whatsapp ? `https://wa.me/91${String(lead.whatsapp).slice(-10)}?text=${encodeURIComponent(`Hi ${first}, this is the MAKENDLESS team. Thanks for your interest${svc ? ` in ${svc}` : ""}! We'd love to help. When is a good time to talk about your project?`)}` : "";
  const items = (lead.selections?.items as Row[]) || [];
  const setStatus = (status: string) => run({ action: "lead.update", id: lead.id, patch: { status, ...(status === "Lost" ? { lost_reason: reason } : {}) } });
  return (
    <Sheet title={lead.name} onClose={close}>
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          {wa ? <a href={wa} target="_blank" rel="noopener noreferrer" className="for-btn !min-h-11 bg-[#25d366] text-white">WhatsApp</a> : <span className="text-sm text-muted-dark">No WhatsApp number{lead.email ? ` · ${lead.email}` : ""}</span>}
          {owner && !lead.project_id && <button type="button" className="for-btn for-btn-primary !min-h-11" onClick={async () => { const r = await run({ action: "lead.won", id: lead.id }); if (r.ok) close(); }}>Mark as Won → Project</button>}
          {lead.project_id && <span className="rounded-full bg-[#e7f7ef] px-3 py-2 text-sm font-bold text-[#0f6b4b]">Won · project created</span>}
        </div>
        <Err text={err} />
        <div className={card}>
          <p className="text-sm text-muted-dark">{nice(lead.created_at)} · Source: <b>{sourceOf(lead)}</b>{sourceDetail(lead) ? ` (${sourceDetail(lead)})` : ""}{lead.source_page ? ` · ${lead.source_page}` : ""}</p>
          {items.length > 0 && <ul className="mt-2 text-sm">{items.map((i, k) => <li key={k}>• {i.option ? `${i.service}: ${i.option}` : i.service}{i.qty > 1 ? ` × ${i.qty}` : ""}</li>)}</ul>}
          {owner && <p className="mt-2 font-bold">Quote total: {quote(lead)}</p>}
          {lead.est_delivery && <p className="text-sm">Est. delivery: {lead.est_delivery}</p>}
          {lead.extra_notes && <p className="mt-2 whitespace-pre-wrap text-sm">“{lead.extra_notes}”</p>}
          {Object.entries(lead.requirements || {}).map(([k, v]) => <p key={k} className="mt-1 text-sm"><b>{k}:</b> {String(v)}</p>)}
          {lead.footage_link && <p className="mt-1 break-all text-sm">Link: {lead.footage_link}</p>}
          {rc && <p className="mt-1 text-sm">{rc.own ? "Their referral code" : "Used referral code"}: <b>{rc.code}</b></p>}
        </div>
        <div className={`${card} grid gap-3`}>
          <p className="font-extrabold">Status</p>
          <div className="flex flex-wrap gap-2">{LEAD_STATUS.map((s) => <button type="button" key={s} className={chip(lead.status === s)} onClick={() => setStatus(s)}>{s}</button>)}</div>
          <label className={lbl}>Reason if Lost (optional)<input className="for-field" value={reason} onChange={(e) => setReason(e.target.value)} onBlur={() => lead.status === "Lost" && reason !== (lead.lost_reason || "") && run({ action: "lead.update", id: lead.id, patch: { lost_reason: reason } })} placeholder="e.g. budget too low, went with someone else" /></label>
          {owner && <label className={lbl}>Assigned to<MemberSelect value={lead.assigned_to} team={d.team} onChange={(v) => run({ action: "lead.update", id: lead.id, patch: { assigned_to: v } })} /></label>}
        </div>
        {owner && (
          <form className={`${card} grid gap-3`} onSubmit={(e) => { e.preventDefault(); run({ action: "lead.update", id: lead.id, patch: f }); }}>
            <p className="font-extrabold">Details</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={lbl}>Name<input className="for-field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
              <label className={lbl}>WhatsApp<input className="for-field" inputMode="tel" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} /></label>
              <label className={lbl}>Email<input className="for-field" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
              <label className={lbl}>Lead source<select className="for-field" value={f.lead_source} onChange={(e) => setF({ ...f, lead_source: e.target.value })}>{SOURCES.map((s) => <option key={s}>{s}</option>)}</select></label>
              <label className={lbl}>Services<input className="for-field" value={f.services} onChange={(e) => setF({ ...f, services: e.target.value })} /></label>
              <label className={lbl}>Estimated price (₹)<input className="for-field" inputMode="numeric" value={f.estimated_total} onChange={(e) => setF({ ...f, estimated_total: e.target.value })} /></label>
            </div>
            <button className="for-btn for-btn-primary">Save details</button>
          </form>
        )}
        <div className={`${card} grid gap-3`}>
          <label htmlFor={`notes-${lead.id}`} className="font-extrabold">Notes</label>
          <form className="grid gap-2" onSubmit={async (e) => { e.preventDefault(); const r = await run({ action: "lead.update", id: lead.id, patch: { notes } }); setSaved(r.ok ? "Saved." : ""); }}>
            <textarea id={`notes-${lead.id}`} className="for-field for-area-sm" value={notes} onChange={(e) => { setNotes(e.target.value); setSaved(""); }} placeholder="Call summary, next step, follow-up date…" />
            <span className="flex items-center gap-3"><button className="for-btn for-btn-primary w-fit !px-5" disabled={notes === (lead.notes || "")}>Save notes</button>{saved && <span role="status" className="text-sm font-bold text-[#0f6b4b]">{saved}</span>}</span>
          </form>
          {((lead.team_notes as Row[]) || []).length > 0 && (
            <details className="text-sm"><summary className="cursor-pointer font-bold text-muted-dark">Earlier notes ({(lead.team_notes as Row[]).length})</summary>
              <ul className="mt-2 grid gap-2">{(lead.team_notes as Row[]).map((n, i) => <li key={i} className="rounded-xl bg-paper p-3"><p className="whitespace-pre-wrap">{n.body}</p><p className="mt-1 text-xs text-muted-dark">{n.author} · {nice(n.at)}</p></li>)}</ul>
            </details>
          )}
        </div>
        {owner && <button type="button" className="for-btn for-btn-ghost text-[#c2183a]" onClick={async () => { if (confirmDelete() && (await run({ action: "delete", entity: "lead", id: lead.id })).ok) close(); }}>Delete lead</button>}
      </div>
    </Sheet>
  );
}

function AddLead({ d, close, reload }: { d: Data; close: () => void; reload: () => void }) {
  const [f, setF] = useState({ name: "", whatsapp: "", email: "", lead_source: "WhatsApp", services: "", estimated_total: "", assigned_to: "", notes: "" });
  const [err, setErr] = useState("");
  return (
    <Sheet title="Add a lead" onClose={close}>
      <form className="grid gap-3" onSubmit={async (e) => { e.preventDefault(); const r = await api({ action: "lead.add", row: f }); if (!r.ok) return setErr(r.error || "Couldn't save."); reload(); close(); }}>
        <label className={lbl}>Name<input className="for-field" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className={lbl}>WhatsApp<input className="for-field" inputMode="tel" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} /></label>
        <label className={lbl}>Email<input className="for-field" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label className={lbl}>Lead source<select className="for-field" value={f.lead_source} onChange={(e) => setF({ ...f, lead_source: e.target.value })}>{SOURCES.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className={lbl}>Services (comma separated)<input className="for-field" value={f.services} onChange={(e) => setF({ ...f, services: e.target.value })} /></label>
        <label className={lbl}>Estimated price (₹)<input className="for-field" inputMode="numeric" value={f.estimated_total} onChange={(e) => setF({ ...f, estimated_total: e.target.value })} /></label>
        <label className={lbl}>Assign to<MemberSelect value={f.assigned_to} team={d.team} onChange={(v) => setF({ ...f, assigned_to: v })} /></label>
        <label className={lbl}>Notes<textarea className="for-field for-area-sm" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></label>
        <Err text={err} />
        <button className="for-btn for-btn-primary">Add lead</button>
      </form>
    </Sheet>
  );
}

/* Status dropdown right in the table row: saves at once. */
function StatusSelect({ lead, reload }: { lead: Row; reload: () => void }) {
  const [v, setV] = useState(String(lead.status));
  const [busy, setBusy] = useState(false);
  return (
    <select aria-label={`Status of ${lead.name}`} disabled={busy} value={v} onClick={stop} onKeyDown={stop}
      className={`min-h-9 cursor-pointer rounded-full border-0 py-1 pl-3 pr-7 text-sm font-bold ${STATUS_TONE[v] || ""}`}
      onChange={async (e) => {
        const status = e.target.value, before = v;
        const lost_reason = status === "Lost" && !lead.lost_reason ? (prompt(`Why was ${lead.name} lost? (optional)`) ?? "").trim() : "";
        setV(status); setBusy(true);
        const r = await api({ action: "lead.update", id: lead.id, patch: { status, ...(lost_reason ? { lost_reason } : {}) } });
        setBusy(false);
        if (!r.ok) { setV(before); alert(r.error || "Couldn't save the status."); } else reload();
      }}>
      {LEAD_STATUS.map((s) => <option key={s}>{s}</option>)}
    </select>
  );
}

/* Notes right in the table row: saves when you click away (or press Enter; Shift+Enter = new line). */
function NotesCell({ lead, reload }: { lead: Row; reload: () => void }) {
  const [v, setV] = useState(String(lead.notes || ""));
  const [state, setState] = useState<"" | "saving" | "saved">("");
  const save = async () => {
    if (v === String(lead.notes || "")) return;
    setState("saving");
    const r = await api({ action: "lead.update", id: lead.id, patch: { notes: v } });
    if (!r.ok) { setState(""); alert(r.error || "Couldn't save the note."); return; }
    setState("saved"); reload(); setTimeout(() => setState(""), 1500);
  };
  return (
    <span className="flex w-full min-w-[11rem] items-start gap-1" onClick={stop}>
      <textarea aria-label={`Notes for ${lead.name}`} rows={1} value={v} placeholder="Add a note"
        className="min-h-9 w-full resize-y rounded-lg bg-paper px-2 py-1.5 text-sm ring-1 ring-line focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet"
        onChange={(e) => setV(e.target.value)} onBlur={save}
        onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); (e.target as HTMLTextAreaElement).blur(); } }} />
      {state && <span className="pt-2 text-xs font-bold text-[#0f6b4b]" role="status">{state === "saving" ? "…" : "✓"}</span>}
    </span>
  );
}

function Leads({ d, reload, openId, setOpenId }: { d: Data; reload: () => void; openId: string; setOpenId: (id: string) => void }) {
  const owner = d.me.role === "Owner";
  const [status, setStatus] = useState("All");
  const [kind, setKind] = useState("All");
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const rows = d.leads.filter((l) => (status === "All" || l.status === status) && (kind === "All" || sourceOf(l) === kind) && (!q || `${l.name} ${l.whatsapp} ${l.email} ${services(l).join(" ")} ${l.referral_code || ""} ${l.notes || ""}`.toLowerCase().includes(q.toLowerCase())));
  const open = d.leads.find((l) => l.id === openId);
  const cols: Col[] = [
    { label: "Name", get: (l) => <span className={late(l) ? "font-bold text-[#c2183a]" : "font-bold"} title={late(l) ? "New for over 24 hours" : undefined}>{l.name}</span>, raw: (l) => l.name },
    { label: "WhatsApp", get: (l) => (l.whatsapp ? <a href={`https://wa.me/91${String(l.whatsapp).slice(-10)}`} target="_blank" rel="noopener noreferrer" onClick={stop} className="font-bold text-[#0f6b4b] underline">{l.whatsapp}</a> : (l.email || "—")), raw: (l) => l.whatsapp },
    { label: "Services", get: (l) => services(l).join(", ") || "—", raw: (l) => services(l).join(", ") },
    ...(owner ? [{ label: "Quote total", get: (l: Row) => <span className="whitespace-nowrap tabular-nums">{quote(l)}</span>, raw: (l: Row) => estimate(l) }] : []),
    { label: "Referral code", get: (l) => { const rc = refCode(l, d.codes); return rc ? <span className="whitespace-nowrap">{rc.code}{rc.own && <span className="block text-xs text-muted-dark">their own code</span>}</span> : "—"; }, raw: (l) => refCode(l, d.codes)?.code || "" },
    { label: "Source", get: (l) => <span><b>{sourceOf(l)}</b>{sourceDetail(l) && <span className="block text-xs text-muted-dark">{sourceDetail(l)}</span>}</span>, raw: (l) => sourceOf(l) },
    { label: "Date", get: (l) => <span className="whitespace-nowrap">{nice(l.created_at)}</span>, raw: (l) => String(l.created_at).slice(0, 10) },
    { label: "Status", get: (l) => <StatusSelect key={l.status} lead={l} reload={reload} />, raw: (l) => l.status + (l.status === "Lost" && l.lost_reason ? ` (${l.lost_reason})` : "") },
    { label: "Notes", get: (l) => <NotesCell key={l.updated_at} lead={l} reload={reload} />, raw: (l) => l.notes || "" },
    { label: "Assigned to", get: (l) => memberName(l.assigned_to, d.team), raw: (l) => l.assigned_to || "" },
  ];
  return (
    <div className="grid gap-3">
      <div className="flex gap-2 overflow-x-auto pb-1">{["All", ...LEAD_STATUS].map((s) => <button type="button" key={s} className={chip(status === s)} onClick={() => setStatus(s)}>{s} {s === "All" ? d.leads.length : d.leads.filter((l) => l.status === s).length}</button>)}</div>
      <div className="grid gap-2 sm:grid-cols-[1fr_14rem]">
        <input className="for-field" placeholder="Search name, number, service, code, notes" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search leads" />
        <select className="for-field" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Source">{["All", ...SOURCE_KINDS].map((x) => <option key={x} value={x}>{x === "All" ? "All sources" : x}</option>)}</select>
      </div>
      <List name="Leads" cols={cols} rows={rows} onOpen={(l) => setOpenId(l.id)} tools={owner && <><button type="button" className="for-btn for-btn-primary !min-h-10 !px-4 text-sm" onClick={() => setAdding(true)}>+ Add lead</button><ImportCsv entity="leads" done={reload} /></>} />
      {open && <LeadSheet key={open.id + open.updated_at} lead={open} d={d} close={() => setOpenId("")} reload={reload} />}
      {adding && <AddLead d={d} close={() => setAdding(false)} reload={reload} />}
    </div>
  );
}

/* ---------------- Projects ---------------- */
function ProjectSheet({ p, d, close, reload }: { p: Row | null; d: Data; close: () => void; reload: () => void }) {
  const owner = d.me.role === "Owner";
  const isNew = !p;
  const [f, setF] = useState({ client: p?.client || "", client_whatsapp: p?.client_whatsapp || "", studio: p?.studio || "", services: p?.services || "", price: String(p?.price ?? ""), delivery_date: p?.delivery_date || "", assigned_to: p?.assigned_to || "", team_payout: String(p?.team_payout ?? ""), status: p?.status || "Not started", notes: p?.notes || "" });
  const [pay, setPay] = useState({ date: TODAY(), amount: "", kind: "Advance", method: "UPI" });
  const [err, setErr] = useState("");
  const run = async (body: object) => { const r = await api(body); if (!r.ok) setErr(r.error || "Something went wrong."); else { setErr(""); reload(); } return r; };
  const m = p ? money(p) : null;
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNew && owner && String(p!.price) !== String(Number(f.price || 0)) && !confirm(`Change the price from ${inr(Number(p!.price || 0))} to ${inr(Number(f.price || 0))}?`)) return;
    const r = isNew ? await run({ action: "project.add", row: f }) : await run({ action: "project.update", id: p!.id, patch: owner ? f : { status: f.status, notes: f.notes } });
    if (r.ok && isNew) close();
  };
  return (
    <Sheet title={isNew ? "New project" : p!.client} onClose={close}>
      <div className="grid gap-4">
        {p?.client_whatsapp && <a className="for-btn !min-h-11 w-fit bg-[#25d366] text-white" target="_blank" rel="noopener noreferrer" href={`https://wa.me/91${String(p.client_whatsapp).slice(-10)}?text=${encodeURIComponent(`Hi ${String(p.client).split(" ")[0]}, an update on your MAKENDLESS project (${p.services}):`)}`}>WhatsApp client</a>}
        {m && owner && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Price" value={inr(Number(p!.price || 0))} /><Stat label="Advance" value={inr(m.adv)} /><Stat label="Balance" value={inr(m.bal)} /><Stat label="Pending" value={inr(m.pending)} tone={m.pending ? "text-[#c2183a]" : "text-[#0f6b4b]"} />
          </div>
        )}
        <Err text={err} />
        <form className={`${card} grid gap-3`} onSubmit={save}>
          <label className={lbl}>Status<select className="for-field" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{PROJECT_STATUS.map((s) => <option key={s}>{s}</option>)}</select></label>
          {owner && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={lbl}>Client<input className="for-field" required value={f.client} onChange={(e) => setF({ ...f, client: e.target.value })} /></label>
              <label className={lbl}>Client WhatsApp<input className="for-field" inputMode="tel" value={f.client_whatsapp} onChange={(e) => setF({ ...f, client_whatsapp: e.target.value })} /></label>
              <label className={lbl}>Studio<select className="for-field" value={f.studio} onChange={(e) => setF({ ...f, studio: e.target.value })}>{["", "CREATE", "BUILD", "CREATE + BUILD", "GROW"].map((s) => <option key={s} value={s}>{s || "—"}</option>)}</select></label>
              <label className={lbl}>Service(s)<input className="for-field" value={f.services} onChange={(e) => setF({ ...f, services: e.target.value })} /></label>
              <label className={lbl}>Price (₹)<input className="for-field" inputMode="numeric" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></label>
              <label className={lbl}>Delivery date<input className="for-field" type="date" value={f.delivery_date || ""} onChange={(e) => setF({ ...f, delivery_date: e.target.value })} /></label>
              <label className={lbl}>Assigned member<MemberSelect value={f.assigned_to} team={d.team} onChange={(v) => setF({ ...f, assigned_to: v })} /></label>
              <label className={lbl}>Team payout (₹)<input className="for-field" inputMode="numeric" value={f.team_payout} onChange={(e) => setF({ ...f, team_payout: e.target.value })} /></label>
            </div>
          )}
          {!owner && p && <p className="text-sm">{p.services} · due {nice(p.delivery_date)} · your payout {inr(Number(p.team_payout || 0))}{p.payout_done ? " (paid)" : ""}</p>}
          <label className={lbl}>Notes<textarea className="for-field for-area-sm" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></label>
          <button className="for-btn for-btn-primary">{isNew ? "Add project" : "Save"}</button>
        </form>
        {p && owner && (
          <>
            <div className={`${card} grid gap-3`}>
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-extrabold">Payments</p>
                <label className="flex min-h-11 items-center gap-2 text-sm font-bold"><input type="checkbox" checked={!!p.payout_done} onChange={(e) => run({ action: "project.update", id: p.id, patch: { payout_done: e.target.checked } })} /> Team payout done{p.payout_date ? ` (${nice(p.payout_date)})` : ""}</label>
              </div>
              <ul className="grid gap-1 text-sm">{((p.payments as Row[]) || []).map((x) => <li key={x.id} className="flex items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2"><span>{nice(x.date)} · {x.kind} · {x.method}</span><span className="flex items-center gap-2 font-bold">{inr(Number(x.amount))}<button type="button" aria-label="Delete payment" className="px-2 text-[#c2183a]" onClick={() => confirmDelete() && run({ action: "delete", entity: "payment", id: x.id })}>×</button></span></li>)}
                {!(p.payments as Row[])?.length && <li className="text-muted-dark">No payments yet.</li>}</ul>
              <form className="grid grid-cols-2 gap-2 sm:grid-cols-5" onSubmit={async (e) => { e.preventDefault(); const r = await run({ action: "payment.add", row: { ...pay, project_id: p.id } }); if (r.ok) setPay({ ...pay, amount: "" }); }}>
                <input className="for-field" type="date" aria-label="Payment date" value={pay.date} onChange={(e) => setPay({ ...pay, date: e.target.value })} />
                <input className="for-field" inputMode="numeric" placeholder="Amount ₹" aria-label="Amount" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
                <select className="for-field" aria-label="Type" value={pay.kind} onChange={(e) => setPay({ ...pay, kind: e.target.value })}>{["Advance", "Balance", "Other"].map((s) => <option key={s}>{s}</option>)}</select>
                <select className="for-field" aria-label="Paid by" value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>{["UPI", "Payment link", "Cash", "Bank transfer"].map((s) => <option key={s}>{s}</option>)}</select>
                <button className="for-btn for-btn-primary col-span-2 sm:col-span-1">Record payment</button>
              </form>
            </div>
            <button type="button" className="for-btn for-btn-ghost text-[#c2183a]" onClick={async () => { if (confirmDelete() && (await run({ action: "delete", entity: "project", id: p.id })).ok) close(); }}>Delete project</button>
          </>
        )}
      </div>
    </Sheet>
  );
}

function Projects({ d, reload, openId, setOpenId }: { d: Data; reload: () => void; openId: string; setOpenId: (id: string) => void }) {
  const owner = d.me.role === "Owner";
  const [status, setStatus] = useState("All");
  const [adding, setAdding] = useState(false);
  const rows = d.projects.filter((p) => status === "All" || p.status === status);
  const open = d.projects.find((p) => p.id === openId);
  const cols: Col[] = [
    { label: "Client", get: (p) => <b>{p.client}</b>, raw: (p) => p.client },
    { label: "Studio", get: (p) => p.studio || "—" },
    { label: "Service(s)", get: (p) => p.services || "—" },
    ...(owner ? [
      { label: "Price", get: (p: Row) => inr(Number(p.price || 0)), raw: (p: Row) => Number(p.price || 0) },
      { label: "Advance", get: (p: Row) => inr(money(p).adv), raw: (p: Row) => money(p).adv },
      { label: "Balance", get: (p: Row) => inr(money(p).bal), raw: (p: Row) => money(p).bal },
      { label: "Pending", get: (p: Row) => <span className={money(p).pending ? "font-bold text-[#c2183a]" : ""}>{inr(money(p).pending)}</span>, raw: (p: Row) => money(p).pending },
    ] : []),
    { label: "Delivery", get: (p) => nice(p.delivery_date), raw: (p) => p.delivery_date || "" },
    { label: "Assigned", get: (p) => memberName(p.assigned_to, d.team), raw: (p) => p.assigned_to || "" },
    { label: "Payout", get: (p) => inr(Number(p.team_payout || 0)), raw: (p) => Number(p.team_payout || 0) },
    { label: "Payout done", get: (p) => (p.payout_done ? "Yes" : "No") },
    { label: "Status", get: (p) => p.status },
  ];
  return (
    <div className="grid gap-3">
      <div className="flex gap-2 overflow-x-auto pb-1">{["All", ...PROJECT_STATUS].map((s) => <button type="button" key={s} className={chip(status === s)} onClick={() => setStatus(s)}>{s}</button>)}</div>
      <List name="Projects" cols={cols} rows={rows} onOpen={(p) => setOpenId(p.id)} tools={owner && <><button type="button" className="for-btn for-btn-primary !min-h-10 !px-4 text-sm" onClick={() => setAdding(true)}>+ Add project</button><ImportCsv entity="projects" done={reload} /></>} />
      {open && <ProjectSheet key={open.id + open.updated_at + ((open.payments as Row[]) || []).length} p={open} d={d} close={() => setOpenId("")} reload={reload} />}
      {adding && <ProjectSheet p={null} d={d} close={() => setAdding(false)} reload={reload} />}
    </div>
  );
}

/* ---------------- Expenses ---------------- */
function Expenses({ d, reload }: { d: Data; reload: () => void }) {
  const [edit, setEdit] = useState<Row | null>(null);
  const [err, setErr] = useState("");
  const cols: Col[] = [
    { label: "Date", get: (e) => nice(e.date), raw: (e) => e.date },
    { label: "Item", get: (e) => <b>{e.item}</b>, raw: (e) => e.item },
    { label: "Category", get: (e) => e.category },
    { label: "Amount", get: (e) => inr(Number(e.amount || 0)), raw: (e) => Number(e.amount || 0) },
    { label: "Paid by", get: (e) => e.paid_by || "—", raw: (e) => e.paid_by },
    { label: "Notes", get: (e) => e.notes || "—", raw: (e) => e.notes },
  ];
  return (
    <>
      <List name="Expenses" cols={cols} rows={d.expenses || []} onOpen={(e) => setEdit({ ...e })} tools={<><button type="button" className="for-btn for-btn-primary !min-h-10 !px-4 text-sm" onClick={() => setEdit({ date: TODAY(), item: "", category: "Software & tools", amount: "", paid_by: "", notes: "" })}>+ Add expense</button><ImportCsv entity="expenses" done={reload} /></>} />
      {edit && (
        <Sheet title={edit.id ? "Edit expense" : "Add expense"} onClose={() => setEdit(null)}>
          <form className="grid gap-3" onSubmit={async (e) => { e.preventDefault(); const r = await api({ action: "expense.save", row: edit }); if (!r.ok) return setErr(r.error || "Couldn't save."); reload(); setEdit(null); }}>
            <label className={lbl}>Date<input className="for-field" type="date" value={edit.date} onChange={(e) => setEdit({ ...edit, date: e.target.value })} /></label>
            <label className={lbl}>Item<input className="for-field" required value={edit.item} onChange={(e) => setEdit({ ...edit, item: e.target.value })} /></label>
            <label className={lbl}>Category<select className="for-field" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label className={lbl}>Amount (₹)<input className="for-field" inputMode="numeric" value={edit.amount} onChange={(e) => setEdit({ ...edit, amount: e.target.value })} /></label>
            <label className={lbl}>Paid by<input className="for-field" value={edit.paid_by} onChange={(e) => setEdit({ ...edit, paid_by: e.target.value })} /></label>
            <label className={lbl}>Notes<textarea className="for-field for-area-sm" value={edit.notes} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} /></label>
            <Err text={err} />
            <button className="for-btn for-btn-primary">Save</button>
            {edit.id && <button type="button" className="for-btn for-btn-ghost text-[#c2183a]" onClick={async () => { if (confirmDelete() && (await api({ action: "delete", entity: "expense", id: edit.id })).ok) { reload(); setEdit(null); } }}>Delete expense</button>}
          </form>
        </Sheet>
      )}
    </>
  );
}

/* ---------------- passwords ---------------- */
/** Owner sets a member's password (or `self` = the logged-in person changes their own). */
function SetPassword({ email, self }: { email?: string; self?: boolean }) {
  const [p, setP] = useState("");
  const [p2, setP2] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (p.length < 8) return setMsg({ ok: false, text: "Use at least 8 characters." });
    if (self && p !== p2) return setMsg({ ok: false, text: "The two passwords don't match." });
    setBusy(true);
    const r = await api(self ? { action: "password.change", password: p } : { action: "member.password", email, password: p });
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: self ? "Password changed." : "Password set. Send it to them privately (WhatsApp)." } : { ok: false, text: r.error || "Couldn't save." });
    if (r.ok) { setP(""); setP2(""); }
  };
  /* Not a <form>: this sits inside the member form, and forms can't be nested. */
  return (
    <div className="grid gap-2 rounded-xl bg-paper p-3">
      <p className="text-sm font-extrabold">{self ? "Change my password" : "Set a new login password"}</p>
      <input className="for-field" type={self ? "password" : "text"} autoComplete="new-password" aria-label="New password" placeholder="New password (8+ characters)" value={p} onChange={(e) => setP(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }} />
      {self && <input className="for-field" type="password" autoComplete="new-password" aria-label="Type it again" placeholder="Type it again" value={p2} onChange={(e) => setP2(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }} />}
      <button type="button" className="for-btn for-btn-ghost w-fit" disabled={busy || !p} onClick={submit}>{busy ? "Saving…" : self ? "Change password" : "Set password"}</button>
      {msg && <p role="status" className={`text-sm font-bold ${msg.ok ? "text-[#0f6b4b]" : "for-error"}`}>{msg.text}</p>}
    </div>
  );
}

/* ---------------- Team (members + payouts) ---------------- */
function Members({ d, reload }: { d: Data; reload: () => void }) {
  const [edit, setEdit] = useState<Row | null>(null);
  const [err, setErr] = useState("");
  return (
    <div className={`${card} grid gap-3`}>
      <div className="flex items-center justify-between gap-2"><p className="font-extrabold">Team members and roles</p><button type="button" className="for-btn for-btn-primary !min-h-10 !px-4 text-sm" onClick={() => setEdit({ email: "", name: "", whatsapp: "", role: "Team member", active: true, isNew: true })}>+ Add member</button></div>
      <p className="text-xs text-muted-dark">Each member logs in at /admin with their email and a password. Open a member to set or reset their password, then send it to them on WhatsApp.</p>
      <ul className="grid gap-2">{d.team.map((t) => <li key={t.email}><button type="button" className="flex min-h-12 w-full flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2 text-left text-sm" onClick={() => setEdit({ ...t })}><span><b>{t.name || t.email}</b> · {t.email}</span><span className={t.active ? "" : "text-muted-dark"}>{t.role}{t.active ? "" : " · inactive"}</span></button></li>)}</ul>
      {edit && (
        <Sheet title={edit.isNew ? "Add member" : "Edit member"} onClose={() => setEdit(null)}>
          <form className="grid gap-3" onSubmit={async (e) => {
            e.preventDefault();
            if (!edit.isNew && !confirm("Save these changes to this member?")) return;
            const r = await api({ action: "team.save", row: edit }); if (!r.ok) return setErr(r.error || "Couldn't save.");
            if (edit.isNew && edit.password) { const p = await api({ action: "member.password", email: edit.email, password: edit.password }); if (!p.ok) { reload(); return setErr(`Member saved, but the password wasn't: ${p.error || "try again"}`); } }
            reload(); setEdit(null);
          }}>
            <label className={lbl}>Email<input className="for-field" type="email" required readOnly={!edit.isNew} value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></label>
            <label className={lbl}>Name<input className="for-field" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></label>
            <label className={lbl}>WhatsApp<input className="for-field" inputMode="tel" value={edit.whatsapp || ""} onChange={(e) => setEdit({ ...edit, whatsapp: e.target.value })} /></label>
            <label className={lbl}>Role<select className="for-field" value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })}><option>Team member</option><option>Owner</option></select></label>
            <label className="flex min-h-11 items-center gap-2 text-sm font-bold"><input type="checkbox" checked={edit.active !== false} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> Active (can log in)</label>
            {edit.isNew && <label className={lbl}>Login password (at least 8 characters)<input className="for-field" type="text" autoComplete="new-password" minLength={8} value={edit.password || ""} onChange={(e) => setEdit({ ...edit, password: e.target.value })} placeholder="Leave empty to set it later" /></label>}
            <Err text={err} />
            <button className="for-btn for-btn-primary">Save member</button>
            {!edit.isNew && <SetPassword email={edit.email} />}
            {!edit.isNew && <button type="button" className="for-btn for-btn-ghost text-[#c2183a]" onClick={async () => { if (!confirmDelete()) return; const r = await api({ action: "delete", entity: "member", id: edit.email }); if (!r.ok) return setErr(r.error || "Couldn't remove."); reload(); setEdit(null); }}>Remove member</button>}
          </form>
        </Sheet>
      )}
    </div>
  );
}

function Team({ d, reload }: { d: Data; reload: () => void }) {
  const cols: Col[] = [
    { label: "Name", get: (t) => <b>{t.name || "—"}</b>, raw: (t) => t.name },
    { label: "Role", get: (t) => t.role },
    { label: "Email", get: (t) => t.email },
    { label: "WhatsApp", get: (t) => t.whatsapp || "—", raw: (t) => t.whatsapp },
    { label: "Active", get: (t) => (t.active ? "Yes" : "No") },
    { label: "Payouts owed", get: (t) => inr(owed(t)), raw: (t) => owed(t) },
    { label: "Payouts paid", get: (t) => inr(paid(t)), raw: (t) => paid(t) },
  ];
  function owed(t: Row) { return d.projects.filter((p) => p.assigned_to === t.email && !p.payout_done).reduce((s, p) => s + Number(p.team_payout || 0), 0); }
  function paid(t: Row) { return d.projects.filter((p) => p.assigned_to === t.email && p.payout_done).reduce((s, p) => s + Number(p.team_payout || 0), 0); }
  return <div className="grid gap-4"><List name="Team" cols={cols} rows={d.team} /><Members d={d} reload={reload} /></div>;
}

/* ---------------- Referrals ---------------- */
function Referrals({ d, reload, go }: { d: Data; reload: () => void; go: (tab: string, id?: string) => void }) {
  const reward = Number(d.settings?.referral_reward || 500), min = Number(d.settings?.referral_min || 2000);
  const [openCode, setOpenCode] = useState("");
  const projectOf = (l: Row) => d.projects.find((p) => p.lead_id === l.id || (l.project_id && p.id === l.project_id));
  /* Leads brought = every lead that came in with this code (the website re-checks codes before saving them). */
  const brought = (code: string) => d.leads.filter((l) => l.referral_code === code);
  const won = (code: string) => brought(code).filter((l) => l.status === "Won");
  const owed = (c: Row) => Number(c.credits_earned || 0) - Number(c.credits_used || 0);
  const rows = [...(d.codes || [])].sort((a, b) => brought(b.code).length - brought(a.code).length || String(b.created_at).localeCompare(String(a.created_at)));
  const total = rows.reduce((s, c) => s + brought(c.code).length, 0);
  const cols: Col[] = [
    { label: "Referrer", get: (c) => <b>{c.referrer_name}</b>, raw: (c) => c.referrer_name },
    { label: "WhatsApp", get: (c) => <a href={`https://wa.me/91${String(c.referrer_whatsapp).slice(-10)}`} target="_blank" rel="noopener noreferrer" onClick={stop} className="font-bold text-[#0f6b4b] underline">{c.referrer_whatsapp}</a>, raw: (c) => c.referrer_whatsapp },
    { label: "Code", get: (c) => <span className="whitespace-nowrap">{c.code}</span>, raw: (c) => c.code },
    { label: "Joined", get: (c) => <span className="whitespace-nowrap">{nice(c.created_at)}</span>, raw: (c) => String(c.created_at).slice(0, 10) },
    { label: "Leads brought", get: (c) => { const n = brought(c.code).length; return n ? <span className="font-extrabold">{n} · see leads →</span> : "0"; }, raw: (c) => brought(c.code).length },
    { label: "Won", get: (c) => String(won(c.code).length), raw: (c) => won(c.code).length },
    { label: "Rewards earned", get: (c) => inr(Number(c.credits_earned || 0)), raw: (c) => Number(c.credits_earned || 0) },
    { label: "Given", get: (c) => inr(Number(c.credits_used || 0)), raw: (c) => Number(c.credits_used || 0) },
    { label: "Owed", get: (c) => { const o = owed(c); return o >= reward ? <button type="button" className="for-btn for-btn-ghost !min-h-9 !px-3 text-xs" onClick={async (e) => { e.stopPropagation(); if (confirm(`Mark ${inr(reward)} reward as given to ${c.referrer_name}?`)) { await api({ action: "credit.use", code: c.code }); reload(); } }}>{inr(o)} · Mark {inr(reward)} given</button> : inr(Math.max(0, o)); }, raw: (c) => owed(c) },
  ];
  const open = rows.find((c) => c.code === openCode);
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-3 gap-3"><Stat label="Referrers" value={String(rows.length)} /><Stat label="Leads they brought" value={String(total)} /><Stat label="Won" value={String(rows.reduce((s, c) => s + won(c.code).length, 0))} /></div>
      <p className="text-sm text-muted-dark">Click a referrer to see the leads they brought. A reward of {inr(reward)} is earned when a referred client&apos;s project of {inr(min)} or more is fully paid. Change these numbers in Settings.</p>
      <List name="Referrals" cols={cols} rows={rows} onOpen={(c) => setOpenCode(c.code)} />
      {open && (
        <Sheet title={`${open.referrer_name} · ${open.code}`} onClose={() => setOpenCode("")}>
          <div className="grid gap-4">
            <a href={`https://wa.me/91${String(open.referrer_whatsapp).slice(-10)}`} target="_blank" rel="noopener noreferrer" className="for-btn !min-h-11 w-fit bg-[#25d366] text-white">WhatsApp {open.referrer_name.split(" ")[0]}</a>
            <div className="grid grid-cols-3 gap-3"><Stat label="Leads brought" value={String(brought(open.code).length)} /><Stat label="Won" value={String(won(open.code).length)} /><Stat label="Reward owed" value={inr(Math.max(0, owed(open)))} /></div>
            <p className="text-sm text-muted-dark">Joined {nice(open.created_at)} · {open.referrer_whatsapp}</p>
            <div className="grid gap-2">
              <p className="font-extrabold">Leads they brought</p>
              {brought(open.code).map((l) => { const p = projectOf(l); return (
                <button type="button" key={l.id} onClick={() => go("Leads", l.id)} className="grid gap-1 rounded-xl bg-white p-3 text-left text-sm ring-1 ring-line hover:ring-violet">
                  <span className="flex flex-wrap items-center justify-between gap-2"><b>{l.name}</b><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_TONE[l.status] || ""}`}>{l.status}</span></span>
                  <span className="text-muted-dark">{nice(l.created_at)} · {l.whatsapp || l.email || "—"} · {services(l).join(", ") || "—"}</span>
                  <span>Quote: <b>{quote(l)}</b>{p ? ` · Project ${inr(Number(p.price || 0))}${Number(p.price || 0) < min ? " (under the reward minimum)" : ""}` : ""}</span>
                </button>
              ); })}
              {!brought(open.code).length && <p className="text-sm text-muted-dark">No leads with this code yet.</p>}
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
}

/* ---------------- Website content ---------------- */
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `item-${Date.now()}`;
const uid = () => Math.random().toString(36).slice(2, 10);
function move<T>(arr: T[], i: number, dir: -1 | 1) { const a = [...arr]; const j = i + dir; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; }
const Up = ({ onUp, onDown }: { onUp: () => void; onDown: () => void }) => <span className="flex gap-1"><button type="button" aria-label="Move up" className="for-btn for-btn-ghost !min-h-9 !px-3" onClick={onUp}>↑</button><button type="button" aria-label="Move down" className="for-btn for-btn-ghost !min-h-9 !px-3" onClick={onDown}>↓</button></span>;

function Website({ d, reload }: { d: Data; reload: () => void }) {
  const [c, setC] = useState<SiteContent>(() => JSON.parse(JSON.stringify(d.content)));
  const [part, setPart] = useState("Services & prices");
  const [msg, setMsg] = useState("");
  const set = (next: Partial<SiteContent>) => setC({ ...c, ...next });
  const before = d.content!;
  const priceChanges = c.services.flatMap((s) => s.options).filter((o) => { const p = before.services.flatMap((x) => x.options).find((x) => x.id === o.id); return p && p.price !== o.price; });
  const save = async () => {
    if (priceChanges.length && !confirm(`You changed ${priceChanges.length} price${priceChanges.length > 1 ? "s" : ""} (${priceChanges.map((o) => o.name).join(", ")}). The live website updates within a minute. Are you sure?`)) return;
    const r = await api({ action: "content.save", content: c });
    setMsg(r.ok ? "Saved. The live website shows it within a minute." : r.error || "Couldn't save."); if (r.ok) reload();
  };
  const optionIds = c.services.flatMap((s) => s.options.map((o) => ({ id: o.id, name: o.name })));
  return (
    <div className="grid gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">{["Services & prices", "Combo packs", "FAQ", "Work samples", "Reviews"].map((p) => <button type="button" key={p} className={chip(part === p)} onClick={() => setPart(p)}>{p}</button>)}</div>
      <div className="sticky top-[6.5rem] z-20 flex flex-wrap items-center gap-2 rounded-2xl bg-white/95 p-3 ring-1 ring-line backdrop-blur">
        <button type="button" className="for-btn for-btn-primary !min-h-11" onClick={save}>Save to website</button>
        <button type="button" className="for-btn for-btn-ghost !min-h-11" onClick={() => setC(JSON.parse(JSON.stringify(d.content)))}>Undo my changes</button>
        {msg && <span className="text-sm font-bold" role="status">{msg}</span>}
      </div>

      {part === "Services & prices" && c.services.map((s, si) => {
        const setS = (ns: Partial<typeof s>) => { const a = [...c.services]; a[si] = { ...s, ...ns }; set({ services: a }); };
        return (
          <details key={s.id} className={card} open={si === 0}>
            <summary className="flex min-h-11 cursor-pointer items-center justify-between font-extrabold">{s.name} <span className="text-xs font-bold text-muted-dark">{s.studio.toUpperCase()}</span></summary>
            <div className="mt-3 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className={lbl}>Service name<input className="for-field" value={s.name} onChange={(e) => setS({ name: e.target.value })} /></label>
                <label className={lbl}>Short line<input className="for-field" value={s.line} onChange={(e) => setS({ line: e.target.value })} /></label>
                <label className={lbl}>Tag (optional)<input className="for-field" value={s.tag || ""} onChange={(e) => setS({ tag: e.target.value || undefined })} /></label>
              </div>
              <p className="text-sm font-extrabold">Options</p>
              {s.options.map((o, oi) => {
                const setO = (no: Partial<typeof o>) => { const a = [...s.options]; a[oi] = { ...o, ...no }; setS({ options: a }); };
                return (
                  <div key={o.id} className="grid gap-2 rounded-xl bg-paper p-3 sm:grid-cols-[2fr_1fr_1fr_1.4fr_.7fr_auto]">
                    <label className={lbl}>Option<input className="for-field" value={o.name} onChange={(e) => setO({ name: e.target.value })} /></label>
                    <label className={lbl}>Price ₹ (blank = custom)<input className="for-field" inputMode="numeric" value={o.price ?? ""} onChange={(e) => setO({ price: e.target.value.trim() === "" ? null : Math.max(0, Math.round(Number(e.target.value.replace(/\D/g, "")))) })} /></label>
                    <label className={lbl}>Per<select className="for-field" value={o.unit} onChange={(e) => setO({ unit: e.target.value as typeof o.unit })}><option value="one">project</option><option value="each">each</option><option value="month">month</option><option value="issue">issue</option></select></label>
                    <label className={lbl}>Delivery time<input className="for-field" value={o.delivery} onChange={(e) => setO({ delivery: e.target.value })} /></label>
                    <label className={lbl}>Days<input className="for-field" inputMode="numeric" value={o.days ?? ""} onChange={(e) => setO({ days: e.target.value === "" ? null : Number(e.target.value.replace(/\D/g, "")) })} /></label>
                    <div className="flex items-end gap-2">
                      <label className="flex min-h-11 items-center gap-1 text-xs font-bold"><input type="checkbox" checked={!!o.popular} onChange={(e) => setO({ popular: e.target.checked })} />Show first</label>
                      <button type="button" aria-label={`Remove ${o.name}`} className="for-btn for-btn-ghost !min-h-10 !px-3 text-[#c2183a]" onClick={() => confirm(`Remove ${o.name} from the website?`) && setS({ options: s.options.filter((_, i) => i !== oi) })}>×</button>
                    </div>
                  </div>
                );
              })}
              <button type="button" className="for-btn for-btn-ghost w-fit !min-h-10 text-sm" onClick={() => { const name = prompt("New option name"); if (name) setS({ options: [...s.options, { id: slug(`${s.id}-${name}`), name, price: 0, unit: "one", delivery: "", days: 0 }] }); }}>+ Add option</button>
              {s.extras.length > 0 && <p className="text-sm font-extrabold">Extras</p>}
              {s.extras.map((x, xi) => (
                <div key={x.id} className="grid grid-cols-[2fr_1fr_auto] items-end gap-2">
                  <label className={lbl}>Extra<input className="for-field" value={x.name} onChange={(e) => { const a = [...s.extras]; a[xi] = { ...x, name: e.target.value }; setS({ extras: a }); }} /></label>
                  <label className={lbl}>Price ₹<input className="for-field" inputMode="numeric" value={x.price} onChange={(e) => { const a = [...s.extras]; a[xi] = { ...x, price: Number(e.target.value.replace(/\D/g, "")) || 0 }; setS({ extras: a }); }} /></label>
                  <label className="flex min-h-11 items-center gap-1 text-xs font-bold"><input type="checkbox" checked={!!x.monthly} onChange={(e) => { const a = [...s.extras]; a[xi] = { ...x, monthly: e.target.checked }; setS({ extras: a }); }} />Monthly</label>
                </div>
              ))}
            </div>
          </details>
        );
      })}

      {part === "Combo packs" && (
        <div className="grid gap-3">
          {c.combos.map((k, ki) => {
            const setK = (nk: Partial<typeof k>) => { const a = [...c.combos]; const merged = { ...k, ...nk }; merged.save = Math.max(0, merged.normal - merged.price); a[ki] = merged; set({ combos: a }); };
            return (
              <div key={k.id} className={`${card} grid gap-3`}>
                <div className="flex items-center justify-between gap-2"><b>{k.name}</b><Up onUp={() => set({ combos: move(c.combos, ki, -1) })} onDown={() => set({ combos: move(c.combos, ki, 1) })} /></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className={lbl}>Name<input className="for-field" value={k.name} onChange={(e) => setK({ name: e.target.value })} /></label>
                  <label className={lbl}>Tag<input className="for-field" value={k.tag || ""} onChange={(e) => setK({ tag: e.target.value || undefined })} /></label>
                  <label className={`${lbl} sm:col-span-2`}>What&apos;s inside (shown on the site)<input className="for-field" value={k.inside} onChange={(e) => setK({ inside: e.target.value })} /></label>
                  <label className={lbl}>Pack price ₹<input className="for-field" inputMode="numeric" value={k.price} onChange={(e) => setK({ price: Number(e.target.value.replace(/\D/g, "")) || 0 })} /></label>
                  <label className={lbl}>Normal price ₹<input className="for-field" inputMode="numeric" value={k.normal} onChange={(e) => setK({ normal: Number(e.target.value.replace(/\D/g, "")) || 0 })} /></label>
                </div>
                <label className="flex min-h-11 items-center gap-2 text-sm font-bold"><input type="checkbox" checked={!!k.monthly} onChange={(e) => setK({ monthly: e.target.checked })} /> Price is per month</label>
                <p className="text-sm">Saves {inr(k.save)} · Applied automatically when the selection contains:</p>
                {k.items.map((it, ii) => (
                  <div key={ii} className="grid grid-cols-[1fr_5rem_auto] gap-2">
                    <select className="for-field" aria-label="Option" value={it.id} onChange={(e) => { const a = [...k.items]; a[ii] = { ...it, id: e.target.value }; setK({ items: a }); }}>{optionIds.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
                    <input className="for-field" aria-label="Quantity" inputMode="numeric" value={it.qty} onChange={(e) => { const a = [...k.items]; a[ii] = { ...it, qty: Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1) }; setK({ items: a }); }} />
                    <button type="button" aria-label="Remove item" className="for-btn for-btn-ghost !min-h-10 !px-3" onClick={() => setK({ items: k.items.filter((_, i) => i !== ii) })}>×</button>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="for-btn for-btn-ghost !min-h-10 text-sm" onClick={() => setK({ items: [...k.items, { id: optionIds[0].id, qty: 1 }] })}>+ Add item</button>
                  <button type="button" className="for-btn for-btn-ghost !min-h-10 text-sm text-[#c2183a]" onClick={() => confirm(`Remove the ${k.name} from the website?`) && set({ combos: c.combos.filter((_, i) => i !== ki) })}>Remove pack</button>
                </div>
              </div>
            );
          })}
          <button type="button" className="for-btn for-btn-ghost w-fit" onClick={() => { const name = prompt("Pack name"); if (name) set({ combos: [...c.combos, { id: slug(name), name, inside: "", items: [{ id: optionIds[0].id, qty: 1 }], normal: 0, price: 0, save: 0 }] }); }}>+ Add combo pack</button>
        </div>
      )}

      {part === "FAQ" && (
        <div className="grid gap-3">
          <p className="text-sm text-muted-dark">You can write {"{websiteCare}"}, {"{referralMin}"} or {"{referralReward}"} in an answer: the site fills in the current price.</p>
          {c.faq.map((g, gi) => {
            const setG = (ng: Partial<typeof g>) => { const a = [...c.faq]; a[gi] = { ...g, ...ng }; set({ faq: a }); };
            return (
              <div key={gi} className={`${card} grid gap-3`}>
                <label className={lbl}>Group<input className="for-field" value={g.title} onChange={(e) => setG({ title: e.target.value })} /></label>
                {g.items.map((it, ii) => {
                  const setI = (ni: Partial<typeof it>) => { const a = [...g.items]; a[ii] = { ...it, ...ni }; setG({ items: a }); };
                  return (
                    <div key={ii} className="grid gap-2 rounded-xl bg-paper p-3">
                      <input className="for-field font-bold" aria-label="Question" value={it.q} onChange={(e) => setI({ q: e.target.value })} />
                      <textarea className="for-field for-area-sm" aria-label="Answer" value={it.a} onChange={(e) => setI({ a: e.target.value })} />
                      {it.list && <textarea className="for-field for-area-sm" aria-label="Bullet points, one per line" value={it.list.join("\n")} onChange={(e) => setI({ list: e.target.value.split("\n") })} />}
                      <div className="flex flex-wrap justify-between gap-2"><Up onUp={() => setG({ items: move(g.items, ii, -1) })} onDown={() => setG({ items: move(g.items, ii, 1) })} /><button type="button" className="for-btn for-btn-ghost !min-h-9 !px-3 text-sm text-[#c2183a]" onClick={() => confirm("Remove this question?") && setG({ items: g.items.filter((_, i) => i !== ii) })}>Remove</button></div>
                    </div>
                  );
                })}
                <button type="button" className="for-btn for-btn-ghost w-fit !min-h-10 text-sm" onClick={() => setG({ items: [...g.items, { q: "New question", a: "" }] })}>+ Add question</button>
              </div>
            );
          })}
        </div>
      )}

      {part === "Work samples" && (
        <div className="grid gap-3">
          <p className="text-sm text-muted-dark">Real work (reels and websites) now lives in one file, <code>data/work.ts</code>, so every reel keeps its video, poster and tags. To add a project, ask Claude to add one entry there (send the video link and poster, or the website link). It then shows on /work, the homepage, /create or /build, and the chatbot knows it.</p>
          <ul className="grid gap-2">
            {[...WORK.reels.map((r) => ({ k: `r-${r.id}`, kind: "Reel", title: r.title, url: r.video })), ...WORK.sites.map((x) => ({ k: `s-${x.id}`, kind: "Website", title: x.name, url: x.url }))].map((w) => (
              <li key={w.k} className={`${card} flex flex-wrap items-center justify-between gap-2`}><span><b>{w.title}</b> <span className="text-sm text-muted-dark">· {w.kind}</span></span><a href={w.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-violet underline">Open ↗</a></li>
            ))}
          </ul>
        </div>
      )}

      {part === "Reviews" && (
        <div className="grid gap-3">
          <p className="text-sm text-muted-dark">The reviews section appears on the homepage only when at least one visible review exists. Only add real reviews from real clients.</p>
          {c.reviews.map((r, ri) => {
            const setR = (nr: Partial<typeof r>) => { const a = [...c.reviews]; a[ri] = { ...r, ...nr }; set({ reviews: a }); };
            return (
              <div key={r.id} className={`${card} grid gap-2`}>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className={lbl}>Client name<input className="for-field" value={r.name} onChange={(e) => setR({ name: e.target.value })} /></label>
                  <label className={lbl}>Business or role<input className="for-field" value={r.role || ""} onChange={(e) => setR({ role: e.target.value || undefined })} /></label>
                </div>
                <label className={lbl}>Review<textarea className="for-field for-area-sm" value={r.text} onChange={(e) => setR({ text: e.target.value })} /></label>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex min-h-11 items-center gap-2 text-sm font-bold"><input type="checkbox" checked={!!r.hidden} onChange={(e) => setR({ hidden: e.target.checked })} /> Hidden</label>
                  <Up onUp={() => set({ reviews: move(c.reviews, ri, -1) })} onDown={() => set({ reviews: move(c.reviews, ri, 1) })} />
                  <button type="button" className="for-btn for-btn-ghost !min-h-9 !px-3 text-sm text-[#c2183a]" onClick={() => confirm("Delete this review? It goes to Trash when you save.") && set({ reviews: c.reviews.filter((_, i) => i !== ri) })}>Delete</button>
                </div>
              </div>
            );
          })}
          <button type="button" className="for-btn for-btn-ghost w-fit" onClick={() => set({ reviews: [...c.reviews, { id: uid(), name: "", text: "" }] })}>+ Add review</button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Reports, Trash, Activity, Settings ---------------- */
function Reports({ d }: { d: Data }) {
  const target = Number(d.settings?.monthly_target || 100000);
  const rows = lastMonths(12).map((k) => ({ k, ...monthStats(d, k) }));
  const cols: Col[] = [
    { label: "Month", get: (r) => monthName(r.k), raw: (r) => r.k },
    { label: "Projects", get: (r) => String(r.projects), raw: (r) => r.projects },
    { label: "Sales", get: (r) => inr(r.sales), raw: (r) => r.sales },
    { label: "Collected", get: (r) => inr(r.collected), raw: (r) => r.collected },
    { label: "Team payouts", get: (r) => inr(r.payouts), raw: (r) => r.payouts },
    { label: "Expenses", get: (r) => inr(r.expenses), raw: (r) => r.expenses },
    { label: "Profit", get: (r) => <span className={r.profit < 0 ? "text-[#c2183a]" : ""}>{inr(r.profit)}</span>, raw: (r) => r.profit },
    { label: "Sales vs target", get: (r) => `${target ? Math.round((r.sales / target) * 100) : 0}%`, raw: (r) => (target ? Math.round((r.sales / target) * 100) : 0) },
  ];
  return <div className="grid gap-3"><p className="text-sm text-muted-dark">Last 12 months. Sales = price of projects started that month. Profit = collected − team payouts − expenses.</p><List name="Monthly summary" cols={cols} rows={rows} /></div>;
}

function Trash({ d, reload }: { d: Data; reload: () => void }) {
  const left = (t: Row) => Math.max(0, 30 - Math.floor((Date.now() - new Date(t.deleted_at).getTime()) / DAY));
  const cols: Col[] = [
    { label: "Item", get: (t) => <b>{t.label}</b>, raw: (t) => t.label },
    { label: "Deleted", get: (t) => `${nice(t.deleted_at)} by ${t.deleted_by}`, raw: (t) => t.deleted_at },
    { label: "Days left", get: (t) => String(left(t)), raw: (t) => left(t) },
    { label: "Actions", get: (t) => <span className="flex gap-2"><button type="button" className="for-btn for-btn-ghost !min-h-9 !px-3 text-xs" onClick={async () => { const r = await api({ action: "trash.restore", id: t.id }); if (!r.ok) alert(r.error); reload(); }}>Restore</button><button type="button" className="for-btn for-btn-ghost !min-h-9 !px-3 text-xs text-[#c2183a]" onClick={async () => { if (confirm("Delete forever? This cannot be undone.")) { await api({ action: "trash.purge", id: t.id }); reload(); } }}>Delete forever</button></span>, raw: () => "" },
  ];
  return <div className="grid gap-3"><p className="text-sm text-muted-dark">Deleted items stay here for 30 days, then they are removed for good.</p><List name="Trash" cols={cols} rows={d.trash || []} /></div>;
}

function Activity({ d }: { d: Data }) {
  const v = (x: unknown) => (x === null || x === undefined ? "" : typeof x === "string" ? x : JSON.stringify(x));
  const cols: Col[] = [
    { label: "When", get: (a) => new Date(a.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }), raw: (a) => a.created_at },
    { label: "Who", get: (a) => a.actor },
    { label: "What", get: (a) => `${a.action} · ${a.entity}` },
    { label: "Old value", get: (a) => <span className="break-all text-xs">{v(a.old_value).slice(0, 300) || "—"}</span>, raw: (a) => v(a.old_value) },
    { label: "New value", get: (a) => <span className="break-all text-xs">{v(a.new_value).slice(0, 300) || "—"}</span>, raw: (a) => v(a.new_value) },
  ];
  return <List name="Activity log" cols={cols} rows={d.activity || []} />;
}

function Settings({ d, reload }: { d: Data; reload: () => void }) {
  const [s, setS] = useState<Record<string, string>>({ ...d.settings });
  const [msg, setMsg] = useState("");
  const F = ({ k, label, type = "text" }: { k: string; label: string; type?: string }) => <label className={lbl}>{label}<input className="for-field" type={type} inputMode={["monthly_target", "referral_reward", "referral_min", "whatsapp"].includes(k) ? "numeric" : undefined} value={s[k] ?? ""} onChange={(e) => setS({ ...s, [k]: e.target.value })} /></label>;
  return (
    <div className="grid gap-4">
      <form className={`${card} grid gap-3`} onSubmit={async (e) => {
        e.preventDefault();
        const money = ["monthly_target", "referral_reward", "referral_min"].filter((k) => String(s[k]) !== String(d.settings?.[k]));
        if (money.length && !confirm("You are changing a price or amount. Are you sure?")) return;
        const r = await api({ action: "settings.save", settings: s }); setMsg(r.ok ? "Saved." : r.error || "Couldn't save."); reload();
      }}>
        <p className="font-extrabold">Settings</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {F({ k: "monthly_target", label: "Monthly target (₹)" })}
          {F({ k: "whatsapp", label: "Official WhatsApp number (shown on the site)" })}
          {F({ k: "email", label: "Official email (shown on the site)", type: "email" })}
          {F({ k: "alert_email", label: "Email for new-lead alerts", type: "email" })}
          {F({ k: "referral_reward", label: "Referral reward (₹)" })}
          {F({ k: "referral_min", label: "Referral minimum project value (₹)" })}
        </div>
        <p className="text-xs text-muted-dark">Leave WhatsApp or email empty to keep the ones in the code.</p>
        <button className="for-btn for-btn-primary w-fit">Save settings</button>
        {msg && <p role="status" className="text-sm font-bold">{msg}</p>}
      </form>
      <Members d={d} reload={reload} />
      <div className={`${card} grid gap-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-extrabold">Backups</p><button type="button" className="for-btn for-btn-ghost !min-h-10 text-sm" onClick={async () => { await api({ action: "backup.now" }); reload(); }}>Back up now</button></div>
        <p className="text-xs text-muted-dark">A full backup is made automatically every week (Sunday night). The last 8 are kept.</p>
        <ul className="grid gap-2">{(d.backups || []).map((b) => <li key={b.id} className="flex items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2 text-sm"><span>{new Date(b.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span><button type="button" className="font-bold underline" onClick={async () => { const r = await api({ action: "backup.get", id: b.id }); if (!r.ok) return alert(r.error); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(r.data, null, 2)], { type: "application/json" })); a.download = `MAKENDLESS backup ${String(b.created_at).slice(0, 10)}.json`; a.click(); }}>Download</button></li>)}
          {!(d.backups || []).length && <li className="text-sm text-muted-dark">No backups yet.</li>}</ul>
      </div>
    </div>
  );
}

/* ---------------- login + shell ---------------- */
function Login({ resetToken, note }: { resetToken?: string; note?: string }) {
  const [mode, setMode] = useState<"login" | "forgot" | "reset">(resetToken ? "reset" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(note ? { ok: false, text: note } : null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null);
    if (mode === "reset") {
      if (password.length < 8) return setMsg({ ok: false, text: "Use at least 8 characters." });
      if (password !== password2) return setMsg({ ok: false, text: "The two passwords don't match." });
    }
    setBusy(true);
    const r = mode === "login" ? await api({ action: "login", email, password })
      : mode === "forgot" ? await api({ action: "forgot", email })
      : await api({ action: "password.reset", token: resetToken, password });
    setBusy(false);
    if (!r.ok) return setMsg({ ok: false, text: r.error || "Something went wrong. Please try again." });
    if (mode === "forgot") return setMsg({ ok: true, text: r.dev ? "Local test mode: no email is sent. The password is makendless-dev." : "If this email is on the team, a reset link is on its way. Open it on this device (check Spam too)." });
    location.reload();
  };
  const field = (id: string, label: string, value: string, set: (v: string) => void, type: string, auto: string) => (
    <><label htmlFor={id} className="text-sm font-bold">{label}</label><input id={id} type={type} autoComplete={auto} required className="for-field" value={value} onChange={(e) => set(e.target.value)} /></>
  );
  return (
    <div className="mx-auto mt-10 max-w-md">
      <h1 className="text-3xl font-extrabold">{mode === "reset" ? "Choose a new password" : mode === "forgot" ? "Forgot password" : "Team login"}</h1>
      <p className="mt-2 text-muted-dark">{mode === "reset" ? "At least 8 characters. You'll be logged in right after." : mode === "forgot" ? "Enter your team email and we'll send a link to choose a new password." : "MAKENDLESS team only."}</p>
      <form className="mt-6 grid gap-3" onSubmit={submit}>
        {mode !== "reset" && field("adm-email", "Email", email, setEmail, "email", "username")}
        {mode === "login" && field("adm-pass", "Password", password, setPassword, show ? "text" : "password", "current-password")}
        {mode === "reset" && <>{field("adm-new", "New password", password, setPassword, show ? "text" : "password", "new-password")}{field("adm-new2", "Type it again", password2, setPassword2, show ? "text" : "password", "new-password")}</>}
        {mode !== "forgot" && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show password</label>}
        <button className="for-btn for-btn-primary" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : mode === "forgot" ? "Send reset link" : "Save and log in"}</button>
        {msg && <p role="alert" className={`text-sm font-bold ${msg.ok ? "text-[#0f6b4b]" : "for-error"}`}>{msg.text}</p>}
      </form>
      {mode !== "reset" && <button type="button" className="mt-4 min-h-11 text-sm font-bold underline" onClick={() => { setMode(mode === "login" ? "forgot" : "login"); setMsg(null); }}>{mode === "login" ? "Forgot password?" : "← Back to login"}</button>}
    </div>
  );
}

export default function AdminApp() {
  const [state, setState] = useState<"loading" | "login" | "ok">("loading");
  const [d, setD] = useState<Data | null>(null);
  const [tab, setTabState] = useState("Home");
  const [openId, setOpenId] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [note, setNote] = useState("");
  const [pwOpen, setPwOpen] = useState(false);
  const load = useCallback(async () => {
    const r = await fetch("/api/admin", { cache: "no-store" });
    const j = await r.json().catch(() => ({ ok: false }));
    if (!r.ok || !j.ok) return setState("login");
    setD(j); setState("ok");
  }, []);
  const tabs: readonly string[] = d?.me.role === "Owner" ? OWNER_TABS : TEAM_TABS;
  const setTab = useCallback((t: string, id = "") => {
    setTabState(t); setOpenId(id);
    const u = new URL(location.href); u.searchParams.set("tab", t); if (id) u.searchParams.set("id", id); else u.searchParams.delete("id"); u.searchParams.delete("lead");
    history.replaceState(null, "", u.pathname + u.search);
  }, []);
  useEffect(() => {
    (async () => {
      /* A "Forgot password" email link lands here with a one-time token (or an error) after the #. */
      const h = new URLSearchParams(location.hash.slice(1));
      if (h.get("access_token") || h.get("error")) {
        history.replaceState(null, "", location.pathname + location.search);
        if (h.get("access_token")) { setResetToken(h.get("access_token")!); setState("login"); return; }
        setNote("That link has expired or was already used. Ask for a new one with \"Forgot password?\".");
      }
      const sp = new URLSearchParams(location.search);
      const lead = sp.get("lead");
      if (lead) { setTabState("Leads"); setOpenId(lead); }
      else { if (sp.get("tab")) setTabState(sp.get("tab")!); if (sp.get("id")) setOpenId(sp.get("id")!); }
      load();
    })();
  }, [load]);
  /* A typed URL can't open an Owner tab for a Team member: it falls back to Home (and the API never sends that data). */
  const active = tabs.includes(tab) ? tab : "Home";
  const counts = useMemo(() => (d ? { Leads: d.leads.filter((l) => l.status === "New").length, Trash: d.trash?.length || 0 } : {}), [d]) as Record<string, number>;

  if (state === "loading") return <p className="mt-10 text-muted-dark">Loading…</p>;
  if (state === "login" || !d) return <Login resetToken={resetToken} note={note} />;
  return (
    <div>
      <nav aria-label="Control room" className="sticky top-12 z-30 -mx-3 mb-4 flex gap-1 overflow-x-auto border-b border-line bg-paper/95 px-3 py-2 backdrop-blur sm:-mx-5 sm:px-5 md:-mx-8 md:px-8">
        {tabs.map((t) => (
          <button type="button" key={t} onClick={() => setTab(t)} aria-current={active === t ? "page" : undefined} className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-bold ${active === t ? "bg-ink text-white" : "text-dark hover:bg-white"}`}>
            {t}{counts[t] ? <span className="ml-1.5 rounded-full bg-violet px-1.5 text-[11px] text-white">{counts[t]}</span> : null}
          </button>
        ))}
      </nav>
      <p className="mb-4 text-sm text-muted-dark">Signed in as <b>{d.me.name || d.me.email}</b> · {d.me.role} · <button type="button" className="font-bold underline" onClick={() => setPwOpen(true)}>Change my password</button></p>
      {pwOpen && <Sheet title="Change my password" onClose={() => setPwOpen(false)}><SetPassword self /></Sheet>}
      {active === "Home" && <Home d={d} go={setTab} />}
      {active === "Leads" && <Leads d={d} reload={load} openId={openId} setOpenId={(id) => setTab("Leads", id)} />}
      {active === "Projects" && <Projects d={d} reload={load} openId={openId} setOpenId={(id) => setTab("Projects", id)} />}
      {active === "Expenses" && <Expenses d={d} reload={load} />}
      {active === "Team" && <Team d={d} reload={load} />}
      {active === "Referrals" && <Referrals d={d} reload={load} go={setTab} />}
      {active === "Website" && d.content && <Website key={String(d.content.updatedAt || "")} d={d} reload={load} />}
      {active === "Reports" && <Reports d={d} />}
      {active === "Trash" && <Trash d={d} reload={load} />}
      {active === "Activity" && <Activity d={d} />}
      {active === "Settings" && <Settings d={d} reload={load} />}
    </div>
  );
}
