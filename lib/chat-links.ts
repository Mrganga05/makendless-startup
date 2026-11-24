/* Chat links. The assistant never shows raw paths like "/create": pages become friendly buttons under its reply.
   Shared by the server (app/api/chat/route.ts takes the links out of a reply) and components/ChatPanel.tsx (shows them). */

const PAGES: Record<string, { label: string; words: string }> = {
  "/create": { label: "See video prices", words: "our video editing page" },
  "/build": { label: "See website prices", words: "our websites page" },
  "/studios": { label: "See all services", words: "our services page" },
  "/work": { label: "See our work", words: "our work page" },
  "/start-project": { label: "Start a project", words: "the Start a Project page" },
  "/contact": { label: "Contact us", words: "our contact page" },
  "/faq": { label: "Read the FAQ", words: "our FAQ page" },
  "/grow": { label: "Join the GROW waitlist", words: "our GROW page" },
  "/about": { label: "About us", words: "our About page" },
  "/privacy": { label: "Privacy policy", words: "our privacy page" },
  "/terms": { label: "Terms", words: "our terms page" },
};
const WORK_TYPE: Record<string, string> = { create: "See our reels", build: "See our websites" };
export const WHATSAPP = "whatsapp";

/** Button text for a link the assistant gave ("/create" -> "See video prices"), or null if it isn't a known page. */
export function linkLabel(link: string): string | null {
  if (link === WHATSAPP) return "Chat on WhatsApp";
  const m = link.match(/^(\/[a-z-]+)(?:\?type=(create|build))?/);
  if (!m || !PAGES[m[1]]) return null;
  return m[1] === "/work" && m[2] ? WORK_TYPE[m[2]] : PAGES[m[1]].label;
}

const PATHS = "create|build|studios|work|start-project|contact|faq|grow|about|privacy|terms";
const PATH = `/(?:${PATHS})(?:\\?type=(?:create|build))?(?:#[\\w-]+)?`;
const TAG = new RegExp(`[ \\t]*\\[\\[\\s*(${WHATSAPP}|${PATH})\\s*\\]\\]`, "gi");
const FULL = new RegExp(`(?<![\\w./])(?:https?://)?(?:www\\.)?makendless\\.vercel\\.app(${PATH})?/?(?![\\w/-])`, "gi");
const RAW = new RegExp(`(?<![\\w/.])(${PATH})(?![\\w/-])`, "g");
const WORK_WORDS: Record<string, string> = { create: "the reels on our work page", build: "the websites on our work page" };
const words = (path: string) => {
  const t = path.match(/^\/work\?type=(create|build)/);
  return t ? WORK_WORDS[t[1]] : PAGES[path.match(/^\/[a-z-]+/)![0]].words;
};

/** Takes the page links out of a reply: [[/create]] tags are removed and any raw path in a sentence becomes
    plain words ("our video editing page"). Returns at most 3 links, in the order they appeared. */
export function splitLinks(text: string): { text: string; links: string[] } {
  const links: string[] = [];
  const add = (l: string) => { const k = l.toLowerCase() === WHATSAPP ? WHATSAPP : l; if (!links.includes(k)) links.push(k); };
  let t = text.replace(TAG, (_, l: string) => { add(l); return ""; });
  t = t.replace(FULL, (_, l?: string) => { if (!l) return "our website"; add(l); return words(l); });
  t = t.replace(RAW, (_, l: string) => { add(l); return words(l); });
  t = t.replace(/\(\s*\)/g, "").replace(/[ \t]+([.,!?;:])/g, "$1").replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return { text: t, links: links.slice(0, 3) };
}
