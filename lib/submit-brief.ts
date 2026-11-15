/**
 * Delivery adapter for the Start a Project brief.
 *
 * THIS IS THE ONE PLACE a real delivery service gets plugged in once the owner approves one
 * (see TODO-FOR-OWNER: delivery service). Until then nothing is sent anywhere: the function makes
 * no network request and reports `{ delivered: false, reason: "not-configured" }`, which the form
 * turns into the honest "Your brief is ready — it has not been sent yet" screen.
 *
 * Contract for whoever wires the real service:
 *   - resolve `{ delivered: true }` ONLY when the service confirmed it accepted the brief;
 *   - resolve `{ delivered: false, reason: "not-configured" }` while there is no service;
 *   - THROW on any failure (network, non-2xx, timeout). The form shows its error state and keeps
 *     everything the visitor typed.
 *
 * DEV-ONLY TEST SWITCH (never exposed in the UI, ignored in production builds):
 *   /contact?simulate=error      -> the adapter throws, so the error state can be tested
 *   /contact?simulate=delivered  -> pretends a service accepted the brief, so the real success
 *                                   state can be designed and tested before a service exists
 */
export type SubmitResult = { delivered: true } | { delivered: false; reason: "not-configured" };
export type Simulate = "error" | "delivered" | undefined;

export interface BriefPayload {
  /** Structured values exactly as entered (trimmed). */
  fields: Record<string, string | string[]>;
  /** The same brief as readable plain text. */
  text: string;
}

const DEV = process.env.NODE_ENV !== "production";

/** Only honoured outside production. */
export function readSimulate(value: string | undefined): Simulate {
  if (!DEV) return undefined;
  return value === "error" || value === "delivered" ? value : undefined;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function submitBrief(payload: BriefPayload, simulate?: Simulate): Promise<SubmitResult> {
  if (DEV && simulate === "error") throw new Error("Simulated delivery failure (dev-only ?simulate=error)");
  if (DEV && simulate === "delivered") return { delivered: true };
  // No delivery service is approved yet. Do NOT add fetch / email / form-service calls here without owner approval.
  return { delivered: false, reason: "not-configured" };
}
