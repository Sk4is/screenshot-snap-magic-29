/**
 * Single mutable source of truth shared between the DOM orchestrator and the
 * R3F scene. Written from one rAF loop, read inside useFrame — no re-renders.
 */
export interface StageState {
  /** smoothed carousel position (float index) */
  indexFloat: number;
  /** carousel target index */
  indexTarget: number;
  /** extra drag offset in index units while dragging */
  dragOffset: number;
  /** index of the selected can, -1 in carousel mode */
  selected: number;
  /** 0 = full carousel, 1 = only the selected can remains */
  selectT: number;
  /** 0..1 progress through the cinematic story */
  story: number;
  /** 0..n progress (in viewports) through the product detail sections */
  detail: number;
  /** viewport is a small screen */
  isMobile: boolean;
  reducedMotion: boolean;
}

export const stage: StageState = {
  indexFloat: 0,
  indexTarget: 0,
  dragOffset: 0,
  selected: -1,
  selectT: 0,
  story: 0,
  detail: 0,
  isMobile: false,
  reducedMotion: false,
};

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** smooth 0..1 ramp between a and b */
export function range(p: number, a: number, b: number) {
  return clamp01((p - a) / (b - a));
}

export function smoothstep(t: number) {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** frame-rate independent damping */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}
