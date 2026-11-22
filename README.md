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
- `app/` — homepage + `/studios` (Services + combo packs) `/create /build /grow /about /faq /contact /start-project /privacy /terms /admin`
- `data/pricing.ts` — THE one price file: every service, option, extra, combo pack, video discount and referral rule. Every page reads it.
- `data/owner.ts` — email, WhatsApp, grievance contact, policy numbers.

## How the site works now
- **Prices are published and fixed** on `/create` and `/build` (from `data/pricing.ts`). The final price is confirmed on WhatsApp before work starts. Website Care shows as "Add-on · ₹1,499/month" everywhere.
- **One "Start a Project" flow**: every Start a Project button goes to `/start-project`. With services selected it shows the selection, applied combo pack, discounts and total. With nothing selected it offers "Pick services and see prices" (`/studios`) or "Not sure? Write us a brief" (`/contact`).
- **Combo packs** are on (`COMBOS_ENABLED`), listed on `/studios`, applied automatically on `/start-project`.
- **Referral**: ₹500 off for the friend and ₹500 credit for the referrer, on projects of ₹2,000 or more.
- **Forms** (Start a Project, contact brief, referral, GROW waitlist) save to Supabase and email the team (see SETUP-GUIDE.md).
- **Meta Pixel**: set `NEXT_PUBLIC_META_PIXEL_ID` in Vercel. Empty = no pixel. Never loads on `/admin`. Events: PageView, ViewContent (/create /build /grow), Lead (successful form sends), Contact (WhatsApp clicks).
- **/admin = control room**: Home (month money, target, leads waiting), Leads (all 4 forms + hand-added), Projects + payments, Expenses, Team + payouts, Referrals, Website content, Reports (12 months, Excel/CSV), Trash (30 days), Activity log, Settings + backups. Owner (makendlessofficial@gmail.com) sees everything; a Team member sees only leads and projects assigned to them, without money, and the API enforces it.
- **Website content lives in the database** (table `site_content`, edited in /admin → Website). `data/pricing.ts`, `data/process.ts` and `data/work.ts` are the defaults until the Owner saves. Pages refresh within 60 s (`lib/content.ts`).
- About page talks about the studio only (the MAKENDLESS Team); the public location is "India" (Terms name the courts in Hyderabad, Telangana).
- GROW is **Beta**; no results or guarantees are shown. Demos are labelled illustrative.
