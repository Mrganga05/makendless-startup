/* Living division visuals for the internal pages. CSS / SVG only (no 3D, no SMIL). All purely decorative: aria-hidden,
   paused off-screen by <Live>, frozen in a finished state under reduced motion (see app/styles/pages.css). */
import type { StudioId } from "../../data/studios";
import { DemoCaption } from "../ui";
import { Live } from "./Live";

const CLIPS = [16, 22, 12, 26, 14];
const CAPS = [10, 14, 8, 12, 16, 9];
const WAVE = [30, 62, 44, 88, 52, 70, 36, 94, 58, 40, 76, 48, 84, 34, 66, 90, 42, 60, 80, 38, 72, 54, 92, 46, 64, 32, 86, 50, 74, 40, 68, 56, 96, 44, 78, 36, 62, 88, 48, 70];

/** CREATE — an edit in progress: 9:16 reel with word-pop captions, 16:9 master, timeline with a scrubbing playhead. */
export function CreateVisual({ compact = false }: { compact?: boolean }) {
  return (
    <Live className={`pag-cv ${compact ? "pag-cv--compact" : ""}`}>
      <div className="pag-cv-panel" aria-hidden="true">
        <div className="pag-cv-stage">
          <div className="pag-cv-frame pag-cv-reel">
            <span className="pag-cv-shot pag-cv-shot--1" />
            <span className="pag-cv-shot pag-cv-shot--2" />
            <span className="pag-cv-shot pag-cv-shot--3" />
            <span className="pag-cv-person" />
            <span className="pag-cv-ratio">9:16</span>
            <span className="pag-cv-caps">
              <span className="pag-cv-word pag-cv-word--1">MAKE</span>
              <span className="pag-cv-word pag-cv-word--2">THEM</span>
              <span className="pag-cv-word pag-cv-word--3">LOOK</span>
            </span>
          </div>
          <div className="pag-cv-side">
            <div className="pag-cv-frame pag-cv-wide">
              <span className="pag-cv-shot pag-cv-shot--1" />
              <span className="pag-cv-shot pag-cv-shot--2" />
              <span className="pag-cv-shot pag-cv-shot--3" />
              <span className="pag-cv-person pag-cv-person--wide" />
              <span className="pag-cv-ratio">16:9</span>
              <span className="pag-cv-lower"><i /><i /></span>
            </div>
            {!compact && (
              <div className="pag-cv-bins">
                <span className="pag-cv-bin"><b>Cut</b></span>
                <span className="pag-cv-bin"><b>Captions</b></span>
                <span className="pag-cv-bin"><b>Sound</b></span>
                <span className="pag-cv-bin"><b>Export</b></span>
              </div>
            )}
          </div>
        </div>
        <div className="pag-cv-tl">
          <div className="pag-cv-ticks" />
          <div className="pag-cv-track pag-cv-track--v">
            {CLIPS.map((w, i) => <span key={i} style={{ flexGrow: w }} />)}
          </div>
          <div className="pag-cv-track pag-cv-track--c">
            {CAPS.map((w, i) => <span key={i} style={{ flexGrow: w }} />)}
          </div>
          <div className="pag-cv-track pag-cv-track--a">
            {WAVE.map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}
          </div>
          <span className="pag-cv-playhead" />
        </div>
      </div>
      <DemoCaption className="pag-vis-cap" />
    </Live>
  );
}

