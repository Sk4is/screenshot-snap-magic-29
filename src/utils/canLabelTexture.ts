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

/** deterministic per-flavor pseudo random */
function rng(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const W = 2560;
const H = 1280;
const PANEL = W / 2;

/* ------------------------------------------------------------------ */
/* flavor graphic — a unique printed pattern per can                   */
/* ------------------------------------------------------------------ */
function drawPattern(
  ctx: CanvasRenderingContext2D,
  product: Product,
  cx: number,
  ink: string
) {
  const rand = rng(product.id.length * 37 + product.name.charCodeAt(0));
  ctx.save();
  ctx.beginPath();
  ctx.rect(cx - PANEL / 2, 0, PANEL, H);
  ctx.clip();

  switch (product.pattern) {
    case 'rays': {
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = product.accent;
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, H * 0.42);
        ctx.lineTo(cx + Math.cos(a) * 1800, H * 0.42 + Math.sin(a) * 1800);
        ctx.lineTo(cx + Math.cos(a + 0.06) * 1800, H * 0.42 + Math.sin(a + 0.06) * 1800);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'stripes': {
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = product.accent;
      for (let i = -4; i < 14; i++) {
        ctx.beginPath();
        const sx = cx - PANEL / 2 + i * 110;
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx + 46, 0);
        ctx.lineTo(sx + 46 - H * 0.5, H);
        ctx.lineTo(sx - H * 0.5, H);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'bubbles': {
      for (let i = 0; i < 90; i++) {
        const x = cx - PANEL / 2 + rand() * PANEL;
        const y = rand() * H;
        const r = 6 + rand() * 46;
        ctx.globalAlpha = 0.06 + rand() * 0.12;
        ctx.strokeStyle = product.accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }
    case 'waves': {
      ctx.globalAlpha = 0.16;
      ctx.strokeStyle = product.accent;
      ctx.lineWidth = 7;
      for (let i = 0; i < 14; i++) {
        ctx.beginPath();
        const y0 = i * 100 - 40;
        for (let x = -PANEL / 2; x <= PANEL / 2; x += 16) {
          const y = y0 + Math.sin((x / PANEL) * Math.PI * 4 + i) * 26;
          if (x === -PANEL / 2) ctx.moveTo(cx + x, y);
          else ctx.lineTo(cx + x, y);
        }
        ctx.stroke();
      }
      break;
    }
    case 'grid': {
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2;
      for (let x = -PANEL / 2; x <= PANEL / 2; x += 64) {
        ctx.beginPath();
        ctx.moveTo(cx + x, 0);
        ctx.lineTo(cx + x, H);
        ctx.stroke();
      }
      for (let y = 0; y <= H; y += 64) {
        ctx.beginPath();
        ctx.moveTo(cx - PANEL / 2, y);
        ctx.lineTo(cx + PANEL / 2, y);
        ctx.stroke();
      }
      break;
    }
    case 'splash':
    default: {
      for (let i = 0; i < 40; i++) {
        const x = cx - PANEL / 2 + rand() * PANEL;
        const y = rand() * H;
        const r = 20 + rand() * 130;
        ctx.globalAlpha = 0.05 + rand() * 0.09;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, product.accent);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* small print helpers                                                 */
/* ------------------------------------------------------------------ */
function drawBarcode(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.fillStyle = '#f4f4f4';
  ctx.fillRect(x - 10, y - 10, w + 20, h + 42);
  ctx.fillStyle = '#0a0a0a';
  const rand = rng(7);
  let cx = x;
  while (cx < x + w) {
    const bw = 2 + Math.round(rand() * 5);
    if (rand() > 0.35) ctx.fillRect(cx, y, bw, h);
    cx += bw + 2 + Math.round(rand() * 3);
  }
  ctx.font = '600 20px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('5 901234 123457', x + w / 2, y + h + 6);
  ctx.restore();
}

function drawRecycle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.translate(x, y);
  for (let i = 0; i < 3; i++) {
    ctx.rotate((Math.PI * 2) / 3);
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, r * 0.5);
    ctx.lineTo(0, -r * 0.75);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.75);
    ctx.lineTo(r * 0.18, -r * 0.45);
    ctx.stroke();
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* main label                                                          */
/* ------------------------------------------------------------------ */
export function createCanLabelTexture(product: Product): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const dark = mixHex(product.color, '#000000', 0.5);
  const light = mixHex(product.color, '#ffffff', 0.28);
  const isLight = luminance(product.color) > 0.55;
  const ink = isLight ? '#0b0b0b' : '#ffffff';
  const inkSoft = isLight ? 'rgba(10,10,10,0.62)' : 'rgba(255,255,255,0.66)';
  const inkFaint = isLight ? 'rgba(10,10,10,0.28)' : 'rgba(255,255,255,0.3)';

  // base wrap gradient (cylinder shading is horizontal in UV space)
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, mixHex(product.color, '#000000', 0.22));
  grad.addColorStop(0.1, light);
  grad.addColorStop(0.45, product.color);
  grad.addColorStop(0.72, product.color);
  grad.addColorStop(0.93, dark);
  grad.addColorStop(1, mixHex(product.color, '#000000', 0.38));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // secondary accent wash from the bottom
  const wash = ctx.createLinearGradient(0, H, 0, H * 0.35);
  wash.addColorStop(0, withAlpha(product.accent, 0.55));
  wash.addColorStop(1, withAlpha(product.accent, 0));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);

  for (let copy = 0; copy < 2; copy++) {
    const cx = PANEL * 0.5 + copy * PANEL;
    drawPattern(ctx, product, cx, ink);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // top rail: brand line
    ctx.fillStyle = inkSoft;
    ctx.font = '700 30px "Space Grotesk", sans-serif';
    ctx.fillText('R E A L   F R U I T   E N E R G Y', cx, H * 0.075);
    ctx.strokeStyle = inkFaint;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - PANEL * 0.3, H * 0.105);
    ctx.lineTo(cx + PANEL * 0.3, H * 0.105);
    ctx.stroke();

    // === giant vertical SKYY FIZZ logo (reads bottom-to-top, italic) ===
    ctx.save();
    ctx.translate(cx, H * 0.44);
    ctx.rotate(-Math.PI / 2);
    ctx.font = 'italic 900 236px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillText('SKYY', 8, -104);
    ctx.fillText('FIZZ', 8, 138);
    ctx.fillStyle = ink;
    ctx.fillText('SKYY', 0, -112);
    ctx.fillText('FIZZ', 0, 130);
    ctx.restore();

    // flavor name
    ctx.fillStyle = ink;
    ctx.font = '800 74px "Space Grotesk", sans-serif';
    ctx.fillText(product.name.toUpperCase(), cx, H * 0.68);

    // small rule + tagline
    ctx.strokeStyle = inkFaint;
    ctx.beginPath();
    ctx.moveTo(cx - 70, H * 0.715);
    ctx.lineTo(cx + 70, H * 0.715);
    ctx.stroke();
    ctx.fillStyle = inkSoft;
    ctx.font = '600 30px "Space Grotesk", sans-serif';
    ctx.fillText(product.canTagline.toUpperCase(), cx, H * 0.75);

    // volume
    ctx.fillStyle = ink;
    ctx.font = '700 48px "Space Grotesk", sans-serif';
    ctx.fillText('500 ml', cx, H * 0.805);

    // nutrition highlight chips
    const chips = [`0g SUGAR`, `${product.caffeineMg}mg NATURAL CAFFEINE`, 'SPARKLING WATER'];
    ctx.font = '700 24px "Space Grotesk", sans-serif';
    let chipX = cx - 300;
    chips.forEach((c) => {
      const w = ctx.measureText(c).width + 34;
      ctx.strokeStyle = inkFaint;
      ctx.lineWidth = 2;
      ctx.strokeRect(chipX, H * 0.845, w, 46);
      ctx.fillStyle = inkSoft;
      ctx.textAlign = 'left';
      ctx.fillText(c, chipX + 17, H * 0.868);
      ctx.textAlign = 'center';
      chipX += w + 16;
    });

    // keywords row
    ctx.fillStyle = inkFaint;
    ctx.font = '600 22px "Space Grotesk", sans-serif';
    ctx.fillText(product.keywords.join('  ·  ').toUpperCase(), cx, H * 0.925);

    // legal micro print
    ctx.font = '400 15px "Space Grotesk", sans-serif';
    ctx.fillStyle = inkFaint;
    const legal = [
      `INGREDIENTS: CARBONATED WATER, ${product.canIngredients.toUpperCase()}, CITRIC ACID, NATURAL FLAVORS,`,
      'CAFFEINE (FROM GREEN COFFEE BEAN), SUCRALOSE, PRESERVATIVE (E211), COLOR (E163).',
      'NOT RECOMMENDED FOR CHILDREN OR PREGNANT WOMEN. HIGH CAFFEINE CONTENT. BEST SERVED ICE COLD.',
      'PRODUCED IN THE EU  ·  SKYYFIZZ.COM  ·  @SKYYFIZZ  ·  DEPOSIT WHERE APPLICABLE.',
    ];
    legal.forEach((line, i) => ctx.fillText(line, cx, H * 0.955 + i * 20));

    // side print: barcode + recycling on the panel edge (the "back")
    ctx.save();
    ctx.translate(cx + PANEL * 0.38, H * 0.5);
    ctx.rotate(-Math.PI / 2);
    drawBarcode(ctx, -120, -46, 240, 92);
    ctx.restore();
    drawRecycle(ctx, cx - PANEL * 0.4, H * 0.86, 26, inkSoft);
    ctx.save();
    ctx.fillStyle = inkFaint;
    ctx.font = '600 18px "Space Grotesk", sans-serif';
    ctx.fillText('ALU', cx - PANEL * 0.4, H * 0.905);
    ctx.restore();
  }

  // printed micro-scratches / plate texture across the whole wrap
  const rand = rng(product.name.length + 11);
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = '#ffffff';
  for (let i = 0; i < 500; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const len = 6 + rand() * 46;
    ctx.lineWidth = rand() * 1.3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + (rand() - 0.5) * 3);
    ctx.stroke();
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  return texture;
}

/* ------------------------------------------------------------------ */
/* condensation: alpha droplets + matching roughness + normal          */
/* ------------------------------------------------------------------ */
interface Droplet {
  x: number;
  y: number;
  r: number;
  trail: number;
}

function dropletField(size: number): Droplet[] {
  const rand = rng(4242);
  const drops: Droplet[] = [];
  // dense mist everywhere
  for (let i = 0; i < 900; i++) {
    drops.push({ x: rand() * size, y: rand() * size, r: 1.4 + rand() * 3.4, trail: 0 });
  }
  // medium droplets
  for (let i = 0; i < 260; i++) {
    drops.push({ x: rand() * size, y: rand() * size, r: 4 + rand() * 7, trail: 0 });
  }
  // fat droplets gathered near the top and bottom of the can
  for (let i = 0; i < 150; i++) {
    const top = rand() > 0.5;
    const y = top ? rand() * size * 0.24 : size * (0.76 + rand() * 0.24);
    drops.push({ x: rand() * size, y, r: 8 + rand() * 15, trail: rand() > 0.55 ? 20 + rand() * 90 : 0 });
  }
  // a few sliding droplets with long trails
  for (let i = 0; i < 26; i++) {
    drops.push({
      x: rand() * size,
      y: size * (0.2 + rand() * 0.55),
      r: 9 + rand() * 12,
      trail: 90 + rand() * 220,
    });
  }
  return drops;
}

const SIZE = 1536;
let cachedDrops: Droplet[] | null = null;
const drops = () => (cachedDrops ??= dropletField(SIZE));

/** RGB highlight + alpha mask used as the wet overlay layer */
export function createCondensationTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, SIZE, SIZE);

  for (const d of drops()) {
    if (d.trail > 0) {
      const t = ctx.createLinearGradient(d.x, d.y - d.trail, d.x, d.y);
      t.addColorStop(0, 'rgba(255,255,255,0)');
      t.addColorStop(1, 'rgba(255,255,255,0.22)');
      ctx.fillStyle = t;
      ctx.fillRect(d.x - d.r * 0.34, d.y - d.trail, d.r * 0.68, d.trail);
    }
    const g = ctx.createRadialGradient(d.x - d.r * 0.35, d.y - d.r * 0.4, 0, d.x, d.y, d.r);
    g.addColorStop(0, 'rgba(255,255,255,0.92)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.34)');
    g.addColorStop(0.8, 'rgba(255,255,255,0.1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
    // dark contact shadow at the bottom edge of bigger drops
    if (d.r > 5) {
      ctx.strokeStyle = 'rgba(0,0,0,0.22)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r * 0.94, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

/** droplets read as glossy spots on a slightly satin aluminium surface */
export function createCanRoughnessTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#8f8f8f';
  ctx.fillRect(0, 0, SIZE, SIZE);

  // brushed micro variation
  const rand = rng(99);
  ctx.globalAlpha = 0.25;
  for (let i = 0; i < 2200; i++) {
    const x = rand() * SIZE;
    const y = rand() * SIZE;
    ctx.fillStyle = rand() > 0.5 ? '#a6a6a6' : '#7a7a7a';
    ctx.fillRect(x, y, 1 + rand() * 26, 1);
  }
  ctx.globalAlpha = 1;

  for (const d of drops()) {
    if (d.trail > 0) {
      ctx.fillStyle = 'rgba(40,40,40,0.55)';
      ctx.fillRect(d.x - d.r * 0.34, d.y - d.trail, d.r * 0.68, d.trail);
    }
    const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r);
    g.addColorStop(0, '#141414');
    g.addColorStop(0.75, '#242424');
    g.addColorStop(1, '#8f8f8f');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

/** normal map so droplets catch the light with real relief */
export function createCanNormalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, SIZE, SIZE);

  for (const d of drops()) {
    const g = ctx.createLinearGradient(d.x - d.r, d.y - d.r, d.x + d.r, d.y + d.r);
    g.addColorStop(0, 'rgba(40,40,255,0.85)');
    g.addColorStop(0.5, 'rgba(128,128,255,0)');
    g.addColorStop(1, 'rgba(215,215,255,0.85)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}
