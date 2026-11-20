"use client";
/* The closing shot: a film strip of the studio's work (reel frames from the left, website frames from the right)
   runs into one glowing final frame - the brand end card - while the phone and the laptop from the hero stand by,
   showing the finished reel and the finished site. The camera dollies in as the section scrolls into view. */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { useDpr } from "../perf";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { color } from "../../data/tokens";
import { drawCell, drawEndCard, drawGlow, drawReel, drawSite } from "./frames";

export interface CtaSceneProps { compact: boolean; active: boolean; onReady: () => void }
type Live = { p: number; px: number; py: number; v: number };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const FLOOR = -1;
const CLIPS = [color.create, "#4fa8f2", color.build, "#a57cf8", color.grow];

/* Thin slab with rounded corners (same construction as the hero devices) */
function slabGeo(w: number, h: number, d: number, r: number) {
  const b = Math.min(0.012, d / 4), W = w - 2 * b, H = h - 2 * b, x = -W / 2, y = -H / 2, s = new THREE.Shape();
  s.moveTo(x + r, y); s.lineTo(x + W - r, y); s.quadraticCurveTo(x + W, y, x + W, y + r); s.lineTo(x + W, y + H - r); s.quadraticCurveTo(x + W, y + H, x + W - r, y + H);
  s.lineTo(x + r, y + H); s.quadraticCurveTo(x, y + H, x, y + H - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 3, curveSegments: 12 });
  g.center(); return g;
}
function Slab({ w, h, d, r, children, ...rest }: { w: number; h: number; d: number; r: number; children?: React.ReactNode } & Record<string, unknown>) {
  const g = useMemo(() => slabGeo(w, h, d, r), [w, h, d, r]);
  return <mesh geometry={g} {...rest}>{children}</mesh>;
}

function useTextures() {
  const [fontTick, setFontTick] = useState(0);
  useEffect(() => {
    // redraw once the brand typeface is certainly available to canvas text
    let alive = true;
    const fam = getComputedStyle(document.body).fontFamily;
    document.fonts.load(`800 40px ${fam}`, "MAKENDLESS").then(() => { if (alive) setFontTick(1); }).catch(() => {});
    return () => { alive = false; };
  }, []);
  const tex = useMemo(() => {
    const t = (c: HTMLCanvasElement) => { const x = new THREE.CanvasTexture(c); x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = 8; return x; };
    return {
      video: [0, 1, 2].map((v) => t(drawCell("video", v))),
      web: [0, 1, 2].map((v) => t(drawCell("web", v))),
      reel: t(drawReel()), site: t(drawSite()), end: t(drawEndCard()), glow: t(drawGlow()),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontTick]);
  useEffect(() => () => { [...tex.video, ...tex.web, tex.reel, tex.site, tex.end, tex.glow].forEach((x) => x.dispose()); }, [tex]);
  return tex;
}

function Rig({ live, compact }: { live: React.RefObject<Live>; compact: boolean }) {
  const { camera, size, gl } = useThree();
  const last = useRef(0), copyEl = useRef<HTMLElement | null>(null);
  useFrame((_, dt) => {
    const L = live.current!;
    // scroll progress: 0 when the stage enters the viewport, 1 when it is fully in view
    const r = gl.domElement.getBoundingClientRect();
    const target = clamp((window.innerHeight - r.top) / (r.height * 1.05));
    const k = 1 - Math.exp(-dt * 3.2);
    L.p += (target - L.p) * k;
    L.v += (Math.abs(target - last.current) / Math.max(dt, 0.001) - L.v) * k; last.current = target;
    const e = smooth(0, 1, L.p);
    const cam = camera as THREE.PerspectiveCamera;
    const tan = Math.tan((cam.fov * Math.PI) / 360), aspect = size.width / size.height;
    // frame the shot inside the free zone under the copy (the strips are allowed to rise behind the text)
    const copy = copyEl.current ?? (copyEl.current = gl.domElement.closest("section")?.querySelector<HTMLElement>(".cta-copy") ?? null);
    const top = copy ? clamp((copy.getBoundingClientRect().bottom - r.top) / r.height, 0, 0.8) : 0.5;
    const zone = 1 - top, centre = top + zone * (compact ? 0.5 : 0.44);
    const fit = Math.max((compact ? 2.2 : 5.5) / (tan * aspect), (compact ? 1.7 : 1.5) / (tan * zone));
    const dist = fit * (1.42 - 0.42 * e);
    const lift = (centre - 0.5) * 2 * dist * tan;
    const mid = compact ? 0.3 : 0;
    cam.position.set(L.px * 0.5, mid + lift + 0.3 + (1 - e) * 1.5 + L.py * 0.2, dist);
    cam.lookAt(0, mid + lift - 0.08, 0);
  });
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[2, 5, 6]} intensity={1.3} color={color.light} />
      {!compact && <pointLight position={[-4.5, 1.2, 1.5]} color={color.create} intensity={2.4} decay={0} />}
      {!compact && <pointLight position={[4.5, 1.6, 0.5]} color={color.build} intensity={2.8} decay={0} />}
    </>
  );
}

