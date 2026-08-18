import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface LoaderProps {
  onComplete: () => void;
  reducedMotion: boolean;
}

export default function Loader({ onComplete, reducedMotion }: LoaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const counter = { value: 0 };
    const duration = reducedMotion ? 0.3 : 1.4;

    const tl = gsap.timeline();

    tl.to(counter, {
      value: 100,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (countRef.current) {
          countRef.current.textContent = String(Math.round(counter.value)).padStart(2, '0');
        }
      },
    });

    tl.to(
      logoRef.current,
      {
        y: -14,
        opacity: 0,
        duration: reducedMotion ? 0.15 : 0.4,
        ease: 'power2.in',
      },
      '-=0.1'
    );

    tl.to(rootRef.current, {
      opacity: 0,
      duration: reducedMotion ? 0.2 : 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        setDone(true);
        onComplete();
      },
    });

    return () => {
      tl.kill();
    };
  }, [onComplete, reducedMotion]);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#101010]"
      style={{ pointerEvents: 'none' }}
    >
      <div ref={logoRef} className="flex flex-col items-center gap-6">
        <p className="font-display text-2xl font-bold tracking-[0.3em] text-white/90">SKYY FIZZ</p>
        <span
          ref={countRef}
          className="font-display text-6xl font-extrabold tabular-nums text-white sm:text-7xl"
        >
          00
        </span>
      </div>
    </div>
  );
}
