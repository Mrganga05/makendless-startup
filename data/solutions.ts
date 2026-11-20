import type { StudioId } from "./studios";

/** A recommended service. `code` points at the service catalogue in data/studios.ts (the title is read from there). */
export interface SolutionService {
  studio: StudioId;
  /** Catalogue code, e.g. "V4" (see data/studios.ts). */
  code: string;
  /** Catalogue title (kept in sync with data/studios.ts). */
  title: string;
  /** One short line: what this service means for this customer type. No outcome promises. */
  note: string;
}

export type SolutionId = "creator" | "local" | "startup" | "store";

export interface Solution {
  /** Also the `?for=` value on /contact (link contract). */
  id: SolutionId;
  label: string;
  /** One line under the label in the selector. */
  hint: string;
  headline: string;
  blurb: string;
  /** The studio page "Explore Services" opens for this customer type. */
  primary: StudioId;
  /** Services available today (CREATE / BUILD). */
  services: SolutionService[];
  /** A GROW option. Always shown as Beta and as a future option, never as a current service. */
  later?: SolutionService;
}

export const solutions: Solution[] = [
  {
    id: "creator",
    label: "Content Creator",
    hint: "Channels, podcasts, personal brands",
    headline: "One recording, cut for every feed.",
    blurb: "Send us the long video. We edit it, cut it into vertical shorts, add captions and export each one for the platform it is going to.",
    primary: "create",
    services: [
      { studio: "create", code: "V4", title: "Repurposing & creator packages", note: "Long video cut into short clips, in the aspect ratios you post in." },
      { studio: "create", code: "V1", title: "Short-form video editing", note: "Captioned, vertical-first Reels and Shorts." },
      { studio: "create", code: "V5", title: "Motion graphics & creative editing", note: "Animated titles, captions, intros and outros." },
    ],
  },
  {
    id: "local",
    label: "Local Business",
    hint: "Cafés, salons, clinics, studios",
    headline: "Easy to find. Easy to book.",
    blurb: "A clear website that says what you do, a simple way to request a booking, and a short promo video that shows the place.",
    primary: "build",
    services: [
      { studio: "build", code: "T1", title: "Business websites", note: "A responsive site for your services, hours and location." },
      { studio: "build", code: "T3", title: "Booking systems & web apps", note: "Service selection and appointment requests." },
      { studio: "create", code: "V3", title: "Promotional & ad video", note: "A short intro video for your site and socials." },
    ],
    later: { studio: "grow", code: "M3", title: "Local presence & analytics", note: "In beta and not offered yet. A possible next step later on." },
  },
  {
    id: "startup",
    label: "Startup",
    hint: "New products, launches, pitches",
    headline: "Explain the idea before the meeting.",
    blurb: "A sharp landing page and a pitch-style promo video, so people understand what you are making and where to sign up.",
    primary: "build",
    services: [
      { studio: "build", code: "T1", title: "Business websites", note: "A responsive launch or landing page." },
      { studio: "create", code: "V3", title: "Promotional & ad video", note: "A product intro video for the page and the pitch." },
      { studio: "build", code: "T3", title: "Booking systems & web apps", note: "Custom features, such as a waitlist or demo requests." },
    ],
    later: { studio: "grow", code: "M1", title: "Meta & Google Ads", note: "In beta and not offered yet. A possible next step later on." },
  },
  {
    id: "store",
    label: "Online Store",
    hint: "Products, catalogues, small brands",
    headline: "A store built to show your products well.",
    blurb: "A storefront that is easy to browse on a phone, with product videos that show the details a photo cannot.",
    primary: "build",
    services: [
      { studio: "build", code: "T2", title: "E-commerce websites", note: "Catalogue, product pages and a mobile-first cart." },
      { studio: "create", code: "V3", title: "Promotional & ad video", note: "Product videos and social ad creatives." },
      { studio: "create", code: "V1", title: "Short-form video editing", note: "Vertical product clips for Reels and Shorts." },
    ],
    later: { studio: "grow", code: "M2", title: "Social media management", note: "In beta and not offered yet. A possible next step later on." },
  },
];
