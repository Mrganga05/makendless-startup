"use client";
/* One studio gateway: the whole panel is a single link and is itself a living preview of the division. */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { StudioId } from "../../data/site";
import { Arrow, DemoCaption } from "../ui";
import { BuildWorld, CreateWorld, GrowWorld } from "./Worlds";

type Props = { id: StudioId; verb: string; name: string; href: string; beta: boolean; index: number; services: { name: string; from?: string }[]; after?: React.ReactNode };

export default function Gateway({ id, verb, name, href, beta, index, services, after }: Props) {
  const ref = useRef<HTMLLIElement>(null);
  const [live, setLive] = useState(false); // on screen right now -> animations run
  const [seen, setSeen] = useState(false); // has been on screen -> wipe reveal done

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      setLive(e.isIntersecting);
      if (e.isIntersecting) setSeen(true);
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Hover / focus intensifies the world: the preview plays faster (smoothly, without restarting). */
  const setRate = useCallback((rate: number) => {
    const stage = ref.current?.querySelector(".stu-stage");
    if (!stage || typeof stage.getAnimations !== "function") return;
    for (const a of stage.getAnimations({ subtree: true })) a.updatePlaybackRate(rate);
  }, []);

  const world = id === "create" ? <CreateWorld /> : id === "build" ? <BuildWorld /> : <GrowWorld />;
  const cta = beta ? `Preview the ${verb} studio` : `Enter the ${verb} studio`;

  return (
    <li ref={ref} className="stu-item" data-in={seen} data-live={live} style={{ ["--i" as string]: index }}>
      <Link
        href={href}
        className={`stu-gate stu-${id}`}
        onPointerEnter={(e) => { if (e.pointerType === "mouse") setRate(1.7); }}
        onPointerLeave={() => setRate(1)}
        onFocus={() => setRate(1.7)}
        onBlur={() => setRate(1)}
      >
        <div className="stu-panel">
          <div className="stu-stage" aria-hidden="true">{world}</div>
          <div className="stu-body">
            <h3 className="stu-h">
              <span className="stu-verbrow">
                <span className="stu-verb">{verb}</span>
                {beta && <span className="stu-beta">Beta</span>}
              </span>{" "}
              <span className="stu-name">{name}</span>
            </h3>
            <span className="stu-cap"><DemoCaption kind={beta ? "illustrative" : "concept"} tone={id === "grow" ? "light" : "dark"} /></span>
            <ul className="stu-svc">
              {services.map((t) => <li key={t.name}>{t.name}{t.from && <span className="stu-from">· from {t.from}</span>}</li>)}
            </ul>
            <span className="stu-cta">
              <span className="stu-cta-label">{cta}</span>
              <span className="stu-cta-arrow"><Arrow /></span>
            </span>
          </div>
        </div>
      </Link>
      {after}
    </li>
  );
}
