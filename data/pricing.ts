/*
 * THE ONE SOURCE OF TRUTH for the whole site: studios, services, options, prices, delivery times, extras,
 * free items, "what we need" lists, popular tags, combo packs and the words around them.
 * Edit a price or a service here only. The selector on /create and /build, the /studios page, the homepage
 * studio cards, the "who it's for" cards, the contact form, the bottom bar, the final page and the server
 * all read this file, so one edit updates everywhere. Full prices are shown in one place only: the selector
 * on each studio page.
 */

export type StudioKey = "build" | "create";
/** one = single fixed price · each = per video/design (counter) · month = monthly · issue = per issue */
export type Unit = "one" | "each" | "month" | "issue";

export interface Option {
  id: string;
  name: string;
  /** null = "Custom quote" */
  price: number | null;
  unit: Unit;
  delivery: string;
  /** Longest delivery in days, used for "Est. delivery". null = custom (after a call), 0 = ongoing. */
  days: number | null;
  popular?: boolean;
  /** Counts toward the video quantity discount. */
  video?: boolean;
  /** Selected chip shows a − / + counter. */
  qty?: boolean;
  /** Extra "What we need from you" lines when this option is selected. */
  need?: string[];
}

export interface Extra { id: string; name: string; price: number; monthly?: boolean }

export interface Service {
  id: string;
  studio: StudioKey;
  name: string;
  line: string;
  tag?: string;
  options: Option[];
  extras: Extra[];
  free: string[];
  placeholder: string;
  need: string[];
}

const custom = (id: string, name: string): Option => ({ id, name, price: null, unit: "one", delivery: "After a quick call", days: null });

