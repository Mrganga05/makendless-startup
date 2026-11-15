/* The four customer scenes for "Solutions For You". Pure CSS/HTML illustrations (no SMIL, no images).
   Everything here is decorative: the stage wrapper carries aria-hidden and a text alternative.
   Sizes are in em (the scene's font-size follows the stage width) and % so each scene holds from 320px to 700px. */
import type { SolutionId } from "../../data/solutions";

function Person({ className = "" }: { className?: string }) {
  return <span className={`sol-person ${className}`}><i /><b /></span>;
}

function Play({ className = "" }: { className?: string }) {
  return (
    <span className={`sol-play ${className}`}>
      <svg viewBox="0 0 12 12" className="h-[45%] w-[45%] translate-x-[8%]" aria-hidden="true"><path d="M2.5 1.2v9.6L10.5 6z" fill="currentColor" /></svg>
    </span>
  );
}

/** Browser window chrome shared by the three website scenes. */
function Win({ url, className = "", children }: { url: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`sol-win sol-card absolute flex flex-col overflow-hidden rounded-[1em] bg-white ${className}`}>
      <div className="flex flex-none items-center gap-[.45em] border-b border-line bg-paper px-[.9em] py-[.6em]">
        <i className="h-[.6em] w-[.6em] rounded-full bg-line" /><i className="h-[.6em] w-[.6em] rounded-full bg-line" /><i className="h-[.6em] w-[.6em] rounded-full bg-line" />
        <span className="sol-t-xs ml-[.6em] min-w-0 flex-1 truncate rounded-full bg-white px-[.9em] py-[.15em] font-semibold text-muted-dark ring-1 ring-line">{url}</span>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ Content Creator */
function CreatorScene() {
  const words = ["one", "take.", "three", "shorts."];
  return (
    <div className="sol-scene sol-sc-creator">
      <div className="sol-cr-left">
        {/* the long recording */}
        <div className="sol-card relative aspect-video overflow-hidden rounded-[1em] bg-ink">
          <div className="sol-footage sol-footage-a absolute inset-0" />
          <Person className="!w-[34%]" />
          <span className="sol-tag absolute left-[.7em] top-[.7em]"><i className="bg-create" />Long-form recording</span>
          <span className="sol-t-xs absolute bottom-[.6em] right-[.8em] rounded-[.4em] bg-ink/70 px-[.5em] py-[.1em] font-bold tabular-nums text-white">18:42</span>
        </div>
        {/* its timeline, being cut */}
        <div className="sol-card mt-[1em] rounded-[1em] bg-white p-[.8em]">
          <div className="sol-t-xs flex items-center justify-between font-bold text-muted-dark">
            <span className="text-dark">Timeline</span><span>3 cuts marked</span>
          </div>
          <div className="relative mt-[.55em] h-[3.4em] overflow-hidden rounded-[.5em] bg-paper-2">
            <span className="sol-wave absolute inset-0" />
            <span className="sol-seg sol-seg-1"><b>1</b></span>
            <span className="sol-seg sol-seg-2"><b>2</b></span>
            <span className="sol-seg sol-seg-3"><b>3</b></span>
            <span className="sol-playhead" />
          </div>
          <div className="sol-ticks mt-[.4em] h-[.45em]" />
        </div>
        <div className="sol-cr-chips mt-[1em] flex flex-wrap gap-[.5em]">
          {["Cut", "Caption", "Reframe 9:16"].map((t) => (
            <span key={t} className="sol-t-xs rounded-full bg-white/80 px-[.8em] py-[.25em] font-bold text-dark ring-1 ring-ink/10">{t}</span>
          ))}
        </div>
      </div>

      {/* the three vertical shorts */}
      {[1, 2, 3].map((n) => (
        <div key={n} className={`sol-short sol-short-${n} sol-card`}>
          <div className={`sol-footage sol-footage-s${n} absolute inset-0`} />
          <Person className="!w-[74%]" />
          <span className="sol-tag absolute left-[.5em] top-[.5em]"><i />{`Short ${n}`}</span>
          {n === 2 ? (
            <span className="sol-cap absolute inset-x-[8%] bottom-[13%] flex flex-wrap justify-center gap-[.25em]">
              {words.map((w, i) => <b key={w} className={`sol-word sol-word-${i + 1}`}>{w}</b>)}
            </span>
          ) : (
            <span className="absolute inset-x-[14%] bottom-[14%] grid gap-[.3em]">
              <i className="h-[.6em] rounded-full bg-white/90" /><i className="mx-auto h-[.6em] w-[62%] rounded-full bg-white/60" />
            </span>
          )}
          <span className="absolute inset-x-[8%] bottom-[5%] h-[.22em] overflow-hidden rounded-full bg-white/30"><i className={`sol-prog sol-prog-${n} block h-full rounded-full bg-white`} /></span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ Local Business */
function LocalScene() {
  return (
    <div className="sol-scene sol-sc-local">
      <Win url="junipercafe.example" className="left-[5%] top-[8%] h-[80%] w-[68%]">
        <div className="flex items-center justify-between px-[1.1em] py-[.7em]">
          <span className="sol-t-sm flex items-center gap-[.5em] font-extrabold text-dark"><i className="h-[1.2em] w-[1.2em] rounded-[.35em] bg-build" />Juniper Café</span>
          <span className="sol-t-xs flex gap-[1.1em] font-bold text-muted-dark max-sm:hidden"><span>Menu</span><span>Visit</span><span className="text-dark">Book</span></span>
        </div>
        {/* shopfront: awning + window + door */}
        <div className="relative mx-[1.1em] overflow-hidden rounded-[.8em] bg-paper-2">
          <div className="sol-awning flex">{Array.from({ length: 9 }, (_, i) => <i key={i} />)}</div>
          <div className="flex items-end gap-[.7em] px-[1em] pb-0 pt-[.7em]">
            <span className="sol-shopwin relative h-[4.6em] flex-1 rounded-t-[.5em]"><i className="sol-steam sol-steam-1" /><i className="sol-steam sol-steam-2" /><b className="sol-cup" /></span>
            <span className="sol-door h-[5.6em] w-[3em] rounded-t-[.5em]" />
          </div>
        </div>
        <div className="px-[1.1em] pt-[.9em]">
          <p className="text-[1.5em] font-extrabold leading-[1.1] text-dark">Fresh bakes,<br />every morning.</p>
          <p className="sol-t-xs mt-[.5em] font-semibold text-muted-dark">Open daily · Old Town corner</p>
          <span className="sol-t-xs mt-[.8em] inline-flex rounded-full bg-ink px-[1em] py-[.4em] font-bold text-white">Book a table</span>
        </div>
        <div className="absolute inset-x-[1.1em] bottom-[.9em] grid grid-cols-3 gap-[.6em] max-sm:hidden">
          {["Breakfast", "Coffee", "Catering"].map((t, i) => (
            <span key={t} className="sol-t-xs rounded-[.6em] border border-line px-[.7em] py-[.5em] font-bold text-dark"><i className={`mb-[.4em] block h-[.35em] w-[1.6em] rounded-full ${i === 1 ? "bg-create" : i === 2 ? "bg-grow" : "bg-build"}`} />{t}</span>
          ))}
        </div>
      </Win>

      {/* booking widget */}
      <div className="sol-card sol-float-a absolute right-[4%] top-[20%] w-[39%] rounded-[1em] bg-white p-[.9em] max-sm:w-[46%] max-sm:p-[.7em]">
        <p className="sol-t-sm font-extrabold text-dark">Book a table</p>
        <div className="mt-[.6em] grid grid-cols-3 gap-[.35em]">
          {[["Thu", "12"], ["Fri", "13"], ["Sat", "14"]].map(([d, n], i) => (
            <span key={d} className={`rounded-[.55em] py-[.3em] text-center ${i === 1 ? "bg-build text-white" : "bg-paper-2 text-dark"}`}>
              <span className="sol-t-xs block font-semibold opacity-80">{d}</span><span className="sol-t-sm block font-extrabold tabular-nums">{n}</span>
            </span>
          ))}
        </div>
        <div className="mt-[.5em] grid grid-cols-2 gap-[.35em]">
          {["9:00", "10:30", "12:00", "13:30"].map((t, i) => (
            <span key={t} className={`sol-slot sol-slot-${i + 1} sol-t-xs rounded-full py-[.3em] text-center font-bold tabular-nums`}>{t}</span>
          ))}
        </div>
        <span className="sol-press sol-t-xs mt-[.6em] flex items-center justify-center rounded-full bg-ink py-[.5em] font-bold text-white">Request booking</span>
      </div>

      {/* promo video tile */}
      <div className="sol-card sol-float-b absolute bottom-[6%] right-[8%] aspect-video w-[34%] overflow-hidden rounded-[.9em] bg-ink max-sm:right-[4%] max-sm:w-[42%]">
        <div className="sol-footage sol-footage-warm absolute inset-0" />
        <b className="sol-cup sol-cup-lg" /><i className="sol-steam sol-steam-3" /><i className="sol-steam sol-steam-4" />
        <span className="sol-tag absolute left-[.5em] top-[.5em]"><i className="bg-create" />Promo video</span>
        <Play className="absolute bottom-[.9em] left-[.6em] !h-[1.9em] !w-[1.9em]" />
        <span className="absolute inset-x-0 bottom-0 h-[.3em] bg-white/25"><i className="sol-prog sol-prog-2 block h-full bg-create" /></span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Startup */
function StartupScene() {
  return (
    <div className="sol-scene sol-sc-startup">
      <Win url="lumen.example" className="left-[5%] top-[8%] h-[72%] w-[74%]">
        <div className="flex items-center justify-between px-[1.2em] py-[.75em]">
          <span className="sol-t-sm flex items-center gap-[.45em] font-extrabold text-dark"><i className="sol-logo h-[1.15em] w-[1.15em] rounded-full" />lumen</span>
          <span className="sol-t-xs flex items-center gap-[1.1em] font-bold text-muted-dark"><span className="max-sm:hidden">Product</span><span className="max-sm:hidden">Story</span><span className="rounded-full bg-ink px-[.9em] py-[.3em] text-white">Get access</span></span>
        </div>
        <div className="px-[1.2em] pt-[.9em]">
          <span className="sol-t-xs inline-flex items-center gap-[.4em] rounded-full bg-build/10 px-[.8em] py-[.2em] font-bold text-violet"><i className="h-[.45em] w-[.45em] rounded-full bg-build" />Launching soon</span>
          <p className="mt-[.5em] text-[2em] font-extrabold leading-[1.02] tracking-[-.01em] text-dark max-sm:text-[1.7em]">Plan the week<br />in one <span className="sol-ink-prism">calm place.</span></p>
          <p className="sol-t-xs mt-[.6em] max-w-[24em] font-semibold text-muted-dark">Tasks, notes and time in a single view.</p>
          <div className="mt-[.9em] flex w-[72%] items-center gap-[.4em] rounded-full bg-paper p-[.3em] ring-1 ring-line max-sm:w-[92%]">
            <span className="sol-t-xs flex min-w-0 flex-1 items-center pl-[.7em] font-semibold text-muted-dark"><span className="truncate">you@email</span><i className="sol-caret" /></span>
            <span className="sol-t-xs sol-press flex-none rounded-full bg-violet px-[.9em] py-[.4em] font-bold text-white">Join waitlist</span>
          </div>
        </div>
        {/* feature blocks assembling on a grid */}
        <div className="absolute inset-x-[1.2em] bottom-[1em] grid grid-cols-3 gap-[.6em]">
          {[1, 2, 3].map((n) => (
            <span key={n} className={`sol-block sol-block-${n} rounded-[.6em] p-[.6em]`}>
              <i className="block h-[.9em] w-[.9em] rounded-[.25em]" /><i className="mt-[.5em] block h-[.4em] w-[70%] rounded-full" /><i className="mt-[.3em] block h-[.4em] w-[45%] rounded-full" />
            </span>
          ))}
        </div>
      </Win>

      {/* pitch-style promo frame */}
      <div className="sol-card sol-float-a absolute bottom-[6%] right-[4%] w-[48%] overflow-hidden rounded-[1em] bg-ink max-sm:w-[56%]">
        <div className="relative aspect-video overflow-hidden">
          <div className="sol-footage sol-footage-pitch absolute inset-0" />
          <span className="sol-tag absolute left-[.6em] top-[.6em]"><i className="bg-create" />Launch promo</span>
          <span className="sol-t-xs absolute left-[1em] top-[36%] font-bold uppercase tracking-[.18em] text-white/70">Introducing lumen</span>
          <span className="sol-kinetic absolute left-[1em] top-[46%] text-[2.5em] font-extrabold leading-none text-white">
            <b className="sol-kw sol-kw-1">Plan.</b><b className="sol-kw sol-kw-2">Focus.</b><b className="sol-kw sol-kw-3">Launch.</b>
          </span>
        </div>
        <div className="flex items-center gap-[.6em] bg-ink px-[.8em] py-[.55em]">
          <Play className="!h-[1.5em] !w-[1.5em] flex-none" />
          <span className="relative h-[.3em] flex-1 rounded-full bg-white/20"><i className="sol-prog sol-prog-1 block h-full rounded-full bg-create" /></span>
          <span className="sol-t-xs font-bold tabular-nums text-white/80">0:30</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Online Store */
function StoreScene() {
  const items: [string, string][] = [["Speckle mug", "mug"], ["Tall vase", "vase"], ["Low bowl", "bowl"], ["Pour jug", "jug"], ["Small cup", "cup"], ["Wide plate", "plate"]];
  return (
    <div className="sol-scene sol-sc-store">
      <Win url="kilnandclay.example/shop" className="left-[5%] top-[8%] h-[82%] w-[72%]">
        <div className="flex items-center justify-between px-[1.1em] py-[.7em]">
          <span className="sol-t-sm font-extrabold tracking-[.02em] text-dark">Kiln &amp; Clay</span>
          <span className="flex items-center gap-[.8em]">
            <span className="sol-t-xs font-bold text-muted-dark max-sm:hidden">Shop</span>
            <span className="sol-bag relative"><i /><b className="sol-badge sol-t-xs">2</b></span>
          </span>
        </div>
        <div className="flex gap-[.4em] px-[1.1em]">
          {["All", "Mugs", "Vases", "Sets"].map((c, i) => (
            <span key={c} className={`sol-t-xs rounded-full px-[.8em] py-[.2em] font-bold ${i === 0 ? "bg-ink text-white" : "bg-paper-2 text-dark"} ${i === 3 ? "max-sm:hidden" : ""}`}>{c}</span>
          ))}
        </div>
        <div className="absolute inset-x-[1.1em] bottom-[1em] top-[5.6em] grid grid-cols-3 grid-rows-2 gap-[.6em] max-sm:top-[5.2em] max-sm:grid-cols-2">
          {items.map(([name, shape], i) => (
            <span key={name} className={`flex min-h-0 flex-col ${i > 3 ? "max-sm:hidden" : ""}`}>
              <span className={`sol-prod sol-prod-${(i % 3) + 1} relative min-h-0 flex-1 overflow-hidden rounded-[.7em]`}><b className={`sol-item sol-item-${shape}`} /></span>
              <span className="sol-t-xs mt-[.35em] flex items-center justify-between gap-[.3em] font-bold text-dark"><span className="truncate">{name}</span><i className={`sol-add ${i === 0 ? "sol-add-on" : ""}`} /></span>
            </span>
          ))}
        </div>
      </Win>

      {/* product video tile */}
      <div className="sol-card sol-float-a absolute bottom-[6%] right-[4%] aspect-[4/5] w-[32%] overflow-hidden rounded-[1em] bg-ink max-sm:w-[38%]">
        <div className="sol-footage sol-footage-prod absolute inset-0" />
        <span className="sol-turn absolute inset-x-0 bottom-[16%] top-[18%]"><b className="sol-item sol-item-vase sol-item-hero" /><i className="sol-shine" /></span>
        <span className="sol-tag absolute left-[.5em] top-[.5em]"><i className="bg-create" />Product video</span>
        <Play className="absolute bottom-[1em] left-[.6em] !h-[1.9em] !w-[1.9em]" />
        <span className="absolute inset-x-0 bottom-0 h-[.3em] bg-white/25"><i className="sol-prog sol-prog-3 block h-full bg-create" /></span>
      </div>
    </div>
  );
}

export default function Scene({ id }: { id: SolutionId }) {
  if (id === "creator") return <CreatorScene />;
  if (id === "local") return <LocalScene />;
  if (id === "startup") return <StartupScene />;
  return <StoreScene />;
}
