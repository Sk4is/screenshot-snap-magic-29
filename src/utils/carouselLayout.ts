import * as THREE from 'three';

export interface CanTransform {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scale: number;
}

/** Unique floating pose per can so no two cans hang identically in space. */
export const CAN_POSES: { rotX: number; rotY: number; rotZ: number; phase: number }[] = [
  { rotX: 0.06, rotY: 0.35, rotZ: 0.18, phase: 0.0 },
  { rotX: -0.05, rotY: -0.22, rotZ: -0.12, phase: 1.1 },
  { rotX: 0.09, rotY: 0.18, rotZ: 0.09, phase: 2.3 },
  { rotX: 0.02, rotY: -0.08, rotZ: -0.05, phase: 3.4 },
  { rotX: -0.08, rotY: 0.26, rotZ: -0.16, phase: 4.2 },
  { rotX: 0.07, rotY: -0.3, rotZ: 0.13, phase: 5.0 },
  { rotX: -0.04, rotY: 0.12, rotZ: -0.2, phase: 6.1 },
];

/**
 * Floating 3D wave: cans arc up toward the selected peak and fall away in
 * depth on both sides. Never a straight product line-up.
 */
export function computeCanTransform(rel: number, isMobile: boolean): CanTransform {
  const spacingX = isMobile ? 1.15 : 1.62;
  const abs = Math.abs(rel);
  const dist = Math.min(abs, 3.6);

  const x = rel * spacingX * (1 - dist * 0.045);
  // Wave peak at the selection, dropping away on both sides
  const y = 0.55 * Math.cos(Math.min(abs, 3.2) * 0.62) - 0.34 + Math.sin(rel * 1.3) * 0.06;
  const z = -dist * 0.95 + Math.max(0, 1 - dist) * 0.7;

  const rotY = THREE.MathUtils.clamp(-rel * 0.3, -1.0, 1.0);
  const rotZ = rel * 0.05;
  const rotX = -Math.abs(rel) * 0.015;

  const proximity = Math.max(0, 1 - dist);
  const scale = Math.max(0.34, 0.62 * (1 - dist * 0.1) + proximity * 0.42);

  return { x, y, z, rotX, rotY, rotZ, scale };
}
