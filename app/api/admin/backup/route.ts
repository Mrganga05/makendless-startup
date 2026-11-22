import { NextResponse } from "next/server";
import { log, makeBackup, purgeOldTrash } from "../../../../lib/admin-ops";

export const dynamic = "force-dynamic";

/* Weekly backup (Vercel Cron, see vercel.json): copies all admin data into the backups table (last 8 kept)
   and empties Trash items older than 30 days. Only Vercel's cron can call it (Authorization: Bearer CRON_SECRET). */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401, headers: { "X-Robots-Tag": "noindex, nofollow" } });
  }
  const row = await makeBackup("Weekly backup");
  const purged = await purgeOldTrash();
  await log("Weekly backup", "add", "backup", String(row.id), null, { trash_emptied: purged });
  return NextResponse.json({ ok: true });
}
