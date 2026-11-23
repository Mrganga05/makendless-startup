# Things only the owner can supply or approve

Updated 2026-11-23. The site is live with published, fixed prices and one Start a Project flow. /admin now uses email + password.

1. **Meta Pixel ID** → Vercel → Project → Settings → Environment Variables → `NEXT_PUBLIC_META_PIXEL_ID` (Production), then redeploy. Empty = no pixel.
2. **Database and email alerts** → follow **SETUP-GUIDE.md** (Supabase + Resend + Vercel keys). Until then forms show the WhatsApp fallback and /admin can't log in.
3. **Run `supabase/schema.sql` in Supabase** (SETUP-GUIDE step 3: adds lead Notes and the Proposal status), switch off public sign-ups (step 4), create your /admin password (step 5), then add `CRON_SECRET` in Vercel.
4. **Prices, packs, FAQ, work samples, reviews** → /admin → Website (no code needed).
5. **Team logins** → /admin → Settings → + Add member, with a password; send it to them privately.
6. **WhatsApp number / email** → /admin → Settings.
7. **GROW (Beta)** launch decision → remove the Beta labels in `data/pricing.ts` when ready.
8. Optional: more social links in `data/owner.ts` (SOCIALS).
9. **Chatbot** → add your Claude API key in Vercel as `ANTHROPIC_API_KEY` (SETUP-GUIDE step 8), then redeploy. Until then the chat button opens but says the assistant is offline and points to WhatsApp.
10. **Real work** → add reels and websites in /admin → Website → **Work samples** (or per-service links in `data/samples.ts`). The "Concept demo" labels on CREATE / BUILD then turn into "See our real work" links by themselves.
