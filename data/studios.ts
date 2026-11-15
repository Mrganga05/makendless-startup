/* Service catalogue: single source of truth for the three divisions. */
export type StudioId = "create" | "build" | "grow";

export interface Studio {
  id: StudioId;
  verb: string;
  name: string;
  href: string;
  tagline: string;
  beta?: boolean;
  accent: string;
  services: StudioService[];
  /** Longer lead paragraph for the division page. */
  lead?: string;
  /** Supporting deliverables available alongside the main services (from the service catalogue / package add-ons). */
  supporting?: string[];
  /** What the studio typically needs from the client to begin (mirrors the FAQ wording). */
  inputs?: string[];
}

export interface StudioService {
  code: string;
  title: string;
  items: string[];
  /** One or two plain sentences describing the service. */
  summary?: string;
  /** Who the service is for. */
  forWho?: string;
  /** Supporting deliverables that can accompany this service. */
  extras?: string[];
}

export const studios: Studio[] = [
  {
    id: "create",
    verb: "CREATE",
    name: "Video Editing",
    href: "/create",
    tagline: "Reels, long-form, ads and motion graphics that hold attention.",
    accent: "#22d3ee",
    lead: "Editing for people who publish: short-form, long-form, promotional video and motion graphics, finished and exported for the platforms you post on.",
    supporting: ["Thumbnails", "Subtitles", "Multiple aspect ratios", "Platform-specific exports", "Teasers", "Audio cleanup", "Logo motion", "Multilingual versions"],
    inputs: ["Raw footage", "Brand assets", "References"],
    services: [
      { code: "V1", title: "Short-form video editing", items: ["Instagram Reels & YouTube Shorts", "Captioned, vertical-first edits", "Creative transitions & sound sync"], summary: "Vertical edits with tight pacing, on-screen captions and sound that lands on the cut.", forWho: "Creators and businesses posting Reels and Shorts.", extras: ["Thumbnail or cover frame", "Subtitles", "Extra aspect ratio"] },
      { code: "V2", title: "Long-form & podcast editing", items: ["YouTube & interview edits", "Audio sync & basic enhancement", "Highlight creation"], summary: "Long recordings shaped into a watchable episode: synced audio, clean cuts and the highlight moments pulled out.", forWho: "YouTube channels, podcasts and interview shows.", extras: ["Audio cleanup", "Highlight clips", "Thumbnail"] },
      { code: "V3", title: "Promotional & ad video", items: ["Product & brand intro videos", "Social ad creatives", "Event promotion content"], summary: "Short films that introduce a product, a brand or an event, cut in the formats social ads need.", forWho: "Businesses, startups and online stores with something to launch.", extras: ["Multiple aspect ratios", "Subtitle versions", "Teasers"] },
      { code: "V4", title: "Repurposing & creator packages", items: ["Long video to short clips", "Multiple aspect ratios & subtitles", "Platform-specific exports"], summary: "One long video turned into a set of short clips, each framed and exported for the platform it is going to.", forWho: "Creators who post regularly and want more from every recording.", extras: ["9:16, 1:1 and 16:9 versions", "Subtitles", "Platform-specific exports"] },
      { code: "V5", title: "Motion graphics & creative editing", items: ["Kinetic typography & animated titles", "Animated captions, intros & outros", "Logo motion on request"], summary: "Movement that carries the message: kinetic type, animated titles and captions, intros and outros.", forWho: "Videos that need titles, explainers or a branded open and close.", extras: ["Logo motion on request", "Animated captions", "Motion graphics added to other edits"] },
    ],
  },
  {
    id: "build",
    verb: "BUILD",
    name: "Website Development",
    href: "/build",
    tagline: "Fast, responsive, accessible websites built to do a job.",
    accent: "#8b5cf6",
    lead: "Websites designed and developed to do a job: business sites, online stores, booking flows and custom web apps, responsive and accessible from the first layout.",
    supporting: ["Working contact forms", "Basic SEO setup", "CMS where appropriate", "Portfolio gallery", "Analytics setup", "Third-party integrations", "Performance review"],
    inputs: ["Content", "Branding", "Examples you like"],
    services: [
      { code: "T1", title: "Business websites", items: ["Company, service & portfolio sites", "Responsive landing pages", "Content-managed where appropriate"], summary: "Company, service and portfolio websites and focused landing pages, responsive from phone to desktop.", forWho: "Local businesses, startups and professionals who need a credible home online.", extras: ["Working contact form", "Basic SEO setup", "CMS where appropriate"] },
      { code: "T2", title: "E-commerce websites", items: ["Product catalogues & pages", "Carts & approved checkout integrations", "Mobile-first shopping experiences"], summary: "Stores designed around the product: catalogue, product pages, cart and an approved checkout integration.", forWho: "Online stores and brands starting to sell online.", extras: ["Product video with CREATE", "Extra integrations"] },
      { code: "T3", title: "Booking systems & web apps", items: ["Booking & appointment interfaces", "Service selection & scheduling", "Custom features & integrations"], summary: "Interfaces for choosing a service, picking a time and booking, plus custom features where a standard site will not do.", forWho: "Service businesses that take appointments, and teams that need a custom tool.", extras: ["Customer forms", "Third-party integrations"] },
      { code: "T4", title: "Redesign & optimization", items: ["Visual & UX redesign", "Accessibility & responsive fixes", "Measured performance work"], summary: "An existing website reworked: clearer design, responsive and accessibility fixes, and measured performance work.", forWho: "Businesses whose current site looks dated or is hard to use on a phone.", extras: ["Performance review"] },
      { code: "T5", title: "Maintenance & support", items: ["Content updates & bug fixes", "Technical updates", "Agreed ongoing support"], summary: "Content updates, bug fixes and technical updates after launch, under an arrangement agreed with you.", forWho: "Site owners who want someone to look after the website.", extras: ["Performance review"] },
    ],
  },
  {
    id: "grow",
    verb: "GROW",
    name: "Digital Marketing",
    href: "/grow",
    tagline: "In development. Digital marketing is in beta and not on sale yet.",
    beta: true,
    accent: "#c7a6ff",
    lead: "We are building a digital marketing studio and testing how we would deliver it. Paid marketing services are not offered yet. This page shows what is in development.",
    services: [
      { code: "M1", title: "Meta & Google Ads", items: ["Campaign setup & monitoring", "Creative coordination", "Campaign reporting"], summary: "Setting up and monitoring ad campaigns on Meta and Google, with the creative coordinated alongside.", forWho: "Planned for businesses that want to advertise online.", extras: [] },
      { code: "M2", title: "Social media management", items: ["Content planning & calendars", "Posting schedules", "Page management"], summary: "Planning what to post and when: content calendars, posting schedules and page management.", forWho: "Planned for businesses that want a steady social presence.", extras: [] },
      { code: "M3", title: "Local presence & analytics", items: ["Google Business Profile support", "Marketing reporting", "Basic visibility strategy"], summary: "Support with a Google Business Profile, plain marketing reporting and a basic visibility strategy.", forWho: "Planned for local businesses that want to be easier to find.", extras: [] },
    ],
  },
];

