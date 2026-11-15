// Hero frame-time probe: intro (first 3s), idle playback, mode switch, timeline drag. Usage: node scripts/perf-hero.mjs [url] [width] [cpuThrottle]
import puppeteer from "puppeteer-core";
const URL = process.argv[2] || "http://localhost:3456"; const W = +(process.argv[3] || 1440); const T = +(process.argv[4] || 4);
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--use-angle=metal", "--enable-gpu", "--hide-scrollbars"] });
const p = await b.newPage(); await p.setViewport({ width: W, height: W < 800 ? 844 : 900, deviceScaleFactor: 2, isMobile: W < 800, hasTouch: W < 800 });
await p.emulateCPUThrottling(T);
await p.evaluateOnNewDocument(() => {
  window.__ft = []; let last = performance.now();
  const f = (now) => { window.__ft.push([now, now - last]); last = now; requestAnimationFrame(f); }; requestAnimationFrame(f);
  window.__long = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push([e.startTime, e.duration]))).observe({ type: "longtask", buffered: true });
});
await p.goto(URL, { waitUntil: "domcontentloaded" });
const stat = (from, to) => p.evaluate((from, to) => {
  const t = window.__ft.filter(([n]) => n >= from && n < to).map(([, d]) => d).sort((a, b) => a - b);
  const long = window.__long.filter(([s]) => s >= from && s < to).reduce((a, [, d]) => a + d, 0);
  return { fps: Math.round(1000 / (t.reduce((a, b) => a + b, 0) / Math.max(1, t.length))), p95: Math.round(t[Math.floor(t.length * 0.95)] || 0), worst: Math.round(t[t.length - 1] || 0), longMs: Math.round(long) };
}, from, to);
const now = () => p.evaluate(() => performance.now());
const res = {};
let a = await now(); await new Promise((r) => setTimeout(r, 3200)); res.intro = await stat(a, await now());
a = await now(); await new Promise((r) => setTimeout(r, 3000)); res.idle = await stat(a, await now());
a = await now(); await p.evaluate(() => document.querySelectorAll('[aria-label="Service mode"] [role=tab]')[1].click()); await new Promise((r) => setTimeout(r, 2500)); res.modeSwitch = await stat(a, await now());
a = await now();
const box = await p.$eval(".hero-range", (e) => { const r = e.getBoundingClientRect(); return [r.x, r.y + r.height / 2, r.width]; });
await p.mouse.move(box[0] + box[2] - 25, box[1]); await p.mouse.down();
for (let i = 0; i <= 40; i++) { await p.mouse.move(box[0] + box[2] - 25 - (i / 40) * (box[2] - 50), box[1]); }
await p.mouse.up(); await new Promise((r) => setTimeout(r, 500)); res.drag = await stat(a, await now());
console.log(JSON.stringify(res)); await b.close();
