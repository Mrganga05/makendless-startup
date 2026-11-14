import type { StudioId } from "./studios";

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

