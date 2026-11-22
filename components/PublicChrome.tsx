"use client";
/* Public header/footer: hidden on /admin, which shows its own small team bar instead. */
import { usePathname } from "next/navigation";

export default function PublicChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return path?.startsWith("/admin") ? null : <>{children}</>;
}
