"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const COLORS = ["#22d3ee", "#8b5cf6", "#c7a6ff"]; // CREATE / BUILD / GROW
const ANGLES = [0.34, 0, -0.34];

function Beam({ color, angle, active }: { color: string; angle: number; active: boolean }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((_, dt) => {
    if (!mat.current) return;
    const target = active ? 0.95 : 0.16;
    mat.current.opacity += (target - mat.current.opacity) * Math.min(1, dt * 6);
  });
  return (
    <group rotation={[0, 0, angle]} position={[0.55, 0, 0]}>
      <mesh position={[2.1, 0, 0]}>
        <planeGeometry args={[4.2, 0.2]} />
        <meshBasicMaterial ref={mat} color={color} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Rig({ mode }: { mode: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ pointer, clock }, dt) => {
    if (!group.current) return;
    const ty = pointer.x * 0.35 + Math.sin(clock.elapsedTime * 0.4) * 0.08;
    const tx = -pointer.y * 0.2;
    group.current.rotation.y += (ty - group.current.rotation.y) * Math.min(1, dt * 3);
    group.current.rotation.x += (tx - group.current.rotation.x) * Math.min(1, dt * 3);
  });
  return (
    <group ref={group}>
      {/* incoming white beam */}
      <mesh position={[-2.2, 0, 0]}>
        <planeGeometry args={[3.6, 0.1]} />
        <meshBasicMaterial color="#f6f8ff" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* glass prism (triangular) */}
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 6 + Math.PI / 2 * 0]}>
        <cylinderGeometry args={[1.05, 1.05, 1.5, 3]} />
        <meshPhysicalMaterial color="#cdd6ff" transparent opacity={0.34} roughness={0.04} metalness={0.1} clearcoat={1} clearcoatRoughness={0.05} side={THREE.DoubleSide} emissive="#3a2a8a" emissiveIntensity={0.35} />
      </mesh>
      <lineSegments rotation={[Math.PI / 2, 0, Math.PI / 6]}>
        <edgesGeometry args={[new THREE.CylinderGeometry(1.05, 1.05, 1.5, 3)]} />
        <lineBasicMaterial color="#eaf2ff" transparent opacity={0.85} />
      </lineSegments>
      {COLORS.map((c, i) => (
        <Beam key={c} color={c} angle={ANGLES[i]} active={i === mode} />
      ))}
    </group>
  );
}

export default function PrismScene({ mode }: { mode: number }) {
  return (
    <Canvas camera={{ position: [0, 0, 6.2], fov: 38 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} aria-hidden="true">
      <ambientLight intensity={0.8} />
      <pointLight position={[3, 3, 4]} intensity={30} color="#8b5cf6" />
      <pointLight position={[-3, -2, 3]} intensity={20} color="#22d3ee" />
      <Rig mode={mode} />
    </Canvas>
  );
}
