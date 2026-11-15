import type { Metadata } from "next";

/** Unique title + description (and matching Open Graph / canonical) for an internal page. */
export function pageMeta(title: string, description: string, path: string, extra: Metadata = {}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} — MAKENDLESS`, description, url: path, type: "website", siteName: "MAKENDLESS" },
    twitter: { card: "summary_large_image", title: `${title} — MAKENDLESS`, description },
    ...extra,
  };
}
