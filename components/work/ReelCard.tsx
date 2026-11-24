"use client";
/* One 9:16 reel from data/work.ts.
   Fast: only the small poster loads; the video has preload="none", so nothing downloads until someone plays it
   (the element exists from the start so iPhones allow sound and fullscreen straight from a tap).
   Desktop (mouse): hover plays a muted preview, click keeps it playing. Phone: tap plays / pauses.
   Sound and fullscreen buttons; only one reel plays at a time; it pauses when scrolled out of view.
   The video address is only attached once the card is near the screen, and while a reel plays, <html data-reel="playing">
   lets the floating chat / WhatsApp buttons step aside on phones (app/styles/chat.css). */
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Reel } from "../../data/work";

const EVENT = "mk:reel-play";
const PLAYING = new Set<HTMLVideoElement>();
const mark = () => { if (PLAYING.size) document.documentElement.dataset.reel = "playing"; else delete document.documentElement.dataset.reel; };
type FsVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

export default function ReelCard({ reel, sizes = "(min-width: 1280px) 270px, (min-width: 1024px) 21vw, (min-width: 768px) 30vw, (min-width: 640px) 38vw, 64vw", className = "", priority = false }: { reel: Reel; sizes?: string; className?: string; priority?: boolean }) {
  const box = useRef<HTMLElement>(null);
  const vid = useRef<FsVideo>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [waiting, setWaiting] = useState(false);
  const [near, setNear] = useState(false); // card is on or near the screen: only then the video gets its address
  const pinned = useRef(false); // started by click/tap (hover-out won't pause it)

  const play = useCallback(() => {
    const v = vid.current;
    if (!v) return;
    window.dispatchEvent(new CustomEvent(EVENT, { detail: reel.id }));
    if (v.readyState < 3) setWaiting(true); // first play: show the spinner while the video starts
    v.play().catch(() => setWaiting(false)); /* blocked or interrupted: stay on the poster */
  }, [reel.id]);
  const pause = useCallback(() => { vid.current?.pause(); }, []);

  /* one reel at a time; pause when it leaves the screen */
  useEffect(() => {
    const other = (e: Event) => { if ((e as CustomEvent).detail !== reel.id) { pinned.current = false; vid.current?.pause(); } };
    window.addEventListener(EVENT, other);
    const io = new IntersectionObserver(([en]) => { if (!en.isIntersecting) { pinned.current = false; vid.current?.pause(); } }, { threshold: 0.15 });
    const soon = new IntersectionObserver(([en]) => { if (en.isIntersecting) { setNear(true); soon.disconnect(); } }, { rootMargin: "300px" });
    if (box.current) { io.observe(box.current); soon.observe(box.current); }
    const v = vid.current;
    return () => { window.removeEventListener(EVENT, other); io.disconnect(); soon.disconnect(); if (v && PLAYING.delete(v)) mark(); };
  }, [reel.id]);

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const onEnter = (e: React.PointerEvent) => { if (e.pointerType === "mouse" && !reduced()) play(); };
  const onLeave = (e: React.PointerEvent) => { if (e.pointerType === "mouse" && !pinned.current) pause(); };

  const toggle = () => {
    if (playing && pinned.current) { pinned.current = false; pause(); return; }
    pinned.current = true;
    play();
  };
  const sound = () => {
    const next = !muted;
    setMuted(next);
    if (vid.current) vid.current.muted = next;
    if (!next) { pinned.current = true; play(); }
  };
  const enterFs = () => {
    const v = vid.current;
    if (!v) return;
    pinned.current = true;
    v.muted = false; setMuted(false);
    play();
    if (v.requestFullscreen) v.requestFullscreen().catch(() => {});
    else v.webkitEnterFullscreen?.();
  };
  /* native controls only while fullscreen */
  useEffect(() => {
    const fs = () => { const v = vid.current; if (v) v.controls = document.fullscreenElement === v; };
    document.addEventListener("fullscreenchange", fs);
    return () => document.removeEventListener("fullscreenchange", fs);
  }, []);

  return (
    <article ref={box} className={`reel ${playing ? "is-playing" : ""} ${className}`} onPointerEnter={onEnter} onPointerLeave={onLeave}>
      <Image src={reel.poster} alt="" fill sizes={sizes} priority={priority} className="reel-poster" />
      <video
        ref={vid} className="reel-video" src={near ? reel.video : undefined} muted={muted} playsInline loop preload="none" aria-hidden="true" tabIndex={-1}
        onPlaying={(e) => { setPlaying(true); setWaiting(false); PLAYING.add(e.currentTarget); mark(); }}
        onPause={(e) => { setPlaying(false); setWaiting(false); PLAYING.delete(e.currentTarget); mark(); }}
        onWaiting={() => setWaiting(true)} onCanPlay={() => setWaiting(false)}
      />
      <button type="button" className="reel-hit" onClick={toggle} aria-label={`${playing ? "Pause" : "Play"} ${reel.title}`}>
        <span className="reel-play" aria-hidden="true">
          {waiting ? <span className="reel-spin" /> : playing ? (
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
          )}
        </span>
      </button>
      <div className="reel-tools">
        <button type="button" className="reel-tool" onClick={sound} aria-pressed={!muted} aria-label={muted ? `Turn sound on for ${reel.title}` : `Mute ${reel.title}`}>
          {muted ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="m22 9-6 6M16 9l6 6" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /></svg>
          )}
        </button>
        <button type="button" className="reel-tool" onClick={enterFs} aria-label={`Watch ${reel.title} fullscreen`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
        </button>
      </div>
      <div className="reel-meta">
        <span className="reel-tag">{reel.service}</span>
        <h3 className="reel-title">{reel.title}</h3>
        <p className="reel-text">{reel.text}</p>
      </div>
    </article>
  );
}
