/* 2D drawings used as textures in the closing 3D scene: film-strip cells, the finished reel, the finished site and the end card.
   Everything is original concept artwork drawn in code - no footage, no logos. */
import { color } from "../../data/tokens";

type Ctx = CanvasRenderingContext2D;

function make(w: number, h: number): [HTMLCanvasElement, Ctx] {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")!];
}
function rr(g: Ctx, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r);
  g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
  g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
}
function prism(g: Ctx, x0: number, y0: number, x1: number, y1: number) {
  const l = g.createLinearGradient(x0, y0, x1, y1);
  l.addColorStop(0, color.aquaBright); l.addColorStop(0.52, color.build); l.addColorStop(1, color.violetSoft);
  return l;
}
function fontFamily() {
  return typeof document === "undefined" ? "sans-serif" : getComputedStyle(document.body).fontFamily || "sans-serif";
}
/** Sets the brand typeface at the largest size (up to `max`) at which `text` fits in `width`. */
function fit(g: Ctx, text: string, width: number, max: number, extra = 0) {
  const fam = fontFamily();
  g.font = `800 ${max}px ${fam}`;
  const w = g.measureText(text).width + extra;
  const size = w > width ? Math.floor((max * (width - extra)) / (w - extra)) : max;
  g.font = `800 ${size}px ${fam}`;
  return size;
}
/** A graded "shot": sky gradient, soft sun, a presenter silhouette. */
function shot(g: Ctx, x: number, y: number, w: number, h: number, v: number) {
  const pal = [[color.aquaBright, "#3b2a9a", "#120b3a"], ["#ff9ecb", color.build, "#160d44"], [color.violetSoft, "#2b6fd6", "#0b1640"]][v % 3];
  const l = g.createLinearGradient(x, y, x + w * 0.4, y + h);
  l.addColorStop(0, pal[0]); l.addColorStop(0.55, pal[1]); l.addColorStop(1, pal[2]);
  g.fillStyle = l; g.fillRect(x, y, w, h);
  const s = g.createRadialGradient(x + w * 0.72, y + h * 0.28, 0, x + w * 0.72, y + h * 0.28, h * 0.5);
  s.addColorStop(0, "rgba(255,255,255,.75)"); s.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = s; g.fillRect(x, y, w, h);
  g.fillStyle = "rgba(8,11,26,.82)";
  g.beginPath(); g.arc(x + w * 0.4, y + h * 0.5, h * 0.17, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(x + w * 0.4, y + h * 1.06, h * 0.36, h * 0.36, 0, 0, Math.PI * 2); g.fill();
}

/** One cell of the film strip: sprocket holes top and bottom, one frame of work in the middle. */
export function drawCell(kind: "video" | "web", v: number) {
  const W = 256, H = 192, [c, g] = make(W, H);
  g.fillStyle = "#070914"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#2a3054";
  for (let i = 0; i < 6; i++) { rr(g, 14 + i * 41, 8, 22, 13, 4); g.fill(); rr(g, 14 + i * 41, H - 21, 22, 13, 4); g.fill(); }
  const x = 8, y = 30, w = W - 16, h = H - 60;
  g.save(); rr(g, x, y, w, h, 6); g.clip();
  if (kind === "video") {
    shot(g, x, y, w, h, v);
    // caption blocks (word-pop captions)
    g.fillStyle = "#ffffff"; rr(g, x + w * 0.2, y + h * 0.72, w * 0.26, 16, 5); g.fill();
    g.fillStyle = color.aquaBright; rr(g, x + w * 0.49, y + h * 0.72, w * 0.32, 16, 5); g.fill();
  } else {
    g.fillStyle = color.paper; g.fillRect(x, y, w, h);
    g.fillStyle = color.dark; rr(g, x + 12, y + 10, 34, 6, 3); g.fill();
    g.fillStyle = color.line; for (let i = 0; i < 3; i++) { rr(g, x + w - 96 + i * 28, y + 10, 20, 6, 3); g.fill(); }
    if (v % 3 === 0) {
      g.fillStyle = color.dark; rr(g, x + 12, y + 34, 104, 12, 4); g.fill(); rr(g, x + 12, y + 52, 76, 12, 4); g.fill();
      g.fillStyle = prism(g, x + 12, 0, x + 70, 0); rr(g, x + 12, y + 76, 58, 18, 9); g.fill();
      g.fillStyle = prism(g, x + 132, y + 30, x + w, y + h); rr(g, x + 132, y + 30, w - 144, h - 42, 8); g.fill();
    } else if (v % 3 === 1) {
      for (let i = 0; i < 3; i++) {
        g.fillStyle = [color.aquaBright, color.build, color.violetSoft][i]; rr(g, x + 12 + i * 76, y + 32, 66, 46, 7); g.fill();
        g.fillStyle = color.dark; rr(g, x + 12 + i * 76, y + 86, 48, 7, 3); g.fill();
        g.fillStyle = color.line; rr(g, x + 12 + i * 76, y + 98, 34, 6, 3); g.fill();
      }
    } else {
      g.fillStyle = color.ink; rr(g, x + 12, y + 30, w - 24, 52, 8); g.fill();
      g.fillStyle = "#ffffff"; rr(g, x + 26, y + 44, 92, 10, 4); g.fill();
      g.fillStyle = prism(g, x + 26, 0, x + 80, 0); rr(g, x + 26, y + 60, 52, 12, 6); g.fill();
      g.fillStyle = color.line; rr(g, x + 12, y + 92, w - 24, 8, 4); g.fill(); rr(g, x + 12, y + 106, w - 90, 8, 4); g.fill();
    }
  }
  g.restore();
  return c;
}

/** The finished vertical reel on the phone. */
export function drawReel() {
  const W = 260, H = 540, [c, g] = make(W, H);
  shot(g, 0, 0, W, H, 0);
  const d = g.createLinearGradient(0, H * 0.5, 0, H);
  d.addColorStop(0, "rgba(8,11,26,0)"); d.addColorStop(1, "rgba(8,11,26,.85)");
  g.fillStyle = d; g.fillRect(0, 0, W, H);
  g.textBaseline = "middle"; g.textAlign = "center";
  fit(g, "IDEAS INTO", 168, 25);
  g.fillStyle = "#ffffff"; rr(g, 34, 372, 192, 40, 10); g.fill();
  g.fillStyle = color.dark; g.fillText("IDEAS INTO", 130, 393);
  g.fillStyle = color.aquaBright; rr(g, 46, 418, 168, 40, 10); g.fill();
  fit(g, "REALITY", 144, 25);
  g.fillStyle = color.dark; g.fillText("REALITY", 130, 439);
  g.fillStyle = "rgba(255,255,255,.3)"; rr(g, 24, 498, W - 48, 5, 2.5); g.fill();
  g.fillStyle = prism(g, 24, 0, W - 24, 0); rr(g, 24, 498, W - 48, 5, 2.5); g.fill();
  g.fillStyle = "#ffffff"; g.beginPath(); g.arc(W - 24, 500.5, 7, 0, Math.PI * 2); g.fill();
  return c;
}

/** The finished website on the laptop. */
export function drawSite() {
  const W = 612, H = 392, [c, g] = make(W, H);
  g.fillStyle = color.paper; g.fillRect(0, 0, W, H);
  g.fillStyle = "#e3e6f4"; g.fillRect(0, 0, W, 30);
  ["#ff7b7b", "#ffc857", "#5bd68a"].forEach((f, i) => { g.fillStyle = f; g.beginPath(); g.arc(18 + i * 16, 15, 4.5, 0, Math.PI * 2); g.fill(); });
  g.fillStyle = "#ffffff"; rr(g, 170, 7, 272, 16, 8); g.fill();
  const fam = fontFamily();
  g.fillStyle = color.dark; g.textBaseline = "middle"; g.textAlign = "left";
  g.font = `800 12px ${fam}`; g.fillText("STUDIO", 28, 56);
  g.fillStyle = color.mutedDark; for (let i = 0; i < 3; i++) { rr(g, 380 + i * 54, 52, 38, 7, 3.5); g.fill(); }
  g.fillStyle = color.ink; rr(g, 544, 44, 44, 22, 11); g.fill();
  g.fillStyle = color.dark; fit(g, "remembered.", 286, 37);
  g.fillText("Made to be", 28, 124); g.fillText("remembered.", 28, 162);
  g.fillStyle = color.mutedDark; rr(g, 28, 198, 210, 8, 4); g.fill(); rr(g, 28, 214, 160, 8, 4); g.fill();
  g.fillStyle = prism(g, 28, 0, 150, 0); rr(g, 28, 240, 122, 36, 18); g.fill();
  g.save(); rr(g, 338, 88, 250, 192, 16); g.clip(); shot(g, 338, 88, 250, 192, 1); g.restore();
  for (let i = 0; i < 3; i++) {
    g.fillStyle = "#ffffff"; rr(g, 28 + i * 190, 304, 176, 110, 12); g.fill();
    g.fillStyle = [color.aquaBright, color.build, color.violetSoft][i]; rr(g, 42 + i * 190, 318, 30, 30, 8); g.fill();
    g.fillStyle = color.dark; rr(g, 42 + i * 190, 360, 96, 8, 4); g.fill();
  }
  return c;
}

/** The last frame of the film: the brand end card. */
export function drawEndCard() {
  const W = 1024, H = 576, [c, g] = make(W, H);
  g.fillStyle = color.inkDeep; g.fillRect(0, 0, W, H);
  const a = g.createRadialGradient(W * 0.18, H * 1.05, 0, W * 0.18, H * 1.05, W * 0.62);
  a.addColorStop(0, "rgba(34,211,238,.55)"); a.addColorStop(1, "rgba(34,211,238,0)");
  g.fillStyle = a; g.fillRect(0, 0, W, H);
  const b = g.createRadialGradient(W * 0.84, -H * 0.1, 0, W * 0.84, -H * 0.1, W * 0.66);
  b.addColorStop(0, "rgba(139,92,246,.75)"); b.addColorStop(1, "rgba(139,92,246,0)");
  g.fillStyle = b; g.fillRect(0, 0, W, H);
  // viewfinder corners
  g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 4;
  const m = 44, l = 46;
  [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, sx, sy]) => {
    g.beginPath(); g.moveTo(x + l * sx, y); g.lineTo(x, y); g.lineTo(x, y + l * sy); g.stroke();
  });
  // wordmark, letter-spaced like the site's
  const word = "MAKENDLESS", gap = 13;
  g.textBaseline = "middle"; g.textAlign = "left";
  fit(g, word, W * 0.7, 86, gap * (word.length - 1));
  const widths = [...word].map((ch) => g.measureText(ch).width);
  const total = widths.reduce((s, x) => s + x, 0) + gap * (word.length - 1);
  let x = (W - total) / 2;
  const x6 = x + widths.slice(0, 6).reduce((s, v) => s + v, 0) + gap * 6;
  const em = g.measureText("E"), capTop = H * 0.47 - em.actualBoundingBoxAscent, capH = em.actualBoundingBoxAscent + em.actualBoundingBoxDescent;
  [...word].forEach((ch, i) => {
    if (ch === "E") {
      // studio "E": spine + CREATE / BUILD / GROW bars (same proportions as components/brand.tsx)
      const sx = widths[i] / 92, sy = capH / 100;
      const bar = (bx: number, by: number, bw: number, bh: number, col: string) => { g.fillStyle = col; rr(g, x + bx * sx, capTop + by * sy, bw * sx, bh * sy, 3); g.fill(); };
      bar(0, 0, 22, 100, "#ffffff"); bar(0, 0, 92, 22, "#22d3ee"); bar(30, 39, 54, 22, "#8b5cf6"); bar(0, 78, 92, 22, "#c7a6ff");
    } else {
      g.fillStyle = i < 6 ? "#ffffff" : prism(g, x6, 0, x6 + total * 0.36, 0);
      g.fillText(ch, x, H * 0.47);
    }
    x += widths[i] + gap;
  });
  g.fillStyle = prism(g, W * 0.3, 0, W * 0.7, 0); rr(g, W * 0.36, H * 0.62, W * 0.28, 5, 2.5); g.fill();
  return c;
}

/** Soft prismatic halo behind the final frame. */
export function drawGlow() {
  const W = 512, H = 320, [c, g] = make(W, H);
  g.globalCompositeOperation = "lighter";
  const blob = (cx: number, cy: number, rx: number, ry: number, rgb: string, a: number) => {
    g.save(); g.translate(cx, cy); g.scale(1, ry / rx);
    const l = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    l.addColorStop(0, `rgba(${rgb},${a})`); l.addColorStop(0.55, `rgba(${rgb},${a * 0.32})`); l.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = l; g.beginPath(); g.arc(0, 0, rx, 0, Math.PI * 2); g.fill(); g.restore();
  };
  blob(W * 0.4, H * 0.54, W * 0.38, H * 0.44, "34,211,238", 0.55);
  blob(W * 0.6, H * 0.46, W * 0.39, H * 0.45, "139,92,246", 0.85);
  return c;
}
