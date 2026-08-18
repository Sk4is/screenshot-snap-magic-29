import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import gsap from 'gsap';
import type { Product } from '@/data/products';

export interface StoryOverlayHandle {
  updateProgress: (progress: number) => void;
  reset: () => void;
}

interface StoryOverlayProps {
  product: Product;
  visible: boolean;
  isMobile: boolean;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function range(p: number, start: number, end: number) {
  return clamp((p - start) / (end - start), 0, 1);
}

const StoryOverlay = forwardRef<StoryOverlayHandle, StoryOverlayProps>(function StoryOverlay(
  { product, visible, isMobile },
  ref
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const ch1Ref = useRef<HTMLDivElement>(null);
  const ch2Ref = useRef<HTMLDivElement>(null);
  const ch3Ref = useRef<HTMLDivElement>(null);
  const ch4Ref = useRef<HTMLDivElement>(null);
  const ch5Ref = useRef<HTMLDivElement>(null);

  const ch1LinesRef = useRef<HTMLSpanElement[]>([]);
  const ch1SubRef = useRef<HTMLParagraphElement>(null);
  const ch1DescRef = useRef<HTMLParagraphElement>(null);
  const ch1CtaRef = useRef<HTMLDivElement>(null);
  const ch2WordsRef = useRef<HTMLSpanElement[]>([]);
  const ch3WordsRef = useRef<HTMLSpanElement[]>([]);
  const ch4LabelsRef = useRef<HTMLDivElement[]>([]);
  const ch4LinesRef = useRef<SVGLineElement[]>([]);
  const ch5WordsRef = useRef<HTMLSpanElement[]>([]);

  useImperativeHandle(ref, () => ({
    updateProgress(p: number) {
      updateCh1(p);
      updateCh2(p);
      updateCh3(p);
      updateCh4(p);
      updateCh5(p);
    },
    reset() {
      const allSpans = [
        ...ch1LinesRef.current,
        ...ch2WordsRef.current,
        ...ch3WordsRef.current,
        ...ch5WordsRef.current,
      ];
      gsap.set(allSpans, { yPercent: 115, xPercent: 0, opacity: 1, y: 0, x: 0 });
      gsap.set([ch1SubRef.current, ch1DescRef.current, ch1CtaRef.current].filter(Boolean), {
        opacity: 0,
        y: 14,
      });
      gsap.set(ch4LabelsRef.current, { opacity: 0 });
      gsap.set(ch4LinesRef.current, { opacity: 0, strokeDashoffset: 200 });
    },
  }));

  function updateCh1(p: number) {
    // Chapter 1: 0 - 0.2
    const local = range(p, 0, 0.2);
    const lines = ch1LinesRef.current;
    lines.forEach((el, i) => {
      if (!el) return;
      const enterT = range(local, 0, 0.4);
      const exitT = range(local, 0.55, 1);
      const yIn = 115 - enterT * 115;
      const yOut = -exitT * 115;
      gsap.set(el, { yPercent: yIn + yOut });
    });
    const sub = ch1SubRef.current;
    const desc = ch1DescRef.current;
    const cta = ch1CtaRef.current;
    const fadeT = range(local, 0.2, 0.5);
    const exitT = range(local, 0.4, 0.85);
    if (sub) gsap.set(sub, { opacity: fadeT * (1 - exitT), y: 14 - fadeT * 14 - exitT * 20 });
    if (desc) gsap.set(desc, { opacity: fadeT * (1 - exitT), y: 14 - fadeT * 14 - exitT * 20 });
    if (cta) gsap.set(cta, { opacity: fadeT * (1 - exitT), y: 14 - fadeT * 14 - exitT * 20 });
  }

  function updateCh2(p: number) {
    // Chapter 2: 0.2 - 0.4
    const local = range(p, 0.2, 0.4);
    const words = ch2WordsRef.current;
    words.forEach((el, i) => {
      if (!el) return;
      const enterT = range(local, 0.05 + i * 0.08, 0.4 + i * 0.08);
      const exitT = range(local, 0.6 + i * 0.05, 0.95);
      const yIn = 115 - enterT * 115;
      const yOut = -exitT * 115;
      gsap.set(el, { yPercent: yIn + yOut });
    });
  }

  function updateCh3(p: number) {
    // Chapter 3: 0.4 - 0.6
    const local = range(p, 0.4, 0.6);
    const words = ch3WordsRef.current;
    words.forEach((el, i) => {
      if (!el) return;
      const dir = i % 2 === 0 ? -1 : 1;
      const enterT = range(local, 0.05 + i * 0.1, 0.45 + i * 0.1);
      const exitT = range(local, 0.55 + i * 0.08, 0.95);
      const xIn = dir * 120 - enterT * dir * 120;
      const xOut = exitT * dir * 120;
      gsap.set(el, { xPercent: xIn + xOut });
    });
  }

  function updateCh4(p: number) {
    // Chapter 4: 0.6 - 0.8
    const local = range(p, 0.6, 0.8);
    const labels = ch4LabelsRef.current;
    const lines = ch4LinesRef.current;
    labels.forEach((el, i) => {
      if (!el) return;
      const enterT = range(local, 0.05 + i * 0.08, 0.35 + i * 0.08);
      const exitT = range(local, 0.65, 0.95);
      gsap.set(el, { opacity: enterT * (1 - exitT) });
    });
    lines.forEach((el, i) => {
      if (!el) return;
      const enterT = range(local, 0.05 + i * 0.08, 0.4 + i * 0.08);
      const exitT = range(local, 0.65, 0.95);
      gsap.set(el, {
        opacity: enterT * (1 - exitT),
        strokeDashoffset: 200 - enterT * 200,
      });
    });
  }

  function updateCh5(p: number) {
    // Chapter 5: 0.8 - 1.0
    const local = range(p, 0.8, 1.0);
    const words = ch5WordsRef.current;
    words.forEach((el, i) => {
      if (!el) return;
      const enterT = range(local, 0.05 + i * 0.1, 0.4 + i * 0.1);
      const exitT = range(local, 0.55 + i * 0.08, 0.95);
      const yIn = 115 - enterT * 115;
      const yOut = -exitT * 115;
      const yScatter = exitT * (i % 2 === 0 ? -40 : 40);
      gsap.set(el, { yPercent: yIn + yOut, y: yScatter, opacity: enterT * (1 - exitT) });
    });
  }

  // Reset on product change
  useEffect(() => {
    const allSpans = [
      ...ch1LinesRef.current,
      ...ch2WordsRef.current,
      ...ch3WordsRef.current,
      ...ch5WordsRef.current,
    ];
    gsap.set(allSpans, { yPercent: 115, xPercent: 0, opacity: 1, y: 0, x: 0 });
    gsap.set([ch1SubRef.current, ch1DescRef.current, ch1CtaRef.current].filter(Boolean), {
      opacity: 0,
      y: 14,
    });
    gsap.set(ch4LabelsRef.current, { opacity: 0 });
    gsap.set(ch4LinesRef.current, { opacity: 0, strokeDashoffset: 200 });
  }, [product]);

  const s = product.story;

  return (
    <div
      ref={rootRef}
      className={`pointer-events-none fixed inset-0 z-20 transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ color: 'white' }}
    >
      {/* Chapter 1 - Hero */}
      <section
        ref={ch1Ref}
        data-ch1
        className="absolute left-0 top-0 flex h-screen w-full items-center"
      >
        <div className="w-full px-6 sm:px-12 lg:px-20">
          <div className="max-w-xl">
            <div
              className="editorial-title"
              style={{ fontSize: 'clamp(3rem, 9vw, 8rem)', color: 'white' }}
            >
              {s.heroTitle.map((line, i) => (
                <div key={i} className="mask-reveal block">
                  <span
                    ref={(el) => {
                      if (el) ch1LinesRef.current[i] = el;
                    }}
                    className="block"
                  >
                    {line}
                  </span>
                </div>
              ))}
            </div>
            <p
              ref={ch1SubRef}
              className="mt-6 font-display text-sm font-semibold tracking-[0.1em] text-white/80 sm:text-lg"
            >
              {s.heroSubtitle}
            </p>
            <p
              ref={ch1DescRef}
              className="mt-3 max-w-sm font-display text-xs font-medium leading-relaxed text-white/60 sm:text-base"
            >
              {s.heroDescription}
            </p>
            <div
              ref={ch1CtaRef}
              className="pointer-events-auto mt-8 inline-flex cursor-pointer items-center gap-3 font-display text-xs font-bold tracking-[0.2em] text-white sm:text-sm"
            >
              <span className="cta-link">
                <span className="cta-text">{s.heroCta}</span>
                <span className="cta-arrow">→</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 2 - REAL FRUIT ENERGY */}
      <section
        ref={ch2Ref}
        data-ch2
        className="absolute left-0 flex w-full items-center justify-end"
        style={{ top: '100vh', height: '100vh' }}
      >
        <div className="w-full px-6 sm:px-12 lg:px-20">
          <div className="flex flex-col items-end text-right">
            {s.chapterTwoWords.map((word, i) => (
              <div key={i} className="mask-reveal block">
                <span
                  ref={(el) => {
                    if (el) ch2WordsRef.current[i] = el;
                  }}
                  className="editorial-title block text-white"
                  style={{
                    fontSize: isMobile
                      ? 'clamp(3rem, 14vw, 6rem)'
                      : 'clamp(5rem, 16vw, 12rem)',
                  }}
                >
                  {word}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapter 3 - ZERO BORING FLAVOR giant */}
      <section
        ref={ch3Ref}
        data-ch3
        className="absolute left-0 flex w-full items-center justify-center overflow-hidden"
        style={{ top: '200vh', height: '100vh' }}
      >
        <div className="flex flex-col items-center">
          {s.chapterThreeWords.map((word, i) => (
            <div key={i} className="mask-reveal block" style={{ overflow: 'visible' }}>
              <span
                ref={(el) => {
                  if (el) ch3WordsRef.current[i] = el;
                }}
                className="editorial-title block text-white/90"
                style={{
                  fontSize: 'clamp(5rem, 18vw, 20rem)',
                  lineHeight: 0.78,
                  letterSpacing: '-0.06em',
                }}
              >
                {word}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Chapter 4 - Ingredients diagram */}
      <section
        ref={ch4Ref}
        data-ch4
        className="absolute left-0 flex w-full items-center justify-center"
        style={{ top: '300vh', height: '100vh' }}
      >
        <div className="relative h-full w-full">
          {s.ingredients.map((label, i) => {
            const positions = [
              { top: '18%', left: '8%' },
              { top: '32%', right: '8%' },
              { bottom: '22%', left: '10%' },
              { bottom: '14%', right: '10%' },
            ];
            const pos = positions[i] || positions[0];
            return (
              <div
                key={i}
                ref={(el) => {
                  if (el) ch4LabelsRef.current[i] = el;
                }}
                className="absolute font-display text-sm font-bold tracking-[0.15em] text-white sm:text-xl"
                style={pos as React.CSSProperties}
              >
                {label}
              </div>
            );
          })}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {[
              { x1: 14, y1: 24, x2: 50, y2: 50 },
              { x1: 86, y1: 38, x2: 50, y2: 50 },
              { x1: 16, y1: 74, x2: 50, y2: 50 },
              { x1: 84, y1: 82, x2: 50, y2: 50 },
            ].map((l, i) => (
              <line
                key={i}
                ref={(el) => {
                  if (el) ch4LinesRef.current[i] = el;
                }}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="0.15"
                strokeDasharray="200"
                strokeDashoffset="200"
              />
            ))}
          </svg>
        </div>
      </section>

      {/* Chapter 5 - MADE TO MOVE */}
      <section
        ref={ch5Ref}
        data-ch5
        className="absolute left-0 flex w-full items-center justify-center"
        style={{ top: '400vh', height: '100vh' }}
      >
        <div className="flex flex-col items-center">
          {s.chapterFiveWords.map((word, i) => (
            <div key={i} className="mask-reveal block">
              <span
                ref={(el) => {
                  if (el) ch5WordsRef.current[i] = el;
                }}
                className="editorial-title block text-white"
                style={{
                  fontSize: 'clamp(4rem, 15vw, 14rem)',
                  lineHeight: 0.82,
                }}
              >
                {word}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
});

export default StoryOverlay;
