# PROGRESS — MAKENDLESS website

Numbered task list generated from `AUDIT.md`. Status: ☐ open · ☑ done · ◐ partly done / see note. Updated after every completed step.

## Design decisions (made by the build lead, per Rule 6)
- Section rhythm: 1 Hero **dark ink** → 2 Studios **light paper** → 3 Live Transformation **dark edit-suite surface** → 4 Solutions **light** → 5 Packages **bright violet brand band with white cards** → 6 How We Work + FAQ **light paper** → 7 Final CTA **dark cinematic** → footer deepest ink.
- Real 3D only in Hero, Live Transformation and Final CTA.
- Shared primitives in `components/ui.tsx` (tabs with arrow keys, reveals, kinetic headings, buttons, demo captions).
- Nav reads `data-tone` from the section beneath it and switches light/dark.

## 1. Shared foundation (tokens, nav, footer)

- ☐ **1.** [major] Colour tokens are declared but never used - 320 hard-coded hex literals across components
- ☐ **2.** [major] No custom 404 - default Next.js page, off-brand and a dead end
- ☐ **3.** [major] No favicon, app icons, Open Graph / Twitter metadata, robots or sitemap; public/ is empty
- ☐ **4.** [major] Mobile menu ignores Escape and has no outside-tap close
- ☐ **5.** [major] Open mobile menu does not lock scroll or contain focus - page scrolls and tabs behind it
- ☐ **6.** [major] Mobile menu is cut off in landscape - Start a Project unreachable
- ☐ **7.** [major] Sticky nav turns muddy grey over light sections and link contrast drops below AA
- ☐ **8.** [major] Desktop nav and footer link hit areas are far below 44px (desktop nav is what touch tablets get at 768+)
- ☐ **9.** [major] Focus ring colour is nearly invisible on light sections
- ☐ **10.** [major] TODO-FOR-OWNER.md does not exist although the spec requires missing owner inputs to be logged there
- ☐ **11.** [major] Privacy and Terms are publicly linked, indexable pages that show an internal working note
- ☐ **12.** [minor] Every page shares the same meta description
- ☐ **13.** [minor] No current-page indication in the navigation
- ☐ **14.** [minor] Footer is nested inside <main> and reads as a plain link sitemap
- ☐ **15.** [minor] Mobile menu appears with no transition and duplicates the Contact destination
- ☐ **16.** [minor] Mobile menu stays open across browser Back / history navigation
- ☐ **17.** [minor] Header wordmark touches the menu button at 320px (no shrink, no gap)
- ☐ **18.** [minor] Final CTA beam animation ignores prefers-reduced-motion

## 2. Hero

- ☐ **19.** [blocker] Timeline and mode tabs fall below the fold on 768px-tall laptops
- ☐ **20.** [blocker] Mouse wheel over the laptop traps page scroll
- ☐ **21.** [blocker] Hero breaks at 768x1024 (tablet): timeline cut off, devices tiny
- ☐ **22.** [blocker] Touch scrolling is trapped on phones in Websites mode
- ☐ **23.** [major] Scene collapses on short phones (360x640, 375x667): phone smaller than the Pause button
- ☐ **24.** [major] In Marketing mode the timeline changes nothing on the devices
- ☐ **25.** [major] Film strip and timeline clips read as plain coloured rectangles
- ☐ **26.** [major] HTML screens are not occluded by 3D bodies: phone screen shows through the laptop
- ☐ **27.** [major] Depth of field is a CSS blur on the screen only; bodies and props stay razor sharp
- ☐ **28.** [major] Laptop does not read as a physical product
- ☐ **29.** [major] Auto-cycling modes cannot be paused by the Pause button, hover or keyboard focus
- ☐ **30.** [major] Pause button is a no-op or misleading in several states
- ☐ **31.** [major] Slider arrow keys move 0.1% per press
- ☐ **32.** [major] Demo buttons inside the devices stay in the tab order while hidden, blurred or covered
- ☐ **33.** [major] At 1024x768 the laptop is cropped by the viewport and the timeline is clipped by 6px
- ☐ **34.** [major] 'Book a table' and the mini-site nav/cards look clickable but do nothing
- ☐ **35.** [major] 'Concept demo' and 'Beta - illustrative demo' labels are too small to read
- ☐ **36.** [major] During scroll hand-off the devices are sliced by the canvas box edges
- ☐ **37.** [minor] Laptop buttons become moving targets during the responsive-resize loop
- ☐ **38.** [minor] Headline and phone collide at 1440
- ☐ **39.** [minor] Only Marketing gets a mask wipe; Video to Websites has no transition identity
- ☐ **40.** [minor] Scroll hand-off is weak: props collapse and the next section is also dark
- ☐ **41.** [minor] Status readout jumps sideways and stage chips lag during the intro
- ☐ **42.** [minor] Tabs lack tabpanel wiring and Home/End keys
- ☐ **43.** [minor] Pause button overlaps the device on phones
- ☐ **44.** [minor] Timeline stage names are truncated with ellipses on phones

