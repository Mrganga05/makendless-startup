"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BrowserScreen, PhoneScreen, clamp, seg } from "./HeroScreens";

export interface HeroSceneProps { p: number; mode: number; paused: boolean; compact: boolean; active: boolean; onReady: () => void }
type Live = { p: number; mode: number; px: number; py: number };

const CAM = [[-0.9, 0.15, 6.5], [1.3, 0.25, 6.7], [0.25, 0.45, 7.2]];
const LOOK = [[-0.1, 0, 0], [0.55, 0, 0], [0.25, 0, 0]];
const PHONE = [{ x: -0.95, z: 0.75, r: 0.28 }, { x: -1.75, z: -0.6, r: 0.45 }, { x: -1.05, z: 0, r: 0.22 }];
const LAPTOP = [{ x: 1.2, z: -0.8, r: -0.36 }, { x: 1.0, z: 0.6, r: -0.2 }, { x: 1.0, z: 0, r: -0.2 }];
const RIM = [[1, 0.35], [0.4, 1], [0.7, 0.75]]; // [aqua, violet] balance per mode
const STRIP = ["#22d3ee", "#4fa8f2", "#8b5cf6", "#a57cf8", "#c7a6ff", "#22d3ee"];
const GREY = new THREE.Color("#3a3f58");
const WHITE = new THREE.Color("#c9cde0");
/* World is scaled x100 so CSS-3D screens stay locked to their 3D bodies (sub-pixel rounding is otherwise magnified ~190x). */
const S = 100;

/* Thin slab with rounded corners (phone, laptop lid, caption blocks) */
function slabGeo(w: number, h: number, d: number, r: number) {
  const b = Math.min(0.012, d / 4), W = w - 2 * b, H = h - 2 * b, x = -W / 2, y = -H / 2, s = new THREE.Shape();
  s.moveTo(x + r, y); s.lineTo(x + W - r, y); s.quadraticCurveTo(x + W, y, x + W, y + r); s.lineTo(x + W, y + H - r); s.quadraticCurveTo(x + W, y + H, x + W - r, y + H);
  s.lineTo(x + r, y + H); s.quadraticCurveTo(x, y + H, x, y + H - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 3, curveSegments: 12 });
  g.center(); return g;
}
function Slab({ w, h, d, r, ref, children, ...rest }: { w: number; h: number; d: number; r: number; ref?: React.Ref<THREE.Mesh>; children?: React.ReactNode } & Record<string, unknown>) {
  const g = useMemo(() => slabGeo(w, h, d, r), [w, h, d, r]);
  return <mesh ref={ref} geometry={g} {...rest}>{children}</mesh>;
}

/* ---------- CSS-3D screens ----------
   The phone/laptop screens are ordinary DOM rendered by React in the page tree (no extra React roots,
   unlike drei <Html>, whose synchronous root.unmount() raced React 19's renderer). Each frame we only
   write the camera + object matrices onto those elements, and only when the value changed. */
