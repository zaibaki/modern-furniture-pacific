import Link from "next/link";
import { formatKES, displayImage, type Product } from "@/lib/data";

// Homepage / shop card: visual first, nothing else. Name, price, one action.
// All details (variants, stock per option, description) live on the detail page.
export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-peach"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-peach">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImage(product)}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms] ease-in-out"
        />
        {!product.inStock && (
          <span className="absolute top-3 right-3 bg-black/80 text-white text-xs font-bold px-2.5 py-1 rounded-full">Sold out</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold leading-snug group-hover:text-brand transition-colors">{product.title}</h3>
        <p className="mt-1 text-brand font-extrabold">
          {product.priceMin === product.priceMax ? formatKES(product.priceMin) : `From ${formatKES(product.priceMin)}`}
        </p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand">
          View piece <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
