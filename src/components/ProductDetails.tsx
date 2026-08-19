import type { Product } from '@/data/products';

/**
 * Editorial product-detail experience that scrolls normally after the
 * cinematic timeline releases. The 3D can stays alive above it.
 */
export default function ProductDetails({ product }: { product: Product }) {
  const rows: { k: string; v: string; note?: string }[] = [
    { k: 'FLAVOR PROFILE', v: product.profile, note: product.profileNote },
    { k: 'ENERGY', v: 'Natural caffeine', note: 'From coffee beans, smooth and sustained.' },
    { k: 'SUGAR', v: '0 g', note: 'Full flavor, zero sugar.' },
    { k: 'BASE', v: 'Sparkling water', note: 'Light carbonation, crisp finish.' },
    { k: 'FORMAT', v: '500 ml', note: 'Slim aluminium can.' },
  ];

  return (
    <div className="relative z-20 text-white">
      {/* intro block — sits under the can as the cinematic releases */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-[18vh] lg:grid-cols-2">
        <div>
          <p
            className="font-display text-[11px] font-bold tracking-[0.32em]"
            style={{ color: product.gradient.glow }}
          >
            SKYY FIZZ · REAL FRUIT ENERGY
          </p>
          <h2 className="editorial-title mt-6 text-[clamp(2.6rem,6vw,5rem)]">
            {product.words[0]}
            <br />
            {product.words[1]}
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/70">{product.detail}</p>
        </div>
        <dl className="self-end border-t border-white/15">
          {rows.map((r) => (
            <div key={r.k} className="grid grid-cols-[1fr_1.4fr] gap-4 border-b border-white/10 py-5">
              <dt className="font-display text-[10px] font-semibold tracking-[0.24em] text-white/45">
                {r.k}
              </dt>
              <dd>
                <p className="font-display text-lg font-bold tracking-tight">{r.v}</p>
                {r.note && <p className="mt-1 text-sm text-white/50">{r.note}</p>}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* full ingredient breakdown */}
      <section className="mx-auto max-w-6xl px-6 pb-[14vh]">
        <h3 className="font-display text-[11px] font-bold tracking-[0.32em] text-white/45">
          WHAT IS INSIDE
        </h3>
        <div className="mt-10 grid grid-cols-1 gap-px bg-white/10 sm:grid-cols-2">
          {product.ingredients.map((ing, i) => (
            <article key={ing.label} className="bg-black/40 p-8 backdrop-blur-sm">
              <p
                className="font-display text-[10px] font-bold tracking-[0.24em]"
                style={{ color: product.gradient.glow }}
              >
                {String(i + 1).padStart(2, '0')}
              </p>
              <h4 className="editorial-title mt-4 whitespace-pre-line text-[clamp(1.6rem,3vw,2.4rem)]">
                {ing.title}
              </h4>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">{ing.copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* stats */}
      <section className="mx-auto max-w-6xl px-6 pb-[16vh]">
        <div className="grid grid-cols-2 gap-y-12 border-y border-white/15 py-14 lg:grid-cols-4">
          {product.stats.map((s) => (
            <div key={s.label}>
              <p
                className="editorial-title text-[clamp(2rem,4.5vw,3.6rem)]"
                style={{ color: product.gradient.glow }}
              >
                {s.value}
              </p>
              <p className="mt-3 font-display text-[10px] font-semibold tracking-[0.26em] text-white/45">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* closing composition */}
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 pb-[12vh] text-center">
        <p className="font-display text-[11px] font-bold tracking-[0.4em] text-white/45">SKYY FIZZ</p>
        <h3 className="editorial-title mt-6 text-[clamp(2.6rem,9vw,7rem)]">
          {product.words[0]} {product.words[1]}
        </h3>
        <p className="mt-6 font-display text-[11px] font-semibold tracking-[0.34em] text-white/55">
          REAL FRUIT ENERGY
        </p>
        <p className="mt-14 font-display text-[10px] font-semibold tracking-[0.3em] text-white/35">
          SCROLL UP TO DISCOVER ANOTHER FLAVOR
        </p>
      </section>
    </div>
  );
}
