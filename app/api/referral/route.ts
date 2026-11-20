import { NextResponse } from "next/server";
import { Conflict, findOne, insert } from "../../../lib/db";
import { makeCode, normalizePhone } from "../../../lib/referral";

export const dynamic = "force-dynamic";

/* POST /api/referral {name, whatsapp} -> {code}. The same WhatsApp number always gets its existing code back. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { name?: string; whatsapp?: string; hp?: string };
  const name = String(body.name || "").trim().slice(0, 80);
  const whatsapp = normalizePhone(body.whatsapp || "");
  if (body.hp) return NextResponse.json({ error: "rejected" }, { status: 400 });
  if (name.length < 2 || !whatsapp) return NextResponse.json({ error: "Please enter your name and a 10-digit WhatsApp number." }, { status: 400 });
  try {
    const existing = await findOne("referral_codes", "whatsapp", whatsapp);
    if (existing) return NextResponse.json({ code: existing.code, existing: true });
    for (let i = 0; i < 6; i++) {
      try {
        const row = await insert("referral_codes", { code: makeCode(name), name, whatsapp });
        return NextResponse.json({ code: row.code, existing: false });
      } catch (e) {
        if (!(e instanceof Conflict)) throw e;
        const again = await findOne("referral_codes", "whatsapp", whatsapp); // same number, two taps at once
        if (again) return NextResponse.json({ code: again.code, existing: true });
      }
    }
    throw new Error("Could not create a unique code");
  } catch {
    return NextResponse.json({ error: "We couldn't create your link right now. Please try again in a minute." }, { status: 503 });
  }
}
