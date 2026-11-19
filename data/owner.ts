/**
 * Owner details for Privacy, Terms, FAQ and About.
 * Anything still in [BRACKETS] has not been supplied yet. Change it here once and every page updates.
 * Do not publish while brackets remain.
 */
export const LIVE_URL = "https://makendless.vercel.app";

export const OWNER = {
  email: "[EMAIL ADDRESS]",
  whatsapp: "[WHATSAPP NUMBER]", // e.g. "+91 98765 43210"
  city: "[CITY]",
  state: "[STATE]",
  grievanceName: "[GRIEVANCE CONTACT NAME]",
  founderName: "[FOUNDER NAME]",
  founderPhoto: "", // e.g. "/team/founder.jpg" in public/. Empty = no photo shown.
  lastUpdated: "19 November 2026", // shown under the Privacy and Terms titles
};

/** Numbers used in the policies and About page. Edit freely. */
export const NUMBERS = {
  fileDays: 60, // project files kept after delivery
  enquiryMonths: 12, // enquiries that don't become projects
  referralExtraMonths: 12, // referral records kept after the program
  replyDays: 30, // reply to a privacy request
  balanceDays: 15, // balance due after delivery
  creditMonths: 6, // referral credits stay valid
  subscribers: "10K+",
  teamSize: 6,
  editors: 2,
  developers: 2,
  clientLeads: 2,
};

const waDigits = OWNER.whatsapp.replace(/\D/g, "");
/** Opens WhatsApp once a real number is set; until then falls back to the project form. */
export const WHATSAPP_HREF = waDigits.length >= 10 ? `https://wa.me/${waDigits}` : "/contact";
