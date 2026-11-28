"use client";
import { useEffect, useRef } from "react";
import { GROW_STATUS } from "../data/pricing";

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const EASE = "cubic-bezier(.2,.8,.2,1)";

/* Our own work in the hero frames.
   Phone: the first reel on /work ("Podcast to Reel"), cut from its showcase video: the finished edit and the raw clip,
   same 13.8 s, so the slider can wipe from one to the other on the same moment. Muted, looping, 360x640.
   Browser: a slow scroll through sevenhillsglobalpvtltd.com, a site we built (960 wide on desktop, 640 on phones).
   The stills are the first frames: they show at once, stay when video can't play, and the videos only load after the
   hero has settled (`load`). */
const REEL = { edit: "/hero/reel-edit.mp4", raw: "/hero/reel-raw.mp4", editStill: "/hero/reel-edit.webp", rawStill: "/hero/reel-raw.webp" };
const SITE = { host: "sevenhillsglobalpvtltd.com", big: "/hero/site-sevenhills-960.mp4", small: "/hero/site-sevenhills-640.mp4", still: "/hero/site-sevenhills.webp" };

/** "on" = the open tab's frame (accent glow), "off" = the other frame (dimmed), undefined = neither (GROW). */
export type Focus = "on" | "off" | undefined;
const focusStyle = (f: Focus): React.CSSProperties => ({
  opacity: f === "off" ? 0.4 : 1,
  boxShadow: f === "on" ? "0 0 0 2px var(--accent), 0 0 44px 2px color-mix(in srgb, var(--accent) 60%, transparent)" : "0 0 0 0 transparent",
  transition: "opacity .6s, box-shadow .6s",
});

/* Plays a muted looping clip only while it should be seen (hero on screen, not paused, not covered). */
function useClip(ref: React.RefObject<HTMLVideoElement | null>, play: boolean, load: boolean) {
  useEffect(() => {
    const v = ref.current; if (!v || !load) return;
    v.muted = true;
    if (play) v.play().catch(() => {}); else v.pause();
  }, [ref, play, load]);
}
function Clip({ ref, src, still, load, className = "" }: { ref: React.Ref<HTMLVideoElement>; src: string; still: string; load: boolean; className?: string }) {
  return (
    <video ref={ref} src={load ? src : undefined} poster={still} muted loop playsInline preload={load ? "auto" : "none"} disablePictureInPicture disableRemotePlayback tabIndex={-1}
      className={`absolute inset-0 h-full w-full object-cover ${className}`} />
  );
}

function BetaLabel() {
  return <span className="rounded-full bg-[#13172b] px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#c7a6ff] ring-1 ring-[#c7a6ff]/50">{GROW_STATUS}</span>;
}

/* ---------- PHONE ---------- */
export function PhoneScreen({ p, play, load, ad, focus }: { p: number; play: boolean; load: boolean; ad: boolean; focus?: Focus }) {
  const edit = useRef<HTMLVideoElement>(null), raw = useRef<HTMLVideoElement>(null);
  const wipe = clamp(p) * 100; // how much of the screen already shows the finished edit (left of the playhead line)
  const rawSeen = wipe < 99.9;
  useClip(edit, play && !ad, load);
  useClip(raw, play && !ad && rawSeen, load);
  /* Keep the raw clip on the same moment as the edit (both 13.8 s and looping). */
  useEffect(() => {
    const e = edit.current, r = raw.current;
    if (!e || !r || !load || !rawSeen) return;
    const sync = () => { if (Math.abs(r.currentTime - e.currentTime) > 0.15) r.currentTime = e.currentTime; };
    sync();
    e.addEventListener("timeupdate", sync);
    return () => e.removeEventListener("timeupdate", sync);
  }, [load, rawSeen]);
  const done = p >= 0.5;
  return (
    <div className="relative h-full w-full select-none overflow-hidden rounded-[30px] bg-black text-white" style={focusStyle(focus)}>
      <Clip ref={edit} src={REEL.edit} still={REEL.editStill} load={load} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${wipe}%)`, visibility: rawSeen ? "visible" : "hidden" }}>
        <Clip ref={raw} src={REEL.raw} still={REEL.rawStill} load={load} />
      </div>
      {wipe > 0.1 && rawSeen && <div className="absolute inset-y-0 w-[2px] bg-white shadow-[0_0_14px_3px_rgba(255,255,255,.7)]" style={{ left: `${wipe}%` }} />}
      <div className="absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
      <div className="absolute inset-x-3 top-10 flex items-center text-[9px] font-bold tracking-widest">
        <span className="flex items-center gap-1.5 rounded bg-black/55 px-1.5 py-1">
          <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-[#22d3ee]" : "bg-[#ff5c7a]"}`} />
          {done ? "FINAL EDIT" : "RAW CLIP"}
        </span>
      </div>
      {/* sample ad frame — wipes in for the marketing mode */}
      <div className="absolute inset-0 flex flex-col bg-[#f6f7fc] text-[#13172b]" style={{ clipPath: `inset(0 0 ${ad ? 0 : 100}% 0)`, transition: `clip-path .75s ${EASE}` }} aria-hidden={!ad}>
        <div className="flex items-center gap-2 px-4 pb-2 pt-11 text-[11px] font-bold"><span className="h-7 w-7 rounded-full" style={{ background: "var(--prism)" }} />yourbrand<span className="ml-auto font-normal text-[#5a6082]">Sample ad</span></div>
        <div className="relative mx-3 flex-1 overflow-hidden rounded-2xl" style={{ background: "linear-gradient(150deg,#6f45f6,#c7a6ff 55%,#22d3ee)" }}>
          <p className="absolute inset-x-4 top-7 text-[23px] font-extrabold leading-[1.05] text-white">Your offer, made impossible to ignore.</p>
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/25" />
        </div>
        <div className="flex flex-col items-center gap-2 px-4 py-4"><span className="w-full rounded-full bg-[#13172b] py-2.5 text-center text-xs font-bold text-white">Learn more</span><BetaLabel /></div>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-[30px]" style={{ background: "radial-gradient(circle at var(--gx,30%) var(--gy,10%), rgba(255,255,255,.22), transparent 42%)" }} />
    </div>
  );
}

