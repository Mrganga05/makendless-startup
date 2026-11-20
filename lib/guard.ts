/* SERVER ONLY. Spam protection: honeypot (checked in each route) + at most 5 submissions per hour per visitor. */
import { createHash } from "node:crypto";
import { countSince, type Table } from "./db";

export function ipHash(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  return createHash("sha256").update(`mk:${ip}:${process.env.SUPABASE_SERVICE_ROLE_KEY || "dev"}`).digest("hex").slice(0, 32);
}

export async function tooMany(table: Table, hash: string, max = 5) {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  return (await countSince(table, "ip_hash", hash, since)) >= max;
}
