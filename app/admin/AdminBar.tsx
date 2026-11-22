"use client";
/* The only chrome on /admin: a small team bar with Log out. */
export default function AdminBar() {
  const logout = async () => {
    await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) }).catch(() => null);
    location.reload();
  };
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-12 items-center justify-between border-b border-line bg-white/95 px-4 text-dark backdrop-blur sm:px-6">
      <p className="text-sm font-extrabold tracking-wide">MAKENDLESS Team</p>
      <button type="button" onClick={logout} className="rounded-full px-4 py-1.5 text-sm font-bold ring-1 ring-line hover:bg-paper">Log out</button>
    </header>
  );
}
