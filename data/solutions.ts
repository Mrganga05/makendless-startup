import type { StudioId } from "./studios";

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

