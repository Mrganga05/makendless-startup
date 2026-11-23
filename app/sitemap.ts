import type { MetadataRoute } from "next";
import { ROUTES, SITE_URL } from "../lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const top = new Set(["", "/work", "/create", "/build", "/studios"]);
  return ROUTES.map((r) => ({ url: `${SITE_URL}${r}`, lastModified: now, changeFrequency: r === "/work" ? "weekly" : "monthly", priority: r === "" ? 1 : top.has(r) ? 0.9 : 0.6 }));
}
