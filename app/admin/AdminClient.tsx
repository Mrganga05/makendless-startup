"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const post = (body: object) => fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export function AdminLogin() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  return (
    <form className="mt-8 flex max-w-sm flex-col gap-3" onSubmit={async (e) => { e.preventDefault(); const r = await post({ action: "login", password: pw }); if (r.ok) router.refresh(); else setErr("Wrong password."); }}>
      <label className="text-sm font-bold" htmlFor="adm-pw">Admin password</label>
      <input id="adm-pw" type="password" className="for-field" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
      {err && <p className="for-error text-sm font-semibold" role="alert">{err}</p>}
      <button className="for-btn for-btn-primary" type="submit">Open admin</button>
    </form>
  );
}

export function UseActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const set = async (s: string) => { setBusy(true); await post({ action: "use", id, status: s }); setBusy(false); router.refresh(); };
  return (
    <span className="flex flex-wrap gap-2">
      {status !== "paid" && <button disabled={busy} className="for-btn for-btn-primary !min-h-9 !px-3 !text-[13px]" onClick={() => set("paid")}>Mark as paid</button>}
      {status !== "pending" && <button disabled={busy} className="for-btn for-btn-ghost !min-h-9 !px-3 !text-[13px]" onClick={() => set("pending")}>Back to pending</button>}
      {status !== "cancelled" && <button disabled={busy} className="for-btn for-btn-ghost !min-h-9 !px-3 !text-[13px]" onClick={() => set("cancelled")}>Cancel</button>}
    </span>
  );
}

export function Logout() {
  const router = useRouter();
  return <button className="for-btn for-btn-ghost" onClick={async () => { await post({ action: "logout" }); router.refresh(); }}>Log out</button>;
}