## 3. Three Studios

- ☐ **45.** [blocker] BUILD gateway preview is an empty dashed box (layout blocks never render)
- ☐ **46.** [blocker] GROW Beta badge is clipped out of sight at tablet widths (768 to ~900px)
- ☐ **47.** [blocker] Studio names overflow and are cut off at 768 ('Website Developm')
- ☐ **48.** [major] Gateways are generic cards with small looping SVG pictograms, not premium interactive visual gateways with service previews
- ☐ **49.** [major] No distinct motion identity per division; interaction is identical for all three
- ☐ **50.** [major] Three dark sections in a row: hero, studios and Live Transformation all sit on the same ink
- ☐ **51.** [major] SVG (SMIL) animations ignore prefers-reduced-motion
- ☐ **52.** [major] GROW preview is a rising bar chart - implies performance growth for a beta service and is the 'dashboard look' the spec forbids
- ☐ **53.** [minor] Leftover dead code: style={{ animation: 'marquee 0s' }} on the CREATE playhead group
- ☐ **54.** [minor] Cards are unbalanced on desktop: three different heights and misaligned content rows
- ☐ **55.** [minor] Mobile is the desktop cards stacked, not recomposed; section is two full screens of near-identical tiles
- ☐ **56.** [minor] 'ILLUSTRATIVE' label and BETA pill are too small to read
- ☐ **57.** [minor] Gateways carry no service content; 'Enter studio' label repeated three times
- ☐ **58.** [minor] Link accessible name omits its visible text ('Enter studio', tagline) - Label in Name failure
- ☐ **59.** [minor] Card stagger and height differences change arbitrarily between breakpoints (tablet layout is untuned)

## 4. Live Transformation

- ☐ **60.** [major] Slider labels are mirrored against the picture, and the two modes run in opposite directions
- ☐ **61.** [major] No 3D, no device, no real footage - the demo is flat CSS rectangles
- ☐ **62.** [major] Not one dominant immersive demo - a 1024px card under stacked pills
- ☐ **63.** [major] Wide reframe is cropped by the stage at desktop
- ☐ **64.** [major] Caption word is clipped inside the 9:16 frame at desktop
- ☐ **65.** [major] Mobile site preview cuts off its own content, including the booking confirmation
- ☐ **66.** [major] Ad card overflows the stage on phones; CTA cut off and the 'Simulated' badge covers the card header
- ☐ **67.** [major] Tab widget is not keyboard-complete and lacks ARIA wiring
- ☐ **68.** [major] Caption animation auto-plays and ignores reduced motion; keeps ticking off-screen
- ☐ **69.** [major] Story placement clips the ad headline at desktop too, and the Feed card overflows the stage at 1440 with the Leads objective
- ☐ **70.** [major] Most controls do nothing visible when the slider hides the 'after' layer
- ☐ **71.** [major] Wireframe and finished site do not line up, so the before/after reads as two unrelated pictures
- ☐ **72.** [minor] RAW and EDITED badges collide on phones
- ☐ **73.** [minor] Karaoke subtitle line is left-aligned and off-centre
- ☐ **74.** [minor] Caption timeline looks like controls but is inert
- ☐ **75.** [minor] Before/after picture cannot be dragged directly
- ☐ **76.** [minor] Sample booking slots are below the touch-target minimum and stay focusable while hidden
- ☐ **77.** [minor] Slider has no meaningful accessible value
- ☐ **78.** [minor] Weekly calendar strip is a row of grey boxes with no role
- ☐ **79.** [minor] Demo state is lost on every mode switch and toggle buttons mis-report state
- ☐ **80.** [minor] In-demo ad uses lower-case 'makendless' and the video/web stages carry no in-frame 'Concept demo' label

## 5. Solutions For You

