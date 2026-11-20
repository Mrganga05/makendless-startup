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

## Database, email alerts and /admin (updated 2026-11-20)
Follow **SETUP-GUIDE.md** (Supabase + Resend + Vercel keys, step by step). Until then the forms show the WhatsApp fallback and /admin can't log in.
- Combo packs are switched off (`COMBOS_ENABLED` in `data/pricing.ts`).
- "Our work" stays hidden until links are added in `data/work.ts`.
- Still placeholders in `data/owner.ts`: city, state, grievance name, founder name (used by Privacy/Terms/About/FAQ text, which was not changed).
