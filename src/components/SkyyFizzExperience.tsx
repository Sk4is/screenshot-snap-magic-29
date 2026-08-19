import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import Lenis from 'lenis';
import Experience, { darknessAt } from '@/scenes/Experience';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';
import CustomCursor from '@/components/CustomCursor';
import CarouselOverlay from '@/components/CarouselOverlay';
import StoryOverlay, { type StoryOverlayHandle } from '@/components/StoryOverlay';
import HeroType, { type HeroTypeHandle } from '@/components/HeroType';
import ProductDetails from '@/components/ProductDetails';
import { products, DEFAULT_INDEX } from '@/data/products';
import { useResponsive } from '@/hooks/useResponsive';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { stage, clamp01, range, smoothstep } from '@/lib/stage';

type Mode = 'loading' | 'carousel' | 'selecting' | 'story' | 'returning';
type CursorState = 'default' | 'view' | 'drag' | 'cta';

/** length of the pinned cinematic timeline, in viewport heights */
const CINE_VH = 7;

export default function SkyyFizzExperience() {
  const { isMobile, isTouch } = useResponsive();
  const reducedMotion = usePrefersReducedMotion();

  const [mode, setMode] = useState<Mode>('loading');
  const [index, setIndex] = useState(DEFAULT_INDEX);
  const [selected, setSelected] = useState(-1);
  const [cursorState, setCursorState] = useState<CursorState>('default');

  const modeRef = useRef<Mode>('loading');
  modeRef.current = mode;

  const storyRef = useRef<StoryOverlayHandle>(null);
  const heroRef = useRef<HeroTypeHandle>(null);
  const flavorBg = useRef<HTMLDivElement>(null);
  const darkBg = useRef<HTMLDivElement>(null);
  const heroBg = useRef<HTMLDivElement>(null);
  const canvasWrap = useRef<HTMLDivElement>(null);
  const wheelAcc = useRef(0);
  const dragging = useRef<{ id: number; x: number; start: number } | null>(null);

  const activeProduct = products[selected >= 0 ? selected : index]!;

  stage.isMobile = isMobile;
  stage.reducedMotion = reducedMotion;

  /* ---------------------------------------------------------- scroll lock */
  const lockScroll = useCallback((lock: boolean) => {
    document.documentElement.style.overflowY = lock ? 'hidden' : '';
    document.body.style.overflowY = lock ? 'hidden' : '';
  }, []);

  useEffect(() => {
    lockScroll(mode === 'loading' || mode === 'carousel' || mode === 'selecting');
  }, [mode, lockScroll]);

  /* --------------------------------------------------------- smooth scroll */
  useEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [reducedMotion]);

  /* --------------------------------------- one rAF loop = source of truth */
  useEffect(() => {
    let raf = 0;
    const g = activeProduct.gradient;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const vh = window.innerHeight;
      const cine = CINE_VH * vh;
      const y = window.scrollY;

      const p = stage.selected >= 0 ? clamp01(y / cine) : 0;
      stage.story = p;
      stage.detail = stage.selected >= 0 ? Math.max(0, (y - cine) / vh) : 0;

      storyRef.current?.update(p);
      heroRef.current?.update(p);

      const dark = darknessAt(p);
      const hero = smoothstep(range(p, 0.6, 0.8));
      if (darkBg.current) darkBg.current.style.opacity = String(dark);
      if (heroBg.current) heroBg.current.style.opacity = String(hero);
      if (flavorBg.current) flavorBg.current.style.opacity = String(stage.selectT);
      if (canvasWrap.current) {
        // let the reader breathe: the can fades out deep in the detail pages
        canvasWrap.current.style.opacity = String(1 - smoothstep(range(stage.detail, 1.5, 2.4)));
      }
      void g;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeProduct]);

  /* ------------------------------------------------------------ selection */
  const selectFlavor = useCallback(
    (i: number) => {
      if (modeRef.current !== 'carousel') return;
      setMode('selecting');
      setSelected(i);
      setIndex(i);
      setCursorState('default');
      stage.selected = i;
      stage.indexTarget = i;
      gsap.to(stage, {
        selectT: 1,
        duration: reducedMotion ? 0.2 : 1.35,
        ease: 'power3.inOut',
        onComplete: () => {
          setMode('story');
          window.scrollTo(0, 0);
        },
      });
    },
    [reducedMotion]
  );

  const returnToCarousel = useCallback(() => {
    if (modeRef.current !== 'story') return;
    setMode('returning');
    window.scrollTo(0, 0);
    gsap.to(stage, {
      selectT: 0,
      duration: reducedMotion ? 0.2 : 1.2,
      ease: 'power3.inOut',
      onComplete: () => {
        stage.selected = -1;
        setSelected(-1);
        setMode('carousel');
      },
    });
  }, [reducedMotion]);

  /* --------------------------------------------------- carousel navigation */
  const goTo = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(products.length - 1, next));
    stage.indexTarget = clamped;
    setIndex(clamped);
  }, []);

  useEffect(() => {
    function onWheel(e: WheelEvent) {
      const m = modeRef.current;
      if (m === 'carousel') {
        e.preventDefault();
        wheelAcc.current += e.deltaY * (e.deltaMode === 1 ? 16 : 1);
        if (Math.abs(wheelAcc.current) > 110) {
          goTo(stage.indexTarget + Math.sign(wheelAcc.current));
          wheelAcc.current = 0;
        }
      } else if (m === 'story' && window.scrollY <= 2 && e.deltaY < -6) {
        returnToCarousel();
      }
    }
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [goTo, returnToCarousel]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (modeRef.current !== 'carousel') return;
      if (e.key === 'ArrowRight') goTo(stage.indexTarget + 1);
      if (e.key === 'ArrowLeft') goTo(stage.indexTarget - 1);
      if (e.key === 'Enter') selectFlavor(stage.indexTarget);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, selectFlavor]);

  /* ------------------------------------------------------------- dragging */
  const onPointerDown = (e: React.PointerEvent) => {
    if (modeRef.current !== 'carousel') return;
    dragging.current = { id: e.pointerId, x: e.clientX, start: stage.indexTarget };
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setCursorState('drag');
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragging.current;
    if (!d || d.id !== e.pointerId) return;
    stage.dragOffset = -(e.clientX - d.x) / (isMobile ? 120 : 180);
  };
  const endDrag = () => {
    if (!dragging.current) return;
    const target = Math.round(dragging.current.start + stage.dragOffset);
    dragging.current = null;
    stage.dragOffset = 0;
    goTo(target);
    setCursorState('default');
  };

  /* --------------------------------------------- touch return at page top */
  useEffect(() => {
    let startY = 0;
    function ts(e: TouchEvent) {
      startY = e.touches[0]?.clientY ?? 0;
    }
    function tm(e: TouchEvent) {
      if (modeRef.current !== 'story' || window.scrollY > 2) return;
      const dy = (e.touches[0]?.clientY ?? 0) - startY;
      if (dy > 60) returnToCarousel();
    }
    window.addEventListener('touchstart', ts, { passive: true });
    window.addEventListener('touchmove', tm, { passive: true });
    return () => {
      window.removeEventListener('touchstart', ts);
      window.removeEventListener('touchmove', tm);
    };
  }, [returnToCarousel]);

  const g = activeProduct.gradient;
  const inStory = mode === 'story' || mode === 'returning' || mode === 'selecting';

  return (
    <div className="relative w-full">
      {/* --- environment layers (full viewport, always) --- */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 42%, #2b2f38 0%, #14161b 45%, #050506 100%)',
        }}
      />
      <div
        ref={flavorBg}
        className="fixed inset-0 z-[1] opacity-0"
        style={{
          background: `radial-gradient(ellipse 85% 65% at 50% 45%, ${g.glow} 0%, ${g.mid} 42%, ${g.edge} 100%)`,
        }}
      />
      <div
        ref={darkBg}
        className="fixed inset-0 z-[2] opacity-0"
        style={{
          background: `radial-gradient(ellipse 60% 55% at 50% 50%, ${g.edge} 0%, #030303 55%, #000000 100%)`,
        }}
      />
      <div
        ref={heroBg}
        className="fixed inset-0 z-[3] opacity-0"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 48%, ${g.glow} 0%, ${g.mid} 45%, ${g.edge} 100%)`,
        }}
      />
      <div className="grain-overlay" />

      {/* giant flavor typography sits behind the can */}
      <HeroType ref={heroRef} product={activeProduct} />

      {/* --- one persistent 3D world --- */}
      <div
        ref={canvasWrap}
        className="fixed inset-0 z-10"
        style={{ pointerEvents: mode === 'carousel' ? 'auto' : 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <Canvas
          camera={{ position: [0, 0.15, 8.4], fov: 42, near: 0.1, far: 60 }}
          dpr={[1, reducedMotion ? 1.25 : 1.75]}
          gl={{ antialias: true, alpha: true }}
        >
          <Experience
            onHover={(h) =>
              setCursorState((prev) => (prev === 'drag' ? prev : h ? 'view' : 'default'))
            }
            onCanClick={selectFlavor}
          />
        </Canvas>
      </div>

      <Navbar
        theme="dark"
        cartCount={0}
        onLogoClick={() => (mode === 'story' ? returnToCarousel() : goTo(DEFAULT_INDEX))}
      />

      <CarouselOverlay
        products={products}
        index={index}
        visible={mode === 'carousel'}
        onPrev={() => goTo(stage.indexTarget - 1)}
        onNext={() => goTo(stage.indexTarget + 1)}
      />

      <StoryOverlay ref={storyRef} product={activeProduct} active={inStory} />

      {/* --- scroll surface: cinematic spacer, then normal detail content --- */}
      {selected >= 0 && (
        <>
          <div style={{ height: `${CINE_VH * 100}vh` }} aria-hidden />
          <ProductDetails product={activeProduct} />
        </>
      )}

      <CustomCursor state={cursorState} enabled={!isTouch && !reducedMotion} />

      {mode === 'loading' && (
        <Loader onComplete={() => setMode('carousel')} reducedMotion={reducedMotion} />
      )}
    </div>
  );
}
