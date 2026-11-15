/* The three living previews inside the studio gateways. Pure markup: every motion is a CSS animation in
   app/styles/studios.css (paused off-screen, removed under reduced motion - the base styles are the composed still). */
import type { CSSProperties } from "react";

const WAVE = [34, 58, 82, 46, 70, 96, 52, 30, 64, 88, 44, 72, 100, 60, 36, 54, 80, 48, 92, 66, 38, 74, 56, 84, 42, 62, 90, 50, 32, 68, 86, 46, 76, 58, 40, 94, 64, 52, 78, 44];
const d = (n: number) => ({ ["--d" as string]: n }) as CSSProperties;

/* CREATE - an aqua-lit editing world: vertical reel with word-pop captions, hard cuts, playhead over timeline tracks. */
export function CreateWorld() {
  return (
    <div className="stu-w stu-c">
      <span className="stu-c-ghost stu-c-ghost1"><i /></span>
      <span className="stu-c-ghost stu-c-ghost2"><i /></span>
      <span className="stu-c-reel">
        <span className="stu-c-shot stu-c-shot1" />
        <span className="stu-c-shot stu-c-shot2" />
        <span className="stu-c-shot stu-c-shot3" />
        <span className="stu-c-subject"><i /><i /></span>
        <span className="stu-c-words"><b>MAKE</b><b>THEM</b><b>STOP</b></span>
        <span className="stu-c-prog"><i /></span>
      </span>
      <span className="stu-c-tl">
        <span className="stu-c-ruler" />
        <span className="stu-c-track stu-c-video"><i /><i /><i /></span>
        <span className="stu-c-track stu-c-caps"><i /><i /><i /><i /><i /><i /></span>
        <span className="stu-c-wave">
          {WAVE.map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}
        </span>
        <span className="stu-c-head" />
      </span>
    </div>
  );
}

/* BUILD - a violet blueprint world: wireframe lines draw in, blocks assemble into a finished page,
   a cursor clicks, a breakpoint handle resizes the browser. */
export function BuildWorld() {
  return (
    <div className="stu-w stu-b">
      <span className="stu-b-marks"><i /><i /><i /><i /></span>
      <span className="stu-b-win">
        <span className="stu-b-bar"><i /><i /><i /><em /></span>
        <span className="stu-b-page">
          <span className="stu-b-nav">
            <i className="stu-b-blk stu-b-logo" style={d(0)} />
            <span className="stu-b-links"><i className="stu-b-blk" style={d(1)} /><i className="stu-b-blk" style={d(2)} /><i className="stu-b-blk" style={d(3)} /></span>
            <i className="stu-b-burger" />
          </span>
          <span className="stu-b-hero">
            <span className="stu-b-copy">
              <i className="stu-b-blk stu-b-h1" style={d(2)} />
              <i className="stu-b-blk stu-b-h2" style={d(3)} />
              <i className="stu-b-blk stu-b-p" style={d(4)} />
              <i className="stu-b-blk stu-b-btn" style={d(5)} />
            </span>
            <i className="stu-b-blk stu-b-img" style={d(4)} />
          </span>
          <span className="stu-b-cards"><i className="stu-b-blk" style={d(6)} /><i className="stu-b-blk" style={d(7)} /><i className="stu-b-blk" style={d(8)} /></span>
        </span>
        <span className="stu-b-handle" />
        <span className="stu-b-dim" />
      </span>
      <span className="stu-b-cursor" />
    </div>
  );
}

/* GROW (Beta) - a soft lilac world: a stack of feed / story ad frames and a content-calendar grid gently cycling.
   Illustrative only: no charts, bars, numbers or anything implying results. */
const POSTS: Record<number, string> = { 1: "a", 4: "b", 6: "c", 9: "b", 10: "a", 12: "c", 15: "a", 17: "b", 19: "c" };
export function GrowWorld() {
  return (
    <div className="stu-w stu-g">
      <span className="stu-g-rings"><i /><i /><i /></span>
      <span className="stu-g-cal">
        <span className="stu-g-calhead"><i /><em /><em /></span>
        <span className="stu-g-grid">
          {Array.from({ length: 21 }, (_, i) => (
            <i key={i} className={POSTS[i] ? `stu-g-post stu-g-post-${POSTS[i]}` : undefined} style={d((i % 7) + Math.floor(i / 7))} />
          ))}
        </span>
      </span>
      <span className="stu-g-stack">
        <span className="stu-g-card stu-g-k3">
          <span className="stu-g-top"><i /><em /></span>
          <span className="stu-g-media stu-g-m3"><i /><i /></span>
          <span className="stu-g-dots"><i /><i /><i /></span>
        </span>
        <span className="stu-g-card stu-g-k2">
          <span className="stu-g-segs"><i /><i /><i /></span>
          <span className="stu-g-media stu-g-m2"><i /></span>
          <span className="stu-g-pill" />
        </span>
        <span className="stu-g-card stu-g-k1">
          <span className="stu-g-top"><i /><em /></span>
          <span className="stu-g-media stu-g-m1"><i /></span>
          <span className="stu-g-foot"><i /><em /></span>
        </span>
      </span>
    </div>
  );
}