- ☐ **81.** [major] Arrow keys do nothing on the customer-type tabs
- ☐ **82.** [major] Start a Project passes ?for=<customer> but the contact form ignores it
- ☐ **83.** [major] Fourth consecutive dark section; breaks the dark/light alternation rule
- ☐ **84.** [major] SVG scenes are crude placeholder icons, not business-specific visuals
- ☐ **85.** [major] No transition or motion when switching customer type
- ☐ **86.** [major] Tablet-landscape (1024) layout is badly proportioned: giant tabs, tiny scene, four-line headline
- ☐ **87.** [minor] Tab/panel ARIA wiring is incomplete
- ☐ **88.** [minor] Startup rocket flame animation is dead code and SMIL ignores reduced motion
- ☐ **89.** [minor] Panel is under-filled and jumps in height between tabs
- ☐ **90.** [minor] Service chips look like buttons but are not interactive
- ☐ **91.** [minor] Explore Services is the same generic link for every customer type
- ☐ **92.** [minor] A few lines lean towards outcome promises
- ☐ **93.** [minor] Recommended-service chips do not match the service catalogue
- ☐ **94.** [minor] Section headline orphans one word and splits the gradient phrase at desktop
- ☐ **95.** [minor] Phone tab grid has uneven rows because one label wraps

## 6. Packages & Pricing

- ☐ **96.** [major] Looks like a generic SaaS pricing table
- ☐ **97.** [major] Scope info / exclusions missing from every package
- ☐ **98.** [major] Chosen package is dropped on the contact page
- ☐ **99.** [major] Tablist has no arrow-key support and incomplete ARIA wiring
- ☐ **100.** [major] 'Maintenance' title overflows its card at 1024 and is jammed at 1440
- ☐ **101.** [major] GROW tab is one small orphaned card with weak copy
- ☐ **102.** [major] No motion at all; tab change is an instant swap
- ☐ **103.** [major] Mobile is the desktop grid stacked, producing a very long section
- ☐ **104.** [major] Selected category is lost on Back from the contact page
- ☐ **105.** [minor] 'Join the beta list' implies a list that does not exist
- ☐ **106.** [minor] Empty fifth column and awkward orphan rows
- ☐ **107.** [minor] CTA arrow wraps onto its own line at 1024
- ☐ **108.** [minor] Small supporting text sizes
- ☐ **109.** [minor] Section has no anchor id
- ☐ **110.** [minor] Focus ring on package links is low-contrast and misshapen on the light cards
- ☐ **111.** [minor] Eyebrow says 'Packages & pricing' but the section contains no pricing
- ☐ **112.** [minor] GROW tab presents the beta as a 'package' with deliverables

## 7. How We Work + FAQ

- ☐ **113.** [blocker] Process/FAQ is the same light colour as Packages directly above - two light sections merge
- ☐ **114.** [major] No progression motion at all on phones - the line is display:none and nothing replaces it
- ☐ **115.** [major] Motion does not actually clarify progression - steps never change state, line overshoots step 04
- ☐ **116.** [major] Copy states operational policies the owner has not confirmed
- ☐ **117.** [major] 'We'll follow up' promise contradicts the unconnected contact form
- ☐ **118.** [minor] FAQ open/close has no transition - content snaps
- ☐ **119.** [minor] Accordion panels lack region labelling; heading level jumps under a visual H3
- ☐ **120.** [minor] Step numbers and section have no anchor; homepage FAQ cannot be linked to
- ☐ **121.** [minor] Large dead space under the FAQ title on desktop; 768 step columns are cramped
- ☐ **122.** [minor] Homepage FAQ answers are unreachable without JavaScript and hidden from find-in-page
- ☐ **123.** [minor] Scroll-linked motion runs on phones although nothing is painted, and animates layout width on desktop
- ☐ **124.** [minor] More unconfirmed process promises in the copy beyond those the auditor listed
- ☐ **125.** [minor] Step list is announced with double numbering and no step state for assistive tech

## 8. Final CTA + Footer

- ☐ **126.** [blocker] Headline word "remembering." is cut off at 360px and 768px
- ☐ **127.** [major] Headline sits off-centre at 390px, touching the right edge
- ☐ **128.** [major] No real 3D or cinematic closing: section is two gradients and three lines
- ☐ **129.** [major] No brand motion: headline, line and CTA appear with no entrance or scroll animation
- ☐ **130.** [major] Footer link touch targets are 19px tall
- ☐ **131.** [minor] The three diagonal lines are abstract decoration, barely visible and cut by the nav
- ☐ **132.** [minor] Final CTA and footer are the same flat colour, so the page end has no distinct close
- ☐ **133.** [minor] SVG line animation keeps running under prefers-reduced-motion
- ☐ **134.** [minor] Footer says "All studios" where the spec lists "Studios"
- ☐ **135.** [minor] Small footer text is 12px muted grey
- ☐ **136.** [minor] Footer wordmark does not line up with the nav wordmark at desktop
- ☐ **137.** [minor] At 320px the Start a Project button wraps to two lines
- ☐ **138.** [minor] Footer column labels are h2 headings on every page

