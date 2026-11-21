import Link from "next/link";
import { notFound } from "next/navigation";
import { products, productByHandle, formatKES, whatsappLink, business, premiumImages, parseDescription } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

// One icon per feature, picked by keyword. Small stroke SVGs, no emoji.
function FeatureIcon({ title, body }: { title: string; body: string }) {
  const text = `${title} ${body}`.toLowerCase();
  let path: string;
  if (/support|posture|back|spine/.test(text)) {
    path = "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z";
  } else if (/bounc|motion|partner|disturb|toss|turn/.test(text)) {
    path = "M3 12h4l3 8 4-16 3 8h4";
  } else if (/durab|strong|sturdy|last|quality/.test(text)) {
    path = "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z M9 12l2 2 4-4";
  } else if (/comfort|soft|plush|relax|sleep/.test(text)) {
    path = "M12 21C7 16.5 3 13.3 3 9.3 3 6.4 5.2 4.5 7.5 4.5c1.7 0 3.4 1 4.5 2.6 1.1-1.6 2.8-2.6 4.5-2.6 2.3 0 4.5 1.9 4.5 4.8 0 4-4 7.2-9 11.7z";
  } else if (/wood|mahogany|fabric|material|leather|microfiber|corduroy/.test(text)) {
    path = "M12 3l9 5-9 5-9-5 9-5z M3 13l9 5 9-5";
  } else if (/space|room|spacious|seat/.test(text)) {
    path = "M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5";
  } else if (/style|design|elegan|luxury|modern/.test(text)) {
    path = "M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3L12 3z M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z";
  } else {
    path = "M5 12l5 5 9-11";
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0" aria-hidden>
      <path d={path} />
    </svg>
  );
}

// Product detail page, redesigned for a customer scanning for facts:
// every block of data lives in its own card, so price, options,
// description and practical details can each be read at a glance.
// Gallery uses the premium studio image + 3D view where Codex has made
// them; other pieces still show the seller's photos until their turn
// in the generation queue, with the honest note underneath.

const CATEGORY_SLUG: Record<string, string> = {
  "Living Room": "living-room",
  Bedroom: "bedroom",
  Dining: "dining",
  Tables: "tables",
};

export function generateStaticParams() {
  return products.map((p) => ({ handle: p.handle }));
}

