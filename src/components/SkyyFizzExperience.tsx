import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import type { ExperienceHandle } from '@/scenes/Experience';
import Experience from '@/scenes/Experience';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';
import CustomCursor from '@/components/CustomCursor';
import SelectorOverlay from '@/components/SelectorOverlay';
import StoryOverlay, { type StoryOverlayHandle } from '@/components/StoryOverlay';
import { products } from '@/data/products';
import { mixHex } from '@/utils/color';
import { useResponsive } from '@/hooks/useResponsive';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

type Phase = 'loading' | 'selector' | 'transitioning' | 'product' | 'returning';
type CursorState = 'default' | 'view' | 'drag' | 'cta';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const { isMobile, isTouch } = useResponsive();
  const reducedMotion = usePrefersReducedMotion();

  const [phase, setPhase] = useState<Phase>('loading');
  const [index, setIndex] = useState(0);
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const [navTheme, setNavTheme] = useState<'light' | 'dark'>('light');
  const [bgGradient, setBgGradient] = useState({ color: '#f4f2ee', glow: '#f4f2ee', intensity: 0 });

  const experienceRef = useRef<ExperienceHandle>(null);
  const storyRef = useRef<StoryOverlayHandle>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const scrollProgressRef = useRef(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const returningRef = useRef(false);

  const selectedProduct = products[index] ?? products[0]!;

  const setBackground = useCallback((hex: string, duration: number) => {
    setBgGradient(prev => {
      const next = { ...prev, color: hex, glow: hex, intensity: hex === '#f4f2ee' ? 0 : 1 };
      if (bgRef.current) {
        gsap.to(prev, {
          color: next.color,
          glow: next.glow,
          intensity: next.intensity,
          duration: duration * 0.8,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (bgRef.current) {
              const p = prev;
              bgRef.current.style.background =
                `radial-gradient(ellipse 80% 60% at 50% 45%, ${p.glow}${Math.round(p.intensity * 99).toString(16).padStart(2, '0')} 0%, ${mixHex(p.color, '#f4f2ee', 1 - p.intensity * 0.5)} 50%, #f4f2ee 100%)`;
            }
          },
        });
      }
      return next;
    });
  }, []);

  // Lenis smooth scroll
  useEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    let raf = 0;
    function loop(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  // Update nav theme based on phase
  useEffect(() => {
    if (phase === 'product' || phase === 'transitioning') {
      setNavTheme('dark');
    } else {
      setNavTheme('light');
    }
  }, [phase]);

  // ScrollTrigger for product story — drives both 3D can and story overlay
  const setupProductScroll = useCallback(() => {
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
      scrollTriggerRef.current = null;
    }
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: '#product-scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      pin: '#product-scroll-pin',
      pinSpacing: true,
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
        if (experienceRef.current) {
          experienceRef.current.updateProductScroll(self.progress);
        }
        if (storyRef.current) {
          storyRef.current.updateProgress(self.progress);
        }
      },
    });
    ScrollTrigger.refresh();
  }, []);

  const handleLoaderComplete = useCallback(() => {
    setPhase('selector');
  }, []);

  const handleIndexChange = useCallback((newIndex: number) => {
    setIndex(newIndex);
  }, []);

  const handleCanActivate = useCallback(
    (clickedIndex: number) => {
      if (phase !== 'selector') return;
      setPhase('transitioning');
      setCursorState('default');
      const product = products[clickedIndex]!;
      setBackground(product.color, 1.3);
      experienceRef.current?.playSelectTransition(clickedIndex, () => {
        setPhase('product');
        storyRef.current?.reset();
        // setup scroll after a tick so DOM is ready
        setTimeout(() => {
          setupProductScroll();
        }, 50);
      });
    },
    [phase, setBackground, setupProductScroll]
  );

  const handlePrev = useCallback(() => {
    const target = Math.max(0, index - 1);
    experienceRef.current?.jumpTo(target);
  }, [index]);

  const handleNext = useCallback(() => {
    const target = Math.min(products.length - 1, index + 1);
    experienceRef.current?.jumpTo(target);
  }, [index]);

  const handleDragState = useCallback((dragging: boolean) => {
    setCursorState(dragging ? 'drag' : 'default');
  }, []);

  const handleCanHover = useCallback(
    (hovering: boolean) => {
      if (phase !== 'selector') return;
      setCursorState((prev) => (prev === 'drag' ? prev : hovering ? 'view' : 'default'));
    },
    [phase]
  );

  const startReturn = useCallback(() => {
    if (returningRef.current) return;
    if (phase !== 'product') return;
    returningRef.current = true;
    setPhase('returning');
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
      scrollTriggerRef.current = null;
    }
    setBackground('#f4f2ee', 1.2);
    experienceRef.current?.playReturnTransition(() => {
      returningRef.current = false;
      setPhase('selector');
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
      ScrollTrigger.refresh();
    });
  }, [phase, setBackground]);

  // Return to selector when scroll reaches the end
  useEffect(() => {
    if (phase !== 'product') return;
    let ticking = false;
    function checkReturn() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const progress = scrollProgressRef.current;
        if (progress > 0.97) {
          startReturn();
        }
      });
    }
    function onScroll() {
      checkReturn();
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [phase, startReturn]);

  const handleLogoClick = useCallback(() => {
    if (phase === 'product' || phase === 'transitioning') {
      startReturn();
    } else if (phase === 'selector') {
      experienceRef.current?.jumpTo(0);
    }
  }, [phase, startReturn]);

  const cursorEnabled = !isTouch && !reducedMotion;

  return (
    <div className="relative w-full overflow-hidden">
      {/* Animated background — radial gradient that reacts to selected flavor */}
      <div
        ref={bgRef}
        className="fixed inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 45%, ${bgGradient.glow}00 0%, ${bgGradient.color} 50%, #f4f2ee 100%)`,
        }}
      />
      <div className="grain-overlay" />

      {/* Persistent WebGL Canvas */}
      <div className="fixed inset-0 z-10 h-screen w-screen">
        <Canvas
          shadows
          dpr={[1, isMobile ? 1.2 : 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%' }}
          camera={{ position: [0, 0, 8], fov: 40, near: 0.1, far: 100 }}
        >
          <Experience
            ref={experienceRef}
            products={products}
            initialIndex={0}
            isMobile={isMobile}
            reducedMotion={reducedMotion}
            onIndexChange={handleIndexChange}
            onCanActivate={handleCanActivate}
            onDragStateChange={handleDragState}
            onCanHover={handleCanHover}
            setBackground={setBackground}
          />
        </Canvas>
      </div>

      {/* Navbar */}
      <Navbar theme={navTheme} cartCount={0} onLogoClick={handleLogoClick} />

      {/* Selector overlay */}
      <SelectorOverlay
        products={products}
        index={index}
        visible={phase === 'selector'}
        onPrev={handlePrev}
        onNext={handleNext}
        isMobile={isMobile}
      />

      {/* Product story overlay */}
      <StoryOverlay
        ref={storyRef}
        product={selectedProduct}
        visible={phase === 'product' || phase === 'returning'}
        isMobile={isMobile}
      />

      {/* Back to flavors button + scroll hint during product experience */}
      <div
        className={`pointer-events-none fixed bottom-6 left-1/2 z-30 -translate-x-1/2 transition-opacity duration-500 ${
          phase === 'product' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={startReturn}
          className="pointer-events-auto font-display text-[10px] font-bold tracking-[0.25em] text-white/70 transition-colors hover:text-white sm:text-xs"
        >
          ← BACK TO FLAVORS
        </button>
      </div>
      <div
        className={`pointer-events-none fixed bottom-6 right-6 z-30 transition-opacity duration-500 ${
          phase === 'product' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="font-display text-[10px] font-semibold tracking-[0.2em] text-white/50">
          SCROLL TO EXPLORE
        </p>
      </div>

      {/* Scroll container for product story - invisible spacer that drives ScrollTrigger */}
      <div
        id="product-scroll-container"
        style={{
          position: 'relative',
          height: phase === 'product' || phase === 'returning' ? '600vh' : '0',
          width: '100%',
          zIndex: 5,
          pointerEvents: 'none',
        }}
      >
        <div id="product-scroll-pin" style={{ height: '100vh', width: '100%' }} />
      </div>

      {/* Custom cursor */}
      <CustomCursor state={cursorState} enabled={cursorEnabled} />

      {/* Loader */}
      {phase === 'loading' && (
        <Loader onComplete={handleLoaderComplete} reducedMotion={reducedMotion} />
      )}
    </div>
  );
}
