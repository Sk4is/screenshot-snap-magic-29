import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/data/products';

interface Props {
  products: Product[];
  index: number;
  visible: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function CarouselOverlay({ products, index, visible, onPrev, onNext }: Props) {
  const product = products[index]!;
  const progress = ((index + 1) / products.length) * 100;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-30 transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <button
        onClick={onPrev}
        disabled={!visible}
        aria-label="Previous flavor"
        className="pointer-events-auto absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-3 text-white/60 transition-colors hover:text-white sm:left-6"
      >
        <ChevronLeft size={26} strokeWidth={1.25} />
      </button>
      <button
        onClick={onNext}
        disabled={!visible}
        aria-label="Next flavor"
        className="pointer-events-auto absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-3 text-white/60 transition-colors hover:text-white sm:right-6"
      >
        <ChevronRight size={26} strokeWidth={1.25} />
      </button>

      <div className="absolute bottom-8 left-1/2 w-[min(92vw,620px)] -translate-x-1/2 text-center sm:bottom-10">
        <p className="font-display text-xl font-bold tracking-[0.16em] text-white sm:text-3xl">
          {product.name.toUpperCase()}
        </p>
        <p className="mt-2 font-display text-[11px] font-medium tracking-[0.35em] text-white/55 sm:text-sm">
          {String(index + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
        </p>
        <div className="mx-auto mt-5 h-[2px] w-[min(70vw,420px)] overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${product.gradient.mid}, ${product.gradient.glow})`,
            }}
          />
        </div>
        <p className="mt-6 font-display text-[10px] font-semibold tracking-[0.3em] text-white/35">
          DRAG · SCROLL · CLICK TO SELECT
        </p>
      </div>
    </div>
  );
}