export default async function ProductPage(props: PageProps<"/products/[handle]">) {
  const { handle } = await props.params;
  const product = productByHandle(handle);
  if (!product) notFound();

  const premium = premiumImages(product);
  const { intro, features } = parseDescription(product);
  const related = products
    .filter((p) => p.handle !== product.handle && p.category === product.category)
    .slice(0, 4);

  // Category and type are the same value for most pieces ("Living Room ·
  // Living Room") — show it once.
  const eyebrow = product.type && product.type !== product.category
    ? `${product.category} · ${product.type}`
    : product.category;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-sm text-muted">
        <Link href="/" className="hover:text-brand">Home</Link> /{" "}
        <Link href="/shop" className="hover:text-brand">Shop</Link> /{" "}
        <Link href={`/collections/${CATEGORY_SLUG[product.category] ?? ""}`} className="hover:text-brand">{product.category}</Link>
      </p>

      <div className="mt-6 grid lg:grid-cols-2 gap-8 items-start">
        {/* Gallery card */}
        <div className="bg-white rounded-[2rem] p-4 shadow-sm">
          <div className="group relative rounded-[1.5rem] overflow-hidden bg-peach aspect-[4/3]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={premium ? premium.hero : product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.02] group-hover:brightness-110"
            />
            {premium && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={premium.view3d}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
            )}
          </div>
          {premium ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={premium.hero} alt={`${product.title} studio photo`} loading="lazy" className="rounded-2xl aspect-[4/3] object-cover bg-peach" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={premium.view3d} alt={`${product.title} 3D view`} loading="lazy" className="rounded-2xl aspect-[4/3] object-cover bg-peach" />
            </div>
          ) : (
            product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.images.slice(1, 5).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt={`${product.title} photo ${i + 2}`} loading="lazy"
                    className="rounded-2xl aspect-square object-cover bg-peach" />
                ))}
              </div>
            )
          )}
          <p className="text-xs text-muted mt-4">
            {premium
              ? "Studio photo and 3D view made from the seller's photos. Hover the main photo to see the 3D view."
              : "Photos are the seller's own showroom photos, as listed on modernfurniturepacificltd.com. A premium studio version of this piece is being made. Ask on WhatsApp for more photos or a video before you buy."}
          </p>
        </div>

        {/* Right column: one card per question a customer asks. */}
        <div className="space-y-5">
          {/* Title + availability */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm">
            <p className="text-xs tracking-widest uppercase text-muted">{eyebrow}</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold mt-2 leading-tight">{product.title}</h1>
            <p className="mt-3 flex flex-wrap gap-2">
              {product.inStock
                ? <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">● In stock</span>
                : <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">● Sold out — ask about restock</span>}
              {product.isNew && <span className="bg-brand text-white text-sm font-bold px-3 py-1 rounded-full">New arrival</span>}
              {product.isBestSeller && <span className="bg-ink text-white text-sm font-bold px-3 py-1 rounded-full">Best seller</span>}
            </p>
          </div>

          {/* Price + options */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm">
            <p className="text-sm font-bold text-muted">Price</p>
            <p className="mt-1 text-3xl font-extrabold text-brand">
              {product.priceMin === product.priceMax ? formatKES(product.priceMin) : `From ${formatKES(product.priceMin)}`}
            </p>
            {product.priceMax > product.priceMin && (
              <p className="text-sm text-muted mt-1">Up to {formatKES(product.priceMax)} depending on size / option.</p>
            )}
            <p className="font-bold mt-5 mb-3">Size / option</p>
            <div className="space-y-2">
              {product.variants.map((v) => (
                <div
                  key={v.option}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${v.available ? "border-brand/40 bg-cream" : "border-peach-dark bg-peach text-muted"}`}
                >
                  <span className={`font-semibold ${v.available ? "" : "line-through"}`}>{v.option}</span>
                  <span className="flex items-center gap-3 shrink-0">
                    <span className="font-bold">{formatKES(v.price)}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${v.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {v.available ? "Available" : "Sold out"}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* About this piece — short intro, then one icon row per feature,
              never a wall of text. */}
          {(intro || features.length > 0) && (
            <div className="bg-white rounded-[2rem] p-6 shadow-sm">
              <p className="text-sm font-bold text-muted">About this piece</p>
              {intro && <p className="mt-2 leading-relaxed text-ink/80">{intro}</p>}
              {features.length > 0 && (
                <ul className="mt-4 space-y-4">
                  {features.map((f, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-9 h-9 shrink-0 rounded-full bg-peach text-brand flex items-center justify-center">
                        <FeatureIcon title={f.title} body={f.body} />
                      </span>
                      <span>
                        {f.title && <span className="block font-bold">{f.title}</span>}
                        <span className="block text-sm leading-relaxed text-muted mt-0.5">{f.body}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Practical details */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm">
            <p className="text-sm font-bold text-muted">Good to know</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted">Category</dt><dd className="font-semibold text-right">{product.category}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted">Availability</dt><dd className="font-semibold text-right">{product.inStock ? "In stock" : "Sold out"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted">Pickup</dt><dd className="font-semibold text-right">Ruiru · Kihunguro · Nyeri</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted">Delivery</dt><dd className="font-semibold text-right">Ask on WhatsApp for a quote</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted">Returns</dt><dd className="font-semibold text-right">Within 7 days</dd></div>
            </dl>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={whatsappLink(product)} target="_blank" rel="noreferrer"
              className="flex-1 text-center rounded-full bg-brand text-white px-6 py-3.5 font-bold hover:bg-brand-dark transition-colors">
              Order on WhatsApp →
            </a>
            <a href={`tel:${business.phone[0].replace(/\s/g, "")}`}
              className="flex-1 text-center rounded-full border border-brand text-brand px-6 py-3.5 font-bold hover:bg-brand hover:text-white transition-colors">
              Call {business.phone[0]}
            </a>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="pt-14">
          <h2 className="text-2xl font-extrabold">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p) => <ProductCard key={p.handle} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
