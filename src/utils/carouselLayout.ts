import * as THREE from 'three';

export interface CanTransform {
  x: number;
  y: number;
  z: number;
  rotY: number;
  scale: number;
}

export function computeCanTransform(relOffset: number, isMobile: boolean): CanTransform {
  const spacingX = isMobile ? 1.25 : 1.85;
  const absRel = Math.abs(relOffset);
  const dist = Math.min(absRel, 3.5);

  // Wave layout: sine-based vertical movement + exponential depth
  const waveFreq = 0.65;
  const waveAmp = 0.28;

  const x = relOffset * spacingX;
  const y = Math.cos(relOffset * waveFreq) * waveAmp - dist * 0.06;
  const z = -dist * 0.72 + Math.max(0, 1 - dist) * 0.45;

  // Rotate toward center
  const rotY = THREE.MathUtils.clamp(-relOffset * 0.42, -1.3, 1.3);

  // Scale: center can is larger, distant cans shrink
  const proximity = Math.max(0, 1 - dist);
  const scale = 0.72 * (1 - dist * 0.11) + proximity * 0.32;

  return { x, y, z, rotY, scale: Math.max(0.3, scale) };
}
