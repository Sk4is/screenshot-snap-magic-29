import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import ProductCan from '@/components/ProductCan';
import { products } from '@/data/products';
import { CAN_POSES, computeCanTransform } from '@/utils/carouselLayout';
import { stage, damp, lerp, range, smoothstep } from '@/lib/stage';

interface ExperienceProps {
  onHover: (hovering: boolean) => void;
  onCanClick: (index: number) => void;
}

/** Rotation "information zones" around the can circumference (radians). */
const ZONES = [0.15, 0.55, 1.05, 1.6, 2.15, 0.25];

/** Story keyframes: position/scale of the selected can along the cinematic. */
function storyPose(p: number, isMobile: boolean) {
  // intro (0 - .14) | ingredients (.14 - .66) | hero (.66 - .88) | handoff (.88 - 1)
  const intro = smoothstep(range(p, 0.0, 0.14));
  const ing = smoothstep(range(p, 0.14, 0.3));
  const hero = smoothstep(range(p, 0.62, 0.82));
  const hand = smoothstep(range(p, 0.88, 1.0));

  const introX = isMobile ? 0 : 1.35;
  const ingX = isMobile ? 0 : 0.35;
  const heroX = 0;
  const handX = isMobile ? 0 : 1.25;

  let x = lerp(introX, ingX, ing);
  x = lerp(x, heroX, hero);
  x = lerp(x, handX, hand);

  let y = lerp(0, -0.05, ing);
  y = lerp(y, 0.05, hero);
  y = lerp(y, 0.35, hand);

  let scale = lerp(1.02, 1.0, ing);
  scale = lerp(scale, isMobile ? 1.02 : 1.16, hero);
  scale = lerp(scale, 0.92, hand);

  // Rotation reveals information zones, holding between them
  const zoneT = range(p, 0.14, 0.66) * (ZONES.length - 1);
  const zi = Math.min(ZONES.length - 2, Math.floor(zoneT));
  const local = smoothstep(zoneT - zi);
  let rotY = lerp(ZONES[zi]!, ZONES[zi + 1]!, local);
  rotY = lerp(intro * 0.15, rotY, ing);
  rotY = lerp(rotY, 0, hero); // returns front-facing for the hero
  rotY = lerp(rotY, -0.22, hand);

  const tilt = lerp(0.05, 0.02, hero);

  return { x, y, z: lerp(0, 0.25, hero), rotY, rotZ: tilt, scale };
}

/** 0 = lit flavor environment, 1 = near-black ingredient studio */
export function darknessAt(p: number) {
  return smoothstep(range(p, 0.14, 0.24)) * (1 - smoothstep(range(p, 0.6, 0.72)));
}

