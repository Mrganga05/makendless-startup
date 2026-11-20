"use client";
/* Keeps the 3D scenes sharp AND smooth on every device.
   Renders at the screen's real pixel density (capped at `max`), so Retina / phone screens stay crisp.
   If the frame rate really falls, drei <PerformanceMonitor> steps the density down 0.25 at a time
   (never below a sharp floor) and back up when the device recovers. */
import { useCallback, useEffect, useRef, useState } from "react";

/** Only genuinely weak devices: 2 cores or less, 2 GB or less, or data saver on. */
export function lowPowerDevice() {
  if (typeof navigator === "undefined") return false;
  const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (n.hardwareConcurrency || 8) <= 2 || (n.deviceMemory || 8) <= 2 || !!n.connection?.saveData;
}

export function useDpr(max = 2) {
  const [dpr, setDpr] = useState(1.5);
  const top = useRef(1.5), floor = useRef(1);
  useEffect(() => {
    const native = Math.min(window.devicePixelRatio || 1, max);
    const weak = lowPowerDevice();
    top.current = native;
    floor.current = Math.min(native, weak ? 1 : 1.5);
    setDpr(weak ? Math.min(native, 1.5) : native);
  }, [max]);
  const step = (d: number) => Math.round(d * 4) / 4;
  const decline = useCallback(() => setDpr((d) => Math.max(floor.current, step(d - 0.25))), []);
  const incline = useCallback(() => setDpr((d) => Math.min(top.current, step(d + 0.25))), []);
  const fallback = useCallback(() => setDpr(floor.current), []);
  return { dpr, decline, incline, fallback };
}

/** Frame-rate bounds for <PerformanceMonitor>: only react to a real drop, not one slow frame. */
export const fpsBounds = (refresh: number): [number, number] => (refresh > 90 ? [50, 90] : [42, 58]);