const eps = (v: number) => (Math.abs(v) < 1e-10 ? 0 : v);
function cssMatrix(m: THREE.Matrix4, mul: number[], prepend = "") {
  let out = "matrix3d(";
  for (let i = 0; i < 16; i++) out += eps(mul[i] * m.elements[i]) + (i !== 15 ? "," : ")");
  return prepend + out;
}
const CAM_MUL = [1, -1, 1, 1, 1, -1, 1, 1, 1, -1, 1, 1, 1, -1, 1, 1];
const objMul = (f: number) => [1 / f, 1 / f, 1 / f, 1, -1 / f, -1 / f, -1 / f, -1, 1 / f, 1 / f, 1 / f, 1, 1, 1, 1, 1];
const SCREEN_FACTOR = 1 / ((4 / 3) / 400); // same scale the screens were designed for
type ScreenLink = { anchor: React.RefObject<THREE.Group | null>; el: React.RefObject<HTMLDivElement | null> };
function ScreenSync({ stage, layer, links }: { stage: React.RefObject<HTMLDivElement | null>; layer: React.RefObject<HTMLDivElement | null>; links: ScreenLink[] }) {
  const { camera, size } = useThree();
  const last = useRef<Record<string, string>>({});
  const v1 = useMemo(() => new THREE.Vector3(), []), v2 = useMemo(() => new THREE.Vector3(), []);
  const set = (el: HTMLElement, key: string, prop: "transform" | "perspective" | "zIndex" | "width" | "height", val: string) => {
    if (last.current[key] === val) return;
    last.current[key] = val;
    el.style[prop] = val;
  };
  useFrame(() => {
    if (!stage.current || !layer.current) return;
    camera.updateMatrixWorld();
    const fov = camera.projectionMatrix.elements[5] * (size.height / 2);
    set(stage.current, "persp", "perspective", `${fov}px`);
    set(layer.current, "w", "width", `${size.width}px`);
    set(layer.current, "h", "height", `${size.height}px`);
    set(layer.current, "cam", "transform", `translateZ(${fov}px)${cssMatrix(camera.matrixWorldInverse, CAM_MUL)}translate(${size.width / 2}px,${size.height / 2}px)`);
    links.forEach((l, i) => {
      const a = l.anchor.current, el = l.el.current;
      if (!a || !el) return;
      a.updateWorldMatrix(true, false);
      set(el, `o${i}`, "transform", cssMatrix(a.matrixWorld, objMul(SCREEN_FACTOR), "translate(-50%,-50%)"));
      const d = v1.setFromMatrixPosition(a.matrixWorld).distanceTo(v2.setFromMatrixPosition(camera.matrixWorld));
      set(el, `z${i}`, "zIndex", `${Math.round(100000 - d)}`);
    });
  });
  return null;
}

/* Soft static contact shadow: a radial-gradient texture on a plane (replaces drei ContactShadows,
   which re-rendered the whole scene into a depth target and blurred it on every frame). */