/* ---------- BROWSER ---------- */
export function BrowserScreen({ play, load, ad, focus, small }: { play: boolean; load: boolean; ad: boolean; focus?: Focus; small?: boolean }) {
  const site = useRef<HTMLVideoElement>(null);
  useClip(site, play && !ad, load);
  return (
    <div className="relative flex h-full w-full select-none flex-col overflow-hidden rounded-[10px] bg-[#0f1226]" style={focusStyle(focus)}>
      <div className="flex h-8 shrink-0 items-center gap-1.5 bg-[#1a1d36] px-3">
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (<span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />))}
        <span className="ml-3 flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-[#0f1226] px-3 py-1 text-[10px] text-[#d5d9ea]">
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 shrink-0 fill-[#a4aac7]" aria-hidden="true"><path d="M3.5 5V3.6a2.5 2.5 0 0 1 5 0V5h.6c.5 0 .9.4.9.9v4.2c0 .5-.4.9-.9.9H2.9a.9.9 0 0 1-.9-.9V5.9c0-.5.4-.9.9-.9h.6Zm1.2 0h2.6V3.6a1.3 1.3 0 0 0-2.6 0V5Z" /></svg>
          <span className="truncate">{SITE.host}</span>
        </span>
        <span className="flex items-center gap-1 rounded bg-[#0f1226] px-2 py-1 text-[9px] font-bold tracking-widest text-[#a4aac7]"><span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />LIVE</span>
      </div>
      <div className="relative min-h-0 flex-1 bg-[#0b1611]">
        <Clip ref={site} src={small ? SITE.small : SITE.big} still={SITE.still} load={load} className="object-top" />
        {/* sample feed ad — wipes in for the marketing mode */}
        <div className="absolute inset-0 flex gap-3 bg-[#eceef7] p-3" style={{ clipPath: `inset(0 ${ad ? 0 : 100}% 0 0)`, transition: `clip-path .75s ${EASE}` }} aria-hidden={!ad}>
          <div className="w-20 shrink-0 space-y-2">{[0, 1, 2, 3].map((k) => (<div key={k} className="h-5 rounded bg-[#d5d9ea]" />))}</div>
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow">
            <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-[#13172b]"><span className="h-6 w-6 rounded-full" style={{ background: "var(--prism)" }} />yourbrand <span className="font-normal text-[#5a6082]">· Sample ad</span><span className="ml-auto"><BetaLabel /></span></div>
            <div className="relative flex-1" style={{ background: "linear-gradient(120deg,#6f45f6,#c7a6ff 55%,#22d3ee)" }}><p className="absolute left-4 top-1/2 max-w-[70%] -translate-y-1/2 text-[24px] font-extrabold leading-[1.05] text-white">Your offer, made impossible to ignore.</p></div>
            <div className="flex items-center justify-between px-3 py-2 text-[11px] text-[#13172b]"><span>Sample ad creative</span><span className="rounded-full bg-[#13172b] px-3 py-1 font-bold text-white">Learn more</span></div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at var(--gx,70%) var(--gy,0%), rgba(255,255,255,.14), transparent 45%)" }} />
    </div>
  );
}
