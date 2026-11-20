"use client";
/* Homepage "Combo packs": six packs, "Add this pack" selects everything inside it. */
import { useMemo } from "react";
import { combos, COPY } from "../../data/pricing";
import { estimate, inr } from "../../lib/pricing";
import { Eyebrow, KineticHeading } from "../ui";
import { useSelection } from "./state";

export default function ComboPacks() {
  const { sel, ref, addCombo } = useSelection();
  const applied = useMemo(() => estimate(sel, !!ref).combo?.id, [sel, ref]);
  return (
    <section id="combos" data-tone="light" aria-labelledby="combo-title" className="bg-white px-4 py-20 text-dark sm:px-6 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <Eyebrow tone="light">Save more</Eyebrow>
        <KineticHeading id="combo-title" text="Combo packs" className="mt-4 text-[clamp(2rem,6vw,3.6rem)] font-extrabold leading-tight tracking-tight" />
        <ul className="svc-combos mt-10 md:mt-12">
          {combos.map((c) => {
            const has = c.items.every((i) => (sel.items[i.id] ?? 0) >= i.qty);
            return (
              <li key={c.id} id={`combo-${c.id}`} className="svc-combo" data-applied={applied === c.id}>
                <div className="svc-combo-top">
                  {c.tag ? <span className="svc-tag">{c.tag}</span> : <span />}
                  {applied === c.id && <span className="svc-badge">Applied</span>}
                </div>
                <h3 className="svc-combo-name">{c.name}</h3>
                <p className="svc-combo-inside">{c.inside}</p>
                <p className="svc-combo-price">
                  <b>{inr(c.price)}{c.monthly ? "/month" : ""}</b> <s aria-label={`Normal price ${inr(c.normal)}`}>{inr(c.normal)}</s>
                </p>
                <p className="svc-combo-save">Save {inr(c.save)}</p>
                <button type="button" className="for-btn for-btn-primary svc-combo-btn" onClick={() => addCombo(c)} aria-pressed={has}>
                  {has ? "✓ Added" : "Add this pack"}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-8 max-w-3xl text-[15px] leading-relaxed text-muted-dark">{COPY.smallChanges}</p>
      </div>
    </section>
  );
}
