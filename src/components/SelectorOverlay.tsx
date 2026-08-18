import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/data/products';
import { computeCanTransform } from '@/utils/carouselLayout';

interface SelectorOverlayProps {
  products: Product[];
  index: number;
  visible: boolean;
  onPrev: () => void;
  onNext: () => void;
  isMobile: boolean;
}

export default function SelectorOverlay({
  products,
  index,
  visible,
  onPrev,
  onNext,
  isMobile,
}: SelectorOverlayProps) {
  const nameRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const flavorLabelRefs = useRef<HTMLSpanElement[]>([]);
  const product = products[index];

  useEffect(() => {
    if (!visible) return;
    const tl = gsap.timeline();
    tl.fromTo(
      rootRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power2.out' }
    );
    return () => {
      tl.kill();
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || !nameRef.current) return;
    const lines = nameRef.current.querySelectorAll('[data-line]');
    gsap.fromTo(
      lines,
      { yPercent: 115 },
      { yPercent: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }
    );
    if (subRef.current) {
      gsap.fromTo(
        subRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.25, ease: 'power2.out' }
      );
    }
    if (counterRef.current) {
      gsap.fromTo(
        counterRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, delay: 0.1, ease: 'power2.out' }
      );
    }
  }, [index, visible]);

  if (!product) return null;
  const [line1, line2] = product.name.toUpperCase().split(' ');

  // Compute screen positions for flavor labels under each can
  // The carousel is centered, cans are positioned in 3D and projected
  // We approximate their screen X positions based on the carousel layout
  const visibleCount = isMobile ? 3 : 7;
  const startIdx = isMobile ? index - 1 : 0;
  const indices: number[] = [];
  for (let i = 0; i < visibleCount; i++) {
    const idx = (startIdx + i + products.length) % products.length;
    if (idx >= 0 && idx < products.length) indices.push(idx);
  }

  return (
    <div
      ref={rootRef}
      className={`pointer-events-none fixed inset-0 z-30 transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Flavor name labels under each can */}
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 translate-y-[12vh] items-end justify-center gap-0 sm:translate-y-[14vh]">
        {indices.map((i) => {
          const rel = i - index;
          const t = computeCanTransform(rel, isMobile);
          const isSelected = i === index;
          const name = products[i]!.name.toUpperCase();
          // Approximate screen position from 3D x
          const screenX = t.x * 90; // scale factor for screen pixels
          return (
            <span
              key={i}
              ref={(el) => {
                if (el) flavorLabelRefs.current[i] = el;
              }}
              className="absolute font-display font-bold uppercase tracking-[0.15em] transition-all duration-500"
              style={{
                left: '50%',
                transform: `translateX(calc(${screenX}px - 50%))`,
                fontSize: isSelected ? '11px' : '9px',
                opacity: isSelected ? 0.9 : 0.35,
                color: isSelected ? '#1a1a1a' : '#1a1a1a',
                whiteSpace: 'nowrap',
                letterSpacing: isSelected ? '0.2em' : '0.15em',
              }}
            >
              {name}
            </span>
          );
        })}
      </div>

      {/* Selected product info — bottom center */}
      <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center px-6 sm:bottom-14">
        <div
          ref={counterRef}
          className="mb-3 font-display text-[10px] font-semibold tracking-[0.3em] text-ink/50 sm:text-xs"
        >
          {String(index + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
        </div>
        <div
          ref={nameRef}
          className="editorial-title text-center text-ink"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 6.5rem)' }}
        >
          <div className="mask-reveal block">
            <span data-line className="block">
              {line1}
            </span>
          </div>
          {line2 && (
            <div className="mask-reveal block">
              <span data-line className="block">
                {line2}
              </span>
            </div>
          )}
        </div>
        <p
          ref={subRef}
          className="mt-3 max-w-md text-center font-display text-[11px] font-medium tracking-[0.15em] text-ink/45 sm:text-sm"
        >
          {product.story.ingredients[0]} · SPARKLING ENERGY · ZERO SUGAR
        </p>
      </div>

      {/* Navigation arrows */}
      <div className="absolute bottom-1/2 left-4 z-40 sm:left-8">
        <button
          onClick={onPrev}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink/70 transition-all duration-300 hover:border-ink/60 hover:text-ink sm:h-12 sm:w-12"
          aria-label="Previous flavor"
        >
          <ChevronLeft size={18} />
        </button>
      </div>
      <div className="absolute bottom-1/2 right-4 z-40 sm:right-8">
        <button
          onClick={onNext}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink/70 transition-all duration-300 hover:border-ink/60 hover:text-ink sm:h-12 sm:w-12"
          aria-label="Next flavor"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Instruction */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[20vh]">
        <p className="font-display text-[10px] font-semibold tracking-[0.25em] text-ink/35">
          DRAG · SCROLL · CLICK TO EXPLORE
        </p>
      </div>
    </div>
  );
}
