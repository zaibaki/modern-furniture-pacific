import Link from "next/link";
import { business, displayImage, formatKES, productByHandle, whatsappLink } from "@/lib/data";

// Homepage v4 — premium means FEW things, big, with room to breathe.
// Three moments only: hero (1 visual), a two-piece section, a one-piece
// spotlight, then a single closing action. No collection tiles, no card
// grids, no About, no stats, no search. The catalogue lives on /shop and
// the detail lives on the product pages. Every image here is stamp-free
// (see displayImage in lib/data.ts).

const hero = productByHandle("nova-sofa-set");
const pieceA = productByHandle("benin-sofa");
const pieceB = productByHandle("urban-nest-sofa-set");
const spotlight = productByHandle("juventus-sofa-set");

function Piece({ handle, large }: { handle: string; large?: boolean }) {
  const p = productByHandle(handle);
  if (!p) return null;
  return (
    <Link href={`/products/${p.handle}`} className="group block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={displayImage(p)}
        alt={p.title}
        loading="lazy"
        className={`w-full object-cover rounded-[2rem] group-hover:scale-[1.02] transition-transform duration-500 ${large ? "aspect-[16/10]" : "aspect-[4/3]"}`}
      />
      <h3 className="mt-5 text-xl font-extrabold group-hover:text-brand transition-colors">{p.title}</h3>
      <p className="mt-1 text-brand font-extrabold">
        {p.priceMin === p.priceMax ? formatKES(p.priceMin) : `From ${formatKES(p.priceMin)}`}
      </p>
    </Link>
  );
}

export default function Home() {
  return (
    <div>
      {/* Hero — one visual, one headline, two actions, lots of air */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[42rem] h-[42rem] bg-brand rounded-full" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-14 items-center">
          <div className="relative">
            {hero && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayImage(hero)}
                alt={hero.title}
                className="relative rounded-[2.5rem] w-full aspect-[4/3] object-cover shadow-2xl"
              />
            )}
          </div>
          <div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-brand leading-[1.05]">
              Make you<br />feel luxury
            </h1>
            <p className="mt-6 text-muted leading-relaxed max-w-md">
              Sofas, beds, dining sets and tables for Kenyan homes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="rounded-full bg-brand text-white px-7 py-3.5 font-bold hover:bg-brand-dark transition-colors">
                Shop now ↗
              </Link>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white border border-brand/30 px-7 py-3.5 font-bold hover:border-brand transition-colors"
              >
                Chat on WhatsApp ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Two pieces, side by side — the "Modern art" moment */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-brand">Modern art</h2>
        <p className="text-center text-muted mt-3">Two pieces. Made to be lived in.</p>
        <div className="mt-12 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          {pieceA && <Piece handle={pieceA.handle} />}
          {pieceB && <Piece handle={pieceB.handle} />}
        </div>
        <div className="mt-12 text-center">
          <Link href="/shop" className="inline-flex rounded-full border-2 border-brand/40 px-7 py-3 font-bold hover:border-brand transition-colors">
            View All
          </Link>
        </div>
      </section>

      {/* One piece, in focus — the spotlight */}
      {spotlight && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand">{spotlight.title}</h2>
              <p className="text-muted leading-relaxed mt-4 max-w-sm">
                A statement set for the living room. See it in person, or order it on WhatsApp.
              </p>
              <p className="mt-4 text-2xl font-extrabold text-brand">
                {spotlight.priceMin === spotlight.priceMax ? formatKES(spotlight.priceMin) : `From ${formatKES(spotlight.priceMin)}`}
              </p>
              <Link
                href={`/products/${spotlight.handle}`}
                className="mt-7 inline-flex rounded-full bg-brand text-white px-7 py-3.5 font-bold hover:bg-brand-dark transition-colors"
              >
                View Product ↗
              </Link>
            </div>
            <Link href={`/products/${spotlight.handle}`} className="group block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayImage(spotlight)}
                alt={spotlight.title}
                loading="lazy"
                className="w-full aspect-[4/3] object-cover rounded-[2rem] group-hover:scale-[1.02] transition-transform duration-500"
              />
            </Link>
          </div>
        </section>
      )}

      {/* One closing action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20 pb-24">
        <div className="bg-brand text-white rounded-3xl p-8 sm:p-12 text-center">
          <p className="text-2xl sm:text-3xl font-extrabold">See it in person</p>
          <p className="text-white/85 mt-2">Ruiru · Kihunguro · Nyeri</p>
          <Link href="/contact" className="mt-7 inline-flex rounded-full bg-white text-brand px-7 py-3.5 font-bold hover:bg-peach transition-colors">
            Visit a showroom ↗
          </Link>
          <p className="text-white/70 text-sm mt-5">Call {business.phone.join(" or ")}</p>
        </div>
      </section>
    </div>
  );
}
