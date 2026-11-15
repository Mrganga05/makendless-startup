// Frame-time probe: holds each homepage section in view and measures FPS + long tasks. Usage: node scripts/perf.mjs [url] [width]
import puppeteer from "puppeteer-core";
const URL = process.argv[2] || "http://localhost:3456"; const W = +(process.argv[3] || 1440);
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--use-angle=metal", "--enable-gpu", "--hide-scrollbars"] });
const p = await b.newPage(); await p.setViewport({ width: W, height: W < 800 ? 844 : 900, deviceScaleFactor: 2, isMobile: W < 800, hasTouch: W < 800 });
if (process.argv[4]) await p.emulateCPUThrottling(+process.argv[4]);
await p.goto(URL, { waitUntil: "networkidle0" }); await new Promise((r) => setTimeout(r, 3500));
const out = await p.evaluate(async () => {
  const res = {};
  let long = 0; new PerformanceObserver((l) => l.getEntries().forEach((e) => { long += e.duration; })).observe({ type: "longtask", buffered: false });
  const measure = (ms) => new Promise((done) => { const t = []; let last = performance.now(); const end = last + ms; const f = (now) => { t.push(now - last); last = now; if (now < end) requestAnimationFrame(f); else done(t); }; requestAnimationFrame(f); });
  for (const s of document.querySelectorAll("#main > section")) {
    s.scrollIntoView({ behavior: "instant" }); await new Promise((r) => setTimeout(r, 700)); long = 0;
    const t = await measure(2500); t.sort((a, b) => a - b);
    res[s.id || "section"] = { fps: Math.round(1000 / (t.reduce((a, b) => a + b, 0) / t.length)), p95ms: Math.round(t[Math.floor(t.length * 0.95)]), longTaskMs: Math.round(long), canvases: document.querySelectorAll("canvas").length };
  }
  // scroll sweep
  scrollTo(0, 0); await new Promise((r) => setTimeout(r, 500)); long = 0;
  const H = document.body.scrollHeight; const sweep = measure(4000); const t0 = performance.now();
  const step = () => { const k = (performance.now() - t0) / 4000; scrollTo(0, k * H); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step);
  const t = await sweep; t.sort((a, b) => a - b);
  res.scrollSweep = { fps: Math.round(1000 / (t.reduce((a, b) => a + b, 0) / t.length)), p95ms: Math.round(t[Math.floor(t.length * 0.95)]), longTaskMs: Math.round(long) };
  return res;
});
console.log(JSON.stringify(out)); await b.close();
