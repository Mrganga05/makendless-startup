import { NextResponse } from "next/server";
import { Conflict, insert } from "../../../lib/db";
import { ipHash, tooMany } from "../../../lib/guard";

export const dynamic = "force-dynamic";

/* POST /api/waitlist {email} — GROW (beta) waitlist. Joining twice is fine (treated as success). */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { email?: string; hp?: string };
  const email = String(b.email || "").trim().toLowerCase().slice(0, 254);
  if (b.hp || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const ip = ipHash(req);
    if (await tooMany("waitlist", ip)) return NextResponse.json({ ok: false }, { status: 429 });
    await insert("waitlist", { email, interest: "GROW", ip_hash: ip });
    await insert("leads", { name: email, whatsapp: "", email, form: "GROW waitlist", lead_source: "Website", source_page: "/grow", status: "New", ip_hash: ip }).catch(() => null);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Conflict) return NextResponse.json({ ok: true });
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