export default function Experience({ onHover, onCanClick }: ExperienceProps) {
  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const keyLight = useRef<THREE.DirectionalLight>(null);
  const rimLight = useRef<THREE.DirectionalLight>(null);
  const scanLight = useRef<THREE.PointLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  const { camera } = useThree();

  const tmpColor = useMemo(() => new THREE.Color(), []);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;
    const { isMobile } = stage;

    // Smooth the carousel position toward its target (+ live drag offset)
    stage.indexFloat = damp(
      stage.indexFloat,
      stage.indexTarget + stage.dragOffset,
      6.5,
      dt
    );

    const selectT = stage.selectT;
    const story = stage.story;
    const detail = stage.detail;
    const pose = storyPose(story, isMobile);
    const dark = darknessAt(story);
    const selected = stage.selected;
    const active = products[selected >= 0 ? selected : Math.round(stage.indexFloat)]!;

    for (let i = 0; i < products.length; i++) {
      const g = groupRefs.current[i];
      if (!g) continue;
      const rel = i - stage.indexFloat;
      const car = computeCanTransform(rel, isMobile);
      const posePreset = CAN_POSES[i % CAN_POSES.length]!;
      const float = Math.sin(t * 0.62 + posePreset.phase) * 0.045;
      const floatRot = Math.sin(t * 0.35 + posePreset.phase) * 0.02;

      const isSel = i === selected;
      let tx: number, ty: number, tz: number, sc: number;
      let rx: number, ry: number, rz: number;

      if (isSel) {
        tx = lerp(car.x, pose.x, selectT);
        ty = lerp(car.y + float, pose.y + float * 0.5, selectT);
        tz = lerp(car.z, pose.z, selectT);
        sc = lerp(car.scale, pose.scale, selectT);
        rx = lerp(car.rotX + posePreset.rotX, 0.015, selectT);
        ry = lerp(car.rotY + posePreset.rotY, pose.rotY, selectT);
        rz = lerp(car.rotZ + posePreset.rotZ + floatRot, pose.rotZ, selectT);
        // gentle drift while reading the product details
        tx += detail * (isMobile ? 0 : 0.12);
        ty += detail * 0.05;
        ry += detail * 0.25;
      } else {
        // Non-selected cans move outward + backward and sink into the dark
        const away = selectT;
        tx = car.x + Math.sign(rel || 1) * away * 4.2;
        ty = car.y + float - away * 0.4;
        tz = car.z - away * 5.5;
        sc = car.scale * (1 - away * 0.35);
        rx = car.rotX + posePreset.rotX;
        ry = car.rotY + posePreset.rotY + away * 0.4;
        rz = car.rotZ + posePreset.rotZ + floatRot;
      }

      g.position.set(
        damp(g.position.x, tx, 9, dt),
        damp(g.position.y, ty, 9, dt),
        damp(g.position.z, tz, 9, dt)
      );
      g.rotation.set(
        damp(g.rotation.x, rx, 8, dt),
        damp(g.rotation.y, ry, 8, dt),
        damp(g.rotation.z, rz, 8, dt)
      );
      const s = damp(g.scale.x, Math.max(0.001, sc), 9, dt);
      g.scale.setScalar(s);
      g.visible = s > 0.02 && (selectT < 0.98 || isSel);
    }

    // --- Lighting: flavor-tinted, near-black through the ingredient section
    const flavor = tmpColor.set(active.color);
    if (ambient.current) {
      ambient.current.intensity = damp(
        ambient.current.intensity,
        lerp(0.55, 0.05, dark) * lerp(1, 0.85, selectT),
        5,
        dt
      );
    }
    if (keyLight.current) {
      keyLight.current.intensity = damp(keyLight.current.intensity, lerp(2.6, 0.12, dark), 5, dt);
      keyLight.current.color.lerp(
        tmpColor.set('#ffffff').lerp(flavor, 0.18 * selectT),
        0.06
      );
    }
    if (rimLight.current) {
      rimLight.current.intensity = damp(rimLight.current.intensity, lerp(1.6, 2.4, dark), 5, dt);
      rimLight.current.color.lerp(flavor, 0.08);
    }
    if (scanLight.current) {
      // A studio light that scans vertically across the can while dark
      const scanP = range(story, 0.14, 0.66);
      scanLight.current.position.set(
        pose.x + 1.15,
        lerp(-1.6, 1.7, scanP),
        1.5
      );
      scanLight.current.intensity = damp(scanLight.current.intensity, dark * 26, 5, dt);
      scanLight.current.color.lerp(tmpColor.set('#ffffff').lerp(flavor, 0.25), 0.08);
    }

    // --- Camera: stable. Only the selection transition reframes it.
    const cam = camera as THREE.PerspectiveCamera;
    const targetZ = lerp(8.4, isMobile ? 8.2 : 7.4, selectT);
    const targetY = lerp(0.15, 0.05, selectT);
    cam.position.x = damp(cam.position.x, 0, 4, dt);
    cam.position.y = damp(cam.position.y, targetY, 4, dt);
    cam.position.z = damp(cam.position.z, targetZ, 3.2, dt);
    const targetFov = lerp(42, 38, selectT);
    if (Math.abs(cam.fov - targetFov) > 0.01) {
      cam.fov = damp(cam.fov, targetFov, 3, dt);
      cam.updateProjectionMatrix();
    }
    cam.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0.55} />
      <directionalLight ref={keyLight} position={[3.5, 5, 5]} intensity={2.6} />
      <directionalLight ref={rimLight} position={[-4.5, 2.2, -3]} intensity={1.6} />
      <pointLight ref={scanLight} position={[1.5, 0, 1.5]} intensity={0} distance={9} decay={1.6} />
      <Environment preset="studio" environmentIntensity={0.65} />

      {products.map((product, i) => (
        <group
          key={product.id}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            if (stage.selected < 0) onHover(true);
          }}
          onPointerOut={() => onHover(false)}
          onClick={(e) => {
            e.stopPropagation();
            if (stage.selected < 0) onCanClick(i);
          }}
        >
          <ProductCan product={product} isSelected={i === stage.selected} />
        </group>
      ))}
    </>
  );
}