export const services: Service[] = [
  /* ---------------- BUILD ---------------- */
  {
    id: "websites", studio: "build", name: "Business Websites", line: "Websites built around what your business does.",
    options: [
      { id: "landing-page", name: "Landing Page", price: 4999, unit: "one", delivery: "3 days", days: 3, popular: true },
      { id: "business-website", name: "Business Website", price: 7999, unit: "one", delivery: "7 days", days: 7, popular: true },
      { id: "booking-website", name: "Booking Website", price: 12999, unit: "one", delivery: "10 days", days: 10, need: ["Booking Website: services, timings and staff"] },
      { id: "listing-website", name: "Listing Website", price: 12999, unit: "one", delivery: "10 days", days: 10 },
      { id: "online-store", name: "Online Store", price: 19999, unit: "one", delivery: "14 days", days: 14, popular: true, need: ["Online Store: product list with photos and prices"] },
      custom("custom-website", "Custom Website"),
    ],
    extras: [
      { id: "extra-page", name: "Extra page", price: 999 },
      { id: "online-payments", name: "Online payments", price: 1999 },
      { id: "seo-setup", name: "SEO setup", price: 1999 },
      { id: "ai-chat-support", name: "AI chat support", price: 2999 },
      { id: "customer-login", name: "Customer login", price: 2999 },
      { id: "extra-language", name: "Extra language", price: 2999 },
    ],
    free: ["WhatsApp button", "Mobile-friendly design", "Contact form", "30 days of small changes"],
    placeholder: "Example: Clothing store, about 40 products, need COD and online payments, Telugu + English",
    need: ["Logo", "Business details and text (or we write simple text)", "Photos", "Domain or hosting login, if you have one"],
  },
  {
    id: "automation", studio: "build", name: "Workflow Automation", line: "Messages, leads, orders and reports done automatically.", tag: "Most Popular",
    options: [
      { id: "reports-integrations", name: "Reports & Integrations", price: 4999, unit: "one", delivery: "3 days", days: 3 },
      { id: "team-automation", name: "Team Automation", price: 6999, unit: "one", delivery: "5 days", days: 5 },
      { id: "sales-leads-automation", name: "Sales & Leads Automation", price: 7999, unit: "one", delivery: "5 days", days: 5 },
      { id: "whatsapp-automation", name: "WhatsApp Automation", price: 9999, unit: "one", delivery: "7 days", days: 7, popular: true },
      { id: "orders-payments-automation", name: "Orders & Payments Automation", price: 9999, unit: "one", delivery: "7 days", days: 7 },
      { id: "custom-ai-agent", name: "Custom AI Agent", price: 19999, unit: "one", delivery: "10–14 days", days: 14, popular: true },
      custom("custom-automation", "Custom Automation"),
    ],
    extras: [{ id: "automation-monthly-care", name: "Monthly care", price: 1499, monthly: true }],
    free: ["Setup help", "30 days of fixes and small changes"],
    placeholder: "Example: Send WhatsApp order updates and add every website lead to Google Sheets",
    need: ["WhatsApp Business number", "Logins for the apps to connect (Google Sheets, CRM, store)", "List of the messages or tasks to automate"],
  },
  {
    id: "ai-assistants", studio: "build", name: "AI Assistants", line: "AI that talks to your customers 24/7.",
    options: [
      { id: "ai-chatbot", name: "AI Chatbot", price: 9999, unit: "one", delivery: "5 days", days: 5, popular: true },
      { id: "ai-booking-assistant", name: "AI Booking Assistant", price: 9999, unit: "one", delivery: "7 days", days: 7, popular: true },
      { id: "ai-phone-receptionist", name: "AI Phone Receptionist", price: 19999, unit: "one", delivery: "10 days", days: 10, need: ["Phone Receptionist: business phone number and preferred languages"] },
      custom("custom-ai-assistant", "Custom AI Assistant"),
    ],
    extras: [{ id: "assistant-monthly-care", name: "Monthly care", price: 1999, monthly: true }],
    free: ["Answer updates for 30 days", "Telugu, Hindi and English on phone"],
    placeholder: "Example: WhatsApp chatbot for my clinic that answers timing and fee questions",
    need: ["Your FAQs (timings, prices, services)", "WhatsApp number"],
  },
  {
    id: "saas", studio: "build", name: "AI SaaS Platforms", line: "AI software you can launch as your own product.",
    options: [
      { id: "ai-tool", name: "AI Tool", price: 54999, unit: "one", delivery: "4 weeks", days: 28 },
      { id: "web-app-portal", name: "Web App / Portal", price: 69999, unit: "one", delivery: "5 weeks", days: 35 },
      { id: "saas-mvp", name: "SaaS MVP", price: 99999, unit: "one", delivery: "6–8 weeks", days: 56, popular: true },
      custom("custom-ai-product", "Custom AI Product"),
    ],
    extras: [],
    free: ["60 days of bug fixes and small changes"],
    placeholder: "Example: A tool where coaching institutes upload notes and AI makes quizzes",
    need: ["Your idea and features list", "Products you like as references", "Logo and brand colors"],
  },
  {
    id: "apps", studio: "build", name: "Android & iPhone Apps", line: "One app for both Android and iPhone.",
    options: [
      { id: "business-app", name: "Business App", price: 59999, unit: "one", delivery: "6 weeks", days: 42 },
      { id: "startup-mvp-app", name: "Startup MVP App", price: 79999, unit: "one", delivery: "6–8 weeks", days: 56, popular: true },
      { id: "shopping-delivery-app", name: "Shopping & Delivery App", price: 89999, unit: "one", delivery: "8 weeks", days: 56, popular: true },
      custom("custom-app", "Custom App"),
    ],
    extras: [],
    free: ["Play Store & App Store publishing", "60 days of bug fixes and small changes"],
    placeholder: "Example: Food delivery app for 3 restaurants with live order tracking",
    need: ["Features list", "Logo and brand colors", "Google Play and Apple developer accounts (we help you create them)"],
  },
  {
    id: "website-care", studio: "build", name: "Website Care", line: "Keep your website fast, safe and up to date.",
    options: [
      { id: "quick-fix", name: "Quick Fix", price: 999, unit: "issue", delivery: "Within 24 hours", days: 1 },
      { id: "monthly-maintenance", name: "Monthly Maintenance", price: 1499, unit: "month", delivery: "Ongoing, replies within 24 hours", days: 0, popular: true },
      { id: "setup-migration", name: "Setup & Migration", price: 1999, unit: "one", delivery: "2 days", days: 2 },
      { id: "speed-optimization", name: "Speed Optimization", price: 2999, unit: "one", delivery: "3 days", days: 3 },
      { id: "website-redesign", name: "Website Redesign", price: 6999, unit: "one", delivery: "7 days", days: 7 },
      custom("custom-request", "Custom Request"),
    ],
    extras: [],
    free: ["Small text and image changes on the Monthly plan"],
    placeholder: "Example: My WordPress site is slow and the contact form is not working",
    need: ["Website and hosting login", "List of problems or changes"],
  },

  /* ---------------- CREATE ---------------- */
  {
    id: "short-videos", studio: "create", name: "Short Videos", line: "Reels, Shorts and ads.", tag: "Most Popular",
    options: [
      { id: "reels-shorts", name: "Reels & Shorts", price: 699, unit: "each", delivery: "24–48 hours", days: 2, popular: true, video: true, qty: true },
      { id: "ad-videos", name: "Ad Videos", price: 1499, unit: "each", delivery: "2 days", days: 2, popular: true, video: true, qty: true },
      { id: "monthly-12-reels", name: "Monthly 12 Reels", price: 6999, unit: "one", delivery: "3 reels every week", days: 0 },
      custom("custom-short-video", "Custom Short Video"),
    ],
    extras: [{ id: "extra-version", name: "Extra version", price: 299 }],
    free: ["Captions", "Music & sound effects", "Cover image", "2 revisions"],
    placeholder: "Example: 10 reels a month for my cafe, fun and fast style like trending reels",
    need: ["Raw footage (Google Drive link)", "Reference reels you like", "Logo and brand colors", "Any text to show"],
  },
  {
    id: "long-videos", studio: "create", name: "Long Videos", line: "YouTube, brand videos and ads.",
    options: [
      { id: "talking-head-videos", name: "Talking-Head Videos", price: 2499, unit: "each", delivery: "2 days", days: 2, video: true, qty: true },
      { id: "youtube-videos", name: "YouTube Videos", price: 2999, unit: "each", delivery: "3 days", days: 3, popular: true, video: true, qty: true },
      { id: "brand-videos", name: "Business & Brand Videos", price: 3999, unit: "each", delivery: "4 days", days: 4, video: true, qty: true },
      custom("custom-long-video", "Custom Long Video"),
    ],
    extras: [
      { id: "long-thumbnail", name: "Thumbnail", price: 499 },
      { id: "long-motion-graphics", name: "Motion graphics", price: 999 },
      { id: "shorts-from-video", name: "Shorts from this video", price: 399 },
    ],
    free: ["Subtitles", "Color correction", "2 revisions"],
    placeholder: "Example: 15-minute challenge videos, fast cuts and sound effects",
    need: ["Raw footage (Google Drive link)", "Reference videos", "Thumbnail ideas", "Chapter notes, if any"],
  },
  {
    id: "motion-graphics", studio: "create", name: "Motion Graphics", line: "Logos, intros and thumbnails.",
    options: [
      { id: "thumbnail-design", name: "Thumbnail Design", price: 399, unit: "each", delivery: "24 hours", days: 1, popular: true, qty: true },
      { id: "logo-intro-animation", name: "Logo & Intro Animation", price: 1999, unit: "one", delivery: "2 days", days: 2, popular: true, video: true, qty: true },
      { id: "explainer-video", name: "Explainer Video", price: 7999, unit: "one", delivery: "7 days", days: 7, video: true, qty: true },
      custom("custom-animation", "Custom Animation"),
    ],
    extras: [{ id: "voice-over", name: "Voice-over", price: 999 }],
    free: ["Sound design", "2 revisions"],
    placeholder: "Example: 5-second logo animation for my YouTube intro, bold and energetic",
    need: ["Logo file (PNG or SVG)", "Brand colors", "Script or idea", "References"],
  },
];

