export type StudioId = "create" | "build" | "grow";

export interface Studio {
  id: StudioId;
  verb: string;
  name: string;
  href: string;
  tagline: string;
  beta?: boolean;
  accent: string;
  services: { code: string; title: string; items: string[] }[];
}

export const studios: Studio[] = [
  {
    id: "create",
    verb: "CREATE",
    name: "Video Editing",
    href: "/create",
    tagline: "Reels, long-form, ads and motion graphics that hold attention.",
    accent: "#22d3ee",
    services: [
      { code: "V1", title: "Short-form video editing", items: ["Instagram Reels & YouTube Shorts", "Captioned, vertical-first edits", "Creative transitions & sound sync"] },
      { code: "V2", title: "Long-form & podcast editing", items: ["YouTube & interview edits", "Audio sync & basic enhancement", "Highlight creation"] },
      { code: "V3", title: "Promotional & ad video", items: ["Product & brand intro videos", "Social ad creatives", "Event promotion content"] },
      { code: "V4", title: "Repurposing & creator packages", items: ["Long video to short clips", "Multiple aspect ratios & subtitles", "Platform-specific exports"] },
      { code: "V5", title: "Motion graphics & creative editing", items: ["Kinetic typography & animated titles", "Animated captions, intros & outros", "Logo motion on request"] },
    ],
  },
  {
    id: "build",
    verb: "BUILD",
    name: "Website Development",
    href: "/build",
    tagline: "Fast, responsive, accessible websites built to do a job.",
    accent: "#8b5cf6",
    services: [
      { code: "T1", title: "Business websites", items: ["Company, service & portfolio sites", "Responsive landing pages", "Content-managed where appropriate"] },
      { code: "T2", title: "E-commerce websites", items: ["Product catalogues & pages", "Carts & approved checkout integrations", "Mobile-first shopping experiences"] },
      { code: "T3", title: "Booking systems & web apps", items: ["Booking & appointment interfaces", "Service selection & scheduling", "Custom features & integrations"] },
      { code: "T4", title: "Redesign & optimization", items: ["Visual & UX redesign", "Accessibility & responsive fixes", "Measured performance work"] },
      { code: "T5", title: "Maintenance & support", items: ["Content updates & bug fixes", "Technical updates", "Agreed ongoing support"] },
    ],
  },
  {
    id: "grow",
    verb: "GROW",
    name: "Digital Marketing",
    href: "/grow",
    tagline: "We are learning in public. Join the beta list.",
    beta: true,
    accent: "#c7a6ff",
    services: [
      { code: "M1", title: "Meta & Google Ads", items: ["Campaign setup & monitoring", "Creative coordination", "Campaign reporting"] },
      { code: "M2", title: "Social media management", items: ["Content planning & calendars", "Posting schedules", "Page management"] },
      { code: "M3", title: "Local presence & analytics", items: ["Google Business Profile support", "Marketing reporting", "Basic visibility strategy"] },
    ],
  },
];

export interface Package {
  name: string;
  for: string;
  deliverables: string[];
  addons: string[];
}

