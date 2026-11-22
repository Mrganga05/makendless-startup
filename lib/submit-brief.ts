/** Sends the contact-page Start a Project brief to /api/leads (saved in the database + email alert).
 *  Throws on any failure so the form can show the WhatsApp fallback.
 *  DEV-ONLY test switch: /contact?simulate=error makes it throw. */
export type Simulate = "error" | undefined;
const DEV = process.env.NODE_ENV !== "production";
export function readSimulate(value: string | undefined): Simulate { return DEV && value === "error" ? "error" : undefined; }

export async function submitBrief(fields: Record<string, string | string[]>, simulate?: Simulate): Promise<void> {
  if (DEV && simulate === "error") throw new Error("Simulated failure (dev-only ?simulate=error)");
  const r = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: "contact", ...fields }) });
  const d = (await r.json().catch(() => ({}))) as { ok?: boolean };
  if (!r.ok || !d.ok) throw new Error("save failed");
  (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.("track", "Lead");
}
