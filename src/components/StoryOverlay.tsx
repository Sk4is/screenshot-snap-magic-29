import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { Product } from '@/data/products';
import { clamp01, range, smoothstep } from '@/lib/stage';

export interface StoryOverlayHandle {
  update: (p: number) => void;
}

const ING_START = 0.16;
const ING_END = 0.62;

export function ingredientStepAt(p: number) {
  if (p < ING_START || p > ING_END) return -1;
  const t = (p - ING_START) / (ING_END - ING_START);
  return Math.min(3, Math.floor(t * 4));
}

interface Props {
  product: Product;
  active: boolean;
}

/** Foreground editorial copy for the cinematic story (intro + ingredients). */
const StoryOverlay = forwardRef<StoryOverlayHandle, Props>(function StoryOverlay(
  { product, active },
  ref
) {
  const introRef = useRef<HTMLDivElement>(null);
  const introLines = useRef<(HTMLSpanElement | null)[]>([]);
  const ingRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ingLines = useRef<(HTMLDivElement | null)[]>([]);
  const counterRef = useRef<HTMLDivElement>(null);
  const counterBar = useRef<HTMLDivElement>(null);
  const counterText = useRef<HTMLSpanElement>(null);
  const dotsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const dotsWrap = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    update(p: number) {
      // Flavor intro copy
      const introIn = smoothstep(range(p, 0.02, 0.1));
      const introOut = smoothstep(range(p, 0.13, 0.2));
      const introO = introIn * (1 - introOut);
      if (introRef.current) introRef.current.style.opacity = String(introO);
      introLines.current.forEach((el, i) => {
        if (!el) return;
        const t = smoothstep(range(p, 0.02 + i * 0.015, 0.09 + i * 0.02)) * (1 - introOut);
        el.style.transform = `translate3d(0, ${(1 - t) * 110}%, 0)`;
      });

      // Ingredient chapters — masked in/out, one visible at a time
      const span = (ING_END - ING_START) / 4;
      ingRefs.current.forEach((el, i) => {
        if (!el) return;
        const s = ING_START + i * span;
        const inT = smoothstep(range(p, s, s + span * 0.32));
        const outT = smoothstep(range(p, s + span * 0.78, s + span * 1.05));
        el.style.opacity = String(clamp01(inT * (1 - outT)));
        const lines = ingLines.current.slice(i * 3, i * 3 + 3);
        lines.forEach((line, j) => {
          if (!line) return;
          const li = smoothstep(range(p, s + j * span * 0.06, s + span * 0.3 + j * span * 0.06));
          const lo = outT;
          line.style.transform = `translate3d(0, ${((1 - li) * 115 + lo * -115).toFixed(2)}%, 0)`;
        });
      });

      // Top-left chapter counter + progress bar
      const chapters = 7;
      const idx = Math.min(chapters, Math.max(1, Math.ceil(p * chapters) || 1));
      if (counterText.current) {
        counterText.current.textContent = `${String(idx).padStart(2, '0')} / 0${chapters}`;
      }
      if (counterBar.current) counterBar.current.style.width = `${clamp01(p) * 100}%`;
      if (counterRef.current) {
        counterRef.current.style.opacity = String(smoothstep(range(p, 0.01, 0.06)) * (1 - smoothstep(range(p, 0.94, 1))));
      }

      // Right-side ingredient indicator
      const step = ingredientStepAt(p);
      if (dotsWrap.current) {
        dotsWrap.current.style.opacity = String(
          smoothstep(range(p, 0.13, 0.2)) * (1 - smoothstep(range(p, 0.62, 0.7)))
        );
      }
      dotsRef.current.forEach((dot, i) => {
        if (!dot) return;
        const on = i === step;
        dot.style.color = on ? '#ffffff' : 'rgba(255,255,255,0.35)';
        dot.style.borderColor = on ? product.color : 'rgba(255,255,255,0.2)';
        dot.style.boxShadow = on ? `0 0 18px ${product.color}` : 'none';
      });
    },
  }));

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-30 ${active ? '' : 'hidden'}`}
      aria-hidden={!active}
    >
      {/* chapter counter */}
      <div ref={counterRef} className="absolute left-5 top-24 w-[min(60vw,270px)] opacity-0 sm:left-8">
        <div className="flex items-center gap-4">
          <span
            ref={counterText}
            className="font-display text-[11px] font-semibold tracking-[0.25em] text-white/70"
          >
            01 / 07
          </span>
          <div className="h-[2px] flex-1 overflow-hidden bg-white/15">
            <div ref={counterBar} className="h-full bg-white" style={{ width: '0%' }} />
          </div>
        </div>
      </div>

      {/* flavor intro */}
      <div
        ref={introRef}
        className="absolute left-6 top-1/2 max-w-[min(88vw,520px)] -translate-y-1/2 opacity-0 sm:left-14 lg:left-20"
      >
        <h2 className="editorial-title text-[clamp(2.6rem,6.5vw,5.2rem)] text-white">
          {product.words.map((w, i) => (
            <span key={w} className="mask-reveal block">
              <span
                ref={(el) => {
                  introLines.current[i] = el;
                }}
              >
                {w}
              </span>
            </span>
          ))}
        </h2>
        <div className="mask-reveal mt-6 block max-w-md">
          <span
            ref={(el) => {
              introLines.current[2] = el;
            }}
            className="block text-sm leading-relaxed text-white/75 sm:text-base"
          >
            {product.tagline}
          </span>
        </div>
        <div className="mask-reveal mt-3 block max-w-md">
          <span
            ref={(el) => {
              introLines.current[3] = el;
            }}
            className="block text-sm leading-relaxed text-white/55"
          >
            {product.description}
          </span>
        </div>
      </div>

      {/* ingredient chapters */}
      {product.ingredients.map((ing, i) => (
        <div
          key={ing.label}
          ref={(el) => {
            ingRefs.current[i] = el;
          }}
          className="absolute left-6 top-1/2 max-w-[min(88vw,460px)] -translate-y-1/2 opacity-0 sm:left-14 lg:left-20"
        >
          <div className="mask-reveal block">
            <div
              ref={(el) => {
                ingLines.current[i * 3] = el;
              }}
            >
              <span
                className="inline-flex items-center gap-2 px-3 py-1 font-display text-[10px] font-bold tracking-[0.22em] text-white"
                style={{ background: product.color }}
              >
                {ing.label}
              </span>
            </div>
          </div>
          <div className="mask-reveal mt-5 block">
            <div
              ref={(el) => {
                ingLines.current[i * 3 + 1] = el;
              }}
            >
              <h3 className="editorial-title whitespace-pre-line text-[clamp(2.2rem,5.5vw,4.2rem)] text-white">
                {ing.title}
              </h3>
            </div>
          </div>
          <div className="mask-reveal mt-5 block max-w-sm">
            <div
              ref={(el) => {
                ingLines.current[i * 3 + 2] = el;
              }}
            >
              <p className="text-sm leading-relaxed text-white/65">{ing.copy}</p>
            </div>
          </div>
        </div>
      ))}

      {/* right-side ingredient indicator */}
      <div
        ref={dotsWrap}
        className="absolute right-5 top-1/2 flex -translate-y-1/2 flex-col gap-3 opacity-0 sm:right-8"
      >
        {product.ingredients.map((ing, i) => (
          <span
            key={ing.label}
            ref={(el) => {
              dotsRef.current[i] = el;
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full border font-display text-[10px] font-semibold transition-colors duration-300"
            style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.35)' }}
          >
            {i + 1}
          </span>
        ))}
      </div>
    </div>
  );
});

export default StoryOverlay;
