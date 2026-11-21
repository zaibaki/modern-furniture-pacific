import Link from "next/link";
import { notFound } from "next/navigation";
import { products, productByHandle, formatKES, whatsappLink, business } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export function generateStaticParams() {
  return products.map((p) => ({ handle: p.handle }));
}

export default async function ProductPage(props: PageProps<"/products/[handle]">) {
  const { handle } = await props.params;
  const product = productByHandle(handle);
  if (!product) notFound();

  const related = products
    .filter((p) => p.handle !== product.handle && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-sm text-muted">
        <Link href="/" className="hover:text-brand">Home</Link> /{" "}
        <Link href="/shop" className="hover:text-brand">Shop</Link> /{" "}
        <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-brand">{product.category}</Link>
      </p>

      <div className="mt-6 grid md:grid-cols-2 gap-10">
        <div>
          <div className="rounded-[2rem] overflow-hidden bg-peach aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.slice(1, 5).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt={`${product.title} photo ${i + 2}`} loading="lazy"
                  className="rounded-2xl aspect-square object-cover bg-peach" />
              ))}
            </div>
          )}
          <p className="text-xs text-muted mt-4">
            Photos are the seller&apos;s own showroom photos, as listed on modernfurniturepacificltd.com.
            Ask on WhatsApp for more photos or a video before you buy.
          </p>
        </div>

        <div>
          <p className="text-xs tracking-widest uppercase text-muted">{product.category} · {product.type}</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-2 leading-tight">{product.title}</h1>
          <p className="mt-4 text-3xl font-extrabold text-brand">
            {product.priceMin === product.priceMax ? formatKES(product.priceMin) : `From ${formatKES(product.priceMin)}`}
          </p>
          {product.priceMax > product.priceMin && (
            <p className="text-sm text-muted mt-1">Up to {formatKES(product.priceMax)} depending on size / option.</p>
          )}
          <p className="mt-3">
            {product.inStock
              ? <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">● In stock</span>
              : <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">● Sold out — ask about restock</span>}
            {product.isNew && <span className="ml-2 bg-brand text-white text-sm font-bold px-3 py-1 rounded-full">New arrival</span>}
            {product.isBestSeller && <span className="ml-2 bg-ink text-white text-sm font-bold px-3 py-1 rounded-full">Best seller</span>}
          </p>

          {product.description && <p className="mt-5 leading-relaxed text-muted">{product.description}</p>}

          <div className="mt-6">
            <p className="font-bold mb-2">Size / option</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <span key={v.option}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold ${v.available ? "border-brand/40 bg-white" : "border-peach-dark bg-peach text-muted line-through"}`}>
                  {v.option} — {formatKES(v.price)}{v.available ? "" : " (sold out)"}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a href={whatsappLink(product)} target="_blank" rel="noreferrer"
              className="flex-1 text-center rounded-full bg-brand text-white px-6 py-3.5 font-bold hover:bg-brand-dark transition-colors">
              Order on WhatsApp →
            </a>
            <a href={`tel:${business.phone[0].replace(/\s/g, "")}`}
              className="flex-1 text-center rounded-full border border-brand text-brand px-6 py-3.5 font-bold hover:bg-brand hover:text-white transition-colors">
              Call {business.phone[0]}
            </a>
          </div>
          <p className="text-sm text-muted mt-4">
            Free in-store pickup at Ruiru, Kihunguro or Nyeri. Delivery available — ask on WhatsApp for a quote to your area.
            Returns within 7 days, as listed on the original store.
          </p>
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