function SoftShadow() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d")!, r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(3,4,12,.75)"); r.addColorStop(0.55, "rgba(3,4,12,.28)"); r.addColorStop(1, "rgba(3,4,12,0)");
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh position={[0.15, -1.62, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[7.5, 3.2, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
}

/* Film frame texture: sprocket holes + a tiny shot, so the strip reads as footage, not as coloured boxes. */
function filmTexture(hue: string, i: number) {
  const c = document.createElement("canvas"); c.width = 96; c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#0b0d1c"; g.fillRect(0, 0, 96, 128);
  g.fillStyle = "#e9ecf8";
  for (let y = 6; y < 128; y += 16) { g.fillRect(4, y, 8, 8); g.fillRect(84, y, 8, 8); }
  const sky = g.createLinearGradient(0, 14, 0, 114);
  sky.addColorStop(0, hue); sky.addColorStop(1, "#141832");
  g.fillStyle = sky; g.fillRect(17, 12, 62, 104);
  g.fillStyle = "rgba(255,240,210,.85)"; g.beginPath(); g.arc(34 + (i * 9) % 30, 48 + (i * 7) % 20, 9, 0, Math.PI * 2); g.fill();
  g.fillStyle = "rgba(8,10,26,.85)"; g.beginPath(); g.moveTo(17, 116); g.lineTo(38, 78 + (i % 3) * 6); g.lineTo(56, 96); g.lineTo(79, 70 + (i % 2) * 10); g.lineTo(79, 116); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
/* Timeline clip texture: waveform on a track lane. */
function clipTexture(hue: string, seed: number) {
  const c = document.createElement("canvas"); c.width = 256; c.height = 48;
  const g = c.getContext("2d")!;
  g.fillStyle = hue; g.globalAlpha = 0.9; g.fillRect(0, 0, 256, 48); g.globalAlpha = 1;
  g.fillStyle = "rgba(255,255,255,.85)";
  for (let x = 6; x < 250; x += 5) { const h = 6 + Math.abs(Math.sin(x * 0.09 + seed) * Math.cos(x * 0.031 + seed * 2)) * 30; g.fillRect(x, 24 - h / 2, 3, h); }
  g.fillStyle = "rgba(255,255,255,.95)"; g.fillRect(0, 0, 4, 48);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function Rig({ live, compact }: { live: React.RefObject<Live>; compact: boolean }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3());
  const aqua = useRef<THREE.PointLight>(null), violet = useRef<THREE.PointLight>(null), cursor = useRef<THREE.PointLight>(null);
  useFrame((_, dt) => {
    const { p, mode, px, py } = live.current!;
    const k = 1 - Math.exp(-dt * 2.6);
    const c = compact ? [0, 0.05, mode === 1 ? 4.0 : 3.75] : CAM[mode];
    const l = compact ? [0, mode === 1 ? -0.25 : 0, 0] : LOOK[mode];
    camera.position.x += ((c[0] + px * 0.3) * S - camera.position.x) * k;
    camera.position.y += ((c[1] + py * 0.18) * S - camera.position.y) * k;
    camera.position.z += (c[2] * S - camera.position.z) * k;
    look.current.x += (l[0] * S - look.current.x) * k; look.current.y += (l[1] * S - look.current.y) * k;
    camera.lookAt(look.current);
    const grade = 0.2 + 0.8 * p;
    if (aqua.current) aqua.current.intensity += (RIM[mode][0] * 2.6 * grade - aqua.current.intensity) * k;
    if (violet.current) violet.current.intensity += (RIM[mode][1] * 3 * grade - violet.current.intensity) * k;
    if (cursor.current) cursor.current.position.set(px * 3.2 * S, (py * 2 + 0.4) * S, 2.6 * S);
  });
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[200, 500, 600]} intensity={1.6} color="#f6f8ff" />
      <pointLight ref={aqua} position={[-400, 150, 150]} color="#22d3ee" intensity={0.6} decay={0} />
      <pointLight ref={violet} position={[420, 200, -100]} color="#8b5cf6" intensity={0.6} decay={0} />
      {!compact && <pointLight ref={cursor} color="#ffffff" intensity={0.55} decay={0} />}
    </>
  );
}

function Device({ live, compact, kind, children, screenAnchor, screenZ }: { live: React.RefObject<Live>; compact: boolean; kind: "phone" | "laptop"; children: React.ReactNode; screenAnchor: React.RefObject<THREE.Group | null>; screenZ: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }, dt) => {
    if (!g.current) return;
    const { mode, px, py } = live.current!;
    const k = 1 - Math.exp(-dt * 2.8), t = clock.elapsedTime;
    const s = clamp(window.scrollY / (window.innerHeight * 0.85));
    const dir = kind === "phone" ? -1 : 1;
    const T = (kind === "phone" ? PHONE : LAPTOP)[mode];
    const bob = Math.sin(t * 0.7 + (kind === "phone" ? 0 : 1.7)) * 0.045;
    const tx = compact ? dir * s * 1.2 : T.x + dir * s * 2.1;
    const ty = (kind === "phone" ? 0.05 : 0.2) + bob + (compact ? (kind === "laptop" ? 0.1 : 0) : s * 0.35);
    const tz = compact ? 0 : T.z - s * 0.6;
    const ry = compact ? Math.sin(t * 0.45) * 0.16 + dir * s * 0.7 : T.r + px * 0.2 + dir * s * 0.5;
    const rx = compact ? Math.sin(t * 0.33) * 0.04 : -py * 0.12;
    g.current.position.x += (tx - g.current.position.x) * k; g.current.position.y += (ty - g.current.position.y) * k; g.current.position.z += (tz - g.current.position.z) * k;
    g.current.rotation.y += (ry - g.current.rotation.y) * k; g.current.rotation.x += (rx - g.current.rotation.x) * k;
  });
  return <group ref={g}>{children}<group ref={screenAnchor} position={[0, 0, screenZ]} /></group>;
}

