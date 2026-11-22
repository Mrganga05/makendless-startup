"use client";
/* Meta Pixel. Loads only when NEXT_PUBLIC_META_PIXEL_ID is set (Vercel → Environment Variables), never on /admin.
   Events: PageView on every page, ViewContent on /create /build /grow, Lead on successful form sends
   (trackPixel("Lead")), Contact on any WhatsApp button click. */
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const ID = (process.env.NEXT_PUBLIC_META_PIXEL_ID || "").trim();
type Fbq = ((...a: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue?: unknown[]; push?: unknown; loaded?: boolean; version?: string };
type W = Window & { fbq?: Fbq; _fbq?: Fbq };

/** Send a standard Meta event. Safe to call anywhere: does nothing when the pixel isn't loaded. */
export function trackPixel(event: string, params?: Record<string, unknown>) {
  const w = window as W;
  if (w.fbq && !location.pathname.startsWith("/admin")) w.fbq("track", event, params);
}

function load() {
  const w = window as W;
  if (w.fbq) return;
  const n = function (...a: unknown[]) { if (n.callMethod) n.callMethod(...a); else n.queue!.push(a); } as Fbq;
  n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
  w.fbq = n; w._fbq = n;
  const s = document.createElement("script");
  s.async = true; s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  n("init", ID);
}

export default function MetaPixel() {
  const path = usePathname() || "/";
  const off = !ID || path.startsWith("/admin");

  useEffect(() => {
    if (off) return;
    load();
    trackPixel("PageView");
    if (/^\/(create|build|grow)\/?$/.test(path)) trackPixel("ViewContent", { content_name: path.slice(1).toUpperCase() });
  }, [path, off]);

  useEffect(() => {
    if (off) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      /* WhatsApp buttons to our number (wa.me/<digits>); the referral "share" link (wa.me/?text=) is not a contact. */
      if (/^https:\/\/wa\.me\/\d/.test(a.href)) trackPixel("Contact");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [off]);

  return null;
}
