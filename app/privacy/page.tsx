import type { Metadata } from "next";
import { loadContent } from "../../lib/content";
import PageShell from "../../components/PageShell";
import { ButtonLink } from "../../components/ui";
import { LegalSections, type LegalSection } from "../../components/Prose";
import { NUMBERS as N, OWNER as O } from "../../data/owner";
import { pageMeta } from "../../lib/site";

export const metadata: Metadata = pageMeta("Privacy Policy", "What information MAKENDLESS collects, why we collect it, how long we keep it and the choices you have.", "/privacy", { keywords: ["MAKENDLESS privacy policy", "data we collect", "WhatsApp data", "delete my data"] });

const lead = `MAKENDLESS ("we", "us") is a creative and technology studio based in India. We edit videos, build websites, set up automation and AI Assistant, and build apps for creators and businesses. This policy explains what information we collect, why, and the choices you have. We follow India's Digital Personal Data Protection Act, 2023.`;

const sections: LegalSection[] = [
  { id: "collect", title: "1. Information we collect", body: [
    { h: "Information you give us" },
    "We collect your name, WhatsApp number and messages through the Start a Project form, the contact brief, the referral form (Refer and earn) and our AI chatbot (the MAKENDLESS Assistant). This includes:",
    [
      "Your name and WhatsApp number, and your email if you share it",
      "The services you select, your requirements, and any messages you send us",
      "Files and links you share for your project: footage, logos, photos, website text, logins and access details",
      "Referral details: your referral code, and the name and WhatsApp number of people who use your code",
    ],
    { h: "The AI chatbot" },
    ["Chat messages are sent to our AI provider only to write the reply, and are not stored by us. If you give the chatbot your name and WhatsApp number, we save them with a short note of what you need, so the team can reply. The conversation itself stays in your browser and is cleared when you close the tab."],
    { h: "Payment information" },
    ["We record what you paid and when. Card, UPI and bank details are handled by our payment provider. We never see or store them."],
    { h: "Information collected automatically" },
    ["We use Meta Pixel to measure how well our ads work. It records visits and form sends on our website (not on our team dashboard). See [Meta's Privacy Policy](https://www.facebook.com/privacy/policy/)."],
  ] },
  { id: "use", title: "2. How we use your information", body: [
    [
      "To reply to you and prepare your quote",
      "To deliver your project and keep you updated, mainly on WhatsApp",
      "To send invoices and keep payment records",
      "To run our referral program and apply discounts",
      "To provide support after delivery",
    ],
    "Your information is used only to reply to your enquiry and to manage your project. We never sell it, and we never share it for anyone else's marketing or purposes. We will only send you marketing messages if you agree to receive them.",
  ] },
  { id: "files", title: "3. Your project files", body: [[
    "Your footage, files and business information are used only for your project.",
    "Team members see only what they need for your project.",
    "We may show finished work in our portfolio only if you agree. You can say no at any time.",
    `We keep project files for ${N.fileDays} days after delivery so we can handle changes, then delete them unless you ask us to keep them longer.`,
    "Logins and passwords you share are used only for your project. Please change them after we finish.",
  ]] },
  { id: "share", title: "4. Who we share information with", body: [
    "We never sell your information. The service providers below process it only on our behalf, to run the website and your project, and only what is needed:",
    [
      "**Hosting providers** that run our website (e.g. Vercel)",
      "**Database and email providers** (e.g. Supabase, Resend)",
      "**AI provider** (Anthropic), which processes chatbot messages only to write the replies",
      "**Payment providers** that process your payment",
      "**WhatsApp (Meta)**, when we message you or set up WhatsApp services for you",
      "**Cloud storage** (e.g. Google Drive) used to share project files",
      "**Government authorities**, only when the law requires it",
    ],
  ] },
  { id: "keep", title: "5. How long we keep information", body: [[
    `Enquiries that don't become projects: up to ${N.enquiryMonths} months`,
    `Project files: ${N.fileDays} days after delivery (see section 3)`,
    "Invoices and payment records: as long as Indian tax and accounting laws require",
    `Referral records: while the referral program runs, plus ${N.referralExtraMonths} months`,
  ]] },
  { id: "rights", title: "6. Your rights", body: [
    "You can ask us to:",
    [
      "Show you the information we hold about you",
      "Correct or update it",
      "Delete it, unless the law requires us to keep it",
      "Stop using it, by withdrawing your consent",
      "Nominate someone to act for you if you are unable to",
    ],
    `**To delete your data**, email ${O.email} from any address and tell us the name and WhatsApp number you used. We delete it within ${N.replyDays} days, except records the law requires us to keep (such as invoices).`,
    `To use any of these rights, contact us (section 10). We will reply within ${N.replyDays} days.`,
  ] },
  { id: "children", title: "7. Children", body: ["Our services are for people aged 18 and over. If you are under 18, a parent or guardian must contact us for you."] },
  { id: "security", title: "8. Security", body: ["We use secure tools and limit who can see your information. No system is 100% secure, so please don't send card numbers or passwords you use elsewhere."] },
  { id: "changes", title: "9. Changes to this policy", body: ["If we change this policy, we will update the date at the top. Big changes will also be shown on our website."] },
  { id: "contact", title: "10. Contact and grievances", body: [
    [
      `**Grievance contact:** ${O.grievanceName}`,
      `**Email:** ${O.email}`,
      `**WhatsApp:** ${O.whatsapp}`,
      `**Location:** ${O.country}`,
    ],
    `We reply to privacy questions and complaints within ${N.replyDays} days.`,
    "If you are not satisfied with our reply, you can complain to the Data Protection Board of India.",
  ] },
];

export default async function Page() {
  await loadContent();
  return (
    <PageShell eyebrow="Legal" title="Privacy" accent="Policy." intro={`Last updated: ${O.privacyUpdated}`} light>
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <LegalSections lead={lead} sections={sections} />
        <aside className="h-fit rounded-[1.75rem] bg-white p-7 ring-1 ring-line lg:sticky lg:top-24">
          <p className="text-[15px] leading-relaxed text-muted-dark">Questions about your information, or want to use your rights? Email {O.email} or message us on WhatsApp at {O.whatsapp}.</p>
          <ButtonLink href="/start-project" tone="light" className="mt-5">Start a Project</ButtonLink>
        </aside>
      </div>
    </PageShell>
  );
}
