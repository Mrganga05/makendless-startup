// Screenshots + interaction tests for the hero. Usage: node scripts/shots.mjs [baseUrl]
import puppeteer from "puppeteer-core";
const URL = process.argv[2] || "http://localhost:3456";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "docs/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sizes = [[360, 780], [390, 844], [768, 1024], [1024, 768], [1440, 900]];
const names = ["video", "web", "marketing"];
const results = {};
const setP = (page, v) => page.evaluate((v) => { const el = document.querySelector(".hero-range"); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(v)); el.dispatchEvent(new Event("input", { bubbles: true })); }, v);

async function run(tag, args, fn) {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--use-angle=metal", "--enable-gpu", "--hide-scrollbars", ...args] });
  try { await fn(browser); } finally { await browser.close(); }
}

await run("main", [], async (browser) => {
  const page = await browser.newPage();
  const errors = []; page.on("pageerror", (e) => errors.push(String(e))); page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  for (const [w, h] of sizes) {
    await page.setViewport({ width: w, height: h, deviceScaleFactor: w < 800 ? 2 : 1, isMobile: w < 800, hasTouch: w < 800 });
    await page.goto(URL, { waitUntil: "networkidle0" });
    if (w === 1440) { await sleep(900); await page.screenshot({ path: `${OUT}/1440-intro-midway.png` }); }
    await sleep(3600);
    for (let i = 0; i < 3; i++) {
      await page.evaluate((i) => document.querySelectorAll('[role=tablist][aria-label="Service mode"] [role=tab]')[i].click(), i);
      await sleep(2200);
      await page.screenshot({ path: `${OUT}/${w}-${names[i]}.png` });
    }
    await page.evaluate(() => document.querySelectorAll('[role=tablist][aria-label="Service mode"] [role=tab]')[0].click());
    await setP(page, 0); await sleep(1800); await page.screenshot({ path: `${OUT}/${w}-raw.png` });
    await setP(page, 1000); await sleep(1200);
    results[`overflow@${w}`] = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    results[`canvas@${w}`] = await page.evaluate(() => !!document.querySelector("canvas"));
    results[`ctaVisible@${w}`] = await page.evaluate(() => [...document.querySelectorAll("#main section:first-of-type a")].map((a) => Math.round(a.getBoundingClientRect().bottom) <= innerHeight));
  }
  // interaction tests at 1440
  await page.setViewport({ width: 1440, height: 900 }); await page.goto(URL, { waitUntil: "networkidle0" }); await sleep(3200);
  results.hrefs = await page.evaluate(() => [...document.querySelectorAll("#main section:first-of-type a")].map((a) => a.getAttribute("href")));
  await setP(page, 300); await sleep(300);
  results.scrub = await page.evaluate(() => ({ status: document.querySelector("#main section [role=status]").innerText, hintGone: !document.body.innerText.includes("Drag to see the edit") }));
  await page.focus(".hero-range"); await page.keyboard.press("ArrowRight"); await page.keyboard.press("ArrowRight");
  results.sliderKeyboard = await page.evaluate(() => document.querySelector(".hero-range").value);
  await page.focus('[role=tablist][aria-label="Service mode"] [role=tab][aria-selected=true]'); await page.keyboard.press("ArrowRight"); await sleep(200);
  results.tabKeyboard = await page.evaluate(() => document.querySelector('[role=tablist][aria-label="Service mode"] [aria-selected=true]').getAttribute("aria-label"));
  await sleep(7000);
  results.cyclePausedAfterInteraction = await page.evaluate(() => document.querySelector('[role=tablist][aria-label="Service mode"] [aria-selected=true]').getAttribute("aria-label"));
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.innerText.includes("Pause video")).click()); await sleep(150);
  results.pause = await page.evaluate(() => [...document.querySelectorAll("button")].some((b) => b.innerText.includes("Play video")));
  await page.evaluate(() => document.querySelector('#main section:first-of-type a[href="#studios"]').click()); await sleep(1500);
  results.exploreScrolled = await page.evaluate(() => Math.round(document.querySelector("#studios").getBoundingClientRect().top));
  await page.screenshot({ path: `${OUT}/1440-scroll-handoff.png` });
  await page.evaluate(() => scrollTo(0, 0)); await sleep(600);
  await Promise.all([page.waitForNavigation(), page.evaluate(() => document.querySelector('#main section:first-of-type a[href="/contact"]').click())]);
  results.startProject = page.url();
  // reduced motion
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto(URL, { waitUntil: "networkidle0" }); await sleep(800);
  results.reduced = await page.evaluate(() => ({ p: document.querySelector(".hero-range").value, canvas: !!document.querySelector("canvas"), mode: document.querySelector('[role=tablist][aria-label="Service mode"] [aria-selected=true]').getAttribute("aria-label") }));
  await sleep(6500);
  results.reducedNoCycle = await page.evaluate(() => document.querySelector('[role=tablist][aria-label="Service mode"] [aria-selected=true]').getAttribute("aria-label"));
  await page.screenshot({ path: `${OUT}/1440-reduced-motion.png` });
  results.errors = errors.slice(0, 6);
});

await run("no3d", ["--disable-3d-apis"], async (browser) => {
  const page = await browser.newPage();
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    await page.setViewport({ width: w, height: h, deviceScaleFactor: w < 800 ? 2 : 1 });
    await page.goto(URL, { waitUntil: "networkidle0" }); await sleep(3400);
    results[`no3d-canvas@${w}`] = await page.evaluate(() => !!document.querySelector("canvas"));
    await page.screenshot({ path: `${OUT}/${w}-no3d-finished.png` });
    await setP(page, 0); await sleep(900); await page.screenshot({ path: `${OUT}/${w}-no3d-raw.png` });
  }
});
console.log(JSON.stringify(results, null, 1));