function PhoneBody({ live }: { live: React.RefObject<Live> }) {
  const a = useRef<THREE.Mesh>(null), b = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const { p, mode } = live.current!;
    const s = mode === 0 ? seg(p, 0.7, 0.86) : 0, k = 1 - Math.exp(-dt * 8);
    [a.current, b.current].forEach((m, i) => { if (m) { const v = m.scale.x + (clamp(s * 2 - i) - m.scale.x) * k; m.scale.setScalar(Math.max(0.0001, v)); } });
  });
  return (
    <>
      <Slab w={0.99} h={1.97} d={0.1} r={0.14}><meshStandardMaterial color="#9a9fb8" metalness={1} roughness={0.24} /></Slab>
      <Slab w={0.93} h={1.91} d={0.02} r={0.115} position={[0, 0, 0.044]}><meshPhysicalMaterial color="#04050b" roughness={0.06} clearcoat={1} metalness={0.3} /></Slab>
      <mesh position={[0.498, 0.42, 0]}><boxGeometry args={[0.014, 0.26, 0.04]} /><meshStandardMaterial color="#7d8299" metalness={1} roughness={0.3} /></mesh>
      {/* caption blocks that land beside the phone when captions are added */}
      <Slab ref={a} w={0.5} h={0.13} d={0.04} r={0.035} position={[0.84, -0.42, 0.1]}><meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.35} roughness={0.4} /></Slab>
      <Slab ref={b} w={0.34} h={0.13} d={0.04} r={0.035} position={[0.76, -0.6, 0.1]}><meshStandardMaterial color="#e6e9f5" roughness={0.4} /></Slab>
    </>
  );
}
function LaptopBody() {
  return (
    <>
      <Slab w={2.14} h={1.4} d={0.06} r={0.07}><meshStandardMaterial color="#b4b8ca" metalness={1} roughness={0.3} /></Slab>
      <mesh position={[0, 0, 0.031]}><planeGeometry args={[2.08, 1.34]} /><meshPhysicalMaterial color="#05060d" roughness={0.08} clearcoat={1} /></mesh>
      <group position={[0, -0.73, 0.64]} rotation={[0.06, 0, 0]}>
        <Slab w={2.14} h={1.32} d={0.07} r={0.08} rotation={[-Math.PI / 2, 0, 0]}><meshStandardMaterial color="#b4b8ca" metalness={1} roughness={0.32} /></Slab>
        <mesh position={[0, 0.037, -0.14]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.86, 0.7]} /><meshStandardMaterial color="#1a1c2c" roughness={0.7} /></mesh>
        <mesh position={[0, 0.037, 0.43]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.6, 0.28]} /><meshStandardMaterial color="#a2a6ba" metalness={0.8} roughness={0.25} /></mesh>
      </group>
    </>
  );
}

/* Supporting details that belong to the work: film frames, timeline clips, wireframe grid */
function Details({ live }: { live: React.RefObject<Live> }) {
  const frames = useRef<(THREE.Mesh | null)[]>([]), clips = useRef<(THREE.Mesh | null)[]>([]);
  const grid = useRef<THREE.LineBasicMaterial>(null);
  const gridGeo = useMemo(() => {
    const pts: number[] = [];
    for (let x = -6; x <= 6; x += 0.75) pts.push(x, -3.4, 0, x, 3.4, 0);
    for (let y = -3.4; y <= 3.4; y += 0.75) pts.push(-6, y, 0, 6, y, 0);
    return new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  }, []);
  const widths = [0.95, 0.5, 0.75, 0.42];
  const filmTex = useMemo(() => STRIP.map((c, i) => filmTexture(c, i)), []);
  const clipTex = useMemo(() => widths.map((_, i) => clipTexture(STRIP[(i * 2) % 6], i * 1.7)), []); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame((_, dt) => {
    const { p } = live.current!;
    const k = 1 - Math.exp(-dt * 6);
    if (grid.current) grid.current.opacity += ((1 - p) * 0.42 + 0.05 - grid.current.opacity) * k;
    frames.current.forEach((m, i) => {
      if (!m) return;
      const land = seg(p, 0.08 + i * 0.07, 0.2 + i * 0.07); // cuts land one by one
      const ty = 1.78 + i * 0.03 + (1 - land) * (i % 2 ? 0.38 : -0.3), rz = 0.1 + (1 - land) * (i - 2.5) * 0.16;
      m.position.y += (ty - m.position.y) * k; m.rotation.z += (rz - m.rotation.z) * k;
      (m.material as THREE.MeshStandardMaterial).color.lerpColors(GREY, WHITE, seg(p, 0.4, 0.8));
    });
    let x = -0.9;
    clips.current.forEach((m, i) => {
      const gap = seg(p, 0.1, 0.3) * 0.07;
      if (m) { m.position.x += (x + widths[i] / 2 - m.position.x) * k; (m.material as THREE.MeshStandardMaterial).color.lerpColors(GREY, WHITE, seg(p, 0.4, 0.8)); }
      x += widths[i] + gap;
    });
  });
  return (
    <>
      <lineSegments geometry={gridGeo} position={[0, 0, -2.4]}><lineBasicMaterial ref={grid} color="#8a90b0" transparent opacity={0.45} /></lineSegments>
      {STRIP.map((_, i) => (
        <mesh key={i} ref={(m) => { frames.current[i] = m; }} position={[-0.5 + i * 0.44, 1.78, -1.5]}>
          <planeGeometry args={[0.36, 0.48]} /><meshStandardMaterial map={filmTex[i]} color="#3a3f58" roughness={0.6} />
        </mesh>
      ))}
      {widths.map((w, i) => (
        <mesh key={i} ref={(m) => { clips.current[i] = m; }} position={[0, -1.52, -1]} rotation={[-0.5, 0, 0]}>
          <planeGeometry args={[w, 0.2]} /><meshStandardMaterial map={clipTex[i]} color="#3a3f58" roughness={0.6} />
        </mesh>
      ))}
    </>
  );
}