export const packages: Record<StudioId, Package[]> = {
  create: [
    { name: "Starter", for: "Creators needing individual short-form videos", deliverables: ["Single Reel or Short", "Captions & sound sync", "Platform-ready export"], addons: ["Thumbnail", "Extra aspect ratio"] },
    { name: "Creator", for: "Regular posters who want bundles", deliverables: ["Bundle of Reels & Shorts", "Consistent caption style", "Multiple platform exports"], addons: ["Subtitle versions", "Teasers"] },
    { name: "Professional", for: "Long-form and recurring editing", deliverables: ["YouTube / podcast edits", "Highlight clips", "Ongoing editing arrangement"], addons: ["Audio cleanup", "Motion graphics"] },
    { name: "Custom", for: "Promotional and complex productions", deliverables: ["Ads & brand videos", "Motion graphics", "Campaign edits"], addons: ["Logo motion", "Multilingual versions"] },
  ],
  build: [
    { name: "Starter", for: "A focused landing page", deliverables: ["Responsive landing page", "Working contact form", "Basic SEO setup"], addons: ["Analytics", "Extra sections"] },
    { name: "Business", for: "Professional multipage websites", deliverables: ["Multi-page responsive site", "Content structure", "Tested forms"], addons: ["CMS", "Portfolio gallery"] },
    { name: "Commerce", for: "Online stores", deliverables: ["Catalogue & product pages", "Cart experience", "Approved checkout integration"], addons: ["Product video", "Extra integrations"] },
    { name: "Custom", for: "Booking systems and web apps", deliverables: ["Booking / scheduling flow", "Customer forms", "Custom features"], addons: ["Third-party integrations"] },
    { name: "Maintenance", for: "Ongoing support after launch", deliverables: ["Content updates", "Bug fixes", "Technical updates"], addons: ["Performance review"] },
  ],
  grow: [
    { name: "Beta interest list", for: "Businesses curious about future marketing support", deliverables: ["Early-access updates", "Informative beta descriptions", "No commitments"], addons: [] },
  ],
};

export interface Solution {
  id: string;
  label: string;
  headline: string;
  services: { studio: StudioId; title: string }[];
  blurb: string;
}

export const solutions: Solution[] = [
  { id: "creator", label: "Content creator", headline: "Post more, burn out less.", blurb: "Turn one long recording into a week of content, polished and platform-ready.", services: [{ studio: "create", title: "Video editing" }, { studio: "create", title: "Content repurposing" }, { studio: "create", title: "Motion graphics" }] },
  { id: "local", label: "Local business", headline: "Be easy to find. Easy to book.", blurb: "A clear website, simple booking and a promo video that shows what you do.", services: [{ studio: "build", title: "Business website" }, { studio: "build", title: "Booking website" }, { studio: "create", title: "Promotional video" }] },
  { id: "startup", label: "Startup", headline: "Look ready before you are.", blurb: "A sharp landing page and launch content that explains your idea in seconds.", services: [{ studio: "build", title: "Business website" }, { studio: "build", title: "Landing page" }, { studio: "create", title: "Promotional content" }, { studio: "grow", title: "Marketing (beta)" }] },
  { id: "store", label: "Online store", headline: "Products that sell themselves.", blurb: "A store people enjoy using, with product videos that show the details.", services: [{ studio: "build", title: "E-commerce website" }, { studio: "create", title: "Product video editing" }, { studio: "grow", title: "Marketing (beta)" }] },
];

export const process = [
  { n: "01", title: "Discover", text: "We learn your business, goal and audience, then collect what we need to scope the work." },
  { n: "02", title: "Design", text: "We agree on scope, timeline, revisions and price in a written proposal before we start." },
  { n: "03", title: "Create", text: "An assigned owner and team produce the work, with an internal quality review." },
  { n: "04", title: "Deliver", text: "You review consolidated feedback, we handle agreed revisions, then deliver securely." },
];

export const faqs = [
  { q: "How do I start a project?", a: "Use Start a Project and tell us what you're building. We'll follow up to understand your goal, then outline scope and next steps." },
  { q: "What do you need from me?", a: "It depends on the service: raw footage, brand assets and references for video; content, branding and examples for websites. We'll send a clear list after discovery." },
  { q: "How does the quote process work?", a: "Pricing is based on effort, complexity, timeline and your requirements. You'll receive a written proposal covering deliverables, dependencies and price before any work begins." },
  { q: "How do revisions work?", a: "Revision limits are defined per package and written into your proposal. We collect consolidated feedback so each round is focused." },
  { q: "How long will it take?", a: "Delivery estimates depend on scope and your inputs, and are confirmed in the proposal. We don't promise timelines we haven't scoped." },
  { q: "Do you offer ongoing support?", a: "Yes. Ongoing video editing and website maintenance arrangements can be agreed after delivery. Digital marketing is still in beta." },
];
