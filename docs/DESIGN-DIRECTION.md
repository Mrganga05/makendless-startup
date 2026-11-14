# Design direction and build contracts (decided by the build lead)

Read together with `docs/SPEC-WORKING.md` (the spec) and `AUDIT.md` (what is wrong today).

## 1. Section rhythm — fixed, do not change
| # | Section | id | Tone (`data-tone`) | Surface |
|---|---------|----|--------------------|---------|
| 1 | Hero | `hero` | dark | ink `bg-ink` |
| 2 | Three Studios | `studios` | light | paper `bg-paper`, editorial; the three gateways carry the colour |
| 3 | Live Transformation | `transformation` | dark | "edit suite": `bg-surface-2` → `bg-ink-deep`, real 3D allowed |
| 4 | Solutions For You | `solutions` | light | white / `bg-paper-2`, each customer type tints the panel |
| 5 | Packages & Pricing | `packages` | dark (nav) | **bright violet brand band** (`bg-violet`, white cards, dark text on cards) — bright, not ink, not paper |
| 6 | How We Work + FAQ | `process` (+ `faq` on the FAQ block) | light | paper `bg-paper`, calm and elegant |
| 7 | Final CTA | `start` | dark | cinematic ink, real 3D allowed |
| – | Footer | – | dark | `#080b1a` (already built: `components/Footer.tsx`) |

Every `<section>` MUST set `id` and `data-tone="light"` or `"dark"` (the nav and the focus ring read it).
Neighbouring sections must not look alike: different layout structure, different motion language, different surface.

## 2. Division identities (use consistently everywhere: studios gateways, hero, pages, packages, form)
- **CREATE — Video Editing** · accent `create` #22d3ee (aqua). Motifs: film frames, timeline tracks, playhead, waveform, caption blocks, 9:16 frames. Motion: hard cuts, snaps, horizontal scrubs, word-pop captions.
- **BUILD — Website Development** · accent `build` #8b5cf6 (violet). Motifs: wireframe grid, browser chrome, layout blocks, cursor, breakpoints. Motion: lines drawing in, blocks assembling and snapping to a grid, responsive resizing.
- **GROW — Digital Marketing (Beta)** · accent `grow` #c7a6ff (lilac). Motifs: feed/story ad frames, content calendar, placement cards, soft broadcast rings. Motion: gentle ripple / stacking cards. ALWAYS shows "Beta" next to the name. NEVER charts, rising bars, numbers, percentages or anything implying results. Demos carry "Illustrative demo".

## 3. Shared building blocks — use them, do not re-implement
- `components/ui.tsx`: `useTabs` (arrow keys / Home / End / ARIA wiring), `useInView`, `useReducedMotion`, `useIsMobile`, `hasWebGL`, `Reveal` (kinds: mask-up, wipe-right, clip-down, scale-in, fade), `KineticHeading`, `Eyebrow`, `BetaBadge`, `DemoCaption` (concept | illustrative), `ButtonLink`, `Arrow`, `EASE`.
- Colour: Tailwind token classes from `app/globals.css` `@theme` — `bg-ink bg-ink-deep bg-surface bg-surface-2 bg-paper bg-paper-2 border-line text-light text-dark text-muted text-muted-dark text-violet text-violet-soft text-aqua text-aqua-bright` and `create / build / grow` (e.g. `text-create`, `bg-build/20`). Gradient: `.prism-text` or `style={{ background: "var(--prism)" }}`.
  Do NOT hard-code hex colours in JSX class names. For Three.js / canvas / computed inline styles import from `data/tokens.ts`.
- Typeface: Syne only. No `font-mono`, no other font families (use `tabular-nums` for timecodes).
- Text sizes: nothing a visitor is meant to read below 12px (inside scaled 3D screens: design so it renders ≥ 11px on screen).
- Contrast: on light surfaces use `text-dark` / `text-muted-dark`; never `text-muted` (#a4aac7) on light.

## 4. Link contract
- Start a Project → `/contact`. Add context with query params (the form reads them):
  `/contact?service=create|build|grow` · `&package=<slug as in data/packages.ts>` · `&for=creator|local|startup|store`
- Studios: `/create`, `/build`, `/grow`, overview `/studios`. Homepage anchors: `/#studios`, `/#transformation`, `/#solutions`, `/#packages`, `/#process`, `/#faq`, `/#start`.

## 5. Data contract (other files import these — keep names and shapes; you may ADD fields)
- `data/studios.ts`: `StudioId`, `Studio`, `studios`
- `data/packages.ts`: `Package`, `packages: Record<StudioId, Package[]>`
- `data/solutions.ts`: `Solution`, `solutions`
- `data/process.ts`: `process: {n,title,text}[]`, `faqs: {q,a}[]`
- `data/site.ts` re-exports all of the above. `lib/site.ts` has `CONTACT_EMAIL` (empty until the owner supplies one), `SITE_URL`.

## 6. Engineering rules
- Next.js 15 app router, React 19, TypeScript strict, Tailwind 4. No new npm dependencies.
- RELATIVE imports only (the `@/` alias breaks the webpack build in this repo).
- Server components by default; add `"use client"` only where state/effects are needed.
- 3D (only Hero, Live Transformation, Final CTA): `next/dynamic` with `ssr:false`; text renders first; mount the Canvas only when the section is near the viewport; `frameloop="never"` while off-screen; capped `dpr` and fewer lights on phones; a still, non-WebGL fallback; no 3D under reduced motion. Objects must depict the work (devices, video frames, timelines, wireframes) — no abstract cubes/spheres/particles.
  drei `<Html transform>` screens only stay locked to bodies when the world is scaled ×100 — copy the pattern (and the `Slab` rounded-slab helper) from `components/Hero3D.tsx` into your own file rather than importing from it.
- Motion: vary it. Kinetic type, mask reveals, clip wipes, scroll-driven progress, state transitions. No blanket fade-up. SMIL `<animate>` is forbidden (it ignores reduced motion) — use CSS animations/transitions so the global reduced-motion rule applies. Timers and animations must stop when off-screen.
- Every control does something real and visible. Tabs use `useTabs`. Touch targets ≥ 44px. Nothing essential on hover only. Visible focus (global rule already handles it). Hidden/clipped controls must not be focusable (`inert` / `tabIndex={-1}` / `hidden`).
- No sideways scroll at 360 / 390 / 768 / 1024 / 1440. Long words in big headlines must fit at 360 (use `clamp()` / smaller mobile sizes / `text-balance`).
- Honest content (spec "Honest content"): no invented prices, policies, revision counts, delivery times, guarantees, clients, reviews, stats, team names, contact details. Demos: "Concept demo"; marketing demos: "Illustrative demo", no numbers. Unknowns → report them as owner TODOs.
