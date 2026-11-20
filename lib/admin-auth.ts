/* SERVER ONLY. /admin access: one shared password in the Vercel env ADMIN_PASSWORD. */
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "mk_admin";
export const adminConfigured = () => !!process.env.ADMIN_PASSWORD;
export const adminToken = () => createHash("sha256").update(`mk-admin:${process.env.ADMIN_PASSWORD}`).digest("hex");

export function passwordOk(pw: string) {
  const a = Buffer.from(createHash("sha256").update(String(pw)).digest("hex"));
  const b = Buffer.from(createHash("sha256").update(String(process.env.ADMIN_PASSWORD || "")).digest("hex"));
  return adminConfigured() && timingSafeEqual(a, b);
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  return (await cookies()).get(ADMIN_COOKIE)?.value === adminToken();
}
