# AUDIT — MAKENDLESS website

Audit of the site as it stood at commit `bad16e6` (hero rebuilt, everything else first-pass).
Method: screenshots of every homepage section and page at 1440 and 390 px (`docs/audit/`), then 12 independent auditors (one per section / page group / cross-cutting concern) tested the running production build with real Chrome, and a second reviewer re-checked every finding. Only findings that survived the re-check are listed; items the reviewer added are marked *(added on re-check)*.

Spec used: `docs/SPEC-WORKING.md` (the named file `MAKENDLESS-website-build-prompt.md` was not found on this machine).
**Totals:** 228 confirmed findings — 20 blockers, 104 major, 104 minor.


## 1. Shared foundation (tokens, nav, footer)

The shared foundation is small and functional: a 53-line globals.css with a Tailwind 4 @theme token block, a root layout loading Syne via next/font with a working skip link, a fixed blurred Nav (4 links + Start a Project, hamburger under 768px), a 3-column Footer, and a PageShell used by all internal pages. All 10 routes and every nav/footer link return HTTP 200, there is no sideways scroll at 360/390/768/1024/1440, and focus rings are present. What is missing is the finishing layer: the tokens are declared but never used (320 hard-coded hex literals in components), there is no favicon/OG/robots/sitemap (public/ is empty), no custom 404, and the mobile menu has no Escape, scroll-lock, focus containment or overflow handling. The nav also degrades visibly over the light sections. Test scripts and screenshots are in /Users/raghusai/Desktop/CLAUDE 2.0/MAKENDLESSNWEBSITE/docs/audit/tmp/ (foundation-test.mjs, foundation-test2.mjs, foundation-*.png).

**Keep as-is:**
- Wordmark treatment (MAKEND + prism-gradient LESS, wide tracking) in nav and footer - distinctive and consistent; keep exactly.
- Syne-only font loading via next/font with display swap (layout.tsx:6); document.fonts confirms only Syne 400-800 plus its fallback is loaded on shipped pages.
- Skip link (layout.tsx:18): first Tab stop, clearly visible white pill with cyan ring (tmp/foundation-skiplink-1440.png), and activating it moves the tab sequence past the header into main.
- Global :focus-visible rule (globals.css:26) - 2px #22d3ee outline with 3px offset applies to every link/button; clearly visible on dark surfaces (tmp/foundation-footer-focus.png).
- Global prefers-reduced-motion block (globals.css:34-36); computed scroll-behavior switches to auto under reduced motion.
- Hamburger button: 44x44, correct aria-expanded / aria-controls / aria-label toggling ('Open menu'/'Close menu'), animated icon; mobile menu rows are 61px tall and the CTA 52px - comfortable targets.
- Mobile menu closes on link tap and on wordmark tap, and unmounts cleanly when resized to desktop.
- All nav and footer links resolve: /, /studios, /about, /faq, /contact, /create, /build, /grow, /privacy, /terms all HTTP 200; footer contains exactly the spec list including 'GROW — Beta'; no invented contact details.
- Footer structure: three labelled <nav> groups with headings, honest copyright line, CREATE • BUILD • GROW tagline.
- Per-page titles via the '%s — MAKENDLESS' template; exactly one h1 and one main per page; html lang='en'; themeColor set.
- No horizontal overflow at 360/390/768/820/1024/1440 (scrollWidth == viewport); desktop nav fits at 768 without wrapping (tmp/foundation-nav-768.png).
- PageShell dark hero band + light/dark body pattern with eyebrow/h1/intro - a sound reusable base; 'Explore Studios' anchor lands with the heading 160px below the fixed nav (not hidden).

**Findings:**

