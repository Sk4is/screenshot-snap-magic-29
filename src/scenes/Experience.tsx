import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import type { Product } from '@/data/products';
import ProductCan from '@/components/ProductCan';
import { computeCanTransform } from '@/utils/carouselLayout';
import { useMousePosition } from '@/hooks/useMousePosition';
import { mixHex } from '@/utils/color';

export interface ExperienceHandle {
  jumpTo: (index: number) => void;
  playSelectTransition: (index: number, onComplete: () => void) => void;
  playReturnTransition: (onComplete: () => void) => void;
  updateProductScroll: (progress: number) => void;
  setInteractionEnabled: (enabled: boolean) => void;
}

interface ExperienceProps {
  products: Product[];
  initialIndex: number;
  isMobile: boolean;
  reducedMotion: boolean;
  onIndexChange: (index: number) => void;
  onCanActivate: (index: number) => void;
  onDragStateChange: (dragging: boolean) => void;
  onCanHover: (hovering: boolean) => void;
  setBackground: (hex: string, duration: number) => void;
}

const CAMERA_HOME = { x: 0, y: 0.3, z: 8.5, fov: 38 };

interface ProductKeyframe {
  t: number;
  can: { x: number; y: number; z: number; rotY: number; scale: number };
  cam: { x: number; y: number; z: number; fov: number };
  warmth: number;
}

