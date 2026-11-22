import { COPY } from "./pricing";

/*
 * How we work + FAQ copy.
 * FAQ copy follows the owner's approved policies (2026-11-19). The "How we work" steps below are the homepage version.
 */
export const process = [
  { n: "01", title: "Discover", text: "Pick your services on our website and tell us your requirements." },
  { n: "02", title: "Confirm", text: "We confirm the final price and delivery time on WhatsApp. You pay a 50% advance to start." },
  { n: "03", title: "Create", text: "Our team edits, builds, or both, and keeps you updated." },
  { n: "04", title: "Deliver", text: "You review the work, we make your revisions, and you pay the balance to get the final files or go live." },
];

/** FAQ answer: a paragraph, then optional bullets ("**bold**" allowed) and a closing line. */
export type Faq = { q: string; a: string; list?: string[]; after?: string };

/** /faq page: grouped by category, in this order. */
export const faqGroups: { title: string; items: Faq[] }[] = [
  { title: "Getting started", items: [
    { q: "How do I start a project?", a: "Pick the services you need on our website. You'll see the price and delivery time straight away. Then press \"Start a Project\", add your name and WhatsApp number, and we'll message you within 24 hours with your final price and timeline." },
    { q: "I'm not sure what I need. Can you help?", a: `Yes. Tell us about your business or channel in the \"${COPY.requirementsName}\" box, or message us on WhatsApp. We'll suggest the best service or combo pack for you.` },
    { q: "What do you need from me?", a: "It depends on the service. After you select one, our website shows a \"What we need from you\" list. Usually:", list: [
      "**Videos:** raw footage (Google Drive link), reference videos, logo and brand colors",
      "**Websites:** logo, business details, photos, and domain or hosting login if you have one",
      "**Automation and AI:** your WhatsApp Business number, your FAQs, and logins for the apps to connect",
    ] },
    { q: "Do you work with clients outside India?", a: "Yes. We work online with clients across India and abroad." },
  ] },
  { title: "Prices and payment", items: [
    { q: "Are your prices fixed?", a: "Yes. Every service has a fixed price shown on our website, and the same quality for every client. We confirm the final price on WhatsApp before work starts. Custom requests are quoted after a quick chat." },
    { q: "Why are your prices lower than agencies?", a: "We're a small expert team with no big office or agency overheads. You pay for the work, not the office." },
    { q: "How do I pay?", a: "50% advance to start, and 50% before we hand over final files or make your project live. You can pay by UPI or payment link." },
    { q: "Are there any extra costs?", a: "Only outside tools, which you pay at actual cost: domain and hosting, WhatsApp API charges, AI usage, phone call minutes, payment gateway fees and app store fees. We tell you about these before starting." },
    { q: "Do you charge GST?", a: "Prices shown don't include GST. Once MAKENDLESS is GST-registered, 18% GST will be added to invoices." },
  ] },
  { title: "Delivery and changes", items: [
    { q: "How long will it take?", a: "Each service shows its delivery time on our website. For example, reels take 24–48 hours, a YouTube video 3 days, a business website 7 days and an online store 14 days. Delivery starts after the 50% advance and once we have everything we need from you." },
    { q: "Are changes free?", a: "Small changes are always free: text, images, colors, small fixes, and edits within your brief.", list: [
      "**Videos:** 2 rounds of revisions included",
      "**Websites, automation and AI:** 30 days of free small changes",
      "**Apps and software:** 60 days of free fixes and small changes",
    ], after: "New work, like new pages, new features or new videos, is quoted separately." },
    { q: "What if I'm not happy with the work?", a: "Tell us what's wrong and we'll fix it within your included revisions. We agree on the brief before starting, so the result matches what you asked for." },
    { q: "Can I get a refund?", a: "Full refund if you cancel before work starts. Once work has started, we can't refund the advance, because our team's time has been spent. If we can't finish your project for reasons on our side, we refund the payment for work not delivered." },
    { q: "Do I own the final work?", a: "Yes. Once you've paid in full, the final videos, website, app or system are yours." },
  ] },
  { title: "Offers", items: [
    { q: "What are combo packs?", a: "Ready-made bundles that cost less than buying each service alone, for example the Launch Pack (website + logo animation + 4 reels) or the Creator Pack (4 YouTube videos + 4 thumbnails + 8 reels every month). If your selections match a pack, our website applies the discount automatically." },
    { q: "Do you give discounts on more videos?", a: "Yes: 5% off for 2–5 videos, 10% off for 6–10 and 15% off for 11 or more. It's applied automatically." },
    { q: "How does the referral offer work?", a: "Get your unique referral link on our website and share it. When a friend starts a project of {referralMin} or more with your link, they get {referralReward} off and you get {referralReward} off your next order." },
  ] },
  { title: "Support", items: [
    { q: "Do you offer ongoing support?", a: `Yes. Website Care is an add-on at {websiteCare}/month, and monthly care plans are available for automation and AI assistants. For videos, the Monthly 12 Reels plan and the Creator Pack cover regular editing.` },
    { q: "Is digital marketing available?", a: "Digital marketing (GROW) is still in beta and not open for orders yet." },
  ] },
];

export const faqs: Faq[] = faqGroups.flatMap((g) => g.items);

/** Homepage FAQ preview: these 6 only, same answers as /faq. */
const HOME_QUESTIONS = ["How do I start a project?", "Are your prices fixed?", "How do I pay?", "How long will it take?", "Are changes free?", "How does the referral offer work?"];
export const homeFaqs = (): Faq[] => { const hits = HOME_QUESTIONS.map((q) => faqs.find((f) => f.q === q)).filter(Boolean) as Faq[]; return hits.length >= 3 ? hits : faqs.slice(0, 6); };

/** Section copy that used to be hard-coded in components/ProcessFaq.tsx. */
export const processCopy = {
  eyebrow: "How we work",
  title: "From idea to",
  titleAccent: "delivery.",
  intro: "Four steps, the same order every time. What changes from project to project is agreed with you before work starts.",
  faqTitle: "Questions, answered plainly.",
  faqIntro: "Your final price and delivery time are confirmed with you on WhatsApp before any work starts.",
  cta: "Start a Project",
  allQuestions: "All questions",
};
