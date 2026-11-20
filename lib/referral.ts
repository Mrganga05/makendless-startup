/* Referral helpers shared by browser and server. */
import { REFERRAL } from "../data/pricing";

/** 10-digit Indian mobile from any input ("+91 98765 43210", "098765..."), or "" if it isn't one. */
export function normalizePhone(v: string) {
  let d = String(v || "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^\d{10}$/.test(d) ? d : "";
}

export const normalizeCode = (v: string) => String(v || "").trim().toUpperCase().replace(/\s+/g, "");
export const CODE_RE = /^MKE-[A-Z]{1,12}-\d{4}$/;

/** First name in capitals (A–Z only), e.g. "Priya Sharma" -> "PRIYA". */
export function firstNameKey(name: string) {
  const first = String(name || "").trim().split(/\s+/)[0] ?? "";
  return first.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 12) || "FRIEND";
}

export function makeCode(name: string) {
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `${REFERRAL.prefix}-${firstNameKey(name)}-${digits}`;
}

/** "PRIYA" -> "Priya" for the invite banner. */
export const displayFirst = (name: string) => {
  const f = String(name || "").trim().split(/\s+/)[0] ?? "";
  return f ? f[0].toUpperCase() + f.slice(1) : "A friend";
};
