/* SERVER ONLY. Shared helpers for /api/admin and the weekly backup: settings, activity log, trash, backups. */
import { insert, list, remove, type Row, type Table } from "./db";

export const OWNER_EMAIL = "makendlessofficial@gmail.com";
export const TRASH_DAYS = 30;
export const SETTING_DEFAULTS: Record<string, string> = {
  monthly_target: "100000", whatsapp: "", email: "", referral_reward: "500", referral_min: "2000", alert_email: OWNER_EMAIL,
};

export async function settingsMap(): Promise<Record<string, string>> {
  const rows = await list("app_settings").catch(() => [] as Row[]);
  return { ...SETTING_DEFAULTS, ...Object.fromEntries(rows.map((r) => [String(r.key), String(r.value ?? "")])) };
}

/** Activity log: who, what, when, old value, new value. Never blocks the action itself. */
export async function log(actor: string, action: string, entity: string, entityId: string, oldValue?: unknown, newValue?: unknown) {
  await insert("activity_log", { actor, action, entity, entity_id: entityId, old_value: oldValue ?? null, new_value: newValue ?? null }).catch(() => null);
}

/** Entities that can be deleted (moved to Trash) and where they live. */
export const ENTITIES: Record<string, { table: Table; key: string; label: (r: Row) => string }> = {
  lead: { table: "leads", key: "id", label: (r) => `Lead: ${r.name}` },
  project: { table: "projects", key: "id", label: (r) => `Project: ${r.client} · ${r.services}` },
  payment: { table: "payments", key: "id", label: (r) => `Payment: ₹${r.amount} on ${r.date}` },
  expense: { table: "expenses", key: "id", label: (r) => `Expense: ${r.item} ₹${r.amount}` },
  member: { table: "team_members", key: "email", label: (r) => `Team member: ${r.name || r.email}` },
};

export async function purgeOldTrash() {
  const cutoff = Date.now() - TRASH_DAYS * 864e5;
  const old = (await list("trash")).filter((t) => new Date(String(t.deleted_at)).getTime() < cutoff).map((t) => String(t.id));
  await remove("trash", "id", old);
  return old.length;
}

const BACKUP_TABLES: Table[] = ["leads", "projects", "payments", "expenses", "team_members", "referral_codes", "referral_uses", "waitlist", "app_settings", "site_content", "trash"];
/** Full copy of all admin data, kept in the backups table (last 8 kept). */
export async function makeBackup(actor: string) {
  const data: Record<string, Row[]> = {};
  for (const t of BACKUP_TABLES) data[t] = await list(t).catch(() => []);
  const row = await insert("backups", { data: { made_at: new Date().toISOString(), made_by: actor, ...data } });
  const all = await list("backups");
  await remove("backups", "id", all.slice(8).map((b) => String(b.id)));
  return row;
}
