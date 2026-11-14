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

