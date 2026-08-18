import * as THREE from 'three';
import type { Product } from '@/data/products';
import { hexToRgb, mixHex } from '@/utils/color';

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function createCanLabelTexture(product: Product): THREE.CanvasTexture {
  const W = 2048;
  const H = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const dark = mixHex(product.color, '#000000', 0.45);
  const light = mixHex(product.color, '#ffffff', 0.25);
  const isLight = luminance(product.color) > 0.55;
  const isDark = luminance(product.color) < 0.15;
  const ink = isLight ? '#0a0a0a' : '#ffffff';
  const inkSoft = isLight ? 'rgba(10,10,10,0.5)' : 'rgba(255,255,255,0.55)';
  const inkFaint = isLight ? 'rgba(10,10,10,0.2)' : 'rgba(255,255,255,0.25)';

  // Base gradient — vertical, simulating light on cylinder
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, mixHex(product.color, '#000000', 0.15));
  grad.addColorStop(0.12, light);
  grad.addColorStop(0.45, product.color);
  grad.addColorStop(0.75, product.color);
  grad.addColorStop(0.92, dark);
  grad.addColorStop(1, mixHex(product.color, '#000000', 0.3));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle radial light blobs for texture
  ctx.save();
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 6; i++) {
    const bx = W * (0.1 + i * 0.16);
    const by = H * (0.2 + (i % 3) * 0.25);
    const r = W * 0.12;
    const blob = ctx.createRadialGradient(bx, by, 0, bx, by, r);
    blob.addColorStop(0, '#ffffff');
    blob.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = blob;
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Diagonal accent stripes — flavor-specific variation
  ctx.save();
  ctx.globalAlpha = isDark ? 0.08 : 0.06;
  const stripeColor = isLight ? '#000000' : '#ffffff';
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = stripeColor;
    ctx.beginPath();
    const sx = i * 280;
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx + 120, 0);
    ctx.lineTo(sx + 120 - H, H);
    ctx.lineTo(sx - H, H);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // === SKYY FIZZ BRANDING ===
  // The label wraps around the cylinder, so we design for the central 60% being most visible

  // Top brand bar
  ctx.fillStyle = inkSoft;
  ctx.font = '700 44px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // S K Y Y   F I Z Z spaced across top
  const topBrand = 'S K Y Y   F I Z Z';
  for (let copy = 0; copy < 2; copy++) {
    ctx.fillText(topBrand, W * 0.25 + copy * W * 0.5, H * 0.13);
  }

  // Top divider line
  ctx.strokeStyle = inkFaint;
  ctx.lineWidth = 2;
  for (let copy = 0; copy < 2; copy++) {
    const cx = W * 0.25 + copy * W * 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - W * 0.18, H * 0.18);
    ctx.lineTo(cx + W * 0.18, H * 0.18);
    ctx.stroke();
  }

  // === MAIN LOGO: SKYY / FIZZ ===
  const flavorLines = product.name.toUpperCase().split(' ');

  // Draw SKYY
  ctx.fillStyle = ink;
  ctx.font = '900 200px "Space Grotesk", sans-serif';
  for (let copy = 0; copy < 2; copy++) {
    const cx = W * 0.25 + copy * W * 0.5;
    ctx.fillText('SKYY', cx, H * 0.38);
  }

  // Draw FIZZ
  for (let copy = 0; copy < 2; copy++) {
    const cx = W * 0.25 + copy * W * 0.5;
    ctx.fillText('FIZZ', cx, H * 0.52);
  }

  // Flavor name
  ctx.font = '700 72px "Space Grotesk", sans-serif';
  ctx.fillStyle = inkSoft;
  for (let copy = 0; copy < 2; copy++) {
    const cx = W * 0.25 + copy * W * 0.5;
    flavorLines.forEach((line, i) => {
      ctx.fillText(line, cx, H * 0.64 + i * 80);
    });
  }

  // Bottom divider
  ctx.strokeStyle = inkFaint;
  ctx.lineWidth = 2;
  for (let copy = 0; copy < 2; copy++) {
    const cx = W * 0.25 + copy * W * 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - W * 0.18, H * 0.78);
    ctx.lineTo(cx + W * 0.18, H * 0.78);
    ctx.stroke();
  }

  // Bottom text
  ctx.fillStyle = inkSoft;
  ctx.font = '600 32px "Space Grotesk", sans-serif';
  for (let copy = 0; copy < 2; copy++) {
    const cx = W * 0.25 + copy * W * 0.5;
    ctx.fillText('SPARKLING ENERGY', cx, H * 0.84);
  }

  ctx.font = '600 26px "Space Grotesk", sans-serif';
  for (let copy = 0; copy < 2; copy++) {
    const cx = W * 0.25 + copy * W * 0.5;
    ctx.fillText('500 ML  ·  ZERO SUGAR', cx, H * 0.90);
  }

  // Small vertical accent line on sides
  ctx.strokeStyle = withAlpha(product.color === '#161616' ? '#ffffff' : product.color, 0.4);
  ctx.lineWidth = 6;
  for (let copy = 0; copy < 2; copy++) {
    const cx = W * 0.25 + copy * W * 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - W * 0.22, H * 0.25);
    ctx.lineTo(cx - W * 0.22, H * 0.75);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + W * 0.22, H * 0.25);
    ctx.lineTo(cx + W * 0.22, H * 0.75);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

// Condensation normal map — procedural droplets via canvas
export function createCondensationTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Transparent base
  ctx.clearRect(0, 0, size, size);

  // Draw many small droplet circles with subtle shading
  const dropletCount = 180;
  for (let i = 0; i < dropletCount; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 2 + Math.random() * 8;

    // Highlight (top-left of droplet)
    const grad = ctx.createRadialGradient(
      x - r * 0.3, y - r * 0.3, 0,
      x, y, r
    );
    grad.addColorStop(0, 'rgba(255,255,255,0.5)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.15)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Some larger droplets
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 8 + Math.random() * 14;
    const grad = ctx.createRadialGradient(
      x - r * 0.3, y - r * 0.3, 0,
      x, y, r
    );
    grad.addColorStop(0, 'rgba(255,255,255,0.4)');
    grad.addColorStop(0.6, 'rgba(255,255,255,0.1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