/** Popular options first, then the rest in their listed order (custom stays last). */
export const orderedOptions = (s: Service) => [...s.options.filter((o) => o.popular), ...s.options.filter((o) => !o.popular)];
export const startingFrom = (s: Service) => Math.min(...s.options.filter((o) => o.price !== null).map((o) => o.price!));
export const mostPicked = (s: Service) => s.options.find((o) => o.popular)?.name ?? s.options[0].name;

export const OPTIONS: Record<string, Option & { service: Service }> = {};
export const EXTRAS: Record<string, Extra & { service: Service }> = {};
export const SERVICES: Record<string, Service> = {};
/** Rebuilds the lookups above in place (after website content is loaded from the database). */
export function rebuildIndexes() {
  for (const m of [OPTIONS, EXTRAS, SERVICES] as Record<string, unknown>[]) for (const k of Object.keys(m)) delete m[k];
  for (const s of services) {
    SERVICES[s.id] = s;
    for (const o of s.options) OPTIONS[o.id] = { ...o, service: s };
    for (const x of s.extras) EXTRAS[x.id] = { ...x, service: s };
  }
}
rebuildIndexes();

/* ---------------- STUDIOS ---------------- */
export type StudioId = StudioKey | "grow";
/** GROW is Beta / coming soon: three planned items, no prices. */
export interface PlannedService { id: string; title: string; items: string[]; summary: string; forWho: string }
export interface Studio {
  id: StudioId; verb: string; name: string; href: string; tagline: string; lead: string; accent: string;
  beta?: boolean;
  /** "From" price shown on the studio cards, when it should not be the cheapest option of all (BUILD: projects start at ₹4,999; the ₹999 Quick Fix is a small Website Care job). */
  cardFrom?: number;
  /** What it helps to have ready before a project starts. */
  inputs?: string[];
  /** GROW only. */
  planned?: PlannedService[];
}

