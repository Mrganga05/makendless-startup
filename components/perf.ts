"use client";
/* Keeps the 3D scenes smooth on every device: lower pixel density on weak / data-saver devices,
   and drop to 1x automatically if the frame rate falls (drei <PerformanceMonitor onDecline>). */
import { useEffect, useState } from "react";

export function lowPowerDevice() {
  if (typeof navigator === "undefined") return false;
  const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (n.hardwareConcurrency || 8) <= 4 || (n.deviceMemory || 8) <= 4 || !!n.connection?.saveData;
}

export function useDpr(compact: boolean, max: number) {
  const pick = (): number | [number, number] => (compact ? [1, Math.min(max, 1.25)] : [1, max]);
  const [dpr, setDpr] = useState<number | [number, number]>(pick);
  useEffect(() => { setDpr(lowPowerDevice() ? 1 : pick()); }, [compact, max]); // eslint-disable-line react-hooks/exhaustive-deps
  return [dpr, () => setDpr(1)] as const;
}
