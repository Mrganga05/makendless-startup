// Renders brand assets with the real Syne font: Open Graph image + logo PNGs. Usage: node scripts/brand-assets.mjs
import puppeteer from "puppeteer-core";
import { readFileSync, readdirSync } from "node:fs";
// Syne (variable, latin) as bundled by next/font in the last build: embed so rendering needs no network.
const media = ".next/static/media/";
const syne = readdirSync(media).filter((f) => f.endsWith(".p.woff2"))[0];
const font = `@font-face{font-family:Syne;src:url(data:font/woff2;base64,${readFileSync(media + syne).toString("base64")}) format("woff2");font-weight:400 800}`;
const E = (spine = "#f6f8ff", mono = false) => `<svg viewBox="0 0 92 100" style="height:.72em;width:auto;display:inline-block;vertical-align:baseline;margin-right:.18em"><rect width="22" height="100" rx="4" fill="${spine}"/><rect width="92" height="22" rx="4" fill="${mono ? spine : "#22d3ee"}"/><rect x="30" y="39" width="54" height="22" rx="4" fill="${mono ? spine : "#8b5cf6"}"/><rect y="78" width="92" height="22" rx="4" fill="${mono ? spine : "#c7a6ff"}"/></svg>`;
const word = (spine, ink) => `<span style="font-weight:800;letter-spacing:.18em;white-space:nowrap;color:${ink}">MAK${E(spine)}ND<span class="p">L</span>${E(spine)}<span class="p">SS</span></span>`;
const head = `<style>${font}*{margin:0;box-sizing:border-box}body{font-family:Syne,sans-serif}.p{background:linear-gradient(115deg,#22d3ee,#8b5cf6 52%,#c7a6ff);-webkit-background-clip:text;color:transparent}</style>`;
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const p = await b.newPage();
const shot = async (html, w, h, path, transparent = false) => {
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await p.setContent(`<html><head>${head}</head><body style="width:${w}px;height:${h}px;${transparent ? "background:transparent" : ""}">${html}</body></html>`, { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path, omitBackground: transparent });
};
// Open Graph / Twitter card
await shot(`<div style="width:1200px;height:630px;background:radial-gradient(60% 70% at 85% 20%,rgba(111,69,246,.45),transparent 70%),radial-gradient(40% 50% at 0% 100%,rgba(8,187,212,.25),transparent 70%),#0c1024;color:#f6f8ff;padding:72px 80px;display:flex;flex-direction:column;justify-content:space-between">
  <div style="font-size:38px">${word("#f6f8ff", "#f6f8ff")}</div>
  <div><div style="font-size:112px;font-weight:800;line-height:1.02;letter-spacing:-.02em">Create. Build. <span class="p">Grow.</span></div>
  <div style="margin-top:28px;font-size:28px;color:#c3c8de">Video editing · Websites · WhatsApp automation & AI</div></div>
  <div style="display:flex;gap:14px"><span style="width:90px;height:10px;border-radius:5px;background:#22d3ee"></span><span style="width:90px;height:10px;border-radius:5px;background:#8b5cf6"></span><span style="width:90px;height:10px;border-radius:5px;background:#c7a6ff"></span></div></div>`, 1200, 630, "app/opengraph-image.png");
// Logo files
await shot(`<div style="padding:40px 48px;font-size:72px;display:inline-block">${word("#f6f8ff", "#f6f8ff")}</div>`, 1180, 170, "docs/brand/makendless-wordmark-on-dark.png", true);
await shot(`<div style="padding:40px 48px;font-size:72px;display:inline-block">${word("#13172b", "#13172b")}</div>`, 1180, 170, "docs/brand/makendless-wordmark-on-light.png", true);
await shot(`<div style="width:512px;height:512px;display:grid;place-items:center;background:#0c1024;border-radius:120px"><div style="font-size:300px;line-height:1">${E("#f6f8ff").replace("margin-right:.18em", "")}</div></div>`, 512, 512, "docs/brand/makendless-mark-512.png", true);
await shot(`<div style="width:180px;height:180px;display:grid;place-items:center;background:#0c1024"><div style="font-size:104px;line-height:1">${E("#f6f8ff").replace("margin-right:.18em", "")}</div></div>`, 180, 180, "app/apple-icon.png");
// Favicon sizes (packed into app/favicon.ico by scripts/make-ico.py)
for (const n of [16, 32, 48]) await shot(`<div style="width:${n}px;height:${n}px;display:grid;place-items:center;background:#0c1024;border-radius:${Math.round(n * 0.22)}px"><div style="font-size:${Math.round(n * 0.62)}px;line-height:1">${E("#f6f8ff").replace("margin-right:.18em", "")}</div></div>`, n, n, `scripts/tmp/fav-${n}.png`, true);
await b.close(); console.log("ok");