/** BUILD — a wireframe assembling into a finished page inside a browser that resizes across breakpoints. */
export function BuildVisual({ compact = false, tone = "light" }: { compact?: boolean; tone?: "dark" | "light" }) {
  return (
    <Live className={`pag-bv ${compact ? "pag-bv--compact" : ""}`}>
      <div className="pag-bv-panel" aria-hidden="true">
        <div className="pag-bv-ruler">
          <span>Phone</span>
          <span>Tablet</span>
          <span>Desktop</span>
        </div>
        <div className="pag-bv-field">
          <div className="pag-bv-size">
            <span className="pag-bv-guide pag-bv-guide--l" />
            <span className="pag-bv-guide pag-bv-guide--r" />
            <div className="pag-bv-browser">
              <div className="pag-bv-chrome">
                <i /><i /><i />
                <span className="pag-bv-url">yourbusiness.example</span>
              </div>
              <div className="pag-bv-page">
                <div className="pag-bv-nav pag-bv-b" style={{ ["--i" as string]: 0 }}><span /><i /><i /><i /></div>
                <div className="pag-bv-hero">
                  <div className="pag-bv-copy">
                    <span className="pag-bv-h pag-bv-b" style={{ ["--i" as string]: 1 }} />
                    <span className="pag-bv-h pag-bv-h--2 pag-bv-b" style={{ ["--i" as string]: 2 }} />
                    <span className="pag-bv-p pag-bv-b" style={{ ["--i" as string]: 3 }} />
                    <span className="pag-bv-btn pag-bv-b" style={{ ["--i" as string]: 4 }} />
                  </div>
                  <div className="pag-bv-img pag-bv-b" style={{ ["--i" as string]: 3 }} />
                </div>
                <div className="pag-bv-cards">
                  <span className="pag-bv-card pag-bv-b" style={{ ["--i" as string]: 5 }} />
                  <span className="pag-bv-card pag-bv-b" style={{ ["--i" as string]: 6 }} />
                  <span className="pag-bv-card pag-bv-b" style={{ ["--i" as string]: 7 }} />
                </div>
              </div>
              <svg className="pag-bv-cursor" viewBox="0 0 24 24" width="22" height="22"><path d="M5 3l14 8-6 2-2 6z" strokeWidth="1.5" strokeLinejoin="round" /></svg>
            </div>
          </div>
        </div>
      </div>
      <DemoCaption tone={tone} className="pag-vis-cap" />
    </Live>
  );
}

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const SLOTS: Record<number, "post" | "story" | "ad" | "reel"> = { 1: "post", 3: "story", 5: "ad", 8: "post", 11: "reel", 13: "story", 15: "ad", 17: "post", 19: "story" };
const SLOT_ORDER = Object.keys(SLOTS).map(Number);

/** GROW — illustrative only: example ad frames, a content calendar and soft broadcast rings. No numbers, no results. */
export function GrowVisual({ compact = false, tone = "dark" }: { compact?: boolean; tone?: "dark" | "light" }) {
  return (
    <Live className={`pag-gv ${compact ? "pag-gv--compact" : ""}`}>
      <div className="pag-gv-panel" aria-hidden="true">
        <span className="pag-gv-ring pag-gv-ring--1" />
        <span className="pag-gv-ring pag-gv-ring--2" />
        <span className="pag-gv-ring pag-gv-ring--3" />
        <div className="pag-gv-cal">
          <div className="pag-gv-calhead"><b>Content calendar</b><span>Example</span></div>
          <div className="pag-gv-days">{DAYS.map((d, i) => <span key={i}>{d}</span>)}</div>
          <div className="pag-gv-grid">
            {Array.from({ length: 21 }, (_, i) => (
              <span key={i} className="pag-gv-cell">
                {SLOTS[i] && <em className={`pag-gv-slot pag-gv-slot--${SLOTS[i]}`} style={{ ["--i" as string]: SLOT_ORDER.indexOf(i) }} />}
              </span>
            ))}
          </div>
          <div className="pag-gv-legend">
            <span className="pag-gv-key pag-gv-slot--post">Post</span>
            <span className="pag-gv-key pag-gv-slot--story">Story</span>
            <span className="pag-gv-key pag-gv-slot--reel">Reel</span>
            <span className="pag-gv-key pag-gv-slot--ad">Ad</span>
          </div>
        </div>
        <div className="pag-gv-ad pag-gv-ad--story">
          <div className="pag-gv-adhead"><i /><span>Story ad</span></div>
          <div className="pag-gv-art" />
          <span className="pag-gv-line" /><span className="pag-gv-line pag-gv-line--s" />
          <span className="pag-gv-cta">Learn more</span>
        </div>
        <div className="pag-gv-ad pag-gv-ad--feed">
          <div className="pag-gv-adhead"><i /><span>Feed ad</span></div>
          <div className="pag-gv-art pag-gv-art--sq" />
          <span className="pag-gv-line" />
        </div>
      </div>
      <DemoCaption kind="illustrative" tone={tone} className="pag-vis-cap" />
    </Live>
  );
}

export function StudioVisual({ id, compact }: { id: StudioId; compact?: boolean }) {
  if (id === "create") return <CreateVisual compact={compact} />;
  if (id === "build") return <BuildVisual compact={compact} />;
  return <GrowVisual compact={compact} />;
}