export default function Hero3D({ p, mode, paused, compact, active, onReady }: HeroSceneProps) {
  const live = useRef<Live>({ p, mode, px: 0, py: 0 });
  live.current.p = p; live.current.mode = mode;
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null), layer = useRef<HTMLDivElement>(null);
  const phoneEl = useRef<HTMLDivElement>(null), laptopEl = useRef<HTMLDivElement>(null);
  const phoneAnchor = useRef<THREE.Group>(null), laptopAnchor = useRef<THREE.Group>(null);
  const links = useMemo<ScreenLink[]>(() => [{ anchor: phoneAnchor, el: phoneEl }, { anchor: laptopAnchor, el: laptopEl }], []);
  useEffect(() => {
    if (compact) return;
    let raf = 0, x = 0, y = 0;
    const apply = () => { raf = 0; wrap.current?.style.setProperty("--gx", `${x * 100}%`); wrap.current?.style.setProperty("--gy", `${y * 100}%`); };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      x = e.clientX / window.innerWidth; y = e.clientY / window.innerHeight;
      live.current.px = x * 2 - 1; live.current.py = -(y * 2 - 1);
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, [compact]);
  const ad = mode === 2;
  const showPhone = !compact || mode !== 1, showLaptop = !compact || mode === 1;
  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas camera={{ position: compact ? [0, 5, 375] : [-90, 15, 650], fov: 35, near: 10, far: 4000 }} dpr={compact ? [1, 1.25] : [1, 1.5]} frameloop={active ? "always" : "never"} gl={{ antialias: !compact, alpha: true, powerPreference: "high-performance" }} onCreated={onReady}>
        <Rig live={live} compact={compact} />
        <Environment resolution={compact ? 32 : 64} frames={1}>
          <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 5, 4]} scale={[9, 3, 1]} />
          <Lightformer form="rect" intensity={3} color="#8b5cf6" position={[6, 1, 0]} rotation-y={-Math.PI / 2} scale={[5, 2, 1]} />
          <Lightformer form="rect" intensity={3} color="#22d3ee" position={[-6, 0, 1]} rotation-y={Math.PI / 2} scale={[5, 2, 1]} />
          <Lightformer form="rect" intensity={0.6} color="#202342" position={[0, -4, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
        </Environment>
        <ScreenSync stage={stage} layer={layer} links={links} />
        <group scale={S}>
          {!compact && <Details live={live} />}
          {showPhone && (
            <Device live={live} compact={compact} kind="phone" screenAnchor={phoneAnchor} screenZ={0.06}>
              <PhoneBody live={live} />
            </Device>
          )}
          {showLaptop && (
            <Device live={live} compact={compact} kind="laptop" screenAnchor={laptopAnchor} screenZ={0.034}>
              <LaptopBody />
            </Device>
          )}
          {!compact && <SoftShadow />}
        </group>
      </Canvas>
      {/* DOM screens, positioned by <ScreenSync>. Decorative demo: hidden from assistive tech and the Tab order. */}
      <div ref={stage} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div ref={layer} className="absolute left-0 top-0" style={{ transformStyle: "preserve-3d" }}>
          {showPhone && (
            <div ref={phoneEl} className="pointer-events-auto absolute" style={{ width: 260, height: 540 }}>
              <PhoneScreen p={p} paused={paused} ad={ad} back={!compact && mode === 1} />
            </div>
          )}
          {showLaptop && (
            <div ref={laptopEl} className="pointer-events-auto absolute" style={{ width: 612, height: 392 }}>
              <BrowserScreen p={p} resize={mode === 1 && p > 0.95} ad={ad} back={!compact && mode === 0} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
