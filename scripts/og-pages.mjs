// One Open Graph / Twitter share image per page, in the same style as app/opengraph-image.png (real Syne font).
// Writes app/<page>/opengraph-image.jpg and twitter-image.jpg. Usage: npm run build (once, for the font), then node scripts/og-pages.mjs
import puppeteer from "puppeteer-core";
import { copyFileSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

const PAGES = [
  ["studios", "Services", "Three studios.", "One team.", "Video · Websites & tech · GROW: Beta - taking first clients"],
  ["work", "Our work", "Real projects.", "Made to be seen.", "Edited reels · Live websites"],
  ["create", "CREATE", "Video editing", "that stops the scroll.", "Reels & Shorts · YouTube · Motion graphics · From ₹699"],
  ["build", "BUILD", "Websites & tech", "that work for you.", "Websites · WhatsApp automation · AI Assistant · Apps"],
  ["grow", "GROW · Beta", "Digital marketing,", "taking first clients.", "Meta Ads · Social media · Local presence · Monthly plans"],
  ["about", "About", "One studio.", "Fixed prices.", "Videos, websites and automation with one point of contact"],
  ["faq", "FAQ", "Questions,", "answered plainly.", "Prices · Payment · Delivery · Revisions · Referrals"],
  ["contact", "Contact", "Tell us", "what you need.", "Your final price on WhatsApp within 24 hours"],
  ["start-project", "Start a Project", "Pick. See the price.", "Start.", "Fixed prices · Reply on WhatsApp within 24 hours"],
  ["privacy", "Privacy", "Your data,", "handled with care.", "Never sold · Delete it any time"],
  ["terms", "Terms", "Clear terms,", "no surprises.", "Prices · Payment · Delivery · Revisions · Refunds"],
];

const media = ".next/static/media/";
const syne = readdirSync(media).filter((f) => f.endsWith(".p.woff2"))[0];
const font = `@font-face{font-family:Syne;src:url(data:font/woff2;base64,${readFileSync(media + syne).toString("base64")}) format("woff2");font-weight:400 800}`;
const E = `<svg viewBox="0 0 92 100" style="height:.72em;width:auto;display:inline-block;vertical-align:baseline;margin-right:.18em"><rect width="22" height="100" rx="4" fill="#f6f8ff"/><rect width="92" height="22" rx="4" fill="#22d3ee"/><rect x="30" y="39" width="54" height="22" rx="4" fill="#8b5cf6"/><rect y="78" width="92" height="22" rx="4" fill="#c7a6ff"/></svg>`;
const word = `<span style="font-weight:800;letter-spacing:.18em;white-space:nowrap">MAK${E}ND<span class="p">L</span>${E}<span class="p">SS</span></span>`;
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const p = await b.newPage();
await p.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
for (const [dir, kicker, line1, line2, sub] of PAGES) {
  await p.setContent(`<html><head><style>${font}*{margin:0;box-sizing:border-box}body{font-family:Syne,sans-serif;width:1200px;height:630px}.p{background:linear-gradient(115deg,#22d3ee,#8b5cf6 52%,#c7a6ff);-webkit-background-clip:text;color:transparent}</style></head><body>
  <div style="width:1200px;height:630px;background:radial-gradient(60% 70% at 85% 20%,rgba(111,69,246,.45),transparent 70%),radial-gradient(40% 50% at 0% 100%,rgba(8,187,212,.25),transparent 70%),#0c1024;color:#f6f8ff;padding:64px 80px;display:flex;flex-direction:column;justify-content:space-between">
    <div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:34px">${word}</div><div style="font-size:22px;font-weight:700;letter-spacing:.3em;color:#22d3ee">${esc(kicker.toUpperCase())}</div></div>
    <div><div style="font-size:92px;font-weight:800;line-height:1.04;letter-spacing:-.02em">${esc(line1)}<br><span class="p">${esc(line2)}</span></div>
    <div style="margin-top:26px;font-size:28px;color:#c3c8de">${esc(sub)}</div></div>
    <div style="display:flex;gap:14px"><span style="width:90px;height:10px;border-radius:5px;background:#22d3ee"></span><span style="width:90px;height:10px;border-radius:5px;background:#8b5cf6"></span><span style="width:90px;height:10px;border-radius:5px;background:#c7a6ff"></span></div>
  </div></body></html>`, { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  const out = `app/${dir}/opengraph-image.jpg`;
  await p.screenshot({ path: out, type: "jpeg", quality: 86 });
  copyFileSync(out, `app/${dir}/twitter-image.jpg`);
  const alt = `MAKENDLESS — ${kicker}: ${line1} ${line2}`;
  writeFileSync(`app/${dir}/opengraph-image.alt.txt`, alt);
  writeFileSync(`app/${dir}/twitter-image.alt.txt`, alt);
  console.log("ok", out);
}
await b.close();
