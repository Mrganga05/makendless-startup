/* GROW (Beta) panel of the packages menu: an honest "coming soon" sheet, not a package. Nothing here can be bought. */
import { growPreview } from "../../data/site";
import { Arrow, ButtonLink } from "../ui";

export default function GrowSheet() {
  const g = growPreview;
  return (
    <div className="pac-grow">
      <div className="pac-grow-intro pac-row" style={{ ["--i" as string]: 0 }}>
        <span className="pac-rings" aria-hidden="true" />
        <p className="pac-soon">{g.status}</p>
        <h3 className="pac-grow-title">{g.title}</h3>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-dark">{g.summary}</p>
        <div className="mt-7">
          <ButtonLink href={g.cta.href} tone="light" className="pac-cta">{g.cta.label} <Arrow /></ButtonLink>
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-muted-dark">{g.cta.note}</p>
        </div>
      </div>
      <div className="pac-grow-plan">
        <h4 className="pac-label pac-row" style={{ ["--i" as string]: 1 }}>What we are developing <span className="font-semibold normal-case tracking-normal">(not yet offered)</span></h4>
        <ol className="pac-plan">
          {g.planned.map((p, i) => (
            <li key={p.title} className="pac-row pac-plan-row" style={{ ["--i" as string]: i + 2 }}>
              <span className="pac-num tabular-nums" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <span className="pac-plan-text">
                <span className="pac-plan-title">{p.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-dark">{p.note}</span>
              </span>
              <span className="pac-chip">In development</span>
            </li>
          ))}
        </ol>
        <div className="pac-row mt-6" style={{ ["--i" as string]: 5 }}>
          <h4 className="pac-label">A future quote would depend on</h4>
          <ul className="pac-items pac-items-inline" data-kind="dash">
            {g.wouldDependOn.map((d) => <li key={d}>{d}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