export const studios: Studio[] = [
  {
    id: "create", verb: "CREATE", name: "Video Editing", href: "/create", accent: "#22d3ee",
    tagline: "Short videos, long videos and motion graphics that hold attention.",
    lead: "Editing for people who publish: short videos, long videos and motion graphics, finished and exported for the platforms you post on.",
    inputs: ["Raw footage", "Brand assets", "References"],
  },
  {
    id: "build", verb: "BUILD", name: "Websites & Technology", href: "/build", accent: "#8b5cf6", cardFrom: 4999,
    tagline: "Websites, automation, AI and apps built to do a job.",
    lead: "Technology built to do a job: business websites, workflow automation, AI assistants, AI SaaS platforms, mobile apps and website care.",
    inputs: ["Content", "Branding", "Examples you like"],
  },
  {
    id: "grow", verb: "GROW", name: "Digital Marketing", href: "/grow", accent: "#c7a6ff", beta: true,
    tagline: "In development. Digital marketing is in beta and not on sale yet.",
    lead: "We are building a digital marketing studio and testing how we would deliver it. Paid marketing services are not offered yet. This page shows what is in development.",
    planned: [
      { id: "meta-google-ads", title: "Meta & Google Ads", items: ["Campaign setup & monitoring", "Creative coordination", "Campaign reporting"], summary: "Setting up and monitoring ad campaigns on Meta and Google, with the creative coordinated alongside.", forWho: "Planned for businesses that want to advertise online." },
      { id: "social-media", title: "Social media management", items: ["Content planning & calendars", "Posting schedules", "Page management"], summary: "Planning what to post and when: content calendars, posting schedules and page management.", forWho: "Planned for businesses that want a steady social presence." },
      { id: "local-presence", title: "Local presence & analytics", items: ["Google Business Profile support", "Marketing reporting", "Basic visibility strategy"], summary: "Support with a Google Business Profile, plain marketing reporting and a basic visibility strategy.", forWho: "Planned for local businesses that want to be easier to find." },
    ],
  },
];

export const STUDIOS = Object.fromEntries(studios.map((s) => [s.id, s])) as Record<StudioId, Studio>;
/** The priced services of a studio, in display order (GROW has none). */
export const servicesOf = (studio: StudioId) => services.filter((s) => s.studio === studio);
/** "From" price of a studio: its cardFrom if set, else the lowest price in it; null for GROW. */
export const studioFrom = (studio: StudioId) => { const l = servicesOf(studio); return l.length ? STUDIOS[studio].cardFrom ?? Math.min(...l.map(startingFrom)) : null; };
/** The options inside a service, popular first: "Reels & Shorts", "Ad Videos", "Monthly 12 Reels". */
export const optionNames = (s: Service) => orderedOptions(s).map((o) => o.name);
/** Name of any service or planned GROW item, by id. */
export const serviceTitle = (id: string) => SERVICES[id]?.name ?? studios.flatMap((s) => s.planned ?? []).find((p) => p.id === id)?.title ?? "";

/* ---------------- combo packs ---------------- */
/** Combo packs: listed on /studios (and the homepage), applied automatically on /start-project when the selection matches. */
export const COMBOS_ENABLED = true;

export interface Combo {
  id: string;
  name: string;
  tag?: string;
  inside: string;
  items: { id: string; qty: number }[];
  normal: number;
  price: number;
  /** Combo price is per month (Creator Pack). */
  monthly?: boolean;
  save: number;
}

