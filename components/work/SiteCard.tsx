/* One website from data/work.ts: real desktop + phone screenshots in a laptop and phone mockup,
   a "Live" badge and "View live site" (new tab). On hover the page scrolls inside the laptop screen.
   layout "row" = big mockup beside the text (/work); "card" = stacked (homepage, /build). */
import Image from "next/image";
import type { Site } from "../../data/work";

export default function SiteCard({ site, layout = "card", tone = "dark", priority = false }: { site: Site; layout?: "card" | "row"; tone?: "dark" | "light"; priority?: boolean }) {
  const row = layout === "row";
  return (
    <article className={`site site--${layout} site--${tone}`}>
      <a href={site.url} target="_blank" rel="noopener noreferrer" className="site-stage" tabIndex={-1} aria-hidden="true">
        <span className="site-live"><span className="site-live-dot" />Live</span>
        <span className="site-laptop">
          <span className="site-screen">
            <Image src={site.desktop} alt="" fill priority={priority} sizes={row ? "(min-width: 1024px) 46vw, 88vw" : "(min-width: 1024px) 28vw, (min-width: 640px) 44vw, 80vw"} className="site-shot" />
          </span>
          <span className="site-base" />
        </span>
        <span className="site-phone">
          <span className="site-phone-screen">
            <Image src={site.mobile} alt="" fill sizes={row ? "(min-width: 1024px) 11vw, 24vw" : "(min-width: 1024px) 7vw, 20vw"} className="site-shot-m" />
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
