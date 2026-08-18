import { useEffect, useRef, useState } from 'react';

type CursorState = 'default' | 'view' | 'drag' | 'cta';

interface CustomCursorProps {
  state: CursorState;
  enabled: boolean;
}

export default function CustomCursor({ state, enabled }: CustomCursorProps) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!enabled) return;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    function onMove(e: PointerEvent) {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      }
    }
    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    }
    window.addEventListener('pointermove', onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  useEffect(() => {
    setLabel(state === 'view' ? 'EXPLORE' : state === 'drag' ? 'DRAG' : '');
  }, [state]);

  if (!enabled) return null;

  const ringSize = state === 'view' || state === 'drag' ? 72 : state === 'cta' ? 52 : 30;
  const showLabel = state === 'view' || state === 'drag';

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] hidden md:block">
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-ink mix-blend-difference"
      />
      <div
        ref={ringRef}
        className="fixed left-0 top-0 flex items-center justify-center rounded-full border border-ink/70 mix-blend-difference transition-[width,height] duration-300"
        style={{ width: ringSize, height: ringSize }}
      >
        {showLabel && (
          <span className="font-display text-[9px] font-bold tracking-[0.2em] text-ink">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
