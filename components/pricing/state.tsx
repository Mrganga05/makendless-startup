"use client";
/* Shared selection (BUILD + CREATE + combos + final page) and the visitor's referral, kept for the visit in sessionStorage. */
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { OPTIONS, type Combo } from "../../data/pricing";
import { EMPTY, estimate, inr, type Selection } from "../../lib/pricing";

type Ref = { code: string; name: string } | null;
interface Ctx {
  sel: Selection;
  ready: boolean;
  ref: Ref;
  setRef: (r: Ref) => void;
  toggle: (id: string) => void;
  setQty: (id: string, n: number) => void;
  toggleExtra: (id: string) => void;
  setReq: (service: string, text: string) => void;
  addCombo: (c: Combo) => void;
  clear: () => void;
}
const C = createContext<Ctx | null>(null);
export const useSelection = () => useContext(C)!;

const SEL_KEY = "mk:sel", REF_KEY = "mk:ref", BANNER_KEY = "mk:ref-banner";
const read = <T,>(k: string): T | null => { try { return JSON.parse(sessionStorage.getItem(k) || "null") as T; } catch { return null; } };
const write = (k: string, v: unknown) => { try { v === null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, JSON.stringify(v)); } catch { /* storage off */ } };

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [sel, setSel] = useState<Selection>(EMPTY);
  const [ref, setRefState] = useState<Ref>(null);
  const [ready, setReady] = useState(false);
  const [banner, setBanner] = useState(false);

  useEffect(() => {
    const s = read<Selection>(SEL_KEY);
    if (s?.items) setSel({ items: s.items, extras: s.extras || {}, reqs: s.reqs || {} });
    const r = read<Ref>(REF_KEY);
    if (r?.code) { setRefState(r); setBanner(read<boolean>(BANNER_KEY) !== false); }
    setReady(true);
    /* ?ref=CODE: check it is real, then remember it for this visit. Unknown codes do nothing. */
    const code = new URLSearchParams(window.location.search).get("ref");
    if (code) {
      fetch(`/api/referral/check?code=${encodeURIComponent(code)}`).then((x) => x.json()).then((d: { valid: boolean; code?: string; name?: string }) => {
        if (!d.valid || !d.code) return;
        const v = { code: d.code, name: d.name || "A friend" };
        setRefState(v); write(REF_KEY, v); setBanner(true); write(BANNER_KEY, true);
      }).catch(() => {});
    }
  }, []);
  useEffect(() => { if (ready) write(SEL_KEY, sel); }, [ready, sel]);

  const setRef = useCallback((r: Ref) => { setRefState(r); write(REF_KEY, r); }, []);
  const toggle = useCallback((id: string) => setSel((s) => {
    const items = { ...s.items };
    if (items[id]) delete items[id]; else items[id] = 1;
    return { ...s, items };
  }), []);
  const setQty = useCallback((id: string, n: number) => setSel((s) => {
    const items = { ...s.items };
    if (n < 1) delete items[id]; else items[id] = Math.min(99, n);
    return { ...s, items };
  }), []);
  const toggleExtra = useCallback((id: string) => setSel((s) => ({ ...s, extras: { ...s.extras, [id]: !s.extras[id] } })), []);
  const setReq = useCallback((service: string, text: string) => setSel((s) => ({ ...s, reqs: { ...s.reqs, [service]: text.slice(0, 500) } })), []);
  const addCombo = useCallback((c: Combo) => setSel((s) => {
    const items = { ...s.items };
    for (const i of c.items) items[i.id] = Math.max(items[i.id] ?? 0, OPTIONS[i.id].qty ? i.qty : 1);
    return { ...s, items };
  }), []);
  const clear = useCallback(() => setSel(EMPTY), []);

  const value = useMemo(() => ({ sel, ready, ref, setRef, toggle, setQty, toggleExtra, setReq, addCombo, clear }), [sel, ready, ref, setRef, toggle, setQty, toggleExtra, setReq, addCombo, clear]);
  return (
    <C.Provider value={value}>
      {banner && ref && (
        <div className="svc-invite" role="status">
          <p>🎁 {ref.name} invited you. You get ₹500 off your first order.</p>
          <button type="button" aria-label="Close" onClick={() => { setBanner(false); write(BANNER_KEY, false); }}>×</button>
        </div>
      )}
      {children}
    </C.Provider>
  );
}

/** Wraps the selector on a studio page (and combo packs on the homepage). The sticky bottom bar shows while this area is on screen and something is selected. */
export function PricingRegion({ children }: { children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "0px 0px -35% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={box}>{children}<SelectionBar show={inView} /></div>;
}

export function SelectionBar({ show }: { show: boolean }) {
  const { sel, ref } = useSelection();
  const est = useMemo(() => estimate(sel, !!ref), [sel, ref]);
  const on = show && est.count > 0;
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    const el = bar.current;
    if (!on || !el) { root.style.setProperty("--svc-bar-h", "0px"); return; }
    const ro = new ResizeObserver(() => root.style.setProperty("--svc-bar-h", `${el.offsetHeight}px`));
    ro.observe(el);
    return () => { ro.disconnect(); root.style.setProperty("--svc-bar-h", "0px"); };
  }, [on]);
  return (
    <div ref={bar} className="svc-bar" data-on={on} aria-hidden={!on} inert={!on}>
      {/* Drawn only once a service is selected: never "Estimated ₹0 · 0 selected". */}
      {est.count > 0 && <div className="svc-bar-in" role="region" aria-label="Your selection">
        <div className="svc-bar-info">
          <p className="svc-bar-main">
            <span className="svc-bar-total">Estimated {est.totalText}</span>
            <span className="svc-bar-meta"> · {est.count} selected · Est. delivery: {est.delivery}</span>
          </p>
          {est.combo && <p className="svc-bar-save">{est.combo.name} applied: you save {inr(est.combo.save)}</p>}
          {est.videoDiscount > 0 && <p className="svc-bar-save">Video discount ({est.videoPct}% off): −{inr(est.videoDiscount)}</p>}
          {est.referralDiscount > 0 && <p className="svc-bar-save">Referral discount −{inr(est.referralDiscount)}</p>}
          {est.hint && <p className="svc-bar-hint">{est.hint}</p>}
        </div>
        <Link href="/start-project" className="svc-bar-btn">Start a Project →</Link>
      </div>}
    </div>
  );
}
