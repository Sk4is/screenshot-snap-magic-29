import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import type { Product } from '@/data/products';
import { createCanLabelTexture, createCondensationTexture } from '@/utils/canLabelTexture';

interface ProductCanProps {
  product: Product;
  isSelected?: boolean;
}

const METAL_COLOR = '#d8d8d8';
const METAL_DARK = '#b0b0b0';

// Tall slim 500ml can proportions: ~2.7x taller than wide
const CAN_RADIUS = 0.55;
const CAN_HEIGHT = 3.0;
const SHOULDER_HEIGHT = 0.18;
const BASE_HEIGHT = 0.14;

const ProductCan = forwardRef<THREE.Group, ProductCanProps>(({ product, isSelected = false }, ref) => {
  const labelTexture = useMemo(() => createCanLabelTexture(product), [product]);
  const condensationTexture = useMemo(() => createCondensationTexture(), []);

  // Build a lathe geometry for the can body with beveled top/bottom
  const bodyGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 40;
    const halfH = CAN_HEIGHT / 2;

    // Bottom to top — profile of the can body (radius at each height)
    for (let i = 0; i <= segments; i++) {
      const t = i / segments; // 0 = bottom, 1 = top
      const y = -halfH + t * CAN_HEIGHT;
      let r = CAN_RADIUS;

      // Bottom bevel — narrower at very bottom
      if (t < 0.04) {
        r = CAN_RADIUS * (0.93 + t * 1.75);
      }
      // Shoulder bevel — narrows near top
      else if (t > 0.96) {
        const st = (t - 0.96) / 0.04;
        r = CAN_RADIUS * (1 - st * 0.07);
      }
      // Subtle inward curve near top shoulder
      else if (t > 0.88) {
        const st = (t - 0.88) / 0.08;
        r = CAN_RADIUS * (1 - st * 0.02);
      }

      points.push(new THREE.Vector2(r, y));
    }

    const geo = new THREE.LatheGeometry(points, 64);
    return geo;
  }, []);

  // Top lid geometry — recessed with rim
  const topLidGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    // Recessed top: outer rim -> dip -> center
    points.push(new THREE.Vector2(CAN_RADIUS * 0.96, CAN_HEIGHT / 2));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.94, CAN_HEIGHT / 2 + 0.02));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.88, CAN_HEIGHT / 2 + 0.02));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.86, CAN_HEIGHT / 2 - 0.03));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.84, CAN_HEIGHT / 2 - 0.03));
    points.push(new THREE.Vector2(0, CAN_HEIGHT / 2 - 0.03));
    return new THREE.LatheGeometry(points, 64);
  }, []);

  // Bottom — concave
  const bottomGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    points.push(new THREE.Vector2(0, -CAN_HEIGHT / 2 + 0.04));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.82, -CAN_HEIGHT / 2 + 0.04));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.88, -CAN_HEIGHT / 2 + 0.01));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.93, -CAN_HEIGHT / 2));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.96, -CAN_HEIGHT / 2));
    return new THREE.LatheGeometry(points, 64);
  }, []);

  // Pull tab — flat oval ring sitting on top
  const pullTabGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const tabR = CAN_RADIUS * 0.45;
    const tabW = CAN_RADIUS * 0.12;
    // Outer oval
    shape.absellipse(0, 0, tabR + tabW, tabR * 0.5 + tabW, 0, Math.PI * 2, false);
    // Inner hole
    const hole = new THREE.Path();
    hole.absellipse(0, 0, tabR, tabR * 0.5, 0, Math.PI * 2, false);
    shape.holes.push(hole);
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.005,
      bevelSegments: 2,
    });
  }, []);

  return (
    <group ref={ref}>
      {/* Main body with label */}
      <mesh geometry={bodyGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          map={labelTexture}
          metalness={0.75}
          roughness={0.22}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Condensation overlay — only on selected can, stronger */}
      {isSelected && (
        <mesh geometry={bodyGeometry}>
          <meshStandardMaterial
            map={condensationTexture}
            transparent
            opacity={0.35}
            metalness={0.1}
            roughness={0.6}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>
      )}

      {/* Top lid — recessed aluminum */}
      <mesh geometry={topLidGeometry} castShadow>
        <meshStandardMaterial
          color={METAL_COLOR}
          metalness={0.95}
          roughness={0.18}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Pull tab */}
      <mesh
        geometry={pullTabGeometry}
        position={[0, CAN_HEIGHT / 2 - 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0.3]}
        castShadow
      >
        <meshStandardMaterial
          color={METAL_COLOR}
          metalness={0.98}
          roughness={0.15}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Bottom — concave aluminum */}
      <mesh geometry={bottomGeometry} castShadow>
        <meshStandardMaterial
          color={METAL_DARK}
          metalness={0.9}
          roughness={0.3}
          envMapIntensity={1.0}
        />
      </mesh>
    </group>
  );
});

ProductCan.displayName = 'ProductCan';

export default ProductCan;