/* Film strip: cells travel along a receding arc and disappear behind the final frame */
function Strip({ live, side, maps, count, y0 }: { live: React.RefObject<Live>; side: 1 | -1; maps: THREE.Texture[]; count: number; y0: number }) {
  const cells = useRef<(THREE.Mesh | null)[]>([]);
  const travel = useRef(0);
  const SP = 1.03, R = 7, LEN = count * SP;
  useFrame((_, dt) => {
    const L = live.current!;
    travel.current += Math.min(dt, 0.05) * (0.2 + Math.min(L.v, 2) * 1.6);
    cells.current.forEach((m, i) => {
      if (!m) return;
      const d = (((i * SP - travel.current) % LEN) + LEN) % LEN, u = 0.45 + d, a = u / R;
      m.position.set(side * R * Math.sin(a), y0 + 0.02 + (1 - Math.cos(a)) * 1.7, -0.25 - R * (1 - Math.cos(a)));
      m.rotation.set(0, side * a, side * -0.05 * a);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = smooth(LEN, LEN - 3, d);
      mat.color.setScalar(1 - 0.72 * (d / LEN));
    });
  });
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} ref={(m) => { cells.current[i] = m; }}>
          <planeGeometry args={[1, 0.75]} />
          <meshBasicMaterial map={maps[i % maps.length]} transparent side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

function FinalFrame({ live, end, glow, compact, y0 }: { live: React.RefObject<Live>; end: THREE.Texture; glow: THREE.Texture; compact: boolean; y0: number }) {
  const g = useRef<THREE.Group>(null), halo = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    const L = live.current!, t = clock.elapsedTime;
    if (g.current) { g.current.position.y = y0 + Math.sin(t * 0.6) * 0.03; g.current.rotation.y = L.px * 0.1; g.current.rotation.x = -L.py * 0.05; }
    if (halo.current) halo.current.opacity = 0.35 + 0.5 * smooth(0.3, 1, L.p) + Math.sin(t * 0.9) * 0.05;
  });
  return (
    <group ref={g} position={[0, y0, 0.3]} scale={compact ? 0.86 : 1}>
      <mesh position={[0, 0, -0.5]}>
        <planeGeometry args={[9.6, 6]} />
        <meshBasicMaterial ref={halo} map={glow} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <Slab w={2.78} h={1.64} d={0.09} r={0.08}><meshStandardMaterial color="#c9cde0" metalness={1} roughness={0.22} /></Slab>
      <mesh position={[0, 0, 0.047]}><planeGeometry args={[2.66, 1.52]} /><meshBasicMaterial color="#03040a" toneMapped={false} /></mesh>
      <mesh position={[0, 0, 0.049]}><planeGeometry args={[2.6, 1.4625]} /><meshBasicMaterial map={end} toneMapped={false} /></mesh>
    </group>
  );
}

function Phone({ reel, compact }: { reel: THREE.Texture; compact: boolean }) {
  const g = useRef<THREE.Group>(null);
  const s = compact ? 0.74 : 0.92;
  useFrame(({ clock }) => { if (g.current) g.current.rotation.y = (compact ? 0.42 : 0.5) + Math.sin(clock.elapsedTime * 0.45) * 0.05; });
  return (
    <group ref={g} position={[compact ? -1.5 : -3.25, FLOOR + (1.97 * s) / 2 + 0.01, compact ? 0.9 : 1]} scale={s}>
      <Slab w={0.99} h={1.97} d={0.1} r={0.14}><meshStandardMaterial color="#9a9fb8" metalness={1} roughness={0.24} /></Slab>
      <Slab w={0.93} h={1.91} d={0.02} r={0.115} position={[0, 0, 0.044]}><meshBasicMaterial color="#04050b" toneMapped={false} /></Slab>
      <mesh position={[0, 0, 0.056]}><planeGeometry args={[0.87, 1.807]} /><meshBasicMaterial map={reel} toneMapped={false} /></mesh>
      <mesh position={[0.498, 0.42, 0]}><boxGeometry args={[0.014, 0.26, 0.04]} /><meshStandardMaterial color="#7d8299" metalness={1} roughness={0.3} /></mesh>
    </group>
  );
}

