import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import type { Product } from '@/data/products';
import {
  createCanLabelTexture,
  createCondensationTexture,
  createCanRoughnessTexture,
  createCanNormalTexture,
  createMetalRoughnessTexture,
  createMetalNormalTexture,
} from '@/utils/canLabelTexture';

interface ProductCanProps {
  product: Product;
  isSelected?: boolean;
}

const METAL_COLOR = '#c8c8cc';
const METAL_DARK = '#8a8a90';
const METAL_BRIGHT = '#e8e8ee';

// Tall slim 500ml can proportions: ~2.7x taller than wide
const CAN_RADIUS = 0.55;
const CAN_HEIGHT = 3.0;
const SHOULDER_HEIGHT = 0.18;
const BASE_HEIGHT = 0.14;

const ProductCan = forwardRef<THREE.Group, ProductCanProps>(({ product, isSelected = false }, ref) => {
  const labelTexture = useMemo(() => createCanLabelTexture(product), [product]);
  const condensationTexture = useMemo(() => createCondensationTexture(), []);
  const labelRoughness = useMemo(() => createCanRoughnessTexture(), []);
  const labelNormal = useMemo(() => createCanNormalTexture(), []);
  const metalRoughness = useMemo(() => createMetalRoughnessTexture(), []);
  const metalNormal = useMemo(() => createMetalNormalTexture(), []);

  // Build a lathe geometry for the can body with beveled top/bottom
  const bodyGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 64;
    const halfH = CAN_HEIGHT / 2;

    // Bottom to top — profile of the can body (radius at each height)
    for (let i = 0; i <= segments; i++) {
      const t = i / segments; // 0 = bottom, 1 = top
      const y = -halfH + t * CAN_HEIGHT;
      let r = CAN_RADIUS;

      // Bottom bevel — narrower at very bottom, with a slight inward neck
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

      points.push(new THREE.Vector2(Math.max(0.001, r), y));
    }

    const geo = new THREE.LatheGeometry(points, 96);
    return geo;
  }, []);

  // Top lid geometry — recessed with rim, more detailed
  const topLidGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    // Recessed top: outer rim -> dip -> center with subtle countersink
    points.push(new THREE.Vector2(CAN_RADIUS * 0.96, CAN_HEIGHT / 2));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.955, CAN_HEIGHT / 2 + 0.015));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.94, CAN_HEIGHT / 2 + 0.02));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.88, CAN_HEIGHT / 2 + 0.02));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.87, CAN_HEIGHT / 2 + 0.005));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.86, CAN_HEIGHT / 2 - 0.025));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.84, CAN_HEIGHT / 2 - 0.035));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.78, CAN_HEIGHT / 2 - 0.035));
    points.push(new THREE.Vector2(0, CAN_HEIGHT / 2 - 0.035));
    return new THREE.LatheGeometry(points, 96);
  }, []);

  // Bottom — concave with more detail
  const bottomGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    points.push(new THREE.Vector2(0, -CAN_HEIGHT / 2 + 0.05));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.78, -CAN_HEIGHT / 2 + 0.05));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.84, -CAN_HEIGHT / 2 + 0.02));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.88, -CAN_HEIGHT / 2 + 0.005));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.92, -CAN_HEIGHT / 2));
    points.push(new THREE.Vector2(CAN_RADIUS * 0.96, -CAN_HEIGHT / 2));
    return new THREE.LatheGeometry(points, 96);
  }, []);

  // Pull tab — flat oval ring sitting on top, more realistic shape
  const pullTabGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const tabR = CAN_RADIUS * 0.42;
    const tabW = CAN_RADIUS * 0.1;
    // Outer oval — slightly elongated
    shape.absellipse(0, 0, tabR + tabW, tabR * 0.48 + tabW, 0, Math.PI * 2, false);
    // Inner hole
    const hole = new THREE.Path();
    hole.absellipse(0, 0, tabR, tabR * 0.48, 0, Math.PI * 2, false);
    shape.holes.push(hole);
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.018,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.006,
      bevelSegments: 3,
    });
  }, []);

  // Tab rivet — small bump in the center of the tab
  const tabRivetGeometry = useMemo(() => {
    return new THREE.SphereGeometry(CAN_RADIUS * 0.06, 16, 12);
  }, []);

  return (
    <group ref={ref}>
      {/* Main body with label + condensation roughness/normal */}
      <mesh geometry={bodyGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          map={labelTexture}
          roughnessMap={labelRoughness}
          normalMap={labelNormal}
          normalScale={new THREE.Vector2(0.4, 0.4)}
          metalness={0.6}
          roughness={0.28}
          envMapIntensity={1.4}
          clearcoat={0.15}
          clearcoatRoughness={0.4}
          emissive={new THREE.Color(product.color)}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Condensation overlay — always present, stronger when selected */}
      <mesh geometry={bodyGeometry}>
        <meshPhysicalMaterial
          map={condensationTexture}
          transparent
          opacity={isSelected ? 0.45 : 0.28}
          metalness={0.05}
          roughness={0.5}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-1}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
          envMapIntensity={1.8}
        />
      </mesh>

      {/* Top lid — recessed aluminum with detailed metal textures */}
      <mesh geometry={topLidGeometry} castShadow>
        <meshPhysicalMaterial
          color={METAL_COLOR}
          roughnessMap={metalRoughness}
          normalMap={metalNormal}
          normalScale={new THREE.Vector2(0.3, 0.3)}
          metalness={0.96}
          roughness={0.16}
          envMapIntensity={1.8}
          clearcoat={0.3}
          clearcoatRoughness={0.3}
        />
      </mesh>

      {/* Pull tab */}
      <mesh
        geometry={pullTabGeometry}
        position={[0, CAN_HEIGHT / 2 - 0.008, 0]}
        rotation={[-Math.PI / 2, 0, 0.3]}
        castShadow
      >
        <meshPhysicalMaterial
          color={METAL_BRIGHT}
          roughnessMap={metalRoughness}
          metalness={0.98}
          roughness={0.14}
          envMapIntensity={2.0}
          clearcoat={0.4}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Tab rivet */}
      <mesh
        geometry={tabRivetGeometry}
        position={[0, CAN_HEIGHT / 2 - 0.012, 0]}
        castShadow
      >
        <meshPhysicalMaterial
          color={METAL_BRIGHT}
          metalness={0.98}
          roughness={0.12}
          envMapIntensity={2.0}
        />
      </mesh>

      {/* Bottom — concave aluminum */}
      <mesh geometry={bottomGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={METAL_DARK}
          roughnessMap={metalRoughness}
          normalMap={metalNormal}
          normalScale={new THREE.Vector2(0.25, 0.25)}
          metalness={0.92}
          roughness={0.28}
          envMapIntensity={1.2}
          clearcoat={0.2}
          clearcoatRoughness={0.35}
        />
      </mesh>
    </group>
  );
});

ProductCan.displayName = 'ProductCan';

export default ProductCan;
