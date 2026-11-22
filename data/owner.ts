/**
 * Owner details for Privacy, Terms, FAQ and About.
 * Change a value here once and every page updates.
 */
export const LIVE_URL = "https://makendless.vercel.app";

export const OWNER = {
  email: "makendlessofficial@gmail.com",
  whatsapp: "+91 91603 82004", // temporary number: change it here only
  /** Public location: only "India" is shown on the site. */
  country: "India",
  /** Courts named in Terms > Governing law (the only place a city appears). */
  courts: "courts in Hyderabad, Telangana, India",
  grievanceName: "Grievance Officer, MAKENDLESS Team",
  lastUpdated: "19 November 2026", // shown under the Privacy and Terms titles
};

/** Numbers used in the policies and About page. Edit freely. */
export const NUMBERS = {
  fileDays: 60, // project files kept after delivery
  enquiryMonths: 12, // enquiries that don't become projects
  referralExtraMonths: 12, // referral records kept after the program
  replyDays: 7, // reply to privacy questions and complaints
  balanceDays: 15, // balance due after delivery
  creditMonths: 6, // referral credits stay valid
};

const waDigits = OWNER.whatsapp.replace(/\D/g, "");
/** Opens WhatsApp once a real number is set; until then falls back to the project form. */
/** Default message when someone taps a WhatsApp button. */
export const WHATSAPP_MESSAGE = "Hi MAKENDLESS, I want to start a project.";
/** Social links. Leave "" to hide an icon. */
export const SOCIALS = {
  instagram: "https://www.instagram.com/makendless_official/",
  youtube: "",
  facebook: "",
  linkedin: "",
  x: "",
};
const waFull = waDigits.length === 10 ? `91${waDigits}` : waDigits;
/** Opens WhatsApp with the default message; until a real number is set, falls back to the project form. */
export const WHATSAPP_HREF = waDigits.length >= 10 ? `https://wa.me/${waFull}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}` : "/contact";
