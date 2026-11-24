# MAKENDLESS — Website

**CREATE • BUILD • GROW** — We make ideas impossible to ignore.

Next.js 15 · React 19 · TypeScript · Tailwind 4 · Three.js / React Three Fiber · Motion · Syne

## Run
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Structure
- `app/` — homepage + `/studios` (Services + combo packs) `/work /create /build /grow /about /faq /contact /start-project /privacy /terms /admin`
- `data/pricing.ts` — THE one price file: every service, option, extra, combo pack, video discount and referral rule. Every page reads it.
- `data/owner.ts` — email, WhatsApp, grievance contact, policy numbers.

## How the site works now
- **Prices are published and fixed** on `/create` and `/build` (from `data/pricing.ts`). The final price is confirmed on WhatsApp before work starts. Website Care shows as "Add-on · ₹1,499/month" everywhere.
- **One "Start a Project" flow**: every Start a Project button goes to `/start-project`. With services selected it shows the selection, applied combo pack, discounts and total. With nothing selected it offers "Pick services and see prices" (`/studios`) or "Not sure? Write us a brief" (`/contact`).
- **Combo packs** are on (`COMBOS_ENABLED`), listed on `/studios`, applied automatically on `/start-project`.
- **Referral**: ₹500 off for the friend and ₹500 credit for the referrer, on projects of ₹2,000 or more.
- **Forms** (Start a Project, contact brief, referral, GROW waitlist) save to Supabase and email the team (see SETUP-GUIDE.md). `supabase/schema.sql` is the one database file (safe to re-run). The chatbot saves its leads itself (source Chatbot).
- **AI chatbot "MAKENDLESS Assistant"**: round button above the WhatsApp button on every page (not /admin, /start-project, /contact). `components/ChatWidget.tsx` (small button; the chat window `components/ChatPanel.tsx` downloads only when opened) → `app/api/chat/route.ts` (Vercel function, Claude `claude-haiku-5-5`, key `ANTHROPIC_API_KEY` server only, 400 tokens per reply, last 10 messages, 1000 characters per message, 20 messages per visitor per 10 min). Its knowledge is built from the same live data as the pages (`lib/chat-knowledge.ts`), so /admin price edits reach it at once. When a visitor is interested it asks for name + WhatsApp and saves a lead (source Chatbot) with an email alert. Page links in replies show as buttons ("See video prices", `lib/chat-links.ts`), never raw paths; quick replies (Services, Pricing, See our work, Contact, Chat on WhatsApp) stay under every answer. Any button can open it with `openChat()`; the BUILD AI Assistants card has "Try our live AI assistant". The chat and WhatsApp buttons rise above the hero timeline on the first screen and step aside on phones while a reel plays.
- **Meta Pixel**: set `NEXT_PUBLIC_META_PIXEL_ID` in Vercel. Empty = no pixel. Never loads on `/admin`. Events: PageView, ViewContent (/create /build /grow), Lead (successful form sends), Contact (WhatsApp clicks).
- **/admin = control room**, email + password login (Supabase Auth; Owner sets team passwords in Settings; Forgot password emails a reset link): Home (month money, target, leads waiting), Leads (name, WhatsApp, services, quote total, referral code, source Form / Referral / Waitlist / Chatbot / Manual, date, status dropdown New / Contacted / Proposal / Won / Lost, notes), Projects + payments, Expenses, Team + payouts, Referrals (each referrer and the leads they brought), Website content, Reports (12 months, Excel/CSV), Trash (30 days), Activity log, Settings + backups. Owner (makendlessofficial@gmail.com) sees everything; a Team member sees only leads and projects assigned to them, without money, and the API enforces it.
- **Website content lives in the database** (table `site_content`, edited in /admin → Website). `data/pricing.ts` and `data/process.ts` are the defaults until the Owner saves. Pages refresh within 60 s (`lib/content.ts`).
- **Work showcase** (`/work`, homepage "Selected work", "Recent work" on /create and /build): every reel and website comes from ONE file, `data/work.ts` (add one entry). Reels: compressed 9:16 posters in `public/work`, videos load only when played (hover preview on desktop, tap on phones, sound + fullscreen buttons, one at a time). Websites: real desktop + phone screenshots (Playwright) in a laptop + phone mockup with a Live badge. Reels and websites use one swipe slider (`components/work/Slider.tsx`: snap scrolling, ← → arrows, about 2.5 website cards on desktop, 1.1 on phones; equal-height cards). Testimonials (homepage, above the FAQ) come from `REVIEWS` in the same file or /admin, hidden until one exists. /admin → Website → Work samples now only lists them.
- About page talks about the studio only (the MAKENDLESS Team); the public location is "India" (Terms name the courts in Hyderabad, Telangana).
- GROW is **Beta**; no results or guarantees are shown. Demos are labelled illustrative.
- "Concept demo" labels on the CREATE / BUILD scenes link to /work?type=create or /work?type=build now that real work exists. The hero mock-ups keep their concept label: their content is invented. Footer: "Concept visuals are marked as demos. See real projects on our Work page."
- **SEO**: unique title + description per page (`pageMeta` in `lib/site.ts`), a share image per page (`app/<page>/opengraph-image.jpg`, made by `node scripts/og-pages.mjs` after a build), `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, and JSON-LD for a local business in India (`lib/schema.ts`, built from the live prices).
