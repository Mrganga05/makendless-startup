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
- `app/` — homepage (7 approved sections) + `/studios /create /build /grow /about /faq /contact /privacy /terms`
- `components/` — Hero (3D glass prism, WebGL + reduced-motion SVG fallback), Studios, Transformation (live video/web/marketing demos), Solutions, Packages, ProcessFaq, FinalCta
- `data/site.ts` — typed service, package, FAQ data (single source of truth)

## Open items (not invented)
- **Prices**: none published; packages say *Request Quote*. Add only owner-approved prices.
- **Contact**: set `NEXT_PUBLIC_CONTACT_EMAIL` (see `.env.example`) or connect a form backend. Until then the form validates but sends nothing.
- **Privacy / Terms**: placeholders pending legal review.
- **Colour variant**: "Prism Atelier" is a proposal, not final.
- **Package names, FAQ answers**: drafts for owner approval.
- GROW is **Beta**; no results or guarantees are shown. Demos are labelled illustrative.
