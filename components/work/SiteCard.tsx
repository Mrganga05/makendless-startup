/* One website from data/work.ts: real desktop + phone screenshots in a laptop and phone mockup,
   a "Live" badge and "View live site" (new tab). On hover the page scrolls inside the laptop screen.
   Cards in a slider are all the same height; "View live site" sits at the bottom so the buttons line up. */
import Image from "next/image";
import type { Site } from "../../data/work";

const SIZES = "(min-width: 1280px) 470px, (min-width: 1024px) 37vw, (min-width: 640px) 62vw, 82vw";
const PHONE_SIZES = "(min-width: 1280px) 100px, (min-width: 1024px) 8vw, (min-width: 640px) 13vw, 18vw";

export default function SiteCard({ site, priority = false }: { site: Site; priority?: boolean }) {
  return (
    <article className="site">
      <a href={site.url} target="_blank" rel="noopener noreferrer" className="site-stage" tabIndex={-1} aria-hidden="true">
        <span className="site-live"><span className="site-live-dot" />Live</span>
        <span className="site-laptop">
          <span className="site-screen">
            <Image src={site.desktop} alt="" fill priority={priority} sizes={SIZES} className="site-shot" />
          </span>
          <span className="site-base" />
        </span>
        <span className="site-phone">
          <span className="site-phone-screen">
            <Image src={site.mobile} alt="" fill sizes={PHONE_SIZES} className="site-shot-m" />
          </span>
        </span>
      </a>
      <div className="site-body">
        <p className="site-cat">{site.category}</p>
        <h3 className="site-name">{site.name}</h3>
        <p className="site-text">{site.text}</p>
        <ul className="site-tags" aria-label="What we built">
          {site.tags.map((t) => <li key={t}>{t}</li>)}
        </ul>
        <a href={site.url} target="_blank" rel="noopener noreferrer" className="site-cta">
          View live site <span aria-hidden="true">↗</span><span className="sr-only"> (opens {site.name} in a new tab)</span>
        </a>
      </div>
    </article>
  );
}
