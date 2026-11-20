/* SERVER ONLY. New-lead email alert via Resend (https://resend.com, free tier).
   Vercel env: RESEND_API_KEY, optional LEAD_ALERT_TO (defaults to the email in data/owner.ts) and LEAD_ALERT_FROM.
   Never throws: a failed alert must not lose the lead (it is already saved). */
import { SETTINGS } from "../data/settings";

export async function sendLeadAlert(subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_ALERT_TO || SETTINGS.email;
  if (!key || !to) return false;
  try {
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
