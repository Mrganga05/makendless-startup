"use client";
/* MAKENDLESS team dashboard: Overview, Leads (board + table), lead details, Referrals, Waitlist, Settings. */
import { useCallback, useEffect, useMemo, useState } from "react";
import { inr } from "../../lib/pricing";

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Data = { me: { email: string; name: string; role: "Admin" | "Member" }; leads: Row[]; codes: Row[]; uses: Row[]; waitlist: Row[]; team: Row[]; settings: Record<string, string> };
const STATUSES = ["New", "Contacted", "Price confirmed", "Advance paid", "In progress", "Delivered", "Fully paid", "Lost"];
const DAY = 864e5;
const api = (body: object) => fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => ({ ok: r.ok, ...(await r.json().catch(() => ({}))) }));
const ago = (d: string) => { const m = Math.max(0, (Date.now() - new Date(d).getTime()) / 6e4); return m < 60 ? `${Math.round(m)}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`; };
const date = (d?: string) => (d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—");
const services = (l: Row): string[] => [...new Set(((l.selections?.items as Row[]) || []).map((i) => String(i.service || i.option)).filter(Boolean))];
const late = (l: Row) => l.status === "New" && Date.now() - new Date(l.created_at).getTime() > DAY;
const initials = (email: string, team: Row[]) => { const n = String(team.find((t) => t.email === email)?.name || email || ""); return n.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join(""); };
const total = (l: Row) => Number(l.estimated_total || 0) + Number(l.estimated_monthly || 0);
function csv(name: string, rows: Row[], cols: string[]) {
  const esc = (v: unknown) => `"${String(typeof v === "object" && v !== null ? JSON.stringify(v) : v ?? "").replace(/"/g, '""')}"`;
  const blob = new Blob([[cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n")], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href);
}
const card = "rounded-2xl bg-white p-4 ring-1 ring-line sm:p-5";
const th = "border-b border-line px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-muted-dark";
const td = "border-b border-line px-3 py-2.5 align-top text-sm";

function Login() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="mx-auto mt-10 max-w-md">
      <h1 className="text-3xl font-extrabold">Team login</h1>
      <p className="mt-2 text-muted-dark">Enter your team email. We&apos;ll send you a one-time login link.</p>
      <form className="mt-6 grid gap-3" onSubmit={async (e) => {
        e.preventDefault(); setBusy(true);
        const r = await api({ action: "login", email }); setBusy(false);
        if (r.dev) return location.reload();
        setMsg(r.ok ? { ok: true, text: "Check your email and open the login link on this device." } : { ok: false, text: r.error || "Something went wrong." });
      }}>
        <label htmlFor="adm-email" className="text-sm font-bold">Email</label>
        <input id="adm-email" type="email" autoComplete="email" className="for-field" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="for-btn for-btn-primary" disabled={busy}>{busy ? "Sending…" : "Send login link"}</button>
        {msg && <p role="alert" className={`text-sm font-bold ${msg.ok ? "text-[#0f6b4b]" : "for-error"}`}>{msg.text}</p>}
      </form>
    </div>
  );
}

function LeadDetails({ lead, d, onClose, reload }: { lead: Row; d: Data; onClose: () => void; reload: () => void }) {
  const admin = d.me.role === "Admin";
  const canEdit = admin || lead.assigned_to === d.me.email;
  const [pay, setPay] = useState({ advance_paid: !!lead.advance_paid, advance_amount: lead.advance_amount ?? "", advance_date: lead.advance_date ?? "", balance_paid: !!lead.balance_paid, balance_amount: lead.balance_amount ?? "", balance_date: lead.balance_date ?? "" });
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const save = async (patch: Row) => { const r = await api({ action: "lead.update", id: lead.id, patch }); if (!r.ok) setErr(r.error); else { setErr(""); reload(); } };
  const svc = services(lead).join(", ") || "your project";
  const wa = `https://wa.me/91${lead.whatsapp}?text=${encodeURIComponent(`Hi ${String(lead.name).split(" ")[0]}, thanks for choosing MAKENDLESS! About your project: ${svc}…`)}`;
  const items = (lead.selections?.items as Row[]) || [];
  const extras = (lead.selections?.extras as Row[]) || [];
  const F = ({ k, v }: { k: string; v: unknown }) => (v || v === 0 ? <div className="grid grid-cols-[8.5rem_1fr] gap-2 py-1 text-sm"><dt className="font-bold text-muted-dark">{k}</dt><dd className="min-w-0 break-words">{String(v)}</dd></div> : null);
  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-ink/50" role="dialog" aria-modal="true" aria-label={`Lead: ${lead.name}`} onClick={onClose}>
      <div className="h-full w-full overflow-y-auto bg-paper p-4 sm:max-w-2xl sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="text-2xl font-extrabold">{lead.name}</h2><p className="text-sm text-muted-dark">{date(lead.created_at)} · {lead.source_page}</p></div>
          <button className="for-btn for-btn-ghost !min-h-10" onClick={onClose}>Close</button>
        </div>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="for-btn mt-4 w-full bg-[#25d366] text-white sm:w-auto">Chat on WhatsApp</a>
        {err && <p className="for-error mt-3 text-sm font-bold">{err}</p>}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-bold">Status
            <select className="for-field mt-1" value={lead.status} disabled={!canEdit} onChange={(e) => save({ status: e.target.value })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          </label>
          <label className="text-sm font-bold">Assigned to
            <select className="for-field mt-1" value={lead.assigned_to || ""} disabled={!admin && !!lead.assigned_to && lead.assigned_to !== d.me.email} onChange={(e) => save({ assigned_to: e.target.value || null })}>
              <option value="">Nobody</option>{d.team.filter((t) => t.active).map((t) => <option key={t.email} value={t.email}>{t.name || t.email}</option>)}
            </select>
          </label>
        </div>
        <section className={`${card} mt-4`}>
          <h3 className="font-extrabold">Selection</h3>
          <ul className="mt-2 grid gap-1 text-sm">
            {items.map((i, k) => <li key={k} className="flex justify-between gap-3"><span>{i.service ? `${i.service}: ` : ""}<b>{i.option}</b>{i.qty > 1 ? ` × ${i.qty}` : ""}</span><span>{i.price === null || i.price === undefined ? "Custom quote" : inr(Number(i.total ?? i.price)) + (i.unit === "month" ? "/month" : "")}</span></li>)}
            {extras.map((x, k) => <li key={`x${k}`} className="flex justify-between text-muted-dark"><span>+ {x.name}</span><span>{inr(Number(x.price))}{x.monthly ? "/month" : ""}</span></li>)}
            {!items.length && <li className="text-muted-dark">No services selected.</li>}
          </ul>
          <dl className="mt-3 border-t border-line pt-2">
            <F k="Total" v={lead.total_text} /><F k="Monthly" v={lead.estimated_monthly ? inr(lead.estimated_monthly) + "/month" : ""} /><F k="Est. delivery" v={lead.est_delivery} />
            <F k="Combo" v={lead.combo_applied} /><F k="Video discount" v={lead.video_discount ? inr(lead.video_discount) : ""} /><F k="Referral" v={lead.referral_code ? `${lead.referral_code} (−${inr(lead.referral_discount)})` : ""} />
            <F k="WhatsApp" v={lead.whatsapp} /><F k="Email" v={lead.email} /><F k="Business" v={lead.business_name} /><F k="Client type" v={lead.client_type} />
            <F k="Budget" v={lead.budget} /><F k="Timing" v={lead.timing} /><F k="Footage / link" v={lead.footage_link} /><F k="Notes" v={lead.extra_notes} />
            {Object.entries((lead.requirements as Record<string, string>) || {}).map(([k, v]) => <F key={k} k={k} v={v} />)}
          </dl>
        </section>
        <section className={`${card} mt-4`}>
          <h3 className="font-extrabold">Payments</h3>
          {(["advance", "balance"] as const).map((p) => (
            <div key={p} className="mt-3 grid grid-cols-2 items-center gap-2 text-sm sm:grid-cols-[auto_1fr_1fr]">
              <label className="col-span-2 flex items-center gap-2 font-bold capitalize sm:col-span-1"><input type="checkbox" disabled={!canEdit} checked={pay[`${p}_paid`]} onChange={(e) => setPay({ ...pay, [`${p}_paid`]: e.target.checked })} />{p} received</label>
              <input className="for-field !min-h-10 !py-1" placeholder="Amount ₹" inputMode="numeric" disabled={!canEdit} value={pay[`${p}_amount`]} onChange={(e) => setPay({ ...pay, [`${p}_amount`]: e.target.value.replace(/\D/g, "") })} />
              <input className="for-field !min-h-10 !py-1" type="date" disabled={!canEdit} value={pay[`${p}_date`]} onChange={(e) => setPay({ ...pay, [`${p}_date`]: e.target.value })} />
            </div>
          ))}
          <button className="for-btn for-btn-primary mt-3 !min-h-10" disabled={!canEdit} onClick={() => save({ ...pay, advance_amount: pay.advance_amount ? Number(pay.advance_amount) : null, balance_amount: pay.balance_amount ? Number(pay.balance_amount) : null, advance_date: pay.advance_date || null, balance_date: pay.balance_date || null })}>Save payments</button>
          <p className="mt-2 text-xs text-muted-dark">Marking the balance as received moves the lead to Fully paid.</p>
        </section>
        <section className={`${card} mt-4`}>
          <h3 className="font-extrabold">Team notes</h3>
          <ul className="mt-2 grid gap-2">{((lead.team_notes as Row[]) || []).map((n, k) => <li key={k} className="rounded-xl bg-paper p-3 text-sm"><p className="whitespace-pre-wrap">{n.body}</p><p className="mt-1 text-xs text-muted-dark">{n.author} · {date(n.at)}</p></li>)}</ul>
          <form className="mt-3 flex gap-2" onSubmit={async (e) => { e.preventDefault(); if (!note.trim()) return; await api({ action: "lead.note", id: lead.id, body: note }); setNote(""); reload(); }}>
            <input className="for-field !min-h-10 flex-1 !py-1" placeholder="Add a private note" value={note} onChange={(e) => setNote(e.target.value)} />
            <button className="for-btn for-btn-primary !min-h-10">Add</button>
          </form>
        </section>
        <section className={`${card} mt-4`}>
          <h3 className="font-extrabold">Activity</h3>
          <ul className="mt-2 grid gap-1 text-sm">{[...((lead.activity as Row[]) || [])].reverse().map((a, k) => <li key={k}><b>{a.actor}</b> {a.action} <span className="text-muted-dark">· {date(a.at)}</span></li>)}<li className="text-muted-dark">Lead created · {date(lead.created_at)}</li></ul>
        </section>
      </div>
    </div>
  );
}

function Board({ d, open, reload }: { d: Data; open: (l: Row) => void; reload: () => void }) {
  const [showLost, setShowLost] = useState(false);
  const [over, setOver] = useState("");
  const drop = async (status: string, id: string) => {
    setOver("");
    const l = d.leads.find((x) => x.id === id);
    if (!l || l.status === status) return;
    const r = await api({ action: "lead.update", id, patch: { status } });
    if (!r.ok) alert(r.error); reload();
  };
  const cols = STATUSES.filter((s) => s !== "Lost" || showLost);
  return (
    <div>
      <button className="for-btn for-btn-ghost !min-h-9 mb-3 text-sm" onClick={() => setShowLost(!showLost)}>{showLost ? "Hide" : "Show"} Lost ({d.leads.filter((l) => l.status === "Lost").length})</button>
      <div className="flex snap-x gap-3 overflow-x-auto pb-4">
        {cols.map((s) => {
          const ls = d.leads.filter((l) => l.status === s);
          return (
            <div key={s} className={`w-[78vw] max-w-[17rem] shrink-0 snap-start rounded-2xl p-2 sm:w-64 ${over === s ? "bg-violet/15" : "bg-paper-2"}`}
              onDragOver={(e) => { e.preventDefault(); setOver(s); }} onDragLeave={() => setOver("")} onDrop={(e) => drop(s, e.dataTransfer.getData("text/plain"))}>
              <p className="px-2 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-muted-dark">{s} · {ls.length}</p>
              <ul className="mt-1 grid gap-2">
                {ls.map((l) => (
                  <li key={l.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", l.id)}>
                    <button className={`w-full rounded-xl bg-white p-3 text-left text-sm ring-1 ring-line hover:ring-ink ${late(l) ? "border-l-4 border-[#c2183a]" : ""}`} onClick={() => open(l)}>
                      <span className="flex justify-between gap-2"><b>{l.name}</b><span className="text-xs text-muted-dark">{ago(l.created_at)}</span></span>
                      <span className="mt-1 block text-muted-dark">{services(l).join(" + ") || "—"}</span>
                      <span className="mt-1 flex items-center justify-between gap-2"><b>{l.total_text}</b>{l.assigned_to && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">{initials(l.assigned_to, d.team)}</span>}</span>
                      {l.est_delivery && <span className="block text-xs text-muted-dark">⏱ {l.est_delivery}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LeadTable({ d, open }: { d: Data; open: (l: Row) => void }) {
  const [f, setF] = useState({ q: "", status: "", service: "", assigned: "", from: "" });
  const all = useMemo(() => [...new Set(d.leads.flatMap(services))], [d.leads]);
  const rows = d.leads.filter((l) => (!f.q || `${l.name} ${l.whatsapp} ${l.email || ""} ${services(l).join(" ")}`.toLowerCase().includes(f.q.toLowerCase()))
    && (!f.status || l.status === f.status) && (!f.service || services(l).includes(f.service)) && (!f.assigned || (l.assigned_to || "none") === f.assigned) && (!f.from || l.created_at >= f.from));
  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <input className="for-field !min-h-10 !py-1 lg:col-span-2" placeholder="Search name, WhatsApp, service" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        <select className="for-field !min-h-10 !py-1" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <select className="for-field !min-h-10 !py-1" value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })}><option value="">All services</option>{all.map((s) => <option key={s}>{s}</option>)}</select>
        <select className="for-field !min-h-10 !py-1" value={f.assigned} onChange={(e) => setF({ ...f, assigned: e.target.value })}><option value="">Anyone</option><option value="none">Unassigned</option>{d.team.map((t) => <option key={t.email} value={t.email}>{t.name || t.email}</option>)}</select>
        <input className="for-field !min-h-10 !py-1" type="date" aria-label="Created from" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
      </div>
      {d.me.role === "Admin" && <button className="for-btn for-btn-ghost !min-h-9 mt-3 text-sm" onClick={() => csv("makendless-leads.csv", rows, ["created_at", "name", "whatsapp", "email", "status", "assigned_to", "total_text", "estimated_total", "estimated_monthly", "est_delivery", "referral_code", "selections", "requirements", "extra_notes"])}>Export CSV</button>}
      <div className="mt-3 overflow-x-auto rounded-2xl bg-white ring-1 ring-line"><table className="w-full min-w-[760px]">
        <thead><tr><th className={th}>Created</th><th className={th}>Client</th><th className={th}>Services</th><th className={th}>Total</th><th className={th}>Status</th><th className={th}>Assigned</th></tr></thead>
        <tbody>{rows.map((l) => <tr key={l.id} className="cursor-pointer hover:bg-paper" onClick={() => open(l)}><td className={td}>{date(l.created_at)}</td><td className={td}><b>{l.name}</b><br /><span className="text-muted-dark">{l.whatsapp}</span></td><td className={td}>{services(l).join(", ")}</td><td className={`${td} font-bold`}>{l.total_text}</td><td className={`${td} ${late(l) ? "font-bold text-[#c2183a]" : ""}`}>{l.status}</td><td className={td}>{l.assigned_to || "—"}</td></tr>)}
          {!rows.length && <tr><td className={td} colSpan={6}>No leads match.</td></tr>}</tbody>
      </table></div>
    </div>
  );
}

export default function AdminApp() {
  const [d, setD] = useState<Data | null>(null);
  const [state, setState] = useState<"loading" | "login" | "denied" | "ok">("loading");
  const [tab, setTab] = useState("Overview");
  const [view, setView] = useState<"board" | "table">("board");
  const [openId, setOpenId] = useState<string | null>(null);
  const [newM, setNewM] = useState({ email: "", name: "", role: "Member" });
  const [alertEmail, setAlertEmail] = useState("");
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    const r = await fetch("/api/admin", { cache: "no-store" });
    const j = await r.json().catch(() => ({ ok: false }));
    if (!r.ok || !j.ok) return setState("login");
    setD(j); setAlertEmail(j.settings?.alert_email || ""); setState("ok");
  }, []);
  useEffect(() => {
    (async () => {
      const h = new URLSearchParams(location.hash.slice(1));
      const token = h.get("access_token");
      if (token) {
        history.replaceState(null, "", location.pathname + location.search);
        const r = await api({ action: "session", token });
        if (!r.ok) return setState("denied");
      }
      const lead = new URLSearchParams(location.search).get("lead");
      if (lead) { setOpenId(lead); setTab("Leads"); }
      load();
    })();
  }, [load]);

  if (state === "loading") return <p className="mt-10 text-muted-dark">Loading…</p>;
  if (state === "denied") return <p className="mt-10 text-xl font-extrabold">This area is for the MAKENDLESS team only.</p>;
  if (state === "login" || !d) return <Login />;

  const admin = d.me.role === "Admin";
  const week = Date.now() - 7 * DAY;
  const owed = d.codes.reduce((s, c) => s + Number(c.credits_earned || 0) - Number(c.credits_used || 0), 0);
  const weeks = Array.from({ length: 8 }, (_, i) => { const end = Date.now() - (7 - i) * 7 * DAY; return { label: new Date(end - 6 * DAY).toLocaleDateString("en-IN", { day: "numeric", month: "short" }), n: d.leads.filter((l) => { const t = new Date(l.created_at).getTime(); return t > end - 7 * DAY && t <= end; }).length }; });
  const maxW = Math.max(1, ...weeks.map((w) => w.n));
  const lead = openId ? d.leads.find((l) => l.id === openId) : null;
  const tabs = ["Overview", "Leads", "Referrals", "Waitlist", ...(admin ? ["Settings"] : [])];

  return (
    <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8">
      <aside className="mb-4 lg:mb-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-dark">Team dashboard</p>
        <p className="mt-1 truncate text-sm font-bold">{d.me.name || d.me.email} · {d.me.role}</p>
        <nav aria-label="Dashboard" className="mt-3 flex gap-1 overflow-x-auto lg:flex-col">
          {tabs.map((t) => <button key={t} aria-current={tab === t ? "page" : undefined} onClick={() => setTab(t)} className={`shrink-0 rounded-xl px-3 py-2 text-left text-sm font-bold ${tab === t ? "bg-ink text-white" : "hover:bg-paper-2"}`}>{t}</button>)}
          <button className="shrink-0 rounded-xl px-3 py-2 text-left text-sm font-bold text-muted-dark hover:bg-paper-2" onClick={async () => { await api({ action: "logout" }); location.reload(); }}>Log out</button>
        </nav>
      </aside>
      <div className="min-w-0">
        {tab === "Overview" && (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className={card}><p className="text-xs font-bold uppercase text-muted-dark">New leads this week</p><p className="mt-1 text-3xl font-extrabold">{d.leads.filter((l) => new Date(l.created_at).getTime() > week).length}</p></div>
              <div className={card}><p className="text-xs font-bold uppercase text-muted-dark">In progress</p><p className="mt-1 text-3xl font-extrabold">{d.leads.filter((l) => l.status === "In progress").length}</p></div>
              {admin && <div className={card}><p className="text-xs font-bold uppercase text-muted-dark">Expected revenue</p><p className="mt-1 text-3xl font-extrabold">{inr(d.leads.filter((l) => l.status !== "Fully paid" && l.status !== "Lost").reduce((s, l) => s + total(l), 0))}</p></div>}
              <div className={card}><p className="text-xs font-bold uppercase text-muted-dark">Referral credits owed</p><p className="mt-1 text-3xl font-extrabold">{inr(owed)}</p></div>
            </div>
            <div className={card}>
              <p className="font-extrabold">Leads per week</p>
              <div className="mt-4 flex h-40 items-end gap-2">{weeks.map((w) => <div key={w.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><span className="text-xs font-bold">{w.n}</span><span className="w-full rounded-t-md bg-violet" style={{ height: `${(w.n / maxW) * 75}%`, minHeight: 2 }} /><span className="text-[10px] text-muted-dark">{w.label}</span></div>)}</div>
            </div>
            <div className={card}>
              <p className="font-extrabold">Needs reply</p>
              <ul className="mt-2 grid gap-1">{d.leads.filter(late).map((l) => <li key={l.id}><button className="text-left text-sm font-bold text-[#c2183a] underline" onClick={() => setOpenId(l.id)}>{l.name} · {services(l).join(" + ")} · waiting {ago(l.created_at)}</button></li>)}
                {!d.leads.some(late) && <li className="text-sm text-muted-dark">All new leads answered within 24 hours.</li>}</ul>
            </div>
          </div>
        )}
        {tab === "Leads" && (
          <div>
            <div className="mb-3 flex gap-2"><button className={`for-btn !min-h-9 text-sm ${view === "board" ? "for-btn-primary" : "for-btn-ghost"}`} onClick={() => setView("board")}>Board</button><button className={`for-btn !min-h-9 text-sm ${view === "table" ? "for-btn-primary" : "for-btn-ghost"}`} onClick={() => setView("table")}>Table</button></div>
            {view === "board" ? <Board d={d} open={(l) => setOpenId(l.id)} reload={load} /> : <LeadTable d={d} open={(l) => setOpenId(l.id)} />}
          </div>
        )}
        {tab === "Referrals" && (
          <div className="grid gap-4">
            {note && <p className="for-error text-sm font-bold">{note}</p>}
            <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-line"><table className="w-full min-w-[760px]">
              <thead><tr><th className={th}>Code</th><th className={th}>Referrer</th><th className={th}>WhatsApp</th><th className={th}>Created</th><th className={th}>Times used</th><th className={th}>Earned</th><th className={th}>Used</th><th className={th}></th></tr></thead>
              <tbody>{d.codes.map((c) => <tr key={c.code}><td className={`${td} font-bold`}>{c.code}</td><td className={td}>{c.referrer_name}</td><td className={td}>{c.referrer_whatsapp}</td><td className={td}>{date(c.created_at)}</td><td className={td}>{d.uses.filter((u) => u.code === c.code).length}</td><td className={td}>{inr(c.credits_earned || 0)}</td><td className={td}>{inr(c.credits_used || 0)}</td>
                <td className={td}>{Number(c.credits_earned || 0) > Number(c.credits_used || 0) && <button className="for-btn for-btn-ghost !min-h-8 !px-3 text-xs" onClick={async () => { const r = await api({ action: "credit.use", code: c.code }); setNote(r.ok ? "" : r.error); load(); }}>Mark credit used</button>}</td></tr>)}
                {!d.codes.length && <tr><td className={td} colSpan={8}>No referral codes yet.</td></tr>}</tbody>
            </table></div>
            <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-line"><table className="w-full min-w-[560px]">
              <thead><tr><th className={th}>Date</th><th className={th}>Code</th><th className={th}>New client</th><th className={th}>Lead</th><th className={th}>Status</th></tr></thead>
              <tbody>{d.uses.map((u) => { const l = d.leads.find((x) => x.id === u.lead_id); return <tr key={u.id}><td className={td}>{date(u.created_at)}</td><td className={td}>{u.code}</td><td className={td}>{u.new_client_name}<br /><span className="text-muted-dark">{u.new_client_whatsapp}</span></td><td className={td}>{l ? <button className="for-link" onClick={() => setOpenId(l.id)}>{l.status}</button> : "—"}</td><td className={`${td} font-bold`}>{u.status}</td></tr>; })}
                {!d.uses.length && <tr><td className={td} colSpan={5}>No referral uses yet. A use becomes Paid automatically when its lead reaches Fully paid.</td></tr>}</tbody>
            </table></div>
          </div>
        )}
        {tab === "Waitlist" && (
          <div>
            <button className="for-btn for-btn-ghost !min-h-9 mb-3 text-sm" onClick={() => csv("makendless-grow-waitlist.csv", d.waitlist, ["created_at", "email", "interest"])}>Export CSV</button>
            <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-line"><table className="w-full min-w-[420px]"><thead><tr><th className={th}>Email</th><th className={th}>Interest</th><th className={th}>Joined</th></tr></thead>
              <tbody>{d.waitlist.map((w) => <tr key={w.id || w.email}><td className={td}>{w.email}</td><td className={td}>{w.interest}</td><td className={td}>{date(w.created_at)}</td></tr>)}{!d.waitlist.length && <tr><td className={td} colSpan={3}>No one on the waitlist yet.</td></tr>}</tbody></table></div>
          </div>
        )}
        {tab === "Settings" && admin && (
          <div className="grid gap-4">
            <div className={card}>
              <p className="font-extrabold">Team</p>
              <ul className="mt-3 grid gap-2">{d.team.map((t) => (
                <li key={t.email} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="min-w-0 basis-full break-all sm:flex-1 sm:basis-auto"><b>{t.name || "—"}</b> <span className="text-muted-dark">{t.email}</span>{!t.active && <span className="ml-2 font-bold text-[#c2183a]">Deactivated</span>}</span>
                  <select className="for-field !min-h-9 !w-auto !py-0" value={t.role} onChange={async (e) => { const r = await api({ action: "team.save", member: { ...t, role: e.target.value } }); setNote(r.ok ? "" : r.error); load(); }}><option>Admin</option><option>Member</option></select>
                  <button className="for-btn for-btn-ghost !min-h-9 !px-3 text-xs" onClick={async () => { const r = await api({ action: "team.save", member: { ...t, active: !t.active } }); setNote(r.ok ? "" : r.error); load(); }}>{t.active ? "Deactivate" : "Reactivate"}</button>
                </li>))}</ul>
              {note && <p className="for-error mt-2 text-sm font-bold">{note}</p>}
              <form className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]" onSubmit={async (e) => { e.preventDefault(); const r = await api({ action: "team.save", member: { ...newM, active: true } }); setNote(r.ok ? "" : r.error); if (r.ok) setNewM({ email: "", name: "", role: "Member" }); load(); }}>
                <input className="for-field !min-h-10 !py-1" type="email" placeholder="Email" required value={newM.email} onChange={(e) => setNewM({ ...newM, email: e.target.value })} />
                <input className="for-field !min-h-10 !py-1" placeholder="Name" value={newM.name} onChange={(e) => setNewM({ ...newM, name: e.target.value })} />
                <select className="for-field !min-h-10 !py-1" value={newM.role} onChange={(e) => setNewM({ ...newM, role: e.target.value })}><option>Member</option><option>Admin</option></select>
                <button className="for-btn for-btn-primary !min-h-10">Add member</button>
              </form>
            </div>
            <form className={card} onSubmit={async (e) => { e.preventDefault(); await api({ action: "settings.save", alert_email: alertEmail }); load(); }}>
              <label htmlFor="alert-email" className="font-extrabold">Lead alert email</label>
              <div className="mt-2 flex gap-2"><input id="alert-email" type="email" className="for-field !min-h-10 flex-1 !py-1" value={alertEmail} onChange={(e) => setAlertEmail(e.target.value)} /><button className="for-btn for-btn-primary !min-h-10">Save</button></div>
            </form>
          </div>
        )}
      </div>
      {lead && <LeadDetails key={lead.id + String(lead.updated_at)} lead={lead} d={d} onClose={() => { setOpenId(null); history.replaceState(null, "", "/admin"); }} reload={load} />}
    </div>
  );
}
