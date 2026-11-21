import Link from "next/link";
import { notFound } from "next/navigation";
import { products, displayImage, formatKES, whatsappLink } from "@/lib/data";

// Category detail pages. One large graphic, a brief description, one
// primary button, then the pieces in this category as a simple list
// (no grid — the homepage rule holds here too). Prices are real, from
// the product data. Clean slugs: Dining lives at /collections/dining,
// even though Shopify calls it "bedroom" on the original site.
const CATEGORIES: Record<string, { title: string; category: string; blurb: string; hero: string; hero3d?: string; heroProduct: string }> = {
  "living-room": {
    title: "Living Room",
    category: "Living Room",
    blurb: "Sofas and chairs to sink into at the end of the day.",
    hero: "/images/premium/benin-sofa-premium.jpg",
    hero3d: "/images/premium/benin-sofa-3d.jpg",
    heroProduct: "benin-sofa",
  },
  bedroom: {
    title: "Bedroom",
    category: "Bedroom",
    blurb: "Beds and bedroom sets for deep, quiet sleep.",
    hero: "/images/site/header.png",
    heroProduct: "modern-deluxe-solid-bed-5x6",
  },
  dining: {
    title: "Dining",
    category: "Dining",
    blurb: "Dining tables and sets for family meals and hosting.",
    hero: "/images/premium/modern-majestic-6seater-dining-set-premium.jpg",
    hero3d: "/images/premium/modern-majestic-6seater-dining-set-3d.jpg",
    heroProduct: "modern-majestic-6seater-dining-set",
  },
  tables: {
    title: "Tables",
    category: "Tables",
    blurb: "Coffee tables and TV stands to finish the room.",
    hero: "/images/premium/elegant-coffee-table-white-premium.jpg",
    hero3d: "/images/premium/elegant-coffee-table-white-3d.jpg",
    heroProduct: "elegant-coffee-table-white",
  },
};

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((slug) => ({ slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = CATEGORIES[slug];
  if (!cat) notFound();

  const items = products.filter((p) => p.category === cat.category);
  const others = Object.entries(CATEGORIES).filter(([s]) => s !== slug);

  return (
    <div>
      {/* Hero — one large graphic, brief, primary button. */}
      <section className="bg-peach">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-14 md:pt-16 md:pb-20 text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-brand leading-[1.05]">{cat.title}</h1>
          <p className="mt-5 text-muted leading-relaxed max-w-md mx-auto">{cat.blurb}</p>
          <div className="mt-10">
            <div className="group relative overflow-hidden rounded-[2.5rem] shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.hero}
                alt={cat.title}
                className="w-full aspect-[16/9] object-cover transition-all duration-700 group-hover:scale-[1.02] group-hover:brightness-110"
              />
              {cat.hero3d && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cat.hero3d}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                />
              )}
            </div>
          </div>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-brand text-white px-7 py-3.5 font-bold hover:bg-brand-dark transition-colors"
            >
              Shop on WhatsApp <span aria-hidden>↗</span>
            </a>
            <Link
              href={`/shop?category=${encodeURIComponent(cat.category)}`}
              className="inline-flex items-center gap-2 rounded-full bg-white border border-brand/30 px-7 py-3.5 font-bold hover:border-brand transition-colors"
            >
              View all in shop <span aria-hidden>↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Pieces — one row each, no grid. */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl font-extrabold text-center">
          {items.length} {items.length === 1 ? "piece" : "pieces"} in {cat.title}
        </h2>
        <div className="mt-8 space-y-4">
          {items.map((p) => (
            <Link
              key={p.handle}
              href={`/products/${p.handle}`}
              className="group flex items-center gap-4 bg-white rounded-3xl p-3 pr-5 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayImage(p)}
                alt={p.title}
                loading="lazy"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover shrink-0"
              />
              <span className="flex-1 min-w-0">
                <span className="block font-bold truncate group-hover:text-brand transition-colors">{p.title}</span>
                <span className="block text-muted text-sm mt-1">
                  From {formatKES(p.priceMin)}
                  {p.inStock ? "" : " · Out of stock"}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-brand text-white text-sm font-bold px-4 py-2 group-hover:bg-brand-dark transition-colors">
                View
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="text-sm font-bold text-muted">More categories</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {others.map(([s, o]) => (
              <Link
                key={s}
                href={`/collections/${s}`}
                className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold hover:border-brand hover:text-brand transition-colors"
              >
                {o.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