## 9. Start a Project form

- ☐ **139.** [blocker] Result panel shows developer text to the visitor and is a dead end
- ☐ **140.** [blocker] No loading state and no submission-error state exist
- ☐ **141.** [blocker] Sideways scrolling at 360 and 390: H1 word 'remembering.' overflows the viewport
- ☐ **142.** [major] ?for= preselection does nothing (Solutions section CTA context is lost)
- ☐ **143.** [major] Package name from 'Request Quote' links is thrown away
- ☐ **144.** [major] Form is too thin for a real project brief
- ☐ **145.** [major] Page looks like an unstyled template: single narrow column, 160px dead gap, half the screen empty
- ☐ **146.** [major] Errors are not announced and focus is not managed
- ☐ **147.** [major] Visitor is only told that nothing gets sent after writing the whole brief
- ☐ **148.** [major] 'Join the beta list' buttons lead to the generic project form; no beta list flow exists
- ☐ **149.** [minor] Error text is nested inside the <label>, polluting the accessible name; aria-describedby points at missing ids when valid
- ☐ **150.** [minor] Errors do not clear when the visitor fixes the field
- ☐ **151.** [minor] Form is missing from server HTML (blank until JS hydrates)
- ☐ **152.** [minor] Validation is loose and inputs are unbounded
- ☐ **153.** [minor] mailto branch (if the env var is set) claims the mail app is opening without knowing
- ☐ **154.** [minor] favicon.ico returns 404
- ☐ **155.** [minor] Invalid fields have no visual error state on the field itself
- ☐ **156.** [minor] No privacy link or data-use note beside a form that collects name and email

## 10. Internal pages

- ☐ **157.** [blocker] /build H1 'Website Development' is clipped off-screen on phones
- ☐ **158.** [blocker] CREATE, BUILD and GROW pages are one identical template — no division visual or motion identity
- ☐ **159.** [blocker] /studios card headings overflow their cards at 768 (and marginally at 1024)
- ☐ **160.** [major] /studios H1 'possibilities.' overflows at 360px
- ☐ **161.** [major] Studio pages are content-thin: three bullets per service, nothing else
- ☐ **162.** [major] All eight pages are the same dark shell with the same violet corner glow
- ☐ **163.** [major] /studios overview is three small text cards — weaker than the homepage studios section it is linked from
- ☐ **164.** [major] About page is a three-card stub with no CTA or links
- ☐ **165.** [major] No motion at all on any internal page
- ☐ **166.** [major] Footer links are 19px tall — below the 44px touch-target rule
- ☐ **167.** [major] GROW 'Join the beta list' CTA leads to the generic project form — there is no beta list
- ☐ **168.** [major] FAQ answers promise things the site cannot back up
- ☐ **169.** [minor] About page states an AI-usage policy the spec does not supply
- ☐ **170.** [minor] FAQ page is a static copy of the six homepage FAQs with no next step
- ☐ **171.** [minor] Legal placeholders are honest but would ship as-is, and Terms copy is grammatically off
- ☐ **172.** [minor] No current-page indication in navigation
- ☐ **173.** [minor] Heading semantics: footer column labels are H2s; FAQ questions are not headings
- ☐ **174.** [minor] Every internal page shares the homepage meta description; no OG tags, favicon, robots or sitemap; default unstyled 404
- ☐ **175.** [minor] Hero band leaves large dead space and inconsistent heights
- ☐ **176.** [minor] GROW page title and H1 carry no Beta label
- ☐ **177.** [minor] Mobile menu does not close on Escape and has no direct studio links

## Cross-cutting: honest content