1. **[major · off-spec] Colour tokens are declared but never used - 320 hard-coded hex literals across components**  
   Where: app/globals.css:3-17 vs components/*.tsx and app/*/page.tsx (e.g. components/Nav.tsx:23,28,30,41,45; components/PageShell.tsx:5,7,9,12; components/FinalCta.tsx:11,13,15,16,19)  
   Evidence: grep of #RRGGBB in app/ + components/ *.tsx: 320 occurrences, 69 distinct values, in 19 files (HeroScreens 75, Transformation 67, Hero3D 30, Hero 29, Solutions 24, Packages 18...). Uses of token utilities (bg-ink, text-muted, text-dark, bg-paper etc.): 0. Uses of var(--color-*/--prism): 5. Most-repeated literals are exactly the tokens: #13172b x44, #22d3ee x34, #a4aac7 x27, #0c1024 x27, #c7a6ff x25, #6f45f6 x20. Near-duplicate off-palette greys have crept in (#7a8099, #5b607a, #59607f beside token #5a6082). The BUILD accent #8b5cf6 (x19) has no token at all; the prism gradient lives in :root not @theme; globals.css itself hard-codes #6f45f6 (line 23) and #22d3ee (lines 26, 52). data/site.ts:21,36,52 also hard-codes accents. Spec: 'Centralised tokens in app/globals.css'.  
   Fix: Add missing tokens to @theme (--color-create #22d3ee, --color-build #8b5cf6, --color-grow #c7a6ff, --color-focus, gradient as --background-image-prism or keep --prism), then mechanically replace arbitrary values with utilities: bg-[#0c1024]->bg-ink, text-[#a4aac7]->text-muted, text-[#13172b]->text-dark, bg-[#f6f7fc]->bg-paper, etc. Collapse the stray greys onto muted / muted-dark. For Three.js materials and inline styles export a typed palette object from one file (e.g. data/tokens.ts) mirroring the CSS tokens. Start with the shared files (Nav, PageShell, FinalCta) then the sections.

2. **[major · missing] No custom 404 - default Next.js page, off-brand and a dead end**  
   Where: app/not-found.tsx does not exist; http://localhost:3456/nope-404 @1440  
   Evidence: tmp/foundation-404-1440.png: pure black (#000) body instead of ink, default system-font '404 | This page could not be found.', no footer, zero links inside main (measured: links [], hasFooter false). Title is the generic home title. Breaks 'Syne only' and the portfolio-grade bar; the only way out is the nav.  
   Fix: Add app/not-found.tsx using PageShell (eyebrow '404', on-brand headline such as 'This frame got cut.', short line, two real CTAs: Back to home, Start a Project) with metadata title 'Page not found'. Keep it CSS-only (no 3D).

3. **[major · missing] No favicon, app icons, Open Graph / Twitter metadata, robots or sitemap; public/ is empty**  
   Where: app/layout.tsx:8-11; public/ (empty); /favicon.ico, /icon.png, /robots.txt, /sitemap.xml, /manifest.webmanifest  
   Evidence: curl: all five return 404. Every page load logs a console error '404 http://localhost:3456/favicon.ico'. Rendered <head> on all 10 routes has no link[rel=icon], no og:* and no twitter:* tags, no canonical (measured per page: og false, tw false, canon false, icon false). No metadataBase. Shared links will show a blank preview and the tab shows the default globe.  
   Fix: Add app/icon.svg (an 'M' or the prism LESS mark on ink) plus app/apple-icon.png, app/opengraph-image.tsx (generated with next/og: wordmark + headline on ink with prism gradient), openGraph/twitter blocks in layout metadata, app/robots.ts and app/sitemap.ts. metadataBase needs the real production domain - owner input; until then leave it environment-driven (NEXT_PUBLIC_SITE_URL) rather than inventing a domain.

4. **[major · a11y] Mobile menu ignores Escape and has no outside-tap close**  
   Where: components/Nav.tsx:20-47; tested at 390x844 and 360x640  
   Evidence: foundation-test.mjs: after opening, pressing Escape -> '#mobile-menu' still present (true); tapping the page below the panel -> still present (true). There is no keydown handler anywhere in Nav.tsx. Only the X button, a link tap or the wordmark close it. Spec: full keyboard support.  
   Fix: In Nav add a useEffect while open: keydown Escape -> setOpen(false) and return focus to the toggle button (ref); add a transparent backdrop button/div below the panel that closes on click; also close on pathname change via usePathname.

5. **[major · a11y] Open mobile menu does not lock scroll or contain focus - page scrolls and tabs behind it**  
   Where: components/Nav.tsx:40-47; 390 and 360 widths  
   Evidence: With menu open, scrollTo(1500) succeeded (scrollY 1500, body overflow-y auto) and the panel floats over mid-page content with no dimming (tmp/foundation-menu-390-scrolled.png shows Studios cards scrolling under the open menu). Tab order from the toggle: Studios, About, FAQ, Contact, Start a Project, then straight into 'PAGE-BEHIND Start a Project', 'PAGE-BEHIND Explore Studios' (hero). main has no inert attribute; the panel has no dialog semantics. The hero canvas and timeline remain interactive directly under the panel (docs/audit/390-mobile-menu.png).  
   Fix: While open: set document.documentElement.style.overflow='hidden' (restore on close), set inert on <main> (or trap Tab within header), and render a full-height ink backdrop (fixed inset-0 top-16, bg-ink/80 backdrop-blur) so the menu reads as a deliberate full-screen overlay rather than a dropdown over a live 3D scene.

6. **[major · mobile-break] Mobile menu is cut off in landscape - Start a Project unreachable**  
   Where: components/Nav.tsx:23,41; viewport 667x375 (phone landscape, still below md)  
   Evidence: Measured: menu bottom = 417px, viewport height = 375px; header is position:fixed with overflow visible and the menu has overflow-y visible, so the overflow cannot be scrolled to. tmp/foundation-menu-landscape.png shows the white 'Start a Project' pill sliced by the bottom edge with only ~34px of its 52px visible.  
   Fix: Give the panel max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain (and tighten row padding under a max-height media query), or switch the panel to a fixed inset-x-0 top-16 bottom-0 scrollable overlay.

7. **[major · visual-weak] Sticky nav turns muddy grey over light sections and link contrast drops below AA**  
   Where: components/Nav.tsx:23 (bg-[#0c1024]/70 backdrop-blur-xl) and :28 (text-[#a4aac7]); home Packages / Process sections and every light PageShell body, 1440 and 390  
   Evidence: tmp/foundation-navlight-1440.png and tmp/foundation-menu-over-light-390.png: over #f6f7fc the bar becomes a washed slate grey (70% ink over paper computes to about rgb(82,85,101)) with dark smears of blurred headline text bleeding through, and a heavy grey slab against the clean editorial section. Nav links #a4aac7 on that grey = about 3.2:1 contrast (needs 4.5:1 for 14px text). On mobile the grey bar sits on top of the solid-ink menu panel, so the header and its own menu are two different colours.  
   Fix: Make the bar section-aware or simply more opaque: bg-ink/92 with backdrop-blur (keeps the glass feel on dark, stays ink over light), or use an IntersectionObserver / data-theme on sections to swap to a paper/85 bar with dark text over light sections. Raise link colour to #c9cde0 or white/80. When the mobile menu is open force the bar to solid ink.

8. **[major · a11y] Desktop nav and footer link hit areas are far below 44px (desktop nav is what touch tablets get at 768+)**  
   Where: components/Nav.tsx:28,30 (header links) and components/FinalCta.tsx:16 (footer links); measured at 768, 1024, 1440, 390, 360  
   Evidence: Measured rects: header links Studios 46x20, About 37x20, FAQ 26x20, Contact 51x20; header CTA 150x36; wordmark link 246x28. Footer links are 19px tall at every width including 390/360 (CREATE 58x19, FAQ 30x19, Terms 43x19) on a 36px pitch (space-y-3). Spec: touch targets >= 44px. A 768px iPad portrait gets the 20px-tall desktop links.  
   Fix: Header: make links inline-flex h-11 items-center px-3 (reduce gap-8 to gap-2 to compensate) and CTA h-11. Footer: links as inline-flex min-h-11 items-center with space-y-0 (or py-3 -my-1), so each row is a 44px target without changing the visual rhythm much.

9. **[major · a11y] Focus ring colour is nearly invisible on light sections**  
   Where: app/globals.css:26 and :52 (outline: 2px solid #22d3ee) applied site-wide including bg-[#f6f7fc] sections  
   Evidence: The single global ring colour #22d3ee against paper #f6f7fc computes to roughly 1.7:1 contrast (WCAG non-text minimum is 3:1); it is strong only on ink (see tmp/foundation-footer-focus.png). Light sections are Packages, Process+FAQ and the body of most internal pages including the contact form.  
   Fix: Tokenise the ring: --color-focus: #22d3ee by default, and inside light sections (a .theme-light / [data-theme=light] wrapper applied by PageShell light and the light home sections) set it to violet #6f45f6 (about 5:1 on paper). Alternatively use a two-tone ring: outline 2px #22d3ee plus box-shadow 0 0 0 5px #0c1024.

10. **[major · off-spec] TODO-FOR-OWNER.md does not exist although the spec requires missing owner inputs to be logged there** *(added on re-check)*  
   Where: project root /Users/raghusai/Desktop/CLAUDE 2.0/MAKENDLESSNWEBSITE (find . -name 'TODO*' outside node_modules returns nothing; docs/ holds only SPEC-WORKING.md, audit, screenshots)  
   Evidence: Spec 'Honest content': 'Missing items go to TODO-FOR-OWNER.md'. The foundation already has several open owner items with nowhere recorded: Privacy and Terms are placeholders (app/privacy/page.tsx:6-7, app/terms/page.tsx), no production domain for metadataBase / sitemap, no favicon or brand mark asset, no contact details, no form delivery service.  
   Fix: Create TODO-FOR-OWNER.md at the root listing: approved Privacy and Terms text, production domain, logo/favicon artwork, contact details, form delivery service, OG image sign-off. Do not invent any of these values.

11. **[major · content-honesty] Privacy and Terms are publicly linked, indexable pages that show an internal working note** *(added on re-check)*  
   Where: app/privacy/page.tsx:6-7, app/terms/page.tsx:6-7; linked from the footer on every page (components/FinalCta.tsx:8)  
   Evidence: Visible intro: 'Draft placeholder. Requires owner and legal review before launch.' and body 'MAKENDLESS has not yet approved formal Privacy policy text...'. Honest (nothing invented, keep that), but it is a build note addressed to the owner shown to visitors, and there is no robots/noindex anywhere (grep for robots|noindex in app/ returns nothing; /robots.txt is 404), so both placeholders would be indexed. The light body under it is a single sentence on a large empty paper panel.  
   Fix: Keep the honesty, but reword for visitors ('Our privacy policy is being finalised. For questions, use the Start a Project form.'), add metadata robots: { index: false } on both pages until approved text exists, and record the dependency in TODO-FOR-OWNER.md. Do not write policy text.

12. **[minor · missing] Every page shares the same meta description**  
   Where: app/*/page.tsx metadata exports (e.g. app/about/page.tsx:3, app/create/page.tsx:3)  
   Evidence: Each page exports only { title }; measured description on all 10 routes is the identical home string 'We make ideas impossible to ignore. Premium video editing...'. /grow title is just 'GROW — MAKENDLESS' with no Beta marker.  
   Fix: Add a one-sentence description per page drawn from data/site.ts (no new claims), and title GROW as 'GROW (Beta)'.

13. **[minor · a11y] No current-page indication in the navigation**  
   Where: components/Nav.tsx:27-29 and :42-44  
   Evidence: On /about every header link has aria-current null and identical colour rgb(164,170,199); same in the mobile menu. Users get no 'you are here' cue.  
   Fix: Use usePathname(); set aria-current='page' and an active style (white text plus a 2px prism underline) on the matching link in both desktop and mobile lists.

14. **[minor · visual-weak] Footer is nested inside <main> and reads as a plain link sitemap**  
   Where: components/PageShell.tsx:13, components/FinalCta.tsx:4-22 rendered within app/layout.tsx:20 <main id="main">; docs/audit/1440-home-08-footer.png, 390-home-08-footer.png  
   Evidence: DOM check: document.querySelector('main footer') is truthy on every page, so the footer is not exposed as the page contentinfo landmark and the skip link target contains it (on /about the first Tab after skipping lands on the footer wordmark). Visually it is a flat ink panel with three default-weight link columns and no closing gesture - competent but template-level next to the hero; a large empty area sits under the wordmark at 1440.  
   Fix: Render <Footer/> once in app/layout.tsx after </main> and remove it from PageShell and FinalCta. Polish without restarting: oversized outlined/prism MAKENDLESS wordmark as a closing band, GROW link with a small Beta pill instead of the dash text, a thin prism hairline as the top border, and hover underline motion per division colour.

15. **[minor · visual-weak] Mobile menu appears with no transition and duplicates the Contact destination**  
   Where: components/Nav.tsx:5-10, 40-46; docs/audit/390-mobile-menu.png  
   Evidence: The panel is conditionally mounted ({open && ...}) with no enter/exit motion, so it snaps in over the live hero; it is a plain list of four words. Both 'Contact' and 'Start a Project' point to /contact in the desktop bar and in the menu, while the three studios (the core offer) are not reachable from the mobile menu at all without going through /studios.  
   Fix: Animate the overlay (mask/clip-path reveal with staggered link rise, instant under reduced motion). Consider replacing the redundant 'Contact' text link with nothing, or in the mobile overlay add a compact CREATE / BUILD / GROW (Beta) row in division colours under 'Studios'. Keep primary nav simple per spec.

16. **[minor · broken-control] Mobile menu stays open across browser Back / history navigation** *(added on re-check)*  
   Where: components/Nav.tsx:21 (open state lives in the persistent layout, only reset by onClick handlers)  
   Evidence: At 390x844: navigate / -> /about via menu, reopen menu, history back -> URL is http://localhost:3456/ and #mobile-menu is still mounted (afterBack: true in docs/audit/tmp/foundation-verify2.mjs). The user lands on a different page with the menu covering it.  
   Fix: useEffect on usePathname() -> setOpen(false); same effect can host the Escape handler and scroll lock.

17. **[minor · mobile-break] Header wordmark touches the menu button at 320px (no shrink, no gap)** *(added on re-check)*  
   Where: components/Nav.tsx:14,25 (text-lg + tracking-[0.18em], fixed 246px wide) at 320px viewport  
   Evidence: Measured at 320x640: wordmark link right edge = 266.5px, toggle button left edge = 266.5px (gap 0); at 360 the gap is 29.5px. 246px wordmark + 44px button + 40px padding = 330px > 320px. Horizontal overflow is masked only by body overflow-x:hidden. 320 is below the spec's minimum check width (360), hence minor. Screenshot: docs/audit/tmp/foundation-v-hdr-320.png.  
   Fix: Scale the wordmark on very small screens (text-base and tracking-[0.12em] below 360px, or clamp font-size) and add gap-3 + min-w-0 to the header row.

18. **[minor · a11y] Final CTA beam animation ignores prefers-reduced-motion** *(added on re-check)*  
   Where: components/FinalCta.tsx:30 (SVG <animate repeatCount="indefinite">) vs app/globals.css:34-36  
   Evidence: The global reduced-motion rule only shortens CSS animation/transition durations; SMIL <animate> elements are not governed by CSS animation-duration, so the three pulsing beam lines keep looping indefinitely for reduced-motion users. Observed in code; the reduced-motion block has no rule targeting SVG animate and the component has no matchMedia guard.  
   Fix: Replace the SMIL animate with the existing CSS 'beam' keyframe (globals.css:29) applied via style/class on each line with animation-delay, so the global reduced-motion rule covers it.

*Dropped on re-check (could not be reproduced):* Wordmark accessible name relies on aria-label on a plain span

## 2. Hero

The hero is a working, real R3F scene: Syne headline that "grades" from raw grey to finished, a metal phone and laptop carrying live HTML screens, a three-mode dock with a draggable timeline, a pause button, a still fallback and a reduced-motion path. At 1440x900 and 390x844 the basics pass: both CTAs are above the fold, there is no sideways scroll, mouse drag, touch drag, tab click, swipe, Start a Project (/contact) and Explore Studios (#studios, lands at top 0) all work, and the only console error is a 404 for /favicon.ico. It breaks at other viewport sizes (768px-tall laptops, 768 and 1024 wide, 360x640), the laptop traps the mouse wheel, the timeline does nothing to the devices in Marketing mode, and the film strip and clips are flat coloured rectangles. All new evidence screenshots are in /Users/raghusai/Desktop/CLAUDE 2.0/MAKENDLESSNWEBSITE/docs/audit/tmp/ (prefix hero-); test scripts are hero-test1.mjs, hero-test2.mjs and hero-test3.mjs in the same folder.

**Keep as-is:**
- Headline treatment: raw grey text with dashed baselines wiped to white/prism by the playhead (Hero.tsx:39-56) is a distinctive, on-brand idea; exact copy and Syne are correct.
- Intro: raw to finished in about 2.5s (p went 0 to 997 between 1.2s and 3.5s after navigation), text is server-rendered first and the canvas fades in afterwards.
- Timeline pointer control: mouse drag gave 500/293/707 at 50/30/70%, track click jumps, touch drag works at 390, the playhead and timecode follow, and the focus ring on the track is clearly visible (hero-1440-slider-focus.png).
- Mode tabs: click, tap, ArrowLeft/Right with wrap and roving tabindex all work; auto-cycle runs every 6s and stops after click, scrub or swipe (stayed on Marketing for 7s after a swipe).
- Swipe at 390: scene swipe moved Video > Websites > Marketing > Websites, the tab strip swipe works, and a vertical drag starting on the scene still scrolls the page (scrollY 225).
- Mobile recomposition at 390x844: one device per mode (phone for Video/Marketing, laptop for Websites), headline plus both CTAs above the fold (CTA bottom 392 of 844), targets 44px or taller (tabs 44, pause 44, slider 48, CTAs 48-50), 60fps, canvas DPR capped at 1.5.
- Phone screen content in Video mode: 16:9 raw letterbox reframing to 9:16, grade wipe line, word-by-word captions and a 'CONCEPT DEMO' label read as real editing work (hero-1440-drag-mid.png, hero-390-raw.png).
- Laptop wireframe-to-finished site with dashed placeholder blocks wiping to real blocks, labelled 'northlight-studio.example · Concept demo'; the time-slot buttons do work once the layout is still (14:30 became pressed).
- Honesty: Marketing ad frames carry 'Beta — illustrative demo', 'Sponsored' on a generic 'yourbrand', no numbers; the BETA chip is on the tab at every width.
- No-3D fallback (hero-1440-no3d-video.png, hero-390-no3d-web.png) and reduced-motion (p=1000 immediately, no canvas, 0 infinite animations running, no auto-cycle, button reads 'Play video') are both calm, good-looking still compositions; the slider still drives them.
- Metal phone body with side button and environment reflections, and frameloop='never' when the hero is off-screen (Hero3D.tsx:181).

**Findings:**

19. **[blocker · off-spec] Timeline and mode tabs fall below the fold on 768px-tall laptops**  
   Where: components/Hero.tsx:142,149,151 (section min-h-[100svh], text column lg:py-10, xl:text-[4.7rem]); http://localhost:3456 at 1440x768, 1366x768, 1280x720  
   Evidence: Measured at 1440x768 and 1366x768: section height 848, dock top 707, dock bottom 848 with innerHeight 768. The tab row is sliced by the viewport edge and the timeline slider is entirely off-screen (docs/audit/tmp/hero-1440x768.png). At 1280x720 it is the same (dock 707-848). The draggable playhead is the hero's core mechanic and is invisible on first load at the most common laptop height.  
   Fix: Make the hero fit 100svh on short screens: add a max-height tier (e.g. @media (max-height: 820px)) that drops the headline to about 3.6rem, cuts lg:py-10 and the mt-5/mt-8 gaps, and hides the eyebrow, so text column plus the 141px dock is 768 or less. Verify at 1366x768 and 1280x720.

20. **[blocker · broken-control] Mouse wheel over the laptop traps page scroll**  
   Where: components/HeroScreens.tsx:124 (.hero-scroll overflow-y-auto overscroll-contain); Hero3D.tsx:202 (Html pointerEvents='auto'); 1440x900  
   Evidence: With the cursor over the laptop screen, 12 wheel ticks of 100px left window.scrollY at 0 in Video mode (inner scrollTop 110) and in Websites mode (inner 298). The same wheel input over the headline scrolled the page to 1200, and in Marketing mode to 1200. The laptop covers a large part of the right half, including when it is the blurred background device, so a visitor resting the cursor there cannot scroll past the hero.  
   Fix: Remove overscroll-contain so scroll chains to the page once the mini-site reaches its end, or make the mini site non-scrollable (overflow hidden, auto-scroll driven by p) and only enable inner scrolling when the laptop is the focused device and the user has clicked into it.

21. **[blocker · mobile-break] Hero breaks at 768x1024 (tablet): timeline cut off, devices tiny**  
   Where: components/Hero.tsx:176 (scene sm:h-[330px] sm:flex-none) and :142; 768x1024  
   Evidence: Section height 1079 against innerHeight 1024; dock spans 909-1079, so the timeline track is cut off at the bottom edge (docs/audit/tmp/hero-768x1024.png). Phone and laptop render about 80px and 170px wide in a 330px band under a large empty text block, with the film strip and clips at thumbnail size. Spec requires 768 to be checked and recomposed.  
   Fix: At sm to lg let the scene flex to the remaining height instead of a fixed 330px, pull the camera closer (tablet-specific CAM distance), and constrain total height to 100svh so the dock stays visible.

22. **[blocker · mobile-break] Touch scrolling is trapped on phones in Websites mode** *(added on re-check)*  
   Where: components/HeroScreens.tsx:124 (.hero-scroll overflow-y-auto overscroll-contain) inside Hero3D.tsx:202 Html pointerEvents='auto'; 390x844 and 360x780, Websites mode  
   Evidence: docs/audit/tmp/herov-test3.mjs: four consecutive upward touch drags (100px each) starting on the laptop screen left window.scrollY at 0 at both 390 and 360, while only the mini-site's scrollTop changed. The same drag on the scene in Video mode scrolled the page by 85px. The laptop fills the band between the CTAs and the dock (183x141px at 390), which is exactly where a thumb starts a scroll, so a phone visitor in Websites mode (also reached by auto-cycle) cannot scroll past the hero from there. The auditor only reported the desktop mouse-wheel case.  
   Fix: Remove overscroll-contain and, on compact, make the mini-site non-scrollable (overflow hidden or touch-action: pan-y passthrough with pointer-events none on the scroller) so vertical drags always scroll the page.

23. **[major · mobile-break] Scene collapses on short phones (360x640, 375x667): phone smaller than the Pause button**  
   Where: components/Hero.tsx:176 (h-[200px] min-h-0 flex-1) and :178; 360x640, 375x667, 390x664  
   Evidence: Measured scene height: 72px at 360x640, 119px at 375x667, 102px at 390x664. In docs/audit/tmp/hero-360x640-video.png the 3D phone is about 30px wide and sits beside a Pause pill that is larger than it. At 360 the supporting line also wraps to three lines, which takes more height.  
   Fix: Guarantee a minimum scene height of about 200px on short phones by shrinking the headline one step and tightening gaps below about 700px height, or move the Pause control into the dock and let the device overlap behind the CTAs. Re-test at 360x640 and 375x667.

24. **[major · broken-control] In Marketing mode the timeline changes nothing on the devices**  
   Where: components/HeroScreens.tsx:91 and :156 (ad overlay clip-path depends only on `ad`, never on p); Hero.tsx:13 stages Brief/Creative/Format/Preview/Review  
   Evidence: docs/audit/tmp/hero-1440-reduced-marketing.png at p=0.4: the status says EDITING and the playhead is at Format, yet both ad frames are fully finished and the laptop chrome badge reads 'WIREFRAME' above a completed ad. Only the headline tint and stage chips react. The five Marketing stages are labels with no matching visual, which conflicts with the spec rule against decorative controls.  
   Fix: Drive the ad frames from p: Brief = empty placeholder frame with objective text, Creative = gradient and headline wipe in, Format = 9:16 vs feed crop, Preview = Sponsored header and CTA appear, Review = Beta label and final state. Hide or correct the WIREFRAME/LIVE badge when ad is true.

25. **[major · visual-weak] Film strip and timeline clips read as plain coloured rectangles**  
   Where: components/Hero3D.tsx:149-158 (boxGeometry 0.38x0.5 and w x 0.2, flat meshStandardMaterial, colours from STRIP)  
   Evidence: docs/audit/tmp/hero-1440-video-zoom.png and docs/audit/1440-home-01-hero.png: six flat teal-to-violet cards above the devices and four flat pastel bars below. No sprocket holes, no frame imagery, no waveform, no clip labels, no trim handles. Without context they look like colour swatches, which sits close to the spec's ban on abstract shapes and requirement that every 3D object depict the studio's work.  
   Fix: Keep the positions and landing animation but give them identity: one continuous film strip with a sprocket-hole texture and the three reel shots as frame thumbnails (CanvasTexture); clips as timeline tracks with rounded ends, a thumbnail or waveform texture, a clip name and a thin playhead crossing them.

26. **[major · visual-weak] HTML screens are not occluded by 3D bodies: phone screen shows through the laptop**  
   Where: components/Hero3D.tsx:194-205 (drei Html transform without occlude, zIndexRange [40,10]); 1440x900 Websites mode and during scroll  
   Evidence: docs/audit/tmp/hero-1440-web-zoom.png: in Websites mode the phone sits behind the laptop, but its blurred screen is drawn on top of the laptop lid and base. docs/audit/tmp/hero-1440-scroll-250.png shows the same thing during scroll hand-off: the phone screen is pasted over the laptop deck. This breaks the illusion of solid objects.  
   Fix: Separate the devices so they never overlap in Websites mode (move PHONE[1].x further left or behind with a clear gap), or render screens as textures/occluded Html (occlude='blending'), or fade the back device's screen to 0 when its projected rect intersects the front device.

27. **[major · visual-weak] Depth of field is a CSS blur on the screen only; bodies and props stay razor sharp**  
   Where: components/HeroScreens.tsx:66 and :117 (filter: blur(1.6px) brightness(.72) on the back screen); no post-processing in Hero3D.tsx  
   Evidence: docs/audit/tmp/hero-1440-video-zoom.png: the laptop's site is soft while its aluminium edge, base and trackpad, plus the film strip far behind, are perfectly sharp. It reads as a blurry screen inside a sharp frame, not a lens effect, and there is no focus pull when the mode changes.  
   Fix: Either add a real DepthOfField pass (postprocessing, desktop only, focus distance lerped per mode) or fake it consistently: dim and desaturate the back device's meshes and soften the far props to match the screen blur, with the transition timed to the camera move.

28. **[major · visual-weak] Laptop does not read as a physical product**  
   Where: components/Hero3D.tsx:103-114 (LaptopBody: two slabs, one dark plane for the keyboard, one plane for the trackpad)  
   Evidence: docs/audit/tmp/hero-1440-marketing-zoom.png and docs/audit/tmp/hero-390-web.png: the deck is a featureless dark slab with a single dark rectangle where keys should be, no key grid, no hinge, no screen bezel or camera, and the lid is a thin plate. At 390 the base is also clipped by the right edge of the scene. The phone is more convincing (metal rail, side button) but has no camera or speaker detail and the screen's 30px corner radius does not match the glass slab.  
   Fix: Add a key-grid texture or instanced key caps on the keyboard plane, a hinge cylinder, a 3-4% black bezel with a camera dot around the screen, and a slightly thicker tapered base. On the phone add a second side button and match the HTML corner radius to the glass slab. Tighten the contact shadow so the devices sit on a surface.

29. **[major · a11y] Auto-cycling modes cannot be paused by the Pause button, hover or keyboard focus**  
   Where: components/Hero.tsx:112-116 (cycle interval) and :178 (pause only toggles `paused`)  
   Evidence: After clicking 'Pause video' (aria-pressed=true, label 'Play video'), the selected mode still changed from Video Editing to Website Development within 7s. With keyboard focus resting on the selected tab, it changed from Video Editing to Digital Marketing within 7s, so the content changes under a keyboard user. Content that auto-updates for more than 5s needs a pause mechanism (WCAG 2.2.2).  
   Fix: Make the pause button also call setCycling(false), and stop cycling on focusin or pointerenter within the dock and scene. Consider relabelling it 'Pause demo'.

30. **[major · broken-control] Pause button is a no-op or misleading in several states**  
   Where: components/Hero.tsx:178; components/HeroScreens.tsx:124 (hero-resize animation ignores `paused`), :91 (static ad overlay)  
   Evidence: At 390 in Websites mode only the laptop is shown and nothing on it is tied to `paused`; in Marketing mode the phone shows a static ad, so tapping 'Pause video' changes only its own label (docs/audit/tmp/hero-390-web.png, hero-390-marketing.png). At 1440 it pauses only the reel; the 7s responsive-resize loop, device bobbing and mode cycling continue.  
   Fix: Make one 'Pause demo' control that stops everything that moves on its own (reel clock, hero-resize, bob, auto-cycle), or hide the button in modes where no video is visible.

31. **[major · a11y] Slider arrow keys move 0.1% per press**  
   Where: components/Hero.tsx:234 (range min 0 max 1000, no step or key handler)  
   Evidence: Measured: ArrowRight took the value from 86 to 87 of 1000; PageUp moved 100; Home and End work. A keyboard user needs about 1000 arrow presses to scrub raw to finished, and one press produces no visible change.  
   Fix: Add onKeyDown: Arrow = plus or minus 5% (Shift+Arrow 1%), or set step={50} and keep pointer scrubbing smooth by handling pointer events separately. Update aria-valuetext to name the stage, e.g. 'Grade, 52% edited'.

32. **[major · a11y] Demo buttons inside the devices stay in the tab order while hidden, blurred or covered**  
   Where: components/HeroScreens.tsx:132,148 (Book a table, 9:30, 11:00, 14:30); ad overlay at :156  
   Evidence: Tab sequence in Marketing mode at 1440: after Explore Studios focus goes to 'Book a table', '9:30', '11:00', '14:30', each reported covered=true by elementFromPoint (they sit under the ad overlay), so focus disappears for four stops before reaching Pause and the tabs. In Video mode the same four are focusable inside the blurred background laptop. They render at about 28x15px and 60x17px.  
   Fix: Set inert (or tabIndex=-1 plus aria-hidden) on the mini-site whenever ad is true or back is true; only expose the buttons in Websites mode. Consider making the whole mini-site one focus stop with a label.

33. **[major · mobile-break] At 1024x768 the laptop is cropped by the viewport and the timeline is clipped by 6px**  
   Where: components/Hero.tsx:176 (lg:right-[-3%] lg:w-[60%]); Hero3D.tsx:11-14 (CAM/LAPTOP positions not width-aware); 1024x768  
   Evidence: docs/audit/tmp/hero-1024x768.png: the laptop's right edge is cut off at the window edge and the caption blocks overlap its screen. Section height is 774 against 768, so the track's bottom border is clipped.  
   Fix: Add a mid-width camera preset for 1024-1279 (pull back or shift LOOK left) so both devices fit inside the scene, and trim 8px from the dock or text column at this size.

34. **[major · broken-control] 'Book a table' and the mini-site nav/cards look clickable but do nothing** *(added on re-check)*  
   Where: components/HeroScreens.tsx:132 (button without onClick), :127 (Menu / Visit / Book spans with cursor-pointer and hover colour), :138 (cards with cursor-pointer and hover lift)  
   Evidence: DOM check in herov-test1.mjs: the 'Book a table' button's React props have no onClick (the three time-slot buttons do). It is a real focusable <button> with hover and active states, and it is the first stop in the tab order after Explore Studios. The nav items and the three cards also show a pointer cursor and hover effects with no action. Spec quality bar: every button does something real, no decorative controls; the hero spec calls for a live mini site.  
   Fix: Wire them: Book a table scrolls the mini-site to the 'Pick a time' block and highlights it; Menu/Visit/Book scroll to their blocks; cards toggle a selected state. Otherwise render them as non-interactive (div, no pointer cursor, no hover state).

35. **[major · content-honesty] 'Concept demo' and 'Beta - illustrative demo' labels are too small to read** *(added on re-check)*  
   Where: components/HeroScreens.tsx:53 (BetaLabel text-[10px]), :89 (CONCEPT DEMO text-[9px]), :120 (URL bar text-[10px]) scaled down by the 3D transform  
   Evidence: Measured label boxes including padding (herov-test3.mjs): at 360 wide 'CONCEPT DEMO' is 29x5.4px and 'Beta - illustrative demo' is 47x7.2px; at 390 they are 38x7.1 and 62x9.4; at 1440 they are 50x10.8 and 81x14.7 / 84x10.9. That puts the glyphs at roughly 3-4px on phones and 5-6px on desktop; in docs/audit/tmp/herov-390-mode2.png and herov-1440-mkt-p40.png the disclosure pills are smudges. The spec requires GROW demos to say 'Illustrative demo' and demo content to be captioned 'Concept demo'; the text exists in the DOM but a visitor cannot read it.  
   Fix: Move the disclosure out of the scaled screens: a normal-size caption (11-12px) pinned in the scene corner or dock that reads 'Concept demo' in Video/Websites and 'Beta - illustrative demo' in Marketing, keeping the in-screen pills as decoration.

36. **[major · visual-weak] During scroll hand-off the devices are sliced by the canvas box edges** *(added on re-check)*  
   Where: components/Hero.tsx:176 (scene lg:absolute lg:right-[-3%] lg:w-[60%], canvas clipped to 630-1398px at 1440); Hero3D.tsx:74 (dir * s * 2.1 pushes devices outward)  
   Evidence: docs/audit/tmp/herov-1440-scroll250.png (scrollY 250, settled): the phone's left side is cut by a straight vertical line at about x=641 and the laptop's right side by a straight line at x=1398, 42px short of the window edge, with empty page background beyond. Scene rect measured 630-1398. The same hard left edge cuts the wireframe grid in docs/audit/tmp/herov-1440-mkt-p40.png. It reads as a rendering fault rather than a designed exit.  
   Fix: Let the canvas span the full section width (inset-0, pointer-events none on empty areas) or reduce the outward travel so both devices stay inside the canvas, and fade the grid with a radial mask instead of the box edge.

37. **[minor · broken-control] Laptop buttons become moving targets during the responsive-resize loop**  
   Where: components/Hero3D.tsx:203 (resize when mode===1 && p>0.95); app/globals.css:44 (hero-resize 7s infinite); cursor parallax in Device (Hero3D.tsx:77)  
   Evidence: The 14:30 button's centre moved from y=602 to y=480 between two measurements about 1.5s apart, and a real mouse click at the first position hit the canvas, leaving 11:00 selected. The click only landed after the layout settled. Hit sizes are 28x15px.  
   Fix: Pause hero-resize while the pointer is over the laptop, and reduce parallax rotation while hovering a device so targets hold still.

38. **[minor · visual-weak] Headline and phone collide at 1440**  
   Where: components/Hero.tsx:151 (xl:text-[4.7rem]) and :176 (scene w-[60%]); 1440x900  
   Evidence: h1 right edge measured at 744px; in Marketing mode the phone's left edge is at about 738px (docs/audit/tmp/hero-1440-w2m-400.png) and in the no-3D fallback at about 745px (hero-1440-no3d-video.png). The word 'impossible' touches the device with no breathing room.  
   Fix: Shift the scene or camera target about 40px right at xl, or cap the headline at 4.4rem between 1280 and 1535.

39. **[minor · visual-weak] Only Marketing gets a mask wipe; Video to Websites has no transition identity**  
   Where: components/HeroScreens.tsx:91,156 (clip-path .75s); Hero3D.tsx Device and Rig lerps  
   Evidence: docs/audit/tmp/hero-1440-w2m-150.png shows the ad wiping in (top-down on the phone, left-right on the laptop), which works but uses two different directions. Video to Websites (hero-1440-v2w-450.png) is only a camera drift and a blur swap. During the switch the sliding tab pill overlaps the neighbouring label ('Website Development' text collides with the pill edge) and the stage chips re-rise.  
   Fix: Give each mode change one shared, directional wipe (e.g. a playhead line sweeping across both screens in the mode colour) and use the same direction on both devices. Shorten the pill slide or fade labels so they do not overlap mid-transition.

40. **[minor · visual-weak] Scroll hand-off is weak: props collapse and the next section is also dark**  
   Where: components/Hero3D.tsx:70-77 (scroll offsets); Details clips; 1440 at scrollY 250-500  
   Evidence: docs/audit/tmp/hero-1440-scroll-250.png and hero-1440-scroll-500.png: the devices slide into each other, the four clips overlap into one striped bar, and the hero ends on a hard edge into another dark navy section (Studios), so there is no sense of a designed exit. The 3D grid also has a hard vertical cut-off at the scene's left edge (about x=630 in docs/screenshots/1440-raw.png).  
   Fix: Make scroll move the devices apart rather than together, keep clip spacing constant, fade the grid with a radial mask at the canvas edges, and add a deliberate closing beat (e.g. the dock's playhead line extending into the next section).

41. **[minor · visual-weak] Status readout jumps sideways and stage chips lag during the intro**  
   Where: components/Hero.tsx:221-229 (hint rendered with opacity 0 but still in layout; wordmark xl only), :238-240  
   Evidence: The RAW/EDITING/EDITED label sits at x=952 at p=0, x=762 mid-intro, x=921 after a scrub and x=829 when finished (docs/screenshots/1440-raw.png, docs/audit/tmp/hero-1440-intro-a.png, hero-1440-drag-mid.png). In hero-1440-intro-a.png the playhead is at 52% but only the RAW chip is lit. The hint says 'Drag to see the edit' with a down arrow in all three modes.  
   Fix: Give the status group fixed slots (absolute-position the hint above the playhead instead of in the flex row), and light chips directly from p with no entrance animation fighting the colour transition. Point the hint at the playhead and use mode-neutral wording.

42. **[minor · a11y] Tabs lack tabpanel wiring and Home/End keys**  
   Where: components/Hero.tsx:203-219  
   Evidence: The three hero tabs have no id and no aria-controls, and the scene has no role=tabpanel. Pressing Home on the tablist left the selection on Digital Marketing — Beta.  
   Fix: Add ids and aria-controls pointing at the scene wrapper (role=tabpanel, aria-labelledby), and handle Home/End.

43. **[minor · visual-weak] Pause button overlaps the device on phones**  
   Where: components/Hero.tsx:178 (absolute bottom-1 right-0); 390x844  
   Evidence: docs/audit/tmp/hero-390-marketing.png and hero-390-raw.png: the 127x44 Pause pill covers the phone's bottom-right corner; in hero-390-web.png it sits tight against the laptop base, which is itself clipped at the right edge.  
   Fix: Move the pause control into the dock's status row on mobile (icon-only, 44px), freeing the scene.

44. **[minor · mobile-break] Timeline stage names are truncated with ellipses on phones** *(added on re-check)*  
   Where: components/Hero.tsx:240-241 (five equal chips, text-[9px], truncate); 390x844 and 360x780  
   Evidence: scrollWidth > clientWidth per chip (herov-test3.mjs): at 390 'WIREFRAME' and 'RESPONSIVE' are cut ('WIREFR...', 'RESPON...' in docs/audit/tmp/herov-390-mode1.png); at 360 also 'CAPTIONS', 'CREATIVE' and 'PREVIEW' (docs/audit/tmp/herov-360x640.png shows 'CAPTIO...'). The stage names are the only explanation of what the playhead does, and on phones two of five are unreadable in Websites mode. The Marketing tab label plus BETA badge also fills its 113px/103px cell edge to edge (scrollWidth 104 vs 103 at 360).  
   Fix: On compact use short stage names (Wire, Layout, Style, Mobile, Launch; Raw, Cut, Grade, Caps, Export) or show only the active stage name above the playhead with unlabeled segments; drop the BETA chip to a superscript dot at under 390.

*Dropped on re-check (could not be reproduced):* Frame rate below 60 on desktop; whole hero re-renders every 100ms

## 3. Three Studios

Section 2 (components/Studios.tsx, 73 lines, server component) is a dark #0c1024 block with an eyebrow, the correct headline "Three worlds. Endless possibilities." and three whole-card links to /create, /build, /grow. Each card is the same rounded #202342 tile with a small 320x200 looping SVG pictogram, verb label, name, one-line tagline and "Enter studio →"; the middle card is lifted 32px. Links, hover lift, keyboard focus ring, Syne-only type and no horizontal overflow (360/390/768/1024/1440) all work. But the BUILD preview renders as an empty dashed box at every width (code bug), the GROW Beta badge is clipped out of view at 768-~900px, the SMIL motion ignores reduced-motion, and the section is the same dark ink as both the hero above and Live Transformation below. Verdict: these are generic template cards with small SVG icons, not premium gateways with service previews and distinct motion identities.

**Keep as-is:**
- Headline copy exactly on spec: 'Three worlds. Endless possibilities.' with prism gradient on the second sentence; strong Syne display type at 1440 (60px).
- Whole card is a single <Link> (not a small button): tap targets are large (350x423-455px at 390, 320x404-436px at 360) and all three navigate correctly to /create, /build, /grow (verified by click: h1 'Video Editing', 'Website Development', 'Digital Marketing').
- Semantic structure: section[aria-labelledby=studios-title] > ul > li > a, aria-label on GROW includes '(Beta)' ('GROW: Digital Marketing (Beta)'), SVGs are aria-hidden.
- Keyboard focus: Tab order create -> build -> grow, visible 2px cyan outline with 3px offset on each card (docs/audit/tmp/studios-focus-build.png), plus focus-visible lift mirrors hover, so nothing is hover-only.
- Division accent colours match the spec (CREATE #22d3ee, BUILD #8b5cf6, GROW #c7a6ff) and data comes from data/site.ts single source of truth.
- No horizontal overflow at 360/390/768/1024/1440 (scrollWidth - innerWidth = 0 at all five); only Syne is used in the section.
- Mobile (360/390): the three cards stack full-width in a clear order and are easy to find and tap; BETA badge is visible there.
- Staggered desktop composition (middle card raised) is a good starting idea for a non-grid layout; GROW's honest tagline 'We are learning in public. Join the beta list.' and the 'ILLUSTRATIVE' label on the bar chart are the right honesty instinct.

**Findings:**

45. **[blocker · broken-control] BUILD gateway preview is an empty dashed box (layout blocks never render)**  
   Where: components/Studios.tsx:24-25; selector #studios a[href="/build"] svg rect; all widths  
   Evidence: The block array uses keys {x,y,w,h} and is spread with {...b}, so the rects get attributes 'x,y,w,h,rx,fill,opacity' - no width/height. Measured in DOM at 768/800/900/1024/1440: all four animated rects have getBBox() width 0, height 0. Visible in docs/audit/1440-home-02-studios.png, 390-home-02-studios.png and every frame of docs/audit/tmp/studios-phase-0..3.png: BUILD shows only a dashed outline on a blank panel while CREATE and GROW have content. The flagship website-development gateway looks unfinished.  
   Fix: Map to real SVG attributes: <rect x={b.x} y={b.y} width={b.w} height={b.h} .../>. Better: replace with a proper wireframe-to-finished mini browser preview (see the visual-weak finding).

46. **[blocker · off-spec] GROW Beta badge is clipped out of sight at tablet widths (768 to ~900px)**  
   Where: components/Studios.tsx:53 (overflow-hidden), :57-62 (flex row with h3 + badge); http://localhost:3456/#studios at 768, 800, 900  
   Evidence: At 768 the badge's left edge is x=745 while the card's right edge is x=736, so it is 100% outside the overflow-hidden card: docs/audit/tmp/studios-768-cards.png and studios-768-full.png show the GROW card with no Beta indicator at all. At 800: badge 766-822 vs card right 768 (invisible). At 900: badge 833-889 vs card right 868 (cut in half). At 1024 it still overhangs the padding (badge right 972 vs inner right 967). Spec: 'GROW labelled Beta / Coming Soon everywhere' and 768 is a required check width.  
   Fix: Do not put the badge in a non-wrapping flex row beside the h3. Place the BETA pill on the verb line (GROW · BETA) or absolutely in the preview corner, add min-w-0 to the text column and shrink-0 to the badge, and consider 'Beta - coming soon' wording. Re-test at 768/820/900/1024.

47. **[blocker · mobile-break] Studio names overflow and are cut off at 768 ('Website Developm')**  
   Where: components/Studios.tsx:50 (md:grid-cols-3), :60 (h3 text-2xl); 768-~1000px  
   Evidence: At 768 cards are only 221px wide with 24px Syne Extrabold: BUILD h3 text right edge = 559px vs card right edge 495px (64px clipped; screenshot docs/audit/tmp/studios-768-cards.png reads 'Website Developm'). 'Digital Marketing' ends at 733 vs card inner edge 711 (touches the card border). Still overflowing at 900 (603 vs inner 558) and marginally at 1024 (644 vs 640).  
   Fix: Recompose for tablet: keep a single column or a 1-large + 2-stacked layout until lg (>=1024), or use fluid type (clamp ~1.1rem-1.5rem) plus min-w-0 / overflow-wrap on the h3. Three 221px columns is too narrow for Syne's wide extrabold.

48. **[major · visual-weak] Gateways are generic cards with small looping SVG pictograms, not premium interactive visual gateways with service previews**  
   Where: components/Studios.tsx:4-42 (Art), :53-66 (card); docs/audit/1440-home-02-studios.png  
   Evidence: All three cards share one identical template: rounded-[2rem] #202342 tile, 8:5 dark inset, label, title, one sentence, 'Enter studio →', coloured blur glow. The 'previews' are abstract icons: four flat rectangles + a sine line (CREATE), a dashed empty box (BUILD), six purple bars (GROW). None shows an actual service: no reel frame with captions, no browser/site mock, no ad creative. No service names (V1-V5, T1-T5, M1-M3) appear although data/site.ts has them. This is exactly the 'generic SaaS cards' / 'repetitive glows' look the spec forbids, and reads as a template next to the hero.  
   Fix: Keep the three-link structure and staggered layout but make each card a tall visual gateway: CREATE = 9:16 reel frame with CSS-animated caption words, cut markers and a timeline strip; BUILD = mini browser chrome whose wireframe blocks resolve into a styled page; GROW = an illustrative social-ad card mock (no charts). Add 3-5 service chips from data/site.ts per card and make the visual fill most of the card (preview >= 60% of card height).

49. **[major · off-spec] No distinct motion identity per division; interaction is identical for all three**  
   Where: components/Studios.tsx:14-15, 26, 35-36, 53, 55, 65  
   Evidence: Hover/focus behaviour is the same on every card: translate-y -8px (measured dy=-8), border to white/40, glow opacity 0.3->0.6, arrow shifts 6px (docs/audit/tmp/studios-hover-create.png). The only per-division difference is a tiny ambient SMIL loop (a line sliding, opacity pulsing - invisible because of the BUILD bug - and bars resizing). Nothing reacts to pointer, tap or scroll; there is no entrance/reveal motion at all for the heading or cards. Spec: 'distinct motion identity each', 'premium interactive gateways', 'varied professional motion ... not the same fade-up everywhere'.  
   Fix: Give each gateway its own language: CREATE = cut/scrub (playhead scrubs with pointer x or auto-plays in view, frames snap-cut, captions pop); BUILD = assemble (grid blocks draw in and snap to layout, wireframe->colour on hover/in-view); GROW = soft pulse/ripple signal with a calm 'beta' shimmer. Trigger on in-view (IntersectionObserver) so mobile gets it without hover, and add a mask/kinetic reveal for the headline.

50. **[major · off-spec] Three dark sections in a row: hero, studios and Live Transformation all sit on the same ink**  
   Where: components/Studios.tsx:46 (bg-[#0c1024]); app/page.tsx order Hero > Studios > Transformation  
   Evidence: Computed backgrounds: previous section (hero) rgb(12,16,36); #studios rgb(12,16,36); next section linear-gradient(rgb(12,16,36) -> rgb(32,35,66)). Seam screenshots docs/audit/tmp/studios-seam-top-1440.png and studios-seam-bottom-1440.png show no visible boundary: same navy, same cyan letter-spaced eyebrow, same white+prism headline pattern ('Three worlds. Endless possibilities.' vs 'See the difference.'). Spec: 'Dark cinematic and light editorial sections must ALTERNATE; no two neighbouring sections may look alike.'  
   Fix: Make Studios the first light editorial section: paper #F6F7FC background, dark text #13172B, cards as rich coloured/visual panels (or white panels with full-bleed accent previews), a different heading composition (e.g. headline left, short intro right, or oversized CREATE/BUILD/GROW wordmarks). Drop the coloured blur glows here.

51. **[major · a11y] SVG (SMIL) animations ignore prefers-reduced-motion**  
   Where: components/Studios.tsx:14-15, 26, 35-36; app/globals.css:34-36  
   Evidence: With prefers-reduced-motion: reduce emulated, values still change over 1.2s: playhead x1 173.0 -> 277.0, GROW bar height 33.2 -> 37.2; 18 <animate> elements present. The global reduced-motion rule only shortens CSS animation/transition durations, which does not affect SMIL <animate>. These loops run forever (repeatCount=indefinite) with no pause control and also keep running off-screen.  
   Fix: Replace SMIL with CSS keyframe animations on classes (covered by the existing reduced-motion rule) or render a static finished frame when reduced motion is requested; pause when the section is off-screen.

52. **[major · content-honesty] GROW preview is a rising bar chart - implies performance growth for a beta service and is the 'dashboard look' the spec forbids** *(added on re-check)*  
   Where: components/Studios.tsx:33-39; #studios a[href="/grow"] svg; all widths  
   Evidence: Six bars with heights [40,70,55,100,85,130] trending upward and animating taller, i.e. a growth/results chart, for a division the spec says must show no performance numbers and avoid dashboard visuals. The only disclaimer is SVG text 'ILLUSTRATIVE' (not the spec's wording 'Illustrative demo'), rendered at about 6px at 768 and aria-hidden. Seen in docs/audit/1440-home-02-studios.png and docs/audit/tmp/studiosverify-768-cards.png.  
   Fix: Replace the chart with a non-metric visual (e.g. an example social ad card / content calendar mock) and caption it in HTML text 'Illustrative demo' at 12px or more.

53. **[minor · performance] Leftover dead code: style={{ animation: 'marquee 0s' }} on the CREATE playhead group**  
   Where: components/Studios.tsx:12  
   Evidence: <g style={{ animation: "marquee 0s" }}> applies a 0-second keyframe animation that does nothing (marquee is defined in app/globals.css:31 for another purpose).  
   Fix: Remove the wrapper style; drive the playhead with a dedicated CSS keyframe.

54. **[minor · visual-weak] Cards are unbalanced on desktop: three different heights and misaligned content rows**  
   Where: components/Studios.tsx:50-52 (md:items-end + md:-translate-y-8); 1440 and 1024  
   Evidence: At 1440 card heights are 462 / 494 / 470px and tops are at 473 / 409 / 465px, so GROW sits 8px higher than CREATE for no design reason (title wraps to two lines, tagline to one). At 1024: 395 / 427 / 427. In docs/audit/1440-home-02-studios.png the verb labels, titles and 'Enter studio' rows of the outer cards do not line up. Spec asks for 'balanced on desktop'.  
   Fix: Give cards equal height (grid items-stretch, flex-col with mt-auto on the CTA row) and apply the stagger as a deliberate, consistent offset; reserve two lines for the title.

55. **[minor · mobile-break] Mobile is the desktop cards stacked, not recomposed; section is two full screens of near-identical tiles**  
   Where: components/Studios.tsx:50; 390 and 360  
   Evidence: Section height is 1748px at 390 (viewport 844) and 1755px at 360; each card is 423-455px tall with the same layout as desktop (docs/audit/390-home-02-studios.png). All three are findable and tappable, but the third (GROW) starts ~1220px into the section and there is no overview of the three studios at a glance. At 360 the headline wraps to 4 lines (h2 height 160px vs 120px at 390). Spec: 'Mobile is recomposed, not shrunk.'  
   Fix: Recompose on phones: e.g. compact horizontal gateway rows (visual left, text right, ~180-220px tall) or a snap carousel with visible peeking and dots plus a three-chip CREATE/BUILD/GROW index under the headline so all three are discoverable in the first screen.

56. **[minor · a11y] 'ILLUSTRATIVE' label and BETA pill are too small to read**  
   Where: components/Studios.tsx:39 (SVG text fontSize 11 in a 320 viewBox), :62 (text-[10px])  
   Evidence: The SVG label scales with the card: rendered text height is 7px at 768, 10px at 1024, 12-13px at 360/390, 15px at 1440 (it is also aria-hidden, so it is purely visual). The BETA pill is 10px type in a 56x25px pill at every width. The honesty signals are the least legible text in the section.  
   Fix: Render the 'Illustrative' caption and Beta label as HTML text at >= 12px (not scaled SVG text), with a filled lilac pill for Beta so it reads as a status, not decoration.

57. **[minor · missing] Gateways carry no service content; 'Enter studio' label repeated three times**  
   Where: components/Studios.tsx:59-65; data/site.ts:14-60  
   Evidence: Card text is only verb, name, one tagline and the identical visible link text 'Enter studio →' x3 (innerText measured). The spec asks for 'beautiful service previews'; the five CREATE, five BUILD and three GROW services already exist in data/site.ts but none is surfaced here.  
   Fix: Show service chips or a short list per gateway from s.services (e.g. 'Short-form · Long-form & podcast · Ads · Repurposing · Motion graphics') and use distinct CTAs: 'Enter CREATE', 'Enter BUILD', 'Preview GROW (Beta)'.

58. **[minor · a11y] Link accessible name omits its visible text ('Enter studio', tagline) - Label in Name failure** *(added on re-check)*  
   Where: components/Studios.tsx:54 (aria-label) vs :64-65  
   Evidence: Each card link has aria-label 'CREATE: Video Editing' / 'BUILD: Website Development' / 'GROW: Digital Marketing (Beta)', which replaces all inner content, so the visible 'Enter studio' and the tagline (including 'Join the beta list') are never announced and voice-control users saying 'click Enter studio' get no match (WCAG 2.5.3). Measured via getAttribute('aria-label') and innerText on the live page.  
   Fix: Drop the aria-label and let the content name the link (keep the BETA text visible in the DOM), or use aria-labelledby/aria-describedby pointing at the h3 and tagline, with CTA text that is part of the name.

59. **[minor · visual-weak] Card stagger and height differences change arbitrarily between breakpoints (tablet layout is untuned)** *(added on re-check)*  
   Where: components/Studios.tsx:50-52; 768 and 900  
   Evidence: At 768 heights are 398/398/374 with tops 1520/1488/1544 (GROW is the shortest and sits lowest, CREATE title wraps to two lines); at 900 heights 426/402/402 with tops 1520/1512/1544, so the centre card is raised only 8px over CREATE but 32px over GROW. The 'raised centre' composition only holds at 1440. See docs/audit/tmp/studiosverify-768-cards.png.  
   Fix: Equal-height cards with a fixed two-line title slot and a deliberate offset, or hold the 3-column layout until lg.

## 4. Live Transformation

Section 3 (components/Transformation.tsx, 177 lines) is a pure CSS/DOM demo with three tabs (Video / Website / Marketing Beta), one before-after range slider in Video and Web, and pill buttons for every option. Every control was clicked at 1440 and 390 and every one produces a real state change (pause/play, reframe, 3 caption styles, desktop/mobile, 3 themes, 3 time slots, 3 objectives, placement); there is no horizontal overflow and no performance number anywhere in the marketing mode. But there is no 3D or device at all (0 canvas elements in the section), the "footage" is flat grey and gradient rectangles, the slider labels are mirrored against the picture and run in opposite directions in the two modes, and several states are visibly clipped (wide reframe, 9:16 caption, mobile site preview, the ad card at 390). Test script and 40 screenshots are in /Users/raghusai/Desktop/CLAUDE 2.0/MAKENDLESSNWEBSITE/docs/audit/tmp/ (transformation-test.mjs, transformation-results.json, transformation-<width>-*.png).

**Keep as-is:**
- All controls are real: measured DOM change for every button, tab and slider at both 1440 and 390 (transformation-results.json) - keep the state logic and the option set (Pause/Play, Reframe, Pop/Karaoke/Minimal, Desktop/Mobile, Midnight/Porcelain/Signal, time slots, Awareness/Traffic/Leads, Feed/Story).
- Honest labelling in Marketing: 'SIMULATED · ILLUSTRATIVE ONLY' badge, BETA chip on the tab, the sentence 'These are not live campaigns and show no performance results.', and zero digits in the whole panel (measured digits: []). Keep the wording.
- Section footer line 'Original concept demonstrations built for this site. Not client work.' and the '(sample UI)' note on the booking line.
- Headline 'See the difference.' with the prism gradient word, eyebrow, and the per-division tab accent colours (aqua / violet / lilac).
- The functional sample UI idea in Web mode: selectable booking slots that update 'Table reserved: 12:30 (sample UI)', and theme switching that recolours the whole mock.
- The caption timeline strip that highlights the current word in sync with the preview, and the live status badge 'EDITED · 9:16 · POP' that reflects reframe and caption style.
- Objective switching changes both ad copy and CTA label (Learn more / Visit site / Get in touch) - a meaningful change, not cosmetic.
- No sideways scroll at 1440 or 390 (scrollWidth - innerWidth = 0 before and after all interactions); all pill buttons and tabs are 44px high; range input is 44px high and keyboard arrows work (55 -> 57); visible focus ring 2px solid cyan.

**Findings:**

60. **[major · broken-control] Slider labels are mirrored against the picture, and the two modes run in opposite directions**  
   Where: components/Transformation.tsx:44, 54 (video) and :106, 110 (web); 1440 and 390  
   Evidence: Video: label row is 'EDITED [slider] RAW' but the image shows RAW on the left and EDITED on the right (clip-path inset(0 0 0 v%)); dragging right removes the edit, and at 100 the edit is gone. Web: label row is 'WIREFRAME [slider] FINISHED' but the image shows the finished site on the LEFT and the wireframe on the RIGHT (inset(0 100-v% 0 0)); dragging right adds the finished site. So each label sits under the opposite half of the picture, and right means 'worse' in Video but 'better' in Web. Screenshots: docs/audit/1440-home-03-transformation.png, docs/audit/tmp/transformation-1440-web-default.png.  
   Fix: Use one convention in both modes, matching the hero: before on the left, after on the right, dragging right reveals more of the finished result. Video: change the edited clip to inset(0 ${100-v}% 0 0) is wrong for that layout - instead keep RAW as base, reveal EDITED from the left edge up to v%, labels 'Raw' left / 'Edited' right. Web: keep the reveal as is, but it already puts finished on the left, so labels stay 'Wireframe' / 'Finished' only if the layers are swapped so wireframe remains on the left of the handle; simplest is to name the labels by what dragging does ('Before' / 'After') and place the in-picture RAW / EDITED and WIREFRAME / FINISHED badges on the matching sides. Default both to about 60 so the finished state dominates.

61. **[major · visual-weak] No 3D, no device, no real footage - the demo is flat CSS rectangles**  
   Where: components/Transformation.tsx:37-53, 72-94, 133-140; section[aria-labelledby=live-title]  
   Evidence: document.querySelectorAll('section[aria-labelledby=live-title] canvas').length = 0 at both widths. The 'raw footage' is a grey gradient with one grey rounded box (line 39-40); the 'edited reel' is a gradient panel with two radial blobs and one word; the website is a borderless div with three blank coloured tiles and a large empty lower third at 1440 (transformation-1440-web-default.png); the ad is a white card. There is no phone, laptop, browser chrome or video frame, although the spec permits real 3D here for devices / frames / timelines and asks for portfolio-grade work.  
   Fix: Keep the logic, upgrade the stage: put the reel inside a phone (reuse the Hero3D phone and the x100 Html-transform pattern, or a well-drawn CSS/SVG phone on small screens) and the site inside a browser/laptop frame with a URL bar; give the raw side something that reads as ungraded footage (flat, shaky-crop, no captions, waveform) and the edited side a graded scene with moving captions, a cut marker and a progress bar. Lazy-load the canvas, pause off-screen, provide the still fallback.

62. **[major · off-spec] Not one dominant immersive demo - a 1024px card under stacked pills**  
   Where: components/Transformation.tsx:157 (max-w-5xl), :37/:103/:133 (h-[340px] md:h-[420px]); 1440 and 390  
   Evidence: Measured stage is 1024x420 at a 1440x900 viewport (about 71% width, 47% height) and 350x340 at 390. At 390 the three tabs wrap to three full rows (143, 214 and 227px wide pills stacked, about 150px tall) before the stage, and tablist-to-controls is 784px of an 844px viewport. Below the stage sit a slider row, a timeline row and one or two rows of pills - the controls read as a form, not as compact overlays.  
   Fix: Let the stage go wide (max-w-7xl or full-bleed, about 70vh on desktop, about 60vh on phones), overlay the compact controls on or directly under the stage as a single toolbar, and turn the three mode tabs into one segmented control that fits a single row at 360-390 (shorter labels: Video / Website / Marketing Beta).

63. **[major · broken-control] Wide reframe is cropped by the stage at desktop**  
   Where: components/Transformation.tsx:45 ('aspect-video w-[86%]'); 1440  
   Evidence: After clicking 'Reframe', the edited frame measures 881x495 inside a stage 1024x420 high, so 75px of the 16:9 frame is cut off top and bottom and its rounded corners and border disappear (docs/audit/tmp/transformation-1440-video-wide.png). The raw 16:9 placeholder on line 40 has the same overflow (visible as a full-height grey band in docs/audit/1440-home-03-transformation.png).  
   Fix: Constrain by height as well: e.g. 'aspect-video max-h-[88%] max-w-[86%] h-auto w-auto' with an explicit height, or size the stage with aspect-ratio so a 16:9 frame always fits.

64. **[major · visual-weak] Caption word is clipped inside the 9:16 frame at desktop**  
   Where: components/Transformation.tsx:45-47; 1440  
   Evidence: The vertical frame is about 208px wide and the caption is text-4xl in Syne ExtraBold; 'SCROLL' renders as 'SCROL' with the last letter cut by overflow-hidden (docs/audit/tmp/transformation-1440-video-full-edited.png). The word that names the benefit is the one that breaks.  
   Fix: Size captions relative to the frame (container query units or clamp), or reduce to text-2xl in the vertical frame; verify the longest word fits at every width.

65. **[major · broken-control] Mobile site preview cuts off its own content, including the booking confirmation**  
   Where: components/Transformation.tsx:104 (w-[190px], h-[86%]) and :84-93; 1440 and 390  
   Evidence: In Mobile mode the finished mock needs 434px but the frame is 361px tall at 1440 and 292px at 390 (scrollHeight vs clientHeight). At 390 the third slot '16:00' is half cut and the tiles and the 'Table reserved: ...' line are not visible at all, so tapping a slot shows no confirmation (docs/audit/tmp/transformation-390-web-mobile.png). 'BREW & CO.' and 'Menu · Book' wrap onto two lines each. It is also just a 190px box, not a phone.  
   Fix: Lay the mobile mock out for its width (single-line header, slots in one row, smaller headline) so everything fits the frame, or make the frame taller / internally scrollable; draw it as a phone.

66. **[major · mobile-break] Ad card overflows the stage on phones; CTA cut off and the 'Simulated' badge covers the card header**  
   Where: components/Transformation.tsx:133-139; 390  
   Evidence: Feed placement at 390: the 250px card is taller than the 340px stage, so its top is cut, the 'Learn more' button is sliced at the bottom edge, and the SIMULATED badge sits over the avatar/header (docs/audit/tmp/transformation-390-mkt-default.png). Story placement at 390: card is 157x279 with 297-313px of content; 'Sponsored' reads 'Sponsore', the headline reads 'Ideas / imposs / to igno', and the CTA is a sliver (docs/audit/tmp/transformation-390-mkt-story-leads.png). At 1440 the feed card is flush against the stage top and bottom with no breathing room (transformation-1440-mkt-default.png).  
   Fix: Give the marketing stage enough height (or scale the card to fit with max-h and a smaller square creative), move the badge outside the card's area, and size the Story variant from a width that fits its text (min 200px) with the headline scaled down.

67. **[major · a11y] Tab widget is not keyboard-complete and lacks ARIA wiring**  
   Where: components/Transformation.tsx:160-172  
   Evidence: Pressing ArrowRight on the selected tab leaves 'Video Editing' selected (measured). Tabs have no id, no aria-controls and no roving tabindex; the tabpanel has no id and no aria-labelledby. The hero tablist does support arrow keys (scripts/shots.mjs:44), so behaviour is inconsistent within the same page.  
   Fix: Add ids, aria-controls, aria-labelledby, tabIndex 0 only on the selected tab, and Left/Right/Home/End handling - reuse the hero tab logic.

68. **[major · a11y] Caption animation auto-plays and ignores reduced motion; keeps ticking off-screen**  
   Where: components/Transformation.tsx:28-34  
   Evidence: With prefers-reduced-motion: reduce emulated, the caption text still changed within 1.7s and the button still read 'Pause preview'. With the section off-screen at the top of the page the caption also kept changing (setInterval every 700ms, re-rendering the component). The spec asks for a calm reduced-motion version and for motion to pause off-screen.  
   Fix: Initialise playing to false when matchMedia('(prefers-reduced-motion: reduce)') matches, and gate the interval with an IntersectionObserver so it only runs while the stage is visible.

69. **[major · broken-control] Story placement clips the ad headline at desktop too, and the Feed card overflows the stage at 1440 with the Leads objective** *(added on re-check)*  
   Where: components/Transformation.tsx:135-138; 1440  
   Evidence: 1440 Story: card is 194x344 with scrollWidth 238 > clientWidth 194; the creative reads 'Ideas / impossibl / to ignore' with the right edge sliced (docs/audit/tmp/verif-transformation-1440-mkt-story-leads.png). The auditor reported this only at 390. 1440 Feed + Leads: the longer copy makes the card 434px tall in a 420px stage (top at -7px), so the header is shaved and rounded corners are lost; Awareness is 418px with 1px to spare.  
   Fix: Size the headline to the card (smaller type or container-query units, allow wrap inside px-4 with break at word level and a min card width of ~220px for Story), and cap the feed card height (smaller creative, e.g. aspect-[4/3] or max-h) so every objective fits inside the stage with padding.

70. **[major · broken-control] Most controls do nothing visible when the slider hides the 'after' layer** *(added on re-check)*  
   Where: components/Transformation.tsx:44-51 (video), :106 (web); 1440 and 390  
   Evidence: Video with slider at 100: clip-path is inset(0 0 0 100%), so the whole edited layer, its caption and the EDITED badge are invisible; Reframe, Pop/Karaoke/Minimal and Play/Pause then change only button labels and the timeline strip, never the stage (docs/audit/tmp/verif-transformation-1440-video-s100.png). Web with slider at 0: inset(0 100% 0 0) hides the finished mock, so Midnight/Porcelain/Signal and the time slots produce no visible change (verif-transformation-390-web-mobile-s0.png). Even at the default 55 in vertical mode the 9:16 reel sits at x=408-616 of 1024 with the divider at x=563, so the user sees only a ~50px sliver of the reel and a fragment of the caption (docs/audit/1440-home-03-transformation.png shows just a stub of a letter).  
   Fix: Make the default state show the finished result fully (after side dominant), clamp the slider (e.g. 8-92) or auto-nudge it toward 'after' when an edit-side control is used, and position the reel frame within the visible 'after' area instead of the stage centre.

71. **[major · visual-weak] Wireframe and finished site do not line up, so the before/after reads as two unrelated pictures** *(added on re-check)*  
   Where: components/Transformation.tsx:76-81 vs :84-93; 1440 and 390  
   Evidence: docs/audit/tmp/verif-transformation-1440-web-default.png: at the divider the finished hero card (top ~219px, height ~132) meets a wireframe hero box at a different top/height (227-322), the tile rows are at different y positions (363-419 vs 339-403), the wireframe has a CTA box the finished site lacks, and the finished site has a nav + confirmation line the wireframe lacks. The right-aligned 'Menu · Book' nav is never visible at the default slider value because it sits under the wireframe half. The lower third of the finished mock at 1440 is empty.  
   Fix: Derive both states from one layout (same blocks, same geometry): render the wireframe as dashed outlines of exactly the finished elements (nav, hero, slots, tiles, confirmation) so the divider slices through aligned shapes; fill the desktop mock to the frame height.

72. **[minor · mobile-break] RAW and EDITED badges collide on phones**  
   Where: components/Transformation.tsx:41, 50; 390  
   Evidence: At the default slider value the RAW badge's right edge is at x=238 and the EDITED badge's left edge at x=203 - a 35px overlap; the raw badge reads 'RAW · 16:9 · NO CAPTIO' (docs/audit/390-home-03-transformation.png). In Karaoke the EDITED badge also covers the top-right corner of the reel frame (transformation-390-video-karaoke.png).  
   Fix: Shorten the badges on small screens ('RAW' / 'EDITED') and move the format details into the toolbar, or place the badges at the bottom corners.

73. **[minor · visual-weak] Karaoke subtitle line is left-aligned and off-centre**  
   Where: components/Transformation.tsx:48  
   Evidence: The span is 'absolute bottom-6' with no horizontal inset, so 'IDEAS THAT STOP THE SCROLL' hugs the left edge of the frame and wraps to two lines while the main word is centred (docs/audit/tmp/transformation-390-video-karaoke.png). It also does not highlight the current word, so the style is a coloured box rather than karaoke.  
   Fix: Add inset-x-0 text-center px-3 and highlight the active word within the full line.

74. **[minor · broken-control] Caption timeline looks like controls but is inert**  
   Where: components/Transformation.tsx:56-60  
   Evidence: The five segments (IDEAS / THAT / STOP / THE / SCROLL) are styled as a row of button-like blocks but are aria-hidden divs with no handler; clicking does nothing. The spec says no decorative controls.  
   Fix: Make each segment a button that jumps the preview to that word (and pauses), or restyle it clearly as a passive timeline with a moving playhead.

75. **[minor · broken-control] Before/after picture cannot be dragged directly**  
   Where: components/Transformation.tsx:52, 107 (pointer-events-none divider)  
   Evidence: Mouse drag (1440) and touch drag (390) across the stage from 57% to 20% left the slider value unchanged at 57. The divider line has no handle, and the only way to move it is the separate range input below.  
   Fix: Add a visible grab handle on the divider and pointer handlers on the stage that set the same value; keep the range input as the keyboard path.

76. **[minor · a11y] Sample booking slots are below the touch-target minimum and stay focusable while hidden**  
   Where: components/Transformation.tsx:88-89, 106  
   Evidence: The three slot buttons measure 61x30, 58x30 and 60x30px at both widths (spec: 44px minimum). With the slider at 0 the finished layer is fully clipped but the buttons still have tabIndex 0, so keyboard focus lands on invisible controls; at 390 with the slider at 50 the '16:00' slot is under the wireframe and not clickable.  
   Fix: Raise the slots to min-h-11, and set inert / tabIndex -1 on the finished layer's controls when they are clipped (or disable them below a threshold).

77. **[minor · a11y] Slider has no meaningful accessible value**  
   Where: components/Transformation.tsx:15  
   Evidence: aria-label is 'Edited to Raw' / 'Wireframe to Finished' and aria-valuetext is null, so a screen reader announces a bare number. Several labels are 10-11px (BETA chip 10px; badges and calendar cells 11px).  
   Fix: Add aria-valuetext such as '60% edited'; raise small text to at least 12px.

78. **[minor · visual-weak] Weekly calendar strip is a row of grey boxes with no role**  
   Where: components/Transformation.tsx:141-143  
   Evidence: aria-label is set on a div with no role (measured role: null), so it is not announced. Visually it is seven identical grey tiles (141px wide at 1440, 45px at 390) that do not react to the objective or placement controls.  
   Fix: Give it role='list' (or a table) and make it part of the demo: tint Reel/Post/Story by type and highlight the day that matches the current placement.

79. **[minor · a11y] Demo state is lost on every mode switch and toggle buttons mis-report state** *(added on re-check)*  
   Where: components/Transformation.tsx:63, 146, 169-171  
   Evidence: Selected Karaoke, switched to Website Development and back: Karaoke aria-pressed = 'false' (state reset because each demo is conditionally mounted). 'Reframe: 16:9 wide' button reports aria-pressed=false and 'Placement: Feed' reports aria-pressed=false while their labels also change, so a screen reader hears e.g. 'Reframe: 16:9 wide, not pressed' - a label-changing toggle should not also carry aria-pressed. Play/Pause has no aria-pressed at all (null), inconsistent with the rest.  
   Fix: Lift demo state into the parent (or keep panels mounted and hidden) so settings persist across tabs; for label-swapping buttons drop aria-pressed, or better, replace them with two-option segmented controls (9:16 | 16:9, Feed | Story) matching the Desktop | Mobile pattern already used.

80. **[minor · off-spec] In-demo ad uses lower-case 'makendless' and the video/web stages carry no in-frame 'Concept demo' label** *(added on re-check)*  
   Where: components/Transformation.tsx:136, 173  
   Evidence: Ad card header renders the brand as 'makendless' (spec: name is MAKENDLESS, exact spelling). The spec asks original demo content to be captioned 'Concept demo'; the only caption is a 12px muted line below all controls ('Original concept demonstrations built for this site. Not client work.'), which at 390 is below the fold of the stage (stage top ~y=240, caption at ~y=780 in verif-transformation-390-web-default.png). The marketing stage, by contrast, is correctly badged 'SIMULATED · ILLUSTRATIVE ONLY' and contains no numbers (regex scan for %, $, 3+ digit numbers in the panel returned null) - keep that.  
   Fix: Render the brand as MAKENDLESS in the mock ad, and add a small 'Concept demo' chip inside the video and website stages (same style as the marketing badge, positioned so it never overlaps content).

## 5. Solutions For You

Section 4 (components/Solutions.tsx, 52 lines) is a dark #0c1024 block with the correct headline, a four-button tablist (Content creator / Local business / Startup / Online store) and one panel holding a small flat SVG icon, a headline, blurb, service chips and two CTAs. Mouse and tap selection genuinely swap the SVG, headline, blurb, chips and the Start a Project href at all five widths, with no horizontal overflow (0px at 360/390/768/1024/1440) and Syne throughout. It is functionally the thinnest section on the homepage: arrow keys do nothing, the ?for= parameter is dropped by the contact form, the scenes are crude 5-10 primitive icons, there is no transition motion, and it is the fourth consecutive dark section. Test script: /Users/raghusai/Desktop/CLAUDE 2.0/MAKENDLESSNWEBSITE/docs/audit/tmp/solutions-test.mjs; screenshots are solutions-*.png in the same folder.

**Keep as-is:**
- Headline 'Made for what you're building.' with the prism gradient on 'you're building.' matches the spec and reads strongly at 1440 and 390.
- The four customer types and their order match the spec; clicking or tapping really changes headline, blurb, chips, SVG and CTA href (verified for all four tabs at 1440, 1024, 768, 390, 360).
- Copy in data/site.ts solutions (lines 96-99) is short, human and specific per audience, e.g. 'Be easy to find. Easy to book.' and 'Look ready before you are.'
- Service chips are colour-coded by studio accent (CREATE aqua rgb(34,211,238), BUILD violet rgb(139,92,246), GROW lilac rgb(199,166,255)), and GROW is labelled 'Marketing (beta)' on Startup and Online store.
- Data-driven structure: typed solutions array in data/site.ts as the single source, studio accents looked up from studios.
- Mobile recomposition: 2x2 tab grid above the panel at 390/360, tabs 56-74px tall, CTAs 44-46px tall, no sideways scroll.
- Both CTAs are real links: Explore Services goes to /studios (h1 'Three worlds. Endless possibilities.'), Start a Project goes to /contact?for=<id>.
- Enter/Space on a focused tab selects it, and a 2px focus outline is present on tabs (measured outline: solid 2px, :focus-visible true).
- No 3D is used here, which is correct per the spec (3D only in Hero, Live Transformation, Final CTA).

**Findings:**

81. **[major · a11y] Arrow keys do nothing on the customer-type tabs**  
   Where: components/Solutions.tsx:28-32; section[aria-labelledby="sol-title"] [role=tab]; http://localhost:3456 at 1440  
   Evidence: With focus on the first tab, pressing ArrowDown, ArrowRight, End and Home left selection and focus on 'Content creator' every time. There is no onKeyDown handler in the file. All four tabs have tabindex=null (no roving tabindex), so Tab walks through all four: measured order was Local business, Startup, Online store, Explore Services, Start a Project. The hero tablist on the same page does support arrows (scripts/shots.mjs tabKeyboard test), so behaviour is inconsistent.  
   Fix: Add an onKeyDown on the tablist: ArrowRight/ArrowDown next, ArrowLeft/ArrowUp previous, Home/End first/last, with wrap-around; move focus to the newly selected tab; set tabIndex={selected ? 0 : -1}. Reuse the hero tablist's pattern.

82. **[major · broken-control] Start a Project passes ?for=<customer> but the contact form ignores it**  
   Where: components/Solutions.tsx:44 and components/ContactForm.tsx:10; /contact?for=creator and /contact?for=store at 1440  
   Evidence: Clicking the CTA from Content creator lands on /contact?for=creator, from Online store on /contact?for=store. In both cases the service select value is 'other' ('Not sure yet') and the message textarea is empty. ContactForm only has options create/build/grow/other, so 'creator', 'local', 'startup', 'store' never match. The per-tab href is therefore cosmetic: the visitor's choice is lost.  
   Fix: Map the customer type in ContactForm: creator -> create, local/startup/store -> build (or add a 'What are you building?' field prefilled with the customer label), and show a visible line such as 'Starting a project for: Online store' so the selection carries through.

83. **[major · off-spec] Fourth consecutive dark section; breaks the dark/light alternation rule**  
   Where: components/Solutions.tsx:23 (bg-[#0c1024]); homepage section order  
   Evidence: Computed backgrounds in page order: hero rgb(12,16,36), studios rgb(12,16,36), live transformation gradient rgb(12,16,36)->rgb(32,35,66), solutions rgb(12,16,36), packages rgb(246,247,252), process/FAQ rgb(246,247,252), final CTA rgb(12,16,36). Solutions is the identical flat ink colour as Studios two sections up, and four dark sections run back to back before two light ones. Spec: dark cinematic and light editorial sections must alternate; no two neighbouring sections may look alike; avoid a uniformly dark site. Also the Transformation section ends at #202342 and Solutions starts at #0c1024, producing a hard seam.  
   Fix: Make this section the light editorial break: paper #F6F7FC background, dark text #13172B, with the selected-customer panel as the one dark or accent-tinted stage. Packages then needs to differ from it (the packages/process pair is already two light sections in a row), so coordinate: e.g. Solutions light, Packages light-tinted with a clearly different composition, or Solutions light and Packages on a surface-coloured band.

84. **[major · visual-weak] SVG scenes are crude placeholder icons, not business-specific visuals**  
   Where: components/Solutions.tsx:8-17; screenshots docs/audit/tmp/solutions-1440-tab0.png to tab3.png and solutions-scene0-3.png  
   Evidence: Each scene is 5-10 flat primitives in a 300x200 viewBox: creator = one purple rectangle with a play triangle, two cyan bars and a progress line; local business = an empty browser outline with two grey bars, a pill and a single-stroke 'awning'; startup = a clip-art rocket; store = three identical purple squares with two bars each. No text, no content, no depth, nothing that says cafe/salon/booking, product, launch page or reel. They read as wireframe icons from a template, far below the hero and Live Transformation quality, and the rocket is a generic startup cliche unrelated to the studio's actual output.  
   Fix: Replace each scene with a richer CSS/SVG composition that depicts the deliverable for that customer: creator = one long timeline being cut into three vertical clips with caption bars; local business = a mini site with a services list, a date/time booking picker and a promo video tile; startup = a landing-page hero with headline bars, CTA and a launch video card; store = a product grid with image tiles, 'Request' style buttons, a cart badge and a product-video thumbnail. Use the division accents, layered cards and subtle motion; label as 'Concept demo' if they look like real UIs.

85. **[major · visual-weak] No transition or motion when switching customer type**  
   Where: components/Solutions.tsx:34-46  
   Evidence: The panel content is swapped instantly: there is no animation class, no motion component and no CSS transition on the panel children (only 'transition' on the tab buttons). The section also has no scroll-in reveal. The spec's quality bar asks for varied professional motion (mask reveals, kinetic type) and for selection to 'meaningfully change' the visuals; here only a small icon and text snap.  
   Fix: Animate the swap with the already-installed motion library: mask or slide reveal for the scene, staggered headline/chips, and tint the panel border/glow with the dominant studio accent of the selected customer so the whole stage changes, not just the icon. Respect reduced motion with a simple crossfade.

86. **[major · visual-weak] Tablet-landscape (1024) layout is badly proportioned: giant tabs, tiny scene, four-line headline** *(added on re-check)*  
   Where: components/Solutions.tsx:27-37 (lg:grid-cols-[320px_1fr] + md:grid-cols-2); http://localhost:3456 at 1024; screenshot docs/audit/tmp/solverify-1024-tab2.png  
   Evidence: At 1024 the four tab buttons are 320x145px each (mostly empty boxes), the scene shrinks to 227x141px inside a 608x604 panel with roughly 390px of empty panel under it, and the h3 breaks into four lines ('Look / ready / before you / are.') because the text column is only about 260px wide. The chips stack one per row. The auditor measured the sizes but rated it minor and did not report the headline break; in the screenshot this is the weakest state of the section.  
   Fix: Keep the stacked layout (tabs in a 4-across or 2x2 row above the panel) until about 1200px, or narrow the tab column to about 220px with items-start and fixed tab height; let the scene span the panel height; cap the h3 with a smaller size or text-balance at this width.

87. **[minor · a11y] Tab/panel ARIA wiring is incomplete**  
   Where: components/Solutions.tsx:30 and :34  
   Evidence: DOM check on all four tabs: id=null, aria-controls=null; tabpanel has id=null and aria-labelledby=null. The panel is not announced as belonging to the selected tab and content changes are not exposed to assistive tech.  
   Fix: Give each tab id=`sol-tab-${id}` and aria-controls="sol-panel"; give the panel id="sol-panel", aria-labelledby the active tab id and tabIndex={0}.

88. **[minor · broken-control] Startup rocket flame animation is dead code and SMIL ignores reduced motion**  
   Where: components/Solutions.tsx:15  
   Evidence: <animate attributeName="y2"> is placed inside a <path d="M150 150v35">; a path has no y2 attribute, so nothing animates (the flame is static in solutions-1440-tab2.png). Under prefers-reduced-motion: reduce the SVG timeline still runs (animationsPaused() false, currentTime 0.32 -> 0.82), because the global CSS rule in app/globals.css:34-36 only covers CSS animations, not SMIL.  
   Fix: Drop the SMIL element; animate with a CSS keyframe (transform/scaleY on the flame) so the existing reduced-motion rule applies, or switch the element to <line> and gate it behind a reduced-motion check.

89. **[minor · visual-weak] Panel is under-filled and jumps in height between tabs**  
   Where: section[aria-labelledby="sol-title"] [role=tabpanel]; 1440, 1024, 360  
   Evidence: Panel heights per tab: 1440 = 368/404/368/404px; 1024 = 526/526/604/502px; 360 = 646/678/744/678px, so the layout below shifts on every selection (the tab column also stretches from 86px to about 95px per button at 1440, visible comparing solutions-1440-tab0.png and tab1.png). At 1440 the scene is only 355x237 inside an 800px panel, leaving an empty band below it; at 1024 the scene shrinks to 259x173 while the tab buttons balloon to 320x126 each.  
   Fix: Give the panel a fixed min-height per breakpoint (or reserve space for the longest headline and four chips), make the scene fill the panel height (remove aspect-[3/2] on md+ and use h-full), set the tab column to items-start with a fixed tab height, and switch to the stacked layout below about 1100px instead of the 320px side column.

90. **[minor · broken-control] Service chips look like buttons but are not interactive**  
   Where: components/Solutions.tsx:39-41  
   Evidence: The chips are <li> pills with a coloured 1px border and bold text (34px tall), visually identical in language to the outlined 'Explore Services' pill directly beneath them, but they have no link or handler. The spec says no decorative controls; a visitor will try to tap 'Booking website'.  
   Fix: Either link each chip to its studio page (/create, /build, /grow, ideally with an anchor to the service) or restyle them as a plain checklist (dot + text, no pill border) so they do not read as controls.

91. **[minor · visual-weak] Explore Services is the same generic link for every customer type**  
   Where: components/Solutions.tsx:43  
   Evidence: href is /studios for all four tabs (verified: 'Explore Services->/studios' in every state), which lands on the three-studio overview rather than the services recommended for the selected customer.  
   Fix: Point it at the primary studio for the selection (creator -> /create, local/startup/store -> /build) or keep /studios but add a hash/parameter that highlights the recommended services.

92. **[minor · content-honesty] A few lines lean towards outcome promises**  
   Where: data/site.ts:96 and :99  
   Evidence: 'Turn one long recording into a week of content' implies a deliverable volume that is not defined in any package, and 'Products that sell themselves.' is a results-style claim. The spec forbids invented guarantees; these are marketing phrasing rather than hard claims, so owner sign-off is enough.  
   Fix: Have the owner approve the wording or soften it, e.g. 'Turn one long recording into multiple platform-ready clips' and 'A store built to show your products well.'

93. **[minor · off-spec] Recommended-service chips do not match the service catalogue** *(added on re-check)*  
   Where: data/site.ts:96-99 versus data/site.ts:23-56  
   Evidence: Spec says data/site.ts is the single source of truth for services, but the chip titles are free-typed strings that match no catalogue title: 'Video editing', 'Content repurposing', 'Booking website', 'Landing page', 'Promotional content', 'Product video editing', 'Marketing (beta)'. 'Landing page' is only a bullet under T1 Business websites, so the Startup tab lists the same service twice ('Business website' + 'Landing page'). 'Booking website' is T3 'Booking systems & web apps'. A visitor who follows Explore Services will not find these names on /studios, /create or /build.  
   Fix: Reference catalogue codes in the solutions data (e.g. creator: V1, V4, V5; local: T1, T3, V3; startup: T1, V3, M-beta; store: T2, V3, M-beta) and render the catalogue title (or an approved short label stored next to the code), then link each chip to that service.

94. **[minor · visual-weak] Section headline orphans one word and splits the gradient phrase at desktop** *(added on re-check)*  
   Where: components/Solutions.tsx:26; 1440 screenshot docs/audit/tmp/solverify-1440-tab1.png  
   Evidence: At 1440 the h2 renders 'Made for what you're' on line one and the single word 'building.' on line two, cutting the prism-gradient phrase 'you're building.' in half. At 1024 the same headline breaks cleanly as 'Made for what / you're building.' (solverify-1024-tab2.png), which is clearly the intended composition.  
   Fix: Force the break before the gradient span on md+ (block span or <br className='hidden md:block'/>) or add text-balance so the gradient phrase stays on one line.

95. **[minor · mobile-break] Phone tab grid has uneven rows because one label wraps** *(added on re-check)*  
   Where: components/Solutions.tsx:28-31; 390 and 360; screenshot docs/audit/tmp/solverify-390-tab2.png  
   Evidence: At 390 the tabs are 171px wide: 'Content creator' wraps to two lines, making row one 74px tall and row two 56px tall (measured 171x74, 171x74, 171x56, 171x56; same at 360 with 156px width). The 2x2 grid therefore looks unbalanced. Additionally at 360 the panel height changes 646/678/744/678 per tab, so the page below jumps on every tap.  
   Fix: Use text-[15px] or tighter padding (px-4) on phones so every label fits one line, or set a uniform min-h on all four tabs; reserve panel height for the longest state.

## 6. Packages & Pricing

Section 5 (components/Packages.tsx, data/site.ts:61-85) is a light #f6f7fc section with the eyebrow "Packages & pricing", the correct headline "Find your starting point.", an honest intro line, three pill tabs (Video Editing / Website Development / Digital Marketing BETA) and a grid of identical white cards (4 for CREATE, 5 for BUILD, 1 for GROW), each with name, "for" line, three deliverables, an "Optional:" line and a text link. All three tabs work by click and by Tab+Enter, all 10 links navigate to /contact and pre-select the right studio, there is no sideways overflow at 360/390/768/1024/1440, and no prices, revision counts, delivery times or guarantees are invented. The weaknesses are that it looks exactly like a generic SaaS pricing grid with zero motion or division identity, the spec's "scope info" is absent, the chosen package name is discarded on the contact page, the tablist lacks arrow-key and ARIA wiring, and the GROW tab is a single orphaned card. Test script and screenshots are in /Users/raghusai/Desktop/CLAUDE 2.0/MAKENDLESSNWEBSITE/docs/audit/tmp/ (packages-test.mjs, packages-<width>-tab<0-2>.png, packages-1440-focus.png, packages-contact-*.png).

**Keep as-is:**
- Headline 'Find your starting point.' with the violet accent and the eyebrow: exact spec wording, strong Syne display type at 1440 and 390.
- Honest intro copy (Packages.tsx:14): 'Every project is quoted from its real scope, effort and timeline... Prices are confirmed in a written proposal.' No invented prices, revision counts, delivery times or guarantees anywhere in data/site.ts:68-85.
- 'Request Quote' as the next action on every CREATE/BUILD card and 'Join the beta list' on GROW; all 10 links resolve to /contact?service=<studio>-<package> and pre-select the correct studio option (measured: create x4, build x5, grow x1).
- GROW honesty: BETA chip on the tab plus the notice 'Digital marketing is in beta... No campaigns are offered yet.' and the contact option reads 'GROW — Digital marketing (beta interest)'.
- Light paper background gives the required dark/light alternation and a brighter, clean feel.
- Touch targets: tabs are 44px high, card links are 44px+ high at every width tested; visible focus ring on tabs (outline 2px solid, seen in packages-1440-focus.png).
- No horizontal overflow at 360, 390, 768, 1024, 1440 (scrollWidth - innerWidth = 0 for every tab state); no page errors; Syne is the only computed font.
- Package data lives in typed data/site.ts (Package interface) and maps cleanly to the service catalogue (Starter/Creator/Professional/Custom; Starter/Business/Commerce/Custom/Maintenance).
- Mobile card text is readable at 390 (14px body, 20px titles, single column, no clipping on CREATE tab).

**Findings:**

96. **[major · visual-weak] Looks like a generic SaaS pricing table**  
   Where: components/Packages.tsx:22-35; docs/audit/1440-home-05-packages.png; docs/audit/tmp/packages-1440-tab1.png  
   Evidence: Four or five identical 243x310-330px white rounded cards in a row, each with title, grey subtitle, three dot bullets and a purple text link. No imagery, no division colour (CREATE and BUILD cards are pixel-identical in styling; bullets are aqua on both), no hierarchy between packages, no editorial composition. The spec explicitly says 'not a generic SaaS pricing table' and 'avoid generic SaaS cards'.  
   Fix: Keep the data and tabs but recompose the panel as an editorial layout: e.g. a large numbered list/accordion or a split view with one featured package detail (who it is for, deliverables, scope, add-ons, CTA) and a compact selector for the others; tint each category with its division accent (CREATE aqua, BUILD violet, GROW lilac) and add a small CSS/SVG motif per package (reel frame, browser wireframe) instead of bare bullets.

97. **[major · off-spec] Scope info / exclusions missing from every package**  
   Where: data/site.ts:61-66 (Package interface) and components/Packages.tsx:25-30  
   Evidence: The Package interface has only name, for, deliverables, addons. The spec for section 5 lists 'Package name, suitable customer, typical deliverables, scope info, optional additions, clear next action'. No card renders any scope line (what is included/not included, what the client supplies, that revisions and timeline are set in the proposal).  
   Fix: Add a `scope` field (and optionally `notIncluded`) to Package and render it as its own labelled row, using only non-invented statements, e.g. 'Scope: confirmed in a written proposal; revisions and timeline agreed before work starts' plus owner-approved exclusions. Put any exclusions the owner must decide into TODO-FOR-OWNER.md.

98. **[major · broken-control] Chosen package is dropped on the contact page**  
   Where: components/ContactForm.tsx:11 (`.split("-")[0]`); tested via docs/audit/tmp/packages-test.mjs  
   Evidence: All 10 links carry the package in the URL (/contact?service=build-commerce etc.) but the form keeps only the studio: for every link the select shows just 'CREATE — Video editing' / 'BUILD — Website development' / 'GROW — ...', the page text never mentions the package name (pageMentionsPackage=false for all 10) and the message textarea is empty. Clicking 'Request Quote' on Commerce and on Maintenance lands on an identical form (packages-contact-1-2.png).  
   Fix: Parse the full param in ContactForm, show a visible 'Requesting a quote for: BUILD — Commerce' chip (removable) and include it as a hidden/visible field in the submitted payload and mailto body; validate the slug against data/site.ts packages.

99. **[major · a11y] Tablist has no arrow-key support and incomplete ARIA wiring**  
   Where: components/Packages.tsx:15-22  
   Evidence: Focusing the selected tab and pressing ArrowRight leaves selection on 'Video Editing' (kbArrow result). Tabs have no id, aria-controls or roving tabindex (all null); the panel is a <ul role="tabpanel"> with no aria-labelledby, and role=tabpanel on the UL removes list semantics so its <li> children are orphaned list items. The hero tablist does support arrow keys (scripts/shots.mjs tests it), so behaviour is inconsistent within the site.  
   Fix: Add Left/Right/Home/End handling with roving tabindex, give each tab an id and aria-controls, wrap the list in a <div role="tabpanel" id aria-labelledby tabIndex={0}> and keep the <ul> inside it.

100. **[major · visual-weak] 'Maintenance' title overflows its card at 1024 and is jammed at 1440**  
   Where: components/Packages.tsx:25 (h3 text-xl) with lg:grid-cols-4 / xl:grid-cols-5; docs/audit/tmp/packages-1024-tab1.png and packages-1440-tab1.png  
   Evidence: At 1024 the card is x=32, w=228 (right edge 260px) but the word 'Maintenance' runs to about x=270, past the card border. At 1440 (card 243px wide) the word ends about 5px from the card edge, inside the 24px padding. 'Professional' on the CREATE tab is likewise almost edge to edge.  
   Fix: Stop forcing five narrow columns: use at most 3-4 columns with wider cards (or the editorial list layout), or reduce title size / use clamp() and overflow-wrap so wide Syne ExtraBold words fit inside the padding.

101. **[major · visual-weak] GROW tab is one small orphaned card with weak copy**  
   Where: data/site.ts:83-85; components/Packages.tsx:22,37; docs/audit/tmp/packages-1440-tab2.png  
   Evidence: At 1440 a single 243px card sits at the left of a 1280px panel with roughly 1000px of empty space beside it; the title wraps to two lines and the CTA arrow drops alone onto a second line (link height 64px). The deliverable 'Informative beta descriptions' is not a deliverable and reads like placeholder text. The beta notice is a separate strip below rather than part of the composition.  
   Fix: Give GROW its own full-width beta layout: a wide lilac-tinted 'Coming soon' panel that lists the three planned areas (M1-M3) as 'planned, not yet offered', merges the beta notice into it, and has one clear 'Join the beta list' button. Replace 'Informative beta descriptions' with honest wording such as 'Updates when beta opens'.

102. **[major · visual-weak] No motion at all; tab change is an instant swap**  
   Where: components/Packages.tsx (whole file); measured with section.getAnimations({subtree:true})  
   Evidence: 0 animations in the section; the only transition is the tab pill colour. Cards have no entrance, no hover/focus state (only the link underlines on hover) and the panel content pops in. Section height also jumps between tabs at 1440 (854px / 834px / 930px), shifting everything below. The spec asks for varied professional motion and per-division identity.  
   Fix: Add a restrained panel transition on tab change (staggered mask/slide reveal, reduced-motion safe), a card hover/focus state, and reserve a min-height for the panel so the page below does not jump.

103. **[major · mobile-break] Mobile is the desktop grid stacked, producing a very long section**  
   Where: components/Packages.tsx:15,22; docs/audit/390-home-05-packages.png; docs/audit/tmp/packages-390-tab*.png  
   Evidence: At 390 the section is 1816px tall on CREATE and 2106px on BUILD (about 2.5 phone screens of near-identical cards). The three tabs wrap into three separate left-aligned rows of different widths (143 / 214 / 227px) taking about 150px of height. The spec says mobile must be recomposed, not shrunk.  
   Fix: On phones use a full-width three-segment control (short labels: Video / Web / Marketing BETA) and collapse packages into an accordion or a horizontal snap carousel with a position indicator, showing one package in full at a time.

104. **[major · broken-control] Selected category is lost on Back from the contact page** *(added on re-check)*  
   Where: components/Packages.tsx:7 (useState with no persistence); docs/audit/tmp/packagesverify-test2.mjs  
   Evidence: Selected Website Development, followed 'Request Quote' to /contact?service=build-starter, then history back: scroll position is restored to the packages section (scrollY 3825, section top 46px) but aria-selected is ['true','false','false'], so the visitor is returned to the Video Editing packages, not the BUILD ones they were comparing. Likewise the server HTML only contains the CREATE panel ('Maintenance' and 'Beta interest list' are absent from the fetched HTML), so no tab is addressable by URL.  
   Fix: Keep the selected category in the URL (hash or ?packages=build via router.replace) or sessionStorage, and initialise state from it so Back and deep links restore the tab.

105. **[minor · content-honesty] 'Join the beta list' implies a list that does not exist**  
   Where: components/Packages.tsx:32; components/ContactForm.tsx:26-36  
   Evidence: The link goes to the general Start a Project form with GROW pre-selected; there is no beta-list mechanism and, with no NEXT_PUBLIC_CONTACT_EMAIL, submitting ends in 'Form checked. Delivery channel pending... this message was not sent anywhere.' The card promises 'Early-access updates'.  
   Fix: Rename to 'Register beta interest' until a real list/delivery channel is approved, and keep the 'Early-access updates' promise only if the owner commits to sending them.

106. **[minor · visual-weak] Empty fifth column and awkward orphan rows**  
   Where: components/Packages.tsx:22 (`sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5`); docs/audit/1440-home-05-packages.png; docs/audit/tmp/packages-1024-tab1.png, packages-768-tab1.png  
   Evidence: At 1440 the CREATE tab's four cards end at x=1101 leaving a 259px empty column on the right, so the grid looks left-heavy under a full-width headline. On BUILD at 1024 and 768 the fifth card (Maintenance) sits alone on its own row with empty space beside it.  
   Fix: Set the column count from the number of packages (4 columns for CREATE), and treat Maintenance as a distinct full-width 'after launch' strip rather than a fifth equal card.

107. **[minor · visual-weak] CTA arrow wraps onto its own line at 1024**  
   Where: components/Packages.tsx:31-33; docs/audit/tmp/packages-1024-tab0.png / tab1.png  
   Evidence: At 1024 every 'Request Quote →' link is 64px high (two lines) with the arrow alone on line two; the same happens for 'Join the beta list →' at 1440 and 1024.  
   Fix: Make the arrow a non-wrapping inline element (whitespace-nowrap on the link or a no-break space before the arrow) and style the CTA as a proper button so it reads as the primary action.

108. **[minor · a11y] Small supporting text sizes**  
   Where: components/Packages.tsx:18 (text-[10px] BETA chip), :30 (text-xs Optional line), :12 (text-xs eyebrow)  
   Evidence: Computed sizes: BETA chip 10px, 'Optional:' add-ons line 12px, eyebrow 12px at all widths including 360/390. The add-ons line is real content, not decoration.  
   Fix: Raise the add-ons line to 13-14px on mobile and the BETA chip to at least 11-12px.

109. **[minor · missing] Section has no anchor id**  
   Where: components/Packages.tsx:10  
   Evidence: The <section> has aria-labelledby but no id, so nothing (nav, studio pages, Solutions CTAs) can deep-link to packages and a tab cannot be opened by URL.  
   Fix: Add id="packages" and optionally read a hash/query (e.g. #packages?tab=build) to pre-select the category.

110. **[minor · a11y] Focus ring on package links is low-contrast and misshapen on the light cards** *(added on re-check)*  
   Where: app/globals.css:26 (outline: 2px solid #22d3ee); components/Packages.tsx:31 (mt-auto pt-6 on the link); docs/audit/tmp/packagesverify-1440-focus-link-sec.png  
   Evidence: Keyboard focus on 'Request Quote' gives computed outline rgb(34,211,238) 2px on a white card: roughly 1.8:1 against #fff, below the 3:1 expected for focus indicators. Because the link carries pt-6, the ring is a 193x44px box with 24px of empty space above the text, which looks like a layout bug in the screenshot. (The tab buttons get a dark rgb(19,23,43) outline, which is fine.)  
   Fix: Use a dark or violet focus colour inside light sections (e.g. #13172b or #6f45f6) and move the spacing from padding on the link to margin, or turn the CTA into a real button shape so the ring hugs it.

111. **[minor · content-honesty] Eyebrow says 'Packages & pricing' but the section contains no pricing** *(added on re-check)*  
   Where: components/Packages.tsx:12  
   Evidence: The section label reads 'PACKAGES & PRICING' in every screenshot, yet no price, range or pricing model appears (correctly, per the no-invented-prices rule). The only pricing statement is 'Prices are confirmed in a written proposal'. A visitor scanning for a price finds a label promising one and nothing behind it.  
   Fix: Keep the spec section name internally but label it honestly on the page, e.g. 'Packages & quotes' or 'Packages, quoted to scope', and keep the existing intro sentence.

112. **[minor · off-spec] GROW tab presents the beta as a 'package' with deliverables** *(added on re-check)*  
   Where: data/site.ts:83-85; components/Packages.tsx:23-34; docs/audit/tmp/packagesverify-1440-tab2.png  
   Evidence: The GROW panel reuses the package card template: a package name ('Beta interest list'), a 'for' line and three bulleted 'deliverables' ('Early-access updates', 'Informative beta descriptions', 'No commitments'). The spec says GROW stays Beta / Coming Soon; nothing in the panel says 'Coming soon' or names the planned areas (M1-M3 in data/site.ts:53-57), and a non-service is styled exactly like a purchasable service.  
   Fix: Give GROW its own non-package state: a 'Coming soon / in beta' panel listing the three planned areas as not yet offered, the existing beta notice, and one honest interest CTA. Do not render it through the Package card.

## 7. How We Work + FAQ

Section 6 (components/ProcessFaq.tsx) is a single light (#f6f7fc) section: eyebrow, H2 "From idea to delivery.", a four-step ordered list (Discover/Design/Create/Deliver) with a scroll-linked prism line behind the numbered dots (md+ only), then a two-column FAQ with a six-item single-open accordion. The accordion works by click and keyboard with correct aria-expanded, and the content is mostly careful about not inventing numbers. The weak points are: the only motion is one thin line that is hidden on phones (mobile has zero progression motion), the section is the same colour as Packages directly above so two light sections sit back to back (spec violation), the line was observed stuck at 0% in 3 of ~19 fresh loads, and a few copy lines state policies/outcomes the owner has not confirmed. No TODO-FOR-OWNER.md exists in the repo. Test scripts and screenshots are in /Users/raghusai/Desktop/CLAUDE 2.0/MAKENDLESSNWEBSITE/docs/audit/tmp/ (processfaq-*.mjs / processfaq-*.png).

**Keep as-is:**
- Headline 'From idea to delivery.' with violet accent word, eyebrow 'How we work', and the exact four steps DISCOVER / DESIGN / CREATE / DELIVER in an <ol> - matches spec wording and order
- FAQ covers all six spec topics (start, requirements, quote, revisions, timelines, ongoing support) with no invented numbers: no revision counts, no day counts, no prices; 'We don't promise timelines we haven't scoped' is exactly the right honest tone
- Accordion mechanics: real <button> inside a heading, aria-expanded + aria-controls, hidden attribute on panels, single-open behaviour, click-again closes; Enter and Space both toggle; Tab moves between questions (all measured in processfaq-test.mjs)
- Visible focus ring on FAQ buttons: 2px solid #22d3ee, 3px offset, :focus-visible matches
- Touch targets: FAQ buttons measure 64px high (88px when wrapped) at 360/390/768/1024/1440
- No horizontal overflow at 360, 390, 768, 1024, 1440 (scrollWidth - innerWidth = 0)
- Scroll-linked prism line concept on desktop/tablet: when it runs it tracks scroll smoothly (e.g. 1440: 16 -> 340 -> 663 -> 987 -> 1152px as the list moves from 670px to 270px from viewport top) and under prefers-reduced-motion it still just follows scroll with no autonomous animation
- Calm, elegant typographic FAQ layout at 1440 (sticky-feeling left title + hairline-divided list) - not a generic card grid; Syne only (computed font-family Syne on headings and body)
- Server-rendered state is sensible without JS: first answer open, others hidden
- GROW honesty preserved in the support answer: 'Digital marketing is still in beta.'

**Findings:**

113. **[blocker · off-spec] Process/FAQ is the same light colour as Packages directly above - two light sections merge**  
   Where: components/ProcessFaq.tsx:12-13 and components/Packages.tsx:10; homepage at 1440 and 390  
   Evidence: Computed background of both section[aria-labelledby=pkg-title] and section[aria-labelledby=proc-title] is rgb(246,247,252) at every width; Packages bottom = Process top (4725px at 1440) with no gap. The only separator is a 1px 10%-opacity hairline (border-t border-[#13172b]/10). Screenshots docs/audit/tmp/processfaq-1440-boundary.png and processfaq-390-boundary.png show one continuous pale page running from the package cards into 'How we work'. Spec: 'Dark cinematic and light editorial sections must ALTERNATE; no two neighbouring sections may look alike.' From Solutions onward the order is ... Packages (light) -> Process (light) -> Final CTA.  
   Fix: Give section 6 its own surface. Simplest within the token set: make Process+FAQ a dark ink (#0C1024) / surface (#202342) section with light text and the prism line glowing on dark, then keep Final CTA distinct (e.g. deeper cinematic with 3D). Alternative if Final CTA must be the only dark neighbour: keep Packages paper and render the process band as a full-bleed dark strip with the FAQ on paper below it. Either way remove the hairline-only divider and the shared pb/pt hack (section has no top padding of its own).

114. **[major · mobile-break] No progression motion at all on phones - the line is display:none and nothing replaces it**  
   Where: components/ProcessFaq.tsx:17 (`hidden ... md:block`), homepage at 360 and 390  
   Evidence: At 390 and 360 the track computes display:none, width 0 at every scroll position (line@390 / line@360 in processfaq-test.mjs output). The only element in the section with an inline style / motion value is that one line (sectionStyled = ['DIV background: var(--prism); width: ...']). docs/audit/390-home-06-process-faq.png shows four static dots stacked 184px apart with no connector. Spec: 'Four steps ... with motion that clarifies progression' and 'Mobile is recomposed, not shrunk'.  
   Fix: On <md render a vertical rail: a 2px track running down the left through the centres of the four dots (left: 21px, top/bottom inset to first/last dot) with the same scroll-linked prism fill using scaleY (transform-origin top). Pair it with per-step activation (see next finding) so each dot lights as the fill reaches it.

115. **[major · visual-weak] Motion does not actually clarify progression - steps never change state, line overshoots step 04**  
   Where: components/ProcessFaq.tsx:17-25; 1440 and 768  
   Evidence: All four dots are identical static bg-[#13172b] circles; headings and copy never react. In docs/audit/tmp/processfaq-1440-line-cold-instant.png the fill stops mid-way between 03 and 04 with nothing indicating which step is 'current'. Geometry: track spans x=144..1296 but the last dot ends at x=1076, so the line continues 220px past 'Deliver' to the container edge - the journey visually ends in empty space rather than at delivery. The line is a 2px hairline, which at 1440 reads as a decorative rule (docs/audit/1440-home-06-process-faq.png). Whole section has one animated property; no kinetic type or mask reveal, versus the spec's 'varied professional motion'.  
   Fix: Keep the scroll-linked line but (1) end the track at the centre of dot 04 (right: calc(25% - 22px) or compute from the grid), (2) derive an active index from scrollYProgress (useMotionValueEvent -> thresholds 0/0.33/0.66/1) and switch each reached dot to the prism gradient / division accent with a small scale pop, dim not-yet-reached headings to ~40% opacity and bring them to full as the fill arrives, (3) thicken the fill to 3px with a leading glow dot as a playhead (echoes the hero timeline), (4) add a mask/clip reveal on the H2. Use transform scaleX rather than width for the fill.

116. **[major · content-honesty] Copy states operational policies the owner has not confirmed**  
   Where: data/site.ts:105, 106, 113, 115  
   Evidence: 'An assigned owner and team produce the work, with an internal quality review.' (105) and '...then deliver securely.' (106) assert a QA process and a security property; 'Revision limits are defined per package and written into your proposal.' (113) asserts a per-package revision policy, yet no package in data/site.ts carries any revision information (grep 'revision' only hits lines 104/106/113); 'Yes. Ongoing video editing and website maintenance arrangements can be agreed after delivery.' (115) is an unconditional yes. Spec: 'Never invent ... policies, revision counts, delivery times, guarantees ... Missing items go to TODO-FOR-OWNER.md' - and no TODO-FOR-OWNER.md exists anywhere in the repo (find returned nothing).  
   Fix: Soften to what is certain and log the rest for the owner: 105 -> 'We produce the work and review it before it reaches you.'; 106 -> 'You review, we make the agreed revisions, then hand over the final files.' (drop 'securely'); 113 -> 'The number of revision rounds is agreed with you and written into your proposal before work starts.'; 115 -> 'Ongoing editing and website maintenance can be arranged - ask when you get in touch. Digital marketing is still in beta.' Create TODO-FOR-OWNER.md listing: revision policy, QA step, delivery method, ongoing-support terms.

117. **[major · content-honesty] 'We'll follow up' promise contradicts the unconnected contact form**  
   Where: data/site.ts:110 vs components/ContactForm.tsx:35  
   Evidence: First FAQ answer (open by default on the homepage): 'Use Start a Project and tell us what you're building. We'll follow up to understand your goal...'. ContactForm.tsx:35 currently tells the user 'The inquiry inbox isn't connected yet, so this message was not sent anywhere.' So the most visible FAQ answer promises a follow-up the site cannot presently trigger.  
   Fix: Until a delivery channel is approved, phrase it without a promise of contact: 'Use Start a Project to tell us what you're building. From there we work out your goal, scope and next steps together.' Add the missing inbox to TODO-FOR-OWNER.md; restore 'We'll follow up' once it is connected.

118. **[minor · visual-weak] FAQ open/close has no transition - content snaps**  
   Where: components/ProcessFaq.tsx:34 (hidden attribute toggle)  
   Evidence: 50ms after click the new panel is already fully shown and the previous one gone; section getAnimations({subtree:true}).length = 0 during the toggle. With single-open behaviour the rows below jump instantly. The +/− glyph is a plain text swap. Fine functionally but reads as unfinished next to the spec's 'calm, elegant'.  
   Fix: Animate height with grid-template-rows 0fr->1fr (or motion AnimatePresence height:auto) over ~250ms, and rotate a single plus icon 45deg instead of swapping characters. Keep the hidden/inert semantics for closed panels and skip the transition under prefers-reduced-motion.

119. **[minor · a11y] Accordion panels lack region labelling; heading level jumps under a visual H3**  
   Where: components/ProcessFaq.tsx:33-34  
   Evidence: DOM check: buttons have no id, panels have role=null and aria-labelledby=null (faqInitial in test output). Heading outline is H2 > H3 Discover..Deliver > H3 'Questions, answered plainly.' > H4 questions, which is valid, but the FAQ group is a sibling of the step titles rather than its own sub-section.  
   Fix: Add id={`faq-btn-${i}`} to each button and role="region" aria-labelledby on each panel (WAI-ARIA accordion pattern). Optionally wrap the FAQ block in its own <section aria-labelledby> so the outline separates process from FAQ.

120. **[minor · missing] Step numbers and section have no anchor; homepage FAQ cannot be linked to**  
   Where: components/ProcessFaq.tsx:12; nav/footer FAQ links  
   Evidence: Section element has no id (sectionId = ''), and the section contains 0 links. Both 'FAQ' links on the page point to /faq (a separate page rendering the same faqs array, app/faq/page.tsx:9). The section also has no CTA after six answers that all point to a proposal.  
   Fix: Add id="process" on the section and id="faq" on the FAQ block (with scroll-margin-top for the fixed header). Add a quiet text link under 'Specifics are confirmed in your proposal before work starts.' -> 'Start a Project' (/contact) and 'All questions' (/faq).

121. **[minor · visual-weak] Large dead space under the FAQ title on desktop; 768 step columns are cramped**  
   Where: components/ProcessFaq.tsx:18, 28-29; 1440 and 768  
   Evidence: docs/audit/1440-home-06-process-faq.png: left column holds a two-line title and one sentence, then ~360px of empty paper beside the six questions. docs/audit/tmp/processfaq-768-mid.png: four columns at 768 give ~150px text columns, step copy wraps to five lines each and 'Discover'/'Design' titles nearly touch (gap-8 with 2xl extended Syne).  
   Fix: Make the left FAQ column sticky (lg:sticky lg:top-28 self-start) and put the Start a Project / All questions links there to fill it with purpose. At md (768-1023) use a 2x2 grid for the steps (md:grid-cols-2 lg:grid-cols-4) with the rail redrawn accordingly, or keep four columns only from lg.

122. **[minor · a11y] Homepage FAQ answers are unreachable without JavaScript and hidden from find-in-page** *(added on re-check)*  
   Where: components/ProcessFaq.tsx:34; server HTML of http://localhost:3456/  
   Evidence: The server-rendered HTML has the hidden attribute on faq-1 to faq-5 (curl output: id="faq-1" hidden="" and so on). Before hydration or with JS off, five of six answers cannot be opened, and Ctrl+F will not find text in closed panels. The /faq page uses a static dl, so the content exists elsewhere, but the homepage section never links to it (0 links in the section).  
   Fix: Use hidden="until-found" or native details/summary with name="faq" for single-open behaviour so answers work without JS and are searchable, or add an 'All questions' link to /faq inside the section.

123. **[minor · performance] Scroll-linked motion runs on phones although nothing is painted, and animates layout width on desktop** *(added on re-check)*  
   Where: components/ProcessFaq.tsx:8-9,17  
   Evidence: At 390 and 360 the fill's inline style keeps updating on scroll (0% -> 14.4% -> 29.0% -> 43.4% -> 62.8%) while its parent is display:none and its measured width is 0. On desktop the animated property is width (0 -> 1152px), a layout property, not a transform.  
   Fix: Drive the fill with scaleX or scaleY (transform-origin left or top) and reuse the same motion value for the mobile vertical rail, so the listener is doing visible work at every width.

124. **[minor · content-honesty] More unconfirmed process promises in the copy beyond those the auditor listed** *(added on re-check)*  
   Where: data/site.ts:104, 106, 111, 113  
   Evidence: Line 111: 'We'll send a clear list after discovery.' Lines 106 and 113: 'You review consolidated feedback' and 'We collect consolidated feedback so each round is focused' describe a specific feedback procedure. Line 104: every engagement gets 'a written proposal' covering 'scope, timeline, revisions and price'. None is backed by an owner-confirmed source, and no TODO-FOR-OWNER.md exists. The spec (line 56) says never to invent policies and to send missing items to that file.  
   Fix: Keep the proposal-first framing, which is safe and honest, but add 'written proposal contents, consolidated-feedback procedure, post-discovery asset list' to a new TODO-FOR-OWNER.md and soften any the owner cannot confirm.

125. **[minor · a11y] Step list is announced with double numbering and no step state for assistive tech** *(added on re-check)*  
   Where: components/ProcessFaq.tsx:18-21  
   Evidence: The steps are an ol whose li each start with a visible span containing '01' to '04', which is not aria-hidden. A screen reader announces '1 of 4, 01, Discover'. The decorative track div is not aria-hidden either, although it is empty so harmless.  
   Fix: Add aria-hidden="true" to the number badge span, since the ol already conveys order, and to the track wrapper.

*Dropped on re-check (could not be reproduced):* Progress line intermittently stuck at 0% on fresh loads (desktop)

## 8. Final CTA + Footer

Section 7 is a static dark block in /Users/raghusai/Desktop/CLAUDE 2.0/MAKENDLESSNWEBSITE/components/FinalCta.tsx: two radial gradients, three thin SVG lines pulsing opacity, the correct headline and line, and one white pill CTA, followed by a plain four-column footer. Everything functional works: the CTA and all 10 footer links navigate to real 200 pages by click and keyboard, there is no horizontal page scroll at 360-1440, and there are no contact details at all (none invented). It falls short in two ways: the headline word "remembering." is cut off by the section edge at 360 and 768 (and off-centre at 390), and the closing is not the cinematic 3D/brand-motion finale the spec asks for (no canvas, no entrance or scroll motion). One console 404 for an unidentified resource was logged during the homepage run; I did not trace it.

**Keep as-is:**
- Exact spec copy: headline "Let's make something worth remembering." and line "Tell us what you're building. We'll help you take the next step." (FinalCta.tsx:32-33)
- Prism gradient on "worth remembering." at 1440: strong, on-brand, reads well (docs/audit/1440-home-07-final-cta.png)
- CTA "Start a Project" works: click and Enter both land on /contact; 285x60px target; hover turns lilac and scales 1.05; visible 2px aqua focus ring
- All 10 footer links work and return 200: / , /create, /build, /grow, /studios, /about, /faq, /contact, /privacy, /terms; each page shows its own h1, no 404s
- Footer contains every required item: MAKENDLESS wordmark, CREATE, BUILD, GROW — Beta, (All) studios, About, FAQ, Contact, Privacy, Terms
- No invented contact details: footer has no email, phone, address or social links; a grep for mailto/tel/social across app, components and data found only the env-driven NEXT_PUBLIC_CONTACT_EMAIL in ContactForm.tsx
- Honest copyright line: "© 2026 MAKENDLESS. Creative & Technology Studio." with no Ltd/Inc/trademark claim
- Footer semantics: three <nav> landmarks with aria-labels, logical tab order (wordmark, Studios, Company, Legal), focus ring on every link
- Same Footer component is reused on inner pages via PageShell (10 links present on /create, /studios, /contact, /privacy)
- Light section 6 into dark section 7 alternates correctly (previous section background rgb(246,247,252))
- No horizontal page overflow at 360, 390, 768, 1024, 1440 (scrollWidth - innerWidth = 0)
- Footer column layout at 1440 and stacked layout at 390 are clean and legible; Syne only

**Findings:**

126. **[blocker · mobile-break] Headline word "remembering." is cut off at 360px and 768px**  
   Where: components/FinalCta.tsx:32 (h2#cta-title, classes text-[2rem] sm:text-6xl md:text-7xl) inside section with overflow-hidden (line 27); http://localhost:3456 at 320, 360 and 768 wide  
   Evidence: Measured span rect for "remembering.": left 20 to right 377 at 360 viewport (17px past the edge) and at 320; left 32 to right 835 at 768 viewport (67px past the edge). h2 scrollWidth 357 vs clientWidth 320 at 360; 803 vs 704 at 768. Screenshots docs/audit/tmp/finalcta-360-cta2x.png and docs/audit/tmp/finalcta-768-cta.png show the final "g." sliced off by the section edge.  
   Fix: Size the headline fluidly so the longest word always fits, e.g. font-size clamp(1.6rem, 8.2vw, 4.5rem) with the md step moved to lg, or drop to text-[1.75rem] below 390 and text-6xl at 768. Verify at 320, 360, 390, 768, 1024.

127. **[major · mobile-break] Headline sits off-centre at 390px, touching the right edge**  
   Where: components/FinalCta.tsx:32; http://localhost:3456 at 390 wide  
   Evidence: "remembering." spans x=20 to 377 in a 390 viewport: 20px gutter on the left, 13px on the right, wider than the 350px h2 box (scrollWidth 357). Visible in docs/audit/390-home-07-final-cta.png where the full stop nearly touches the edge while every other line is centred.  
   Fix: Same fluid font-size fix as above; the word must fit inside the 20px gutters so text-align:center can actually centre it.

128. **[major · off-spec] No real 3D or cinematic closing: section is two gradients and three lines**  
   Where: components/FinalCta.tsx:27-35; section[aria-labelledby=cta-title]  
   Evidence: No canvas inside the section at any width (canvasInSection false; the only dynamic 3D import in components is Hero3D in Hero.tsx:7). Decoration is two radial-gradients (line 28) and an SVG of three straight lines at 30% opacity (lines 29-31). Spec asks for a "refined cinematic closing" and permits real 3D here depicting devices, frames or timelines. docs/audit/1440-home-07-final-cta.png reads as a generic dark SaaS CTA band.  
   Fix: Add one studio-specific closing visual behind or beside the headline: e.g. a lazy-loaded R3F scene reusing the Hero3D phone/laptop/Slab pieces settling into a final frame, or a timeline strip whose playhead reaches the end ("EXPORT") as the section scrolls in. Load after text, lower detail on phones, pause off-screen, still fallback, per the spec.

129. **[major · visual-weak] No brand motion: headline, line and CTA appear with no entrance or scroll animation**  
   Where: components/FinalCta.tsx:32-34  
   Evidence: The component is a server component with no motion import. Measured in the section: 0 elements with a CSS animation, 0 elements with inline transform/opacity; the only animation is 3 SMIL <animate> opacity pulses on the lines. Spec quality bar asks for kinetic typography, mask reveals and scroll-driven transitions.  
   Fix: Give the closing its own motion signature distinct from other sections: a mask or per-word reveal on the headline when it enters view, the prism gradient sweeping across "worth remembering.", and the CTA arriving last. Use the existing `motion` dependency; keep a calm reduced-motion variant.

130. **[major · a11y] Footer link touch targets are 19px tall**  
   Where: components/FinalCta.tsx:16 (footer li a, ul space-y-3); 360 and 390 widths  
   Evidence: Every footer text link measures 19px high (e.g. FAQ 30x19, BUILD 46x19) with 12px between rows, so the tappable pitch is about 31px; the footer wordmark link is 274x24. Spec requires touch targets of at least 44px.  
   Fix: Make links block/inline-flex with min-h-11 and items-center (or py-3) and drop space-y-3 so each row is a 44px target; give the wordmark link py-2.5.

131. **[minor · visual-weak] The three diagonal lines are abstract decoration, barely visible and cut by the nav**  
   Where: components/FinalCta.tsx:29-31 (svg, opacity-30, w-[900px])  
   Evidence: In docs/audit/1440-home-07-final-cta.png and docs/audit/390-home-07-final-cta.png the lines fan from the top centre, pass behind the headline letters and stop mid-section; they do not depict any studio work (device, frame, timeline) and read as leftover scaffolding.  
   Fix: Replace with a motif that means something for the studio (timeline ticks and playhead, frame corner marks, a browser outline) or remove once the closing visual above exists.

132. **[minor · visual-weak] Final CTA and footer are the same flat colour, so the page end has no distinct close**  
   Where: components/FinalCta.tsx:11 and :27 (both bg-[#0c1024])  
   Evidence: Computed background of the CTA section and the footer are both rgb(12,16,36), separated only by a 1px white/10 border; the violet glow is hard-cut at that border (docs/audit/tmp/finalcta-1440-footer-focus.png). Spec says no two neighbouring sections may look alike.  
   Fix: Differentiate the footer: let the glow bleed into it, use the surface token #202342 or a darker tone, or add a large cropped MAKENDLESS wordmark as the footer's signature element.

133. **[minor · a11y] SVG line animation keeps running under prefers-reduced-motion**  
   Where: components/FinalCta.tsx:30 (<animate repeatCount="indefinite">); app/globals.css:34-36  
   Evidence: With reduced motion emulated, svg.animationsPaused() is false and line opacities changed from 0.77/0.55/0.32 to 0.75/0.98/0.80 over 1.7s. The global reduced-motion rule only shortens CSS animations and transitions; it does not touch SMIL.  
   Fix: Drive the pulse with a CSS keyframe class (covered by the existing media query) or render the <animate> only when reduced motion is not requested.

134. **[minor · off-spec] Footer says "All studios" where the spec lists "Studios"**  
   Where: components/FinalCta.tsx:6  
   Evidence: Footer text read from the DOM: "STUDIOS | CREATE | BUILD | GROW — Beta | All studios". The link works (/studios, 200) and the column heading is "Studios", but the heading is not a link.  
   Fix: Either rename the link to "Studios" or leave as is with owner approval; no functional change needed.

135. **[minor · a11y] Small footer text is 12px muted grey**  
   Where: components/FinalCta.tsx:15 and :19 (text-xs text-[#a4aac7])  
   Evidence: Column headings and the copyright line compute to 12px in rgb(164,170,199) at every width; contrast is adequate on #0c1024 but the size is small on phones (docs/audit/390-home-08-footer.png).  
   Fix: Raise the copyright line to 13-14px on mobile; keep the tracked uppercase headings at 12px if desired.

136. **[minor · visual-weak] Footer wordmark does not line up with the nav wordmark at desktop** *(added on re-check)*  
   Where: components/FinalCta.tsx:12 (footer container max-w-7xl, px-5 md:px-8) vs the nav container in components/Nav.tsx; 1440 wide  
   Evidence: In docs/audit/tmp/verify-finalcta-focus2.png the header wordmark starts at about x=113 while the footer wordmark, column grid and copyright start at x=80. The two brand marks are on screen together at the end of the page, so the 33px offset is visible.  
   Fix: Use the same container width and side padding for the footer as the nav (or the reverse) so both wordmarks share one left edge.

137. **[minor · mobile-break] At 320px the Start a Project button wraps to two lines** *(added on re-check)*  
   Where: components/FinalCta.tsx:34 (px-10 py-4 text-lg inline-block); 320 wide (below the spec's 360 minimum)  
   Evidence: Measured CTA box 280x88 at 320 versus 285x60 at 360 and up: the label breaks onto two lines and the pill fills the whole content width. The headline is also clipped at this width (line spans 20..377 in a 320 viewport). Page scrollWidth is 331 at 320, but that overflow comes from the Studios cards, outside this scope.  
   Fix: Add whitespace-nowrap and reduce horizontal padding on the smallest screens (e.g. px-7 sm:px-10); covered for the headline by the fluid font-size fix.

138. **[minor · a11y] Footer column labels are h2 headings on every page** *(added on re-check)*  
   Where: components/FinalCta.tsx:15 (<h2> inside each <nav aria-label>)  
   Evidence: Heading list read from the DOM ends: H2 "Let's make something worth remembering.", H2 "Studios", H2 "Company", H2 "Legal". The three footer labels sit at the same level as the page's section headlines, and each nav already has an aria-label with the same text, so screen-reader heading navigation gets three extra top-level sections on all ten pages.  
   Fix: Render the labels as <p> (the nav aria-label already names the group) or as h3.

## 9. Start a Project form

The /contact page is a generic PageShell (eyebrow + H1 + intro) followed by a bare four-field form (Name, Email, service select, message) in components/ContactForm.tsx (49 lines). Client validation works and the no-backend result is literally honest (no network request, text says "was not sent anywhere"), but there is no loading state, no real error state, no usable success path, and the result panel shows developer text (an env var name) to the visitor and dead-ends them. Query-string preselection only half works (?service= maps to the studio, package name is dropped; ?for= does nothing at all), the H1 causes sideways scrolling at 360 and 390, and the form is absent from the server HTML. Visually it is the weakest, most template-looking page on the site: a single narrow column on a flat dark background with a 160px dead gap above it.

**Keep as-is:**
- Honesty baseline: with no NEXT_PUBLIC_CONTACT_EMAIL, a valid submit makes zero non-GET requests (measured) and the panel explicitly says the message 'was not sent anywhere'. No false 'sent' message. Keep that principle, rewrite the wording.
- The validation rules and friendly error copy ('Please tell us your name.', 'Enter a valid email address.', 'Tell us a little more (at least 10 characters).') and the noValidate + custom-message approach.
- aria-invalid toggles correctly per field and aria-describedby points at the error span once it exists (name/email/message).
- Every control is wrapped in a <label>, so all four have accessible names; autocomplete=name/email are set; email input is type=email.
- Keyboard: logical tab order (skip link, nav, name, email, select, textarea, button), Enter in an input submits, and all controls show the 2px #22d3ee focus-visible outline (globals.css:26).
- Touch sizing: inputs 54px, select 51px, button 56px tall; 16px input font size so iOS does not zoom on focus; full-width submit button on mobile.
- Syne is applied to inputs, select and labels (computed font-family verified); one H1; page title 'Start a Project — MAKENDLESS'.
- Spec copy is used verbatim: 'Let's make something worth remembering.' / 'Tell us what you're building. We'll help you take the next step.'
- GROW option is honestly labelled 'GROW — Digital marketing (beta interest)'.
- ?service=create|build|grow (and create-starter etc.) correctly preselects the studio in the select.
- No invented contact details, response times or policies anywhere on the page.

**Findings:**

139. **[blocker · off-spec] Result panel shows developer text to the visitor and is a dead end**  
   Where: components/ContactForm.tsx:31-37; screenshot docs/audit/tmp/contact-1440-valid-result.png  
   Evidence: After a valid submit the form is replaced by: 'Form checked. Delivery channel pending. The inquiry inbox isn't connected yet, so this message was not sent anywhere. The team needs to set NEXT_PUBLIC_CONTACT_EMAIL or a form backend before launch.' It is honest, but it exposes an environment variable name to customers, discards everything the visitor typed (form unmounted, no state kept), and the panel contains 0 links/buttons (measured: resultDom.links = 0) - no way back to the form, no copy of the brief, no next step. The spec asks for a fully built success state AND an honest one; this is a developer placeholder, not a designed state.  
   Fix: Keep the honesty, redesign the state for a customer: a designed 'Your brief is ready - but not sent' panel that shows a readable summary of what they entered, a 'Copy brief' button (clipboard), an 'Edit brief' button that restores the form with values intact, and plain wording such as 'Online sending isn't switched on yet, so nothing has been sent.' Remove the env var name from user-facing copy (keep it in README/TODO-FOR-OWNER). Build the real success state ('Brief received') behind a delivery flag so it can never render while no delivery service is configured.

140. **[blocker · missing] No loading state and no submission-error state exist**  
   Where: components/ContactForm.tsx:11-29 (only `err` and `done` state)  
   Evidence: State is just err + done. Submit to result took 69ms with no pending UI; the button never disables or changes label; there is no code path for a failed delivery (no try/catch, no error panel, no retry). Spec: 'Fully built: fields, validation, loading, success and error states.'  
   Fix: Model status as idle | validating/submitting | success | not-delivered | error. Add a submit adapter (single function returning ok / not-configured / failed) with no service wired. While pending: disable the button, aria-busy on the form, label 'Checking your brief...'. Error state: role=alert panel with the visitor's data preserved and a Retry button. Not-configured maps to the honest 'not sent' panel; success is only reachable when the adapter reports real delivery.

141. **[blocker · mobile-break] Sideways scrolling at 360 and 390: H1 word 'remembering.' overflows the viewport**  
   Where: components/PageShell.tsx:8 (h1 text-4xl) on /contact at 360 and 390; screenshots docs/audit/390-page-contact.png, docs/audit/tmp/contact-390-top2.png  
   Evidence: Measured at both 360 and 390: documentElement.scrollWidth = 421 vs clientWidth 360/390; h1 font 36px, h1.scrollWidth 401 > clientWidth 320/350; the gradient span's second line spans x=20 to 421. The screenshot shows 'remembering' cut off at the right edge with the full stop lost, and the existing 390 audit screenshot is 421px wide for the same reason. Spec: 'No sideways scrolling.' (Side effect seen in testing: the widened layout viewport offsets the visual viewport, so coordinate taps landed 64px off.)  
   Fix: Use a fluid size for the page H1, e.g. font-size: clamp(1.75rem, 8.2vw, 3.75rem) so 'remembering.' fits in 320px of content width at 360, and add overflow-wrap: anywhere / hyphens as a safety net. Re-measure scrollWidth === clientWidth at 360, 390 and 768.

142. **[major · broken-control] ?for= preselection does nothing (Solutions section CTA context is lost)**  
   Where: components/ContactForm.tsx:10 and :44; link source components/Solutions.tsx:44  
   Evidence: Solutions links to /contact?for=creator|local|startup|store. ContactForm does `(service || for || 'other').split('-')[0]` and then checks it against create/build/grow/other, so every ?for= value falls back to 'Not sure yet'. Measured: ?for=local, ?for=creator, ?for=startup, ?for=store all give select value 'other', no other visible change on the page.  
   Fix: Add a real 'I am a...' field (Content creator / Local business / Startup / Online store / Other - values from data/site.ts solutions) and preselect it from ?for=. Optionally also preselect the studio from that solution's first recommended service. Show a small removable context chip, e.g. 'Starting as: Local business'.

143. **[major · broken-control] Package name from 'Request Quote' links is thrown away**  
   Where: components/ContactForm.tsx:10; link source components/Packages.tsx:31  
   Evidence: Packages links to /contact?service=create-starter, create-creator, create-professional, create-custom (hrefs read from the live homepage). The form keeps only the part before the first hyphen: ?service=create-starter gives select 'create', textarea empty, and no mention of 'Starter' anywhere on the page (visibleContext false). A visitor who clicked a specific package arrives at a form that has forgotten it, and the mailto body (line 25) would not include it either.  
   Fix: Parse studio and package separately, validate both against data/site.ts, and add a dependent 'Package' select (options for the chosen studio plus 'Not sure / Custom') preselected from the query. Show it in the brief summary and include it in the submitted payload.

144. **[major · missing] Form is too thin for a real project brief**  
   Where: components/ContactForm.tsx:42-46 (fields: name, email, service, message only)  
   Evidence: DOM field list is exactly [name, email, service, message]. Nothing captures who the customer is, which package, project type, existing links, timing or budget, so every inquiry would need a follow-up round. No field is marked required or optional (0 elements with required/aria-required), and there is no helper text or placeholder guidance on the message box.  
   Fix: Add, without inventing any policy or figure: (1) Customer type (four spec types + other); (2) Package / service detail driven by data/site.ts (V1-V5, T1-T5, M1-M3 as multi-select chips per studio); (3) Business or channel name (optional); (4) Links - current website, channel or sample footage (optional URL field); (5) Timing as free text or neutral choices ('As soon as possible / Within a month or two / Flexible / Not sure') with no promised delivery times; (6) Budget as an optional free-text field ('Share a rough budget if you have one') - do NOT add price brackets, since no prices are approved; (7) Preferred contact method only if the owner approves phone/WhatsApp (owner decision); (8) A consent line linking to /privacy. Mark required fields visibly and with aria-required, and add a short hint under the message field (what to include). Consider a 2-3 step layout (You / Project / Details) so the longer form stays calm on mobile.

145. **[major · visual-weak] Page looks like an unstyled template: single narrow column, 160px dead gap, half the screen empty**  
   Where: app/contact/page.tsx:8-9, components/PageShell.tsx:5-12; screenshots docs/audit/1440-page-contact.png, docs/audit/tmp/contact-1440-preselect-build.png  
   Evidence: At 1440 the form occupies x=208-880 and the right ~45% of the page is empty flat #0c1024. Measured gap between the hero text block and the form: 160px (pb-16 + py-24 of two stacked same-colour sections). At 1440x900 the first field starts at y=620, so only Name, Email and the top of the select are above the fold. Header and body are the same dark colour, so the spec's dark/light alternation and 'portfolio-grade, not a template' bar are not met. The select uses the native browser chevron, which looks out of place against the custom rounded fields.  
   Fix: Recompose as a two-column layout at >=1024: form on the left, on the right a sticky 'What happens next' rail built from the existing DISCOVER / DESIGN / CREATE / DELIVER steps plus a live brief summary that fills in as the visitor types (CSS/SVG only, no 3D on this page per spec). Pull the form up so it starts above the fold (cut the gap to ~48px or merge the sections). Put the form on a light paper (#F6F7FC) card or section for contrast with the dark header. Replace the service select with three large studio choice cards using the division accents (aqua / violet / lilac, GROW tagged Beta), and style any remaining select with appearance-none plus a custom chevron.

146. **[major · a11y] Errors are not announced and focus is not managed**  
   Where: components/ContactForm.tsx:22-23, 42-45  
   Evidence: After an empty submit: 0 elements with role=alert or aria-live in the document, and document.activeElement stays on the BUTTON (measured) - a screen-reader user hears nothing. After a successful submit the focused button is unmounted and focus drops to BODY; the role=status div is inserted already populated, which many screen readers do not announce. At 768 the first error ended up at y=97 only by luck of scroll position; nothing scrolls the first invalid field into view.  
   Fix: On failed validation, focus the first invalid field (and scroll it into view with scroll-margin for the fixed header) and render a role=alert summary above the form ('3 fields need attention') with links to each field. On result, move focus to the result heading (tabIndex=-1) and keep a persistent, initially empty live region that the message is written into.

147. **[major · content-honesty] Visitor is only told that nothing gets sent after writing the whole brief** *(added on re-check)*  
   Where: app/contact/page.tsx:8 (intro) and components/ContactForm.tsx:41-47; screenshots docs/audit/tmp/verify-contact-390-top.png, verify-contact-1440-result.png  
   Evidence: The page intro says "Tell us what you're building. We'll help you take the next step." and the button says 'Start a Project'. Nothing on the form before submit says delivery is not connected. Only after a valid submit does the panel say 'this message was not sent anywhere', at which point the typed text is discarded. The post-submit message is honest, but the page before submit implies a working inquiry channel. The panel also uses the aqua success-style tint with role=status, so at a glance it reads as a confirmation.  
   Fix: While no delivery adapter is configured, show a calm notice above the form or next to the button (for example 'Online sending isn't switched on yet. You can prepare your brief here and copy it.') and label the button to match (for example 'Review my brief'). Give the not-delivered panel a neutral or amber treatment, distinct from the real success state. Drive both from one 'delivery configured' flag.

148. **[major · broken-control] 'Join the beta list' buttons lead to the generic project form; no beta list flow exists** *(added on re-check)*  
   Where: components/StudioPage.tsx:19, components/Packages.tsx:32 -> /contact?service=grow; components/ContactForm.tsx:44-46  
   Evidence: Opening /contact?service=grow only sets the select to 'GROW — Digital marketing (beta interest)'. The heading, intro, message label ('Tell us what you're building', minimum 10 characters required) and the 'Start a Project' button are unchanged, and submitting ends in the same 'not sent anywhere' panel. A CTA that promises joining a list delivers a project brief form that records nothing.  
   Fix: When service=grow, switch the form to a beta-interest variant: heading and button 'Register beta interest', message optional, a visible GROW Beta tag, and the same honest not-delivered handling. Alternatively rename the CTAs to 'Register interest' until a list actually exists, and record the list as an owner decision in TODO-FOR-OWNER.md.

149. **[minor · a11y] Error text is nested inside the <label>, polluting the accessible name; aria-describedby points at missing ids when valid**  
   Where: components/ContactForm.tsx:42-45  
   Evidence: After an empty submit the Name input's label text is 'NamePlease tell us your name.' (input.labels[0].textContent), so the error is read as part of the name and again as the description. In the initial state aria-describedby references e-name / e-email / e-msg, none of which exist in the DOM (measured exists:false).  
   Fix: Use <label htmlFor> + sibling input + sibling error <p id> outside the label; only set aria-describedby when the error (or a hint) is rendered. Add aria-required='true' to required fields.

150. **[minor · broken-control] Errors do not clear when the visitor fixes the field**  
   Where: components/ContactForm.tsx:14-23 (validation only inside submit)  
   Evidence: With 'bad@email' flagged, typing '.com' to make it valid left 'Enter a valid email address.' and aria-invalid=true in place (measured afterFixTyping) until the next submit.  
   Fix: Make fields controlled (also needed to preserve values across states) and re-validate a field on change once it has been flagged, or on blur.

151. **[minor · performance] Form is missing from server HTML (blank until JS hydrates)**  
   Where: app/contact/page.tsx:9 (<Suspense fallback={null}>) + useSearchParams in ContactForm.tsx:9  
   Evidence: curl of /contact returns 0 occurrences of '<form' and contains BAILOUT_TO_CLIENT_SIDE_RENDERING; with JavaScript disabled the page has no form at all (noJS.form = false). The main content of the page pops in after hydration with an empty hole before it.  
   Fix: Render the form on the server: read searchParams in the page (server component) and pass initial values as props, or at minimum give Suspense a skeleton fallback with the same dimensions. Add a <noscript> note.

152. **[minor · broken-control] Validation is loose and inputs are unbounded**  
   Where: components/ContactForm.tsx:19-21  
   Evidence: Name 'X', email 'a@b.c' and message 'aaaaaaaaaa' pass and reach the result panel (junkAccepted = true). No maxlength on any field (0 elements with maxlength). Submit button has no explicit type attribute.  
   Fix: Trim values, require a 2+ character TLD, add sensible maxlength (name 80, message ~2000 with a live counter), and set type='submit' explicitly. When a delivery service is later approved, add a honeypot field.

153. **[minor · content-honesty] mailto branch (if the env var is set) claims the mail app is opening without knowing**  
   Where: components/ContactForm.tsx:24-28, 34-35 (code path not active in the running build)  
   Evidence: Code reading only: when NEXT_PUBLIC_CONTACT_EMAIL is set, the form sets window.location.href to a mailto: URL and replaces itself with 'Your email app should be opening.' If no mail client is configured nothing happens, the typed brief is gone, and the address is never shown as a fallback. The mailto body also omits any package/customer-type context.  
   Fix: In that branch keep the brief on screen, show the address as visible selectable text with 'Copy address' and 'Copy brief' buttons, and word it as 'If your email app didn't open, copy the brief below and email it to ...'. Never describe this as sent.

154. **[minor · missing] favicon.ico returns 404**  
   Where: http://localhost:3456/favicon.ico (observed while loading /contact)  
   Evidence: Console error 'Failed to load resource: 404' and response log shows /favicon.ico 404 on the contact page load.  
   Fix: Add app/icon.svg (or favicon.ico) with the MAKENDLESS mark.

155. **[minor · a11y] Invalid fields have no visual error state on the field itself** *(added on re-check)*  
   Where: components/ContactForm.tsx:39, 42-45; screenshot docs/audit/tmp/verify-contact-1440-empty.png  
   Evidence: The 'field' class has a fixed border-white/15 and there is no aria-invalid styling. In the screenshot the invalid textarea and the valid select have identical borders; the only signal is small pink text (rgb(255,138,160)) below the field, with no icon. The error is carried by colour and position alone and is easy to miss on a long mobile form.  
   Fix: Style [aria-invalid='true'] with an error border or ring and add a small icon or 'Error:' prefix to the message. Keep the existing 2px cyan focus outline, which works well.

156. **[minor · missing] No privacy link or data-use note beside a form that collects name and email** *(added on re-check)*  
   Where: components/ContactForm.tsx:41-47; app/contact/page.tsx  
   Evidence: The form contains only four fields and a button. The only link to /privacy on the page is in the footer (footer hrefs: /, /create, /build, /grow, /studios, /about, /faq, /contact, /privacy, /terms). Nothing near the submit button says how the details will be used.  
   Fix: Add one line under the button linking to /privacy, worded to match whatever the existing Privacy page says. Do not invent a retention or response policy; anything undecided goes to TODO-FOR-OWNER.md.

## 10. Internal pages

The eight internal pages are thin wrappers around one shared component, components/PageShell.tsx (16 lines): a dark hero band with the same violet top-right glow, one content block, and the footer. /create, /build and /grow are 4-line files rendering the same StudioPage.tsx (22 lines), differing only in the bullet/eyebrow accent colour and data. Measured across 360/390/768/1440: every page has 0 running animations, 0 img/video/canvas/svg in main, and 70-197 words. Content is honest and all links work, but two H1s are clipped on phones and none of the pages is portfolio-grade or has a division identity.

**Keep as-is:**
- Service catalogue is accurate and complete against the spec: V1-V5, T1-T5, M1-M3 all render from data/site.ts (single source of truth), with no invented prices, timelines, revision counts, clients or statistics on any internal page.
- GROW Beta labelling on /grow: eyebrow 'GROW · BETA', the lilac disclaimer box ('Nothing here is a guarantee of leads, sales or return on ad spend'), and the CTA wording 'Join the beta list' (components/StudioPage.tsx:8-9,19). Keep the wording; restyle only.
- Studio CTAs work and pre-select the form: clicking the CTA on /create, /build, /grow lands on /contact?service=<id> with the select set to 'CREATE — Video editing', 'BUILD — Website development', 'GROW — Digital marketing (beta interest)' respectively (verified by puppeteer).
- About copy is honest and on-spec: 'small team of video editors, web developers and client managers', no names, no headcount, no incorporation/trademark claims, no awards (app/about/page.tsx:12).
- FAQ answers cover all six spec topics without inventing guarantees ('We don't promise timelines we haven't scoped'); light editorial FAQ body with hairline dividers reads calm and clean at 1440 and 390.
- Privacy/Terms are openly labelled 'Draft placeholder. Requires owner and legal review before launch.' — no invented policy text.
- Syne is the only computed font family on all 8 pages at all 4 widths.
- Keyboard basics: skip link is first tab stop, every link shows a 2px solid cyan focus outline, whole studio card on /studios is a single focusable link; mobile menu button is 44x44 with aria-expanded.
- Per-page <title> template ('CREATE — MAKENDLESS' etc.) and the footer link set matching the spec (CREATE, BUILD, GROW — Beta, Studios, About, FAQ, Contact, Privacy, Terms).
- Typed data model in data/site.ts (studios, packages, solutions, process, faqs) — richer pages should be built on it rather than replacing it.

**Findings:**

157. **[blocker · mobile-break] /build H1 'Website Development' is clipped off-screen on phones**  
   Where: components/PageShell.tsx:8 (h1 text-4xl, no wrap/clamp); http://localhost:3456/build at 360 and 390  
   Evidence: Measured h1 scrollWidth 391px vs clientWidth 350px at 390 (320px at 360); documentElement scrollWidth 411 vs clientWidth 390/360. body has overflow-x:hidden (globals.css:22) so the word is simply cut: docs/audit/390-page-build.png shows 'Development' with the final 't' chopped at the right edge.  
   Fix: Use a fluid heading size in PageShell (e.g. text-[clamp(1.75rem,8.5vw,3.75rem)]) plus overflow-wrap/hyphens or text-balance, and verify the longest single word ('Development', 'possibilities.') fits at 360. Do not rely on body overflow-x:hidden to mask overflow.

158. **[blocker · off-spec] CREATE, BUILD and GROW pages are one identical template — no division visual or motion identity**  
   Where: components/StudioPage.tsx:1-22; app/create|build|grow/page.tsx (4 lines each); docs/audit/1440-page-create.png vs 1440-page-grow.png  
   Evidence: The three pages share the same hero band, same #202342 rounded-3xl cards in a 2-col grid, same white pill CTA. The only per-division difference is the 6px bullet and code-label colour (s.accent). Measured on all three at every width: document.getAnimations().length = 0, media elements in main = 0. Spec: 'Each division has its own visual and motion identity' and 'Portfolio-grade ... not a template'.  
   Fix: Keep StudioPage's data plumbing but give each division its own hero and section treatment using CSS/SVG/video motion (no R3F — spec restricts 3D to homepage sections): CREATE = timeline/playhead, vertical reel frames, caption-pop kinetic type in aqua; BUILD = wireframe-to-UI grid, browser chrome, responsive resize motif in violet; GROW = clearly 'Illustrative demo' ad-card/calendar motif in lilac with no numbers. Reuse the homepage Studios/Transformation preview pieces.

159. **[blocker · mobile-break] /studios card headings overflow their cards at 768 (and marginally at 1024)** *(added on re-check)*  
   Where: app/studios/page.tsx:9-13 (md:grid-cols-3 with text-2xl h2); http://localhost:3456/studios at 768 and 1024  
   Evidence: At 768: h2 'Website Development' scrollWidth 260 vs clientWidth 171, 'Digital Marketing' 193 vs 171, card link 284 vs 219. Screenshot docs/audit/tmp/internalverify-768-studios.png shows 'Developme…' running out of the BUILD card under the GROW card, and 'Marketing' touching the GROW card edge. At 1024 'Website Development' is still 260 vs 257. The auditor only measured the H1 at phone widths.  
   Fix: Keep one column until lg (or two columns at md), and/or use a fluid h2 size with overflow-wrap so 'Development' fits; re-measure at 768 and 1024.

160. **[major · mobile-break] /studios H1 'possibilities.' overflows at 360px**  
   Where: app/studios/page.tsx:8 + components/PageShell.tsx:8; http://localhost:3456/studios at 360  
   Evidence: h1 scrollWidth 342 vs clientWidth 320; document scrollWidth 362 vs 360. Screenshot docs/audit/tmp/internal-360-studios.png shows the full stop of 'possibilities.' touching/cut by the right edge. Fits at 390 (350/350) with zero spare room.  
   Fix: Same fluid H1 clamp as above; test at 360.

161. **[major · missing] Studio pages are content-thin: three bullets per service, nothing else**  
   Where: components/StudioPage.tsx:10-19; /create /build /grow  
   Evidence: Main word counts (incl. nav/footer text): /create 129, /build 119, /grow 114. No packages (data/site.ts:68-85 has 4 CREATE, 5 BUILD, 1 GROW package that are never shown here), no process steps, no who-it's-for, no concept demo, no FAQ, no cross-link to other studios, a single CTA at the very bottom. 5 cards in a 2-col grid leave an orphan card and an empty half-row at 1440 (1440-page-create.png, 1440-page-grow.png).  
   Fix: Build each studio page from existing data: service catalogue (fix the orphan with a 3+2 / featured-first layout), the division's packages with 'Request Quote' links (/contact?service=<id>-<package>), relevant customer types from solutions, the 4-step process, a 'Concept demo' visual, 2-3 relevant FAQs, and next/previous studio links. Add a CTA in the hero as well as at the end.

162. **[major · visual-weak] All eight pages are the same dark shell with the same violet corner glow**  
   Where: components/PageShell.tsx:5,12  
   Evidence: Section backgrounds measured: /studios, /create, /build, /grow, /about = rgb(12,16,36) hero + rgb(12,16,36) body + dark footer (three consecutive identical dark blocks, no boundary). Only /faq, /privacy, /terms pass light. Hero uses one hard-coded radial-gradient(… rgba(111,69,246,.35)) for every page, and the eyebrow is always #08bbd4 — so the BUILD and GROW eyebrows are aqua (CREATE's colour) instead of violet/lilac (see 1440-page-grow.png 'GROW · BETA' in aqua). Spec: dark and light sections must alternate; avoid a uniformly dark site and repetitive glows.  
   Fix: Give PageShell an accent prop (eyebrow + glow colour per division) and hero variants; alternate dark hero / light editorial body / dark CTA on the studio, studios and about pages; replace the repeated corner glow with division-specific art.

163. **[major · visual-weak] /studios overview is three small text cards — weaker than the homepage studios section it is linked from**  
   Where: app/studios/page.tsx:9-17; docs/audit/1440-page-studios.png  
   Evidence: Page body is 394px tall at 1440 (total page 1173px incl. footer), 82 words, three ~200px cards with verb, name, one-line tagline; no service list, no previews, no arrow/affordance, no CTA. The homepage 'Explore Services' button (components/Solutions.tsx:43) sends users here, but no services are listed. Hover is the only feedback (translate/border).  
   Fix: Make this a real overview: large gateway per studio with its service codes/titles (V1-V5, T1-T5, M1-M3), a preview visual, explicit 'Explore CREATE →' affordance, GROW Beta chip, and a closing Start a Project CTA. Reuse the homepage Studios gateway component at larger scale rather than a second, lesser card design.

164. **[major · visual-weak] About page is a three-card stub with no CTA or links**  
   Where: app/about/page.tsx:7-12; docs/audit/1440-page-about.png  
   Evidence: Body is 446px tall at 1440; three cards that repeat the studio taglines plus one paragraph. main contains zero links (mainLinks = []) — the cards are not linked to /create /build /grow and there is no Start a Project CTA. The Grow card has no Beta chip (beta is only mentioned in body text).  
   Fix: Expand with honest, non-invented content: how the studio works (process from data), principles (scope in writing, honest about beta, human review), who it serves, link each card to its studio page, add a Beta chip on Grow, end with a Start a Project CTA. No names, headcount or history unless the owner supplies them.

165. **[major · off-spec] No motion at all on any internal page**  
   Where: components/PageShell.tsx, StudioPage.tsx, app/*/page.tsx  
   Evidence: document.getAnimations().length = 0 on all 8 pages at all widths (and therefore no distinct reduced-motion variant either). Only interaction is a hover translate on /studios cards. Spec quality bar: 'Varied professional motion: kinetic typography, mask reveals, scroll-driven transitions'.  
   Fix: Add a mask/line reveal on the page H1, staggered reveal for service rows, and one division-specific looping CSS/SVG motif per studio page; gate all of it behind prefers-reduced-motion.

166. **[major · a11y] Footer links are 19px tall — below the 44px touch-target rule**  
   Where: components/FinalCta.tsx:16 (footer shown on every internal page); 360/390 widths  
   Evidence: Measured at 360 and 390: CREATE 58x19, BUILD 46x19, GROW — Beta 102x19, All studios 71x19, About 43x19, FAQ 30x19, Contact 58x19, Privacy 52x19, Terms 43x19, spaced by space-y-3 (12px). Header wordmark link is 246x28. Spec: touch targets >= 44px.  
   Fix: Make footer links block/inline-flex with min-h-11 and vertical padding (py-3) and drop the space-y; give the wordmark link min-h-11.

167. **[major · content-honesty] GROW 'Join the beta list' CTA leads to the generic project form — there is no beta list** *(added on re-check)*  
   Where: components/StudioPage.tsx:20; data/site.ts GROW tagline ('Join the beta list.'); components/ContactForm.tsx:35,46; /grow -> /contact?service=grow  
   Evidence: Clicked the /grow CTA at 1440: it lands on /contact?service=grow with H1 'Let's make something worth remembering.', the select preset to 'GROW — Digital marketing (beta interest)' and a submit button labelled 'Start a Project' (docs/audit/tmp/internalverify-1440-contact-from-grow.png). Nothing on the destination mentions a beta list, and ContactForm.tsx:35 states the inbox is not connected and the message 'was not sent anywhere'. The page promises a list that cannot currently be joined.  
   Fix: Reword to an honest action such as 'Register beta interest', and when service=grow change the contact heading and submit label to match. Keep the truthful 'not sent' result state until a delivery service is approved.

168. **[major · content-honesty] FAQ answers promise things the site cannot back up** *(added on re-check)*  
   Where: data/site.ts faqs (rendered by app/faq/page.tsx:9); components/ContactForm.tsx:35  
   Evidence: FAQ 1 says 'Use Start a Project… We'll follow up', but the form's own result text says the message was not sent anywhere, so no follow-up is possible. FAQ 4 says 'Revision limits are defined per package', but no package in data/site.ts carries a revision limit and the spec forbids inventing revision counts. FAQ 6 answers 'Yes' to ongoing support as a policy without owner confirmation.  
   Fix: Soften to what is true today (revisions and support are agreed in the written proposal), remove 'defined per package', and add these answers to TODO-FOR-OWNER.md for owner approval. Fix the follow-up promise once a delivery route exists.

169. **[minor · content-honesty] About page states an AI-usage policy the spec does not supply**  
   Where: app/about/page.tsx:12  
   Evidence: Copy: 'we use AI tools to move faster while people review every final result.' Nothing in docs/SPEC-WORKING.md states this practice; it reads as a process commitment ('every final result'). It is not an AI service offering, so it does not breach the no-AI-service rule, but it is an unverified claim.  
   Fix: Get owner confirmation or remove the sentence; list it in TODO-FOR-OWNER.md.

170. **[minor · visual-weak] FAQ page is a static copy of the six homepage FAQs with no next step**  
   Where: app/faq/page.tsx:8-10; docs/audit/1440-page-faq.png  
   Evidence: Same six items as data/site.ts:109-116 used on the homepage; no grouping, no links in main (mainLinks = []), the answer 'Use Start a Project…' is not a link, and the page ends without a CTA. Answer lines run the full 1024px measure (~150 characters per line at 1440).  
   Fix: Cap answers at ~65ch, link 'Start a Project' inline, add a 'Still have a question?' CTA band, and consider grouping (Getting started / Quotes & revisions / Delivery & support). Any extra questions need owner-approved answers.

171. **[minor · content-honesty] Legal placeholders are honest but would ship as-is, and Terms copy is grammatically off**  
   Where: app/privacy/page.tsx:6-7; app/terms/page.tsx:6-7; docs/audit/1440-page-privacy.png  
   Evidence: Both pages show one sentence in a 240px body. Terms reads 'has not yet approved formal Terms policy text' (templated string). No TODO-FOR-OWNER.md exists in the repo (find returned nothing) although the spec says missing items go there. Placeholder pages have no noindex.  
   Fix: Keep the honesty; fix wording ('formal Terms of Service text'), add robots noindex metadata to both until approved, add a link back to Contact, and create TODO-FOR-OWNER.md listing privacy/terms text.

172. **[minor · a11y] No current-page indication in navigation**  
   Where: components/Nav.tsx:27-29,42-44  
   Evidence: document.querySelectorAll('[aria-current]').length = 0 on every page; nav links are all the same muted colour regardless of route (see 1440-page-about.png — 'About' not highlighted). CREATE/BUILD/GROW pages also have no breadcrumb or back link to /studios.  
   Fix: Use usePathname to set aria-current='page' and an active style; add a 'Studios /' breadcrumb or sibling-studio switcher on division pages.

173. **[minor · a11y] Heading semantics: footer column labels are H2s; FAQ questions are not headings**  
   Where: components/FinalCta.tsx:15; app/faq/page.tsx:9  
   Evidence: Heading outline on /faq is H1 then H2 'Studios', H2 'Company', H2 'Legal' only — the six questions are dt elements, so the only H2s on the page are footer labels. Same footer H2s appear at the same level as service titles on studio pages.  
   Fix: Render footer labels as non-heading text (the nav already has aria-label) or H3; keep the dl but that is acceptable, or use h2 per question.

174. **[minor · missing] Every internal page shares the homepage meta description; no OG tags, favicon, robots or sitemap; default unstyled 404**  
   Where: app/layout.tsx:8-11; app/*/page.tsx metadata; app/ (no not-found.tsx, icon, robots.ts, sitemap.ts); public/ is empty  
   Evidence: meta description identical on all 8 pages; og:title absent; canonical absent; /favicon.ico 404 (console error logged on first load), /robots.txt 404, /sitemap.xml 404. /nope renders Next's default '404 — This page could not be found.' under the nav with no footer or link home (docs/audit/tmp/internal-1440-404.png).  
   Fix: Add per-page description + openGraph in each metadata export, app/icon, robots.ts, sitemap.ts, and a branded app/not-found.tsx using PageShell with links to Home/Studios/Contact.

175. **[minor · visual-weak] Hero band leaves large dead space and inconsistent heights**  
   Where: components/PageShell.tsx:5,12 (pb-16 + md:py-24)  
   Evidence: At 1440 there is ~160px of empty dark between the intro line and the first card on studio pages (1440-page-create.png: intro at y≈285, cards at y≈460) with no divider, since hero and body are the same colour. Hero heights vary 363-438px purely by H1 wrapping.  
   Fix: Tighten spacing or fill the hero with division art on the right; make the hero-to-body transition intentional (colour change, rule, or overlap).

176. **[minor · off-spec] GROW page title and H1 carry no Beta label** *(added on re-check)*  
   Where: app/grow/page.tsx:3 (metadata title 'GROW'); components/StudioPage.tsx:8 (H1 = s.name)  
   Evidence: document.title on /grow is 'GROW — MAKENDLESS'; the H1 is 'Digital Marketing' with Beta only in the small aqua eyebrow and the notice box below. The shared meta description does say '(beta)'. The spec requires GROW to be labelled Beta / Coming Soon everywhere, and the tab title and search-result title are the most visible labels.  
   Fix: Set the title to 'GROW (Beta)' and put a Beta chip beside the H1 on /grow, plus the Grow card on /about.

177. **[minor · a11y] Mobile menu does not close on Escape and has no direct studio links** *(added on re-check)*  
   Where: components/Nav.tsx:5-10,30-45; tested on /build at 390  
   Evidence: After opening the menu and pressing Escape, #mobile-menu was still in the DOM. The menu lists only Studios, About, FAQ, Contact, Start a Project (docs/audit/tmp/internalverify-390-menu.png), so on a phone CREATE/BUILD/GROW are reachable only via /studios or the 19px footer links. The spec asks for full keyboard support.  
   Fix: Add an Escape key handler that closes the menu and returns focus to the toggle; add CREATE, BUILD and GROW — Beta links under Studios in the mobile menu.

## Cross-cutting: honest content

Honest-content audit of the whole site: all 13 app/component .tsx files plus data/site.ts read line by line, and the rendered text of all 10 routes (plus 404, robots.txt, sitemap.xml, favicon.ico) dumped from the running build at 1440, with hero marketing mode checked at 1440/390/360. The site is largely honest: no prices, statistics, clients, reviews, awards, team names, contact details, real logos, external links, images, AI/chatbot service or incorporation/trademark claims were found, and the contact form never claims a message was sent. The real problems are (1) unapproved process/policy promises in the How-we-work steps and FAQ, one of which contradicts the package cards, (2) a "Join the beta list" promise with no list behind it, (3) GROW demo labelling that is missing, off-wording or illegibly small in several places, (4) "Concept demo" captions missing from the Live Transformation demos, and (5) no TODO-FOR-OWNER.md exists although the spec requires it. Evidence scripts and screenshots are in /Users/raghusai/Desktop/CLAUDE 2.0/MAKENDLESSNWEBSITE/docs/audit/tmp/ (honest-dump.mjs, honest-measure.mjs, honest-*.png).

**Keep as-is:**
- No invented prices anywhere: every package CTA is 'Request Quote' (components/Packages.tsx:32) and the intro says prices are confirmed per proposal.
- No statistics, client names, testimonials, reviews, awards, team member names, team size number, phone, email, address or social links anywhere in rendered text; zero external/mailto/tel links and zero img/video/audio elements on all 10 routes (honest-dump.mjs output).
- No AI automation / chatbot / AI assistant service is offered anywhere; no 'Inc/LLC/Ltd/registered/TM/(R)' claims.
- Contact form never fakes a send: with no email configured it says 'this message was not sent anywhere' (components/ContactForm.tsx:34-35, screenshot docs/audit/tmp/contact-1440-valid-result.png). Keep the honesty, only reword it.
- GROW Beta labelling is present on: hero tab (BETA badge + aria-label 'Digital Marketing — Beta'), hero supporting line, home studio card (BETA pill + aria-label '(Beta)'), Transformation tab, Packages tab, footer 'GROW — Beta', /studios card 'GROW · BETA', /grow eyebrow 'GROW · Beta', contact select '(beta interest)', Solutions chips 'Marketing (beta)', meta description '(beta)'.
- /grow disclaimer banner: 'Nothing here is a guarantee of leads, sales or return on ad spend.' (components/StudioPage.tsx:9) and Packages beta note 'No campaigns are offered yet.' (Packages.tsx:37).
- Transformation marketing demo shows no numbers at all, carries 'SIMULATED · ILLUSTRATIVE ONLY' and the line 'These are not live campaigns and show no performance results.' (Transformation.tsx:134,148).
- Hero demos are original CSS-drawn content: phone has 'CONCEPT DEMO', browser bar reads 'northlight-studio.example · Concept demo' (reserved .example domain), ad mock uses generic 'yourbrand' and 'Beta — illustrative demo' (HeroScreens.tsx:53,89,120).
- Section footnote 'Original concept demonstrations built for this site. Not client work.' (Transformation.tsx:173).
- Privacy and Terms are openly marked as placeholders rather than filled with invented legal text (app/privacy/page.tsx, app/terms/page.tsx).
- FAQ delivery answer 'We don't promise timelines we haven't scoped.' and About 'We promise only what we can deliver' — no invented timelines or revision counts.
- Exact spec headlines and supporting lines are used verbatim on all seven home sections; brand spelled MAKENDLESS everywhere.

**Findings:**

178. **[blocker · content-honesty] How-we-work steps and FAQ state process policies nobody approved**  
   Where: data/site.ts:102-107 (process) and data/site.ts:109-116 (faqs); rendered on / and /faq  
   Evidence: Visible promises: 'scope, timeline, revisions and price in a written proposal before we start'; 'An assigned owner and team produce the work, with an internal quality review'; 'deliver securely'; 'You'll receive a written proposal covering deliverables, dependencies and price before any work begins'; 'We'll send a clear list after discovery'; 'Yes. Ongoing video editing and website maintenance arrangements can be agreed after delivery.' README.md:24 itself says 'Package names, FAQ answers: drafts for owner approval'. Spec: never invent policies or guarantees.  
   Fix: Either get the owner to approve each sentence (list them in TODO-FOR-OWNER.md) or soften to non-committal wording now: e.g. 'We agree scope, timing and price with you before work starts', drop 'internal quality review', 'assigned owner', 'securely' and 'written proposal' until confirmed as real practice.

179. **[blocker · mobile-break] /contact (Start a Project) scrolls sideways on every phone width** *(added on re-check)*  
   Where: app/contact/page.tsx:8 h1 via components/PageShell.tsx; measured at 360, 390 and 414 wide  
   Evidence: docs/audit/tmp/honestv-test3.mjs and honestv-test4.mjs: document.documentElement.scrollWidth = 421 at viewport 360, 390 and 414 (all other routes equal the viewport). The offending element is the h1 span.prism-text 'worth remembering.' with getBoundingClientRect left 20, right 421.4 at 36px font size: the word 'remembering.' is wider than the column. The fixed header stretches to 421 and the menu button's right edge lands at 401, past the 390 viewport. This is the page every CTA on the site leads to. Spec: no sideways scrolling.  
   Fix: Reduce the PageShell h1 size on small screens (clamp so the longest word fits 320px of content width, e.g. text-[1.75rem] below 420px) or allow overflow-wrap:anywhere / hyphens on the h1; add overflow-x:clip on the page shell as a guard. Re-measure scrollWidth at 360/390/414.

180. **[major · content-honesty] FAQ says revision limits are 'defined per package' but no package shows any**  
   Where: data/site.ts:113 vs data/site.ts:68-85 / components/Packages.tsx  
   Evidence: FAQ answer: 'Revision limits are defined per package and written into your proposal.' The Package type has only name/for/deliverables/addons; no card shows a revision limit. The claim describes a policy that does not exist on the site.  
   Fix: Change to 'Revisions are agreed with you before work starts' (no 'per package'), and add 'revision policy per package' to TODO-FOR-OWNER.md.

181. **[major · content-honesty] 'Join the beta list' promises a list and 'Early-access updates' that do not exist**  
   Where: data/site.ts:50 and :83; components/StudioPage.tsx:19; components/Packages.tsx:32; screenshot docs/audit/tmp/honest-390-pkg-grow.png  
   Evidence: GROW tagline 'We are learning in public. Join the beta list.', package 'Beta interest list' with deliverables 'Early-access updates', 'Informative beta descriptions', 'No commitments', CTA 'Join the beta list →' linking to /contact?service=grow. The contact form sends nothing (ContactForm.tsx:24-28: no EMAIL means no delivery), so nobody can join anything and no updates channel exists. 'Learning in public' is also an unverified claim (no public channel is linked).  
   Fix: Until a delivery channel is approved, relabel CTA 'Register interest' and deliverables to what is true ('Tell us what you'd want from marketing support', 'No commitments'); replace tagline with 'Coming soon. Currently in beta.'; add 'beta list channel' to owner TODOs.

182. **[major · missing] TODO-FOR-OWNER.md does not exist**  
   Where: project root /Users/raghusai/Desktop/CLAUDE 2.0/MAKENDLESSNWEBSITE (ls shows only README.md)  
   Evidence: Spec line 56: 'Missing items go to TODO-FOR-OWNER.md.' No such file in the repo; only a short 'Open items' list in README.md:19-25.  
   Fix: Create TODO-FOR-OWNER.md from the ownerTodos list in this report.

183. **[major · content-honesty] Visitor-facing success message contains developer text and an env var name**  
   Where: components/ContactForm.tsx:34-35; /contact after valid submit; docs/audit/tmp/contact-1440-valid-result.png  
   Evidence: Rendered: 'Form checked. Delivery channel pending.' / 'The team needs to set NEXT_PUBLIC_CONTACT_EMAIL or a form backend before launch.' Honest, but it is a note to developers shown to customers; the visitor is also only told after filling everything in.  
   Fix: Keep the no-false-sent rule but write for visitors: 'Your details look good, but our inbox isn't open yet, so nothing was sent. Please check back soon.' Also show a short notice above the form before they type. Move the env-var instruction to TODO-FOR-OWNER.md.

184. **[major · content-honesty] Form collects name and email while Privacy is a placeholder and no data notice is shown**  
   Where: app/contact/page.tsx, components/ContactForm.tsx:42-45, app/privacy/page.tsx:6-7  
   Evidence: Form asks for Name, Email, message; there is no line about how data is used; /privacy renders 'Draft placeholder. Requires owner and legal review before launch.' The mailto path would put the visitor's data in an email with no stated handling.  
   Fix: Owner must supply approved privacy text before launch; add a one-line notice under the form linking to Privacy once approved. Until then the site is not launchable (track in TODO-FOR-OWNER.md).

185. **[major · missing] Privacy and Terms are placeholder pages linked from every footer**  
   Where: app/privacy/page.tsx:6-7, app/terms/page.tsx:6-7  
   Evidence: Both render 'This page is a placeholder. MAKENDLESS has not yet approved formal Privacy/Terms policy text...'. Also awkward wording 'formal Terms policy text'. Correctly not invented, but a launch blocker.  
   Fix: Keep placeholders (do not invent legal text); fix wording to 'has not yet published its Terms'; list legal text as an owner TODO and consider noindex on both until approved.

186. **[major · off-spec] GROW studio card art is a rising bar chart labelled only 'ILLUSTRATIVE'**  
   Where: components/Studios.tsx:31-40; docs/audit/1440-home-02-studios.png  
   Evidence: Six animated bars with heights [40,70,55,100,85,130] trending up, i.e. a performance-growth graphic, with SVG text 'ILLUSTRATIVE' at fontSize 11. Spec: GROW demos say 'Illustrative demo' and show no performance numbers; a growth chart implies results even without digits, and the wording is not the required phrase.  
   Fix: Replace the chart with non-performance imagery of the work itself (ad creative frame, content calendar grid) and caption it 'Illustrative demo'.

187. **[major · content-honesty] Hero marketing 'Beta — illustrative demo' and 'CONCEPT DEMO' labels are unreadably small**  
   Where: components/HeroScreens.tsx:53 and :89 rendered through Hero3D; measured by docs/audit/tmp/honest-measure.mjs; screenshots honest-1440-hero-marketing.png, honest-390-hero-marketing.png  
   Evidence: Measured rendered label box: 1440 wide = 81x14.7px (phone) and 84x11px (laptop); 390 wide = 62x10px; 360 wide = 38x6px tall. 'CONCEPT DEMO' is 50x10.8px at 1440, 38x7.5px at 390 and 23.5x4.5px at 360. At phone widths the disclosure text is roughly 3-5px high: present in the DOM but not legible.  
   Fix: Add a legible caption outside the 3D screens in the hero scene/dock (min 11-12px) that switches with mode: 'Concept demo' for video/web, 'Beta · Illustrative demo' for marketing.

188. **[major · off-spec] Live Transformation video and website demos have no 'Concept demo' caption on the demo itself**  
   Where: components/Transformation.tsx:37-53 (VideoDemo), :103-109 (WebDemo); screenshot docs/audit/tmp/transformation-390-web-default.png  
   Evidence: Only labels inside the stages are 'RAW · 16:9 · NO CAPTIONS', 'EDITED · 9:16 · POP' and '(sample UI)'. The single disclosure is a 12px footnote below the controls: 'Original concept demonstrations built for this site. Not client work.' The literal 'Concept demo' caption required by the spec is absent, and on mobile the footnote is a full screen away from the demo.  
   Fix: Put a 'Concept demo' chip inside each demo stage (same position as the marketing 'SIMULATED' chip) and keep the footnote.

189. **[major · content-honesty] Proposal and pricing policy also hardcoded in two components, outside data/site.ts** *(added on re-check)*  
   Where: components/Packages.tsx:14; components/ProcessFaq.tsx:29  
   Evidence: Rendered on the home page: 'Every project is quoted from its real scope, effort and timeline. Package structures below show how we organise work. Prices are confirmed in a written proposal.' and 'Specifics are confirmed in your proposal before work starts.' These repeat the unapproved 'written proposal' policy and would survive a fix that only edits data/site.ts. They also break the spec's 'data/site.ts is the single source of truth' rule for copy.  
   Fix: Move both strings into data/site.ts next to process/faqs and soften together with them (e.g. 'We agree scope and price with you before work starts') until the owner confirms the written-proposal practice; list in TODO-FOR-OWNER.md.

190. **[major · content-honesty] Site promises a reply while no inquiry can reach anyone** *(added on re-check)*  
   Where: data/site.ts:110 (FAQ 1), components/Transformation.tsx:124, every 'Start a Project' / 'Request Quote' / 'Join the beta list' CTA leading to components/ContactForm.tsx  
   Evidence: FAQ answer open by default on the home page: 'Use Start a Project and tell us what you're building. We'll follow up to understand your goal, then outline scope and next steps.' Mock ad copy in the Leads objective: 'Tell us what you're building. We'll reply with next steps.' Verified by submitting the form: result is 'this message was not sent anywhere' (no EMAIL configured, no network request in ContactForm.tsx:24-28). The visitor is told they will be followed up with, fills the form, and only then learns nothing was sent; there is no email, phone or other channel anywhere on the site.  
   Fix: Until the owner supplies a verified delivery channel, show a short visible notice at the top of /contact ('Our inbox is not open yet; nothing will be sent') and change FAQ 1 to not promise a follow-up; add 'contact channel' as the first item in TODO-FOR-OWNER.md. Do not connect any service without owner approval.

191. **[minor · off-spec] Marketing demo uses 'Simulated · Illustrative only' instead of the required 'Illustrative demo'; calendar is unlabelled**  
   Where: components/Transformation.tsx:134 and :141-143; docs/audit/tmp/transformation-1440-mkt-default.png  
   Evidence: Chip text 'SIMULATED · ILLUSTRATIVE ONLY'. The weekly calendar (Mon Reel / Tue Post ...) has only an aria-label 'Sample weekly content calendar', no visible label. The ad mock is attributed to 'makendless · Sponsored', which reads as MAKENDLESS running paid ads.  
   Fix: Change chip to 'Beta · Illustrative demo', add visible 'Sample content calendar' heading, and use 'yourbrand' (as the hero does) instead of 'makendless' on the mock ad.

192. **[minor · off-spec] GROW appears without a Beta label in several places**  
   Where: components/Hero.tsx:162-164 (kinetic word); app/grow/page.tsx:3 (title); components/FinalCta.tsx:13 (footer tagline); app/studios/page.tsx:8; app/about/page.tsx:6  
   Evidence: Hero kinetic word renders bare 'G R O W' under the headline in marketing mode (honest-1440-hero-marketing.png); browser tab title is 'GROW — MAKENDLESS'; /grow h1 is plain 'Digital Marketing'; /studios intro 'Grow the audience.' is an outcome line with no beta qualifier; hero status chip still reads 'EDITED' in marketing mode. Footer 'CREATE • BUILD • GROW' is the locked philosophy line, acceptable.  
   Fix: Kinetic word 'GROW · BETA'; metadata title 'GROW (Beta)'; h1 'Digital Marketing — Beta'; /studios intro 'Create the content. Build the experience. Grow — in beta.'; status label 'PREVIEW' in marketing mode.

193. **[minor · content-honesty] /grow lists full paid-service scope as if deliverable**  
   Where: data/site.ts:53-57; components/StudioPage.tsx:10-18  
   Evidence: Cards 'Meta & Google Ads: Campaign setup & monitoring, Campaign reporting', 'Social media management: Page management', 'Marketing reporting' are styled identically to live CREATE/BUILD services. Only the page-level banner says beta; Packages says 'No campaigns are offered yet', which contradicts 'Campaign setup & monitoring'. Meta, Google, Instagram, YouTube appear as platform names in text only (no logos) which is acceptable descriptive use.  
   Fix: Add a 'Planned' / 'Coming soon' tag on each GROW service card and prefix the list with 'What we are preparing'.

194. **[minor · content-honesty] Outcome-style marketing lines that read as promises**  
   Where: data/site.ts:96-99, :20; components/Transformation.tsx:122  
   Evidence: 'Products that sell themselves.' (online store), 'Turn one long recording into a week of content' (implied quantity), 'explains your idea in seconds', 'Look ready before you are.', 'that hold attention', 'the studio behind the scroll-stoppers'. None is a numeric guarantee but the first two are result/volume claims for a studio with no published work.  
   Fix: Soften: 'Products shown at their best.'; 'Turn one long recording into multiple platform-ready clips.'; get owner sign-off on the rest.

195. **[minor · content-honesty] About page makes an unverified AI and review claim**  
   Where: app/about/page.tsx:12  
   Evidence: 'we use AI tools to move faster while people review every final result.' Not an AI service (so not a spec breach) but 'people review every final result' is an absolute process guarantee and the AI statement is not in the spec digest. Role list matches the spec; no names or head-count shown.  
   Fix: Owner to confirm or remove the sentence; if kept, drop 'every'.

196. **[minor · content-honesty] Fictional demo brand names may collide with real businesses**  
   Where: components/Transformation.tsx:85 ('BREW & CO.'); components/HeroScreens.tsx:120,127 ('NORTHLIGHT', northlight-studio.example)  
   Evidence: 'Brew & Co.' is a generic name used by real cafes; the web demo shows it with no 'Concept demo' label next to it. Hero 'NORTHLIGHT' is at least paired with a .example domain and 'Concept demo'. Browser chrome uses generic red/yellow/green dots, no real logos.  
   Fix: Use an obviously invented name plus .example, and place 'Concept demo' beside it; or use 'Your Cafe'.

197. **[minor · content-honesty] Footer column titled 'Company' and © line for a non-incorporated team**  
   Where: components/FinalCta.tsx:7 and :19  
   Evidence: Footer heading 'COMPANY' and '© 2026 MAKENDLESS. Creative & Technology Studio.' Spec: not incorporated, no trademark claims. No TM/registered claim is made; 'Company' mildly implies an incorporated entity.  
   Fix: Rename column to 'Studio'; owner to confirm who holds copyright before keeping the © line.

198. **[minor · missing] No favicon, robots, sitemap, Open Graph or canonical; default English-only 404**  
   Where: public/ is empty; app/layout.tsx:8-11; /favicon.ico, /robots.txt, /sitemap.xml all return 404  
   Evidence: honest-dump.mjs: status 404 for all three; no og:* or canonical tags on any route; 404 body is Next default '404 / This page could not be found.' with no footer. All depend on the real domain, which is not known.  
   Fix: Add once the owner supplies the domain and an approved icon; add a branded not-found page now.

199. **[minor · content-honesty] Package deliverables that depend on owner confirmation of capability**  
   Where: data/site.ts:70-81  
   Evidence: Items such as 'Multilingual versions', 'Audio cleanup', 'CMS', 'Analytics', 'Basic SEO setup', 'Approved checkout integration', 'Ongoing editing arrangement', and package names Starter/Creator/Professional/Business/Commerce/Custom/Maintenance are drafts (README.md:24). BUILD Starter promises a 'Working contact form' while the studio's own form delivers nothing.  
   Fix: Owner to tick off each deliverable/add-on as genuinely offered; remove any the team cannot do today.

200. **[minor · off-spec] Hero dock describes the GROW beta demo as a finished video edit** *(added on re-check)*  
   Where: components/Hero.tsx:222-224 (status), :179 (Pause video), hint chip; screenshot docs/audit/tmp/honestv-gl-390-hero-mkt.png  
   Evidence: With the Marketing BETA tab selected the dock still shows status 'EDITED', hint 'Drag to see the edit ↓', the button 'Pause video' and the stages Brief/Creative/Format/Preview/Review, while the only legible beta marker is the small chip in the tab and the 'illustrative demo' label is about 9px tall. The mode reads as a completed deliverable rather than an illustrative demo.  
   Fix: Make the status, hint and pause label mode-aware (e.g. status 'ILLUSTRATIVE DEMO' and hint 'Drag to preview' in marketing mode, 'Pause demo' for all modes) and add the legible out-of-screen caption the auditor proposed.

201. **[minor · content-honesty] Solutions recommends 'Marketing (beta)' as a service for Startup and Online store while Packages says none is offered** *(added on re-check)*  
   Where: data/site.ts:98-99 rendered by components/Solutions.tsx:40  
   Evidence: Selecting Startup or Online store renders the chip list '... | Marketing (beta)' under recommended services with the same chip styling as live services (measured panel text in honestv-test.mjs). The Packages section states 'No campaigns are offered yet.' The label is present, so this is not a missing-beta breach, but a not-yet-offered service is being recommended to two of four customer types.  
   Fix: Render the GROW chip differently (dashed border, 'Coming soon' suffix) or move it below the list as 'Later: marketing support (beta, not yet available)'.

## Cross-cutting: responsive + accessibility

Cross-cutting responsive + accessibility audit of the running build (BUILD_ID 01:28) at 360, 768 and 1024 px across the homepage and all 9 inner pages, using puppeteer measurements and screenshots saved in /Users/raghusai/Desktop/CLAUDE 2.0/MAKENDLESSNWEBSITE/docs/audit/tmp/ (prefix resp-a11y-; raw data in resp-a11y-measure.json, resp-a11y-behave.json, resp-a11y-extra.json). The base is solid (skip link, one h1 per page, visible focus on every control on dark sections, clean console, no document overflow on the homepage), but there are real breaks: sideways overflow on /contact, /build and /studios on phones, the Final CTA headline clipped at 360 and 768, the Studios cards broken at 768 (GROW Beta badge pushed off-screen), three of four tablists with no keyboard/ARIA wiring, reduced-motion ignored by three sections, and a focus ring that nearly disappears on light sections. Note: components/Nav.tsx, FinalCta.tsx, PageShell.tsx and app/globals.css were modified on disk at 01:50-01:51, after the running build, so some Nav/CTA findings may already be in progress in source; everything below was observed in the running build.

**Keep as-is:**
- Skip link ('Skip to content' -> #main) is the first Tab stop on every page and becomes visible on focus (138x40).
- Document structure: lang=en, one <main>, one header, one footer, unique page titles, exactly one h1 per page, and the homepage heading order is clean (h1 > h2 per section > h3 > h4 for FAQ questions, no skipped levels).
- Homepage has zero document-level horizontal overflow at 360, 768 and 1024, and exactly seven sections in spec order.
- Visible focus exists on every one of the 58 Tab stops on the homepage (2px solid #22d3ee, offset 3px); the hero range correctly moves its ring to the visible track (.hero-track-ring). Tab order follows visual order with no traps.
- Hero at 360x780: headline, supporting line and both CTAs fit above the fold (CTA bottoms at 396/398px, 48-50px tall); the mode tabs and timeline also fit (range bottom 768).
- Hero 'Service mode' tablist: roving tabindex, ArrowLeft/ArrowRight work, aria-selected correct, 44px tall tabs, role=status on the RAW/EDITED state, aria-valuetext on the timeline slider, Pause/Play video button with aria-pressed.
- Hero under prefers-reduced-motion: no canvas, still fallback, autoplay paused ('Play video'), mode cycling stopped, scroll-behavior auto.
- Mobile menu at 360: 320x61px link rows, 52px CTA, aria-expanded/aria-controls on the toggle, 44x44 toggle; Escape closes it when focus is on the toggle.
- Touch targets in the page body are good: all section tabs/pills are 44px tall, FAQ rows 64px, Request Quote links 64px tall, Solutions tabs 56px+, form fields 51-54px with 16px font (no iOS zoom), submit 56px.
- FAQ accordion buttons sit inside headings with aria-expanded + aria-controls pointing at existing panels.
- Muted text contrast is fine nearly everywhere: #a4aac7 on ink/surface and #5a6082 on paper all pass 4.5:1; only the specific cases listed in findings fail.
- Console is clean on all 10 pages at all three widths (only a favicon 404 on first load).
- Only Syne is used for text (330 sampled elements; one monospace timecode in the hero).
- Recomposition at 360 is genuinely mobile-first in Studios (stacked full-width gateways with Beta badge visible), Solutions (2x2 selector), Packages (single column) and Process (vertical steps).

**Findings:**

202. **[blocker · mobile-break] Sideways overflow on /contact, /build and /studios on phones (h1 wider than the screen)**  
   Where: components/PageShell.tsx:7 (h1 'text-4xl ... sm:text-6xl'); http://localhost:3456/contact, /build, /studios at 360 (and 390)  
   Evidence: With mobile emulation at 360 the layout viewport grows to the content width: /contact innerWidth and scrollWidth = 421 (h1 'remembering.' right edge 421), /build = 411 ('Development'), /studios = 362. Full-page screenshots are 421 and 411 px wide: docs/audit/tmp/resp-a11y-360-contact.png, resp-a11y-360-build.png; the existing docs/audit/390-page-contact.png (421px) and 390-page-build.png (411px) show the same at 390. The hero section in PageShell has no overflow clipping, so the page either pans sideways or renders zoomed out.  
   Fix: Reduce the inner-page h1 on small screens (e.g. clamp(1.75rem, 8.2vw, 2.25rem) below 400px) so the longest single word ('remembering.', 'Development') fits 320px of content width, and add overflow-wrap: anywhere / hyphens as a safety net. Re-test all inner pages at 360 by asserting window.innerWidth === 360 after load.

203. **[blocker · mobile-break] Final CTA headline 'worth remembering.' is cut off at 360 and 768**  
   Where: components/FinalCta.tsx (#cta-title, span.prism-text); homepage section 7 at 360 and 768  
   Evidence: Measured span box [20, 377] in a 360 viewport (17px past the edge) and [32, 835] at 768 (67px past); the section has overflow:hidden so the final 'g.' is clipped. Font size is 32px at 360 and 72px at 768. Screenshots: docs/audit/tmp/resp-a11y-360-home-7.png and resp-a11y-768-home-7.png. At 1024 it fits ([111, 913]).  
   Fix: The gradient span keeps 'worth remembering.' on one unbreakable line. Size the headline fluidly so 'remembering.' fits the content width (about 30px at 360, about 60px at 768), or allow the span to wrap and step the md size down (72px should start at lg, not md).

204. **[blocker · mobile-break] Studios gateways break at 768: title clipped and the GROW Beta badge is pushed off-screen**  
   Where: components/Studios.tsx:53-65 (three-column grid from md); homepage #studios at 768; also /studios at 768  
   Evidence: At 768 each card is 221px wide. 'Website Development' h3 (24px) extends to x=559 while its card ends at 495, so 64px is clipped to 'Website Developm'. 'Digital Marketing' ends at 733 against a card edge of 736, and the BETA badge sits at x=745-801, outside both the card and the 768 viewport, so the required Beta indicator is invisible. Screenshot: docs/audit/tmp/resp-a11y-768-home-2.png. The /studios page shows the same title collision at 768 (docs/audit/tmp/resp-a11y-768-studios.png, 'Developme' running into the next card).  
   Fix: Keep the cards stacked or 1+2 until lg (1024), or reduce the card title to about 18px between 768 and 1023 and let it wrap. Position the Beta badge absolutely at the card's top-right so the title can never push it out.

205. **[major · a11y] Three of four tablists have no keyboard or ARIA wiring**  
   Where: components/Transformation.tsx:160-168, components/Solutions.tsx:28-34, components/Packages.tsx:15-22  
   Evidence: For 'Demonstration mode', 'Customer type' and 'Service category': ArrowRight, ArrowDown, Home, End and ArrowLeft all leave selection and focus unchanged; every tab has tabindex unset so all 3-4 tabs are Tab stops; tabs have no id or aria-controls; the tabpanel has no id, no aria-labelledby and no tabindex. In Packages the role=tabpanel is put on the <ul>, which removes its list semantics. Only the hero 'Service mode' tablist handles arrows, and it ignores Home/End and has no tabpanel at all.  
   Fix: Extract one shared Tabs component: roving tabindex, Left/Right (plus Up/Down for the vertical Solutions list with aria-orientation), Home/End, id + aria-controls on tabs, id + aria-labelledby + tabindex=0 on the panel. Wrap the Packages <ul> in a div that carries role=tabpanel.

206. **[major · a11y] Reduced motion is ignored by Studios, Live Transformation and the Final CTA**  
   Where: components/Studios.tsx:12-36 (SVG <animate repeatCount=indefinite>), components/Transformation.tsx:30-33 (setInterval 700ms), components/FinalCta.tsx:10 (SVG <animate>)  
   Evidence: With prefers-reduced-motion: reduce emulated at 1024, two screenshots of the same section taken 2.5s apart differ for sections 2, 3 and 7 (different MD5: resp-a11y-rm-1024-home-2-a/b.png, -3-a/b.png, -7-a/b.png) while sections 4 and 6 are identical. Section 3's DOM also changes (caption word cycling) and its button still reads 'Pause preview', i.e. autoplay is on. The global CSS rule in app/globals.css only shortens CSS animations and transitions; it does not affect SMIL or JS timers.  
   Fix: Start VideoDemo with playing=false when matchMedia('(prefers-reduced-motion: reduce)') matches (as the hero already does). Replace the SMIL <animate> elements with CSS keyframes so the global rule covers them, or render them only when motion is allowed.

207. **[major · a11y] Focus ring is nearly invisible on the light sections**  
   Where: app/globals.css:26 (outline: 2px solid #22d3ee for all controls); Packages and How We Work + FAQ sections, light inner pages  
   Evidence: #22d3ee against paper #f6f7fc is about 1.7:1 (1.8:1 on the white cards), below the 3:1 needed for a focus indicator. Screenshot docs/audit/tmp/resp-a11y-1024-focus-on-light.png shows the pale ring around 'Join the beta list'. On dark sections the same ring is clearly visible.  
   Fix: Use a darker ring inside light sections, e.g. a [data-tone=light] scope with outline-color #6f45f6 (about 4.6:1 on paper), or a two-tone ring (2px #13172b plus 2px white box-shadow) that works on both.

208. **[major · mobile-break] Hero device shrinks to a 72px strip on short phones and is covered by the Pause button**  
   Where: components/Hero.tsx:142 (min-h-[100svh] layout); homepage hero at 360x640  
   Evidence: At 360x640 the canvas is 320x72px (at y=406) between the CTAs and the mode tabs; the phone renders about 30px wide and the 'Pause video' pill overlaps it. Screenshot: docs/audit/tmp/resp-a11y-360x640-hero.png. At 360x780 the canvas is 320x212 and reads fine.  
   Fix: Give the stage a minimum height (about 200px) on phones and let the hero exceed 100svh on short screens so the timeline scrolls just below the fold, or drop the supporting line to two lines and move Pause into the timeline bar.

209. **[major · visual-weak] Reduced-motion still fallback overlaps the hero headline and supporting text at 1024**  
   Where: components/Hero.tsx (still fallback layout); homepage hero at 1024x768 with prefers-reduced-motion  
   Evidence: docs/audit/tmp/resp-a11y-rm-1024-home-1-b.png: the fallback phone sits at about x=415-610 and covers the end of 'We make' and the words 'development for' / 'beta.' in the supporting paragraph. The live 3D version at the same size (resp-a11y-1024-home-fold.png) keeps the devices right of the text.  
   Fix: Constrain the fallback to the same right-hand column the canvas uses at lg (left edge at or beyond about 52% of the width) or scale it down between 1024 and 1279.

210. **[major · a11y] Fixed nav has low contrast over light sections**  
   Where: Running build header: 'fixed ... bg-[#0c1024]/70 backdrop-blur-xl', nav links text-[#a4aac7]; over Packages and Process sections at 768 and 1024  
   Evidence: Over paper #f6f7fc the 70% ink bar composites to roughly #525565 and the #a4aac7 14px links come out at about 3.2:1 (needs 4.5:1). Visible in docs/audit/tmp/resp-a11y-1024-home-5-tab1.png and resp-a11y-768-home-5.png (grey bar, washed-out links). The built header has no data-tone attribute; components/Nav.tsx on disk was edited after the build and now contains tone-switching code that is not yet live.  
   Fix: Ship the tone-aware nav already being written, and verify link contrast is at least 4.5:1 in both tones; or simply make the bar about 92% opaque.

211. **[major · a11y] Header and footer links are far below 44px on touch tablets and phones**  
   Where: Nav desktop links (md and up, so 768 and 1024 touch tablets), header CTA, logo link; footer links at every width  
   Evidence: Measured at 768 and 1024: header a 'Studios' 46x20, 'About' 37x20, 'FAQ' 26x20, 'Contact' 51x20, header 'Start a Project' 150x36, logo link 246x28. Footer at 360/768/1024: 'CREATE' 58x19, 'BUILD' 46x19, 'GROW — Beta' 102x19, 'All studios' 71x19, 'About' 43x19, 'FAQ' 30x19, 'Contact' 58x19, 'Privacy' 52x19, 'Terms' 43x19, footer logo 274x24, with 12px gaps between rows.  
   Fix: Give nav and footer links inline-flex with min-height 44px and horizontal padding (keep the visual spacing by reducing the list gap), and raise the header CTA to min-h-11.

212. **[major · mobile-break] Packages cards at 1024: package names overflow the card and the CTA arrow wraps onto its own line**  
   Where: components/Packages.tsx:22 (lg:grid-cols-4) and :31; homepage section 5 at 1024  
   Evidence: Card inner width is 180px. 'Professional' text is 198px (19px past the padding), 'Commerce' 184px, 'Maintenance' 213px (34px past the padding, 10px past the card edge). Every 'Request Quote →' link breaks into two lines with the arrow orphaned. With five website packages the fifth card sits alone on a second row. Screenshots: docs/audit/tmp/resp-a11y-1024-home-5.png and resp-a11y-1024-home-5-tab1.png.  
   Fix: Use 2 columns up to about 1100px and 3 at lg for five items (or 4 only from xl), reduce the card title size at lg, and wrap the arrow with the last word in a nowrap span.

213. **[major · a11y] Mobile menu does not contain focus and Escape only works from the toggle**  
   Where: Running build mobile menu (#mobile-menu) at 360  
   Evidence: With the menu open, Tab goes Studios, About, FAQ, Contact, Start a Project and then straight into the page behind (hero 'Start a Project', 'Explore Studios', 'Book a table', '9:30'). Pressing Escape at that point left aria-expanded='true'. The page behind also scrolls with the menu open (scrollY reached 1500). Escape did close the menu when focus was on the toggle. Nav.tsx on disk (edited after the build) has a comment about scroll lock, inert and Escape, which is not in the running build.  
   Fix: Ship the pending Nav change and verify: page behind inert while open, body scroll locked, Escape closes from anywhere and returns focus to the toggle.

214. **[major · a11y] Decorative mini-site buttons inside the 3D laptop are real Tab stops 9-14px tall**  
   Where: components/HeroScreens.tsx:132 and :148 ('Book a table', '9:30', '11:00', '14:30'); homepage hero, all widths  
   Evidence: They are Tab stops 9-12 in the homepage order, between 'Explore Studios' and 'Pause video'. Measured sizes: 48x14 and about 21x12 at 1024, 25x7 and 10x6 at 768, 29x10 and 11x8 at 360. They are also focusable while the website mode is not the visible one.  
   Fix: Mark the in-screen demo UI as presentation for assistive tech and keyboard: tabIndex=-1 on those buttons (keep pointer clicks) or inert/aria-hidden on the screen container, with one sentence of alt text describing the demo.

215. **[major · a11y] Pending nav-tone and focus-colour fix cannot work: no light section declares data-tone** *(added on re-check)*  
   Where: components/Nav.tsx:37-38, app/globals.css:35-38 versus components/Packages.tsx:10, components/ProcessFaq.tsx:12, components/PageShell.tsx:11  
   Evidence: Source on disk (edited after the running build) switches the nav colours and the --focus ring colour from the nearest [data-tone] ancestor. grep for data-tone across components/ and app/ finds it only on Nav, Footer (dark) and not-found (dark). The light sections (Packages, How We Work + FAQ, the light PageShell body) have none, so after a rebuild the nav still resolves to 'dark' over paper and the focus ring stays #22d3ee (about 1.7:1) there. The two verified contrast findings would survive the rebuild.  
   Fix: Add data-tone="light" to the Packages and ProcessFaq sections and to the PageShell body section when light is true (and data-tone="dark" on dark sections), then re-measure nav link contrast and focus-ring contrast over Packages after rebuilding.

216. **[major · visual-weak] Video demo's caption word is sliced by the before/after divider in its default state** *(added on re-check)*  
   Where: components/Transformation.tsx:25 (v=55), :44-47; homepage section 3, Video Editing tab  
   Evidence: docs/audit/tmp/resp-a11y-vfy-360-video.png: the animated caption is centred in the edited frame, the divider starts at 55%, so only 'AT' of 'THAT' is visible and the 9:16 frame itself is cut in half. The first thing the 'dominant immersive demo' shows is a chopped word. The edited frame and caption are centred in the stage regardless of width, so the same geometry applies at 768 and 1024.  
   Fix: Start the split lower (about 25-30%) so the whole edited frame and caption are visible on load, or anchor the edited frame in the right-hand portion of the stage.

217. **[minor · mobile-break] Hero timeline falls below the fold at 768x1024**  
   Where: components/Hero.tsx:142; homepage hero at 768x1024  
   Evidence: Hero height is 1079px in a 1024px viewport; the mode tabs end at 976 but the timeline range ends at 1063, so the signature draggable playhead is cut off (docs/audit/tmp/resp-a11y-768-home-fold.png). The 3D stage above it is 704x330 with the devices small and a lot of empty space.  
   Fix: At md, tighten the headline block or cap the stage so tabs plus timeline fit within 100svh, and scale the devices up to use the freed width.

218. **[minor · mobile-break] Live Transformation at 360: before/after labels collide and the marketing ad preview is cropped**  
   Where: components/Transformation.tsx:41 and :50 (labels), marketing demo; homepage section 3 at 360  
   Evidence: 'RAW · 16:9 · NO CAPTIONS' spans x=36-238 and 'EDITED · 9:16 · POP' spans x=173-324, a 65px overlap that reads as 'NO CAPTITED' at the split (docs/audit/tmp/resp-a11y-360-home-3.png). In the marketing tab the 'SIMULATED · ILLUSTRATIVE ONLY' label sits on top of the ad header and the ad is cut at top and bottom (resp-a11y-360-home-3-tab2.png).  
   Fix: Shorten the labels on phones ('RAW' / 'EDITED') or stack them top-left and bottom-right; give the ad preview its own padding below the simulated label and scale it to fit the stage height.

219. **[minor · visual-weak] Before/after slider labels sit on the opposite side from what they describe**  
   Where: components/Transformation.tsx:54 (<Slider left='Edited' right='Raw'>) and the website demo slider  
   Evidence: In the video demo the raw footage is on the left of the split and the edit on the right, but the slider row reads 'EDITED' on the left and 'RAW' on the right (resp-a11y-768-home-3.png). The website demo shows the finished site on the left and wireframe on the right while the labels read 'WIREFRAME' left and 'FINISHED' right (resp-a11y-360-home-3-tab1.png). The range also has no aria-valuetext (only aria-label 'Edited to Raw').  
   Fix: Swap the labels (or the clip direction) so each label is under its side of the image, and add aria-valuetext such as '55% raw'.

220. **[minor · a11y] Small contrast failures on accent text**  
   Where: components/Studios.tsx (BUILD eyebrow on card), components/Transformation.tsx:89 (selected slot pill); also /studios  
   Evidence: 'BUILD' 14px #8b5cf6 on #202342 measures 3.59:1; the selected time-slot pill '10:00' is 12px #0c1024 on #6f45f6 at 3.46:1. Both need 4.5:1.  
   Fix: Use the lighter lilac #c7a6ff or a lightened violet (about #a78bfa) for the BUILD eyebrow on surface; use white text on the violet slot pill.

221. **[minor · a11y] Touch targets under 44px inside the website demo**  
   Where: components/Transformation.tsx:89; homepage section 3, Website Development tab at 360  
   Evidence: Slot buttons measure '10:00' 61x30, '12:30' 58x30, '16:00' 60x30. They are real controls (aria-pressed).  
   Fix: Add an invisible hit area (padding or ::after inset -7px) to reach 44px while keeping the pill look.

222. **[minor · visual-weak] Process step titles are wider than their columns at 768**  
   Where: components/ProcessFaq.tsx (four-column steps from md); homepage section 6 at 768  
   Evidence: 'Discover' text is 166px in a 152px column, leaving about 18px before 'Design' (resp-a11y-768-home-6.png); descriptions wrap to five short lines.  
   Fix: Use a 2x2 grid between 768 and 1023, or reduce the step title size at md.

223. **[minor · visual-weak] Hero timeline stage labels are truncated and tiny on phones**  
   Where: components/Hero.tsx timeline segments (span.truncate); homepage hero at 360  
   Evidence: Labels render at 9px and are cut to 'WIREF…', 'RESPO…', 'CAPTIO…' (measured text 67px in a 48px box); see resp-a11y-360-home-fold.png. The 'Marketing BETA' tab label also touches the tab's left edge at 360.  
   Fix: Use short mobile labels (WIRE / RESP / CAPS) or show the label only for the active segment at a readable size; tighten the Beta chip in the third tab.

224. **[minor · a11y] Form fields reference error ids that do not exist and are not marked required**  
   Where: components/ContactForm.tsx:42-45; /contact  
   Evidence: name, email and message inputs carry aria-describedby='e-name' / 'e-email' / 'e-msg' while no element with those ids exists until an error is shown; none has required or aria-required although they are validated.  
   Fix: Set aria-describedby only when the error is rendered and add aria-required='true' (or a visible 'required' hint).

225. **[minor · missing] favicon.ico returns 404**  
   Where: http://localhost:3456/favicon.ico  
   Evidence: Only console error across all pages: '404 http://localhost:3456/favicon.ico' on first homepage load.  
   Fix: Add app/icon.svg (MAKENDLESS mark in the prism gradient) so the request resolves.

226. **[minor · missing] Running build is older than the source: several reported issues are already changed on disk and need re-testing** *(added on re-check)*  
   Where: .next/BUILD_ID (01:28) versus components/Nav.tsx, Footer.tsx, FinalCta.tsx, PageShell.tsx, ui.tsx (01:50-01:51), app/globals.css, app/icon.svg  
   Evidence: Running header class is 'bg-[#0c1024]/70' with no data-nav/data-tone attribute, while Nav.tsx on disk renders data-nav, min-h-11 links, inert + scroll lock + Escape handling. favicon 404 persists although app/icon.svg exists. So the header touch-target, mobile-menu and favicon findings describe the live build only; the h1 overflow (PageShell.tsx:7), Final CTA clipping (FinalCta.tsx:12), Studios 768 grid, tablist wiring, reduced-motion and Packages 1024 issues are unchanged in source.  
   Fix: Rebuild, then re-run the 360/768/1024 checks for the header, mobile menu and favicon before closing those findings; do not close the others on the strength of the rebuild.

227. **[minor · a11y] Sample-UI buttons hidden by the before/after clip stay keyboard-focusable** *(added on re-check)*  
   Where: components/Transformation.tsx:106 (finished SiteMock under clip-path) and :89 (slot buttons)  
   Evidence: Code: the finished site layer is hidden only with clip-path: inset(0 X% 0 0); its three slot buttons remain in the DOM and tab order at any slider value, so with the slider toward wireframe a keyboard user lands on invisible controls. Not exercised in the browser; observed from source only.  
   Fix: Set inert (or tabIndex=-1 on the slot buttons) when the slider value leaves them outside the revealed area.

228. **[minor · a11y] Solutions 'Startup' scene also animates under reduced motion** *(added on re-check)*  
   Where: components/Solutions.tsx:15  
   Evidence: The startup SVG has <animate attributeName="y2" dur="1.6s" repeatCount="indefinite">; SMIL is not affected by the reduced-motion CSS rule in app/globals.css (confirmed for the Studios SMIL, whose x1 moved 144 -> 83 in 0.7s with reduced motion emulated). The auditor's reduced-motion finding lists Studios, Transformation and Final CTA only.  
   Fix: Include this element when converting SMIL to CSS keyframes or gating it behind a motion-allowed check.
