/*
 * OUR WORK — every real project on the website, in ONE place. Add a project by adding one entry below.
 * It then appears on /work, on the homepage ("Selected work"), on /create (reels) or /build (websites),
 * and the chatbot knows about it. No other file needs to change.
 *
 * Reel (CREATE): poster = a 9:16 image in public/work (keep it small: WebP, about 720x1280).
 *                video  = a direct .mp4 link. It only loads when someone plays it.
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

const R2 = "https://pub-f2e8479a9f704fe2a3f086d9586ab8d9.r2.dev/videos/portfolio";

export const WORK: { reels: Reel[]; sites: Site[] } = {
  reels: [
    {
      id: "podcast-to-reel", title: "Podcast to Reel", text: "Long podcast turned into an engaging short reel", service: "Short Videos",
      video: `${R2}/lv_0_20260730203253-17f3fe26-3777-4757-afb0-5186d8348d80-1785424468225.mp4`, poster: "/work/reel-podcast-to-reel.webp",
    },
    {
      id: "motion-graphics", title: "Motion Graphics Edit", text: "Animated visuals that grab attention", service: "Motion Graphics",
      video: `${R2}/lv_0_20260730202959-08e0187b-dfad-4a75-9a90-54b04aeb6026-1785425251562.mp4`, poster: "/work/reel-motion-graphics.webp",
    },
    {
      id: "documentary", title: "Documentary Edit", text: "Story-driven documentary-style edit", service: "Short Videos",
      video: `${R2}/lv_0_20260730203103-204da4b3-46db-451f-b56c-5b251f2db4fb-1785425761194.mp4`, poster: "/work/reel-documentary.webp",
    },
    {
      id: "minimal", title: "Minimal Edit", text: "Clean, premium brand edit", service: "Short Videos",
      video: `${R2}/lv_0_20260730203328-e79cab4f-c2d3-4bfc-a475-ea8943cb49cc-1785426180102.mp4`, poster: "/work/reel-minimal.webp",
    },
    {
      id: "hook-retention", title: "Hook & Retention Edit", text: "Built to stop the scroll and keep viewers watching", service: "Short Videos",
      video: `${R2}/lv_0_20260730203206-f776d2e1-6d16-42e9-9d7e-19c11a424176-1785426641004.mp4`, poster: "/work/reel-hook-retention.webp",
    },
    {
      id: "fast-paced", title: "Fast-Paced Edit", text: "Dynamic edit with speed ramps", service: "Short Videos",
      video: `${R2}/saveclip-app_aqobwokhhral9w4el7m4fste07ckuzm0dewmhdwgbgmq23mdqswkr29o4lx9eudtz3u8lktiqyecnfll8fk1wbdduzsgpomyodja01g-de307133-725b-4808-bdd1-7b261da91a0f-1785426937304.mp4`,
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
      id: "makendless", name: "MAKENDLESS", category: "Our own studio (this website)", url: "https://makendless.vercel.app/",
      text: "Studio website with service picker, live prices and referral system.", tags: ["Business Website", "Automation"],
      desktop: "/work/site-makendless-desktop.webp", mobile: "/work/site-makendless-mobile.webp",
    },
  ],
};

export const hasWork = () => WORK.reels.length + WORK.sites.length > 0;

/** Client reviews (edited in /admin → Website content). The homepage section shows only when there is at least one. */
export const REVIEWS: { name: string; role?: string; text: string }[] = [];
