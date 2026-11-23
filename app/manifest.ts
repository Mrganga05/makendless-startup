import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "../lib/site";

/* Web app manifest (/manifest.webmanifest): name, colours and icons for "Add to Home screen". */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Creative & Technology Studio`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0c1024",
    theme_color: "#0c1024",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
