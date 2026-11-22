import type { Metadata } from "next";
import PageShell from "../../components/PageShell";
import { ButtonLink } from "../../components/ui";
import { LegalSections, type LegalSection } from "../../components/Prose";
import { NUMBERS as N, OWNER as O } from "../../data/owner";
import { pageMeta } from "../../lib/site";

export const metadata: Metadata = pageMeta("Terms of Service", "Prices, payment, delivery, revisions, refunds, referrals and ownership when you work with MAKENDLESS.", "/terms");

const lead = "These terms apply when you use the MAKENDLESS website or hire us for any service. By starting a project with us, you agree to them.";

const sections: LegalSection[] = [
  { id: "who", title: "1. Who we are", body: [`MAKENDLESS is a creative and technology studio based in India. We provide video editing, motion graphics, websites, workflow automation, AI assistants, AI software and mobile apps.`] },
  { id: "prices", title: "2. Prices and quotes", body: [[
    "Prices on our website are fixed starting prices for each service.",
    "Your estimate on the website is a guide. We confirm the final price, scope and delivery time with you on WhatsApp before any work starts.",
    "Custom requests are quoted after we understand your needs.",
    "Prices do not include GST. Once MAKENDLESS is GST-registered, 18% GST will be added to invoices.",
  ]] },
  { id: "payment", title: "3. Payment", body: [[
    "**50% advance** to start the work. **50% balance** before we hand over final files or make your website, app or system live.",
    "You can pay by UPI or payment link.",
    "Monthly plans (Website Care, Monthly Care, Monthly Reels, Creator Pack) are paid in advance at the start of each month.",
    `If the balance isn't paid within ${N.balanceDays} days of delivery, we may pause support and keep the final files until payment is made.`,
  ]] },
  { id: "third-party", title: "4. Third-party costs", body: [
    "Some services need outside paid tools. You pay these directly, at actual cost:",
    [
      "Domain names and hosting",
      "WhatsApp Business API and message charges",
      "AI usage charges and phone call minutes",
      "Payment gateway fees",
      "Google Play and Apple App Store developer fees",
      "Paid themes, plugins, fonts, stock media or software you ask for",
    ],
  ] },
  { id: "delivery", title: "5. Delivery times", body: [[
    "Delivery times on our website start once we receive **both** the 50% advance **and** everything we need from you.",
    "If materials, feedback or approvals are late, the delivery date moves by the same number of days.",
    "Bulk video orders are delivered in batches.",
    "Some steps depend on outside companies (for example, WhatsApp API approval or app store review). We can't control their timing.",
  ]] },
  { id: "you-provide", title: "6. What you provide", body: [[
    "You are responsible for the materials you send: footage, photos, logos, text, music and brand assets.",
    "You confirm you own them or have permission to use them.",
    "We use music, fonts and stock media that are licensed for your use, or tell you if something needs a paid licence.",
  ]] },
  { id: "revisions", title: "7. Revisions and small changes", body: [[
    "**Videos and motion graphics:** 2 rounds of revisions are included.",
    "**Websites, automation and AI assistants:** small changes are free for 30 days after delivery.",
    "**AI software and apps:** bug fixes and small changes are free for 60 days after delivery.",
    "**Small changes** include text, images, colors, small fixes, and edits within the original brief. These are always free during the periods above.",
    "**New work** is charged separately. This includes new pages, new features, new videos, and a full change of style or direction. We tell you the price before doing it.",
  ]] },
  { id: "refunds", title: "8. Refunds and cancellation", body: [[
    "Cancel before work starts: **full refund** of your advance.",
    "Once work has started: **no refund**, because our team's time has already been spent.",
    "If we cannot complete your project for reasons on our side, we refund the payment for any work not delivered.",
    "Monthly plans can be cancelled at any time. Cancellation takes effect from the next month. The current month is not refunded.",
  ]] },
  { id: "offers", title: "9. Combos, discounts and referrals", body: [
    [
      "Combo packs and video quantity discounts are applied automatically on our website.",
      "The video quantity discount does not apply to Monthly 12 Reels or to videos already inside a combo pack.",
    ],
    { h: "Referral program" },
    [
      "Every referrer gets a unique code and link.",
      "A new client using a valid code gets ₹500 off their first order of ₹2,000 or more.",
      "The referrer gets ₹500 off their next order once the new client has paid.",
      "You can't use your own code. Each new client can receive one referral discount.",
      "Credits have no cash value and cannot be exchanged for money.",
      `We may change or end the referral program at any time. Credits already earned stay valid for ${N.creditMonths} months.`,
    ],
  ] },
  { id: "ownership", title: "10. Ownership", body: [[
    "Once you have paid in full, you own the final deliverables: the final videos, designs, website, app or system we made for you.",
    "Third-party tools, themes, plugins, fonts and stock media stay owned by their creators and are used under their licences.",
    "We may show your finished work in our portfolio only with your permission.",
    "Raw project files (for example, editing project files) are not included unless agreed in advance.",
  ]] },
  { id: "confidentiality", title: "11. Confidentiality", body: ["We keep your files, business information and logins private and use them only for your project."] },
  { id: "not-accepted", title: "12. What we don't accept", body: ["We don't work on content that is illegal, hateful, misleading, adult, or that infringes someone else's rights. We can stop a project if this happens, and work already done will not be refunded."] },
  { id: "limits", title: "13. Limits of responsibility", body: [[
    "We do our best to deliver quality work on time, but we cannot guarantee specific results such as views, followers, sales or rankings.",
    "We are not responsible for problems caused by outside services (hosting, WhatsApp, payment gateways, app stores, AI providers).",
    "Our total responsibility for any project is limited to the amount you paid for that project.",
  ]] },
  { id: "law", title: "14. Governing law", body: [`These terms follow the laws of India. Any dispute will be handled by the ${O.courts}.`] },
  { id: "changes", title: "15. Changes to these terms", body: ["We may update these terms. The date at the top shows the latest version. Projects already confirmed follow the terms that applied when they started."] },
  { id: "contact", title: "16. Contact", body: [[
    `**Email:** ${O.email}`,
    `**WhatsApp:** ${O.whatsapp}`,
    `**Location:** ${O.country}`,
  ]] },
];

export default function Page() {
  return (
    <PageShell eyebrow="Legal" title="Terms of" accent="Service." intro={`Last updated: ${O.lastUpdated}`} light>
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <aside className="h-fit rounded-[1.75rem] bg-white p-7 ring-1 ring-line lg:sticky lg:top-24 lg:order-last">
          <h2 className="text-lg font-extrabold text-dark">Contents</h2>
          <nav aria-label="Terms contents">
            <ol className="mt-3 space-y-1 text-[15px] text-muted-dark">
              {sections.map((s) => (
                <li key={s.id}><a href={`#${s.id}`} className="inline-flex min-h-8 items-center hover:text-violet">{s.title}</a></li>
              ))}
            </ol>
          </nav>
          <ButtonLink href="/start-project" tone="light" className="mt-5">Start a Project</ButtonLink>
        </aside>
        <LegalSections lead={lead} sections={sections} />
      </div>
    </PageShell>
  );
}
