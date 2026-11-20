import { NextResponse } from "next/server";
import { REFERRAL } from "../../../data/pricing";
import { update } from "../../../lib/db";
import { ADMIN_COOKIE, adminToken, isAdmin, passwordOk } from "../../../lib/admin-auth";

export const dynamic = "force-dynamic";

/* POST /api/admin  {action:"login",password} | {action:"logout"} | {action:"use",id,status:"pending"|"paid"|"cancelled"} */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { action?: string; password?: string; id?: string; status?: string };
  if (b.action === "login") {
    if (!passwordOk(b.password || "")) return NextResponse.json({ ok: false }, { status: 401 });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, adminToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  }
  if (b.action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(ADMIN_COOKIE);
    return res;
  }
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  if (b.action === "use" && b.id && ["pending", "paid", "cancelled"].includes(b.status || "")) {
    const paid = b.status === "paid";
    await update("referral_uses", b.id, { status: b.status, referrer_credit: paid ? REFERRAL.credit : 0, paid_at: paid ? new Date().toISOString() : null });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 400 });
}
