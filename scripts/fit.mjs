// Finds headings/words that stick out of their column. Usage: node scripts/fit.mjs [url]
import puppeteer from "puppeteer-core";
const URL = process.argv[2] || "http://localhost:3456";
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const p = await b.newPage(); const bad = [];
for (const path of ["/", "/studios", "/create", "/build", "/grow", "/about", "/faq", "/contact", "/privacy", "/terms"]) for (const w of [360, 390, 768, 1000, 1024, 1280, 1440]) {
  await p.setViewport({ width: w, height: 900 }); await p.goto(URL + path, { waitUntil: "networkidle0" });
  const r = await p.evaluate(() => {
    const out = [];
    for (const h of document.querySelectorAll("h1, h2, h3")) {
      let col = h.parentElement; while (col && getComputedStyle(col).display === "inline") col = col.parentElement;
      const cr = col.getBoundingClientRect(); const hr = h.getBoundingClientRect();
      const words = h.querySelectorAll(".kh-word, span"); let maxR = hr.right;
      words.forEach((x) => { maxR = Math.max(maxR, x.getBoundingClientRect().right); });
      if (maxR > cr.right + 2 || maxR > innerWidth) out.push(`${h.textContent.trim().slice(0, 28)} +${Math.round(maxR - Math.min(cr.right, innerWidth))}px`);
    }
    return out;
  });
  if (r.length) bad.push(`${path}@${w}: ${r.join(" | ")}`);
}
console.log(bad.join("\n") || "all headings fit"); await b.close();
