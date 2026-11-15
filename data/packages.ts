import type { StudioId } from "./studios";

/* Package "starting points". Names and deliverables are proposals awaiting owner sign-off.
   No prices, revision counts, delivery times or guarantees live here on purpose: every project is quoted. */
export interface Package {
  /** URL-safe id, unique inside its studio. Used in /contact?service=<studio>&package=<slug>. */
  slug: string;
  name: string;
  for: string;
  deliverables: string[];
  addons: string[];
  /** Scope info: what makes a quote larger or smaller. Factors only, never amounts. */
  quoteDependsOn: string[];
  /** Scope info: what the client would need to supply for this kind of project. */
  youProvide: string[];
}

export const packages: Record<StudioId, Package[]> = {
  create: [
    {
      slug: "starter", name: "Starter", for: "Creators needing individual short-form videos",
      deliverables: ["Single Reel or Short", "Captions & sound sync", "Platform-ready export"],
      addons: ["Thumbnail", "Extra aspect ratio"],
      quoteDependsOn: ["Length of your raw footage", "Caption and effects complexity", "How soon you need it"],
      youProvide: ["Your raw footage", "Music or brand assets you have the rights to use", "A reference for the style you like"],
    },
    {
      slug: "creator", name: "Creator", for: "Regular posters who want bundles",
      deliverables: ["Bundle of Reels & Shorts", "Consistent caption style", "Multiple platform exports"],
      addons: ["Subtitle versions", "Teasers"],
      quoteDependsOn: ["Number of videos in the bundle", "Footage length per video", "How often you post"],
      youProvide: ["Raw footage for each video", "Brand fonts and colours, if you have them", "The platforms you post on"],
    },
    {
      slug: "professional", name: "Professional", for: "Long-form and recurring editing",
      deliverables: ["YouTube / podcast edits", "Highlight clips", "Ongoing editing arrangement"],
      addons: ["Audio cleanup", "Motion graphics"],
      quoteDependsOn: ["Running length of each episode", "Number of cameras and audio sources", "Highlight clips needed per episode", "How regularly you publish"],
      youProvide: ["Full recordings, with separate audio if available", "Intro, outro and brand assets", "Notes on moments to keep or cut"],
    },
    {
      slug: "custom", name: "Custom", for: "Promotional and complex productions",
      deliverables: ["Ads & brand videos", "Motion graphics", "Campaign edits"],
      addons: ["Logo motion", "Multilingual versions"],
      quoteDependsOn: ["Type and length of the video", "Amount of motion graphics", "Number of versions and aspect ratios", "How soon you need it"],
      youProvide: ["Footage, product shots or screen recordings", "Script or key messages", "Logo and brand guidelines"],
    },
  ],
  build: [
    {
      slug: "starter", name: "Starter", for: "A focused landing page",
      deliverables: ["Responsive landing page", "Working contact form", "Basic SEO setup"],
      addons: ["Analytics", "Extra sections"],
      quoteDependsOn: ["Number of sections on the page", "Design and animation complexity", "Whether text and images are ready", "How soon you need it"],
      youProvide: ["Text and images, or a brief for them", "Logo and brand colours", "Domain and hosting details, if you have them"],
    },
    {
      slug: "business", name: "Business", for: "Professional multipage websites",
      deliverables: ["Multi-page responsive site", "Content structure", "Tested forms"],
      addons: ["CMS", "Portfolio gallery"],
      quoteDependsOn: ["Number of pages and page layouts", "Whether you need to edit content yourself", "Forms and integrations", "Design complexity"],
      youProvide: ["A list of the pages you need", "Text, photos and brand assets", "Access to your current site or domain, if any"],
    },
    {
      slug: "commerce", name: "Commerce", for: "Online stores",
      deliverables: ["Catalogue & product pages", "Cart experience", "Approved checkout integration"],
      addons: ["Product video", "Extra integrations"],
      quoteDependsOn: ["Number of products and variants", "Payment and shipping setup", "Integrations with other tools", "Design complexity"],
      youProvide: ["Product details and photos", "Your payment provider and shipping details", "Your store policies, written by you"],
    },
    {
      slug: "custom", name: "Custom", for: "Booking systems and web apps",
      deliverables: ["Booking / scheduling flow", "Customer forms", "Custom features"],
      addons: ["Third-party integrations"],
      quoteDependsOn: ["Features and user flows", "Integrations with other tools", "Accounts and data that must be stored", "How soon you need it"],
      youProvide: ["A description of how the booking or process should work", "Access to the tools it must connect to", "Example content and test data"],
    },
    {
      slug: "maintenance", name: "Maintenance", for: "Ongoing support after launch",
      deliverables: ["Content updates", "Bug fixes", "Technical updates"],
      addons: ["Performance review"],
      quoteDependsOn: ["Size and technology of the existing site", "How often updates are needed", "The kind of changes you expect"],
      youProvide: ["Access to the site, hosting and code", "A list of the updates you need", "A contact who can approve changes"],
    },
  ],
  /* GROW is Beta / Coming Soon: there are no packages to request yet. See `growPreview`. */
  grow: [],
};

/** Honest "coming soon" description of the GROW studio. Nothing here is offered for sale yet. */
export interface GrowPreview {
  status: string;
  title: string;
  summary: string;
  planned: { title: string; note: string }[];
  /** What a future quote would be based on, once the studio opens. */
  wouldDependOn: string[];
  cta: { label: string; href: string; note: string };
}

export const growPreview: GrowPreview = {
  status: "Coming soon",
  title: "Digital marketing is still in the workshop.",
  summary: "We are developing this studio and are not taking on marketing work yet. There are no marketing packages, campaigns or prices to request today.",
  planned: [
    { title: "Meta & Google Ads", note: "Setting up and looking after ad campaigns, with the creative made alongside our video team." },
    { title: "Social media management", note: "Content planning, calendars and posting schedules for your pages." },
    { title: "Local presence & analytics", note: "Google Business Profile support and plain-language reporting." },
  ],
  wouldDependOn: ["The platforms you want to be on", "How much content is needed", "Whether creative is produced by us or supplied by you"],
  cta: {
    label: "Tell us you're interested",
    href: "/contact?service=grow",
    note: "Opens the project form with Digital Marketing (Beta) selected. It is not a sign-up or a commitment.",
  },
};
