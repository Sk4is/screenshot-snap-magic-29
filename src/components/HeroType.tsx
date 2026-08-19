import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { Product } from '@/data/products';
import { clamp01, range, smoothstep } from '@/lib/stage';

export interface HeroTypeHandle {
  update: (p: number) => void;
}

/**
 * Giant flavor name that lives BEHIND the 3D can (lower stacking context than
 * the canvas) so the product always reads in front of the typography.
 */
const HeroType = forwardRef<HeroTypeHandle, { product: Product }>(function HeroType(
  { product },
  ref
) {
  const lineA = useRef<HTMLSpanElement>(null);
  const lineB = useRef<HTMLSpanElement>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    update(p: number) {
      const inA = smoothstep(range(p, 0.64, 0.76));
      const inB = smoothstep(range(p, 0.68, 0.82));
      const out = smoothstep(range(p, 0.9, 1.0));
      if (wrap.current) {
        wrap.current.style.opacity = String(clamp01(Math.max(inA, inB)) * (1 - out));
        wrap.current.style.transform = `translate3d(0, ${out * -6}vh, 0)`;
      }
      if (lineA.current) {
        lineA.current.style.transform = `translate3d(${(1 - inA) * -110}%, 0, 0)`;
      }
      if (lineB.current) {
        lineB.current.style.transform = `translate3d(${(1 - inB) * 110}%, 0, 0)`;
      }
    },
  }));

  return (
    <div
      ref={wrap}
      className="pointer-events-none fixed inset-0 z-[5] flex flex-col items-center justify-center opacity-0"
      aria-hidden
    >
      <div className="w-full overflow-hidden px-2 text-center">
        <span
          ref={lineA}
          className="editorial-title block text-[clamp(3.5rem,17vw,15rem)] text-white/95"
          style={{ textShadow: `0 0 90px ${product.gradient.glow}` }}
        >
          {product.words[0]}
        </span>
      </div>
      <div className="w-full overflow-hidden px-2 text-center">
        <span
          ref={lineB}
          className="editorial-title block text-[clamp(3.5rem,17vw,15rem)] text-white/95"
          style={{ textShadow: `0 0 90px ${product.gradient.glow}` }}
        >
          {product.words[1]}
        </span>
      </div>
    </div>
  );
});

export default HeroType;