const STORY_KEYFRAMES: ProductKeyframe[] = [
  { t: 0, can: { x: 1.8, y: 0, z: 0.5, rotY: 0.15, scale: 1.4 }, cam: { x: 0, y: 0.8, z: 7.0, fov: 34 }, warmth: 0.3 },
  { t: 0.2, can: { x: 0.5, y: 0.1, z: 0.6, rotY: 0.6, scale: 1.5 }, cam: { x: 0, y: 0.9, z: 6.5, fov: 33 }, warmth: 0.5 },
  { t: 0.4, can: { x: -1.4, y: 0.05, z: 0.3, rotY: 1.4, scale: 1.5 }, cam: { x: 0.3, y: 0.8, z: 6.3, fov: 32 }, warmth: 0.8 },
  { t: 0.6, can: { x: 0, y: 0.2, z: 1.2, rotY: 2.3, scale: 1.7 }, cam: { x: 0, y: 0.7, z: 5.0, fov: 28 }, warmth: 1 },
  { t: 0.8, can: { x: 0.1, y: -0.05, z: 0.4, rotY: 2.9, scale: 1.4 }, cam: { x: 0, y: 0.9, z: 6.0, fov: 32 }, warmth: 0.6 },
  { t: 1, can: { x: -0.1, y: 1.0, z: -0.3, rotY: 3.6, scale: 1.3 }, cam: { x: 0, y: 0.5, z: 4.5, fov: 36 }, warmth: 0.9 },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function sampleStory(progress: number) {
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  let a = STORY_KEYFRAMES[0]!;
  let b = STORY_KEYFRAMES[STORY_KEYFRAMES.length - 1]!;
  for (let i = 0; i < STORY_KEYFRAMES.length - 1; i++) {
    if (p >= STORY_KEYFRAMES[i]!.t && p <= STORY_KEYFRAMES[i + 1]!.t) {
      a = STORY_KEYFRAMES[i]!;
      b = STORY_KEYFRAMES[i + 1]!;
      break;
    }
  }
  const span = b.t - a.t || 1;
  const localT = (p - a.t) / span;
  return {
    can: {
      x: lerp(a.can.x, b.can.x, localT),
      y: lerp(a.can.y, b.can.y, localT),
      z: lerp(a.can.z, b.can.z, localT),
      rotY: lerp(a.can.rotY, b.can.rotY, localT),
      scale: lerp(a.can.scale, b.can.scale, localT),
    },
    cam: {
      x: lerp(a.cam.x, b.cam.x, localT),
      y: lerp(a.cam.y, b.cam.y, localT),
      z: lerp(a.cam.z, b.cam.z, localT),
      fov: lerp(a.cam.fov, b.cam.fov, localT),
    },
    warmth: lerp(a.warmth, b.warmth, localT),
  };
}

const Experience = forwardRef<ExperienceHandle, ExperienceProps>(function Experience(
  {
    products,
    initialIndex,
    isMobile,
    reducedMotion,
    onIndexChange,
    onCanActivate,
    onDragStateChange,
    onCanHover,
    setBackground,
  },
  ref
) {
  const { camera, gl } = useThree();
  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const fillLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const floorMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const offsetState = useRef({ value: initialIndex });
  const inertiaRef = useRef(0);
  const dragRef = useRef({ dragging: false, lastX: 0, lastT: 0 });
  const wheelTimeout = useRef<number | null>(null);
  const interactionEnabled = useRef(true);
  const modeRef = useRef<'selector' | 'product'>('selector');
  const mouse = useMousePosition();
  const N = products.length;

  useEffect(() => {
    camera.position.set(CAMERA_HOME.x, CAMERA_HOME.y, CAMERA_HOME.z);
    (camera as THREE.PerspectiveCamera).fov = CAMERA_HOME.fov;
    camera.updateProjectionMatrix();

    groupRefs.current.forEach((group, i) => {
      if (!group) return;
      const rel = i - initialIndex;
      const t = computeCanTransform(rel, isMobile);
      group.position.set(t.x, t.y, t.z);
      group.rotation.y = t.rotY;
      group.scale.setScalar(t.scale);
    });
  }, [camera, initialIndex, isMobile]);

  function snapToNearest() {
    const target = THREE.MathUtils.clamp(Math.round(offsetState.current.value), 0, N - 1);
    gsap.killTweensOf(offsetState.current);
    gsap.to(offsetState.current, {
      value: target,
      duration: reducedMotion ? 0.2 : 0.85,
      ease: 'power3.out',
      onComplete: () => onIndexChange(target),
    });
  }

  useEffect(() => {
    const el = gl.domElement;

    function handlePointerDown(e: PointerEvent) {
      if (!interactionEnabled.current || modeRef.current !== 'selector') return;
      dragRef.current.dragging = true;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastT = performance.now();
      inertiaRef.current = 0;
      gsap.killTweensOf(offsetState.current);
      onDragStateChange(true);
    }

    function handlePointerMove(e: PointerEvent) {
      if (!dragRef.current.dragging) return;
      const now = performance.now();
      const dx = e.clientX - dragRef.current.lastX;
      const dt = Math.max(1, now - dragRef.current.lastT);
      const sensitivity = 0.0072;
      offsetState.current.value = THREE.MathUtils.clamp(
        offsetState.current.value - dx * sensitivity,
        -0.4,
        N - 0.6
      );
      inertiaRef.current = (-dx * sensitivity) / (dt / 16.67);
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastT = now;
    }

    function handlePointerUp() {
      if (!dragRef.current.dragging) return;
      dragRef.current.dragging = false;
      onDragStateChange(false);
      snapToNearest();
    }

    function handleWheel(e: WheelEvent) {
      if (!interactionEnabled.current || modeRef.current !== 'selector') return;
      e.preventDefault();
      gsap.killTweensOf(offsetState.current);
      offsetState.current.value = THREE.MathUtils.clamp(
        offsetState.current.value + e.deltaY * 0.0022,
        -0.4,
        N - 0.6
      );
      if (wheelTimeout.current) window.clearTimeout(wheelTimeout.current);
      wheelTimeout.current = window.setTimeout(snapToNearest, 130);
    }

    function handleKeydown(e: KeyboardEvent) {
      if (!interactionEnabled.current || modeRef.current !== 'selector') return;
      if (e.key === 'ArrowRight') {
        const target = THREE.MathUtils.clamp(Math.round(offsetState.current.value) + 1, 0, N - 1);
        gsap.killTweensOf(offsetState.current);
        gsap.to(offsetState.current, { value: target, duration: 0.7, ease: 'power3.out', onComplete: () => onIndexChange(target) });
      } else if (e.key === 'ArrowLeft') {
        const target = THREE.MathUtils.clamp(Math.round(offsetState.current.value) - 1, 0, N - 1);
        gsap.killTweensOf(offsetState.current);
        gsap.to(offsetState.current, { value: target, duration: 0.7, ease: 'power3.out', onComplete: () => onIndexChange(target) });
      }
    }

    el.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    el.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeydown);

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      el.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [gl, N, onIndexChange, onDragStateChange, reducedMotion]);

  useImperativeHandle(ref, () => ({
    jumpTo(index: number) {
      gsap.killTweensOf(offsetState.current);
      gsap.to(offsetState.current, {
        value: index,
        duration: reducedMotion ? 0.2 : 0.7,
        ease: 'power3.out',
        onComplete: () => onIndexChange(index),
      });
    },
    playSelectTransition(index: number, onComplete: () => void) {
      interactionEnabled.current = false;
      modeRef.current = 'product';
      const product = products[index]!;
      const dur = reducedMotion ? 0.05 : 1.15;
      const tl = gsap.timeline({ onComplete });

      groupRefs.current.forEach((group, i) => {
        if (!group || i === index) return;
        const dir = i < index ? -1 : 1;
        tl.to(
          group.position,
          { x: group.position.x + dir * 9, z: group.position.z - 3, duration: dur * 0.55, ease: 'power2.in' },
          0
        );
      });

      const selected = groupRefs.current[index];
      if (selected) {
        tl.to(selected.position, { x: 0, y: 0.15, z: 2.8, duration: dur, ease: 'power3.inOut' }, 0);
        tl.to(selected.scale, { x: 1.6, y: 1.6, z: 1.6, duration: dur, ease: 'power3.inOut' }, 0);
        tl.to(selected.rotation, { y: selected.rotation.y + Math.PI * 0.19, duration: dur, ease: 'power3.inOut' }, 0);
      }

      tl.to(camera.position, { z: CAMERA_HOME.z - 2.8, y: 0.9, duration: dur, ease: 'power2.inOut' }, 0.1);
      tl.to(camera as THREE.PerspectiveCamera, {
        fov: 30,
        duration: dur,
        ease: 'power2.inOut',
        onUpdate: () => camera.updateProjectionMatrix(),
      }, 0.1);

      setBackground(product.color, dur + 0.15);
    },
    playReturnTransition(onComplete: () => void) {
      const dur = reducedMotion ? 0.05 : 1.2;
      const index = Math.round(offsetState.current.value);
      const tl = gsap.timeline({
        onComplete: () => {
          modeRef.current = 'selector';
          interactionEnabled.current = true;
          onComplete();
        },
      });

      setBackground('#f4f2ee', dur * 0.9);

      tl.to(camera.position, { x: CAMERA_HOME.x, y: CAMERA_HOME.y, z: CAMERA_HOME.z, duration: dur, ease: 'power3.inOut' }, 0);
      tl.to(camera as THREE.PerspectiveCamera, {
        fov: CAMERA_HOME.fov,
        duration: dur,
        ease: 'power3.inOut',
        onUpdate: () => camera.updateProjectionMatrix(),
      }, 0);

      const selected = groupRefs.current[index];
      if (selected) {
        const target = computeCanTransform(0, isMobile);
        tl.to(selected.position, { x: target.x, y: target.y, z: target.z, duration: dur, ease: 'power3.inOut' }, 0);
        tl.to(selected.scale, { x: target.scale, y: target.scale, z: target.scale, duration: dur, ease: 'power3.inOut' }, 0);
        tl.to(selected.rotation, { y: target.rotY, duration: dur, ease: 'power3.inOut' }, 0);
      }

      groupRefs.current.forEach((group, i) => {
        if (!group || i === index) return;
        const rel = i - index;
        const target = computeCanTransform(rel, isMobile);
        tl.to(
          group.position,
          { x: target.x, y: target.y, z: target.z, duration: dur, ease: 'power3.inOut' },
          reducedMotion ? 0 : 0.08 + Math.abs(rel) * 0.05
        );
        tl.to(
          group.scale,
          { x: target.scale, y: target.scale, z: target.scale, duration: dur, ease: 'power3.inOut' },
          reducedMotion ? 0 : 0.08 + Math.abs(rel) * 0.05
        );
        tl.to(
          group.rotation,
          { y: target.rotY, duration: dur, ease: 'power3.inOut' },
          reducedMotion ? 0 : 0.08 + Math.abs(rel) * 0.05
        );
      });
    },
    updateProductScroll(progress: number) {
      const index = Math.round(offsetState.current.value);
      const selected = groupRefs.current[index];
      const sample = sampleStory(progress);
      if (selected) {
        selected.position.set(sample.can.x, sample.can.y, sample.can.z);
        selected.rotation.y = sample.can.rotY;
        selected.scale.setScalar(sample.can.scale);
      }
      camera.position.set(sample.cam.x, sample.cam.y, sample.cam.z);
      (camera as THREE.PerspectiveCamera).fov = sample.cam.fov;
      camera.updateProjectionMatrix();
      if (keyLightRef.current) {
        keyLightRef.current.intensity = 1.4 + sample.warmth * 0.8;
      }
      if (rimLightRef.current) {
        rimLightRef.current.intensity = 0.4 + sample.warmth * 0.6;
      }
      // Floor glow follows flavor color
      if (floorMatRef.current) {
        const product = products[index]!;
        const glowColor = new THREE.Color(mixHex(product.color, '#ffffff', 0.3));
        floorMatRef.current.emissive.copy(glowColor);
        floorMatRef.current.emissiveIntensity = sample.warmth * 0.15;
      }
    },
    setInteractionEnabled(enabled: boolean) {
      interactionEnabled.current = enabled;
    },
  }));

  useFrame((_, delta) => {
    if (modeRef.current !== 'selector') return;

    if (!dragRef.current.dragging && Math.abs(inertiaRef.current) > 0.0008) {
      offsetState.current.value = THREE.MathUtils.clamp(
        offsetState.current.value + inertiaRef.current * delta * 60,
        -0.4,
        N - 0.6
      );
      inertiaRef.current *= Math.pow(0.9, delta * 60);
      if (Math.abs(inertiaRef.current) < 0.01) {
        inertiaRef.current = 0;
        snapToNearest();
      }
    }

    const centerIndex = Math.round(offsetState.current.value);

    // Floor glow follows selected flavor
    if (floorMatRef.current) {
      const product = products[centerIndex] || products[0]!;
      const targetEmissive = new THREE.Color(mixHex(product.color, '#ffffff', 0.2));
      floorMatRef.current.emissive.lerp(targetEmissive, 0.05);
      floorMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        floorMatRef.current.emissiveIntensity,
        0.08,
        0.05
      );
    }

    groupRefs.current.forEach((group, i) => {
      if (!group) return;
      const rel = i - offsetState.current.value;
      const t = computeCanTransform(rel, isMobile);
      let px = t.x;
      let py = t.y;

      if (i === centerIndex && Math.abs(rel) < 0.08) {
        px += mouse.current.x * 0.15;
        py += mouse.current.y * 0.08;
        group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, t.rotY + mouse.current.x * 0.1, 0.06);
      } else {
        group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, t.rotY, 0.12);
      }

      group.position.x = THREE.MathUtils.lerp(group.position.x, px, 0.16);
      group.position.y = THREE.MathUtils.lerp(group.position.y, py, 0.16);
      group.position.z = THREE.MathUtils.lerp(group.position.z, t.z, 0.16);
      const s = THREE.MathUtils.lerp(group.scale.x, t.scale, 0.16);
      group.scale.setScalar(s);
    });
  });

  return (
    <>
      {/* Studio lighting */}
      <ambientLight intensity={0.6} />
      <hemisphereLight args={['#ffffff', '#e8e4df', 0.4]} />
      <directionalLight ref={keyLightRef} position={[5, 7, 6]} intensity={1.4} color="#fff8f0" castShadow />
      <directionalLight ref={fillLightRef} position={[-4, 2, 3]} intensity={0.4} color="#e0eaff" />
      <directionalLight ref={rimLightRef} position={[-3, 4, -5]} intensity={0.5} color="#ffffff" />

      {/* Environment for reflections */}
      <Environment preset="studio" />

      {/* Studio floor — cyclorama style, no hard horizon */}
      <mesh position={[0, -1.65, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          ref={floorMatRef}
          color="#f0ede8"
          roughness={0.85}
          metalness={0.05}
          emissive="#000000"
          emissiveIntensity={0}
        />
      </mesh>
      <ContactShadows position={[0, -1.64, 0]} opacity={0.45} scale={16} blur={2.8} far={5} />

      {products.map((product, i) => (
        <group
          key={product.id}
          ref={(el) => (groupRefs.current[i] = el)}
          onClick={(e) => {
            e.stopPropagation();
            const nearest = Math.round(offsetState.current.value);
            if (i === nearest) onCanActivate(i);
            else {
              gsap.killTweensOf(offsetState.current);
              gsap.to(offsetState.current, { value: i, duration: 0.7, ease: 'power3.out', onComplete: () => onIndexChange(i) });
            }
          }}
          onPointerOver={() => onCanHover(true)}
          onPointerOut={() => onCanHover(false)}
        >
          <ProductCan product={product} isSelected={i === Math.round(offsetState.current.value)} />
        </group>
      ))}
    </>
  );
});

export default Experience;
