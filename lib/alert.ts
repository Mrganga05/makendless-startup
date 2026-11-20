/* SERVER ONLY. New-lead email alert via Resend (https://resend.com, free plan).
   Vercel env: RESEND_API_KEY (and optional LEAD_ALERT_FROM). Recipient: /admin Settings -> alert email,
   else LEAD_ALERT_TO, else the email in data/owner.ts. Never throws: the lead is already saved. */
import { SETTINGS } from "../data/settings";
import { findOne } from "./db";

export async function sendLeadAlert(subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const set = await findOne("app_settings", "key", "alert_email").catch(() => null);
    const to = String(set?.value || process.env.LEAD_ALERT_TO || SETTINGS.email);
    if (!to) return false;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.LEAD_ALERT_FROM || "MAKENDLESS <onboarding@resend.dev>", to: [to], subject, text }),
      signal: AbortSignal.timeout(6000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
