// Load-time probe on a throttled "fast 4G" connection + 4x CPU: first paint, LCP, when the hero 3D appears and when its intro finishes.
// Usage: node scripts/load.mjs [url]
import puppeteer from "puppeteer-core";
const URL = process.argv[2] || "http://localhost:3456";
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--use-angle=metal", "--enable-gpu"] });
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const c = await p.createCDPSession();
await c.send("Network.emulateNetworkConditions", { offline: false, latency: 60, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 });
await p.emulateCPUThrottling(4);
await p.evaluateOnNewDocument(() => { window.__lcp = 0; new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__lcp = e.startTime))).observe({ type: "largest-contentful-paint", buffered: true }); });
const t0 = Date.now(); await p.goto(URL, { waitUntil: "domcontentloaded" });
await p.waitForFunction(() => { const c = document.querySelector("#main canvas"); return c && getComputedStyle(c.closest(".transition-opacity") || c).opacity === "1"; }, { timeout: 30000 });
const scene = Date.now() - t0;
await p.waitForFunction(() => /EDITED/.test(document.body.innerText), { timeout: 30000 });
const edited = Date.now() - t0;
const m = await p.evaluate(() => ({ fcp: Math.round(performance.getEntriesByName("first-contentful-paint")[0]?.startTime || 0), lcp: Math.round(window.__lcp), js: Math.round(performance.getEntriesByType("resource").filter((r) => r.name.endsWith(".js")).reduce((a, r) => a + r.transferSize, 0) / 1024) }));
console.log(JSON.stringify({ ...m, sceneVisibleMs: scene, introDoneMs: edited, jsKB: m.js })); await b.close();
