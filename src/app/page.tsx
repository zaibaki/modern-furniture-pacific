import Link from "next/link";
import { business, displayImage, productByHandle, whatsappLink } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

// Homepage rule: clean and visual only. Every image here is stamp-free —
// either one of the 4 clean site images or a cropped clean product photo
// (see displayImage in lib/data.ts). No search, no stats, no stock counts,
// no detail text: all of that lives on the shop / detail pages. Each section
// ends in one primary action button.

const hero = productByHandle("nova-sofa-set");
const living = productByHandle("benin-sofa");
// Cozy is sold out, so it is not a featured piece — but its clean photo has
// the calmest background, so it is used here only as the Sofas tile visual.
const sofas = productByHandle("cozy-sofa");

// In-stock, stamp-free pieces only — nothing sold out on the homepage.
const featured = ["benin-sofa", "nova-sofa-set", "urban-nest-sofa-set", "juventus-sofa-set", "modena-sofa-set", "retractable-sofa"]
  .map((h) => productByHandle(h))
  .filter((p): p is NonNullable<typeof p> => !!p && p.inStock);

function PrimaryButton({ href, children, white }: { href: string; children: React.ReactNode; white?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-bold transition-colors ${
        white ? "bg-white text-brand hover:bg-peach" : "bg-brand text-white hover:bg-brand-dark"
      }`}
    >
      {children} <span aria-hidden>↗</span>
    </Link>
  );
}

function CollectionTile({ title, href, img }: { title: string; href: string; img?: string }) {
  return (
    <Link
      href={href}
      className="group relative block rounded-[2rem] overflow-hidden bg-brand text-white min-h-[300px]"
    >
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img}
          alt={title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="relative p-6 flex flex-col justify-end h-full min-h-[300px]">
        <h3 className="text-2xl font-extrabold leading-tight">{title}</h3>
        <span className="mt-4 inline-flex w-fit items-center gap-1 bg-white text-brand text-sm font-bold px-4 py-2 rounded-full">
          Explore <span aria-hidden>»</span>
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <div>
      {/* Hero — one clean visual, one headline, two actions */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[42rem] h-[42rem] bg-brand rounded-full" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-12 grid md:grid-cols-2 gap-10 items-center">
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
            <p className="mt-5 text-muted leading-relaxed max-w-md">
              Sofas, beds, dining sets and tables for Kenyan homes. See them in person, or order on WhatsApp.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <PrimaryButton href="/shop">Shop now</PrimaryButton>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white border border-brand/30 px-7 py-3.5 font-bold hover:border-brand transition-colors"
              >
                Chat on WhatsApp <span aria-hidden>↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Our Collections — visual tiles, one action each */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center">
          Our <span className="text-brand underline decoration-4 underline-offset-8">Collections</span>
        </h2>
        <div className="mt-8 grid sm:grid-cols-2 gap-5">
          <CollectionTile title="Living Room" href="/shop?category=Living%20Room" img={living ? displayImage(living) : undefined} />
          <CollectionTile title="Bedroom" href="/shop?category=Bedroom" img="/images/site/header.png" />
          <CollectionTile title="Sofas" href="/shop?category=Living%20Room" img={sofas ? displayImage(sofas) : undefined} />
          <CollectionTile title="All Furniture" href="/shop" img="/images/site/chair.jpg" />
        </div>
        <div className="mt-8 text-center">
          <PrimaryButton href="/collections">Browse all collections</PrimaryButton>
        </div>
      </section>

      {/* Featured pieces — image, name, price, one action each */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
        <h2 className="text-3xl font-extrabold text-center">Featured pieces</h2>
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((p) => (
            <ProductCard key={p.handle} product={p} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <PrimaryButton href="/shop">View all furniture</PrimaryButton>
        </div>
      </section>

      {/* About — one clean image, two lines, one action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
        <h2 className="text-3xl font-extrabold text-center text-brand">About Us</h2>
        <div className="mt-8 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="leading-relaxed text-muted">
              Modern Furniture Pacific Ltd believes furniture is more than functional. It is the comfort you come home to.
            </p>
            <div className="mt-6">
              <PrimaryButton href="/about">More about us</PrimaryButton>
            </div>
          </div>
          <div className="rounded-[2rem] overflow-hidden bg-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/site/mf237.jpg" alt="Modern Furniture Pacific showroom bedroom" className="w-full aspect-[16/10] object-cover" />
          </div>
        </div>
      </section>

      {/* Visit — one banner, one action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-4">
        <div className="bg-brand text-white rounded-3xl p-6 sm:p-10 text-center">
          <p className="text-2xl sm:text-3xl font-extrabold">See it in person</p>
          <p className="text-white/85 mt-2">Ruiru · Kihunguro · Nyeri</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <PrimaryButton href="/contact" white>
              Visit a showroom
            </PrimaryButton>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/40 px-7 py-3.5 font-bold hover:bg-white/25 transition-colors"
            >
              Chat on WhatsApp <span aria-hidden>↗</span>
            </a>
          </div>
          <p className="text-white/70 text-sm mt-5">Call {business.phone.join(" or ")}</p>
        </div>
      </section>
    </div>
  );
}
