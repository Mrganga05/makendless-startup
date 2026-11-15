// Audit screenshots: every homepage section + every page at 1440 and 390.
// Usage: node scripts/audit-shots.mjs [baseUrl] [outDir]
import puppeteer from "puppeteer-core";
const URL = process.argv[2] || "http://localhost:3456";
const OUT = process.argv[3] || "docs/audit";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pages = ["studios", "create", "build", "grow", "about", "faq", "contact", "privacy", "terms"];
const names = ["01-hero", "02-studios", "03-solutions", "04-packages", "05-process-faq", "06-final-cta"];
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--use-angle=metal", "--enable-gpu", "--hide-scrollbars"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("response", (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
const report = {};
for (const [w, h] of [[1440, 900], [390, 844]]) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: w < 800, hasTouch: w < 800 });
  await page.goto(URL, { waitUntil: "networkidle0" });
  await sleep(3500);
  const secs = await page.$$("#main > section");
  report[`home-sections@${w}`] = secs.length;
  for (let i = 0; i < secs.length; i++) {
    await secs[i].evaluate((e) => e.scrollIntoView({ block: "start" }));
    await sleep(900);
    await secs[i].screenshot({ path: `${OUT}/${w}-home-${names[i] || "section" + i}.png` });
  }
  const footer = await page.$("footer");
  if (footer) await footer.screenshot({ path: `${OUT}/${w}-home-08-footer.png` });
  report[`overflow-home@${w}`] = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  for (const p of pages) {
    await page.goto(`${URL}/${p}`, { waitUntil: "networkidle0" });
    await sleep(500);
    await page.screenshot({ path: `${OUT}/${w}-page-${p}.png`, fullPage: true });
    report[`overflow-${p}@${w}`] = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  }
  if (w === 390) {
    await page.goto(URL, { waitUntil: "networkidle0" });
    await page.click('button[aria-controls="mobile-menu"]');
    await sleep(400);
    await page.screenshot({ path: `${OUT}/390-mobile-menu.png` });
  }
}
report.errors = [...new Set(errors)].slice(0, 10);
console.log(JSON.stringify(report, null, 1));
await browser.close();
