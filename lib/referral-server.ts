/* SERVER ONLY. Referral rules: real code, not your own number, one referral discount per client (by WhatsApp). */
import { findOne } from "./db";
import { CODE_RE, displayFirst, normalizeCode, normalizePhone } from "./referral";

export type RefCheck = { valid: true; code: string; name: string } | { valid: false; reason: "invalid" | "own" | "used" };

export async function checkReferral(rawCode: string, rawPhone?: string): Promise<RefCheck> {
  const code = normalizeCode(rawCode);
  if (!CODE_RE.test(code)) return { valid: false, reason: "invalid" };
  const row = await findOne("referral_codes", "code", code);
  if (!row) return { valid: false, reason: "invalid" };
  const phone = normalizePhone(rawPhone || "");
  if (phone) {
    if (row.whatsapp === phone) return { valid: false, reason: "own" };
    if (await findOne("referral_uses", "referred_whatsapp", phone)) return { valid: false, reason: "used" };
  }
  return { valid: true, code, name: displayFirst(String(row.name || "")) };
}
