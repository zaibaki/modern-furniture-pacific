import Link from "next/link";
import { formatKES, type Product } from "@/lib/data";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-peach"
    >
      <div className="relative aspect-square overflow-hidden bg-peach">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {product.isNew && <span className="bg-brand text-white text-xs font-bold px-2.5 py-1 rounded-full">New</span>}
          {product.isBestSeller && <span className="bg-ink text-white text-xs font-bold px-2.5 py-1 rounded-full">Best seller</span>}
        </div>
        {!product.inStock && (
          <span className="absolute top-3 right-3 bg-black/80 text-white text-xs font-bold px-2.5 py-1 rounded-full">Sold out</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-[11px] tracking-widest uppercase text-muted">{product.category}</p>
        <h3 className="font-bold leading-snug mt-1 group-hover:text-brand transition-colors">{product.title}</h3>
        <p className="mt-2 text-brand font-extrabold">
          {product.priceMin === product.priceMax ? formatKES(product.priceMin) : `From ${formatKES(product.priceMin)}`}
        </p>
        <p className="text-xs text-muted mt-1">
          {product.inStock ? "In stock" : "Currently out of stock"} · {product.variants.length} {product.variants.length === 1 ? "option" : "options"}
        </p>
      </div>
    </Link>
  );
}
