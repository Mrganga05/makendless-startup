# MAKENDLESS website — working spec

> NOTE: the owner referred to `MAKENDLESS-website-build-prompt.md`, which was not found on this machine.
> This digest is compiled from the owner's master startup prompt and the build brief (Rules 1–7) given in chat.
> If the real file turns up, it wins over this digest.

## Brand (locked)
- Name: **MAKENDLESS** (exact spelling). Positioning: Creative & Technology Studio. Philosophy: CREATE • BUILD • GROW.
- Headline: "We make ideas impossible to ignore."
- Typeface: **Syne** only. No other fonts.
- Small freelance team (~6: 2 video editors, 2 web developers, 2 business/client). Not incorporated, no trademark claims. No named team members on the site.
- Exactly three customer-facing divisions: CREATE — Video Editing; BUILD — Website Development; GROW — Digital Marketing (**Beta / Coming Soon** everywhere).
- No AI automation / chatbot / AI assistant service anywhere on the site.

## Colour tokens ("Prism Atelier", proposed variant — keep)
ink #0C1024 · surface #202342 · paper (light sections) #F6F7FC · violet #6F45F6 · aqua #08BBD4 · light text #F6F8FF · dark text #13172B · muted #A4AAC7.
Signature gradient: linear-gradient(115deg, #22D3EE 0%, #8B5CF6 52%, #C7A6FF 100%). Division accents: CREATE aqua #22D3EE, BUILD violet #8B5CF6, GROW lilac #C7A6FF.
Dark cinematic and light editorial sections must ALTERNATE; no two neighbouring sections may look alike. Avoid a uniformly dark site, repetitive glows, generic SaaS cards, dashboard look.

## Service catalogue (data/site.ts is the single source of truth)
- CREATE: V1 short-form, V2 long-form & podcast, V3 promotional & ad, V4 repurposing & creator packages, V5 motion graphics.
- BUILD: T1 business websites, T2 e-commerce, T3 booking systems & custom web apps, T4 redesign & optimisation, T5 maintenance & support.
- GROW (Beta): M1 Meta & Google Ads, M2 social media management, M3 local presence & analytics.
- Target customers: content creators, local businesses, startups, online stores.

## Homepage — exactly seven sections, in this order
1. **Cinematic Hero** — headline; supporting line "Premium video editing and website development for creators and businesses. Digital marketing in beta."; opens raw/wireframe and transforms into finished edit + finished website; draggable timeline playhead controls the transformation; realistic 3D phone playing video and 3D laptop/browser with a live mini site; three modes (Video Editing / Website Development / Digital Marketing — Beta); working Start a Project (→ project form) and Explore Studios (→ studios section).
2. **Our Three Studios** — headline "Three worlds. Endless possibilities." Three premium interactive gateways (not small generic buttons) with beautiful service previews, distinct motion identity each, working links to /create /build /grow, GROW Beta indicator; balanced on desktop, all three easy to find and tap on mobile.
3. **Live Transformation** — headline "See the difference." One dominant immersive demo with compact controls and three modes: Video (raw → edited reel: before/after, caption treatments, reframing, motion preview, playback); Website (wireframe → finished: desktop/mobile preview, responsive demo, functional sample UI); Marketing Beta (clearly simulated: example ad creative, objective selection, social ad preview, sample campaign layout; no results).
4. **Solutions For You** — headline "Made for what you're building." Four selectable customer types (Content Creator, Local Business, Startup, Online Store); selection meaningfully changes visuals + recommended services + short description; Explore Services and Start a Project CTAs.
5. **Packages & Pricing** — headline "Find your starting point." Three categories (Video Editing, Website Development, Digital Marketing — Beta). Package name, suitable customer, typical deliverables, scope info, optional additions, clear next action. **No invented prices** → "Request Quote". Brighter, clean layout; not a generic SaaS pricing table. GROW stays Beta / Coming Soon.
6. **How We Work + FAQ** — headline "From idea to delivery." Four steps DISCOVER · DESIGN · CREATE · DELIVER with motion that clarifies progression. FAQ covering: how to start, project requirements, quote process, revisions, delivery timelines, ongoing support. Calm, elegant. No invented guarantees. No team showcase.
7. **Final CTA + Footer** — headline "Let's make something worth remembering."; line "Tell us what you're building. We'll help you take the next step."; main CTA Start a Project; refined cinematic closing. Footer: MAKENDLESS, CREATE, BUILD, GROW — Beta, Studios, About, FAQ, Contact, Privacy, Terms. No invented contact details.
Do NOT add Selected Work, Living Project Lab, a team showcase or any extra major homepage section.

## Internal pages
Home, Studios overview, CREATE, BUILD, GROW (Beta), About, Contact / Start a Project, FAQ, Privacy, Terms. Simple primary navigation.

## Start a Project form
Fully built: fields, validation, loading, success and error states. No delivery service is approved yet, so it must NEVER show a false "sent" message. Do not connect any email/form service.

## Quality bar
- Portfolio-grade: looks like a top international creative studio, not a template.
- Every button, link, tab, slider, switch and form does something real. No decorative controls.
- Real 3D (React Three Fiber) ONLY in the Hero, Live Transformation and Final CTA. Every 3D object must depict the studio's work: devices, video frames, timelines, wireframes. No abstract cubes, spheres, blobs or particles. Other sections use CSS, SVG and video motion.
- Each division has its own visual and motion identity.
- Varied professional motion: kinetic typography, mask reveals, scroll-driven transitions — not the same fade-up everywhere.

## Every device
- Check 360, 390, 768, 1024, 1440. Mobile is recomposed, not shrunk. Hero headline + both buttons visible on a phone without scrolling.
- No sideways scrolling. Touch targets ≥ 44px. Nothing essential depends on hover. Full keyboard support with visible focus.
- 3D loads after text, lower detail on phones, pauses off-screen, has a still fallback. Reduced-motion gets a calm version. No audio autoplay.

## Honest content
- GROW labelled Beta / Coming Soon everywhere; its demos say "Illustrative demo" and show no performance numbers.
- Never invent prices, policies, revision counts, delivery times, guarantees, clients, reviews, statistics, awards, team names or contact details. Missing items go to TODO-FOR-OWNER.md.
- Original demo content captioned "Concept demo". No copyrighted footage or real brand logos.

## Engineering
Next.js 15 (app router) · React 19 · TypeScript · Tailwind 4 · three / @react-three/fiber / drei · motion. Centralised tokens in app/globals.css, typed data in data/site.ts, reusable components.
Known gotchas in this repo:
- Use RELATIVE imports (the `@/` alias fails in the webpack build here).
- drei `<Html transform>` screens only stay locked to 3D bodies if the 3D world is scaled ×100 (see components/Hero3D.tsx). Reuse that pattern.
- Rounded slab geometry: use the `Slab` extrude helper in Hero3D.tsx, not RoundedBox with radius > half thickness.
- Screenshots/tests: puppeteer-core with installed Chrome (see scripts/shots.mjs and scripts/audit-shots.mjs).
