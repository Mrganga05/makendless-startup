"use client";
/* One numbered row of the packages menu. Collapsed: number, name, who it suits. Expanded: the scope sheet + Request Quote. */
import type { Package, Studio } from "../../data/site";
import { Arrow, ButtonLink } from "../ui";

function Block({ title, items, kind }: { title: string; items: string[]; kind: "tick" | "dash" | "plus" }) {
  return (
    <div className="pac-block">
      <h4 className="pac-label">{title}</h4>
      <ul className="pac-items" data-kind={kind}>
        {items.map((it) => <li key={it}>{it}</li>)}
      </ul>
    </div>
  );
}

export default function PackageRow({ pkg, n, studio, idBase, open, onToggle }: { pkg: Package; n: number; studio: Studio; idBase: string; open: boolean; onToggle: () => void }) {
  const btn = `${idBase}-btn`;
  const panel = `${idBase}-panel`;
  return (
    <li className="pac-row" data-open={open} style={{ ["--i" as string]: n - 1 }}>
      <h3 className="m-0">
        <button type="button" id={btn} aria-expanded={open} aria-controls={panel} onClick={onToggle} className="pac-rowbtn">
          <span className="pac-num tabular-nums" aria-hidden="true">{String(n).padStart(2, "0")}</span>
          <span className="pac-name">{pkg.name}</span>
          <span className="pac-for">{pkg.for}</span>
          <span className="pac-toggle" aria-hidden="true" />
        </button>
      </h3>
      <div id={panel} role="region" aria-labelledby={btn} className="pac-detail" inert={!open}>
        <div className="pac-detail-clip">
          <div className="pac-detail-body">
            <div className="pac-grid">
              <Block title="Typical deliverables" items={pkg.deliverables} kind="tick" />
              <Block title="Your quote depends on" items={pkg.quoteDependsOn} kind="dash" />
              <Block title="What you'd provide" items={pkg.youProvide} kind="dash" />
              {pkg.addons.length > 0 && <Block title="Optional additions" items={pkg.addons} kind="plus" />}
            </div>
            <div className="pac-action">
              <p className="pac-note">Quoted for your project. No fixed price is published.</p>
              <ButtonLink href={`/contact?service=${studio.id}&package=${pkg.slug}`} tone="light" className="pac-cta">
                Request Quote<span className="sr-only"> for {studio.name}: {pkg.name}</span> <Arrow />
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
