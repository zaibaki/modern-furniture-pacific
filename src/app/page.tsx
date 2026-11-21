import Link from "next/link";
import { products, business, formatKES, productByHandle } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

const heroSofa = productByHandle("modern-celine-chester-7seater-sofa-3-2-1-1");
const living = productByHandle("modern-copenhagen-7seater-corduroy-sofa");
const bedroom = productByHandle("modern-deluxe-solid-bed-5x6");
const dining = productByHandle("regal-oval-mahogany-dining-set");
const tables = productByHandle("elegant-coffee-table-white");
const tv = productByHandle("modern-black-peachy-tv-stands");
const bliss = productByHandle("7-seater-semi-recliner-back");

const newArrivals = products.filter((p) => p.isNew).slice(0, 8);
const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 8);
const inStock = products.filter((p) => p.inStock).length;

function CollectionTile({
  title, count, href, img, tall,
}: { title: string; count: number; href: string; img?: string; tall?: boolean }) {
  return (
    <Link href={href}
      className={`group relative block rounded-[2rem] overflow-hidden bg-brand text-white ${tall ? "row-span-2 min-h-[420px]" : "min-h-[240px]"}`}>
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt={title} loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/90 via-brand/30 to-transparent" />
      <div className="relative p-6 flex flex-col justify-end h-full">
        <h3 className="text-2xl font-extrabold leading-tight">{title}</h3>
        <p className="text-white/85 text-sm mt-1">{count} {count === 1 ? "piece" : "pieces"}</p>
        <span className="mt-4 inline-flex w-fit items-center gap-1 bg-white text-brand text-sm font-bold px-4 py-2 rounded-full group-hover:gap-2 transition-all">
          Explore more »
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <div>
      {/* Hero — template: orange curve, sofa left, headline right */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[42rem] h-[42rem] bg-brand rounded-full opacity-100" aria-hidden />
        <div className="absolute top-0 right-0 w-2/3 h-full bg-peach -skew-y-3 origin-top-right" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8 grid md:grid-cols-2 gap-10 items-center">
          <div className="relative">
            {heroSofa && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroSofa.images[0]} alt={heroSofa.title}
                className="relative rounded-[2.5rem] w-full aspect-[4/3] object-cover shadow-2xl" />
            )}
            <p className="relative mt-4 inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm font-semibold shadow">
              {inStock} of {products.length} pieces in stock now
            </p>
          </div>
          <div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-brand leading-[1.05]">Make you<br />feel luxury</h1>
            <p className="mt-5 text-muted leading-relaxed max-w-md">
              Sofas, beds, dining sets and tables for Kenyan homes, from {formatKES(6000)} to {formatKES(260000)}.
              See them in person at our showrooms in Ruiru, Kihunguro and Nyeri, or order on WhatsApp.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/shop" className="rounded-full bg-brand text-white px-6 py-3 font-bold hover:bg-brand-dark transition-colors">Shop now ↗</Link>
              <Link href="/collections" className="rounded-full bg-white border border-brand/30 px-6 py-3 font-bold hover:border-brand transition-colors">Browse collections</Link>
            </div>
            <form action="/shop" method="get" className="mt-6 flex max-w-md bg-white rounded-full p-1.5 shadow-sm border border-peach-dark">
              <input name="q" placeholder="What are you looking for?" aria-label="Search furniture"
                className="flex-1 min-w-0 bg-transparent px-4 outline-none text-sm" />
              <button className="rounded-full bg-brand text-white px-5 py-2 text-sm font-bold">Search</button>
            </form>
            <dl className="mt-8 grid grid-cols-3 max-w-md divide-x divide-peach-dark text-center">
              <div><dt className="sr-only">Products</dt><dd className="text-2xl font-extrabold text-brand">{products.length}</dd><dd className="text-xs text-muted">Products</dd></div>
              <div><dt className="sr-only">Showrooms</dt><dd className="text-2xl font-extrabold text-brand">3</dd><dd className="text-xs text-muted">Showrooms</dd></div>
              <div><dt className="sr-only">Delivery</dt><dd className="text-2xl font-extrabold text-brand">7 days</dd><dd className="text-xs text-muted">Return policy</dd></div>
            </dl>
          </div>
        </div>
      </section>

      {/* Our Collections — template grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center">Our <span className="text-brand underline decoration-4 underline-offset-8">Collections</span></h2>
        <div className="mt-8 grid md:grid-cols-2 gap-5">
          <CollectionTile title="Living Room" count={18} href="/shop?category=Living%20Room" img={living?.images[0]} />
          <CollectionTile title="Bedroom" count={9} href="/shop?category=Bedroom" img={bedroom?.images[0]} tall />
          <CollectionTile title="Dining Sets" count={5} href="/shop?category=Dining" img={dining?.images[0]} />
        </div>
        <div className="mt-5 grid sm:grid-cols-3 gap-5">
          <CollectionTile title="Tables" count={3} href="/shop?category=Tables" img={tables?.images[0]} />
          <CollectionTile title="TV Stands" count={1} href={`/products/${tv?.handle}`} img={tv?.images[0]} />
          <CollectionTile title="Best Sellers" count={17} href="/shop?badge=best" img={bliss?.images[0]} />
        </div>
      </section>

      {/* New arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-extrabold">New arrivals</h2>
          <Link href="/shop?badge=new" className="text-brand font-bold text-sm whitespace-nowrap">View all →</Link>
        </div>
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {newArrivals.map((p) => <ProductCard key={p.handle} product={p} />)}
        </div>
      </section>

      {/* Best sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-extrabold">Best sellers</h2>
          <Link href="/shop?badge=best" className="text-brand font-bold text-sm whitespace-nowrap">View all →</Link>
        </div>
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {bestSellers.map((p) => <ProductCard key={p.handle} product={p} />)}
        </div>
      </section>

      {/* About — template About Us block */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
        <h2 className="text-3xl font-extrabold text-center text-brand">About Us</h2>
        <div className="mt-8 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="leading-relaxed text-muted">
              Modern Furniture Pacific Ltd believes furniture is more than functional. It is the comfort
              you come home to, the table your family gathers around, and the bed you rest in after a long day.
            </p>
            <p className="leading-relaxed text-muted mt-4">
              Visit any of our three showrooms — {business.showrooms.map((s) => `${s.name} (${s.location})`).join(", ")} —
              call {business.phone.join(" or ")}, or message us on WhatsApp and we will help you choose the right piece.
            </p>
            <Link href="/about" className="mt-6 inline-flex rounded-full bg-brand text-white px-5 py-2.5 font-bold hover:bg-brand-dark transition-colors">Explore more ↗</Link>
          </div>
          <div className="rounded-[2rem] overflow-hidden bg-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/site/header.png" alt="Modern Furniture Pacific showroom bedroom" className="w-full aspect-[16/9] object-cover" />
          </div>
        </div>
      </section>

      {/* Showrooms / trust */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-14">
        <div className="grid sm:grid-cols-3 gap-5">
          {business.showrooms.map((s) => (
            <div key={s.name} className="bg-white rounded-3xl border border-peach p-6">
              <p className="font-extrabold">{s.name}</p>
              <p className="text-muted text-sm mt-1">{s.location}</p>
              <p className="text-sm mt-3">{business.hours}</p>
              <a href={`https://wa.me/254716335555?text=${encodeURIComponent(`Hi, I'd like to visit the ${s.name} showroom.`)}`} target="_blank" rel="noreferrer" className="text-brand font-bold text-sm mt-3 inline-block">Chat on WhatsApp →</a>
            </div>
          ))}
        </div>
        <div className="mt-5 bg-brand text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-2xl font-extrabold">Free in-store pickup</p>
            <p className="text-white/85 text-sm mt-1">Order online, collect at any showroom. Delivery available across Kenya.</p>
          </div>
          <Link href="/shop" className="shrink-0 rounded-full bg-white text-brand px-6 py-3 font-bold">Shop now ↗</Link>
        </div>
      </section>
    </div>
  );
}