export const combos: Combo[] = [
  { id: "starter", name: "Starter Pack", inside: "Landing Page + 2 Reels & Shorts",
    items: [{ id: "landing-page", qty: 1 }, { id: "reels-shorts", qty: 2 }], normal: 6397, price: 5499, save: 898 },
  { id: "launch", name: "Launch Pack", tag: "Best for new businesses", inside: "Business Website + Logo & Intro Animation + 4 Reels & Shorts",
    items: [{ id: "business-website", qty: 1 }, { id: "logo-intro-animation", qty: 1 }, { id: "reels-shorts", qty: 4 }], normal: 12794, price: 10999, save: 1795 },
  { id: "creator", name: "Creator Pack", tag: "Best for YouTubers", inside: "4 YouTube Videos + 4 Thumbnail Designs + 8 Reels & Shorts",
    items: [{ id: "youtube-videos", qty: 4 }, { id: "thumbnail-design", qty: 4 }, { id: "reels-shorts", qty: 8 }], normal: 19184, price: 15999, monthly: true, save: 3185 },
  { id: "local-business", name: "Local Business Pack", inside: "Booking Website + AI Booking Assistant + 3 months Monthly Maintenance",
    items: [{ id: "booking-website", qty: 1 }, { id: "ai-booking-assistant", qty: 1 }, { id: "monthly-maintenance", qty: 1 }], normal: 27495, price: 22999, save: 4496 },
  { id: "ai-business", name: "AI Business Pack", tag: "Most popular", inside: "Business Website + AI Chatbot + WhatsApp Automation",
    items: [{ id: "business-website", qty: 1 }, { id: "ai-chatbot", qty: 1 }, { id: "whatsapp-automation", qty: 1 }], normal: 27997, price: 23999, save: 3998 },
  { id: "growth", name: "Growth Pack", inside: "Online Store + WhatsApp Automation + Monthly 12 Reels",
    items: [{ id: "online-store", qty: 1 }, { id: "whatsapp-automation", qty: 1 }, { id: "monthly-12-reels", qty: 1 }], normal: 36997, price: 31999, save: 4998 },
];

/* ---------------- discounts, referral, words ---------------- */
/** CREATE only. Not for Monthly 12 Reels or videos already inside a combo. */
export const VIDEO_TIERS = [
  { min: 11, pct: 15 },
  { min: 6, pct: 10 },
  { min: 2, pct: 5 },
];
export const REFERRAL = { discount: 500, credit: 500, minTotal: 2000, prefix: "MKE" };

export const COPY = {
  heading: "Services and prices",
  delivery: "Delivery starts after the 50% advance and once we have everything we need from you. Bulk video orders are delivered in batches.",
  /** One name for the free-text box everywhere (selector, Start a Project, contact form, FAQ). */
  requirementsName: "Your requirements",
  requirementsLabel: "Your requirements (optional)",
  requirementsHelp: "Tell us anything special. For a custom quote, describe what you need here.",
  smallChanges: "Small changes are always free: text, images, colors and small fixes. We only charge for new work, like new pages, new features or new videos.",
  payment: [
    "50% advance to start, 50% before final files or going live.",
    "Pay by UPI or payment link.",
    "The final price is confirmed on WhatsApp before any work starts.",
    "Small changes are always free. New work is quoted separately.",
    "Domain, hosting, WhatsApp API, AI usage and app store fees, if needed, are paid at actual cost.",
    "Full refund if work hasn't started. No refund once work has started.",
  ],
  referShare: (link: string) => `I use MAKENDLESS for websites and videos. Use my link to get ₹${REFERRAL.discount} off your first order: ${link}`,
};

export const REQUIREMENTS_MAX = 500;

/** Website Care monthly price (Monthly Maintenance), shown everywhere as "Add-on · ₹X/month". */
export const careMonthly = () => OPTIONS["monthly-maintenance"]?.price ?? 0;
/** Referral rule, written once for every referral section and the FAQ. */
/** Card price text: "from ₹4,999", or "Add-on · ₹1,499/month" for Website Care. */
export const cardPriceText = (s: Service) => s.id === "website-care" ? `Add-on · ₹${careMonthly().toLocaleString("en-IN")}/month` : `from ₹${startingFrom(s).toLocaleString("en-IN")}`;
export const referralRule = () => `on projects of ₹${REFERRAL.minTotal.toLocaleString("en-IN")} or more`;
/** FAQ / copy tokens that always show the current price-file values. */
export const fillTokens = (t: string) => t
  .replace(/\{websiteCare\}/g, `₹${careMonthly().toLocaleString("en-IN")}`)
  .replace(/\{referralMin\}/g, `₹${REFERRAL.minTotal.toLocaleString("en-IN")}`)
  .replace(/\{referralReward\}/g, `₹${REFERRAL.discount.toLocaleString("en-IN")}`);
