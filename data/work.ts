/*
 * OUR WORK — every real project on the website, in ONE place. Add a project by adding one entry below.
 * It then appears on /work, on the homepage ("Selected work"), on /create (reels) or /build (websites),
 * and the chatbot knows about it. No other file needs to change.
 *
 * Reel (CREATE): poster = a 9:16 image in public/work (keep it small: WebP, about 720x1280).
 *                video  = an .mp4 in public/work/reels. Shrink it first with scripts/compress-reel.sh
 *                (720x1280, 30 fps, fast start: about 1-6 MB). It only loads when someone plays it.
 * Website (BUILD): desktop/mobile = screenshots in public/work (WebP). The desktop one can be tall:
 *                it scrolls inside the laptop on hover.
 * Text rule: describe the work, never name a founder or a person; name a client brand only when the client agreed.
 */

export type Reel = {
  id: string;
  title: string;
  text: string;
  /** The service on /create it belongs to (shown as a tag). */
  service: "Short Videos" | "Long Videos" | "Motion Graphics";
  video: string;
  poster: string;
};

export type Site = {
  id: string;
  name: string;
  /** What kind of business it is. */
  category: string;
  text: string;
  url: string;
  tags: string[];
  desktop: string;
  mobile: string;
};

export const WORK: { reels: Reel[]; sites: Site[] } = {
  reels: [
    {
      id: "podcast-to-reel", title: "Podcast to Reel", text: "Long podcast turned into an engaging short reel", service: "Short Videos",
      video: "/work/reels/podcast-to-reel.mp4", poster: "/work/reel-podcast-to-reel.webp",
    },
    {
      id: "motion-graphics", title: "Motion Graphics Edit", text: "Animated visuals that grab attention", service: "Motion Graphics",
      video: "/work/reels/motion-graphics.mp4", poster: "/work/reel-motion-graphics.webp",
    },
    {
      id: "documentary", title: "Documentary Edit", text: "Story-driven documentary-style edit", service: "Short Videos",
      video: "/work/reels/documentary.mp4", poster: "/work/reel-documentary.webp",
    },
    {
      id: "minimal", title: "Minimal Edit", text: "Clean, premium brand edit", service: "Short Videos",
      video: "/work/reels/minimal.mp4", poster: "/work/reel-minimal.webp",
    },
    {
      id: "hook-retention", title: "Hook & Retention Edit", text: "Built to stop the scroll and keep viewers watching", service: "Short Videos",
      video: "/work/reels/hook-retention.mp4", poster: "/work/reel-hook-retention.webp",
    },
    {
      id: "fast-paced", title: "Fast-Paced Edit", text: "Dynamic edit with speed ramps", service: "Short Videos",
      video: "/work/reels/fast-paced.mp4",
      poster: "/work/reel-fast-paced.webp",
    },
  ],
  sites: [
    {
      id: "sevenhills", name: "Seven Hills Global Pvt Ltd", category: "Agricultural export company", url: "https://sevenhillsglobalpvtltd.com/",
      text: "Export website showcasing 50+ products to buyers in 10+ countries.", tags: ["Business Website", "Product Catalogue", "Enquiries"],
      desktop: "/work/site-sevenhills-desktop.webp", mobile: "/work/site-sevenhills-mobile.webp",
    },
    {
      id: "video-studio", name: "Video editing studio", category: "Creative studio", url: "https://raqvine.com/",
      text: "Premium portfolio website with video showcase, services and FAQ.", tags: ["Portfolio Website", "Video Showcase"],
      desktop: "/work/site-studio-desktop.webp", mobile: "/work/site-studio-mobile.webp",
    },
    {
      id: "makendless", name: "MAKENDLESS", category: "Our own website", url: "https://makendless.vercel.app/",
      text: "Studio website with service picker, fixed prices and referral system.", tags: ["Business Website", "Automation"],
      desktop: "/work/site-makendless-desktop.webp", mobile: "/work/site-makendless-mobile.webp",
    },
  ],
};

export const hasWork = () => WORK.reels.length + WORK.sites.length > 0;

/** Client reviews (edited in /admin → Website content). The homepage section shows only when there is at least one. */
/* TESTIMONIALS (homepage, above the FAQ). Hidden while this list is empty. Only real words from real clients, with their OK.
   Example: { name: "Client name", role: "Business, city", text: "What they said." }
   They can also be added in /admin → Website content → Reviews. */
export const REVIEWS: { name: string; role?: string; text: string }[] = [];
