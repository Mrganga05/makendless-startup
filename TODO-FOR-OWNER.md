# Things only the owner can supply or approve

Updated 2026-11-22. The site is live with published, fixed prices and one Start a Project flow.

1. **Meta Pixel ID** → Vercel → Project → Settings → Environment Variables → `NEXT_PUBLIC_META_PIXEL_ID` (Production), then redeploy. Empty = no pixel.
2. **Database and email alerts** → follow **SETUP-GUIDE.md** (Supabase + Resend + Vercel keys). Until then forms show the WhatsApp fallback and /admin can't log in.
3. **Prices and combo packs** → change only in `data/pricing.ts`; every page updates.
4. **WhatsApp number** in `data/owner.ts` is marked temporary: change it there only.
5. **Real portfolio samples** → add links in `data/work.ts` ("Our work" stays hidden until then).
6. **GROW (Beta)** launch decision → remove the Beta labels in `data/pricing.ts` when ready.
7. Optional: more social links in `data/owner.ts` (SOCIALS).
