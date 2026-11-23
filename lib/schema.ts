/* Structured data (JSON-LD) for search engines: MAKENDLESS as a local business in India, the website,
   and the service catalogue with the live prices. Built from the same data the pages use. */
import { services, studios } from "../data/pricing";
import { SETTINGS } from "../data/settings";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";

export function structuredData() {
  const prices = services.flatMap((s) => s.options.map((o) => o.price)).filter((p): p is number => typeof p === "number" && p > 0);
  const min = prices.length ? Math.min(...prices) : 0;
  const phone = SETTINGS.whatsapp.replace(/[^\d+]/g, "");
  const business = {
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    image: `${SITE_URL}/opengraph-image.png`,
    description: SITE_DESCRIPTION,
    slogan: "We make ideas impossible to ignore.",
    ...(SETTINGS.email ? { email: SETTINGS.email } : {}),
    ...(phone ? { telephone: phone.startsWith("+") ? phone : `+91${phone}` } : {}),
    address: { "@type": "PostalAddress", addressCountry: "IN" },
    areaServed: [{ "@type": "Country", name: "India" }, "Worldwide"],
    currenciesAccepted: "INR",
    ...(min ? { priceRange: `From ₹${min.toLocaleString("en-IN")}` } : {}),
    sameAs: Object.values(SETTINGS.socials).filter(Boolean),
    knowsAbout: services.map((s) => s.name),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services",
      itemListElement: studios.filter((st) => !st.beta).map((st) => ({
        "@type": "OfferCatalog",
        name: `${st.verb} — ${st.name}`,
        itemListElement: services.filter((s) => s.studio === st.id).map((s) => {
          const from = s.options.map((o) => o.price).filter((p): p is number => typeof p === "number" && p > 0);
          return {
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: s.name, description: s.line },
            url: `${SITE_URL}${st.href}#${s.id}`,
            ...(from.length ? { priceSpecification: { "@type": "PriceSpecification", minPrice: Math.min(...from), priceCurrency: "INR" } } : {}),
          };
        }),
      })),
    },
  };
  const website = { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, publisher: { "@id": `${SITE_URL}/#business` }, inLanguage: "en-IN" };
  return { "@context": "https://schema.org", "@graph": [business, website] };
}