function Laptop({ site, compact }: { site: THREE.Texture; compact: boolean }) {
  const g = useRef<THREE.Group>(null);
  const s = compact ? 0.6 : 0.86;
  useFrame(({ clock }) => { if (g.current) g.current.rotation.y = (compact ? -0.4 : -0.46) + Math.sin(clock.elapsedTime * 0.4 + 1.7) * 0.04; });
  return (
    <group ref={g} position={[compact ? 1.42 : 3.3, FLOOR + 0.77 * s, compact ? 0.7 : 0.7]} scale={s}>
      <group rotation={[-0.14, 0, 0]}>
        <Slab w={2.14} h={1.4} d={0.06} r={0.07}><meshStandardMaterial color="#b4b8ca" metalness={1} roughness={0.3} /></Slab>
        <mesh position={[0, 0, 0.031]}><planeGeometry args={[2.08, 1.34]} /><meshBasicMaterial color="#05060d" toneMapped={false} /></mesh>
        <mesh position={[0, 0, 0.033]}><planeGeometry args={[2.0, 1.281]} /><meshBasicMaterial map={site} toneMapped={false} /></mesh>
      </group>
      <group position={[0, -0.73, 0.6]}>
        <Slab w={2.14} h={1.32} d={0.07} r={0.08} rotation={[-Math.PI / 2, 0, 0]}><meshStandardMaterial color="#b4b8ca" metalness={1} roughness={0.32} /></Slab>
        <mesh position={[0, 0.037, -0.14]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.86, 0.7]} /><meshStandardMaterial color="#1a1c2c" roughness={0.7} /></mesh>
        <mesh position={[0, 0.037, 0.43]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.6, 0.28]} /><meshStandardMaterial color="#a2a6ba" metalness={0.8} roughness={0.25} /></mesh>
      </group>
    </group>
  );
}

/* The edit's timeline laid on the floor: three tracks of clips and a playhead parked at the last frame */
function Timeline() {
  const clips = useMemo(() => {
    const out: { x: number; z: number; w: number; c: string }[] = [];
    const rows = [[1.5, 0.8, 1.1, 0.6, 1.3, 0.9, 0.7, 1.2], [0.9, 1.4, 0.7, 1.2, 0.8, 1.5, 0.6], [1.2, 0.6, 1.0, 1.5, 0.7, 1.1, 0.9]];
    rows.forEach((row, r) => { let x = -4.6 + r * 0.25; row.forEach((w, i) => { out.push({ x: x + w / 2, z: 1.75 + r * 0.34, w: w - 0.06, c: CLIPS[(i + r * 2) % CLIPS.length] }); x += w; }); });
    return out;
  }, []);
  return (
    <group position={[0, FLOOR, 0]}>
      {clips.map((c, i) => (
        <mesh key={i} position={[c.x, 0.02, c.z]}>
          <boxGeometry args={[c.w, 0.035, 0.26]} />
          <meshStandardMaterial color={c.c} emissive={c.c} emissiveIntensity={0.28} roughness={0.5} metalness={0.1} />
        </mesh>
      ))}
      <mesh position={[0, 0.05, 2.08]}><boxGeometry args={[0.03, 0.09, 1.2]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
    </group>
  );
}

export default function CtaScene({ compact, active, onReady }: CtaSceneProps) {
  const live = useRef<Live>({ p: 0, px: 0, py: 0, v: 0 });
  const tex = useTextures();
  const y0 = compact ? 0.82 : 0.2; // height of the final frame: raised on phones so the devices stand in front of it
  useEffect(() => {
    if (compact) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      live.current.px = (e.clientX / window.innerWidth) * 2 - 1; live.current.py = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [compact]);
  const [dpr, lowerDpr] = useDpr(compact, 1.75);
  return (
    <Canvas camera={{ position: [0, 1.6, 9], fov: 30, near: 0.1, far: 60 }} dpr={dpr} frameloop={active ? "always" : "never"} gl={{ antialias: !compact, alpha: true, powerPreference: "high-performance" }} onCreated={onReady}>
      <PerformanceMonitor onDecline={lowerDpr} onFallback={lowerDpr} />
      <Rig live={live} compact={compact} />
      <Environment resolution={compact ? 64 : 128} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 5, 4]} scale={[9, 3, 1]} />
        <Lightformer form="rect" intensity={3} color={color.build} position={[6, 1, 0]} rotation-y={-Math.PI / 2} scale={[5, 2, 1]} />
        <Lightformer form="rect" intensity={3} color={color.create} position={[-6, 0, 1]} rotation-y={Math.PI / 2} scale={[5, 2, 1]} />
        <Lightformer form="rect" intensity={0.6} color={color.surface} position={[0, -4, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
      </Environment>
      <Strip live={live} side={-1} maps={tex.video} count={compact ? 6 : 9} y0={y0} />
      <Strip live={live} side={1} maps={tex.web} count={compact ? 6 : 9} y0={y0} />
      <FinalFrame live={live} end={tex.end} glow={tex.glow} compact={compact} y0={y0} />
      <Phone reel={tex.reel} compact={compact} />
      <Laptop site={tex.site} compact={compact} />
      {!compact && <Timeline />}
      {!compact && <ContactShadows position={[0, FLOOR, 0]} opacity={0.6} scale={12} blur={2.4} far={3} resolution={256} color="#03040a" />}
    </Canvas>
  );
}
