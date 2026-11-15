/* MAKENDLESS brand marks.
   The signature "E": a spine plus three bars in the studio colours — CREATE (aqua), BUILD (violet), GROW (lilac).
   The three studios are literally built into the name. Used in the wordmark (both Es) and as the app icon. */

type EProps = { className?: string; mono?: boolean };

/** The studio "E" glyph. Sized in em so it sits in running text at cap height. */
export function EGlyph({ className = "", mono = false }: EProps) {
  return (
    <svg viewBox="0 0 92 100" className={`inline-block h-[0.72em] w-auto align-baseline ${className}`} aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="22" height="100" rx="4" fill="currentColor" />
      <rect x="0" y="0" width="92" height="22" rx="4" fill={mono ? "currentColor" : "#22d3ee"} />
      <rect x="30" y="39" width="54" height="22" rx="4" fill={mono ? "currentColor" : "#8b5cf6"} />
      <rect x="0" y="78" width="92" height="22" rx="4" fill={mono ? "currentColor" : "#c7a6ff"} />
    </svg>
  );
}

/** Full wordmark: MAK·E·ND LESS with both Es drawn as the studio glyph; "LESS" keeps the prism gradient. */
export function Wordmark({ className = "", mono = false }: EProps) {
  return (
    <span className={`inline-flex items-baseline whitespace-nowrap font-extrabold tracking-[0.18em] ${className}`} aria-label="MAKENDLESS" role="img">
      <span aria-hidden="true">MAK</span>
      <EGlyph mono={mono} className="mr-[0.18em]" />
      <span aria-hidden="true">ND</span>
      <span aria-hidden="true" className={mono ? "" : "prism-text"}>L</span>
      <EGlyph mono={mono} className="mr-[0.18em]" />
      <span aria-hidden="true" className={mono ? "" : "prism-text"}>SS</span>
    </span>
  );
}

/** Square app mark: the studio E on ink. */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="MAKENDLESS">
      <rect width="64" height="64" rx="15" fill="#0c1024" />
      <g transform="translate(17 15) scale(0.34)">
        <rect x="0" y="0" width="22" height="100" rx="4" fill="#f6f8ff" />
        <rect x="0" y="0" width="92" height="22" rx="4" fill="#22d3ee" />
        <rect x="30" y="39" width="54" height="22" rx="4" fill="#8b5cf6" />
        <rect x="0" y="78" width="92" height="22" rx="4" fill="#c7a6ff" />
      </g>
    </svg>
  );
}
