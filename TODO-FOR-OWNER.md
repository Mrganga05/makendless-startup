# Things only the owner can supply or approve

Nothing below has been invented on the site; these are the gaps.

1. **Domain name** → set `NEXT_PUBLIC_SITE_URL` (see DEPLOY.md). Until then canonical/sitemap URLs point at localhost.
2. **Inquiry delivery** for the Start a Project form: pick a service (e.g. Formspree, Resend, or a business email). Today the form builds the brief in the browser and honestly says it is not sent. Plug-in point: `lib/submit-brief.ts`.
3. **Contact email** (`NEXT_PUBLIC_CONTACT_EMAIL`) — enables the "open a draft in your email app" option.
4. **Prices** — packages show "Request Quote" until real prices are approved (`data/packages.ts`).
5. **Policies**: revision counts, delivery timelines, payment terms (FAQ and process copy deliberately avoid commitments).
6. **Privacy Policy and Terms** text (pages are honest placeholders).
7. **Real portfolio samples** (videos, sites) to replace "Concept demo" visuals.
8. **Approve the logo** — the studio "E" (spine + CREATE/BUILD/GROW bars). Files in `docs/brand/`.
9. **GROW (Beta)** launch decision — when ready, remove the Beta labels in `data/studios.ts`.
10. Optional: social media profile links for the footer.

## Services, prices, combos and referrals (added 2026-11-20)
Prices, combos and words live in `data/pricing.ts`; sample links in `data/samples.ts` (each "See samples ↗" appears once a link is added); site URL, WhatsApp and email come from `data/owner.ts` via `data/settings.ts`.
To make Start a Project saving, referrals and /admin work on the live site:
1. Create a free Supabase project → SQL Editor → run `supabase/schema.sql`.
2. Vercel → Settings → Environment Variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD` (and optionally `RESEND_API_KEY` for new-lead emails). Redeploy.
3. Set the real WhatsApp number in `data/owner.ts`: the "Send on WhatsApp" fallback needs it.
Until step 1–2 are done, Start a Project shows the WhatsApp/copy fallback and "Get my referral link" shows an error.
Note: the nav "Start a Project" button still opens the older brief form at /contact (left unchanged on purpose).
