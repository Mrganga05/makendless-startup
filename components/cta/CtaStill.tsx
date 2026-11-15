"use client";
/* Still version of the closing shot, for browsers without WebGL and for visitors who prefer reduced motion.
   It lays out the same artwork the 3D scene uses (components/cta/frames.ts) with CSS motion graphics (app/styles/cta.css: transform/opacity only, paused off-screen, still under reduced motion). */
import { useEffect, useState } from "react";
import { drawCell, drawEndCard, drawReel, drawSite } from "./frames";

type Art = { end: string; reel: string; site: string; video: string[]; web: string[] };

export default function CtaStill() {
  const [art, setArt] = useState<Art | null>(null);
  useEffect(() => {
    let alive = true;
    const draw = () => {
      if (!alive) return;
      const url = (c: HTMLCanvasElement) => c.toDataURL("image/png");
      setArt({ end: url(drawEndCard()), reel: url(drawReel()), site: url(drawSite()), video: [0, 1, 2].map((v) => url(drawCell("video", v))), web: [0, 1, 2].map((v) => url(drawCell("web", v))) });
    };
    const fam = getComputedStyle(document.body).fontFamily;
    document.fonts.load(`800 40px ${fam}`, "MAKENDLESS").then(draw, draw);
    return () => { alive = false; };
  }, []);
  if (!art) return null;
  /* eslint-disable @next/next/no-img-element */
  return (
    <div className="cta-still" aria-hidden="true">
      <div className="cta-still-halo" />
      <div className="cta-still-strip cta-still-strip-l">{[2, 1, 0, 2, 1].map((v, i) => <img key={i} src={art.video[v]} alt="" />)}</div>
      <div className="cta-still-strip cta-still-strip-r">{[0, 1, 2, 0, 1].map((v, i) => <img key={i} src={art.web[v]} alt="" />)}</div>
      <div className="cta-still-phone"><img src={art.reel} alt="" /></div>
      <div className="cta-still-laptop"><div className="cta-still-lid"><img src={art.site} alt="" /></div><div className="cta-still-base" /></div>
      <div className="cta-still-frame"><img src={art.end} alt="" /></div>
      <div className="cta-still-floor"><span className="cta-still-playhead" /></div>
    </div>
  );
}
