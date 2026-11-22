"use client";
/* Applies the database website content in the browser before any child renders, so client components
   (price selector, Start a Project, combo packs) show exactly what the server rendered. */
import { applyContent, type SiteContent, type SiteSettings } from "../data/content";

export default function ContentBoot({ c, s, children }: { c: SiteContent | null; s: SiteSettings | null; children: React.ReactNode }) {
  applyContent(c, s);
  return <>{children}</>;
}
