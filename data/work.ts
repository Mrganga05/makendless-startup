/*
 * OUR WORK — real projects. Add links here; the homepage "Our work" section appears automatically
 * once at least one item exists (no placeholders are ever shown).
 *   reels: Instagram reel links, shown as vertical 9:16 cards. `cover` = optional image path in public/ (e.g. "/work/reel-1.jpg").
 *   sites: websites with a screenshot in public/ (e.g. "/work/site-1.jpg").
 */
export const WORK: {
  reels: { url: string; title?: string; cover?: string }[];
  sites: { name: string; url: string; image?: string }[];
} = {
  reels: [
    // { url: "https://www.instagram.com/reel/XXXX/", title: "Cafe launch reel", cover: "/work/reel-1.jpg" },
  ],
  sites: [
    // { name: "Client website", url: "https://example.com", image: "/work/site-1.jpg" },
  ],
};
export const hasWork = () => WORK.reels.length + WORK.sites.length > 0;

/** Client reviews (edited in /admin → Website content). The homepage section shows only when there is at least one. */
export const REVIEWS: { name: string; role?: string; text: string }[] = [];
