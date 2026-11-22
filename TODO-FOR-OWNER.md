# Things only the owner can supply or approve

Updated 2026-11-22. The site is live with published, fixed prices and one Start a Project flow.

1. **Meta Pixel ID** → Vercel → Project → Settings → Environment Variables → `NEXT_PUBLIC_META_PIXEL_ID` (Production), then redeploy. Empty = no pixel.
2. **Database and email alerts** → follow **SETUP-GUIDE.md** (Supabase + Resend + Vercel keys). Until then forms show the WhatsApp fallback and /admin can't log in.
3. **Run the control room upgrade** in Supabase: `supabase/upgrade-2026-11-22-control-room.sql` (SETUP-GUIDE 1b), then add `CRON_SECRET` in Vercel.
4. **Prices, packs, FAQ, work samples, reviews** → /admin → Website (no code needed).
5. **Team logins** → add members in /admin → Settings. They can log in once your own domain is verified for login emails (until then only makendlessofficial@gmail.com receives a link).
6. **WhatsApp number / email** → /admin → Settings.
7. **GROW (Beta)** launch decision → remove the Beta labels in `data/pricing.ts` when ready.
8. Optional: more social links in `data/owner.ts` (SOCIALS).
