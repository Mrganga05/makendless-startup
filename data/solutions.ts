import type { StudioId } from "./pricing";

/** A recommended service. `id` points at a service in data/pricing.ts; its name is always read from there. */
export interface SolutionService {
  studio: StudioId;
  /** Service id in data/pricing.ts, e.g. "short-videos" (or a planned GROW item id). */
  id: string;
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
  /** A GROW option, shown with its Beta badge and the GROW status ("Beta - taking first clients"). */
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
      { studio: "create", id: "short-videos", note: "Reels and Shorts with captions, cut for the feed." },
      { studio: "create", id: "long-videos", note: "YouTube videos and podcasts, edited and ready to post." },
      { studio: "create", id: "motion-graphics", note: "Intros, logo animation and thumbnails." },
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
      { studio: "build", id: "websites", note: "A website for your services, timings and location." },
      { studio: "build", id: "automation", note: "Enquiries, bookings and follow-ups handled automatically." },
      { studio: "create", id: "short-videos", note: "Short promo videos for your page and socials." },
    ],
    later: { studio: "grow", id: "local-presence", note: "Beta - taking first clients. A possible next step." },
  },
  {
    id: "startup",
    label: "Startup",
    hint: "New products, launches, pitches",
    headline: "Explain the idea before the meeting.",
    blurb: "A sharp landing page and a pitch-style promo video, so people understand what you are making and where to sign up.",
    primary: "build",
    services: [
      { studio: "build", id: "websites", note: "A landing page for your launch." },
      { studio: "build", id: "saas", note: "Your idea built as AI software you can launch." },
      { studio: "create", id: "long-videos", note: "A brand or product video for the page and the pitch." },
    ],
    later: { studio: "grow", id: "meta-google-ads", note: "Beta - taking first clients. A possible next step." },
  },
  {
    id: "store",
    label: "Online Store",
    hint: "Products, catalogues, small brands",
    headline: "A store built to show your products well.",
    blurb: "A storefront that is easy to browse on a phone, with product videos that show the details a photo cannot.",
    primary: "build",
    services: [
      { studio: "build", id: "websites", note: "An online store with products, cart and payments." },
      { studio: "create", id: "short-videos", note: "Ad videos and product Reels." },
      { studio: "build", id: "website-care", note: "Keeps the store fast, safe and up to date." },
    ],
    later: { studio: "grow", id: "social-media", note: "Beta - taking first clients. A possible next step." },
  },
];
