import { NextResponse } from "next/server";
import { checkReferral } from "../../../../lib/referral-server";

export const dynamic = "force-dynamic";

/* GET /api/referral/check?code=MKE-PRIYA-4821[&whatsapp=9876543210] */
export async function GET(req: Request) {
  const u = new URL(req.url);
  try {
    return NextResponse.json(await checkReferral(u.searchParams.get("code") || "", u.searchParams.get("whatsapp") || ""));
  } catch {
    return NextResponse.json({ valid: false, reason: "unavailable" }, { status: 503 });
  }
}