- ☐ **178.** [blocker] How-we-work steps and FAQ state process policies nobody approved
- ☐ **179.** [blocker] /contact (Start a Project) scrolls sideways on every phone width
- ☐ **180.** [major] FAQ says revision limits are 'defined per package' but no package shows any
- ☐ **181.** [major] 'Join the beta list' promises a list and 'Early-access updates' that do not exist
- ☐ **182.** [major] TODO-FOR-OWNER.md does not exist
- ☐ **183.** [major] Visitor-facing success message contains developer text and an env var name
- ☐ **184.** [major] Form collects name and email while Privacy is a placeholder and no data notice is shown
- ☐ **185.** [major] Privacy and Terms are placeholder pages linked from every footer
- ☐ **186.** [major] GROW studio card art is a rising bar chart labelled only 'ILLUSTRATIVE'
- ☐ **187.** [major] Hero marketing 'Beta — illustrative demo' and 'CONCEPT DEMO' labels are unreadably small
- ☐ **188.** [major] Live Transformation video and website demos have no 'Concept demo' caption on the demo itself
- ☐ **189.** [major] Proposal and pricing policy also hardcoded in two components, outside data/site.ts
- ☐ **190.** [major] Site promises a reply while no inquiry can reach anyone
- ☐ **191.** [minor] Marketing demo uses 'Simulated · Illustrative only' instead of the required 'Illustrative demo'; calendar is unlabelled
- ☐ **192.** [minor] GROW appears without a Beta label in several places
- ☐ **193.** [minor] /grow lists full paid-service scope as if deliverable
- ☐ **194.** [minor] Outcome-style marketing lines that read as promises
- ☐ **195.** [minor] About page makes an unverified AI and review claim
- ☐ **196.** [minor] Fictional demo brand names may collide with real businesses
- ☐ **197.** [minor] Footer column titled 'Company' and © line for a non-incorporated team
- ☐ **198.** [minor] No favicon, robots, sitemap, Open Graph or canonical; default English-only 404
- ☐ **199.** [minor] Package deliverables that depend on owner confirmation of capability
- ☐ **200.** [minor] Hero dock describes the GROW beta demo as a finished video edit
- ☐ **201.** [minor] Solutions recommends 'Marketing (beta)' as a service for Startup and Online store while Packages says none is offered

## Cross-cutting: responsive + accessibility

- ☐ **202.** [blocker] Sideways overflow on /contact, /build and /studios on phones (h1 wider than the screen)
- ☐ **203.** [blocker] Final CTA headline 'worth remembering.' is cut off at 360 and 768
- ☐ **204.** [blocker] Studios gateways break at 768: title clipped and the GROW Beta badge is pushed off-screen
- ☐ **205.** [major] Three of four tablists have no keyboard or ARIA wiring
- ☐ **206.** [major] Reduced motion is ignored by Studios, Live Transformation and the Final CTA
- ☐ **207.** [major] Focus ring is nearly invisible on the light sections
- ☐ **208.** [major] Hero device shrinks to a 72px strip on short phones and is covered by the Pause button
- ☐ **209.** [major] Reduced-motion still fallback overlaps the hero headline and supporting text at 1024
- ☐ **210.** [major] Fixed nav has low contrast over light sections
- ☐ **211.** [major] Header and footer links are far below 44px on touch tablets and phones
- ☐ **212.** [major] Packages cards at 1024: package names overflow the card and the CTA arrow wraps onto its own line
- ☐ **213.** [major] Mobile menu does not contain focus and Escape only works from the toggle
- ☐ **214.** [major] Decorative mini-site buttons inside the 3D laptop are real Tab stops 9-14px tall
- ☐ **215.** [major] Pending nav-tone and focus-colour fix cannot work: no light section declares data-tone
- ☐ **216.** [major] Video demo's caption word is sliced by the before/after divider in its default state
- ☐ **217.** [minor] Hero timeline falls below the fold at 768x1024
- ☐ **218.** [minor] Live Transformation at 360: before/after labels collide and the marketing ad preview is cropped
- ☐ **219.** [minor] Before/after slider labels sit on the opposite side from what they describe
- ☐ **220.** [minor] Small contrast failures on accent text
- ☐ **221.** [minor] Touch targets under 44px inside the website demo
- ☐ **222.** [minor] Process step titles are wider than their columns at 768
- ☐ **223.** [minor] Hero timeline stage labels are truncated and tiny on phones
- ☐ **224.** [minor] Form fields reference error ids that do not exist and are not marked required
- ☐ **225.** [minor] favicon.ico returns 404
- ☐ **226.** [minor] Running build is older than the source: several reported issues are already changed on disk and need re-testing
- ☐ **227.** [minor] Sample-UI buttons hidden by the before/after clip stay keyboard-focusable
- ☐ **228.** [minor] Solutions 'Startup' scene also animates under reduced motion
